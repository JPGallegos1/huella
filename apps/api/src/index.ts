import { serve } from "@hono/node-server";
import { Hono } from "hono";

// apps/api — API de intención (LangChain) + acceso a Supabase
const app = new Hono();

app.get("/", (c) => c.json({ service: "huella-api", status: "ok" }));

app.get("/health", (c) => c.json({ status: "ok", ts: new Date().toISOString() }));

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`huella-api escuchando en http://localhost:${info.port}`);
});

export default app;
