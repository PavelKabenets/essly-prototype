import { router } from 'expo-router';
import { useState } from 'react';
import { AuthScreen } from '@/components/AuthScreen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const valid = /\S+@\S+\.\S+/.test(email.trim());

  return (
    <AuthScreen
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset link."
    >
      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
      />
      <Button
        label="Send reset link"
        onPress={() => router.push('/(auth)/check-email')}
        disabled={!valid}
      />
    </AuthScreen>
  );
}
