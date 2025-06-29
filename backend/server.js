import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js'; // Asumimos que tienes un archivo para la conexión a la BD
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Importar las rutas que hemos creado
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import exchangeRateRoutes from './routes/exchangeRateRoutes.js'; // Nueva ruta para tasas
import customExchangeRateRoutes from './routes/customExchangeRateRoutes.js'; // Nueva ruta para tasas personalizadas
import productRoutes from './routes/productRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

connectDB();

const app = express();

// Opciones de CORS para mayor seguridad en producción
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Solo permite peticiones desde tu frontend
  credentials: true, // Permite que el frontend envíe cookies
};

app.use(cors(corsOptions));

// Middleware para que Express pueda entender el formato JSON en el cuerpo de las peticiones
app.use(express.json());

// Middleware para parsear las cookies de las peticiones
app.use(cookieParser());

// --- Montaje de las rutas ---
// Le decimos a Express que cualquier petición que empiece con '/api/auth'
// debe ser manejada por nuestro `authRoutes`.
app.use('/api/auth', authRoutes);

// Cualquier petición que empiece con '/api/users' será manejada por `userRoutes`.
app.use('/api/users', userRoutes);
 
// --- Rutas para tasas de cambio --- (¡Ahora más organizadas!)
app.use('/api/exchangeRate', exchangeRateRoutes);
app.use('/api/custom-rates', customExchangeRateRoutes);

// --- Montaje del resto de las rutas de la aplicación ---
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

// --- Middlewares de manejo de errores (deben ir al final) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV}`));