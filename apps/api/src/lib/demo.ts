import type { HuellaClient, Json } from "@huella/supabase";

export const DEMO_CAMPAIGN_ID = "22222222-2222-4222-8222-222222222222";

const DEMO_CAMPAIGN_KEY = "las_flores_escolar";

const PROFILES = [
  {
    id: "33333333-3333-4333-8333-333333333331",
    label: "Familia A",
    neighborhood: "Las Flores",
    composition: "2 chicos en edad escolar",
    primary_need: "mochila y utiles",
    suggested_amount: 10000,
    goods_suggestion: "mochila y kit de utiles",
    sort_order: 1,
  },
  {
    id: "33333333-3333-4333-8333-333333333332",
    label: "Familia B",
    neighborhood: "Las Flores",
    composition: "1 nina en edad escolar",
    primary_need: "utiles escolares",
    suggested_amount: 10000,
    goods_suggestion: "kit de utiles",
    sort_order: 2,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    label: "Familia C",
    neighborhood: "Las Flores",
    composition: "3 chicos en edad escolar",
    primary_need: "zapatillas y cuadernos",
    suggested_amount: 15000,
    goods_suggestion: "zapatillas y cuadernos",
    sort_order: 3,
  },
  {
    id: "33333333-3333-4333-8333-333333333334",
    label: "Familia D",
    neighborhood: "Las Flores",
    composition: "1 chico en edad escolar",
    primary_need: "guardapolvo y mochila",
    suggested_amount: 12000,
    goods_suggestion: "guardapolvo y mochila",
    sort_order: 4,
  },
] as const;

export async function resetDemoData(db: HuellaClient, organizationId: string) {
  await db.from("matches").delete().eq("organization_id", organizationId).eq("campaign_id", DEMO_CAMPAIGN_ID);
  await db.from("donations").delete().eq("organization_id", organizationId).eq("campaign_id", DEMO_CAMPAIGN_ID);
  await db.from("campaign_needs").delete().eq("organization_id", organizationId).eq("campaign_id", DEMO_CAMPAIGN_ID);
  await db.from("beneficiaries").delete().in("id", PROFILES.map((profile) => profile.id));
  await db.from("campaigns").delete().eq("organization_id", organizationId).eq("id", DEMO_CAMPAIGN_ID);

  const { error: campaignError } = await db.from("campaigns").insert({
    id: DEMO_CAMPAIGN_ID,
    organization_id: organizationId,
    name: "Acompanamiento escolar Las Flores",
    description: "4 familias con perfiles seguros para acompanar el inicio de clases.",
    campaign_type: "accompaniment",
    current_amount: 0,
    goal_amount: 47000,
    currency: "ARS",
    status: "active",
    metadata: { demo_key: DEMO_CAMPAIGN_KEY },
  });
  if (campaignError) throw new Error(campaignError.message);

  const { error: needsError } = await db.from("campaign_needs").insert([
    {
      organization_id: organizationId,
      campaign_id: DEMO_CAMPAIGN_ID,
      item_name: "mochilas",
      quantity_needed: 2,
      priority: "high",
    },
    {
      organization_id: organizationId,
      campaign_id: DEMO_CAMPAIGN_ID,
      item_name: "kits de utiles",
      quantity_needed: 4,
      priority: "high",
    },
    {
      organization_id: organizationId,
      campaign_id: DEMO_CAMPAIGN_ID,
      item_name: "zapatillas",
      quantity_needed: 1,
      priority: "medium",
    },
    {
      organization_id: organizationId,
      campaign_id: DEMO_CAMPAIGN_ID,
      item_name: "guardapolvo",
      quantity_needed: 1,
      priority: "medium",
    },
  ]);
  if (needsError) throw new Error(needsError.message);

  const { error: beneficiariesError } = await db.from("beneficiaries").insert(
    PROFILES.map((profile) => ({
      id: profile.id,
      organization_id: organizationId,
      full_name: null,
      location: profile.neighborhood,
      status: "available",
      needs: {
        demo_key: DEMO_CAMPAIGN_KEY,
        campaign_id: DEMO_CAMPAIGN_ID,
        profile_label: profile.label,
        neighborhood: profile.neighborhood,
        composition: profile.composition,
        primary_need: profile.primary_need,
        suggested_amount: profile.suggested_amount,
        goods_suggestion: profile.goods_suggestion,
        sort_order: profile.sort_order,
      } satisfies Json,
    })),
  );
  if (beneficiariesError) throw new Error(beneficiariesError.message);

  return { campaignId: DEMO_CAMPAIGN_ID, profiles: PROFILES.length };
}
