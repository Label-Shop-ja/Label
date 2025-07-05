// C:\Proyectos\Label\frontend\src\components\Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useClickOutside from '../hooks/useClickOutside';
import { LogOut, Settings } from 'lucide-react';
import ThemeSwitcher from './Common/ThemeSwitcher';

function Header({ heightClass }) {
    const { user, logout } = useAuth();
    const [isMenuOpen, setMenuOpen] = useState(false);

    const menuRef = useClickOutside(() => {
        setMenuOpen(false);
    });

    return (
        <header className={`fixed top-0 left-0 right-0 w-full p-4 flex items-center justify-between shadow-lg z-50 border-b bg-surface/80 backdrop-blur-sm border-surface-secondary transition-colors duration-300 ${heightClass}`}>
            <Link to="/dashboard" className="flex items-center gap-3">
                <img src="https://res.cloudinary.com/dnkr9tvtq/image/upload/v1751750832/Icono_Label_f7kqux.ico" alt="Label Logo" className="h-9 w-auto" />
                <span className="text-2xl font-bold text-primary">
                    Label
                </span>
            </Link>
            <div className="flex items-center gap-4">
                <ThemeSwitcher />
                {user && (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface rounded-full p-1"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="font-semibold text-text-base leading-tight">{user.fullName}</p>
                                <p className="text-xs text-text-muted leading-tight">{user.email}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                                {user.fullName.charAt(0).toUpperCase()}
                            </div>
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-surface rounded-md shadow-xl border border-surface-secondary py-1 animate-fade-in-down">
                                <Link
                                    to="/dashboard/ajustes"
                                    className="flex items-center w-full px-4 py-2 text-sm text-text-base hover:bg-surface-secondary"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <Settings size={16} className="mr-3" />
                                    Configuración
                                </Link>
                                <button
                                    onClick={() => {
                                        logout();
                                        setMenuOpen(false);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-error hover:bg-surface-secondary"
                                >
                                    <LogOut size={16} className="mr-3" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;