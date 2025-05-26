// C:\Proyectos\Label\frontend\src\api\axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // Esta es la URL base de tu backend API
  withCredentials: true, // Importante para enviar cookies (aunque usaremos Bearer tokens)
});

export default axiosInstance;