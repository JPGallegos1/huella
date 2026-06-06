# 0001. Reservar padrinazgo al elegir campania

## Status

Accepted

## Context

El flujo de pitch asigna internamente un padrino externo a exactamente un beneficiario o familia dentro de una campaña. La experiencia visible debe presentarlo como acompanamiento humano, no como jerga de padrinazgo/matching. La asignación debe evitar que dos personas vean o confirmen el mismo perfil seguro al mismo tiempo.

Había tres momentos posibles para crear la reserva:

- Al primer mensaje del padrino, antes de saber la campaña.
- Después de elegir campaña, antes de elegir modalidad de colaboración.
- Después de elegir modalidad o completar pago/donación.

## Decision

La reserva se crea después de que la persona elige campaña y antes de preguntarle si colaborará con dinero o en especie.

La reserva debe durar 15 minutos y expirar si el flujo no se confirma. Para el MVP de hackathon, la respuesta de reserva incluye de inmediato un link de aporte sugerido; no se exige una confirmacion previa para mostrarlo. La confirmación puede ocurrir cuando la persona declara explícitamente su compromiso o cuando completa el aporte; no depende de una integración real de pago ni de una entrega validada.

## Consequences

- La persona ve un perfil seguro que ya queda bloqueado para otros flujos activos.
- La persona recibe el link de aporte en el primer mensaje posterior a elegir campaña.
- No se retienen beneficiarios antes de conocer la campaña elegida.
- No se permite que dos padrinos avancen viendo el mismo beneficiario.
- El sistema necesita una operación atómica para reservar el próximo beneficiario libre de una campaña.
- La UI y el bot deben distinguir reserva temporal de acompanamiento confirmado sin exponer terminos internos como padrino, padrinazgo o match.
- La integración de pago puede ser simulada sin bloquear la demostración del padrinazgo.
- La logística de donaciones en especie queda como seguimiento posterior, no como condicion de confirmacion del padrinazgo.
- No hace falta demostrar el timer en la hackathon, pero el modelo debe contemplar expiracion de reservas.
