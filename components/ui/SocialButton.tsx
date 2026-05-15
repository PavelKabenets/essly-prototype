import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

type Provider = 'google' | 'apple';

type Props = {
  provider: Provider;
  onPress?: () => void;
};

export function SocialButton({ provider, onPress }: Props) {
  const label =
    provider === 'google' ? 'Continue with Google' : 'Continue with Apple';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.row}>
        <Ionicons
          name={provider === 'google' ? 'logo-google' : 'logo-apple'}
          size={18}
          color={colors.text}
        />
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceGlass,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    ...typography.button,
    color: colors.text,
  },
});
