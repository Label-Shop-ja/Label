// C:\Proyectos\Label\frontend\src\hooks\useDebounce.js
import { useState, useEffect } from 'react';

// Un custom hook para implementar la lógica de "debounce"
// Útil para retrasar la ejecución de una función hasta que un valor no cambie
// por un período de tiempo determinado (ej. búsqueda mientras el usuario escribe).
export function useDebounce(value, delay) {
  // Estado para almacenar el valor "debounced"
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Establecer un temporizador que actualiza el valor "debounced"
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el temporizador si el valor cambia (o el componente se desmonta)
    // Esto asegura que el temporizador se reinicie en cada cambio
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo re-ejecutar si el valor o el delay cambian

  return debouncedValue;
}