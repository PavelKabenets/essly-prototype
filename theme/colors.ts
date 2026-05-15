// Tokens extracted from Figma file kD6KOPrp786nE1VpIME3EY
// (frames 1:224 Voise mode, 17:2384 Chat 01, 21:6145 Chat 02, 21:6835 iPhone Grey)

export const colors = {
  // Backgrounds
  background: '#0B0C10',
  backgroundPureBlack: '#000000',
  backgroundGlassBlue: '#394256',
  backgroundElevated: '#15161A',

  // Brand pink (voice mode glow, brand accents)
  pink: '#EB3B76',
  pinkHi: '#ED3E77',
  pinkSoft: 'rgba(235, 59, 118, 0.18)',
  pinkGlow: 'rgba(235, 59, 118, 0.45)',

  // Lavender (button system base)
  lavender: '#A99DF1',
  lavenderHi: '#AA9CF2',
  lavenderText: '#CDCDDE',

  // Text
  text: '#FFFFFF',
  textBubble: '#D4D4D6',
  textSecondary: '#A8A8B0',
  textMuted: 'rgba(255, 255, 255, 0.45)',
  textPlaceholder: 'rgba(206, 206, 239, 0.5)',

  // Borders / glass
  border: 'rgba(255, 255, 255, 0.10)',
  borderStrong: 'rgba(255, 255, 255, 0.18)',
  borderAccent: 'rgba(235, 59, 118, 0.5)',
  surfaceGlass: 'rgba(255, 255, 255, 0.04)',
  surfaceGlassStrong: 'rgba(255, 255, 255, 0.08)',

  // Icon strokes
  iconStroke: '#D4D4D6',

  // System
  cursorBlue: '#008BFF',
  error: '#FF4D6D',
  success: '#4ADE80',

  // Aliases (back-compat with screens written before pixel-perfect pass)
  accent: '#EB3B76',
  accentSoft: 'rgba(235, 59, 118, 0.18)',
  accentGlow: 'rgba(235, 59, 118, 0.45)',
};

// Reusable gradient definitions (use with LinearGradient `colors` prop)
export const gradients = {
  // Chat background — subtle dark blue-grey
  chatBg: ['#000000', '#394256'] as const,
  // Composer pill, bubbles
  bubble: ['#08090B', '#14161A', '#171E2C'] as const,
  // Bubble (Chat 4 variant)
  bubbleAlt: ['#08090B', '#15161A', '#181E2C'] as const,
  // Voice mode pink glow
  voiceGlow: ['#ED3E77', '#111111'] as const,
  // Iridescent lyric text
  lyric: ['#151032', '#DFC5CD', '#151032'] as const,
  // Lavender button highlight
  buttonHi: ['#A99CF2', '#AA9CF2'] as const,
  // Button shine (linear, top/bottom)
  buttonShine: ['#EEEEEE', 'rgba(238,238,238,0)', '#EEEEEE'] as const,
  // Button radial highlight (top to bottom-fade)
  buttonRadial: ['#FFFFFF', 'rgba(221,221,221,0)'] as const,
};
