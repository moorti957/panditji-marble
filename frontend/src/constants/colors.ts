// frontend/src/constants/colors.ts

// ============================================================
// Brand Color Palette
// ============================================================

/**
 * Main brand colors for Pandit Ji Marble Murti Arts
 * Premium luxury palette inspired by Indian heritage and temple architecture
 */
export const brandColors = {
  /** Luxury Gold - primary brand color */
  gold: '#D4AF37',
  /** Gold Light - lighter gold for accents */
  goldLight: '#E8D5A3',
  /** Gold Dark - darker gold for contrast */
  goldDark: '#B8962E',
  /** Marble White - pure white base */
  marbleWhite: '#FFFFFF',
  /** Temple Ivory - warm off-white for backgrounds */
  templeIvory: '#FFFCF7',
  /** Deep Maroon - sacred, rich accent color */
  deepMaroon: '#7B1E1E',
  /** Maroon Dark - darker maroon for depth */
  maroonDark: '#5C1616',
  /** Maroon Light - lighter maroon for accents */
  maroonLight: '#A04040',
  /** Light Sand - warm neutral background */
  lightSand: '#F5EDDF',
  /** Royal Brown - rich, earthy tone */
  royalBrown: '#6D4C41',
  /** Brown Light - softer brown */
  brownLight: '#8D6E63',
  /** Brown Dark - deeper brown */
  brownDark: '#4A3428',
  /** Premium Black - sophisticated dark */
  premiumBlack: '#1A1814',
  /** Ivory - soft white with warmth */
  ivory: '#FFFCF7',
  /** Sand - warm neutral */
  sand: '#F5EDDF',
  /** Brown - primary brown */
  brown: '#6D4C41',
} as const;

// ============================================================
// Color Shades (light to dark variants)
// ============================================================

/**
 * Gold shades - from lightest to darkest
 */
export const goldShades = {
  50: '#FDF8ED',
  100: '#F9ECC8',
  200: '#F4DFA3',
  300: '#EED37E',
  400: '#E8C759',
  500: '#D4AF37', // Main gold
  600: '#B8962E',
  700: '#9C7D25',
  800: '#80641C',
  900: '#644B13',
} as const;

/**
 * Maroon shades - from lightest to darkest
 */
export const maroonShades = {
  50: '#FDF0F0',
  100: '#F5D6D6',
  200: '#E8B3B3',
  300: '#D68A8A',
  400: '#C46666',
  500: '#7B1E1E', // Main maroon
  600: '#6A1818',
  700: '#5C1616', // Maroon dark
  800: '#4D1212',
  900: '#3E0E0E',
} as const;

/**
 * Brown shades - from lightest to darkest
 */
export const brownShades = {
  50: '#F8F4F2',
  100: '#EFE8E4',
  200: '#DFD6D0',
  300: '#C4B5A5',
  400: '#A89480',
  500: '#6D4C41', // Main brown
  600: '#5E4036',
  700: '#4A3428', // Brown dark
  800: '#3B2A20',
  900: '#2C1F18',
} as const;

/**
 * Sand/Ivory shades
 */
export const neutralShades = {
  50: '#FFFFFF',
  100: '#FFFCF7', // Ivory
  200: '#FDF9F0',
  300: '#F5EDDF', // Sand
  400: '#EDE5D5',
  500: '#E5DCCC',
  600: '#D5CCBC',
  700: '#C5BCAC',
  800: '#B5AC9C',
  900: '#A59C8C',
} as const;

/**
 * Black shades (premium dark tones)
 */
export const blackShades = {
  50: '#F5F5F5',
  100: '#E5E5E5',
  200: '#CCCCCC',
  300: '#A3A3A3',
  400: '#7A7A7A',
  500: '#525252',
  600: '#3B3B3B',
  700: '#2B2B2B',
  800: '#1A1814', // Premium black
  900: '#0D0B08',
} as const;

// ============================================================
// Complete Color Map
// ============================================================

/**
 * Complete color palette with all variants and utilities
 */
