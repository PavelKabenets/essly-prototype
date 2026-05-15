// Multi-conversation store. All AI-chat persistence flows through here now:
// the current open chat is one of N conversations, all stored in localStorage.

import { AI_WELCOME, PAST_CONVERSATIONS, type Message } from '@/mock/chat';

const CONV_KEY = 'essly:conversations';
const CURRENT_KEY = 'essly:current-conv-id';

export type Conversation = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
};

export type SearchResult = {
  conversationId: string;
  conversationTitle: string;
  message: Message;
  snippet: string;
  matchStart: number;
  matchEnd: number;
};

let conversations: Conversation[] | null = null;
let currentId: string | null = null;
const listeners = new Set<() => void>();

function seedDefaults(): { convs: Conversation[]; current: string } {
  const now = Date.now();
  // Past conversations get descending timestamps so the freshest is on top.
  const seeded: Conversation[] = PAST_CONVERSATIONS.map((p, i) => ({
    id: p.id,
    title: p.title,
    updatedAt: now - (i + 1) * 24 * 60 * 60 * 1000,
    messages: p.messages,
  }));
  const fresh: Conversation = {
    id: `conv-${now}`,
    title: 'New conversation',
    updatedAt: now,
    messages: [AI_WELCOME],
  };
  return { convs: [fresh, ...seeded], current: fresh.id };
}

function hydrate() {
  if (conversations !== null) return;
  if (typeof window === 'undefined' || !window.localStorage) {
    const seeded = seedDefaults();
    conversations = seeded.convs;
    currentId = seeded.current;
    return;
  }
  try {
    const raw = window.localStorage.getItem(CONV_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        conversations = parsed;
        const stored = window.localStorage.getItem(CURRENT_KEY);
        currentId = stored && parsed.some((c: any) => c.id === stored)
          ? stored
          : parsed[0].id;
        return;
      }
    }
  } catch {}
  const seeded = seedDefaults();
  conversations = seeded.convs;
  currentId = seeded.current;
  persist();
}

function persist() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(CONV_KEY, JSON.stringify(conversations ?? []));
    if (currentId) window.localStorage.setItem(CURRENT_KEY, currentId);
  } catch {}
}

function notify() {
  listeners.forEach((l) => l());
}

function deriveTitle(messages: Message[]): string {
  const firstUser = messages.find((m) => m.from === 'user');
  if (firstUser) {
    const t = firstUser.text.trim().replace(/\s+/g, ' ');
    return t.length > 40 ? `${t.slice(0, 40)}…` : t;
  }
  return 'New conversation';
}

// ── Public API ────────────────────────────────────────────────────────────

export function getConversations(): Conversation[] {
  hydrate();
  return [...(conversations ?? [])].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getConversation(id: string): Conversation | undefined {
  hydrate();
  return conversations?.find((c) => c.id === id);
}

export function getCurrentConversation(): Conversation | undefined {
  hydrate();
  return conversations?.find((c) => c.id === currentId);
}

export function getCurrentConversationId(): string | null {
  hydrate();
  return currentId;
}

export function setCurrentConversation(id: string) {
  hydrate();
  if (!conversations?.some((c) => c.id === id)) return;
  currentId = id;
  persist();
  notify();
}

export function updateCurrentMessages(messages: Message[]) {
  hydrate();
  if (!conversations || !currentId) return;
  let touched = false;
  conversations = conversations.map((c) => {
    if (c.id !== currentId) return c;
    touched = true;
    return {
      ...c,
      messages,
      updatedAt: Date.now(),
      title:
        c.title === 'New conversation' && messages.some((m) => m.from === 'user')
          ? deriveTitle(messages)
          : c.title,
    };
  });
  if (touched) {
    persist();
    notify();
  }
}

export function startNewConversation(): string {
  hydrate();
  const now = Date.now();
  const newConv: Conversation = {
    id: `conv-${now}`,
    title: 'New conversation',
    updatedAt: now,
    messages: [AI_WELCOME],
  };
  conversations = [newConv, ...(conversations ?? [])];
  currentId = newConv.id;
  persist();
  notify();
  return newConv.id;
}

export function deleteConversation(id: string) {
  hydrate();
  if (!conversations) return;
  conversations = conversations.filter((c) => c.id !== id);
  if (currentId === id) {
    currentId = conversations[0]?.id ?? startNewConversation();
  }
  persist();
  notify();
}

export function subscribeConversations(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ── Search ────────────────────────────────────────────────────────────────

export function searchConversations(query: string): SearchResult[] {
  hydrate();
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  const results: SearchResult[] = [];
  for (const conv of conversations ?? []) {
    for (const msg of conv.messages) {
      const lower = msg.text.toLowerCase();
      const idx = lower.indexOf(q);
      if (idx < 0) continue;
      const ctxBefore = 30;
      const ctxAfter = 30;
      const start = Math.max(0, idx - ctxBefore);
      const end = Math.min(msg.text.length, idx + q.length + ctxAfter);
      const leftEllipsis = start > 0 ? '…' : '';
      const rightEllipsis = end < msg.text.length ? '…' : '';
      const snippet = leftEllipsis + msg.text.slice(start, end) + rightEllipsis;
      const matchStart = leftEllipsis.length + (idx - start);
      const matchEnd = matchStart + q.length;
      results.push({
        conversationId: conv.id,
        conversationTitle: conv.title,
        message: msg,
        snippet,
        matchStart,
        matchEnd,
      });
    }
  }
  // Group results so most-recent conversations come first.
  const order = new Map<string, number>();
  (conversations ?? [])
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((c, i) => order.set(c.id, i));
  results.sort(
    (a, b) =>
      (order.get(a.conversationId) ?? 999) -
      (order.get(b.conversationId) ?? 999),
  );
  return results;
}
