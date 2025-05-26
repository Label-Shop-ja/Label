// C:\Proyectos\Label\backend\server.js
require('dotenv').config(); // Cargar variables de entorno al principio

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Para manejar cookies si las usas

// Importar middlewares personalizados
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

// --- Inicializar la aplicación Express ---
const app = express(); // ¡¡¡ASEGURATE QUE ESTA LÍNEA ESTÉ AQUÍ!!!
const port = process.env.PORT || 5000;

// --- Conexión a la Base de Datos MongoDB ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conexión a MongoDB Atlas exitosa'))
  .catch(err => {
    console.error('❌ Error al conectar a MongoDB Atlas:', err.message);
    process.exit(1); // Salir del proceso si hay un error de conexión a la BD
  });

// --- Middlewares Esenciales de Express ---
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Permite solicitudes desde tu frontend
  credentials: true, // Importante para enviar cookies/tokens en peticiones con credenciales
}));
app.use(express.json()); // Permite a Express leer JSON en el cuerpo de las solicitudes
app.use(express.urlencoded({ extended: false })); // Permite a Express leer datos de formularios URL-encoded
app.use(cookieParser()); // Para parsear cookies (si se usan para JWT)

// --- Rutas de la API ---
// Ruta de prueba general
app.get('/', (req, res) => {
  res.status(200).json({ message: '¡Bienvenido a la API de Label! Servidor funcionando.' });
});

// Rutas específicas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// --- Middlewares de Manejo de Errores (DEBEN IR AL FINAL de todas las rutas) ---
app.use(notFound);      // Maneja rutas no encontradas (404)
app.use(errorHandler);  // Manejador de errores general

// --- Inicio del Servidor ---
app.listen(port, () => {
  console.log(`🚀 Servidor de Label corriendo en http://localhost:${port}`);
});