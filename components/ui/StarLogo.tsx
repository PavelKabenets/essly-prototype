import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

type Props = {
  size?: number;
  glow?: boolean;
  style?: ViewStyle;
};

// The supplied asset is a pink circle on a dark rounded-square background
// (only the 4 corners are transparent). We clip the image to a circle so
// only the round logo shows — no dark square around it.
export function StarLogo({ size = 44, glow = true, style }: Props) {
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
        glow && {
          shadowColor: '#EB3B76',
          shadowOpacity: 0.6,
          shadowRadius: size * 0.4,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
        }}
      >
        <Image
          source={require('@/assets/images/star.png')}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
