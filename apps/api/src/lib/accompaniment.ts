import type { HuellaClient, Json } from "@huella/supabase";

interface DirectFlowInput {
  db: HuellaClient;
  organizationId: string;
  rawEventId: string;
  senderContactId: string;
  text: string;
}

interface SafeProfile {
  profile_label?: string;
  neighborhood?: string;
  composition?: string;
  primary_need?: string;
  suggested_amount?: number;
  goods_suggestion?: string;
}

export async function tryHandleExternalAccompaniment({
  db,
  organizationId,
  rawEventId,
  senderContactId,
  text,
}: DirectFlowInput): Promise<string | null> {
  const normalized = normalize(text);
  const donorId = await getOrCreateDonorId(db, organizationId, senderContactId);
  if (!donorId) return null;

  const activeReservation = await getActiveReservation(db, organizationId, donorId);
  if (activeReservation && isConfirmation(normalized)) {
    return confirmReservation(db, organizationId, rawEventId, senderContactId, donorId, activeReservation, normalized);
  }

  if (isCampaignSelection(normalized)) {
    return reserveProfile(db, organizationId, rawEventId, senderContactId, donorId, normalized);
  }

  if (isHelpIntent(normalized)) {
    return listCampaigns(db, organizationId, rawEventId);
  }

  return null;
}

