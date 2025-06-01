'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { type Message } from '@ai-sdk/react';
import { ChatThread } from '@/types/thread';
import { loadThreads, saveThreads } from '@/lib/localStorage'; // Adjust path if necessary
import { v4 as uuidv4 } from 'uuid'; // Needs uuid package

interface ChatThreadContextState {
  threads: ChatThread[];
  currentThreadId: string | null;
  isLoadingThreads: boolean;
  currentChatMessages: Message[]; // Messages for the currently selected chat
}

interface ChatThreadContextActions {
  selectThread: (threadId: string | null) => void;
  addMessageToCurrentThread: (message: Message, isUserMessage: boolean)  => Promise<void>; // Made async
  createNewThread: () => string; // Returns the new thread ID
  deleteThread: (threadId: string) => void;
  getThreadById: (threadId: string) => ChatThread | undefined;
}

const ChatThreadContext = createContext<
  (ChatThreadContextState & ChatThreadContextActions) | undefined
>(undefined);

export const useChatThreadContext = () => {
  const context = useContext(ChatThreadContext);
  if (!context) {
    throw new Error('useChatThreadContext must be used within a ChatThreadProvider');
  }
  return context;
};

interface ChatThreadProviderProps {
  children: ReactNode;
}

export const ChatThreadProvider: React.FC<ChatThreadProviderProps> = ({ children }) => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [isLoadingThreads, setIsLoadingThreads] = useState<boolean>(true);
  const [currentChatMessages, setCurrentChatMessages] = useState<Message[]>([]);

  // Load threads from localStorage on initial mount
  useEffect(() => {
    setIsLoadingThreads(true);
    const loadedThreads = loadThreads();
    setThreads(loadedThreads);
    if (loadedThreads.length > 0 && !currentThreadId) {
      // Optionally select the most recent thread or the first one
      // For now, let's select the last modified one if no currentThreadId is set
      const sortedThreads = [...loadedThreads].sort((a, b) =>
        new Date(b.lastModifiedAt).getTime() - new Date(a.createdAt).getTime()
      );
      setCurrentThreadId(sortedThreads[0].id);
    }
    setIsLoadingThreads(false);
  }, []);

  // Save threads to localStorage whenever the threads state changes
  useEffect(() => {
    if (!isLoadingThreads) { // Avoid saving during initial load
      saveThreads(threads);
    }
  }, [threads, isLoadingThreads]);

  // Update currentChatMessages when currentThreadId or threads change
  useEffect(() => {
    if (currentThreadId) {
      const currentThread = threads.find(t => t.id === currentThreadId);
      setCurrentChatMessages(currentThread ? currentThread.messages : []);
    } else {
      setCurrentChatMessages([]); // No thread selected, or new chat
    }
  }, [currentThreadId, threads]);

  const createNewThread = useCallback((): string => {
    const newThreadId = uuidv4();
    const newThread: ChatThread = {
      id: newThreadId,
      title: 'New Chat', // Provisional title
      messages: [],
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
    };
    setThreads(prevThreads => [newThread, ...prevThreads]); // Add to start for visibility
    setCurrentThreadId(newThreadId);
    return newThreadId;
  }, []);

  const selectThread = useCallback((threadId: string | null) => {
    setCurrentThreadId(threadId);
    if (threadId === null) {
        // If null, it implies user wants to start a new chat.
        // We don't create it here, but rather when the first message is sent,
        // or user explicitly clicks "New Chat" which might call createNewThread then selectThread(newId).
        // For now, just clear current messages.
        setCurrentChatMessages([]);
    }
  }, []);

  const addMessageToCurrentThread = useCallback(async (message: Message, isUserMessage: boolean): Promise<void> => {
    let activeThreadId = currentThreadId;

    if (!activeThreadId) {
      // No current thread, so create a new one
      activeThreadId = createNewThread(); // This also sets currentThreadId
    }

    setThreads(prevThreads =>
      prevThreads.map(thread => {
        if (thread.id === activeThreadId) {
          const updatedMessages = [...thread.messages, message];
          let newTitle = thread.title;
          // Update title if it's the first user message and title is still provisional
          if (isUserMessage && thread.messages.length === 0 && (thread.title === 'New Chat' || !thread.title)) {
            newTitle = message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '');
          }
          return {
            ...thread,
            messages: updatedMessages,
            lastModifiedAt: new Date().toISOString(),
            title: newTitle,
          };
        }
        return thread;
      })
    );
  }, [currentThreadId, createNewThread]);

  const deleteThread = useCallback((threadId: string) => {
    setThreads(prevThreads => prevThreads.filter(thread => thread.id !== threadId));
    if (currentThreadId === threadId) {
      // If deleting current thread, select the most recent one or null if no threads left
      const remainingThreads = threads.filter(thread => thread.id !== threadId);
      if (remainingThreads.length > 0) {
        const sortedRemaining = [...remainingThreads].sort((a, b) =>
          new Date(b.lastModifiedAt).getTime() - new Date(a.createdAt).getTime()
        );
        setCurrentThreadId(sortedRemaining[0].id);
      } else {
        setCurrentThreadId(null);
      }
    }
  }, [currentThreadId, threads]);

  const getThreadById = useCallback((threadId: string): ChatThread | undefined => {
    return threads.find(thread => thread.id === threadId);
  }, [threads]);

  return (
    <ChatThreadContext.Provider
      value={{
        threads,
        currentThreadId,
        isLoadingThreads,
        currentChatMessages,
        selectThread,
        addMessageToCurrentThread,
        createNewThread,
        deleteThread,
        getThreadById,
      }}
    >
      {children}
    </ChatThreadContext.Provider>
  );
};
