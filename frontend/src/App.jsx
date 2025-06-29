// C:\Proyectos\Label\frontend\src\App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import AccessModal from './components/Auth/AccessModal';
import DashboardHome from './components/Dashboard/DashboardHome';

// Importar los componentes de "páginas"
import InventoryPage from "./components/Inventory/InventoryPage";
import FinancialPage from './components/FinancialPage';
import PosPage from './components/PosPage';
import ClientsPage from './components/ClientsPage';
import StatsPage from './components/StatsPage';
import SettingsPage from './components/SettingsPage';
import CustomRatesSettings from './pages/Settings/CustomRatesSettings'; // ¡El nuevo beta!
import AdminPanel from './pages/Admin/AdminPanel'; // Un componente de ejemplo para la página de admin
import UnauthorizedPage from './pages/Common/UnauthorizedPage'; // Página para error 403

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import useAuth from './hooks/useAuth'; // Importamos nuestro hook
import { useCurrency } from './context/CurrencyContext';
import ErrorBoundary from "./components/Common/ErrorBoundary";
import Toast from './components/Common/Toast';

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Obtenemos el estado de autenticación y carga directamente desde el store de Redux. ¡Esto está perfecto!
    const { isAuthenticated, isLoading: authLoading, verify } = useAuth();

    const { loadingCurrency, currencyError } = useCurrency();
    const location = useLocation();

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        // Despachamos la acción correcta para verificar el estado de autenticación al cargar la app.
        verify();
    }, [verify]);

    // Efecto para actualizar el título de la página dinámicamente
    useEffect(() => {
        const titleMap = {
            'dashboard': 'Dashboard',
            'inventario': 'Inventario',
            'finanzas': 'Finanzas',
            'pos': 'Punto de Venta',
            'clientes': 'Clientes',
            'estadisticas': 'Estadísticas',
            'ajustes': 'Ajustes',
            'tasas-personalizadas': 'Tasas Personalizadas',
            'panel-admin': 'Panel de Administración',
            'unauthorized': 'Acceso Denegado'
        };

        const pathnames = location.pathname.split('/').filter((x) => x);
        const currentPageKey = pathnames[pathnames.length - 1] || 'home';
        const pageTitle = titleMap[currentPageKey] || 'Gestión Inteligente';

        document.title = `Label | ${pageTitle}`;
    }, [location.pathname]); // Se ejecuta cada vez que la URL cambia

    // Si la aplicación está cargando (ej. verificando autenticación inicial), mostrar un spinner
    if (authLoading || loadingCurrency) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-deep-night-blue text-neutral-light">
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-copper-rose-accent"></div>
                <p className="ml-3 text-lg">Cargando aplicación...</p>
            </div>
        );
    }

    if (currencyError) return <div className="min-h-screen flex items-center justify-center bg-deep-night-blue text-red-500 text-lg">{currencyError}</div>;

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-deep-night-blue text-neutral-light font-inter relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        {/* Ruta para la página de inicio o login (no protegida) */}
                        <Route
                            path="/"
                            element={
                                isAuthenticated ? (
                                    // Si ya está autenticado, redirigir al dashboard
                                    <Navigate to="/dashboard" replace />
                                ) : (
                                    // Si no está autenticado, mostrar la página de bienvenida con estética de referencia
                                    <div className="relative w-full h-screen flex items-center justify-center p-4">
                                        {/* Fondo de imagen - la nueva imagen proporcionada por el usuario */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url(https://i.imgur.com/DhYqN9x.png)` }}
                                        ></div>
                                        {/* Overlay con degradado para integrar mejor la imagen */}
                                        {/* De oscuro casi opaco a la izquierda (para el texto) a más transparente a la derecha */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-deep-night-blue via-deep-night-blue/70 to-transparent"></div>

                                        {/* Contenedor principal del contenido (simula la estructura de la referencia) */}
                                        {/* Usamos flex para alinear el contenido principal y el botón */}
                                        <div className="relative z-10 w-full max-w-7xl h-[calc(100vh-2rem)] flex flex-col justify-center items-start p-8 md:p-12 lg:p-16">
                                            {/* Contenedor para el texto principal y descripción, alineado a la izquierda */}
                                            <div className="w-full max-w-lg lg:max-w-2xl text-white mb-8">
                                                <h1 className="font-bold text-5xl md:text-6xl text-white drop-shadow-lg mb-4 font-['Inter']">LABEL</h1>
                                                <h2 className="text-3xl md:text-4xl font-semibold mb-4 leading-tight drop-shadow-lg">
                                                    Gestiona tu negocio con inteligencia y eficiencia.
                                                </h2>
                                                <p className="text-lg md:text-xl drop-shadow-lg">
                                                    Label es la plataforma integral que te permite tomar el control total de tus operaciones,
                                                    optimizar recursos y escalar con éxito. Simplifica tu gestión, potencia tu crecimiento.
                                                </p>
                                            </div>

                                            {/* Botón de Acceder - Alineado a la derecha del contenedor principal */}
                                            {/* Usamos flex y justify-end para empujarlo a la derecha */}
                                            <div className="w-full flex justify-end pr-8 md:pr-16 lg:pr-24">
                                                <button
                                                    onClick={handleOpenModal}
                                                    className="bg-action-blue hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-xl transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-opacity-50 text-xl md:text-2xl w-fit"
                                                >
                                                    Acceder
                                                </button>
                                            </div>
                                        </div>

                                        {/* El AccessModal se renderiza como un overlay si isModalOpen es true */}
                                        {isModalOpen && <AccessModal onClose={handleCloseModal} />}
                                    </div>
                                )
                            }
                        />

                        {/* Grupo de rutas protegidas: El ProtectedRoute envuelve el DashboardLayout */}
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                            {/* Estas son las rutas anidadas que se renderizarán dentro del <Outlet /> de DashboardLayout */}
                            <Route index element={<DashboardHome />} /> {/* Ruta por defecto para /dashboard */}
                            <Route path="inventario" element={<InventoryPage />} />
                            <Route path="finanzas" element={<FinancialPage />} />
                            <Route path="pos" element={<PosPage />} />
                            <Route path="clientes" element={<ClientsPage />} />
                            <Route path="estadisticas" element={<StatsPage />} />

                            {/* Grupo de rutas de ajustes anidadas */}
                            <Route path="ajustes">
                                <Route index element={<SettingsPage />} />
                                <Route path="tasas-personalizadas" element={<CustomRatesSettings />} />
                                {/* ¡RUTA SOLO PARA ADMINS! Envuelta en su propio ProtectedRoute con roles */}
                                <Route path="panel-admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
                            </Route>
                        </Route>

                        {/* Ruta para la página de "No Autorizado" */}
                        <Route path="/unauthorized" element={<UnauthorizedPage />} />

                        {/* Ruta comodín para cualquier otra ruta no definida (redirige a la raíz) */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AnimatePresence>

                {/* Componente Toast para mostrar notificaciones, fuera del <Routes> pero dentro del layout general */}
                <Toast />
            </div>
        </ErrorBoundary>
    );
}

export default App;
