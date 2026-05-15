import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  length?: number;
  value: string;
  onChange: (next: string) => void;
};

export function OtpInput({ length = 6, value, onChange }: Props) {
  const inputRef = useRef<TextInput | null>(null);
  const [focused, setFocused] = useState(false);

  const focus = () => inputRef.current?.focus();
  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, length);
    onChange(digits);
  };

  return (
    <Pressable onPress={focus} style={styles.wrap}>
      <View style={styles.row} pointerEvents="none">
        {Array.from({ length }).map((_, i) => {
          const char = value[i] ?? '';
          const isActive = focused && i === value.length;
          return (
            <View
              key={i}
              style={[
                styles.cell,
                {
                  borderColor: isActive
                    ? colors.borderAccent
                    : colors.borderStrong,
                },
              ]}
            >
              <Text style={styles.cellText}>{char}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus
        style={styles.hidden}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  cell: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.surfaceGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    ...typography.h3,
    color: colors.text,
  },
  hidden: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
    pointerEvents: 'none',
  },
});
