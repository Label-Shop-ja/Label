// E:\Proyectos\Label\backend\config\cloudinaryConfig.js
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config'; // Asegúrate de cargar las variables de entorno aquí para que sean accesibles

// Configuración de Cloudinary con tus credenciales del archivo .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Usa HTTPS para las URLs de Cloudinary, es una buena práctica de seguridad
});

export default cloudinary;
