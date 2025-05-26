// C:\Proyectos\Label\frontend\src\components\Header.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext'; // <-- Importa useAuth

function Header() {
  const { user, logout } = useAuth(); // <-- Obtiene user y logout del contexto

  return (
    <header className="w-full bg-deep-night-blue p-4 flex items-center justify-between shadow-lg z-10">
      <div className="text-3xl font-bold text-copper-rose-accent">
        Label
      </div>
      <div className="flex items-center space-x-4">
        {/* Muestra el nombre del usuario si está logueado */}
        {user && (
          <span className="text-lg text-neutral-light">
            Hola, {user.fullName}!
          </span>
        )}
        {/* Botón de Cerrar Sesión */}
        <button
          onClick={logout} // <-- Llama a la función logout del contexto
          className="bg-action-blue text-neutral-light px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}

export default Header;