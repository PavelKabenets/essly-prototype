import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { colors, spacing, typography } from '@/theme';

type Props = {
  title: string;
  onBack?: () => void;
  hideBack?: boolean;
};

export function ScreenHeader({ title, onBack, hideBack }: Props) {
  const insets = useScreenInsets();
  return (
    <View style={[styles.row, { paddingTop: insets.top + spacing.sm }]}>
      {hideBack ? (
        <View style={styles.btn} />
      ) : (
        <Pressable
          onPress={onBack ?? (() => (router.canGoBack() ? router.back() : null))}
          accessibilityLabel="Go back"
          hitSlop={12}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  btn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
});
