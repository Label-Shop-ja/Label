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

const resetPassword = async (resetData) => {
  const { token, password, confirmPassword } = resetData;
  // Llama a la nueva ruta del backend con el token y las contraseñas
  const response = await axiosInstance.post(API_URL + `reset-password/${token}`, { password, confirmPassword });
  return response.data;
};

export const authService = { login, register, verifyToken, forgotPassword, resetPassword };