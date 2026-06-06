import { tool } from "ai";
import { z } from "zod";
import type { HuellaClient } from "@huella/supabase";

export interface ToolContext {
  db: HuellaClient;
  organizationId: string;
  rawEventId: string;
  senderMemberId?: string | null;
  senderContactId?: string | null;
}

async function markRawEvent(
  db: HuellaClient,
  rawEventId: string,
  input: {
    detectedIntent: string;
    isDeferred?: boolean;
    occurredAt?: string | null;
  },
) {
  await db
    .from("raw_events")
    .update({
      detected_intent: input.detectedIntent,
      is_deferred: input.isDeferred ?? false,
      occurred_at: input.occurredAt ?? null,
      status: "processed",
    })
    .eq("id", rawEventId);
}

/** Tools de la rama interna (miembros): coordinación T1 + impacto T3. */
export function buildInternalTools(ctx: ToolContext) {
  const { db, organizationId, rawEventId, senderMemberId } = ctx;

  async function resolveMemberId(name?: string | null): Promise<string | null> {
    if (!name) return null;
    const { data } = await db
      .from("members")
      .select("id")
      .eq("organization_id", organizationId)
      .ilike("full_name", `%${name}%`)
      .limit(1)
      .maybeSingle();
    return data?.id ?? null;
  }

  return {
    create_task: tool({
      description:
        "Crea una tarea, recordatorio o vencimiento para el equipo (Track 1). Usar cuando el mensaje pide recordar algo, asignar trabajo o fija un plazo.",
      inputSchema: z.object({
        title: z.string().describe("Título corto y accionable de la tarea"),
        description: z.string().nullish(),
        assignee_name: z
          .string()
          .nullish()
          .describe("Nombre del responsable, si se menciona"),
        due_date: z
          .string()
          .nullish()
          .describe("Fecha de vencimiento YYYY-MM-DD, si se menciona"),
        task_type: z.enum(["task", "reminder", "maintenance"]).default("task"),
      }),
      execute: async (input) => {
        const assigneeId = await resolveMemberId(input.assignee_name);
        const { data, error } = await db
          .from("tasks")
          .insert({
            organization_id: organizationId,
            raw_event_id: rawEventId,
            title: input.title,
            description: input.description ?? null,
            assignee_member_id: assigneeId,
            created_by_member_id: senderMemberId ?? null,
            due_date: input.due_date ?? null,
            task_type: input.task_type,
            status: "open",
          })
          .select("id")
          .single();
        if (error) return { ok: false as const, error: error.message };
        await markRawEvent(db, rawEventId, { detectedIntent: "task" });
        return {
          ok: true as const,
          task_id: data.id,
          assignee_resolved: assigneeId != null,
        };
      },
    }),

    register_decision: tool({
      description:
        "Registra una decisión tomada por el equipo (Track 1, memoria institucional).",
      inputSchema: z.object({
        description: z.string().describe("La decisión, en una frase clara"),
        decided_at: z
          .string()
          .nullish()
          .describe("Fecha/hora de la decisión en ISO 8601, si se menciona"),
      }),
      execute: async (input) => {
        const { data, error } = await db
          .from("decisions")
          .insert({
            organization_id: organizationId,
            raw_event_id: rawEventId,
            description: input.description,
            decided_at: input.decided_at ?? new Date().toISOString(),
            created_by_member_id: senderMemberId ?? null,
          })
          .select("id")
          .single();
        if (error) return { ok: false as const, error: error.message };
        await markRawEvent(db, rawEventId, { detectedIntent: "decision" });
        return { ok: true as const, decision_id: data.id };
      },
    }),

    register_activity: tool({
      description:
        "Registra una actividad de campo / impacto (Track 3): taller, entrega, jornada. Guarda métricas agregadas, sin datos personales.",
      inputSchema: z.object({
        title: z.string().describe("Qué actividad fue (ej. 'Taller en Ludueña')"),
        location: z.string().nullish(),
        attendees_count: z.number().int().nullish(),
        volunteers_count: z.number().int().nullish(),
        qualitative_notes: z
          .string()
          .nullish()
          .describe("Observaciones cualitativas (ej. 'faltaron materiales')"),
        program_name: z
          .string()
          .nullish()
          .describe("Programa al que pertenece, si se menciona"),
        occurred_at: z
          .string()
          .nullish()
          .describe("Fecha del hecho en ISO 8601. Si es pasada, marcar is_deferred."),
        is_deferred: z
          .boolean()
          .default(false)
          .describe("true si el hecho ocurrió antes (registro diferido/offline)"),
      }),
      execute: async (input) => {
        let programId: string | null = null;
        if (input.program_name) {
          const { data } = await db
            .from("programs")
            .select("id")
            .eq("organization_id", organizationId)
            .ilike("name", `%${input.program_name}%`)
            .limit(1)
            .maybeSingle();
          programId = data?.id ?? null;
        }
        const { data, error } = await db
          .from("activities")
          .insert({
            organization_id: organizationId,
            raw_event_id: rawEventId,
            program_id: programId,
            title: input.title,
            location: input.location ?? null,
            attendees_count: input.attendees_count ?? null,
            volunteers_count: input.volunteers_count ?? null,
            qualitative_notes: input.qualitative_notes ?? null,
            occurred_at: input.occurred_at ?? new Date().toISOString(),
            is_deferred: input.is_deferred,
            status: input.is_deferred ? "draft" : "confirmed",
          })
          .select("id")
          .single();
        if (error) return { ok: false as const, error: error.message };
        await markRawEvent(db, rawEventId, {
          detectedIntent: "activity",
          isDeferred: input.is_deferred,
          occurredAt: input.occurred_at ?? null,
        });
        return {
          ok: true as const,
          activity_id: data.id,
          program_resolved: programId != null,
          needs_date_confirmation: input.is_deferred,
        };
      },
    }),

    query_pending: tool({
      description:
        "Consulta tareas pendientes / carga de trabajo del equipo (Track 1). Sólo lectura.",
      inputSchema: z.object({
        assignee_name: z
          .string()
          .nullish()
          .describe("Filtrar por responsable, si se pide"),
      }),
      execute: async (input) => {
        const assigneeId = await resolveMemberId(input.assignee_name);
        let q = db
          .from("tasks")
          .select("id, title, due_date, status, assignee_member_id")
          .eq("organization_id", organizationId)
          .eq("status", "open")
          .order("due_date", { ascending: true })
          .limit(20);
        if (assigneeId) q = q.eq("assignee_member_id", assigneeId);
        const { data, error } = await q;
        if (error) return { ok: false as const, error: error.message };
        await markRawEvent(db, rawEventId, { detectedIntent: "query" });
        return { ok: true as const, count: data.length, tasks: data };
      },
    }),
  };
}

