// C:\Proyectos\Label\frontend\src\context\AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance, { setLogoutFunction } from '../api/axiosInstance';

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
  const [loading, setLoading] = useState(true); // Se inicia como true

  // Usar useCallback para la función logout para que su referencia sea estable
  // *** CAMBIO CLAVE: ELIMINADA la redirección directa (window.location.href) ***
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
    // ¡Aquí ya NO se llama a window.location.href = '/'!
    // React Router DOM se encargará de la redirección
    // cuando isAuthenticated cambie a false en App.jsx o ProtectedRoute.jsx.
  }, []);

  // Función auxiliar para obtener el perfil del usuario
  const fetchUserProfile = async (token) => {
    if (!token) {
      return null;
    }
    try {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axiosInstance.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error("Error al obtener perfil del usuario (fetchUserProfile):", error.response?.data?.message || error.message);
      // Si hay un error al obtener el perfil, asumimos token inválido/expirado o usuario no encontrado.
      // El interceptor de Axios ya maneja el 'TokenExpiredError'. Aquí nos encargamos de otros errores.
      logout(); // Llama a logout para limpiar sesión, PERO YA NO REDIRIGE DIRECTAMENTE.
      return null;
    }
  };

  // Efecto para cargar el usuario desde localStorage y verificar el token al inicio
  useEffect(() => {
    const loadAuthStatus = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          const fetchedUser = await fetchUserProfile(storedToken);
          if (fetchedUser) {
            setUser(fetchedUser);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(fetchedUser));
          } else {
            // Si fetchUserProfile retorna null (token inválido/expirado, user no encontrado)
            // y no fue manejado por el interceptor, logout se encarga de limpiar.
            logout();
          }
        } else {
          // Si no hay token en localStorage, simplemente no está autenticado, limpia por si acaso.
          logout(); // Llama a logout para limpiar, PERO YA NO REDIRIGE DIRECTAMENTE.
        }
      } catch (error) {
        console.error("Error en la carga inicial de autenticación (loadAuthStatus):", error);
        logout(); // Asegurarse de limpiar si hay cualquier error inesperado
      } finally {
        setLoading(false); // La carga inicial SIEMPRE termina aquí
      }
    };

    loadAuthStatus();
  }, [logout]); // Dependencia en 'logout' para asegurar que la función actualizada se use si cambia.

  // Registrar la función de logout con el interceptor de Axios
  useEffect(() => {
    setLogoutFunction(logout);
  }, [logout]); // Dependencia en 'logout' para asegurar que siempre esté la versión más reciente

  // Funciones para interactuar con la API de autenticación (login y register)
  // Estas funciones lanzan errores en caso de fallo, como se corrigió en el paso anterior.
  const login = async (email, password) => {
    setLoading(true); // Activa la carga al inicio de la operación
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem('token', token);

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const fetchedUser = await fetchUserProfile(token);
      if (fetchedUser) {
        setUser(fetchedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(fetchedUser));
        return fetchedUser; // Devuelve el usuario si el login es exitoso
      } else {
        // Esto es un caso raro, pero si el perfil no se puede obtener después del login exitoso
        logout();
        throw new Error('No se pudo obtener el perfil del usuario después del login.');
      }
    } catch (error) {
      const errorMessage = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Error de red o del servidor';
      throw new Error(errorMessage); // Lanza el error
    } finally {
        setLoading(false); // Asegura que loading se desactive, sin importar éxito o fallo
    }
  };

  const register = async (userData) => {
    setLoading(true); // Activa la carga al inicio de la operación
    try {
      const response = await axiosInstance.post('/auth/register', userData);

      const { token } = response.data;
      localStorage.setItem('token', token);

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const fetchedUser = await fetchUserProfile(token);
      if (fetchedUser) {
        setUser(fetchedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(fetchedUser));
        return fetchedUser; // Devuelve el usuario si el registro es exitoso
      } else {
        logout();
        throw new Error('No se pudo obtener el perfil del usuario después del registro.');
      }
    } catch (error) {
      const errorMessage = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Error de red o del servidor';
      throw new Error(errorMessage); // Lanza el error
    } finally {
        setLoading(false); // Asegura que loading se desactive, sin importar éxito o fallo
    }
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
