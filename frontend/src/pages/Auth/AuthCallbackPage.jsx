import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/authSlice';
import api from '../../api/axiosInstance.js';
import ModernLoader from '../../components/Common/ModernLoader';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Hacemos la petición al nuevo endpoint del backend.
        // Como la redirección de Google estableció las cookies de sesión,
        // esta petición irá autenticada.
        const { data } = await api.get('/auth/status');

        if (data.isAuthenticated) {
          // Si el backend nos confirma que estamos autenticados,
          // guardamos las credenciales en Redux con la acción `setCredentials`.
          dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
          // Y redirigimos al dashboard.
          navigate('/dashboard');
        } else {
          // Si por alguna razón falla, redirigimos a la página de inicio.
          navigate('/');
        }
      } catch (err) {
        console.error('Error durante el callback de autenticación:', err);
        setError(err.message || 'Error de autenticación');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    checkAuthStatus();
  }, [dispatch, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold">Error de Autenticación</h2>
          <p className="text-gray-300">{error}</p>
          <p className="text-sm text-gray-400">Redirigiendo al inicio en unos segundos...</p>
        </div>
      </div>
    );
  }

  return <ModernLoader message="Finalizando autenticación" />;
};

export default AuthCallbackPage;