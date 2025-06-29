import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Palette, Check } from 'lucide-react';

const themeOptions = {
  light: { name: 'Claro', icon: <Sun size={16} /> },
  dark: { name: 'Oscuro', icon: <Moon size={16} /> },
  classic: { name: 'Clásico', icon: <Palette size={16} /> },
};

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cierra el dropdown si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  const CurrentThemeIcon = themeOptions[theme]?.icon || <Palette size={20} />;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 classic:bg-gray-700 hover:opacity-80 text-light-text dark:text-neutral-light classic:text-neutral-light transition-colors"
        aria-label="Seleccionar tema"
      >
        {React.cloneElement(CurrentThemeIcon, { size: 20 })}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-light-surface dark:bg-gray-800 classic:bg-gray-800 border border-gray-200 dark:border-gray-700 classic:border-gray-700 rounded-lg shadow-xl z-20 animate-fade-in-down">
          <ul>
            {Object.entries(themeOptions).map(([key, option]) => (
              <li key={key}>
                <button
                  onClick={() => handleThemeChange(key)}
                  className="w-full text-left px-4 py-2 flex items-center text-sm text-light-text dark:text-neutral-light classic:text-neutral-light hover:bg-action-blue hover:text-white transition-colors"
                >
                  {option.icon}
                  <span className="ml-3">{option.name}</span>
                  {theme === key && <Check size={16} className="ml-auto text-success-green" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
// Este componente permite al usuario cambiar entre diferentes temas (claro, oscuro, clásico) y