import { useEffect, useRef } from "react";
import type { Chat } from "../types";
import { Avatar } from "./Avatar";
import { MessageBubble } from "./MessageBubble";
import { Composer } from "./Composer";
import { MenuIcon, SearchIcon } from "../icons";

interface Props {
  chat: Chat;
  onSend: (text: string) => void;
}

export function ChatWindow({ chat, onSend }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages.length, chat.id]);

  return (
    <section className="chat-window">
      <header className="chat-header">
        <Avatar color={chat.avatarColor} initials={chat.initials} size={40} />
        <div className="chat-header-info">
          <span className="chat-header-name">{chat.name}</span>
          <span className="chat-header-sub">{chat.subtitle}</span>
        </div>
        <div className="chat-header-actions">
          <button className="icon-btn" title="Buscar">
            <SearchIcon />
          </button>
          <button className="icon-btn" title="Menú">
            <MenuIcon />
          </button>
        </div>
      </header>

      <div className="messages">
        <div className="day-divider">
          <span>HOY</span>
        </div>
        {chat.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={endRef} />
      </div>

      <Composer onSend={onSend} />
    </section>
  );
}
