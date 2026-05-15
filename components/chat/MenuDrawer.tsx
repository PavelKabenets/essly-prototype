import { Ionicons } from '@expo/vector-icons';
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
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { PAST_CONVERSATIONS } from '@/mock/chat';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (id: string) => void;
  onNew?: () => void;
};

export function MenuDrawer({ visible, onClose, onSelect, onNew }: Props) {
  const insets = useScreenInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);

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

  // Nothing in the tree at all when closed — guarantees no click interception.
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
    <View style={StyleSheet.absoluteFillObject} pointerEvents={visible ? 'auto' : 'none'}>
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
          <Text style={styles.title}>Conversations</Text>
          <Pressable
            hitSlop={12}
            onPress={onClose}
            accessibilityLabel="Close menu"
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing.xxxl }}
          showsVerticalScrollIndicator={false}
        >
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

          {PAST_CONVERSATIONS.map((c) => (
            <Pressable
              key={c.id}
              style={({ pressed }) => [
                styles.item,
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
                <Text style={styles.itemWhen}>{c.when}</Text>
              </View>
              <Text numberOfLines={1} style={styles.itemPreview}>
                {c.preview}
              </Text>
            </Pressable>
          ))}
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
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  closeBtn: {
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
