// C:\Proyectos\Label\frontend\src\context\AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

// 1. Crear el Contexto de Autenticación
const AuthContext = createContext(null);

// 2. Crear un Hook Personalizado para usar el Contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configuración base de axiosInstance
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

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
      // Configurar el token para esta petición de perfil
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axiosInstance.get(`${API_URL}/users/profile`);
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
        // No cargamos el 'user' directamente de localStorage aquí,
        // sino que lo obtenemos del backend para asegurar que esté fresco y el token sea válido.
        if (storedToken) {
          const fetchedUser = await fetchUserProfile(storedToken);
          if (fetchedUser) {
            setUser(fetchedUser);
            setIsAuthenticated(true);
            // Almacenar el usuario recién obtenido en localStorage (opcional, pero consistente)
            localStorage.setItem('user', JSON.stringify(fetchedUser));
          } else {
            // Si fetchUserProfile falló (token inválido/expirado), ya habrá llamado a logout()
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
      const response = await axiosInstance.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token } = response.data; // Solo necesitamos el token inicialmente
      localStorage.setItem('token', token);

      // Obtener el perfil del usuario con el nuevo token
      const fetchedUser = await fetchUserProfile(token);
      if (fetchedUser) {
        setUser(fetchedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(fetchedUser)); // Guardar el user en localStorage
      } else {
        // Esto no debería ocurrir si el login fue exitoso y el token es válido
        logout(); // Limpiar por seguridad
        throw new Error('No se pudo obtener el perfil del usuario después del login.');
      }

      setLoading(false);
      return fetchedUser; // Devolver los datos del usuario completo
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
      const response = await axiosInstance.post(`${API_URL}/auth/register`, userData);

      const { token } = response.data; // Solo necesitamos el token inicialmente
      localStorage.setItem('token', token);

      // Obtener el perfil del usuario con el nuevo token
      const fetchedUser = await fetchUserProfile(token);
      if (fetchedUser) {
        setUser(fetchedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(fetchedUser)); // Guardar el user en localStorage
      } else {
        logout();
        throw new Error('No se pudo obtener el perfil del usuario después del registro.');
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
    delete axiosInstance.defaults.headers.common['Authorization']; // Eliminar el header de autorización
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