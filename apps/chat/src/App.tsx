import { useMemo, useState } from "react";
import type { Chat, Message } from "./types";
import { CHATS, SENDERS, now } from "./data";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/ChatWindow";
import { sendChat } from "./api";

/** El chat del bot real; el resto son chats simulados de contexto. */
const BOT_CHAT_ID = "huella";

export function App() {
  const [chats, setChats] = useState<Chat[]>(CHATS);
  const [activeId, setActiveId] = useState<string>(CHATS[0].id);
  const [senderId, setSenderId] = useState<string>(SENDERS[0].id);
  const [pending, setPending] = useState(false);

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

  async function handleSend(text: string) {
    const chatId = activeId;
    appendMessage(chatId, {
      id: crypto.randomUUID(),
      author: "me",
      text,
      time: now(),
      status: "sent",
    });

    // Solo el chat "Huella" habla con el bot real (apps/api).
    if (chatId !== BOT_CHAT_ID) return;

    const sender = SENDERS.find((s) => s.id === senderId)!;
    setPending(true);
    try {
      const { reply } = await sendChat({ text, phone: sender.phone });
      appendMessage(chatId, {
        id: crypto.randomUUID(),
        author: "them",
        text: reply,
        time: now(),
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : "error desconocido";
      appendMessage(chatId, {
        id: crypto.randomUUID(),
        author: "them",
        text: `⚠️ No pude procesar el mensaje (${detail}). ¿Está corriendo apps/api con SUPABASE_SECRET_KEY cargada?`,
        time: now(),
      });
    } finally {
      setPending(false);
    }
  }

  const isBot = activeId === BOT_CHAT_ID;

  return (
    <div className="app">
      <div className="app-frame">
        <Sidebar chats={chats} activeId={activeId} onSelect={setActiveId} />
        <ChatWindow
          chat={activeChat}
          onSend={handleSend}
          pending={isBot && pending}
          senders={isBot ? SENDERS : undefined}
          activeSenderId={senderId}
          onSenderChange={setSenderId}
        />
      </div>
    </div>
  );
}
