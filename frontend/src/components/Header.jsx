// C:\Proyectos\Label\frontend\src\components\Header.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext'; // Importa useAuth
import { LogOut } from 'lucide-react'; // Importa el icono de logout de Lucide React

function Header() {
    const { user, logout } = useAuth(); // Obtiene user y logout del contexto

    return (
        <header className="w-full bg-deep-night-blue p-4 flex items-center justify-between shadow-lg z-10 border-b border-gray-700">
            {/* Logo de Label o Texto del Título */}
            <div className="flex items-center">
                {/* Podrías usar un icono aquí si lo deseas, o mantener el texto "Label" */}
                {/* <img src="URL_DEL_LOGO_PEQUEÑO" alt="Label Logo" className="h-8 mr-2" /> */}
                <span className="text-3xl font-bold text-copper-rose-accent">
                    Label
                </span>
            </div>
            <div className="flex items-center space-x-4">
                {/* Muestra el nombre del usuario si está logueado */}
                {user && (
                    <span className="text-lg text-neutral-light font-medium">
                        Hola, <span className="text-copper-rose-accent">{user.fullName}</span>!
                    </span>
                )}
                {/* Botón de Cerrar Sesión con icono */}
                <button
                    onClick={logout} // Llama a la función logout del contexto
                    className="flex items-center bg-action-blue text-neutral-light px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    aria-label="Cerrar Sesión"
                >
                    <LogOut size={20} className="mr-2" /> {/* Icono de Lucide React */}
                    Cerrar Sesión
                </button>
            </div>
        </header>
    );
}

export default Header;
