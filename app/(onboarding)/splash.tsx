import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { StarLogo } from '@/components/ui/StarLogo';
import { colors, spacing, typography } from '@/theme';

const SPLASH_MS = 3700;

export default function Splash() {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const advanced = useRef(false);

  const advance = () => {
    if (advanced.current) return;
    advanced.current = true;
    router.replace('/(onboarding)/welcome');
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    const t = setTimeout(advance, SPLASH_MS);
    return () => clearTimeout(t);
  }, [scale, opacity]);

  return (
    <Pressable style={styles.root} onPress={advance} accessibilityLabel="Skip splash">
      {/* Soft radial pink glow behind the star — no hard edges */}
      <View style={styles.glowWrap} pointerEvents="none">
        <View style={styles.glow} />
      </View>

      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <StarLogo size={120} />
      </Animated.View>
      <View style={styles.wordmarkWrap}>
        <Animated.Text style={[styles.wordmark, { opacity }]}>
          Eesly
        </Animated.Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  glowWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 460,
    height: 460,
    borderRadius: 9999,
    backgroundColor: '#EB3B76',
    opacity: 0.35,
    ...(Platform.OS === 'web'
      ? ({ filter: 'blur(110px)' } as any)
      : { opacity: 0.2 }),
  },
  wordmarkWrap: {
    alignItems: 'center',
  },
  wordmark: {
    ...typography.h2,
    color: colors.text,
    letterSpacing: 4,
  },
});
