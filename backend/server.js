// C:\Proyectos\Label\backend\server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware'); // <--- Asegúrate de que esta línea exista

// Importar rutas existentes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const saleRoutes = require('./routes/saleRoutes');
const clientRoutes = require('./routes/clientRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Importar las nuevas rutas de productos globales
const globalProductRoutes = require('./routes/globalProductRoutes');

require('dotenv').config(); // Cargar variables de entorno

console.log('Valor de MONGO_URI en server.js:', process.env.MONGO_URI);

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware
app.use(express.json()); // Para requests con body en formato JSON

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173', // Tu frontend local
  credentials: true
}));

// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/globalproducts', globalProductRoutes); // <--- Rutas de productos globales

// Middleware de manejo de errores personalizado - DEBE IR AL FINAL DE LAS RUTAS
app.use(errorHandler); // <--- Asegúrate de que esta línea exista y esté aquí

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
