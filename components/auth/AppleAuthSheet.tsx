import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AuthSheet } from './AuthSheet';

type Step = 'faceid' | 'share' | 'loading';
type EmailChoice = 'share' | 'hide';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAuthenticated: (existingUser: boolean) => void;
};

const REAL_EMAIL = 'demo@eesly.app';
const RELAY_EMAIL = 'abc123xyz@privaterelay.appleid.com';

export function AppleAuthSheet({ visible, onClose, onAuthenticated }: Props) {
  const [step, setStep] = useState<Step>('faceid');
  const [emailChoice, setEmailChoice] = useState<EmailChoice>('share');
  const faceIdPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStep('faceid');
      setEmailChoice('share');
    }
  }, [visible]);

  // Face ID pulse animation
  useEffect(() => {
    if (step !== 'faceid') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(faceIdPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(faceIdPulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    loop.start();
    // Auto-advance after Face ID "success"
    const t = setTimeout(() => {
      loop.stop();
      setStep('share');
    }, 1800);
    return () => {
      loop.stop();
      clearTimeout(t);
    };
  }, [step, faceIdPulse]);

  useEffect(() => {
    if (step !== 'loading') return;
    const t = setTimeout(() => {
      // "Share my email" with real email → existing user → chat
      // "Hide my email" with relay → new user → onboarding
      const existing = emailChoice === 'share';
      onAuthenticated(existing);
    }, 900);
    return () => clearTimeout(t);
  }, [step, emailChoice, onAuthenticated]);

  const scale = faceIdPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });
  const opacity = faceIdPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1],
  });

  return (
    <AuthSheet visible={visible} onClose={onClose}>
      <View style={styles.panel}>
        <View style={styles.handle} />

        {step === 'faceid' && (
          <View style={styles.body}>
            <Ionicons name="logo-apple" size={28} color="#FFFFFF" />
            <Text style={styles.title}>Sign in with Apple</Text>

            <View style={styles.appCard}>
              <Text style={styles.appCardLabel}>Eesly</Text>
              <Text style={styles.appCardSub}>essly-prototype.vercel.app</Text>
            </View>

            <Animated.View style={[styles.faceIdBox, { transform: [{ scale }], opacity }]}>
              <Ionicons name="scan-outline" size={48} color="#FFFFFF" />
            </Animated.View>
            <Text style={styles.faceIdText}>Sign in with Face ID</Text>
          </View>
        )}

        {step === 'share' && (
          <View style={styles.body}>
            <Ionicons name="logo-apple" size={28} color="#FFFFFF" />
            <Text style={styles.title}>Share your email</Text>
            <Text style={styles.subtitle}>
              Eesly will receive your name and email address.
            </Text>

            <View style={styles.optionList}>
              <EmailOption
                selected={emailChoice === 'share'}
                onPress={() => setEmailChoice('share')}
                title="Share My Email"
                detail={REAL_EMAIL}
              />
              <EmailOption
                selected={emailChoice === 'hide'}
                onPress={() => setEmailChoice('hide')}
                title="Hide My Email"
                detail={`Apple will forward to ${RELAY_EMAIL}`}
                badge="Private Relay"
              />
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.btnSecondary,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.btnSecondaryLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => setStep('loading')}
                style={({ pressed }) => [
                  styles.btnPrimary,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.btnPrimaryLabel}>Continue</Text>
              </Pressable>
            </View>
          </View>
        )}

        {step === 'loading' && (
          <View style={[styles.body, styles.loadingBody]}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.subtitle}>Signing you in…</Text>
          </View>
        )}
      </View>
    </AuthSheet>
  );
}

function EmailOption({
  selected,
  onPress,
  title,
  detail,
  badge,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  detail: string;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionRow,
        selected && styles.optionRowSelected,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View
        style={[
          styles.radio,
          selected && styles.radioSelected,
        ]}
      >
        {selected && <View style={styles.radioInner} />}
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.optionTitleRow}>
          <Text style={styles.optionTitle}>{title}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.optionDetail}>{detail}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#1C1C1E',
    paddingBottom: 32,
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(235,235,245,0.6)',
    textAlign: 'center',
    marginBottom: 4,
  },
  appCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 16,
  },
  appCardLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  appCardSub: {
    color: 'rgba(235,235,245,0.6)',
    fontSize: 13,
    marginTop: 2,
  },
  faceIdBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  faceIdText: {
    fontSize: 14,
    color: 'rgba(235,235,245,0.7)',
    marginTop: 12,
  },
  optionList: {
    alignSelf: 'stretch',
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2C2C2E',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionRowSelected: {
    borderColor: '#0A84FF',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(235,235,245,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#0A84FF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0A84FF',
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: 'rgba(10,132,255,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    color: '#0A84FF',
    fontWeight: '600',
  },
  optionDetail: {
    fontSize: 12,
    color: 'rgba(235,235,245,0.6)',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 12,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    alignItems: 'center',
  },
  btnSecondaryLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
  },
  btnPrimaryLabel: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  loadingBody: {
    paddingVertical: 64,
  },
});
