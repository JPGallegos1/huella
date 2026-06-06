export type MessageStatus = "sent" | "delivered" | "read";

export type Author = "me" | "them";

export interface Message {
  id: string;
  author: Author;
  text: string;
  /** HH:mm */
  time: string;
  status?: MessageStatus;
}

export interface Chat {
  id: string;
  name: string;
  /** short subtitle: role / phone / "en línea" */
  subtitle?: string;
  avatarColor: string;
  /** initials shown in the avatar circle */
  initials: string;
  /** true for group chats */
  isGroup?: boolean;
  /** seed conversation */
  messages: Message[];
  unread?: number;
}
