import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AmbientGlow } from '@/components/AmbientGlow';
import { Button } from '@/components/ui/Button';
import { StarLogo } from '@/components/ui/StarLogo';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { colors, spacing, typography } from '@/theme';

type Slide = { greeting: string; language: string };

const SLIDES: Slide[] = [
  { greeting: 'Hello', language: 'English' },
  { greeting: 'Hola', language: 'Spanish' },
  { greeting: 'Bonjour', language: 'French' },
  { greeting: 'Привіт', language: 'Ukrainian' },
  { greeting: 'Olá', language: 'Portuguese' },
  { greeting: 'こんにちは', language: 'Japanese' },
  { greeting: 'مرحبا', language: 'Arabic' },
  { greeting: 'Hallo', language: 'German' },
];

const CYCLE_MS = 1800;
const FADE_MS = 380;

export default function Welcome() {
  const insets = useScreenInsets();
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;

  // Auto-cycle the greeting word.
  useEffect(() => {
    let cancelled = false;
    let activeIndex = 0;

    const showCurrent = () => {
      fade.setValue(0);
      Animated.timing(fade, {
        toValue: 1,
        duration: FADE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    };

    const advance = () => {
      if (cancelled) return;
      Animated.timing(fade, {
        toValue: 0,
        duration: FADE_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: Platform.OS !== 'web',
      }).start(({ finished }) => {
        if (!finished || cancelled) return;
        activeIndex = (activeIndex + 1) % SLIDES.length;
        setIndex(activeIndex);
        showCurrent();
      });
    };

    showCurrent();
    const id = setInterval(advance, CYCLE_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [fade]);

  const slide = SLIDES[index];

  const proceed = () => router.replace('/(app)/chat');

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl }]}>
      <AmbientGlow intensity="low" position="bottom" />

      <View style={styles.center}>
        <StarLogo size={72} glow />
        <Animated.View style={[styles.textBlock, { opacity: fade }]}>
          <Text style={styles.greeting} numberOfLines={1} adjustsFontSizeToFit>
            {slide.greeting}
          </Text>
          <Text style={styles.language}>{slide.language}</Text>
        </Animated.View>
        <Text style={styles.caption}>
          A quiet space to think out loud, in whatever language feels closest.
        </Text>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button label="Get started" onPress={proceed} />
        <Pressable onPress={proceed} hitSlop={12} style={styles.skip}>
          <Text style={styles.skipLabel}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 110,
    justifyContent: 'center',
  },
  greeting: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 56,
    lineHeight: 64,
    color: colors.text,
    letterSpacing: 1,
    textAlign: 'center',
  },
  language: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  caption: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    maxWidth: 340,
  },
  bottom: {
    gap: spacing.md,
  },
  skip: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  skipLabel: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
});
