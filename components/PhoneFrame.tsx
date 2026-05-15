import { useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;
const BEZEL = 14;
const FULLSCREEN_BREAKPOINT = 500;
// Status bar / notch area on iPhone — content must start below this
export const PHONE_STATUS_BAR_HEIGHT = 54;

type Props = { children: React.ReactNode };

export function PhoneFrame({ children }: Props) {
  const [winWidth, setWinWidth] = useState<number>(
    () => Dimensions.get('window').width,
  );

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setWinWidth(window.width);
    });
    return () => sub?.remove();
  }, []);

  if (Platform.OS !== 'web') {
    return <View style={styles.nativeRoot}>{children}</View>;
  }

  const fullscreen = winWidth < FULLSCREEN_BREAKPOINT;

  if (fullscreen) {
    return <View style={styles.fullscreenRoot}>{children}</View>;
  }

  return (
    <View style={styles.desktopBackdrop as ViewStyle}>
      <View style={styles.bezel as ViewStyle}>
        <View style={styles.screen as ViewStyle}>
          {/* App content fills the whole screen */}
          {children}
          {/* Notch is drawn ON TOP, but only over the status bar area */}
          <View style={styles.notch as ViewStyle} pointerEvents="none" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nativeRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenRoot: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  desktopBackdrop: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: '100vh' as any,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0C',
    padding: 24,
  },
  bezel: {
    width: PHONE_WIDTH + BEZEL * 2,
    height: PHONE_HEIGHT + BEZEL * 2,
    borderRadius: 56,
    padding: BEZEL,
    backgroundColor: '#0A0A0C',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow:
            '0 0 80px rgba(235,59,118,0.18), 0 30px 60px rgba(0,0,0,0.6)',
        } as any)
      : {
          shadowColor: '#EB3B76',
          shadowOpacity: 0.18,
          shadowRadius: 50,
          shadowOffset: { width: 0, height: 0 },
          elevation: 30,
        }),
  },
  screen: {
    flex: 1,
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
    borderRadius: 42,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  notch: {
    position: 'absolute',
    top: 11,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -60 }],
    width: 120,
    height: 32,
    borderRadius: 20,
    backgroundColor: '#000',
    zIndex: 100,
  },
});
