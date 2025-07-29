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
            const originalRequest = error.config;
            
            if (error.response?.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const { data } = await axiosInstance.post('/auth/refresh');
                    const { accessToken } = data;
                    
                    store.dispatch(setAccessToken(accessToken));
                    processQueue(null, accessToken);
                    
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    store.dispatch(logoutUser());
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
            return Promise.reject(error);
        }
    );
};

export default axiosInstance;