// f:\Proyectos\Label\frontend\src\api\axiosInstance.js
import axios from 'axios';
import { logoutUser, setAccessToken } from '../redux/authSlice';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
            // Si el error es 401 y no hemos reintentado esta petición antes
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                console.log('Access token expired. Attempting to refresh...');
                try {
                    const refreshToken = store.getState().auth.refreshToken;
                    if (!refreshToken) {
                        // Si no hay refresh token, desloguear inmediatamente.
                        store.dispatch(logoutUser());
                        return Promise.reject(error);
                    }

                    // Petición al endpoint de refresco
                    const { data } = await axios.post(`${axiosInstance.defaults.baseURL}/auth/refresh`, { refreshToken });
                    
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