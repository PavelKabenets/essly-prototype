import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AuthScreen } from '@/components/AuthScreen';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing } from '@/theme';

export default function PasswordResetDone() {
  return (
    <AuthScreen
      title="Password reset"
      subtitle="Your password was updated. You can sign in now."
      showBack={false}
    >
      <View style={styles.iconBox}>
        <Ionicons name="checkmark" size={42} color={colors.text} />
      </View>
      <Button label="Back to sign in" onPress={() => router.replace('/(auth)/sign-in')} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,27,107,0.20)',
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
});
