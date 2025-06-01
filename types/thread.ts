import { type Message } from '@ai-sdk/react';

export interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string; // Store as ISO string for easier serialization
  lastModifiedAt: string; // Store as ISO string
}
