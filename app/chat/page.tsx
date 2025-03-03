'use client';

import ChatUi from '@/components/ChatUI';

export default function ChatPage() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <ChatUi />
      </main>
    </div>
  );
} 