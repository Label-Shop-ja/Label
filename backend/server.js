// C:\Proyectos\Label\backend\server.js
const path = require('path'); // Restaurado: útil para servir archivos estáticos en producción
const express = require('express');
const dotenv = require('dotenv').config(); // Asegúrate de cargar .env al principio
const colors = require('colors'); // Restaurado: para logs con colores en consola
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Importar rutas existentes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const saleRoutes = require('./routes/saleRoutes');
const clientRoutes = require('./routes/clientRoutes');
const statsRoutes = require('./routes/statsRoutes');
const globalProductRoutes = require('./routes/globalProductRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // ¡Nueva importación para la subida de imágenes!
const exchangeRateRoutes = require('./routes/exchangeRateRoutes'); // <-- ¡NUEVA LÍNEA!

console.log('Valor de MONGO_URI en server.js:', process.env.MONGO_URI.magenta); // Usando colors

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware
app.use(express.json()); // Para requests con body en formato JSON
app.use(express.urlencoded({ extended: false }));

// Configuración de CORS
app.use(cors({
    origin: 'http://localhost:5173', // Tu frontend local
    credentials: true
}));

// Rutas de la API
console.log('Cargando rutas de usuarios...');
app.use('/api/users', userRoutes);
console.log('Cargando rutas de autenticación...');
app.use('/api/auth', authRoutes);
console.log('Cargando rutas de productos...');
app.use('/api/products', productRoutes);
console.log('Cargando rutas de transacciones...');
app.use('/api/transactions', transactionRoutes);
console.log('Cargando rutas de ventas...');
app.use('/api/sales', saleRoutes);
console.log('Cargando rutas de clientes...');
app.use('/api/clients', clientRoutes);
console.log('Cargando rutas de estadísticas...');
app.use('/api/stats', statsRoutes);
console.log('Cargando rutas de productos globales...');
app.use('/api/globalproducts', globalProductRoutes);
console.log('Cargando rutas de subida de imágenes...'); // Nuevo log para la nueva ruta
app.use('/api/upload', uploadRoutes); // ¡Nueva ruta para la subida de imágenes!
console.log('Cargando rutas de Tasa de Cambio...'); // Nuevo log para la nueva ruta Tasa de cambio
app.use('/api/exchangeRate', exchangeRateRoutes); // <-- ¡NUEVA LÍNEA!

// Middleware de manejo de errores personalizado - DEBE IR AL FINAL DE LAS RUTAS
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`.cyan.bold); // Usando colors
    // No se programa la limpieza aquí, será manejada por un Cron Job externo (Render)
});
