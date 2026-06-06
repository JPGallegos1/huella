import { tool } from "ai";
import { z } from "zod";
import type { HuellaClient, Json } from "@huella/supabase";

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

  async function ensureDonorId(): Promise<string | null> {
    if (!senderContactId) return null;
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

  return {
    list_active_campaigns: tool({
      description:
        "Lista las campañas activas para personas que quieren ayudar. Usar al inicio del flujo externo.",
      inputSchema: z.object({
        campaign_type: z
          .enum(["money", "goods", "accompaniment"])
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

    reserve_accompaniment: tool({
      description:
        "Reserva por 15 minutos el proximo perfil seguro libre de una campaña elegida. Usar despues de que la persona elige campaña.",
      inputSchema: z.object({
        campaign_id: z
          .string()
          .describe("UUID de la campaña elegida, obtenido de list_active_campaigns"),
      }),
      execute: async (input) => {
        const donorId = await ensureDonorId();
        if (!donorId) return { ok: false as const, error: "No se pudo identificar a la persona" };

        const { data, error } = await db.rpc("reserve_next_beneficiary", {
          p_organization_id: organizationId,
          p_campaign_id: input.campaign_id,
          p_donor_id: donorId,
          p_ttl_minutes: 15,
        });
        if (error) return { ok: false as const, error: error.message };

        const reservation = data?.[0];
        if (!reservation) {
          await markRawEvent(db, rawEventId, { detectedIntent: "no_available_profiles" });
          return {
            ok: false as const,
            reason: "no_profiles_available",
            message: "No hay perfiles disponibles en esta campaña. Ofrece lista de espera u otra campaña.",
          };
        }

        await markRawEvent(db, rawEventId, { detectedIntent: "accompaniment_reserved" });
        return {
          ok: true as const,
          match_id: reservation.match_id,
          beneficiary_id: reservation.beneficiary_id,
          reserved_until: reservation.reserved_until,
          safe_profile: reservation.safe_profile,
        };
      },
    }),

    confirm_accompaniment: tool({
      description:
        "Confirma la reserva activa cuando la persona explicita compromiso con dinero o especie. No espera pago real ni entrega validada.",
      inputSchema: z.object({
        modality: z.enum(["money", "goods"]),
        amount: z.number().nullish().describe("Monto comprometido si colabora con dinero"),
        items: z
          .array(z.object({ item: z.string(), qty: z.number().int().nullish() }))
          .nullish()
          .describe("Bienes prometidos si colabora en especie"),
      }),
      execute: async (input) => {
        const donorId = await ensureDonorId();
        if (!donorId) return { ok: false as const, error: "No se pudo identificar a la persona" };

        const { data: activeMatch, error: matchError } = await db
          .from("matches")
          .select("id, campaign_id, beneficiary_id, reserved_until")
          .eq("organization_id", organizationId)
          .eq("donor_id", donorId)
          .eq("status", "reserved")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (matchError) return { ok: false as const, error: matchError.message };
        if (!activeMatch?.campaign_id || !activeMatch.beneficiary_id) {
          return { ok: false as const, reason: "no_active_reservation" };
        }

        if (activeMatch.reserved_until && new Date(activeMatch.reserved_until).getTime() < Date.now()) {
          await db.from("matches").update({ status: "expired" }).eq("id", activeMatch.id);
          await db.from("beneficiaries").update({ status: "available" }).eq("id", activeMatch.beneficiary_id);
          return { ok: false as const, reason: "reservation_expired" };
        }

        const isMoney = input.modality === "money";
        const items = (input.items ?? []) satisfies Json;
        const { data: donation, error } = await db
          .from("donations")
          .insert({
            organization_id: organizationId,
            raw_event_id: rawEventId,
            contact_id: senderContactId ?? null,
            donor_id: donorId,
            campaign_id: activeMatch.campaign_id,
            donation_type: input.modality,
            amount: input.amount ?? null,
            items,
            status: "committed",
          })
          .select("id")
          .single();
        if (error) return { ok: false as const, error: error.message };

        await db
          .from("matches")
          .update({
            donation_id: donation.id,
            status: "confirmed",
            modality: input.modality,
            confirmed_at: new Date().toISOString(),
          })
          .eq("id", activeMatch.id);

        await db
          .from("beneficiaries")
          .update({ status: "confirmed" })
          .eq("id", activeMatch.beneficiary_id);

        if (isMoney && input.amount) {
          const { data: campaign } = await db
            .from("campaigns")
            .select("current_amount")
            .eq("id", activeMatch.campaign_id)
            .maybeSingle();
          await db
            .from("campaigns")
            .update({ current_amount: (campaign?.current_amount ?? 0) + input.amount })
            .eq("id", activeMatch.campaign_id);
        }

        await markRawEvent(db, rawEventId, { detectedIntent: "accompaniment_confirmed" });

        if (isMoney) {
          const paymentLink = `https://mpago.example/huella-demo?donation=${donation.id}${
            input.amount ? `&amount=${input.amount}` : ""
          }`;
          await db
            .from("donations")
            .update({ payment_link: paymentLink })
            .eq("id", donation.id);
          return { ok: true as const, donation_id: donation.id, payment_link: paymentLink };
        }
        return {
          ok: true as const,
          donation_id: donation.id,
          message: "Aporte en especie registrado; el equipo coordinara la entrega.",
        };
      },
    }),
  };
}
