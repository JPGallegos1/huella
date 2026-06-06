import type { HuellaClient } from "@huella/supabase";

export interface IncomingMessage {
  organizationId: string;
  text: string;
  senderMemberId?: string | null;
  senderContactId?: string | null;
  channel?: string;
  externalId?: string | null;
}

/**
 * Captura-primero: persiste el evento crudo ANTES de interpretarlo.
 * Garantiza no perder intención operativa aunque el LLM falle o el mensaje sea ambiguo.
 */
export async function captureRawEvent(
  db: HuellaClient,
  msg: IncomingMessage,
): Promise<string> {
  const { data, error } = await db
    .from("raw_events")
    .insert({
      organization_id: msg.organizationId,
      sender_member_id: msg.senderMemberId ?? null,
      sender_contact_id: msg.senderContactId ?? null,
      channel: msg.channel ?? "simulator",
      external_id: msg.externalId ?? null,
      content_text: msg.text,
      media_type: "text",
      received_at: new Date().toISOString(),
      status: "received",
    })
    .select("id")
    .single();
  if (error) throw new Error(`captureRawEvent: ${error.message}`);
  return data.id;
}
