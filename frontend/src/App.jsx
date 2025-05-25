// C:\Proyectos\Label\frontend\src\App.jsx
import { useState } from 'react'; // Importa el hook useState para manejar el estado
import Header from './components/Header'; // <-- ¡Importa tu componente Header!

// NOTA: Las importaciones de logos o App.css pueden ser eliminadas/comentadas si no se usan directamente

function App() {
  // Define un estado para el contador
  const [count, setCount] = useState(0);

  return (
    // Contenedor principal de la aplicación.
    // flex flex-col items-center justify-center: Centra el contenido en columna.
    // min-h-screen: Ocupa al menos toda la altura de la pantalla.
    // bg-deep-night-blue: Fondo azul oscuro personalizado.
    // text-neutral-light: Color de texto claro personalizado.
    // font-inter: Aplica la fuente Inter.
    // p-4: Relleno general alrededor del contenido.
    <div className="flex flex-col items-center justify-center min-h-screen bg-deep-night-blue text-neutral-light font-inter p-4">

      <Header /> {/* <-- ¡Renderiza tu componente Header aquí! */}

      {/* Título de bienvenida */}
      <h1 className="text-5xl font-bold mb-8 text-copper-rose-accent">¡Hola, Tailwind!</h1>

      {/* Párrafo de prueba */}
      <p className="mb-4 text-xl">
        Este es un contador de prueba con Tailwind CSS.
      </p>

      {/* Campo de entrada de ejemplo */}
      <div className="mb-4 w-full max-w-sm">
        <label htmlFor="username" className="block text-neutral-light text-sm font-bold mb-2">
          Nombre de Usuario:
        </label>
        <input
          type="text"
          id="username"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-deep-night-blue leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Escribe tu nombre"
        />
      </div>

      {/* Botón de contador */}
      <button
        className="px-6 py-3 bg-neutral-gray text-neutral-light rounded-lg shadow-md hover:bg-neutral-light hover:text-deep-night-blue transition-colors duration-300"
        onClick={() => setCount((count) => count + 1)}
      >
        Contador: {count}
      </button>

      {/* Instrucción de edición */}
      <p className="mt-4 text-sm text-neutral-gray">
        Edita <code className="bg-gray-700 px-2 py-1 rounded text-neutral-light">src/App.jsx</code> y guarda para ver los cambios.
      </p>
    </div>
  );
}

export default App; // <-- ¡Exporta el componente App por defecto! (Crucial)