import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AuthScreen } from '@/components/AuthScreen';
import { Button } from '@/components/ui/Button';
import { OtpInput } from '@/components/ui/OtpInput';
import { colors, typography } from '@/theme';

export default function VerifyEmail() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const onVerify = () => {
    setVerifying(true);
    // Brief "creating account" pause for realism, then proceed to onboarding
    setTimeout(() => {
      router.replace('/(onboarding)/splash');
    }, 700);
  };

  const subtitle = params.email
    ? `We sent a 6-digit code to ${params.email}. Enter it to confirm your email.`
    : 'We sent a 6-digit code. Enter it to continue.';

  return (
    <AuthScreen
      title="Verify your email"
      subtitle={subtitle}
      footer={
        <Text style={styles.resend}>
          {`Didn't get a code? `}
          <Text style={styles.link}>Resend</Text>
        </Text>
      }
    >
      <OtpInput value={code} onChange={setCode} />
      <Button
        label={verifying ? 'Creating your account…' : 'Verify'}
        onPress={onVerify}
        disabled={code.length < 6}
        loading={verifying}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  resend: {
    ...typography.body,
    color: colors.textSecondary,
  },
  link: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
});
