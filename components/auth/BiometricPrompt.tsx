import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useOSDetect } from '@/hooks/useOSDetect';
import { colors, spacing, typography } from '@/theme';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
};

const AUTO_SUCCESS_MS = 1600;

export function BiometricPrompt({ visible, onCancel, onSuccess }: Props) {
  const { biometricLabel, biometricIcon } = useOSDetect();
  const pulse = useRef(new Animated.Value(0)).current;
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!visible) return;
    finishedRef.current = false;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    loop.start();
    const t = setTimeout(() => {
      if (!finishedRef.current) {
        finishedRef.current = true;
        loop.stop();
        onSuccess();
      }
    }, AUTO_SUCCESS_MS);
    return () => {
      loop.stop();
      clearTimeout(t);
    };
  }, [visible, pulse, onSuccess]);

  if (!visible) return null;

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  return (
    <View style={styles.overlay}>
      <View style={styles.backdrop} />
      <View style={styles.panel}>
        <Animated.View style={[styles.icon, { transform: [{ scale }], opacity }]}>
          <Ionicons name={biometricIcon} size={56} color="#FFFFFF" />
        </Animated.View>
        <Text style={styles.title}>Sign in with {biometricLabel}</Text>
        <Text style={styles.sub}>Look at your phone to continue</Text>
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(8px)' } as any)
      : {}),
  },
  panel: {
    width: '80%',
    backgroundColor: '#1C1C1E',
    borderRadius: 22,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sub: {
    ...typography.body,
    color: 'rgba(235,235,245,0.6)',
    textAlign: 'center',
  },
  cancel: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  cancelLabel: {
    ...typography.button,
    color: colors.pink,
  },
});
