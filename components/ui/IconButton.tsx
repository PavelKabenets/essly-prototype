import { Image, Pressable, type ImageSourcePropType, type ViewStyle } from 'react-native';

type Props = {
  source: ImageSourcePropType;
  width: number;
  height: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

// Renders a Figma-exported PNG button asset (button bg + icon baked in).
export function IconButton({
  source,
  width,
  height,
  onPress,
  accessibilityLabel,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [{ width, height, opacity: pressed ? 0.85 : 1 }, style]}
    >
      <Image
        source={source}
        style={{ width, height }}
        resizeMode="contain"
      />
    </Pressable>
  );
}
