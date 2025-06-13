// E:\Proyectos\Label\backend\config\cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Asegúrate de cargar las variables de entorno aquí para que sean accesibles

// Configuración de Cloudinary con tus credenciales del archivo .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Usa HTTPS para las URLs de Cloudinary, es una buena práctica de seguridad
});

module.exports = cloudinary;