async function getOrCreateDonorId(
  db: HuellaClient,
  organizationId: string,
  senderContactId: string,
) {
  const { data: existing } = await db
    .from("donors")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("contact_id", senderContactId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await db
    .from("donors")
    .insert({
      organization_id: organizationId,
      contact_id: senderContactId,
      donor_type: "individual",
      status: "active",
    })
    .select("id")
    .single();
  if (error) return null;
  return created.id;
}

async function getActiveReservation(db: HuellaClient, organizationId: string, donorId: string) {
  const { data } = await db
    .from("matches")
    .select("id, campaign_id, beneficiary_id, donation_id, reserved_until")
    .eq("organization_id", organizationId)
    .eq("donor_id", donorId)
    .eq("status", "reserved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

async function reserveProfile(
  db: HuellaClient,
  organizationId: string,
  rawEventId: string,
  senderContactId: string,
  donorId: string,
  normalized: string,
) {
  const campaign = await findCampaign(db, organizationId, normalized);
  if (!campaign) return null;

  const { data, error } = await db.rpc("reserve_next_beneficiary", {
    p_organization_id: organizationId,
    p_campaign_id: campaign.id,
    p_donor_id: donorId,
    p_ttl_minutes: 15,
  });
  if (error) return null;

  const reservation = data?.[0];
  if (!reservation) {
    await markRawEvent(db, rawEventId, "no_available_profiles");
    return "En esta campaña ya están todas las familias en proceso o acompañadas. Podés sumarte a lista de espera o elegir otra campaña activa.";
  }

  await markRawEvent(db, rawEventId, "accompaniment_reserved");
  const safeProfile = readSafeProfile(reservation.safe_profile);
  const amount = safeProfile.suggested_amount ?? null;
  const { data: donation } = await db
    .from("donations")
    .insert({
      organization_id: organizationId,
      raw_event_id: rawEventId,
      contact_id: senderContactId,
      donor_id: donorId,
      campaign_id: campaign.id,
      donation_type: "money",
      amount,
      items: [],
      status: "pending",
    })
    .select("id")
    .single();

  const paymentLink = donation
    ? `https://mpago.example/huella-demo?donation=${donation.id}${amount ? `&amount=${amount}` : ""}`
    : null;

  if (donation) {
    await db
      .from("donations")
      .update({ payment_link: paymentLink })
      .eq("id", donation.id);
    await db
      .from("matches")
      .update({ donation_id: donation.id, modality: "money" })
      .eq("id", reservation.match_id);
  }

  return buildReservationReply(safeProfile, paymentLink);
}

async function confirmReservation(
  db: HuellaClient,
  organizationId: string,
  rawEventId: string,
  senderContactId: string,
  donorId: string,
  reservation: {
    id: string;
    campaign_id: string | null;
    beneficiary_id: string | null;
    donation_id: string | null;
    reserved_until: string | null;
  },
  normalized: string,
) {
  if (!reservation.campaign_id || !reservation.beneficiary_id) return null;
  if (reservation.reserved_until && new Date(reservation.reserved_until).getTime() < Date.now()) {
    await db.from("matches").update({ status: "expired" }).eq("id", reservation.id);
    await db.from("beneficiaries").update({ status: "available" }).eq("id", reservation.beneficiary_id);
    return "La reserva venció. Te puedo ofrecer otro perfil disponible de la campaña.";
  }

  const modality = detectModality(normalized);
  const amount = modality === "money" ? detectAmount(normalized) : null;
  const items = modality === "goods" ? detectGoods(normalized) : [];

  const donationInput = {
      organization_id: organizationId,
      raw_event_id: rawEventId,
      contact_id: senderContactId,
      donor_id: donorId,
      campaign_id: reservation.campaign_id,
      donation_type: modality,
      amount,
      items: items satisfies Json,
      status: "committed",
  };

  const { data: donation, error } = reservation.donation_id
    ? await db
      .from("donations")
      .update(donationInput)
      .eq("id", reservation.donation_id)
      .select("id")
      .single()
    : await db
      .from("donations")
      .insert(donationInput)
      .select("id")
      .single();
  if (error) return null;

  await db
    .from("matches")
    .update({
      donation_id: donation.id,
      status: "confirmed",
      modality,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", reservation.id);
  await db.from("beneficiaries").update({ status: "confirmed" }).eq("id", reservation.beneficiary_id);

  if (modality === "money" && amount) {
    const { data: campaign } = await db
      .from("campaigns")
      .select("current_amount")
      .eq("id", reservation.campaign_id)
      .maybeSingle();
    await db
      .from("campaigns")
      .update({ current_amount: (campaign?.current_amount ?? 0) + amount })
      .eq("id", reservation.campaign_id);
  }

  await markRawEvent(db, rawEventId, "accompaniment_confirmed");

  if (modality === "money") {
    const paymentLink = `https://mpago.example/huella-demo?donation=${donation.id}${
      amount ? `&amount=${amount}` : ""
    }`;
    await db.from("donations").update({ payment_link: paymentLink }).eq("id", donation.id);
    return `Listo, este acompañamiento queda confirmado. Podés completar el aporte acá: ${paymentLink}`;
  }

  return `Listo, este acompañamiento queda confirmado con ${formatGoods(items)}. El equipo coordinará la entrega.`;
}

async function findCampaign(db: HuellaClient, organizationId: string, normalized: string) {
  const selectedOption = detectSelectedOption(normalized);
  if (selectedOption) {
    const campaigns = await getCampaignOptions(db, organizationId);
    return campaigns[selectedOption - 1] ?? null;
  }

  let query = db
    .from("campaigns")
    .select("id, name")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (normalized.includes("flores") || normalized.includes("escolar")) {
    query = query.ilike("name", "%Flores%");
  } else {
    query = query.eq("campaign_type", "accompaniment");
  }

  const { data } = await query.maybeSingle();
  return data ?? null;
}

async function listCampaigns(db: HuellaClient, organizationId: string, rawEventId: string) {
  const campaigns = await getCampaignOptions(db, organizationId);
  await markRawEvent(db, rawEventId, "campaign_options");

  if (campaigns.length === 0) {
    return "Todavía no hay campañas activas para acompañar.";
  }

  const options = campaigns
    .map((campaign, index) => `${index + 1}. ${campaign.name}`)
    .join("\n");

  return `Estas son las campañas activas:\n\n${options}\n\nRespondé con el número de la campaña que querés acompañar.`;
}

async function getCampaignOptions(db: HuellaClient, organizationId: string) {
  const { data } = await db
    .from("campaigns")
    .select("id, name, campaign_type, updated_at")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .order("updated_at", { ascending: true });

  return (data ?? []).sort((a, b) => {
    const order = { money: 1, goods: 2, accompaniment: 3 } as Record<string, number>;
    return (order[a.campaign_type] ?? 99) - (order[b.campaign_type] ?? 99);
  });
}

async function markRawEvent(db: HuellaClient, rawEventId: string, detectedIntent: string) {
  await db
    .from("raw_events")
    .update({ detected_intent: detectedIntent, status: "processed" })
    .eq("id", rawEventId);
}

function buildReservationReply(profile: SafeProfile, paymentLink: string | null) {
  const amount = profile.suggested_amount
    ? `$${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(profile.suggested_amount)}`
    : "un aporte a coordinar";
  const paymentLine = paymentLink
    ? `\nLink para completar el aporte sugerido: ${paymentLink}\n`
    : "";
  return `Te reservamos ${profile.profile_label ?? "un perfil seguro"} por 15 minutos.

- Barrio: ${profile.neighborhood ?? "Sin barrio"}
- Composición: ${profile.composition ?? "Sin composición"}
- Necesidad principal: ${profile.primary_need ?? "A coordinar"}
- Aporte sugerido: ${amount} o ${profile.goods_suggestion ?? "bienes a coordinar"}
${paymentLine}
Si preferís colaborar en especie, respondé con qué podés aportar.`;
}

function readSafeProfile(value: Json): SafeProfile {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  return value as SafeProfile;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isCampaignSelection(normalized: string) {
  return detectSelectedOption(normalized) != null || /(elijo|elegir|campana|campaña|flores|escolar|acompanamiento)/.test(normalized);
}

function isHelpIntent(normalized: string) {
  return /(quiero ayudar|quiero colaborar|ayudar|colaborar|acompanar|acompañar)/.test(normalized);
}

function detectSelectedOption(normalized: string) {
  const match = normalized.trim().match(/^(?:opcion\s*)?(\d+)$/);
  if (!match) return null;
  const option = Number(match[1]);
  return Number.isInteger(option) && option > 0 ? option : null;
}

function isConfirmation(normalized: string) {
  return /(confirmo|si|sí|aporto|colaboro|dinero|pesos|\$|especie|utiles|mochila|kit)/.test(normalized);
}

function detectModality(normalized: string): "money" | "goods" {
  if (/(especie|utiles|mochila|kit|zapatilla|guardapolvo|cuaderno)/.test(normalized)) return "goods";
  return "money";
}

function detectAmount(normalized: string) {
  const match = normalized.match(/(\d{4,})/);
  return match ? Number(match[1]) : null;
}

function detectGoods(normalized: string) {
  const goods = ["mochila", "utiles", "kit", "zapatillas", "guardapolvo", "cuadernos"]
    .filter((item) => normalized.includes(item))
    .map((item) => ({ item, qty: 1 }));
  return goods.length > 0 ? goods : [{ item: "aporte en especie", qty: 1 }];
}

function formatGoods(items: { item: string; qty: number }[]) {
  return items.map((item) => `${item.item} x${item.qty}`).join(", ");
}
