import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  useFonts,
} from '@expo-google-fonts/dm-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneFrame } from '@/components/PhoneFrame';
import { colors } from '@/theme';

// On web inside the phone frame, simulate iPhone safe areas so screens
// can use useSafeAreaInsets() the same way they would on native.
const webInitialMetrics =
  Platform.OS === 'web'
    ? {
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 54, left: 0, right: 0, bottom: 24 },
      }
    : undefined;

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Eesly';
      document.body.style.backgroundColor = '#0A0A0C';
      document.body.style.margin = '0';
    }
  }, []);

  const onReady = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <SafeAreaProvider onLayout={onReady} initialMetrics={webInitialMetrics}>
      <StatusBar style="light" />
      <PhoneFrame>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'fade',
            }}
          />
        </View>
      </PhoneFrame>
    </SafeAreaProvider>
  );
}
