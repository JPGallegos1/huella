import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/** Cliente de Supabase tipado con el schema de Huella. */
export type HuellaClient = SupabaseClient<Database>;

/**
 * Crea un cliente tipado.
 * - En el frontend usá la `anon`/publishable key (respeta RLS por organización).
 * - En el backend usá la `service_role` key (bypassa RLS).
 */
export function createHuellaClient(
  supabaseUrl: string,
  supabaseKey: string,
): HuellaClient {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "createHuellaClient: faltan supabaseUrl o supabaseKey (revisá tus variables de entorno).",
    );
  }
  return createClient<Database>(supabaseUrl, supabaseKey);
}
