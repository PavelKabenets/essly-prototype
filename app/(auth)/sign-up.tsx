import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AuthScreen } from '@/components/AuthScreen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { colors, spacing, typography } from '@/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  const emailValid = EMAIL_RE.test(email.trim());
  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    emailValid &&
    password.length >= 8;

  const onSubmit = () => {
    if (!emailValid) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    router.push({
      pathname: '/(auth)/verify-email',
      params: { email: email.trim() },
    });
  };

  return (
    <AuthScreen
      title="Create your account"
      subtitle="A space to talk to yourself, gently."
      footer={
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text
            style={styles.link}
            onPress={() => router.replace('/(auth)/sign-in')}
          >
            Sign in
          </Text>
        </Text>
      }
    >
      <View style={styles.row}>
        <View style={styles.flex}>
          <TextField
            label="First name"
            placeholder="Alex"
            autoCapitalize="words"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        <View style={styles.flex}>
          <TextField
            label="Last name"
            placeholder="Doe"
            autoCapitalize="words"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
      </View>

      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="you@example.com"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (emailError) setEmailError(undefined);
        }}
        error={emailError}
      />

      <TextField
        label="Password"
        secureTextEntry={!showPass}
        textContentType="newPassword"
        placeholder="At least 8 characters"
        value={password}
        onChangeText={setPassword}
        trailing={
          <Ionicons
            name={showPass ? 'eye-off' : 'eye'}
            size={18}
            color={colors.textSecondary}
          />
        }
        onPressTrailing={() => setShowPass((s) => !s)}
      />

      <Button label="Create account" onPress={onSubmit} disabled={!canSubmit} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: { flex: 1 },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  link: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
});
