/**
 * Catch Up Theme Configuration
 * A modern, clean, minimal theme using a dark blue + white color palette
 */

export const theme = {
  colors: {
    primary: '#0A2540',     // Dark blue
    secondary: '#00C2D1',   // Teal accent
    accent: '#FFC700',      // Yellow accent
    background: '#FFFFFF',  // White background
    card: '#FFFFFF',        // White card background
    text: {
      primary: '#0A2540',   // Dark blue text
      secondary: '#64748B', // Slate gray text
      light: '#FFFFFF',     // White text (for dark backgrounds)
      muted: '#94A3B8',     // Muted text
    },
    border: '#E2E8F0',      // Light border color
    success: '#10B981',     // Green
    warning: '#FBBF24',     // Amber
    error: '#EF4444',       // Red
  },
  
  // Border radius for components
  borderRadius: {
    sm: '10px',
    md: '16px',
    lg: '20px',
    xl: '28px',
    full: '9999px',
  },
  
  // Box shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Spacing
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // Typography
  typography: {
    fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      xxl: '1.5rem',    // 24px
      xxxl: '2rem',     // 32px
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    }
  },
  
  // Z-index values
  zIndex: {
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  }
};

// Breakpoints for responsive design
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
};

// Media queries
export const media = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  xxl: `@media (min-width: ${breakpoints.xxl})`,
};

// Device specific media queries
export const device = {
  mobile: `@media (max-width: ${breakpoints.sm})`,
  tablet: `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`,
  desktop: `@media (min-width: ${breakpoints.lg})`,
  touch: `@media (hover: none) and (pointer: coarse)`,
};

export default theme;