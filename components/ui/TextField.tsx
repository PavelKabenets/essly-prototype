import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  trailing?: React.ReactNode;
  onPressTrailing?: () => void;
};

export function TextField({
  label,
  error,
  trailing,
  onPressTrailing,
  style,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? colors.error
    : focused
      ? colors.borderAccent
      : colors.borderStrong;

  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.fieldRow, { borderColor }]}>
        <TextInput
          {...inputProps}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          placeholderTextColor={colors.textPlaceholder}
          style={[styles.input, style]}
        />
        {trailing &&
          (onPressTrailing ? (
            <Pressable onPress={onPressTrailing} style={styles.trailing}>
              {trailing}
            </Pressable>
          ) : (
            <View style={styles.trailing}>{trailing}</View>
          ))}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceGlass,
    paddingHorizontal: spacing.xl,
    paddingVertical: 2,
    minHeight: 54,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
    ...(typeof window !== 'undefined' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  trailing: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginLeft: spacing.md,
  },
});
