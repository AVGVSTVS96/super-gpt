'use client';

import ChatUi from '@/components/ChatUI';
import { ChatLayout } from '@/components/ChatLayout';

export default function ChatPage() {
  return (
    <ChatLayout>
      <main className="flex flex-col gap-8 items-center">
        <ChatUi />
      </main>
    </ChatLayout>
  );
} 