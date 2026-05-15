import { router } from 'expo-router';
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
import { useRitualScheduler } from '@/hooks/useRitualScheduler';
import { recordUserEvent } from '@/lib/behaviorTracker';
import { loadChat, saveChat } from '@/lib/chatStore';
import {
  AI_WELCOME,
  PAST_CONVERSATIONS,
  pickAiReply,
  resetAiReplies,
  type Message,
} from '@/mock/chat';

let nextId = 1;
const genId = () => `${Date.now()}-${nextId++}`;

const REPLY_DELAY_MS = 1100;

export default function Chat() {
  // Load persisted chat on mount; fall back to welcome message.
  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = loadChat();
    return stored && stored.length > 0 ? stored : [AI_WELCOME];
  });
  const [typing, setTyping] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save chat whenever it changes
  useEffect(() => {
    saveChat(messages);
  }, [messages]);

  // Scroll to bottom on new message / typing change
  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(t);
  }, [messages.length, typing]);

  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  // Helper used by both schedulers to push an AI message into the chat.
  const injectAiMessage = useCallback((text: string) => {
    setMessages((prev) => {
      // De-dupe consecutive identical AI deliveries (e.g. sample preview)
      const last = prev[prev.length - 1];
      if (last && last.from === 'ai' && last.text === text) return prev;
      return [...prev, { id: genId(), from: 'ai', text }];
    });
  }, []);

  // Deliver scheduled rituals (Morning Alignment, Evening Wind Down).
  useRitualScheduler(injectAiMessage);
  // Deliver behavioral mindfulness check-ins.
  useCheckInTrigger(injectAiMessage);

  const sendUserMessage = useCallback((text: string) => {
    recordUserEvent(text);
    setMessages((prev) => [...prev, { id: genId(), from: 'user', text }]);
    setTyping(true);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: genId(), from: 'ai', text: pickAiReply(text) },
      ]);
    }, REPLY_DELAY_MS);
  }, []);

  const startNewChat = useCallback(() => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setTyping(false);
    resetAiReplies();
    setMessages([AI_WELCOME]);
  }, []);

  const loadConversation = useCallback((id: string) => {
    const convo = PAST_CONVERSATIONS.find((c) => c.id === id);
    if (!convo) return;
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setTyping(false);
    resetAiReplies();
    setMessages(convo.messages);
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
            <ChatBubble key={m.id} text={m.text} from={m.from} />
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
        onSelect={loadConversation}
        onNew={startNewChat}
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
