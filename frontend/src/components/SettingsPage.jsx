// C:\Proyectos\Label\frontend\src\components\SettingsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext'; // Importamos AuthContext directamente

const SettingsPage = () => {
  // Usamos useContext para obtener el usuario y la función login (para actualizar el token si el perfil cambia)
  const { user, login } = useContext(AuthContext);

  // Estados para los datos del perfil y la contraseña
  const [profileData, setProfileData] = useState({
    name: '', // Usamos 'name' porque así está en el backend y en el Header
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // Estados para UI y mensajes
  const [loading, setLoading] = useState(true); // Para indicar si la página está cargando datos iniciales
  const [profileMessage, setProfileMessage] = useState(''); // Mensajes de éxito para el perfil
  const [passwordMessage, setPasswordMessage] = useState(''); // Mensajes de éxito para la contraseña
  const [error, setError] = useState(''); // Mensajes de error generales

  // useEffect para cargar el perfil del usuario cuando el componente se monta
  // o cuando el objeto 'user' del contexto cambie (ej. al iniciar sesión)
  useEffect(() => {
    const fetchProfile = async () => {
      // Asegúrate de que el usuario y su ID estén disponibles antes de intentar cargar el perfil
      if (!user || !user._id) {
        setLoading(false);
        setError('No hay usuario autenticado o ID de usuario no disponible.');
        return;
      }
      try {
        setLoading(true);
        setError(''); // Limpiar errores previos
        // Realizar la petición GET para obtener el perfil del usuario
        const res = await axiosInstance.get('/users/profile');
        setProfileData({
          name: res.data.name,
          email: res.data.email,
        });
        setLoading(false); // La carga inicial ha terminado
      } catch (err) {
        console.error('Error al cargar perfil:', err);
        const errorMessage = err.response?.data?.message || 'Error al cargar el perfil.';
        setError(errorMessage);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]); // Dependencia del efecto: se ejecuta cuando el objeto 'user' cambia

  // Manejadores de cambios para los formularios
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Manejador para enviar el formulario de actualización de perfil
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos
    setProfileMessage(''); // Limpiar mensajes de éxito previos
    try {
      // Realizar la petición PUT para actualizar el perfil
      const res = await axiosInstance.put('/users/profile', profileData);
      setProfileMessage('Perfil actualizado exitosamente.');
      // Opcional: Actualizar el usuario en localStorage y en el contexto de AuthContext
      // Esto aseguraría que el nombre en el Header se actualice sin recargar la página.
      // Para esto, necesitarías que AuthContext exponga una función como `updateUser`
      // o que `login` re-autentique con el nuevo token si el backend envía uno nuevo.
      // Por ahora, el mensaje de éxito es suficiente.
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      const errorMessage = err.response?.data?.message || 'Error al actualizar perfil.';
      setError(errorMessage);
    }
  };

  // Manejador para enviar el formulario de cambio de contraseña
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos
    setPasswordMessage(''); // Limpiar mensajes de éxito previos

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('Las nuevas contraseñas no coinciden.');
      return;
    }
    if (passwordData.newPassword.length < 6) { // Validación básica de longitud
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      // Realizar la petición PUT para cambiar la contraseña
      await axiosInstance.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordMessage('Contraseña actualizada exitosamente.');
      // Limpiar los campos de la contraseña después de un cambio exitoso
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

  // Mostrar un mensaje de carga mientras se obtienen los datos del perfil
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen">
        <p className="text-xl text-action-blue">Cargando ajustes...</p>
      </div>
    );
  }

  // Renderizar el formulario de ajustes
  return (
    <div className="p-6 bg-dark-slate-gray rounded-lg shadow-xl min-h-screen">
      <h2 className="text-4xl font-extrabold text-copper-rose-accent mb-8 border-b-2 border-action-blue pb-4">Ajustes de Usuario</h2>

      {error && (
        <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">¡Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {/* Sección para Actualizar Perfil */}
      <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8 border border-neutral-gray-700">
        <h3 className="text-2xl font-semibold text-neutral-light mb-4">Actualizar Perfil</h3>
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
        <h3 className="text-2xl font-semibold text-neutral-light mb-4">Cambiar Contraseña</h3>
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
    </div>
  );
};

export default SettingsPage;