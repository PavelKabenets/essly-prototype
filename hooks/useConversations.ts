import { useSyncExternalStore } from 'react';
import {
  getConversations,
  getCurrentConversation,
  subscribeConversations,
} from '@/lib/conversations';

export function useConversations() {
  return useSyncExternalStore(
    subscribeConversations,
    getConversations,
    getConversations,
  );
}

export function useCurrentConversation() {
  return useSyncExternalStore(
    subscribeConversations,
    getCurrentConversation,
    getCurrentConversation,
  );
}
