import { Platform } from 'react-native';

export type DetectedOS = 'ios' | 'android';

type BiometricInfo = {
  os: DetectedOS;
  osLabel: 'iOS' | 'Android';
  biometricLabel: 'Face ID' | 'Fingerprint';
  biometricIcon: 'scan-outline' | 'finger-print-outline';
};

// Detects OS for the auth-method picker. On real iOS / Android, uses
// Platform.OS. On web, sniffs userAgent; falls back to iOS so the
// prototype demo always shows an iPhone-style flow.
export function useOSDetect(): BiometricInfo {
  let os: DetectedOS = 'ios';

  if (Platform.OS === 'android') {
    os = 'android';
  } else if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) os = 'android';
  }

  if (os === 'android') {
    return {
      os,
      osLabel: 'Android',
      biometricLabel: 'Fingerprint',
      biometricIcon: 'finger-print-outline',
    };
  }
  return {
    os,
    osLabel: 'iOS',
    biometricLabel: 'Face ID',
    biometricIcon: 'scan-outline',
  };
}