export const colors = {
  // Main brand colors (for direct use)
  brand: brandColors,
  
  // Shades
  gold: goldShades,
  maroon: maroonShades,
  brown: brownShades,
  neutral: neutralShades,
  black: blackShades,

  // Semantic color groups
  primary: {
    main: brandColors.gold,
    light: brandColors.goldLight,
    dark: brandColors.goldDark,
    contrast: brandColors.marbleWhite,
  },
  secondary: {
    main: brandColors.deepMaroon,
    light: brandColors.maroonLight,
    dark: brandColors.maroonDark,
    contrast: brandColors.marbleWhite,
  },
  accent: {
    main: brandColors.royalBrown,
    light: brandColors.brownLight,
    dark: brandColors.brownDark,
    contrast: brandColors.marbleWhite,
  },
  background: {
    default: brandColors.ivory,
    paper: brandColors.marbleWhite,
    accent: brandColors.lightSand,
    dark: brandColors.premiumBlack,
  },
  text: {
    primary: brandColors.premiumBlack,
    secondary: brandColors.royalBrown,
    muted: brandColors.brownLight,
    light: brandColors.marbleWhite,
    inverse: brandColors.marbleWhite,
  },
  status: {
    success: '#2E7D32',
    error: '#C62828',
    warning: '#E65100',
    info: '#1565C0',
  },
} as const;

// ============================================================
// CSS Variable Mappings (for Tailwind config)
// ============================================================

/**
 * CSS variable names for Tailwind theme extension
 * Use these in your tailwind.config.js
 */
export const cssVariables = {
  // Brand colors
  gold: 'var(--gold)',
  goldLight: 'var(--gold-light)',
  goldDark: 'var(--gold-dark)',
  marbleWhite: 'var(--marble-white)',
  templeIvory: 'var(--temple-ivory)',
  deepMaroon: 'var(--deep-maroon)',
  maroonDark: 'var(--maroon-dark)',
  maroonLight: 'var(--maroon-light)',
  lightSand: 'var(--light-sand)',
  royalBrown: 'var(--royal-brown)',
  brownLight: 'var(--brown-light)',
  brownDark: 'var(--brown-dark)',
  premiumBlack: 'var(--premium-black)',
  ivory: 'var(--ivory)',
  sand: 'var(--sand)',
  brown: 'var(--brown)',
} as const;

/**
 * CSS variable definitions for :root
 * Copy these into your globals.css
 */
export const cssVariableDefinitions: Record<string, string> = {
  '--gold': brandColors.gold,
  '--gold-light': brandColors.goldLight,
  '--gold-dark': brandColors.goldDark,
  '--marble-white': brandColors.marbleWhite,
  '--temple-ivory': brandColors.templeIvory,
  '--deep-maroon': brandColors.deepMaroon,
  '--maroon-dark': brandColors.maroonDark,
  '--maroon-light': brandColors.maroonLight,
  '--light-sand': brandColors.lightSand,
  '--royal-brown': brandColors.royalBrown,
  '--brown-light': brandColors.brownLight,
  '--brown-dark': brandColors.brownDark,
  '--premium-black': brandColors.premiumBlack,
  '--ivory': brandColors.ivory,
  '--sand': brandColors.sand,
  '--brown': brandColors.brown,
};

// ============================================================
// Utility Functions
// ============================================================

/**
 * Get a color by name from the brand colors
 */
export function getColor(name: keyof typeof brandColors): string {
  return brandColors[name] || brandColors.gold;
}

/**
 * Check if a color is light (for text contrast decisions)
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128;
}

/**
 * Get contrast color (black or white) based on background
 */
export function getContrastColor(hex: string): string {
  return isLightColor(hex) ? brandColors.premiumBlack : brandColors.marbleWhite;
}

/**
 * Convert hex to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Get a shade from the color palette by percentage (0-100)
 * Returns the closest matching shade
 */
export function getShade(colorName: keyof typeof brandColors, percentage: number): string {
  const shadeMap: Record<keyof typeof brandColors, Record<number, string>> = {
    gold: { ...goldShades },
    deepMaroon: { ...maroonShades },
    maroonDark: { ...maroonShades },
    maroonLight: { ...maroonShades },
    royalBrown: { ...brownShades },
    brownLight: { ...brownShades },
    brownDark: { ...brownShades },
    premiumBlack: { ...blackShades },
    ivory: { ...neutralShades },
    sand: { ...neutralShades },
    templeIvory: { ...neutralShades },
    marbleWhite: { ...neutralShades },
    lightSand: { ...neutralShades },
    brown: { ...brownShades },
    goldLight: { ...goldShades },
    goldDark: { ...goldShades },
  };

  const shades = shadeMap[colorName];
  if (!shades) return brandColors[colorName];

  // Find closest shade based on percentage
  const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const closest = shadeKeys.reduce((prev, curr) => {
    return Math.abs(curr - percentage) < Math.abs(prev - percentage) ? curr : prev;
  });
  
  return shades[closest as keyof typeof shades] || shades[500] || brandColors[colorName];
}

