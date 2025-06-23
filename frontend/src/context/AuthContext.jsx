// C:\Proyectos\Label\frontend\src\context\AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance, { setLogoutFunction } from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom'; // Asegúrate de que useNavigate esté importado

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Función de cierre de sesión
  // Ahora, esta función SÓLO limpia el estado local y localStorage.
  // La redirección será manejada por los componentes de ruta protegida (ej. PrivateRoute o App.jsx)
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user'); // Siempre elimina el objeto 'user' completo
    // Ya no se necesita delete axiosInstance.defaults.headers.common['Authorization']
    // porque el interceptor de solicitud en axiosInstance.js lo gestiona dinámicamente.
    // console.log('Sesión cerrada y datos de usuario limpiados.'); // Para depuración
  }, []);

  // Función auxiliar para obtener el perfil del usuario
  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    const userFromStorage = JSON.parse(localStorage.getItem('user'));
    const token = userFromStorage ? userFromStorage.token : null;

    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      localStorage.removeItem('user'); // Asegúrate de limpiar si el token no existe
      return;
    }

    try {
      // axiosInstance ya tiene el interceptor que adjunta el token por nosotros
      const response = await axiosInstance.get('/users/profile');
      const { token: _, ...userDetails } = response.data; // Extrae userDetails sin el token
      setUser(userDetails);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error al obtener perfil del usuario (fetchUserProfile):', error.message);
      // Si hay un error (ej. 401 no detectado por interceptor de respuesta, o cualquier otro error),
      // forzamos el logout para limpiar la sesión y el estado de autenticación.
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]); // Dependencia en 'logout'

  // Efecto para verificar la autenticación inicial al cargar la aplicación
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]); // Dependencia en 'fetchUserProfile'

  // Registrar la función de logout con el interceptor de Axios para que se llame en caso de 401/token expirado
  useEffect(() => {
    setLogoutFunction(logout);
  }, [logout]);

  // Función de inicio de sesión
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      // response.data debería contener { user: {..., token: '...' } }
      // Asegúrate de que tu backend devuelve el user object con el token.
      localStorage.setItem('user', JSON.stringify(response.data)); // Almacena el objeto 'user' completo

      // Extrae userDetails para el estado, sin el token
      const { token: _, ...userDetails } = response.data;
      setUser(userDetails);
      setIsAuthenticated(true);
      navigate('/dashboard'); // Navega al dashboard en login exitoso
      return { success: true, user: userDetails };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error de inicio de sesión. Por favor, verifica tus credenciales.';
      console.error('Error en login:', errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Función de registro
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      localStorage.setItem('user', JSON.stringify(response.data)); // Almacena el objeto 'user' completo

      const { token: _, ...userDetails } = response.data;
      setUser(userDetails);
      setIsAuthenticated(true);
      navigate('/dashboard');
      return { success: true, user: userDetails };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error de registro. Por favor, inténtalo de nuevo.';
      console.error('Error en register:', errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const authContextValue = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
