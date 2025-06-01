import { ChatThread } from '@/types/thread'; // Adjust path as necessary based on tsconfig

const THREADS_STORAGE_KEY = 'chatThreads';

export function loadThreads(): ChatThread[] {
  try {
    const serializedThreads = localStorage.getItem(THREADS_STORAGE_KEY);
    if (serializedThreads === null) {
      return [];
    }
    const threads = JSON.parse(serializedThreads) as ChatThread[];
    // Basic validation: check if it's an array
    if (!Array.isArray(threads)) {
        console.error('Invalid threads format in localStorage: not an array.');
        return [];
    }
    // Further validation can be added here if needed, e.g., checking structure of each thread
    return threads;
  } catch (error) {
    console.error('Failed to load threads from localStorage:', error);
    // If an error occurs (e.g., parsing error, localStorage not available), return an empty array
    return [];
  }
}

export function saveThreads(threads: ChatThread[]): void {
  try {
    const serializedThreads = JSON.stringify(threads);
    localStorage.setItem(THREADS_STORAGE_KEY, serializedThreads);
  } catch (error) {
    console.error('Failed to save threads to localStorage:', error);
    // Handle potential errors, e.g., localStorage full, or browser restrictions
  }
}
