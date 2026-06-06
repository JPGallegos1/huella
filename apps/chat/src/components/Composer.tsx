import { useState, type KeyboardEvent } from "react";
import { AttachIcon, EmojiIcon, MicIcon, SendIcon } from "../icons";

interface Props {
  onSend: (text: string) => void;
}

export function Composer({ onSend }: Props) {
  const [text, setText] = useState("");

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const hasText = text.trim().length > 0;

  return (
    <footer className="composer">
      <button className="icon-btn" title="Emoji">
        <EmojiIcon />
      </button>
      <button className="icon-btn" title="Adjuntar">
        <AttachIcon />
      </button>
      <textarea
        className="composer-input"
        placeholder="Escribí un mensaje"
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <button
        className="icon-btn send"
        title={hasText ? "Enviar" : "Mensaje de voz"}
        onClick={hasText ? submit : undefined}
      >
        {hasText ? <SendIcon /> : <MicIcon />}
      </button>
    </footer>
  );
}
