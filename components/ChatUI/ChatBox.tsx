'use client';

import React, { useEffect, useMemo } from 'react'; // Added useEffect, useMemo
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useChat, type UseChatHelpers, type Message } from '@ai-sdk/react'; // Added Message
import { ChatInput } from './ChatInput';
import { ChatMessages } from './Messages';
import { cn } from '@/lib/utils';
import { useModelContext } from './ModelContext';
import { useChatThreadContext } from '@/components/context/ChatThreadContext'; // Import context hook

export const ChatBox = () => {
  const { selectedModel } = useModelContext();
  const {
    currentThreadId,
    getThreadById,
    addMessageToCurrentThread,
    isLoadingThreads // To prevent actions before threads are loaded
  } = useChatThreadContext();

  // Memoize initial messages to prevent re-renders if other context state changes
  const initialMessages = useMemo(() => {
    if (isLoadingThreads || !currentThreadId) return [];
    const currentThread = getThreadById(currentThreadId);
    return currentThread ? currentThread.messages : [];
  }, [currentThreadId, getThreadById, isLoadingThreads]);

  const injectModel: typeof fetch = (input, init?) => {
    if (init?.body && typeof init.body === "string") {
      try {
        const parsedBody = JSON.parse(init.body);
        parsedBody.modelName = selectedModel;
        init.body = JSON.stringify(parsedBody);
      } catch (err) {
        console.error("JSON parsing failed:", err);
      }
    }
    return fetch(input, init);
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages, // Added setMessages to re-initialize chat when thread changes
    // append // We'll use append to manually add user messages for persistence
  }: UseChatHelpers = useChat({
    fetch: injectModel,
    // Keying the hook itself is not standard; instead, we manage messages via useEffect
    initialMessages: initialMessages,
    // The 'id' for useChat is for identifying the chat session if backend needs it,
    // or for some multi-chat features within useChat itself.
    // We are using currentThreadId to manage our own state.
    id: currentThreadId || undefined, // Pass currentThreadId to useChat if it uses it for internal state

    onFinish: async (message: Message) => {
      // This callback receives the assistant's final message.
      // The user's message that triggered this is already in `messages` array from useChat.
      // We need to persist both.
      if (currentThreadId && !isLoadingThreads) {
        // Find the last user message in the useChat messages that isn't in our persisted state yet
        const currentThread = getThreadById(currentThreadId);
        const persistedMessagesCount = currentThread?.messages.length || 0;

        // Check if the received message (assistant's) is newer than what's persisted
        // This is a simplified check. A more robust check might involve message IDs if available and consistent.
        if (messages.length > persistedMessagesCount && messages[messages.length -1].id === message.id) {
           await addMessageToCurrentThread(message, false);
        } else if (messages.length === persistedMessagesCount +1 && message.id !== messages[persistedMessagesCount-1]?.id) {
          // This case can happen if onFinish is called before user message is added by custom handleSubmit
          // or if there's a slight delay/race condition.
          // More robustly, we ensure the assistant's message is the one we expect.
           await addMessageToCurrentThread(message, false);
        }
      }
    },
  });

  // Effect to re-initialize useChat's messages when currentThreadId changes or initial load finishes
  useEffect(() => {
    if (isLoadingThreads) return;

    if (currentThreadId) {
      const thread = getThreadById(currentThreadId);
      setMessages(thread ? thread.messages : []);
    } else {
      setMessages([]); // New chat, clear messages
    }
  }, [currentThreadId, getThreadById, setMessages, isLoadingThreads]);


  const styles: Record<string, string> = {
    chatCardHeight: 'min-h-72 h-[calc(100dvh-40px)]',
    chatCardWidth:
      'min-w-64 max-md:w-[calc(100dvw-4rem)] md:w-[clamp(700px,85vw,900px)]',
    headerText: 'hidden text-lg mt-2 font-bold leading-none tracking-tight xs:block',
  };

  // Override handleSubmit to ensure user message is persisted immediately
  const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    if (!input.trim() || isLoading || isLoadingThreads) return;

    const userMessage: Message = {
      id: crypto.randomUUID(), // Use crypto.randomUUID for client-side ID
      role: 'user',
      content: input,
      createdAt: new Date(),
    };

    // Persist user's message immediately using context
    // This will also handle creating a new thread if currentThreadId is null
    await addMessageToCurrentThread(userMessage, true);

    // Call original handleSubmit from useChat to send message to AI
    handleSubmit(e, {
        data: { modelName: selectedModel } // Pass modelName or other data if needed by API
    });
  };


  if (isLoadingThreads) {
    return (
      <Card className={cn(styles.chatCardHeight, styles.chatCardWidth, 'grid place-items-center')}>
        <p>Loading chats...</p>
      </Card>
    );
  }

  // If no thread is selected, and not loading, show a prompt or welcome message
  if (!currentThreadId && !isLoadingThreads) {
    return (
      <Card className={cn(styles.chatCardHeight, styles.chatCardWidth, 'grid grid-rows-[1fr_auto] place-items-center p-4 text-center')}>
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-2">Welcome to Super GPT</h2>
          <p className="text-muted-foreground">
            Select a chat from the sidebar to continue a conversation, or start a new one by typing a message below.
          </p>
        </div>
        {/* Render ChatInput here as well to allow starting a new chat directly */}
         <div className="w-full px-4 pb-4"> {/* Pushes ChatInput to the bottom of this view */}
          <ChatInput
            isLoading={isLoading} // isLoading from useChat
            stop={stop}
            handleSubmit={handleChatSubmit} // Use overridden handleSubmit
            input={input}
            handleInputChange={handleInputChange}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card
      key={currentThreadId} // Ensure ChatBox re-renders fully if ID changes, helping reset useChat if needed
      className={cn(
        'grid grid-rows-[auto_1fr_auto] rounded-2xl p-0 -mt-14 border-0',
        styles.chatCardHeight,
        styles.chatCardWidth
      )}
    >
      <CardHeader className="flex flex-row justify-between py-0 px-4">
        {/* Header content can be added here if needed */}
      </CardHeader>
      <CardContent className="flex flex-col-reverse overflow-y-auto pb-0 pt-2 rounded-lg">
        <ChatMessages messages={messages} /> {/* messages from useChat */}
      </CardContent>
      <CardFooter className="">
        <ChatInput
          isLoading={isLoading}
          stop={stop}
          handleSubmit={handleChatSubmit} // Use overridden handleSubmit
          input={input}
          handleInputChange={handleInputChange}
        />
      </CardFooter>
    </Card>
  );
};
