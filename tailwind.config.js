/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        'navy': {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0a1929',
        },
        // Copper/Gold accent
        'copper': {
          50: '#fef9f3',
          100: '#fdf0e1',
          200: '#f9deb8',
          300: '#f5c68a',
          400: '#f0a956',
          500: '#d4915a', // Main copper/gold
          600: '#b87333',
          700: '#925d2a',
          800: '#764a23',
          900: '#5c3a1c',
        },
        'gold': {
          400: '#d4a84b',
          500: '#c9993a',
          600: '#b8860b',
        },
      },
      // Mobile-first screen sizes
      screens: {
        'mobile': '375px', // Standard mobile (iPhone)
        'mobile-lg': '430px', // Large mobile (iPhone Pro Max)
        'sm': '640px',     // Small tablets  
        'md': '768px',     // Tablets
        'lg': '1024px',    // Desktop
        'xl': '1280px',    // Large desktop
        '2xl': '1536px',   // Extra large desktop
      },
      // Mobile-optimized spacing
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Touch-friendly sizes
      minHeight: {
        'touch': '44px',
        'dvh': '100dvh',
        'screen-safe': 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      minWidth: {
        'touch': '44px',
      },
      // Container heights for single-screen layouts
      height: {
        'dvh': '100dvh',
        'touch': '44px',
        'screen': '100vh',
        'screen-dvh': '100dvh',
        'screen-safe': 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'container-full': 'calc(100dvh - env(safe-area-inset-top))',
        'content-area': 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 4rem)',
      },
      // Mobile viewport max widths
      maxWidth: {
        'mobile': '375px',    // Standard mobile container
        'mobile-lg': '430px', // Large mobile container
        'mobile-full': '100vw', // Full mobile width
      },
      // Container and scrollable areas
      maxHeight: {
        'screen-safe': 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'container-full': 'calc(100dvh - env(safe-area-inset-top))',
        'content-area': 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 4rem)',
      },
      fontFamily: {
        'serif': ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}