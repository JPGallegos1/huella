// Cliente del backend de intención (apps/api). En dev, Vite proxea /api → :3000.
const API_BASE = "/api";

export interface ChatResponse {
  reply: string;
  rawEventId?: string;
  isMember?: boolean;
  steps?: number;
}

export async function sendChat(input: {
  text: string;
  phone: string;
}): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? `Error ${res.status}`);
  }
  return (await res.json()) as ChatResponse;
}
