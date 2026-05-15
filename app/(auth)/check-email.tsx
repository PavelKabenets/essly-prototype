import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AuthScreen } from '@/components/AuthScreen';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing, typography } from '@/theme';

export default function CheckEmail() {
  return (
    <AuthScreen
      title="Check your email"
      subtitle="We've sent a reset link. Tap it to set a new password."
      footer={
        <Text style={styles.resend}>
          {`Didn't get an email? `}<Text style={styles.link}>Resend</Text>
        </Text>
      }
    >
      <View style={styles.iconBox}>
        <Ionicons name="mail-outline" size={36} color={colors.accent} />
      </View>
      <Button
        label="I've set a new password"
        onPress={() => router.push('/(auth)/reset-password')}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    backgroundColor: 'rgba(255,27,107,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
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
