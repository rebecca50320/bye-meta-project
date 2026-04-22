export const colors = {
  bg: '#F7F3EE',
  surface: '#FFFDF9',
  surfaceWarm: '#FDF6EE',
  border: '#E8E0D5',
  borderLight: '#F0EAE2',

  textPrimary: '#2D2620',
  textSecondary: '#9C8E82',
  textTertiary: '#C4B8AC',

  accent: '#A8784A',       // warm amber — primary action
  accentLight: '#F2E8DA',  // tinted background for accent areas
  accentDark: '#8A5E35',

  sage: '#7A9175',         // muted green — for positive states
  sageLight: '#EBF0E9',

  danger: '#A05252',
  dangerLight: '#F5EAEA',
  warning: '#9C7A36',
};

export const typography = {
  displayLarge: { fontSize: 28, fontWeight: '600', color: colors.textPrimary, letterSpacing: -0.5 },
  display:      { fontSize: 22, fontWeight: '600', color: colors.textPrimary, letterSpacing: -0.3 },
  title:        { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  body:         { fontSize: 16, color: colors.textPrimary, lineHeight: 26 },
  bodySmall:    { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  caption:      { fontSize: 12, color: colors.textTertiary, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: '500' },
  mono:         { fontFamily: 'Courier', fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
};

export const shadow = {
  card: {
    shadowColor: '#8B6040',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
    elevation: 2,
  },
  subtle: {
    shadowColor: '#8B6040',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    elevation: 1,
  },
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 52,
};
