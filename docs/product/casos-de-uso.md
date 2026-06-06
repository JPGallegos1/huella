# Casos de uso — Huella

Catálogo de casos de uso concretos. Cada caso define actor, disparador, intención, flujo y qué queda simulado/stub para el MVP del hackathon.

> **Marco (2026-06-06, definición del equipo):** modelo **unificado con `SPEC.md` como base canónica**; T1 y T3 entran como **matices** que se foldean encima. *"Que entre todo"* = unión, no reemplazo. Articulado por el **seam de whitelist**: `org_members` → **rama interna** (equipo: captura/coordinación T1 + impacto/reportes T3); externos → **rama externa** (público: donaciones T2, intake de beneficiarios, matching). Esquema = schema Huella desplegado ∪ tablas de SPEC, todo multi-tenant. Ver [[huella-spec-reconciliation]].

---

## UC-01 — Donación vía campaña (donante externo)

**Rama:** Externa · **Track:** T2 (reabre P5) · **Actor:** Donante (contacto externo, no miembro)

**Origen del activo:** Donation Agent de `SPEC.md` (dinero + bienes).

### Disparador
Mensaje de WhatsApp con intención de donar, originado desde una **campaña de donación con mensajes predefinidos** (plantillas/quick-replies de entrada). Ej.: *"doná una mochila"*.

> «A confirmar» — ¿los "mensajes predefinidos" son plantillas de entrada que toca el donante, o un broadcast saliente de la ONG cuyas respuestas entran al flujo? Asumo entrada por plantilla de campaña.

### Precondiciones
- Existen una o más **campañas activas** (`campaigns`, y `campaign_needs` para bienes).

### Flujo principal
1. El donante envía el mensaje de intención de donar.
2. **Contact Check:** se busca/crea el `contact`; no está en `org_members` → **rama externa** → Classifier → intent `donate`.
3. **Donation Agent** responde con las **campañas activas** y pide elegir **cuál** y la **modalidad** (dinero / bienes).
4. El donante elige campaña + modalidad.
5. Bifurcación por modalidad:
   - **5a · Dinero:** el agente genera y envía un **link de pago de Mercado Pago** *(SIMULADO — URL placeholder, sin integración de API)*. Registra `donation` con status `pending`. Confirmación de pago: fuera de alcance / manual.
   - **5b · Bienes:** registra la intención con status `pending_pickup`, muestra las necesidades de la campaña (`campaign_needs`), **deriva a un voluntario** (notifica a un `member` con rol volunteer) e informa al donante que será contactado.
6. **Formatter:** respuesta en español, tono empático, con CTA.

### Persistencia
- Lee: `campaigns`, `campaign_needs`.
- Escribe: `contacts` (donante), `donations` (intención de donación).

### Simulado / stub (MVP)
- Link de Mercado Pago (placeholder, sin API).
- Confirmación de pago.
- Asignación/aviso real al voluntario (se registra y se simula la notificación).

### «A confirmar»
- Elección de campaña/modalidad: ¿opciones numeradas o texto libre? (asumo numeradas).
- Bienes: ¿notificación a un voluntario concreto o cola/tarea? (asumo crear tarea + aviso).

### Cascada en el modelo de datos
La capa desplegada de Huella **no** tiene estas tablas. UC-01 requiere una migración nueva que agregue (adaptadas a multi-tenant con `organization_id`): `contacts`, `campaigns`, `campaign_needs`, `donations`, `donors`, `matches`, `conversation_history`.

---

## UC-02 — Crear tarea / recordatorio (T1)

**Rama:** Interna · **Track:** T1 · **Actor:** Miembro (`members`) · **Origen:** diagrama T1 del handoff (crear tarea / asignar responsable / recordar vencimiento)

- **Disparador:** lenguaje natural o comando. Ej.: *"Recordame que el viernes vence el certificado web y que lo revise Nico."*
- **Intención:** `task` (subtipo `task`/`reminder`/`maintenance`).
- **Flujo:** `raw_event` → clasifica `intent=task` → extrae `title`, responsable (Nico → `member`), `due_date` (viernes), `task_type` → si falta dato mínimo, pregunta → crea `task` → confirma por chat.
- **Persistencia (ya en schema):** `raw_events`, `tasks` (`assignee_member_id`, `created_by_member_id`, `due_date`).

