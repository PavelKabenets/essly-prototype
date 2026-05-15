import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppleAuthSheet } from '@/components/auth/AppleAuthSheet';
import { BiometricPrompt } from '@/components/auth/BiometricPrompt';
import { GoogleAuthSheet } from '@/components/auth/GoogleAuthSheet';
import { AuthScreen } from '@/components/AuthScreen';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { SocialButton } from '@/components/ui/SocialButton';
import { TextField } from '@/components/ui/TextField';
import { useAuthPrefs } from '@/hooks/useAuthPrefs';
import { useOSDetect } from '@/hooks/useOSDetect';
import { colors, spacing, typography } from '@/theme';

const DEMO_EMAIL = 'demo@essly.app';
const DEMO_PASS = 'demo123';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [appleOpen, setAppleOpen] = useState(false);
  const [bioOpen, setBioOpen] = useState(false);
  const prefs = useAuthPrefs();
  const { biometricLabel, biometricIcon } = useOSDetect();

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const onSubmit = () => {
    setError(null);
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASS) {
      router.replace('/(onboarding)/splash');
      return;
    }
    setError('Incorrect email or password.');
  };

  const onOAuthSuccess = (existingUser: boolean) => {
    if (existingUser) {
      // Existing account → straight to AI chat (resume previous session)
      router.replace('/(app)/chat');
    } else {
      // New account → onboarding flow → chat
      router.replace('/(onboarding)/splash');
    }
  };

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to continue your journey."
      showBack={false}
      footer={
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {`Don't have an account? `}
            <Text
              style={styles.link}
              onPress={() => router.push('/(auth)/sign-up')}
            >
              Sign up
            </Text>
          </Text>
          <Text style={styles.hint}>
            Demo: {DEMO_EMAIL} / {DEMO_PASS}
          </Text>
        </View>
      }
    >
      {prefs.biometric && (
        <>
          <Pressable
            onPress={() => setBioOpen(true)}
            accessibilityLabel={`Sign in with ${biometricLabel}`}
            style={({ pressed }) => [
              styles.bioBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name={biometricIcon} size={20} color={colors.text} />
            <Text style={styles.bioLabel}>Sign in with {biometricLabel}</Text>
          </Pressable>
          <View style={styles.dividerWrap}>
            <Divider label="or use password" />
          </View>
        </>
      )}

      <TextField
        label="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="you@example.com"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (error) setError(null);
        }}
      />
      <TextField
        label="Password"
        secureTextEntry={!showPass}
        autoComplete="password"
        textContentType="password"
        placeholder="••••••••"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          if (error) setError(null);
        }}
        trailing={
          <Ionicons
            name={showPass ? 'eye-off' : 'eye'}
            size={18}
            color={colors.textSecondary}
          />
        }
        onPressTrailing={() => setShowPass((s) => !s)}
        error={error ?? undefined}
      />

      <Pressable
        onPress={() => router.push('/(auth)/forgot-password')}
        style={styles.forgotRow}
        accessibilityRole="link"
      >
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>

      <Button
        label="Sign In"
        onPress={onSubmit}
        disabled={!canSubmit}
      />

      <View style={styles.dividerWrap}>
        <Divider label="or" />
      </View>

      <View style={styles.socials}>
        <SocialButton provider="google" onPress={() => setGoogleOpen(true)} />
        <SocialButton provider="apple" onPress={() => setAppleOpen(true)} />
      </View>

      <GoogleAuthSheet
        visible={googleOpen}
        onClose={() => setGoogleOpen(false)}
        onAuthenticated={(existing) => {
          setGoogleOpen(false);
          onOAuthSuccess(existing);
        }}
      />
      <AppleAuthSheet
        visible={appleOpen}
        onClose={() => setAppleOpen(false)}
        onAuthenticated={(existing) => {
          setAppleOpen(false);
          onOAuthSuccess(existing);
        }}
      />
      <BiometricPrompt
        visible={bioOpen}
        onCancel={() => setBioOpen(false)}
        onSuccess={() => {
          setBioOpen(false);
          // Biometric users go straight to chat (resume session)
          router.replace('/(app)/chat');
        }}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -spacing.sm,
  },
  link: {
    ...typography.bodySm,
    color: colors.accent,
    fontWeight: '600',
  },
  dividerWrap: {
    marginVertical: spacing.md,
  },
  socials: {
    gap: spacing.md,
  },
  footer: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  bioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    backgroundColor: 'rgba(235,59,118,0.10)',
  },
  bioLabel: {
    ...typography.button,
    color: colors.text,
  },
});
