import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export function Divider({ label }: { label?: string }) {
  if (!label) return <View style={styles.line} />;
  return (
    <View style={styles.row}>
      <View style={styles.lineFlex} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.lineFlex} />
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: colors.border,
  },
  lineFlex: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
