// C:\Proyectos\Label\frontend\src\components\DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import Breadcrumbs from './Common/Breadcrumbs';
import useAuth from "../hooks/useAuth";
import ErrorBoundary from "./Common/ErrorBoundary";


/**
 * Componente de Layout para el Dashboard.
 * Este componente proporciona la estructura común (Header, Sidebar)
 * para todas las páginas dentro del dashboard.
 * Las rutas anidadas se renderizarán dentro del <Outlet />.
 */
function DashboardLayout() {
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(true); // Aunque no se usa, lo dejamos por si se implementa en el futuro

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };
    const pageTransition = {
        duration: 0.3,
        ease: 'easeInOut',
    };

    const { user, logout } = useAuth(); // Obtener el usuario y la función de logout del contexto

    return (
        <div className="flex flex-col h-screen bg-light-bg dark:bg-deep-night-blue classic:bg-deep-night-blue text-light-text dark:text-neutral-light classic:text-neutral-light font-inter transition-colors duration-300">
            {/* El Header es común para todas las rutas del dashboard */}
            <Header onLogout={logout} currentUser={user} />
            <div className="flex flex-1 overflow-hidden">
                {/* El Sidebar es común para todas las rutas del dashboard */}
                <Sidebar />
                {/* El área principal de contenido donde se renderizarán las rutas hijas */}
                <main className="flex-1 p-8 bg-light-bg dark:bg-gray-900 classic:bg-gray-900 overflow-y-auto custom-scrollbar transition-colors duration-300">
                    {/* 2. Colocamos los Breadcrumbs aquí, justo antes del contenido principal */}
                    <Breadcrumbs />
                    {/* ErrorBoundary SOLO para el contenido principal */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname} // La key es crucial para que AnimatePresence detecte el cambio de página
                            variants={pageVariants}
                            transition={pageTransition}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <ErrorBoundary>
                                <Outlet /> {/* El Outlet renderiza el componente de la ruta anidada actual */}
                            </ErrorBoundary>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
