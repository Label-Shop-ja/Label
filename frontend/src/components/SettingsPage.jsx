// C:\Proyectos\Label\frontend\src\components\SettingsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import ErrorBoundary from "./Common/ErrorBoundary";

const SettingsPage = () => {
  const { user, login } = useContext(AuthContext);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !user._id) {
        setLoading(false);
        setError('No hay usuario autenticado o ID de usuario no disponible.');
        return;
      }
      try {
        setLoading(true);
        setError('');
        const res = await axiosInstance.get('/users/profile');
        setProfileData({
          name: res.data.name,
          email: res.data.email,
        });
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar perfil:', err);
        const errorMessage = err.response?.data?.message || 'Error al cargar el perfil.';
        setError(errorMessage);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProfileMessage('');
    try {
      await axiosInstance.put('/users/profile', profileData);
      setProfileMessage('Perfil actualizado exitosamente.');
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      const errorMessage = err.response?.data?.message || 'Error al actualizar perfil.';
      setError(errorMessage);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordMessage('');

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('Las nuevas contraseñas no coinciden.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      await axiosInstance.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordMessage('Contraseña actualizada exitosamente.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      const errorMessage = err.response?.data?.message || 'Error al cambiar contraseña.';
      setError(errorMessage);
    }
  };

  return (
    <ErrorBoundary>
      <div>
        <h2 className="text-4xl font-extrabold text-copper-rose-accent mb-8 border-b-2 border-action-blue pb-4">Ajustes</h2>

        {loading && (
          <div className="flex justify-center items-center h-full min-h-screen">
            <p className="text-xl text-action-blue">Cargando ajustes...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">¡Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Sección criminal para tasas personalizadas */}
            <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8 border border-neutral-gray-700">
              <h3 className="text-2xl font-semibold text-neutral-light mb-4">Configuración del Negocio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  to="/dashboard/ajustes/tasas-personalizadas"
                  className="bg-neutral-gray-800 p-6 rounded-lg border border-transparent hover:border-action-blue hover:bg-neutral-gray-700 transition-all duration-300 cursor-pointer group flex items-center"
                >
                  <SlidersHorizontal className="text-action-blue mr-4 flex-shrink-0" size={32} />
                  <div>
                    <h4 className="text-xl font-semibold text-neutral-light">Tasas de Cambio</h4>
                    <p className="text-neutral-gray-400 mt-1">Administra tus monedas y tasas de cambio personalizadas.</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Sección para Actualizar Perfil */}
            <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8 border border-neutral-gray-700">
              <h3 className="text-2xl font-semibold text-neutral-light mb-4">Mi Perfil</h3>
              <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-neutral-light text-sm font-bold mb-2">Nombre:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-neutral-light text-sm font-bold mb-2">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    required
                  />
                </div>
                <div className="md:col-span-2 text-right">
                  {profileMessage && <p className="text-green-400 text-sm mb-2">{profileMessage}</p>}
                  <button
                    type="submit"
                    className="bg-copper-rose-accent hover:bg-rose-700 text-neutral-light font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    Actualizar Perfil
                  </button>
                </div>
              </form>
            </div>

            {/* Sección para Cambiar Contraseña */}
            <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner border border-neutral-gray-700">
              <h3 className="text-2xl font-semibold text-neutral-light mb-4">Seguridad de la Cuenta</h3>
              <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-neutral-light text-sm font-bold mb-2">Contraseña Actual:</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-neutral-light text-sm font-bold mb-2">Nueva Contraseña:</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="confirmNewPassword" className="block text-neutral-light text-sm font-bold mb-2">Confirmar Nueva Contraseña:</label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    required
                  />
                </div>
                <div className="md:col-span-2 text-right">
                  {passwordMessage && <p className="text-green-400 text-sm mb-2">{passwordMessage}</p>}
                  <button
                    type="submit"
                    className="bg-copper-rose-accent hover:bg-rose-700 text-neutral-light font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    Cambiar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SettingsPage;