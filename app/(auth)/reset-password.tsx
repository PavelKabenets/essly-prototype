import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { AuthScreen } from '@/components/AuthScreen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/theme';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);

  const valid = password.length >= 8 && password === confirm;

  return (
    <AuthScreen title="Set a new password" subtitle="Choose something memorable.">
      <TextField
        label="New password"
        secureTextEntry={!showPass}
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
      <TextField
        label="Confirm new password"
        secureTextEntry={!showPass}
        placeholder="Re-enter password"
        value={confirm}
        onChangeText={setConfirm}
      />
      <Button
        label="Reset password"
        onPress={() => router.replace('/(auth)/password-reset-done')}
        disabled={!valid}
      />
    </AuthScreen>
  );
}
