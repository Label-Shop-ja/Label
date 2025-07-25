import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // 1. El valor por defecto ahora es 'dark'.
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Solo permitimos 'light' o 'dark'. Cualquier otra cosa vuelve a 'dark'.
    return savedTheme === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Limpiamos las clases de tema anteriores
    root.classList.remove('light', 'dark', 'classic');
    
    // Añadimos la clase del tema actual si es 'light'
    // Si es 'dark', no añadimos ninguna clase, ya que es el tema por defecto en :root
    if (theme === 'light') {
      root.classList.add('light');
    }
    
    // Guardamos la preferencia en localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const value = { theme, setTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