// ============================================================
// Gradient Definitions
// ============================================================

/**
 * Premium gradient combinations for your brand
 */
export const gradients = {
  /** Gold to gold-dark gradient */
  gold: `linear-gradient(135deg, ${brandColors.gold}, ${brandColors.goldDark})`,
  /** Maroon to maroon-dark gradient */
  maroon: `linear-gradient(135deg, ${brandColors.deepMaroon}, ${brandColors.maroonDark})`,
  /** Warm ivory to sand gradient */
  warm: `linear-gradient(135deg, ${brandColors.ivory}, ${brandColors.lightSand})`,
  /** Gold to transparent (for hero overlays) */
  goldTransparent: `linear-gradient(180deg, ${brandColors.gold}20, transparent)`,
  /** Dark to transparent (for image overlays) */
  darkOverlay: `linear-gradient(180deg, transparent, ${brandColors.premiumBlack}80)`,
  /** Premium black to brown */
  darkWarm: `linear-gradient(135deg, ${brandColors.premiumBlack}, ${brandColors.royalBrown})`,
  /** Gold to maroon (luxury accent) */
  goldMaroon: `linear-gradient(135deg, ${brandColors.gold}, ${brandColors.deepMaroon})`,
  /** Light gradient for cards */
  cardLight: `linear-gradient(135deg, ${brandColors.marbleWhite}, ${brandColors.lightSand}30)`,
  /** Glass gradient */
  glass: `linear-gradient(135deg, ${brandColors.marbleWhite}30, ${brandColors.marbleWhite}10)`,
} as const;

// ============================================================
// Shadow Definitions
// ============================================================

/**
 * Premium shadow presets using brand colors
 */
export const shadows = {
  /** Subtle shadow */
  sm: `0 4px 20px ${brandColors.premiumBlack}10`,
  /** Medium shadow */
  md: `0 8px 40px ${brandColors.premiumBlack}15`,
  /** Large shadow */
  lg: `0 20px 60px ${brandColors.premiumBlack}20`,
  /** Extra large shadow */
  xl: `0 30px 80px ${brandColors.premiumBlack}25`,
  /** Gold glow shadow */
  gold: `0 12px 40px ${brandColors.gold}40`,
  /** Maroon shadow */
  maroon: `0 12px 40px ${brandColors.deepMaroon}30`,
  /** Soft warm shadow */
  warm: `0 20px 60px ${brandColors.royalBrown}15`,
  /** Inner glow */
  inner: `inset 0 2px 4px ${brandColors.marbleWhite}20, inset 0 -2px 4px ${brandColors.premiumBlack}05`,
} as const;

// ============================================================
// Border Definitions
// ============================================================

/**
 * Premium border presets
 */
export const borders = {
  /** Gold border */
  gold: `1px solid ${brandColors.gold}40`,
  /** Gold solid border */
  goldSolid: `1px solid ${brandColors.gold}`,
  /** Maroon border */
  maroon: `1px solid ${brandColors.deepMaroon}30`,
  /** Brown border */
  brown: `1px solid ${brandColors.royalBrown}20`,
  /** Light border */
  light: `1px solid ${brandColors.brownLight}20`,
  /** White border with opacity */
  white: `1px solid ${brandColors.marbleWhite}20`,
  /** Premium dark border */
  dark: `1px solid ${brandColors.premiumBlack}20`,
} as const;

// ============================================================
// Default Export
// ============================================================

const colorConstants = {
  brand: brandColors,
  colors,
  goldShades,
  maroonShades,
  brownShades,
  neutralShades,
  blackShades,
  cssVariables,
  cssVariableDefinitions,
  gradients,
  shadows,
  borders,
  getColor,
  isLightColor,
  getContrastColor,
  hexToRgb,
  getShade,
};

export default colorConstants;