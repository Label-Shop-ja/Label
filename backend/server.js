// C:\Proyectos\Label\backend\server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

require('dotenv').config(); // Carga las variables de entorno desde .env

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Configuración de CORS para permitir solicitudes desde tu frontend
// ¡IMPORTANTE! Asegúrate de que 'http://localhost:5173' coincida con la URL de tu frontend
app.use(cors({
  origin: 'http://localhost:5173', // <--- ¡Esta es la corrección más importante!
  credentials: true // Permite el envío de cookies o encabezados de autorización si los usas
}));

// Definición de Rutas API
app.use('/api/users', userRoutes); // Rutas para operaciones de usuarios
app.use('/api/auth', authRoutes);   // Rutas para autenticación (registro, login)

// Puerto en el que escuchará el servidor. Tomará el valor de la variable de entorno PORT,
// o 5000 si no está definida (común en desarrollo).
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});