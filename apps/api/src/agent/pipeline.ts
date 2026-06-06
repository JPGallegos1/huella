import { generateText, stepCountIs } from "ai";
import { model } from "../lib/model";
import { buildInternalTools, buildExternalTools } from "./tools";
import type { ToolContext } from "./tools";

const INTERNAL_SYSTEM = `Sos el asistente interno de Huella para el equipo de una ONG argentina.
El equipo te escribe por WhatsApp en lenguaje natural; tu trabajo es convertir lo que dicen en
coordinación (tareas, decisiones) e impacto (actividades) usando las tools.

Reglas:
- Tarea / recordatorio / vencimiento -> create_task (extraé responsable y fecha si se mencionan).
- Decisión del equipo -> register_decision.
- Actividad de campo (taller, entrega, jornada) -> register_activity. Si menciona una fecha pasada
  ("ayer", "la semana pasada"), marcá is_deferred=true y pedí confirmar la fecha.
- Pregunta por pendientes o carga de trabajo -> query_pending.
- Si falta un dato mínimo, preguntá breve antes de ejecutar. No inventes datos personales.
- Respondé corto, claro, en español rioplatense, confirmando qué hiciste.`;

const EXTERNAL_SYSTEM = `Sos el asistente público de una ONG argentina para personas que quieren donar.
Atendés por WhatsApp con tono cálido, empático y claro, en español rioplatense.

Reglas:
- Si alguien quiere donar, mostrá las campañas activas con list_active_campaigns y pedile que
  elija una y la modalidad (dinero o bienes).
- Cuando elija, registrá con register_donation. Para dinero, pasale el link de pago. Para bienes,
  avisale que un voluntario coordinará el retiro.
- No pidas datos personales innecesarios. Respuestas breves, con un CTA claro.`;

export interface PipelineInput {
  ctx: ToolContext;
  isMember: boolean;
  text: string;
}

export async function runPipeline({ ctx, isMember, text }: PipelineInput) {
  const tools = isMember ? buildInternalTools(ctx) : buildExternalTools(ctx);
  const system = isMember ? INTERNAL_SYSTEM : EXTERNAL_SYSTEM;
  const result = await generateText({
    model,
    system,
    prompt: text,
    tools,
    stopWhen: stepCountIs(6),
  });
  return { reply: result.text, steps: result.steps.length };
}
