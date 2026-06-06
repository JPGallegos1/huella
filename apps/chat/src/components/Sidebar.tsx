import { useState } from "react";
import type { Chat } from "../types";
import { Avatar } from "./Avatar";
import { MenuIcon, NewChatIcon, SearchIcon } from "../icons";

interface Props {
  chats: Chat[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function Sidebar({ chats, activeId, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <Avatar color="#6b7c85" initials="Yo" size={40} />
        <div className="sidebar-header-actions">
          <button className="icon-btn" title="Nuevo chat">
            <NewChatIcon />
          </button>
          <button className="icon-btn" title="Menú">
            <MenuIcon />
          </button>
        </div>
      </header>

      <div className="search-bar">
        <div className="search-input">
          <SearchIcon className="search-icon" />
          <input
            placeholder="Buscar un chat"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <ul className="chat-list">
        {filtered.map((chat) => {
          const last = chat.messages[chat.messages.length - 1];
          return (
            <li
              key={chat.id}
              className={`chat-item${chat.id === activeId ? " active" : ""}`}
              onClick={() => onSelect(chat.id)}
            >
              <Avatar color={chat.avatarColor} initials={chat.initials} />
              <div className="chat-item-body">
                <div className="chat-item-top">
                  <span className="chat-name">{chat.name}</span>
                  <span className="chat-time">{last?.time}</span>
                </div>
                <div className="chat-item-bottom">
                  <span className="chat-preview">
                    {last?.author === "me" ? "Tú: " : ""}
                    {last?.text.replace(/\n/g, " ")}
                  </span>
                  {chat.unread ? (
                    <span className="unread-badge">{chat.unread}</span>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="chat-empty">Sin resultados</li>
        )}
      </ul>
    </aside>
  );
}
