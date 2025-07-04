// C:\Proyectos\Label\frontend\src\components\Header.jsx
import React from 'react';
import useAuth from '../hooks/useAuth';
import { LogOut } from 'lucide-react';
import ThemeSwitcher from './Common/ThemeSwitcher'; // 1. Importamos el selector de tema

function Header() {
    const { user, logout } = useAuth(); // Obtiene user y logout del contexto

    return (
        // 2. Aplicamos clases condicionales para los temas
        <header className="w-full p-4 flex items-center justify-between shadow-lg z-10 border-b bg-surface border-surface-secondary transition-colors duration-300">
            <div className="flex items-center">
                <span className="text-2xl font-bold text-primary">
                    Label
                </span>
            </div>
            <div className="flex items-center gap-4">
                <ThemeSwitcher />
                {user && (
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="font-semibold text-text-base leading-tight">{user.fullName}</p>
                            <p className="text-xs text-text-muted leading-tight">{user.email}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                            {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <button
                            onClick={() => logout()}
                            className="p-2 rounded-full text-text-muted hover:bg-surface-secondary hover:text-error transition-colors"
                            title="Cerrar Sesión"
                            aria-label="Cerrar Sesión"
                        >
                            <LogOut size={22} />
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
