import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/authSlice';
import api from '../../api/axiosInstance.js'; // Corregido: Apunta a la instancia de axios configurada

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      } catch (error) {
        console.error('Error durante el callback de autenticación:', error);
        // En caso de error, también redirigimos a la página de inicio.
        navigate('/');
      }
    };

    checkAuthStatus();
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text-base">
      <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-t-transparent border-primary"></div>
      <p className="mt-4 text-lg text-text-muted">Finalizando autenticación...</p>
    </div>
  );
};

export default AuthCallbackPage;