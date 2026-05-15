import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { colors, gradients, radius, spacing } from '@/theme';

// Animated 3-dot "AI is typing" bubble that mimics ChatBubble styling.
export function TypingBubble() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const make = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      );
    const anims = dots.map((d, i) => make(d, i * 140));
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.row, styles.alignLeft]}>
      <View style={styles.outer}>
        <LinearGradient
          colors={gradients.bubble}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bubble}
        >
          {dots.map((d, i) => {
            const opacity = d.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
            const translateY = d.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { opacity, transform: [{ translateY }] }]}
              />
            );
          })}
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
  },
  alignLeft: { justifyContent: 'flex-start' },
  outer: {
    borderRadius: radius.bubble,
    overflow: 'hidden',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 34,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textBubble,
  },
});
