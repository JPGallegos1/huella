import type { Chat } from "./types";

/** Hora HH:mm para los mensajes nuevos. */
export function now(): string {
  return new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface Sender {
  id: string;
  label: string;
  /** teléfono E.164 que se manda al backend (define la rama por whitelist) */
  phone: string;
  isMember: boolean;
}

/** Remitentes simulables en el chat del bot (members vs externo). */
export const SENDERS: Sender[] = [
  { id: "maria", label: "María (coordinadora)", phone: "+5493410000001", isMember: true },
  { id: "pedro", label: "Pedro (campo)", phone: "+5493410000002", isMember: true },
  { id: "externo", label: "Donante externo", phone: "+5499999999999", isMember: false },
];

export const CHATS: Chat[] = [
  {
    id: "huella",
    name: "Huella",
    subtitle: "captura · en línea",
    avatarColor: "#00a884",
    initials: "H",
    messages: [
      {
        id: "m1",
        author: "them",
        text: "¡Hola! Contame qué pasó hoy y lo registro. Podés mandarme texto, audio o una foto.",
        time: "08:02",
      },
      {
        id: "m2",
        author: "me",
        text: "Hoy taller en Ludueña, vinieron 22 chicos, faltó material",
        time: "18:41",
        status: "read",
      },
      {
        id: "m3",
        author: "them",
        text: "✅ Registrado. Detecté dos cosas:\n• Actividad: Taller en Ludueña — 22 asistentes\n• Tarea: reponer material faltante",
        time: "18:41",
      },
    ],
  },
  {
    id: "coordinacion",
    name: "Coordinación",
    subtitle: "María, Juan, Sofía, +3",
    avatarColor: "#6a5acd",
    initials: "CO",
    isGroup: true,
    unread: 2,
    messages: [
      {
        id: "c1",
        author: "them",
        text: "Recordá pasar la lista de asistentes del sábado 🙏",
        time: "12:15",
      },
      {
        id: "c2",
        author: "me",
        text: "Dale, la cargo hoy a la tarde",
        time: "12:20",
        status: "delivered",
      },
    ],
  },
  {
    id: "maria",
    name: "María Coordinadora",
    subtitle: "+54 9 341 555-0142",
    avatarColor: "#d2691e",
    initials: "MC",
    messages: [
      {
        id: "ma1",
        author: "them",
        text: "¿Cómo venimos con la entrega de viandas?",
        time: "10:03",
      },
    ],
  },
  {
    id: "ludueña",
    name: "Equipo Ludueña",
    subtitle: "vos, Pedro, Caro, +4",
    avatarColor: "#2e8b57",
    initials: "EL",
    isGroup: true,
    messages: [
      {
        id: "l1",
        author: "them",
        text: "Mañana arrancamos 9hs en el club 💪",
        time: "20:55",
      },
    ],
  },
];
