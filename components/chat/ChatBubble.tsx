import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors, gradients, radius, spacing, typography } from '@/theme';

type Props = {
  text: string;
  from: 'user' | 'ai';
  highlighted?: boolean;
};

export function ChatBubble({ text, from, highlighted }: Props) {
  const isUser = from === 'user';
  return (
    <View style={[styles.row, isUser ? styles.alignRight : styles.alignLeft]}>
      <View style={[styles.bubbleOuter, highlighted && styles.bubbleHighlighted]}>
        <LinearGradient
          colors={gradients.bubble}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bubble}
        >
          <Text style={styles.text}>{text}</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
  },
  alignRight: { justifyContent: 'flex-end' },
  alignLeft: { justifyContent: 'flex-start' },
  bubbleOuter: {
    maxWidth: '85%',
    borderRadius: radius.bubble,
    overflow: 'hidden',
  },
  bubbleHighlighted: {
    borderWidth: 2,
    borderColor: colors.pink,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 0 24px rgba(235,59,118,0.6)' } as any)
      : {}),
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 34,
    justifyContent: 'center',
  },
  text: {
    ...typography.body,
    color: colors.textBubble,
  },
});
