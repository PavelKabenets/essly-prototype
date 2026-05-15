import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuthPrefs } from '@/hooks/useAuthPrefs';
import { useOSDetect } from '@/hooks/useOSDetect';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { setBiometric } from '@/lib/authPrefs';
import { colors, radius, spacing, typography } from '@/theme';

export default function Security() {
  const insets = useScreenInsets();
  const prefs = useAuthPrefs();
  const { osLabel, biometricLabel, biometricIcon } = useOSDetect();
  const [toast, setToast] = useState<string | null>(null);

  const handleBiometricToggle = (next: boolean) => {
    setBiometric(next);
    setToast(`${biometricLabel} ${next ? 'enabled' : 'disabled'}`);
    setTimeout(() => setToast(null), 1800);
  };

  const handlePasswordToggle = () => {
    setToast('Password is required as fallback and can\'t be disabled.');
    setTimeout(() => setToast(null), 2400);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Security & Authentication" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detectedCard}>
          <View style={styles.detectedTop}>
            <Ionicons name="phone-portrait-outline" size={20} color={colors.pink} />
            <Text style={styles.detectedTitle}>Device detected</Text>
          </View>
          <Text style={styles.detectedSub}>
            {osLabel} · {biometricLabel} available
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SIGN-IN METHODS</Text>
          <View style={styles.sectionBody}>
            <Pressable onPress={handlePasswordToggle} style={styles.row}>
              <Ionicons name="key-outline" size={20} color={colors.textSecondary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Password</Text>
                <Text style={styles.rowSub}>Required as fallback</Text>
              </View>
              <Switch
                value={true}
                onValueChange={handlePasswordToggle}
                trackColor={{ true: colors.pink, false: '#3A3A3C' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#3A3A3C"
                disabled
              />
            </Pressable>

            <View style={styles.row}>
              <Ionicons name={biometricIcon} size={20} color={colors.textSecondary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{biometricLabel}</Text>
                <Text style={styles.rowSub}>
                  Sign in faster without typing your password
                </Text>
              </View>
              <Switch
                value={prefs.biometric}
                onValueChange={handleBiometricToggle}
                trackColor={{ true: colors.pink, false: '#3A3A3C' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#3A3A3C"
              />
            </View>
          </View>
          <Text style={styles.hint}>
            Toggling {biometricLabel} affects future sign-in attempts. Password remains available as a fallback.
          </Text>
        </View>

        {toast && (
          <View style={styles.toast} pointerEvents="none">
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  detectedCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    backgroundColor: 'rgba(235,59,118,0.06)',
    padding: spacing.md,
    gap: spacing.xs,
  },
  detectedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detectedTitle: {
    ...typography.label,
    color: colors.pink,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  detectedSub: {
    ...typography.body,
    color: colors.text,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginLeft: spacing.md,
  },
  sectionBody: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    ...typography.body,
    color: colors.text,
  },
  rowSub: {
    ...typography.caption,
    color: colors.textMuted,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginHorizontal: spacing.md,
  },
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    backgroundColor: 'rgba(20,20,24,0.95)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  toastText: {
    ...typography.bodySm,
    color: colors.text,
    textAlign: 'center',
  },
});
