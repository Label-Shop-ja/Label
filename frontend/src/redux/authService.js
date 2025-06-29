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

export const authService = { login, register, verifyToken };