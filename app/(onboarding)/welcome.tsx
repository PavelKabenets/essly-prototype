import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { AmbientGlow } from '@/components/AmbientGlow';
import { Button } from '@/components/ui/Button';
import { StarLogo } from '@/components/ui/StarLogo';
import { colors, spacing, typography } from '@/theme';

type Slide = {
  greeting: string;
  language: string;
  caption: string;
};

const SLIDES: Slide[] = [
  { greeting: 'Hello', language: 'English', caption: 'A quiet space to think out loud.' },
  { greeting: 'Hola', language: 'Spanish', caption: 'Whenever you want, however you want.' },
  { greeting: 'Bonjour', language: 'French', caption: 'No judgement, no pressure.' },
  { greeting: 'Привіт', language: 'Ukrainian', caption: 'You set the pace.' },
  { greeting: 'Olá', language: 'Portuguese', caption: "Let's begin." },
];

export default function Welcome() {
  const insets = useScreenInsets();
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [index, fade]);

  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  const next = () => {
    if (isLast) {
      router.replace('/(app)/chat');
    } else {
      setIndex((i) => i + 1);
    }
  };

  const skip = () => router.replace('/(app)/chat');

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <AmbientGlow intensity="medium" position="bottom" />

      <View style={styles.topRow}>
        {!isLast ? (
          <Pressable onPress={skip} hitSlop={12} accessibilityLabel="Skip onboarding">
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      <View style={styles.center}>
        <StarLogo size={64} />
        <Animated.View style={[styles.textBlock, { opacity: fade }]}>
          <Text style={styles.greeting}>{slide.greeting}</Text>
          <Text style={styles.language}>{slide.language}</Text>
          <Text style={styles.caption}>{slide.caption}</Text>
        </Animated.View>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
        <Button label={isLast ? 'Get started' : 'Next'} onPress={next} />
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    minHeight: 32,
  },
  skip: {
    ...typography.bodySm,
    color: colors.textSecondary,
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
  },
  greeting: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '300',
    color: colors.text,
    letterSpacing: 1,
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
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  bottom: {
    gap: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.accent,
  },
});
