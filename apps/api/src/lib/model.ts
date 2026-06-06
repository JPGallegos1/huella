import { openai } from "@ai-sdk/openai";

/** Punto único de swap de provider/modelo (definición del equipo: OpenAI GPT-4o). */
export const model = openai("gpt-4o");
