import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AmbientGlow } from '@/components/AmbientGlow';
import { StarLogo } from '@/components/ui/StarLogo';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { colors, spacing, typography } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showLogo?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthScreen({
  title,
  subtitle,
  showBack = true,
  showLogo = true,
  children,
  footer,
}: Props) {
  const insets = useScreenInsets();
  return (
    <View style={styles.root}>
      <AmbientGlow intensity="low" position="bottom" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + spacing.md,
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar with back button only */}
          <View style={styles.topBar}>
            {showBack ? (
              <Pressable
                onPress={() =>
                  router.canGoBack() ? router.back() : router.replace('/(auth)/sign-in')
                }
                accessibilityLabel="Go back"
                hitSlop={12}
                style={({ pressed }) => [
                  styles.backBtn,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </Pressable>
            ) : (
              <View style={styles.backBtn} />
            )}
          </View>

          {/* Header: small logo mark + title + subtitle */}
          <View style={styles.header}>
            {showLogo && (
              <View style={styles.logoWrap}>
                <StarLogo size={56} glow />
              </View>
            )}
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          <View style={styles.body}>{children}</View>

          {footer && <View style={styles.footer}>{footer}</View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  logoWrap: {
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  body: {
    gap: spacing.lg,
  },
  footer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
});