/** Tools de la rama externa (no-miembros): donaciones (Track 2, UC-01). */
export function buildExternalTools(ctx: ToolContext) {
  const { db, organizationId, rawEventId, senderContactId } = ctx;

  return {
    list_active_campaigns: tool({
      description:
        "Lista las campañas de donación activas. Usar cuando alguien quiere donar y hay que mostrarle opciones.",
      inputSchema: z.object({
        campaign_type: z
          .enum(["money", "goods"])
          .nullish()
          .describe("Filtrar por tipo, opcional"),
      }),
      execute: async (input) => {
        let q = db
          .from("campaigns")
          .select("id, name, description, campaign_type, goal_amount, currency")
          .eq("organization_id", organizationId)
          .eq("status", "active")
          .limit(20);
        if (input.campaign_type) q = q.eq("campaign_type", input.campaign_type);
        const { data, error } = await q;
        if (error) return { ok: false as const, error: error.message };
        await markRawEvent(db, rawEventId, { detectedIntent: "donation_interest" });
        return { ok: true as const, campaigns: data };
      },
    }),

    register_donation: tool({
      description:
        "Registra la intención de donación a una campaña. Dinero → genera link de pago (simulado). Bienes → la marca para retiro por un voluntario.",
      inputSchema: z.object({
        campaign_id: z
          .string()
          .describe("UUID de la campaña elegida (de list_active_campaigns)"),
        donation_type: z.enum(["money", "goods"]),
        amount: z.number().nullish().describe("Monto, para donaciones de dinero"),
        items: z
          .array(z.object({ item: z.string(), qty: z.number().int().nullish() }))
          .nullish()
          .describe("Bienes ofrecidos, para donaciones de especie"),
      }),
      execute: async (input) => {
        const isMoney = input.donation_type === "money";
        const { data, error } = await db
          .from("donations")
          .insert({
            organization_id: organizationId,
            raw_event_id: rawEventId,
            contact_id: senderContactId ?? null,
            campaign_id: input.campaign_id,
            donation_type: input.donation_type,
            amount: input.amount ?? null,
            items: input.items ?? [],
            status: isMoney ? "pending" : "pending_pickup",
          })
          .select("id")
          .single();
        if (error) return { ok: false as const, error: error.message };
        await markRawEvent(db, rawEventId, { detectedIntent: "donation" });

        if (isMoney) {
          // Link de Mercado Pago SIMULADO (sin integración real con la API).
          const paymentLink = `https://mpago.example/huella-demo?donation=${data.id}${
            input.amount ? `&amount=${input.amount}` : ""
          }`;
          await db
            .from("donations")
            .update({ payment_link: paymentLink })
            .eq("id", data.id);
          return { ok: true as const, donation_id: data.id, payment_link: paymentLink };
        }
        return {
          ok: true as const,
          donation_id: data.id,
          message: "Donación de bienes registrada; un voluntario coordinará el retiro.",
        };
      },
    }),
  };
}
