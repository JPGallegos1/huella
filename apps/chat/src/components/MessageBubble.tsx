import type { Message } from "../types";
import { CheckIcon } from "../icons";

export function MessageBubble({ message }: { message: Message }) {
  const mine = message.author === "me";
  return (
    <div className={`bubble-row ${mine ? "out" : "in"}`}>
      <div className="bubble">
        <span className="bubble-text">{message.text}</span>
        <span className="bubble-meta">
          <span className="bubble-time">{message.time}</span>
          {mine && (
            <CheckIcon
              className={`tick${message.status === "read" ? " read" : ""}`}
            />
          )}
        </span>
      </div>
    </div>
  );
}
