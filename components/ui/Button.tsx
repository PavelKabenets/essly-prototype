import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  fullWidth?: boolean;
  leading?: React.ReactNode;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  fullWidth = true,
  leading,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        style={({ pressed }) => [
          styles.base,
          fullWidth && styles.fullWidth,
          { opacity: isDisabled ? 0.4 : pressed ? 0.85 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={['#FF4A8E', '#FF1B6B', '#C7155A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {leading}
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.primaryLabel}>{label}</Text>
            )}
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        style={({ pressed }) => [
          styles.base,
          styles.secondary,
          fullWidth && styles.fullWidth,
          { opacity: isDisabled ? 0.4 : pressed ? 0.85 : 1 },
          style,
        ]}
      >
        <View style={styles.content}>
          {leading}
          <Text style={styles.secondaryLabel}>{label}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.ghost,
        fullWidth && styles.fullWidth,
        { opacity: isDisabled ? 0.4 : pressed ? 0.7 : 1 },
        style,
      ]}
    >
      <View style={styles.content}>
        {leading}
        <Text style={styles.ghostLabel}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryLabel: {
    ...typography.button,
    color: colors.text,
  },
  secondary: {
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  secondaryLabel: {
    ...typography.button,
    color: colors.text,
  },
  ghost: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  ghostLabel: {
    ...typography.button,
    color: colors.accent,
  },
});
