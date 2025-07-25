import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    // Cambia entre 'dark' y 'light'
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Elige el ícono a mostrar basado en el tema actual. Muestra el sol en tema oscuro (para cambiar a claro) y viceversa.
  const Icon = theme === 'light' ? Moon : Sun;

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-secondary hover:opacity-80 text-text-base transition-colors"
      aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
    >
      <Icon size={20} />
    </button>
  );
};

export default ThemeSwitcher;