// tailwind.config.js
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
export default {
  // Configura los archivos donde Tailwind debe buscar clases
  darkMode: 'class', // Habilitamos el modo oscuro basado en la clase `.dark`
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Define tus colores personalizados para usar en Tailwind
      // Ahora apuntan a las variables CSS que definimos en index.css
      colors: {
        background: 'hsl(var(--color-background) / <alpha-value>)',
        surface: 'hsl(var(--color-surface) / <alpha-value>)',
        'surface-secondary': 'hsl(var(--color-surface-secondary) / <alpha-value>)',
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        secondary: 'hsl(var(--color-secondary) / <alpha-value>)',
        success: 'hsl(var(--color-success) / <alpha-value>)',
        error: 'hsl(var(--color-error) / <alpha-value>)',
        'text-base': 'hsl(var(--color-text-base) / <alpha-value>)',
        'text-muted': 'hsl(var(--color-text-muted) / <alpha-value>)',
      },
      // Define tus keyframes para animaciones CSS
      keyframes: {
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      // Asocia tus keyframes a nombres de clases de animación de Tailwind
      animation: {
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out forwards', // 'forwards' mantiene el estado final
      },
    },
  },
  plugins: [
    // El plugin para la variante "classic" ya no es necesario.
    // Si usas el plugin de formularios de Tailwind, déjalo aquí.
    // require('@tailwindcss/forms'),
  ],
}
