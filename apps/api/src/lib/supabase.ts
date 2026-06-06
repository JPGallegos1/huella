import { createHuellaClient } from "@huella/supabase";
import type { HuellaClient } from "@huella/supabase";

let cached: HuellaClient | null = null;

/** Cliente backend de Supabase (secret key → bypassa RLS). */
export function getDb(): HuellaClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en apps/api/.env " +
        "(la secret key se obtiene en Dashboard → Project Settings → API Keys → Secret keys).",
    );
  }
  cached = createHuellaClient(url, key);
  return cached;
}
