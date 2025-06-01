'use client';

import ChatUi from '@/components/ChatUI';
import { ChatLayout } from '@/components/ChatLayout';
import { ChatThreadProvider } from '@/components/context/ChatThreadContext'; // Adjust path if necessary

export default function ChatPage() {
  return (
    <ChatThreadProvider>
      <ChatLayout>
        <main className="flex flex-col gap-8 items-center">
          <ChatUi />
        </main>
      </ChatLayout>
    </ChatThreadProvider>
  );
} 