// C:\Proyectos\Label\backend\server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('C:/Proyectos/Label/backend/routes/transactionRoutes'); // Ruta completa por seguridad
const saleRoutes = require('./routes/saleRoutes');
const clientRoutes = require('./routes/clientRoutes');
const statsRoutes = require('./routes/statsRoutes'); // Asegúrate de que esta línea esté aquí

require('dotenv').config();

console.log('Valor de MONGO_URI en server.js:', process.env.MONGO_URI);

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware
app.use(express.json());

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/stats', statsRoutes); // Asegúrate de que esta línea esté aquí

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});