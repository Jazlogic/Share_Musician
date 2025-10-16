export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  small: 8,
  medium: 15,
  large: 20,
  xLarge: 30,
  xxLarge: 60,
  xxxlarge: 100,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  small: 14,
  medium: 16,
  large: 18,
  xLarge: 28,
};

export const Radii = {
  none: 0,
  sm: 5,
  md: 10,
  lg: 15,
  xl: 20,
  round: 999,
  small: 10,
  medium: 15,
  large: 20,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
};

export const LineHeights = {
  sm: 18,
  md: 22,
  lg: 26,
};

export const FontWeights = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Typography = {
  fontFamily: 'monospace', // Default from Calendar theme
  fontSize: FontSizes,
  fontWeight: FontWeights,
};

export const Colors = {
  // Gradient Colors (from cardsRequest)
  gradientStartLight: '#FFFFFF',
  gradientStartDark: '#000000',
  gradientEndLight: '#F0F0F0',
  gradientEndDark: '#333333',

  // Text Colors
  textBlack: '#000000',
  textWhite: '#FFFFFF',
  textGrayMedium: '#888888',
  textRed: '#FF0000',

  // Background Colors
  backgroundLight: '#FFFFFF',
  backgroundDark: '#000000',
  primaryBackgroundLight: '#FFFFFF',
  primaryBackgroundDark: '#000000',

  // Primary Colors
  primaryAccent: '#007AFF',
  primaryLightBlue: '#ADD8E6',

  // Button Colors
  buttonBackgroundLight: '#007AFF',
  buttonBackgroundDark: '#0056B3',
  buttonTextLight: '#FFFFFF',
  buttonTextDark: '#FFFFFF',
};