import { LinearGradient } from 'expo-linear-gradient';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { radius } from '@/theme';

type Props = {
  size?: number;
  width?: number;
  height?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
};

// iOS "liquid glass" button — dark translucent fill with backdrop-blur on web,
// subtle top/bottom shine, and a hairline rim. Matches the chat-header /
// composer buttons from the Figma file.
export function GlassyButton({
  size,
  width,
  height,
  onPress,
  accessibilityLabel,
  children,
  style,
}: Props) {
  const w = width ?? size ?? 44;
  const h = height ?? size ?? 44;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        { width: w, height: h, opacity: pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <View style={[styles.base, { width: w, height: h }]}>
        {/* Dark translucent base */}
        <View style={[StyleSheet.absoluteFillObject, styles.glass]} />

        {/* Subtle top→bottom shine highlight */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.18)',
            'rgba(255,255,255,0.04)',
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.06)',
          ]}
          locations={[0, 0.35, 0.65, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFillObject, styles.shine]}
          pointerEvents="none"
        />

        {/* Hairline inner border (rim light) */}
        <View
          style={[StyleSheet.absoluteFillObject, styles.rim]}
          pointerEvents="none"
        />

        {/* Content centered on top */}
        <View style={styles.content}>{children}</View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    borderRadius: radius.pill,
    backgroundColor: 'rgba(20, 22, 32, 0.55)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        } as any)
      : {}),
  },
  shine: {
    borderRadius: radius.pill,
  },
  rim: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
