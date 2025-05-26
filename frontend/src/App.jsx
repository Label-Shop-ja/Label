// C:\Proyectos\Label\frontend\src\App.jsx
import React, { useState, useEffect } from 'react'; // Necesitamos useEffect para el loading
import { Routes, Route, Navigate } from 'react-router-dom'; // Importa Routes y Route, NO Router

import AccessModal from './components/AccessModal';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';

// Importar los nuevos componentes de "páginas"
import InventoryPage from './components/InventoryPage';
import FinancialPage from './components/FinancialPage';
import PosPage from './components/PosPage';
import ClientsPage from './components/ClientsPage';
import StatsPage from './components/StatsPage';
import SettingsPage from './components/SettingsPage';

import { useAuth } from './context/AuthContext'; // <-- Importa el hook useAuth

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Eliminamos el estado `isAuthenticated` de aquí, ahora lo obtenemos del contexto
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Consumimos el contexto de autenticación
  const { isAuthenticated, loading, logout, user } = useAuth();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // handleLoginSuccess ya no es necesario aquí, la lógica de login se mueve a AccessModal
  // const handleLoginSuccess = () => {
  //   setIsAuthenticated(true);
  //   setIsModalOpen(false);
  // };

  // Si la aplicación está cargando (ej. verificando autenticación inicial), mostrar un spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-night-blue text-neutral-light">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-copper-rose-accent"></div>
        <p className="ml-3 text-lg">Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-deep-night-blue text-neutral-light font-inter">
        {isAuthenticated ? (
          // Si el usuario está autenticado, muestra el layout del Dashboard
          <div className="flex flex-col h-screen">
            {/* Pasamos 'user' al Header para mostrar el nombre */}
            <Header onLogout={logout} currentUser={user} />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 p-8 bg-gray-900 text-neutral-light overflow-y-auto">
                <Routes>
                  <Route path="/" element={<DashboardHome />} />
                  <Route path="/inventario" element={<InventoryPage />} />
                  <Route path="/finanzas" element={<FinancialPage />} />
                  <Route path="/pos" element={<PosPage />} />
                  <Route path="/clientes" element={<ClientsPage />} />
                  <Route path="/estadisticas" element={<StatsPage />} />
                  <Route path="/ajustes" element={<SettingsPage />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        ) : (
          // Si el usuario NO está autenticado, muestra la página de inicio o el modal
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-6xl font-bold mb-6 text-copper-rose-accent">
                Label
              </h1>
              <p className="text-2xl mb-8 max-w-2xl">
                Un ecosistema comercial hiperlocal diseñado para Cumaná, simplificando la gestión y el intercambio de negocios.
              </p>
              <button
                onClick={handleOpenModal}
                className="bg-action-blue hover:bg-blue-700 text-neutral-light font-bold py-4 px-10 rounded-full text-2xl shadow-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Acceder
              </button>
            </div>

            {/* Ya no pasamos onLoginSuccess, ya que el modal usará login/register del contexto */}
            {/* El modal ahora manejará su propio cierre después de llamar a login/register */}
            {isModalOpen && <AccessModal onClose={handleCloseModal} />}
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;