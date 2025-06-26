// C:\Proyectos\Label\frontend\src\api\axiosInstance.js
import axios from 'axios';

// Determina la URL base de tu backend.
// Usa la variable de entorno VITE_BACKEND_URL (para producción en Render)
// o 'http://localhost:5000' (para desarrollo local).
// Asegúrate de que tu archivo .env.development o .env.production en la raíz del frontend
// contenga VITE_BACKEND_URL=https://label-backend-api.onrender.com/api
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let logoutFunction = null;

export const setLogoutFunction = (callback) => {
  logoutFunction = callback;
};

// Interceptor de solicitudes
// Se ejecuta antes de CADA solicitud HTTP saliente
axiosInstance.interceptors.request.use(
  (config) => {
    // Intenta obtener los datos del usuario del localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    // Si el objeto 'user' existe y tiene un token, lo adjunta
    const token = user ? user.token : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta de Axios (mejorado)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Si el status es 401 y el mensaje indica token expirado, forzamos logout
      // Es importante que el mensaje de tu backend sea consistente con 'No autorizado, token expirado.'
      if (status === 401 && data.message === 'No autorizado, token expirado.') {
        console.warn('Token expirado detectado. Forzando cierre de sesión...');
        if (logoutFunction) {
          logoutFunction(); // Llama a la función logout del AuthContext
          // IMPORTANTE: Ya NO se redirige aquí con window.location.href.
          // La redirección será manejada por AuthContext y React Router.
        } else {
          // Fallback por si la función de logout no está registrada (menos probable)
          localStorage.removeItem('user'); // Consistente con 'user' object
          // La redirección se hará a través del ProtectedRoute o lógica en App.jsx
        }
      }
    } else {
      // Manejo de errores cuando no hay respuesta del servidor
      let message = 'ERROR_DEFAULT';
      if (error.request) {
        // No hay respuesta del servidor
        message = 'ERROR_NETWORK';
      }
      // Adjunta el mensaje traducible al error para usarlo en los componentes
      error.translatedMessage = message;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
