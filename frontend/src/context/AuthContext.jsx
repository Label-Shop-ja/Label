// C:\Proyectos\Label\frontend\src\context\AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // axiosInstance ya tiene la baseURL configurada

// 1. Crear el Contexto de Autenticación
export const AuthContext = createContext(null);

// 2. Crear un Hook Personalizado para usar el Contexto
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

  // --- Función auxiliar para obtener el perfil del usuario ---
  const fetchUserProfile = async (token) => {
    if (!token) {
      return null;
    }
    try {
      // Configurar el token para esta petición de perfil en la instancia de Axios
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axiosInstance.get('/users/profile'); // <-- Ruta relativa
      return response.data; // Devuelve los datos del perfil
    } catch (error) {
      console.error("Error al obtener perfil del usuario:", error.response?.data?.message || error.message);
      // Si el token es inválido o expirado, limpiar la sesión
      logout();
      return null;
    }
  };

  // --- Efecto para cargar el usuario desde localStorage y verificar el token al inicio ---
  useEffect(() => {
    const loadAuthStatus = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          const fetchedUser = await fetchUserProfile(storedToken);
          if (fetchedUser) {
            setUser(fetchedUser);
            setIsAuthenticated(true);
            // No es estrictamente necesario guardar el usuario en localStorage aquí,
            // pero lo mantengo por consistencia si decides usarlo en algún otro lugar.
            // La "verdadera" fuente de datos del usuario es el backend a través de fetchUserProfile.
            localStorage.setItem('user', JSON.stringify(fetchedUser));
          }
        }
      } catch (error) {
        console.error("Error en la carga inicial de autenticación:", error);
        logout(); // Asegurarse de limpiar si hay cualquier error inesperado
      } finally {
        setLoading(false); // La carga inicial ha terminado
      }
    };

    loadAuthStatus();
  }, []); // Se ejecuta solo una vez al montar el componente

  // --- Funciones para interactuar con la API de autenticación ---

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', { // <-- Ruta relativa
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem('token', token);

      const fetchedUser = await fetchUserProfile(token);
      if (fetchedUser) {
        setUser(fetchedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(fetchedUser));
      } else {
        logout();
        throw new Error('No se pudo obtener el perfil del usuario después del login.');
      }

      setLoading(false);
      return fetchedUser;
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Error de red o del servidor';
      throw errorMessage;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', userData); // <-- Ruta relativa

      const { token } = response.data;
      localStorage.setItem('token', token);

      const fetchedUser = await fetchUserProfile(token);
      if (fetchedUser) {
        setUser(fetchedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(fetchedUser));
      } else {
        logout();
        throw new new Error('No se pudo obtener el perfil del usuario después del registro.');
      }

      setLoading(false);
      return fetchedUser;
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Error de red o del servidor';
      throw errorMessage;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

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
