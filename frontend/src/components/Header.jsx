// C:\Proyectos\Label\frontend\src\components\Header.jsx
import React from 'react'; // Necesario si usas JSX, aunque no uses hooks

function Header() {
  return (
    // Contenedor principal del encabezado:
    // w-full: 100% de ancho
    // bg-deep-night-blue: Color de fondo personalizado
    // text-neutral-light: Color de texto personalizado
    // p-4: Relleno en todos los lados
    // shadow-md: Sombra mediana
    // flex justify-between items-center: Flexbox para alinear elementos (título a la izquierda, navegación a la derecha)
    <header className="w-full bg-deep-night-blue text-neutral-light p-4 shadow-md flex justify-between items-center">
      {/* Título del Dashboard */}
      <h1 className="text-2xl font-bold text-copper-rose-accent">Label Dashboard</h1>

      {/* Navegación */}
      <nav>
        <ul className="flex space-x-4"> {/* flex space-x-4: Muestra los elementos en fila con espacio entre ellos */}
          <li><a href="#" className="hover:text-copper-rose-accent transition-colors duration-200">Inicio</a></li>
          <li><a href="#" className="hover:text-copper-rose-accent transition-colors duration-200">Proyectos</a></li>
          <li><a href="#" className="hover:text-copper-rose-accent transition-colors duration-200">Configuración</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header; // Exporta el componente para que pueda ser usado en otros archivos