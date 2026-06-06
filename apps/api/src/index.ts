import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { getDb } from "./lib/supabase";
import { captureRawEvent } from "./lib/capture";
import { runPipeline } from "./agent/pipeline";

// apps/api — captura-primero (raw_events) + pipeline conversacional (Vercel AI SDK)
const app = new Hono();
app.use("/*", cors());

const DEMO_ORG_ID =
  process.env.DEMO_ORG_ID ?? "11111111-1111-1111-1111-111111111111";

app.get("/", (c) => c.json({ service: "huella-api", status: "ok" }));
app.get("/health", (c) => c.json({ status: "ok", ts: new Date().toISOString() }));

app.get("/dashboard", async (c) => {
  const organizationId = c.req.query("organizationId") ?? DEMO_ORG_ID;
  let db: ReturnType<typeof getDb>;
  try {
    db = getDb();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error configurando Supabase";
    return c.json({ error: message }, 500);
  }

  const [
    rawEventsResult,
    tasksResult,
    activitiesResult,
    campaignsResult,
    donationsResult,
    membersResult,
    programsResult,
  ] = await Promise.all([
    db
      .from("raw_events")
      .select(
        "id, content_text, detected_intent, status, is_deferred, received_at, created_at, sender_member_id, sender_contact_id",
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("tasks")
      .select("id, title, description, assignee_member_id, due_date, status, task_type, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("activities")
      .select(
        "id, title, location, attendees_count, volunteers_count, program_id, occurred_at, status, is_deferred, qualitative_notes, created_at",
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("campaigns")
      .select("id, name, description, campaign_type, current_amount, goal_amount, currency, status, updated_at")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(50),
    db
      .from("donations")
      .select("id, campaign_id, donation_type, amount, currency, items, status, payment_link, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(50),
    db.from("members").select("id, full_name").eq("organization_id", organizationId),
    db.from("programs").select("id, name").eq("organization_id", organizationId),
  ]);

  const failed = [
    rawEventsResult,
    tasksResult,
    activitiesResult,
    campaignsResult,
    donationsResult,
    membersResult,
    programsResult,
  ].find((result) => result.error);
  if (failed?.error) return c.json({ error: failed.error.message }, 500);

  const membersById = new Map(
    (membersResult.data ?? []).map((member) => [
      member.id,
      member.full_name ?? "Sin nombre",
    ]),
  );
  const programsById = new Map(
    (programsResult.data ?? []).map((program) => [
      program.id,
      program.name ?? "Sin programa",
    ]),
  );
  const campaignsById = new Map(
    (campaignsResult.data ?? []).map((campaign) => [campaign.id, campaign.name]),
  );

  const rawEvents = rawEventsResult.data ?? [];
  const tasks = (tasksResult.data ?? []).map((task) => ({
    ...task,
    assignee_name: task.assignee_member_id
      ? membersById.get(task.assignee_member_id) ?? "No encontrado"
      : "Sin responsable",
  }));
  const activities = (activitiesResult.data ?? []).map((activity) => ({
    ...activity,
    program_name: activity.program_id
      ? programsById.get(activity.program_id) ?? "No encontrado"
      : "Sin programa",
  }));
  const campaigns = campaignsResult.data ?? [];
  const donations = (donationsResult.data ?? []).map((donation) => ({
    ...donation,
    campaign_name: donation.campaign_id
      ? campaignsById.get(donation.campaign_id) ?? "No encontrada"
      : "Sin campaña",
  }));

  const donationAmount = donations.reduce(
    (total, donation) => total + (donation.amount ?? 0),
    0,
  );

  return c.json({
    organizationId,
    generatedAt: new Date().toISOString(),
    summary: {
      eventsCaptured: rawEvents.length,
      openTasks: tasks.filter((task) => task.status === "open").length,
      activities: activities.length,
      totalAttendees: activities.reduce(
        (total, activity) => total + (activity.attendees_count ?? 0),
        0,
      ),
      donations: donations.length,
      donationAmount,
    },
    rawEvents,
    tasks,
    activities,
    campaigns,
    donations,
  });
});

interface ChatBody {
  text?: string;
  phone?: string;
  organizationId?: string;
}

app.post("/chat", async (c) => {
  let body: ChatBody;
  try {
    body = await c.req.json<ChatBody>();
  } catch {
    return c.json({ error: "JSON inválido" }, 400);
  }
  const text = body.text?.trim();
  if (!text) return c.json({ error: "Falta 'text'" }, 400);

  const organizationId = body.organizationId ?? DEMO_ORG_ID;
  const db = getDb();

  // Routing por whitelist: ¿el emisor es miembro de la org (por teléfono)?
  let senderMemberId: string | null = null;
  if (body.phone) {
    const { data } = await db
      .from("members")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("phone", body.phone)
      .maybeSingle();
    senderMemberId = data?.id ?? null;
  }
  const isMember = senderMemberId != null;

  // Externo → resolver/crear contacto base.
  let senderContactId: string | null = null;
  if (!isMember && body.phone) {
    const { data: existing } = await db
      .from("contacts")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("phone", body.phone)
      .maybeSingle();
    if (existing) {
      senderContactId = existing.id;
    } else {
      const { data: created, error } = await db
        .from("contacts")
        .insert({ organization_id: organizationId, phone: body.phone })
        .select("id")
        .single();
      if (!error) senderContactId = created.id;
    }
  }

  // 1) Captura-primero: el evento crudo se persiste antes de interpretarlo.
  const rawEventId = await captureRawEvent(db, {
    organizationId,
    text,
    senderMemberId,
    senderContactId,
  });

  // 2) Pipeline conversacional (rama según whitelist).
  const { reply, steps } = await runPipeline({
    ctx: { db, organizationId, rawEventId, senderMemberId, senderContactId },
    isMember,
    text,
  });

  return c.json({ reply, rawEventId, isMember, steps });
});

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`huella-api escuchando en http://localhost:${info.port}`);
});

export default app;
