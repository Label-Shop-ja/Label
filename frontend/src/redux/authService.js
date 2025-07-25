import axiosInstance from '../api/axiosInstance';

const API_URL = '/auth/'; // Ruta base para la autenticación

const login = async (userData) => {
  return axiosInstance.post(API_URL + 'login', userData);
};

const register = async (userData) => {
  return axiosInstance.post(API_URL + 'register', userData);
};

const verifyToken = async () => {
  // La ruta correcta para verificar el token es /api/users/profile
  return axiosInstance.get('/users/profile');
};

const forgotPassword = async (email) => {
  // Hacemos una petición POST a la nueva ruta del backend
  const response = await axiosInstance.post(API_URL + 'forgot-password', { email });
  return response.data;
};

const verifyResetCode = async (verificationData) => {
  const { code } = verificationData;
  const response = await axiosInstance.post(API_URL + 'verify-reset-code', { code });
  return response.data;
};

const resetPassword = async (resetData) => {
  const { password, confirmPassword } = resetData;
  // El token temporal se envía automáticamente en el header por el interceptor de axios
  const response = await axiosInstance.post(API_URL + 'reset-password', { password, confirmPassword });
  return response.data;
};

export const authService = { login, register, verifyToken, forgotPassword, verifyResetCode, resetPassword };