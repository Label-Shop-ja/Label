// C:\Proyectos\Label\frontend\src\App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import AccessModal from './components/Auth/AccessModal';
import DashboardHome from './components/Dashboard/DashboardHome';
import WelcomePage from './pages/Public/WelcomePage'; // 1. Importamos nuestro nuevo componente

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

import DashboardLayout from './components/DashboardLayout';
import useAuth from './hooks/useAuth'; // Importamos nuestro hook
import { useCurrency } from './context/CurrencyContext';
import ProtectedRoute from './components/Auth/ProtectedRoute'; // Importamos el componente una sola vez
import ErrorBoundary from "./components/Common/ErrorBoundary";
import AuthCallbackPage from './pages/Auth/AuthCallbackPage'; // Importamos la nueva página
import LegalModal from './components/Common/LegalModal'; // Importamos el nuevo modal
import ResetPasswordPage from './pages/Auth/ResetPasswordPage'; // Importamos la página de reseteo
import ForgotPasswordModal from './components/Auth/ForgotPasswordModal'; // Importamos el nuevo modal
import Toast from './components/Common/Toast';

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpening, setIsModalOpening] = useState(false); // Estado para el spinner
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
    // Estado para el modal de términos y privacidad
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [legalContent, setLegalContent] = useState({ title: '', markdown: '' });
    const [isLegalLoading, setIsLegalLoading] = useState(false);
    

    // Obtenemos el estado de autenticación y carga directamente desde el store de Redux. ¡Esto está perfecto!
    const { isAuthenticated, isLoading: authLoading, verify } = useAuth();

    const { loadingCurrency, currencyError } = useCurrency();
    const location = useLocation();

    const handleOpenModal = () => {
        if (isModalOpening) return; // Prevenir doble clic
        setIsModalOpening(true);
        // Pequeño delay para que el spinner sea visible, mejorando la UX
        setTimeout(() => {
            setIsModalOpen(true);
            setIsModalOpening(false);
        }, 250);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    
    const handleOpenForgotPasswordModal = () => {
        setIsModalOpen(false); // Cierra el modal de acceso
        // Pequeño delay para que la animación de salida del primer modal termine
        setTimeout(() => {
            setIsForgotPasswordModalOpen(true);
        }, 300);
    };

    const handleBackToLogin = () => {
        setIsForgotPasswordModalOpen(false);
        // Pequeño delay para que la animación de salida termine
        setTimeout(() => setIsModalOpen(true), 300);
    };

    const handleOpenLegalModal = async (type) => {
        setIsLegalLoading(true);
        setIsLegalModalOpen(true);
        let filePath = '';
        let title = '';

        if (type === 'terms') {
            filePath = '/legal/terms.md';
            title = 'Términos de Servicio';
        } else if (type === 'privacy') {
            filePath = '/legal/privacy.md';
            title = 'Política de Privacidad';
        }

        if (filePath) {
            try {
                const response = await fetch(filePath);
                const markdown = await response.text();
                setLegalContent({ title, markdown });
            } catch (error) {
                console.error("Error fetching legal content:", error);
                setLegalContent({ title, markdown: 'Error al cargar el contenido. Por favor, inténtalo de nuevo más tarde.' });
            } finally {
                setIsLegalLoading(false);
            }
        }
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
                                    // 2. Renderizamos el nuevo componente y le pasamos la función para abrir el modal
                                    <WelcomePage onOpenModal={handleOpenModal} onOpenLegalModal={handleOpenLegalModal} isModalOpening={isModalOpening} />
                                )
                            }
                        />

                        {/* Nueva ruta para manejar el callback de OAuth */}
                        <Route path="/auth/callback" element={<AuthCallbackPage />} />
                        {/* Nueva ruta para la página de reseteo de contraseña */}
                        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                        {/* Grupo de rutas protegidas: El ProtectedRoute envuelve el DashboardLayout */}
                        <Route path="/dashboard/*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                            {/* Estas son las rutas anidadas que se renderizarán dentro del <Outlet /> de DashboardLayout */}
                            <Route index element={<DashboardHome />} /> {/* Ruta por defecto para /dashboard */}
                            <Route path="inventario" element={<InventoryPage />} />
                            <Route path="finanzas" element={<FinancialPage />} />
                            <Route path="pos" element={<PosPage />} />
                            <Route path="clientes" element={<ClientsPage />} />
                            <Route path="estadisticas" element={<StatsPage />} />
                            
                            {/* Rutas de Ajustes (ahora aplanadas para mayor claridad) */}
                            <Route path="ajustes" element={<SettingsPage />} />
                            <Route path="ajustes/tasas-personalizadas" element={<CustomRatesSettings />} />
                            {/* ¡RUTA SOLO PARA ADMINS! Envuelta en su propio ProtectedRoute con roles */}
                            <Route path="ajustes/panel-admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
                        </Route>

                        {/* Ruta para la página de "No Autorizado" */}
                        <Route path="/unauthorized" element={<UnauthorizedPage />} />

                        {/* Ruta comodín para cualquier otra ruta no definida (redirige a la raíz) */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AnimatePresence>

                {/* El modal de acceso ahora está envuelto en AnimatePresence para animar su salida */}
                <AnimatePresence>
                    {isModalOpen && (
                        <AccessModal onClose={handleCloseModal} onOpenLegalModal={handleOpenLegalModal} onOpenForgotPasswordModal={handleOpenForgotPasswordModal} />
                    )}
                    {isForgotPasswordModalOpen && (
                        <ForgotPasswordModal onClose={() => setIsForgotPasswordModalOpen(false)} onBackToLogin={handleBackToLogin} />
                    )}
                </AnimatePresence>

                {/* Modal para contenido legal, se renderiza sobre todo */}
                <LegalModal
                    isOpen={isLegalModalOpen}
                    onClose={() => setIsLegalModalOpen(false)}
                    title={legalContent.title}
                    isLoading={isLegalLoading}
                >
                    {legalContent.markdown}
                </LegalModal>
                {/* Componente Toast para mostrar notificaciones, fuera del <Routes> pero dentro del layout general */}
                <Toast />
            </div>
        </ErrorBoundary>
    );
}

export default App;