## UC-03 — Registrar decisión (T1)

**Rama:** Interna · **Track:** T1 · **Actor:** Miembro · **Origen:** diagrama T1 (registrar decisión)

- **Disparador:** *"Hoy decidimos mover el taller al martes."*
- **Intención:** `decision`.
- **Flujo:** `raw_event` → `intent=decision` → extrae `description`, `decided_at` → crea `decision`.
- **Persistencia (ya en schema):** `raw_events`, `decisions`.

## UC-04 — Consultar pendientes / carga de trabajo (T1)

**Rama:** Interna · **Track:** T1 · **Actor:** Miembro · **Origen:** diagrama T1 (consultar pendientes) + brief ("la dirección quiere ver la carga de cada persona")

- **Disparador:** *"¿Qué pendientes tengo esta semana?"* / *"¿Quién está sobrecargado?"*
- **Intención:** `query`.
- **Flujo:** `raw_event` → `intent=query` → tool de **lectura** (tasks por responsable/vencimiento) → Formatter responde. **Sin escritura.**
- **Persistencia (ya en schema):** lee `tasks`/`members`. (Equivale al "Report Agent" de SPEC, pero acá como consulta operativa interna.)

## UC-05 — Registrar actividad de impacto (T3)

**Rama:** Interna · **Track:** T3 · **Actor:** Miembro de campo · **Origen:** diagrama T3 (actividad → programa/fecha/lugar/asistentes/beneficiarios/evidencia/notas)

- **Disparador:** *"Hoy hicimos taller en Ludueña. Vinieron 22 chicos, 3 voluntarios y faltaron materiales."* (+ foto/audio opcional)
- **Intención:** `activity`.
- **Flujo:** `raw_event` → `intent=activity` → extrae `location`, `attendees_count`, `volunteers_count`, `qualitative_notes`, `program` (pregunta si falta) → crea `activity` (`status` draft→confirmed) → adjunta `attachments` si hay media.
- **PII:** si menciona personas individuales → se aíslan en `beneficiaries` (base restringida) + `activity_beneficiaries`; las métricas van **agregadas** en `activities`.
- **Persistencia (ya en schema):** `raw_events`, `activities`, `attachments`, opc. `beneficiaries`/`activity_beneficiaries`.

## UC-06 — Registro diferido / offline (T3)

**Rama:** Interna · **Track:** T3 · **Actor:** Miembro de campo · **Origen:** diagrama "flujo offline" + máquina de estados

- **Disparador:** *"Ayer en barrio Las Flores entregamos alimentos. Fueron 40 familias."*
- **Intención:** `activity` con hecho en fecha pasada.
- **Flujo:** detecta `occurred_at` pasado vs `received_at` → `is_deferred=true` → **pide confirmación de fecha** (NeedsConfirmation) → guarda actividad diferida.
- **Persistencia (ya en schema):** `raw_events` (`is_deferred`, `occurred_at`), `activities`.

## UC-07 — Generar reporte (T3)

**Rama:** Interna · **Track:** T3 · **Actor:** Coordinador · **Origen:** diagrama T3 (reportes para financiadores/donantes)

- **Disparador:** *"Armame el reporte de mayo para el financiador."*
- **Intención:** `query`/`report`.
- **Flujo:** tool que **agrega métricas** (`activities` por programa/período) → genera `report` (`audience`, `format`, `content` jsonb). Sólo métricas agregadas, **sin PII**.
- **Persistencia (ya en schema):** `reports` (lee `activities`).

---

## Reglas transversales (de los diagramas de intención y de estados)

- **Captura-primero:** todo mensaje inserta `raw_event` **antes** de procesar (no se pierde intención).
- **Ambigüedad:** intención poco clara → pedir aclaración mínima y guardar como nota pendiente (`PendingInterpretation`/`NeedsClarification`).
- **Confirmación humana:** acción sensible / fecha pasada / datos incompletos → `NeedsConfirmation` antes de ejecutar.
- **Datos sensibles:** PII (en `beneficiaries`) siempre separada de las métricas agregadas (en `activities`).
- **Routing por whitelist:** `member` → rama interna (UC-02…07); externo → rama externa (UC-01).
