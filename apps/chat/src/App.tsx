import { useMemo, useState } from "react";
import type { Chat, Message } from "./types";
import { CHATS, now } from "./data";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/ChatWindow";

/**
 * Respuesta simulada de captura de Huella. En producción esto lo resuelve
 * la API de intención (LangChain) sobre el raw_event guardado en Supabase.
 */
function captureAck(text: string): string {
  const lower = text.toLowerCase();
  if (/(taller|jornada|entrega|actividad|vinieron|asist)/.test(lower)) {
    return "✅ Registrado como actividad. Lo vas a ver en la WebApp.";
  }
  if (/(recordá|recordar|tarea|pendiente|comprar|reponer|llamar)/.test(lower)) {
    return "✅ Anoté la tarea con su responsable.";
  }
  return "✅ Guardado. Lo proceso y lo estructuro en un momento.";
}

export function App() {
  const [chats, setChats] = useState<Chat[]>(CHATS);
  const [activeId, setActiveId] = useState<string>(CHATS[0].id);

  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeId)!,
    [chats, activeId],
  );

  function appendMessage(chatId: string, message: Message) {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, messages: [...c.messages, message] } : c,
      ),
    );
  }

  function handleSend(text: string) {
    const outgoing: Message = {
      id: crypto.randomUUID(),
      author: "me",
      text,
      time: now(),
      status: "sent",
    };
    appendMessage(activeId, outgoing);

    // Solo el chat "Huella" simula una confirmación de captura.
    if (activeId === "huella") {
      const replyTo = activeId;
      setTimeout(() => {
        appendMessage(replyTo, {
          id: crypto.randomUUID(),
          author: "them",
          text: captureAck(text),
          time: now(),
        });
      }, 900);
    }
  }

  return (
    <div className="app">
      <div className="app-frame">
        <Sidebar chats={chats} activeId={activeId} onSelect={setActiveId} />
        <ChatWindow chat={activeChat} onSend={handleSend} />
      </div>
    </div>
  );
}
