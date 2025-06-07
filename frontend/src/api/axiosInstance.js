// C:\Proyectos\Label\frontend\src\api\axiosInstance.js
    import axios from 'axios';

    const axiosInstance = axios.create({
        baseURL: 'https://label-backend-api.onrender.com/api', // <-- ¡Asegúrate de que sea EXACTAMENTE este URL!
        withCredentials: true,
    });

let logoutFunction = null;

export const setLogoutFunction = (callback) => {
    logoutFunction = callback;
};

// Interceptor de respuesta de Axios
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response) {
            const { status, data } = error.response;

            // Si el status es 401 (Unauthorized) y el mensaje indica token expirado
            // O si simplemente el status es 401 y hay un logoutFunction disponible,
            // ya que algunos 401 podrían indicar directamente que la sesión es inválida.
            // Optamos por la detección explícita del mensaje "token expirado" como lo hace tu backend.
            if (status === 401 && data.message === 'No autorizado, token expirado.') {
                console.warn('Token expirado detectado. Forzando cierre de sesión...');
                if (logoutFunction) {
                    logoutFunction(); // Llama a la función logout del AuthContext de inmediato
                    // Redirigir ya se hace en la función logout, pero lo mantenemos como fallback
                    // para claridad o si decides que logout no redirija por sí mismo.
                    if (window.location.pathname !== '/') { // Evita redireccionar si ya estamos en la raíz
                        window.location.href = '/';
                    }
                } else {
                    // Fallback si por alguna razón la función de logout no está registrada
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    if (window.location.pathname !== '/') {
                        window.location.href = '/';
                    }
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;