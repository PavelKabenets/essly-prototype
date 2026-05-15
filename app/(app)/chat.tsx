import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MenuDrawer } from '@/components/chat/MenuDrawer';
import { TypingBubble } from '@/components/chat/TypingBubble';
import { VoiceOverlay } from '@/components/chat/VoiceOverlay';
import { useCheckInTrigger } from '@/hooks/useCheckInTrigger';
import { useCurrentConversation } from '@/hooks/useConversations';
import { useRitualScheduler } from '@/hooks/useRitualScheduler';
import { recordUserEvent } from '@/lib/behaviorTracker';
import {
  getCurrentConversation,
  setCurrentConversation,
  startNewConversation,
  updateCurrentMessages,
} from '@/lib/conversations';
import { pickAiReply, resetAiReplies, type Message } from '@/mock/chat';

let nextId = 1;
const genId = () => `${Date.now()}-${nextId++}`;

const REPLY_DELAY_MS = 1100;
const HIGHLIGHT_MS = 2400;

export default function Chat() {
  const params = useLocalSearchParams<{ convId?: string; messageId?: string }>();
  const conversation = useCurrentConversation();
  const messages = conversation?.messages ?? [];

  const [typing, setTyping] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const messageOffsets = useRef<Record<string, number>>({});
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Route deep-link: ?convId=…&messageId=…  → switch conversation + highlight
  useEffect(() => {
    if (params.convId) {
      setCurrentConversation(params.convId);
    }
  }, [params.convId]);

  // Helper to push messages into the current conversation.
  // Reads fresh state from the store on every call so callback identity stays stable.
  const writeMessages = useCallback(
    (mutator: (prev: Message[]) => Message[]) => {
      const current = getCurrentConversation()?.messages ?? [];
      const next = mutator(current);
      updateCurrentMessages(next);
    },
    [],
  );

  const injectAiMessage = useCallback(
    (text: string) => {
      writeMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.from === 'ai' && last.text === text) return prev;
        return [...prev, { id: genId(), from: 'ai', text }];
      });
    },
    [writeMessages],
  );

  useRitualScheduler(injectAiMessage);
  useCheckInTrigger(injectAiMessage);

  const sendUserMessage = useCallback(
    (text: string) => {
      recordUserEvent(text);
      writeMessages((prev) => [...prev, { id: genId(), from: 'user', text }]);
      setTyping(true);
      if (replyTimer.current) clearTimeout(replyTimer.current);
      replyTimer.current = setTimeout(() => {
        setTyping(false);
        writeMessages((prev) => [
          ...prev,
          { id: genId(), from: 'ai', text: pickAiReply(text) },
        ]);
      }, REPLY_DELAY_MS);
    },
    [writeMessages],
  );

  // Clean up reply timer on unmount
  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(t);
  }, [messages.length, typing]);

  // Deep-link highlight: scroll to + briefly highlight the matched message
  useEffect(() => {
    if (!params.messageId) return;
    const id = params.messageId;
    // Wait a tick for layout to settle
    const timer = setTimeout(() => {
      const y = messageOffsets.current[id];
      if (typeof y === 'number') {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 80), animated: true });
      }
      setHighlightedId(id);
      setTimeout(() => setHighlightedId(null), HIGHLIGHT_MS);
    }, 400);
    return () => clearTimeout(timer);
  }, [params.messageId, conversation?.id]);

  const handleNewChat = useCallback(() => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setTyping(false);
    resetAiReplies();
    startNewConversation();
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setTyping(false);
    resetAiReplies();
    setCurrentConversation(id);
  }, []);

  return (
    <View style={styles.root}>
      <ChatHeader
        onMenuPress={() => setMenuOpen(true)}
        onAvatarPress={() => router.push('/(app)/settings')}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              onLayout={(e) => {
                messageOffsets.current[m.id] = e.nativeEvent.layout.y;
              }}
            >
              <ChatBubble
                text={m.text}
                from={m.from}
                highlighted={m.id === highlightedId}
              />
            </View>
          ))}
          {typing && <TypingBubble />}
        </ScrollView>

        <ChatComposer
          onSend={sendUserMessage}
          onVoicePress={() => setVoiceOpen(true)}
        />
      </KeyboardAvoidingView>

      {voiceOpen && (
        <VoiceOverlay
          onCancel={() => setVoiceOpen(false)}
          onComplete={(transcript) => {
            setVoiceOpen(false);
            sendUserMessage(transcript);
          }}
        />
      )}

      <MenuDrawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSelect={handleSelectConversation}
        onNew={handleNewChat}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 8,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
});
