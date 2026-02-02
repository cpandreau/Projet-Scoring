/**
 * BILANTIA Design Tokens
 * "L'équilibre financier révélé"
 *
 * Aesthetic: Luxury Editorial - Refined, trustworthy, premium
 * Typography: DM Serif Display (headings) + DM Sans (body)
 * Colors: Deep Navy (#0F172A) + Bronze Gold (#B8860B)
 */

export const colors = {
  // Primary - Deep Navy (Trust, Authority, Stability)
  primary: {
    DEFAULT: '#0F172A',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Accent - Bronze Gold (Premium, Value, Achievement)
  accent: {
    DEFAULT: '#B8860B',
    50: '#FDF9EE',
    100: '#FAF0D4',
    200: '#F5DFA8',
    300: '#ECC96F',
    400: '#E3AF3E',
    500: '#D4941E',
    600: '#B8860B',
    700: '#936B09',
    800: '#78560D',
    900: '#644710',
    950: '#3A2506',
  },

  // Background
  background: {
    DEFAULT: '#FAFBFC',
    dark: '#F1F5F9',
    card: '#FFFFFF',
    elevated: '#FFFFFF',
  },

  // Score colors (Financial health indicators)
  score: {
    excellent: '#059669', // Emerald 600
    good: '#10B981', // Emerald 500
    warning: '#F59E0B', // Amber 500
    danger: '#EF4444', // Red 500
    critical: '#DC2626', // Red 600
  },
} as const

export const typography = {
  // Display font for headings - DM Serif Display
  fontDisplay: '"DM Serif Display", Georgia, "Times New Roman", serif',
  // Body font - DM Sans
  fontBody: '"DM Sans", system-ui, -apple-system, sans-serif',
  // Mono font for numbers/data
  fontMono: '"JetBrains Mono", "Fira Code", monospace',
} as const

export const animation = {
  // Timing functions
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elegant: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  // Durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
} as const

export const shadows = {
  subtle: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  card: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  elevated: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
  floating: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
  glow: '0 0 40px -10px rgb(184 134 11 / 0.3)',
} as const
