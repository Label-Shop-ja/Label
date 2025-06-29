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
      colors: {
        // Colores para el tema "Clásico" (el original)
        'deep-night-blue': '#1a202c', // Fondo principal del dashboard y modal
        'copper-rose-accent': '#FF6B6B', // Color de acento para títulos y elementos interactivos
        'action-blue': '#4A90E2', // Azul para botones de acción y enlaces
        'neutral-light': '#F8F8F2', // Texto claro
        'neutral-gray': '#A0AEC0', // Gris neutro para texto secundario
        'dark-charcoal': '#2D3748', // Un gris oscuro para inputs y elementos de fondo
        'success-green': '#4CAF50', // Verde para mensajes de éxito
        'error-red': '#EF4444',     // Rojo para mensajes de error
        'neutral-gray-200': '#CBD5E0', // Gris claro para botones o fondos sutiles
        'neutral-gray-500': '#6B7280', // Gris medio para bordes o fondos
        'neutral-gray-700': '#4A5568', // Gris oscuro para bordes de inputs
        'action-blue-light': '#74B9FF', // Una variante más clara del azul de acción para bordes/sombras
        'dark-slate-gray': '#2a313c', // Un gris azulado oscuro para el fondo de las páginas

        // Colores para el nuevo tema "Claro"
        'light-bg': '#F9FAFB', // Fondo principal claro
        'light-surface': '#FFFFFF', // Superficie de tarjetas y modales
        'light-text': '#1F2937', // Texto principal
        'light-text-secondary': '#6B7280', // Texto secundario
        'light-accent': '#EF4444', // Acento (rojo)
        'light-action': '#3B82F6', // Acción (azul)
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
    // Plugin para añadir la variante "classic"
    // Esto nos permitirá usar clases como `classic:bg-deep-night-blue`
    plugin(function({ addVariant }) {
      addVariant('classic', '.classic &')
    })
  ],
}
