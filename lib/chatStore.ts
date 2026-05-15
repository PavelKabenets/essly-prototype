import type { Message } from '@/mock/chat';

const STORAGE_KEY = 'essly:current-chat';

// localStorage on web, in-memory only on native (good enough for prototype).
let memoryFallback: Message[] | null = null;

function hasWebStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadChat(): Message[] | null {
  if (hasWebStorage()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Message[];
    } catch {}
    return null;
  }
  return memoryFallback;
}

export function saveChat(messages: Message[]) {
  if (hasWebStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
    return;
  }
  memoryFallback = messages;
}

export function clearChat() {
  if (hasWebStorage()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return;
  }
  memoryFallback = null;
}
