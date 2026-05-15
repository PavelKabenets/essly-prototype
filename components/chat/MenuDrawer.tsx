import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StarLogo } from '@/components/ui/StarLogo';
import { useConversations } from '@/hooks/useConversations';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { getCurrentConversationId } from '@/lib/conversations';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (id: string) => void;
  onNew?: () => void;
};

function previewOf(messages: { text: string; from: string }[]): string {
  // Pick the most recent USER message as preview, else the latest AI line.
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].from === 'user') return messages[i].text;
  }
  return messages[messages.length - 1]?.text ?? '';
}

function formatWhen(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m`;
  if (diff < day) return `${Math.floor(diff / hour)}h`;
  if (diff < 2 * day) return 'Yesterday';
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function MenuDrawer({ visible, onClose, onSelect, onNew }: Props) {
  const insets = useScreenInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const conversations = useConversations();
  const currentId = getCurrentConversationId();

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(slide, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else if (mounted) {
      Animated.timing(slide, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, mounted, slide]);

  if (!mounted) return null;

  const translateX = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [-360, 0],
  });
  const backdropOpacity = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View
      style={StyleSheet.absoluteFillObject}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents="auto"
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityLabel="Close menu"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          {
            transform: [{ translateX }],
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <StarLogo size={28} glow={false} />
          <Text style={styles.title}>Chat history</Text>
          <Pressable
            hitSlop={12}
            onPress={() => {
              onClose();
              router.push('/(app)/search');
            }}
            accessibilityLabel="Search chat history"
            style={styles.headerBtn}
          >
            <Ionicons name="search" size={20} color={colors.text} />
          </Pressable>
          <Pressable
            hitSlop={12}
            onPress={onClose}
            accessibilityLabel="Close menu"
            style={styles.headerBtn}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <Pressable
          style={styles.newChat}
          onPress={() => {
            onNew?.();
            onClose();
          }}
          accessibilityLabel="Start a new conversation"
        >
          <Ionicons name="add" size={18} color={colors.text} />
          <Text style={styles.newChatLabel}>New conversation</Text>
        </Pressable>

        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing.xxxl }}
          showsVerticalScrollIndicator={false}
        >
          {conversations.map((c) => {
            const isCurrent = c.id === currentId;
            return (
              <Pressable
                key={c.id}
                style={({ pressed }) => [
                  styles.item,
                  isCurrent && styles.itemActive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  onSelect?.(c.id);
                  onClose();
                }}
              >
                <View style={styles.itemRowTop}>
                  <Text numberOfLines={1} style={styles.itemTitle}>
                    {c.title}
                  </Text>
                  <Text style={styles.itemWhen}>{formatWhen(c.updatedAt)}</Text>
                </View>
                <Text numberOfLines={1} style={styles.itemPreview}>
                  {previewOf(c.messages)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '82%',
    backgroundColor: '#0A0A0C',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    backgroundColor: 'rgba(235,59,118,0.08)',
    marginBottom: spacing.md,
  },
  newChatLabel: {
    ...typography.button,
    color: colors.text,
  },
  item: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  itemActive: {
    borderColor: colors.borderAccent,
    backgroundColor: 'rgba(235,59,118,0.10)',
  },
  itemRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.sm,
  },
  itemWhen: {
    ...typography.caption,
    color: colors.textMuted,
  },
  itemPreview: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
});
