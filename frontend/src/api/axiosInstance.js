// f:\Proyectos\Label\frontend\src\api\axiosInstance.js
import axios from 'axios';
import { logoutUser, setAccessToken } from '../redux/authSlice';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
    withCredentials: true, // ¡CLAVE #1! Permite que Axios envíe cookies (como el refreshToken) en las peticiones.
});

// Esta función es clave para romper dependencias circulares
export const setupAxiosInterceptors = (store) => {
    axiosInstance.interceptors.request.use(
        (config) => {
            const token = store.getState().auth.accessToken;
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    let isRefreshing = false;
    let failedQueue = [];

    const processQueue = (error, token = null) => {
        failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        });
        failedQueue = [];
    };

    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            // Si es 401 y no es una ruta de auth, limpiar estado
            if (error.response?.status === 401 && !error.config.url.includes('/auth/')) {
                console.warn('Token inválido detectado, limpiando estado...');
                store.dispatch(logoutUser());
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                localStorage.setItem('wasLoggedOut', 'true');
            }
            return Promise.reject(error);
        }
    );
};

export default axiosInstance;