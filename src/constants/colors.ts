// Color theme constants for Light Theme

export const colors = {
  // Primary 1 - Purple
  primary: {
    main: '#783C91',
    main3: 'rgba(30, 0, 43, 1)',
    light: '#EBBCFE',
    dark: '#3F214C',
    white: '#FFFFFF',
    gradient: {
      from: '#783C91',
      to: '#F0C469',
    },
  },
  
  // Primary 2 - Orange/Gold
  gold: {
    main: '#DB9400',
    light: '#F0C469',
    dark: '#755002',
    white: '#FFFFFF',
  },
  
  // Secondary 1 - Muted Purple
  secondary: {
    main: '#90789B',
    light: '#F0E2F6',
    dark: '#4D3857',
    white: '#FFFFFF',
  },
  
  // Secondary 2 - Yellow/Lime
  yellow: {
    main: '#D9CF00',
    light: '#F0EA69',
    dark: '#464530',
    white: '#FFFFFF',
  },
  
  // Secondary 3 - Red
  red: {
    main: '#B3261E',
    light: '#FFAEAA',
    dark: '#780E08',
    white: '#FFFFFF',
  },
  
  // Neutral
  grey: {
    light: '#CFCFCF',
    disabled: '#DFDFDF',
  },
  
  // Text colors
  text: {
    primary: '#1E002B',
    secondary: '#676767',
    disabled: '#676767',
  },
  
  // Additional colors found in codebase
  purple: {
    hover: '#AA86B9', // Used in button hover state
  },
  
  // Border colors
  border: {
    light: '#DCD0E1',
    purple: '#AA86B9',
  },
  
  // Elevated button
  elevated: {
    background: '#EFECF0',
  },
} as const;

// Semantic color mappings
export const semanticColors = {
  success: colors.gold.main,
  error: colors.red.main,
  warning: colors.yellow.main,
  info: colors.primary.main,
  disabled: colors.grey.disabled,
} as const;

// Type for color keys
export type ColorKey = keyof typeof colors;

