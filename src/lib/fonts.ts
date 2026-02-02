import { Playfair_Display, DM_Sans, Space_Grotesk } from 'next/font/google'

/**
 * BILANTIA Design System - Typography
 *
 * Font Stack:
 * - Playfair Display: Display/headings - elegant serif for premium feel
 * - DM Sans: Body text - clean, readable sans-serif
 * - Space Grotesk: Monospace/numbers - technical, precise for financial data
 */

export const playfairDisplay = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const spaceGrotesk = Space_Grotesk({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

/**
 * Combined font variables for use in layout
 */
export const fontVariables = `${playfairDisplay.variable} ${dmSans.variable} ${spaceGrotesk.variable}`

/**
 * Font family CSS values for direct use
 */
export const fonts = {
  display: 'var(--font-display)',
  body: 'var(--font-body)',
  mono: 'var(--font-mono)',
} as const
