// C:\Proyectos\Label\frontend\src\components\Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useClickOutside from '../hooks/useClickOutside';
import { LogOut, Settings, Plus, RefreshCw } from 'lucide-react';
import ThemeSwitcher from './Common/ThemeSwitcher';
import FullscreenToggle from './Common/FullscreenToggle';
import AccountSwitcherModal from './Auth/AccountSwitcherModal';
import AddAccountModal from './Auth/AddAccountModal';
import AccountManager from '../services/AccountManager';

function Header({ heightClass }) {
    const { user, logout } = useAuth();
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isAccountSwitcherOpen, setAccountSwitcherOpen] = useState(false);
    const [isAddAccountModalOpen, setAddAccountModalOpen] = useState(false);
    const [accountsUpdated, setAccountsUpdated] = useState(0); // Para forzar re-render
    
    // Recalcular cuando accountsUpdated cambie
    const savedData = AccountManager.getSavedAccounts();
    const accountCount = savedData.accounts.length;
    const hasMultipleAccounts = accountCount > 1;

    const menuRef = useClickOutside(() => {
        setMenuOpen(false);
    });

    const handleAccountAction = () => {
        setMenuOpen(false);
        if (hasMultipleAccounts) {
            setAccountSwitcherOpen(true);
        } else {
            setAddAccountModalOpen(true);
        }
    };

    const handleAddAccount = () => {
        setAccountSwitcherOpen(false);
        setAddAccountModalOpen(true);
    };

    return (
        <>
        <header className={`fixed top-0 left-0 right-0 w-full p-4 flex items-center justify-between shadow-lg z-50 border-b bg-surface/80 backdrop-blur-sm border-surface-secondary transition-colors duration-300 ${heightClass}`}>
            <Link to="/dashboard" className="flex items-center gap-3">
                <img src="https://res.cloudinary.com/dnkr9tvtq/image/upload/v1751750832/Icono_Label_f7kqux.ico" alt="Label Logo" className="h-9 w-auto" />
                <span className="text-2xl font-bold text-primary">
                    Label
                </span>
            </Link>
            <div className="flex items-center gap-4">
                <ThemeSwitcher />
                <FullscreenToggle /> {/* 2. Lo añadimos junto a los otros iconos */}
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
                                <Link
                                    to="/dashboard/ajustes"
                                    className="flex items-center w-full px-4 py-2 text-sm text-text-base hover:bg-surface-secondary"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <Settings size={16} className="mr-3" />
                                    Configuración
                                </Link>
                                <button
                                    onClick={handleAccountAction}
                                    className="flex items-center w-full px-4 py-2 text-sm text-text-base hover:bg-surface-secondary"
                                >
                                    {hasMultipleAccounts ? (
                                        <>
                                            <RefreshCw size={16} className="mr-3" />
                                            Cambiar cuenta
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} className="mr-3" />
                                            Añadir cuenta
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
        
        {/* Modal de cambio de cuentas */}
        <AccountSwitcherModal
            isOpen={isAccountSwitcherOpen}
            onClose={() => setAccountSwitcherOpen(false)}
            onAddAccount={handleAddAccount}
            onAccountChanged={() => setAccountsUpdated(prev => prev + 1)}
        />
        
        {/* Modal para añadir nueva cuenta */}
        <AddAccountModal
            isOpen={isAddAccountModalOpen}
            onClose={() => setAddAccountModalOpen(false)}
            onAccountAdded={(user) => {
                console.log('Nueva cuenta añadida:', user.email);
                setAccountsUpdated(prev => prev + 1); // Forzar re-render
            }}
        />
        </>
    );
}

export default Header;