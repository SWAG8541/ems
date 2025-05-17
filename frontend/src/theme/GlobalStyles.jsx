import { GlobalStyles as MuiGlobalStyles } from '@mui/material';

const GlobalStyles = () => {
  return (
    <MuiGlobalStyles
      styles={(theme) => ({
        // Global styles
        '*, *::before, *::after': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
        'html, body, #root': {
          height: '100%',
          width: '100%',
        },
        body: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          lineHeight: 1.5,
          fontFamily: theme.typography.fontFamily,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          overflowX: 'hidden',
        },
        '#root': {
          display: 'flex',
          flexDirection: 'column',
        },
        a: {
          textDecoration: 'none',
          color: 'inherit',
          transition: 'color 0.2s ease',
        },
        'h1, h2, h3, h4, h5, h6': {
          margin: 0,
          fontWeight: 600,
          lineHeight: 1.2,
        },
        // Scrollbar styling
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f1f1f1',
          borderRadius: '10px',
        },
        '::-webkit-scrollbar-thumb': {
          background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#c1c1c1',
          borderRadius: '10px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#a8a8a8',
        },
        // Animation classes
        '.fade-in': {
          animation: 'fadeIn 0.3s ease-in-out',
        },
        '.slide-in-left': {
          animation: 'slideInLeft 0.3s ease-in-out',
        },
        '.slide-in-right': {
          animation: 'slideInRight 0.3s ease-in-out',
        },
        '.slide-in-up': {
          animation: 'slideInUp 0.3s ease-in-out',
        },
        // Animation keyframes
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        '@keyframes slideInLeft': {
          from: { transform: 'translateX(-20px)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
        '@keyframes slideInRight': {
          from: { transform: 'translateX(20px)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
        '@keyframes slideInUp': {
          from: { transform: 'translateY(20px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        // Page transition
        '.page-transition-enter': {
          opacity: 0,
          transform: 'translateY(10px)',
        },
        '.page-transition-enter-active': {
          opacity: 1,
          transform: 'translateY(0)',
          transition: 'opacity 300ms, transform 300ms',
        },
        '.page-transition-exit': {
          opacity: 1,
        },
        '.page-transition-exit-active': {
          opacity: 0,
          transition: 'opacity 300ms',
        },
        // Focus styles for accessibility
        ':focus': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        },
        ':focus:not(:focus-visible)': {
          outline: 'none',
        },
      })}
    />
  );
};

export default GlobalStyles;
