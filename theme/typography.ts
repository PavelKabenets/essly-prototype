// Typography from Figma file kD6KOPrp786nE1VpIME3EY
// Body / UI: DM Sans (Google Font, loaded via @expo-google-fonts/dm-sans)
// iOS chrome (status bar, keys): SF Pro (system fallback)

const dm = (weight: '400' | '500' | '700') => {
  if (weight === '400') return 'DMSans_400Regular';
  if (weight === '500') return 'DMSans_500Medium';
  return 'DMSans_700Bold';
};

export const fonts = {
  dmRegular: 'DMSans_400Regular',
  dmMedium: 'DMSans_500Medium',
  dmBold: 'DMSans_700Bold',
};

export const typography = {
  // Section heads (auth/onboarding)
  h1: {
    fontFamily: dm('700'),
    fontSize: 32,
    lineHeight: 38,
  } as const,
  h2: {
    fontFamily: dm('700'),
    fontSize: 24,
    lineHeight: 30,
  } as const,
  h3: {
    fontFamily: dm('500'),
    fontSize: 20,
    lineHeight: 26,
  } as const,

  // Body — matches chat message text in Figma (DM Sans 400 16/22)
  bodyLg: {
    fontFamily: dm('400'),
    fontSize: 18,
    lineHeight: 26,
  } as const,
  body: {
    fontFamily: dm('400'),
    fontSize: 16,
    lineHeight: 22,
  } as const,
  bodySm: {
    fontFamily: dm('400'),
    fontSize: 14,
    lineHeight: 20,
  } as const,
  caption: {
    fontFamily: dm('400'),
    fontSize: 12,
    lineHeight: 16,
  } as const,

  // Buttons / labels
  button: {
    fontFamily: dm('500'),
    fontSize: 16,
    lineHeight: 22,
  } as const,
  label: {
    fontFamily: dm('500'),
    fontSize: 13,
    lineHeight: 18,
  } as const,

  // Avatar initials (header) — matches Figma "TD" (DM Sans 700 14/24)
  initials: {
    fontFamily: dm('700'),
    fontSize: 14,
    lineHeight: 24,
  } as const,

  // Voice mode lyric — DM Sans 400 24/33
  lyric: {
    fontFamily: dm('400'),
    fontSize: 24,
    lineHeight: 33,
  } as const,

  // Onboarding greeting (very large)
  greeting: {
    fontFamily: dm('400'),
    fontSize: 56,
    lineHeight: 64,
  } as const,
};
