// Main App component with routing and layout
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useServiceWorker } from './hooks/useServiceWorker';
import { preloadCriticalResources, prefetchResources } from './utils/resourceOptimizer';
import UpdateAvailable from './components/Common/UpdateAvailable';

// Critical components (loaded immediately)
import AccessModal from './components/Auth/AccessModal';
import DashboardLayout from './components/DashboardLayout';
import useAuth from './hooks/useAuth';
import { useCurrency } from './context/CurrencyContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Toast from './components/Common/Toast';

// Lazy loaded components
const WelcomePage = lazy(() => import('./pages/Public/WelcomePage'));
const DashboardHome = lazy(() => import('./components/Dashboard/DashboardHome'));
const InventoryPage = lazy(() => import('./components/Inventory/InventoryPage'));
const FinancialPage = lazy(() => import('./components/FinancialPage'));
const PosPage = lazy(() => import('./components/PosPage'));
const ClientsPage = lazy(() => import('./components/ClientsPage'));
const StatsPage = lazy(() => import('./components/StatsPage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const CustomRatesSettings = lazy(() => import('./pages/Settings/CustomRatesSettings'));
const AdminPanel = lazy(() => import('./pages/Admin/AdminPanel'));
const UnauthorizedPage = lazy(() => import('./pages/Common/UnauthorizedPage'));
const AuthCallbackPage = lazy(() => import('./pages/Auth/AuthCallbackPage'));
const LegalModal = lazy(() => import('./components/Common/LegalModal'));
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage'));
const ForgotPasswordModal = lazy(() => import('./components/Auth/ForgotPasswordModal'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-deep-night-blue">
    <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-copper-rose-accent"></div>
    <p className="ml-3 text-lg text-neutral-light">Cargando...</p>
  </div>
);

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpening, setIsModalOpening] = useState(false); // State for loading spinner
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [legalContent, setLegalContent] = useState({ title: '', markdown: '' });
    const [isLegalLoading, setIsLegalLoading] = useState(false);
    const [updateDismissed, setUpdateDismissed] = useState(false);
    
    // Sidebar state
    const [isSidebarPinned, setSidebarPinned] = useState(false);
    const [isSidebarHovered, setSidebarHovered] = useState(false);
    
    // Service Worker
    const { updateAvailable, updateServiceWorker } = useServiceWorker();
    
    const isSidebarExpanded = isSidebarPinned || isSidebarHovered;

    const { isAuthenticated, isLoading: authLoading, verify } = useAuth();
    const { loadingCurrency, currencyError } = useCurrency();
    const location = useLocation();

    const handleOpenModal = () => {
        if (isModalOpening) return; // Prevenir doble clic
        setIsModalOpening(true);
        // Small delay to make spinner visible, improving UX
        setTimeout(() => {
            setIsModalOpen(true);
            setIsModalOpening(false);
        }, 250);
    };

    const handleCloseModal = () => setIsModalOpen(false);
    
    const handleOpenForgotPasswordModal = () => {
        setIsModalOpen(false); // Close access modal
        // Small delay for exit animation to complete
        setTimeout(() => {
            setIsForgotPasswordModalOpen(true);
        }, 300);
    };

    const handleBackToLogin = () => {
        setIsForgotPasswordModalOpen(false);
        // Small delay for exit animation to complete
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
                setLegalContent({ title, markdown: 'Error al cargar el contenido.' });
            } finally {
                setIsLegalLoading(false);
            }
        }
    };

    useEffect(() => {
        // Performance optimizations
        preloadCriticalResources();
        
        // Prefetch likely next routes
        if (isAuthenticated) {
            prefetchResources(['/dashboard', '/inventario', '/pos']);
        }
        
        // Auth verification
        const hasToken = localStorage.getItem('accessToken');
        const wasLoggedOut = localStorage.getItem('wasLoggedOut') === 'true';
        
        if (!isAuthenticated && !wasLoggedOut && hasToken) {
            verify();
        }
    }, [verify, isAuthenticated]);

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
                    <Suspense fallback={<PageLoader />}>
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
                        {/* Ruta para la página de reseteo de contraseña (ya no necesita token en la URL) */}
                        <Route path="/reset-password" element={<ResetPasswordPage />} />

                        {/* Grupo de rutas protegidas: El ProtectedRoute envuelve el DashboardLayout */}
                        <Route 
                            path="/dashboard/*" 
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout 
                                        isSidebarExpanded={isSidebarExpanded}
                                        isSidebarPinned={isSidebarPinned}
                                        onToggleSidebarPin={() => setSidebarPinned(!isSidebarPinned)}
                                        onSidebarEnter={() => setSidebarHovered(true)}
                                        onSidebarLeave={() => setSidebarHovered(false)}
                                    />
                                </ProtectedRoute>
                            }
                        >
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
                    </Suspense>
                </AnimatePresence>

                {/* Modales con lazy loading */}
                <AnimatePresence>
                    {isModalOpen && (
                        <AccessModal onClose={handleCloseModal} onOpenLegalModal={handleOpenLegalModal} onOpenForgotPasswordModal={handleOpenForgotPasswordModal} />
                    )}
                    {isForgotPasswordModalOpen && (
                        <Suspense fallback={null}>
                            <ForgotPasswordModal onClose={() => setIsForgotPasswordModalOpen(false)} onBackToLogin={handleBackToLogin} />
                        </Suspense>
                    )}
                </AnimatePresence>

                {/* Modal para contenido legal */}
                {isLegalModalOpen && (
                    <Suspense fallback={null}>
                        <LegalModal
                            isOpen={isLegalModalOpen}
                            onClose={() => setIsLegalModalOpen(false)}
                            title={legalContent.title}
                            isLoading={isLegalLoading}
                        >
                            {legalContent.markdown}
                        </LegalModal>
                    </Suspense>
                )}
                {/* Componente Toast para mostrar notificaciones, fuera del <Routes> pero dentro del layout general */}
                <Toast />
                
                {/* Update notification */}
                <UpdateAvailable
                    isVisible={updateAvailable && !updateDismissed}
                    onUpdate={updateServiceWorker}
                    onDismiss={() => setUpdateDismissed(true)}
                />
            </div>
        </ErrorBoundary>
    );
}

export default App;