// Thin compatibility wrapper over the conversation store. Existing callers
// (ritual scheduler, check-in scheduler, profile bio ack) still work because
// loadChat / saveChat now delegate to the current conversation.

import {
  getCurrentConversation,
  subscribeConversations,
  updateCurrentMessages,
} from '@/lib/conversations';
import type { Message } from '@/mock/chat';

export function loadChat(): Message[] | null {
  return getCurrentConversation()?.messages ?? null;
}

export function saveChat(messages: Message[]) {
  updateCurrentMessages(messages);
}

export function subscribeChat(listener: () => void) {
  return subscribeConversations(listener);
}
