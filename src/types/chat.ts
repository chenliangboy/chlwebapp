export type ChatMessageType = 'text' | 'emoji' | 'file';
export type ChatMessageFrom = 'me' | 'them';

export interface ChatMessage {
  id: string;
  from: ChatMessageFrom;
  type: ChatMessageType;
  content: string;
  createdAt: number;
  fileName?: string;
  fileSize?: number;
}
