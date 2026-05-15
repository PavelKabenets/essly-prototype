import { Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// On web inside the PhoneFrame we simulate iPhone safe-area insets so screens
// don't render under the simulated Dynamic Island notch / home indicator.
// On real phones (web fullscreen, native), we use real insets.
const WEB_INSETS_FRAMED = { top: 54, right: 0, bottom: 24, left: 0 };
const FULLSCREEN_BREAKPOINT = 500;

export function useScreenInsets() {
  const real = useSafeAreaInsets();
  if (Platform.OS !== 'web') return real;

  const w = Dimensions.get('window').width;
  const insideFrame = w >= FULLSCREEN_BREAKPOINT;
  if (insideFrame) return WEB_INSETS_FRAMED;
  // Real phone in browser — use whatever the browser reports plus a sane min.
  return {
    top: Math.max(real.top, 24),
    right: real.right,
    bottom: Math.max(real.bottom, 12),
    left: real.left,
  };
}
