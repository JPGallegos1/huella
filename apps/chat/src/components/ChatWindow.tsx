import { useEffect, useRef } from "react";
import type { Chat } from "../types";
import type { Sender } from "../data";
import { Avatar } from "./Avatar";
import { MessageBubble } from "./MessageBubble";
import { Composer } from "./Composer";
import { MenuIcon, SearchIcon } from "../icons";

interface Props {
  chat: Chat;
  onSend: (text: string) => void;
  pending?: boolean;
  senders?: Sender[];
  activeSenderId?: string;
  onSenderChange?: (id: string) => void;
}

export function ChatWindow({
  chat,
  onSend,
  pending,
  senders,
  activeSenderId,
  onSenderChange,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages.length, chat.id, pending]);

  return (
    <section className="chat-window">
      <header className="chat-header">
        <Avatar color={chat.avatarColor} initials={chat.initials} size={40} />
        <div className="chat-header-info">
          <span className="chat-header-name">{chat.name}</span>
          <span className="chat-header-sub">{chat.subtitle}</span>
        </div>
        <div className="chat-header-actions">
          {senders && onSenderChange ? (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "#54656f",
                whiteSpace: "nowrap",
              }}
            >
              <span>Enviar como</span>
              <select
                value={activeSenderId}
                onChange={(e) => onSenderChange(e.target.value)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid #d1d7db",
                  background: "#fff",
                  fontSize: 13,
                  color: "#111b21",
                }}
              >
                {senders.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <>
              <button className="icon-btn" title="Buscar">
                <SearchIcon />
              </button>
              <button className="icon-btn" title="Menú">
                <MenuIcon />
              </button>
            </>
          )}
        </div>
      </header>

      <div className="messages">
        <div className="day-divider">
          <span>HOY</span>
        </div>
        {chat.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {pending && (
          <div className="bubble-row in">
            <div className="bubble">
              <span className="bubble-text" style={{ fontStyle: "italic", opacity: 0.7 }}>
                Huella está escribiendo…
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <Composer onSend={onSend} />
    </section>
  );
}
