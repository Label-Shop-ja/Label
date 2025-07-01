import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Importar las rutas que hemos creado
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import exchangeRateRoutes from './routes/exchangeRateRoutes.js';
import customExchangeRateRoutes from './routes/customExchangeRateRoutes.js';
import productRoutes from './routes/productRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

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
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exchangeRate', exchangeRateRoutes);
app.use('/api/custom-rates', customExchangeRateRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

// --- Middlewares de manejo de errores (deben ir al final) ---
app.use(notFound);
app.use(errorHandler);

export default app;