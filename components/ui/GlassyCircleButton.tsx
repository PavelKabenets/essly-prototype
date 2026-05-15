import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, radius, typography } from '@/theme';

type Props = {
  size?: number;
  onPress?: () => void;
  children?: React.ReactNode;
  label?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
  active?: boolean;
};

export function GlassyCircleButton({
  size = 44,
  onPress,
  children,
  label,
  accessibilityLabel,
  style,
  active = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: radius.pill,
          opacity: pressed ? 0.7 : 1,
          borderColor: active ? colors.borderAccent : colors.borderStrong,
        },
        style,
      ]}
    >
      <View style={styles.inner}>
        {children}
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.label,
    color: colors.text,
    fontWeight: '600',
  },
});
