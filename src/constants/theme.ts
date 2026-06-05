export const colors = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  secondary: '#7C3AED',
  accent: '#06B6D4',
  accentLight: '#22D3EE',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  card: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  gradientStart: '#4F46E5',
  gradientMid: '#7C3AED',
  gradientEnd: '#06B6D4',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const lightTheme = {
  dark: false,
  colors: {
    ...colors,
    background: '#F1F5F9',
    surface: '#FFFFFF',
    surfaceLight: '#E2E8F0',
    card: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
  },
};

export const darkTheme = {
  dark: true,
  colors,
};
