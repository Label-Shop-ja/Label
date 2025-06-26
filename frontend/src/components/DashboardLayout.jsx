// C:\Proyectos\Label\frontend\src\components\DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext'; // Para pasar el usuario al Header
import ErrorBoundary from "./Common/ErrorBoundary";

/**
 * Componente de Layout para el Dashboard.
 * Este componente proporciona la estructura común (Header, Sidebar)
 * para todas las páginas dentro del dashboard.
 * Las rutas anidadas se renderizarán dentro del <Outlet />.
 */
function DashboardLayout() {
    const { user, logout } = useAuth(); // Obtener el usuario y la función de logout del contexto

    return (
        <div className="flex flex-col h-screen bg-deep-night-blue text-neutral-light font-inter">
            {/* El Header es común para todas las rutas del dashboard */}
            <Header onLogout={logout} currentUser={user} />
            <div className="flex flex-1 overflow-hidden">
                {/* El Sidebar es común para todas las rutas del dashboard */}
                <Sidebar />
                {/* El área principal de contenido donde se renderizarán las rutas hijas */}
                <main className="flex-1 p-8 bg-gray-900 overflow-y-auto custom-scrollbar">
                    {/* ErrorBoundary SOLO para el contenido principal */}
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
