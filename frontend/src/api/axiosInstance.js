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

    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            // Si el error es 401, no hemos reintentado esta petición antes,
            // Y LA PETICIÓN FALLIDA NO ES LA DE REFRESCAR EL TOKEN (para evitar bucles infinitos)
            if (error.response?.status === 401 && originalRequest.url !== '/auth/refresh' && !originalRequest._retry) {
                originalRequest._retry = true;
                console.log('Access token expired. Attempting to refresh...');
                try {                    
                    // ¡CLAVE #2! Hacemos la petición de refresco SIN cuerpo. 
                    // El navegador se encargará de adjuntar la cookie httpOnly automáticamente.
                    const { data } = await axiosInstance.post('/auth/refresh');
                    
                    // Actualizamos el nuevo token en el store de Redux
                    store.dispatch(setAccessToken(data.accessToken));
                    
                    // Actualizamos el header para la petición original y la reintentamos
                    originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
                    return axiosInstance(originalRequest);

                } catch (refreshError) {
                    // ¡ESTA ES LA PARTE CRÍTICA!
                    // Si el refresco falla, el refresh token es inválido. Debemos desloguear al usuario.
                    console.error('Token refresh failed. Logging out.', refreshError);
                    store.dispatch(logoutUser()); // Despachamos la acción de logout
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
};

export default axiosInstance;