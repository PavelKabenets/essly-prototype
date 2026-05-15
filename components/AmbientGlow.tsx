import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewStyle } from 'react-native';

type Props = {
  intensity?: 'low' | 'medium' | 'high';
  position?: 'bottom' | 'top' | 'center';
  style?: ViewStyle;
};

// Brand pink #EB3B76 — fades to transparent.
// For position='bottom': most opaque at bottom, transparent at top (matches Figma voice glow).
const intensityMap = {
  low: {
    inner: 'rgba(235,59,118,0.10)',
    mid: 'rgba(235,59,118,0.04)',
    outer: 'rgba(235,59,118,0)',
  },
  medium: {
    inner: 'rgba(235,59,118,0.22)',
    mid: 'rgba(235,59,118,0.08)',
    outer: 'rgba(235,59,118,0)',
  },
  high: {
    inner: 'rgba(235,59,118,0.45)',
    mid: 'rgba(235,59,118,0.18)',
    outer: 'rgba(235,59,118,0)',
  },
};

export function AmbientGlow({
  intensity = 'low',
  position = 'bottom',
  style,
}: Props) {
  const c = intensityMap[intensity];

  // 5-stop gradient for a smooth, soft fade with no hard line at the edge.
  const stops = [c.outer, c.outer, c.mid, c.inner, c.inner] as const;
  const locations = [0, 0.15, 0.55, 0.9, 1] as const;

  const start =
    position === 'top'
      ? { x: 0.5, y: 1 }
      : { x: 0.5, y: 0 };
  const end =
    position === 'top'
      ? { x: 0.5, y: 0 }
      : { x: 0.5, y: 1 };

  return (
    <View pointerEvents="none" style={[styles.layer, getPosStyle(position), style]}>
      <LinearGradient
        colors={stops}
        locations={locations}
        style={StyleSheet.absoluteFillObject}
        start={start}
        end={end}
      />
    </View>
  );
}

function getPosStyle(position: 'bottom' | 'top' | 'center'): ViewStyle {
  if (position === 'top') return { top: 0, height: '50%' };
  if (position === 'center') return { top: '20%', height: '60%' };
  return { bottom: 0, height: '60%' };
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
