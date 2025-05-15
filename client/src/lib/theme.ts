/**
 * Catch Up App Theme Configuration
 * 
 * This file contains the color palette and theme variables
 * for the Catch Up application.
 */

export const catchUpTheme = {
  colors: {
    // Primary brand color
    primary: '#0A2540',
    primaryLight: '#1A3550',
    primaryDark: '#051C30',
    
    // Accent colors
    accent: '#FFC700', // Yellow accent
    accentAlt: '#00C2D1', // Teal accent
    
    // UI colors
    background: '#FFFFFF',
    backgroundAlt: '#F7F9FC',
    card: '#FFFFFF',
    
    // Text colors
    text: {
      primary: '#0A2540', 
      secondary: '#64748B',
      inverted: '#FFFFFF',
      muted: '#94A3B8'
    },
    
    // Status colors
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    },
  },
  
  // Spacing values (in pixels)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  
  // Border radius values
  borderRadius: {
    sm: '8px',
    md: '16px',
    lg: '20px',
    full: '9999px'
  },
  
  // Typography styles
  typography: {
    fontFamily: {
      main: 'Inter, system-ui, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }
  },
  
  // Shadow values
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
  }
};

export default catchUpTheme;