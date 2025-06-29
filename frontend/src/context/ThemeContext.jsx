import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  // El tema "Clásico" (tu diseño original) será el por defecto.
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && ['light', 'dark', 'classic'].includes(savedTheme)) {
      return savedTheme;
    }
    // Si no hay nada guardado, el tema por defecto es 'classic'.
    return 'classic';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Limpiamos cualquier clase de tema anterior para evitar conflictos.
    root.classList.remove('light', 'dark', 'classic');

    // Añadimos la clase del tema actual al elemento <html>.
    // Tailwind usará esta clase para aplicar los estilos condicionales.
    root.classList.add(theme);

    localStorage.setItem('theme', theme);
  }, [theme]);

  const value = { theme, setTheme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}