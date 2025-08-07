import { lazy } from 'react';

// Páginas principales
export const WelcomePage = lazy(() => import('../pages/Public/WelcomePage'));
export const ProfilePage = lazy(() => import('../pages/Dashboard/ProfilePage'));
export const AdminPanel = lazy(() => import('../pages/Admin/AdminPanel'));

// Componentes de inventario
export const InventoryPage = lazy(() => import('../components/Inventory/InventoryPage'));
export const AddEditProductForm = lazy(() => import('../components/Inventory/AddEditProductForm'));
export const ProductTable = lazy(() => import('../components/Inventory/ProductTable'));

// Componentes POS
export const PosPage = lazy(() => import('../components/PosPage'));
export const PaymentModal = lazy(() => import('../components/Pos/PaymentModal'));

// Páginas de configuración
export const SettingsPage = lazy(() => import('../components/SettingsPage'));
export const CustomRatesSettings = lazy(() => import('../pages/Settings/CustomRatesSettings'));

// Componentes de estadísticas
export const StatsPage = lazy(() => import('../components/StatsPage'));
export const FinancialPage = lazy(() => import('../components/FinancialPage'));

// Componentes de clientes
export const ClientsPage = lazy(() => import('../components/ClientsPage'));