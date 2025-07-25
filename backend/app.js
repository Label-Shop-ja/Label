import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Cargar las variables de entorno ANTES de cualquier otro import que las necesite
dotenv.config();


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
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import './config/passport-setup.js'; // Ahora sí puede leer las variables de entorno

const app = express();

// Configuración de Express Session (requerido por Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Una clave secreta para firmar la cookie de sesión
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
// Configuración de CORS
// Permite que el frontend se comunique con el backend
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      /^http:\/\/192\.168\..+:5173$/,
      /^http:\/\/10\..+:5173$/,
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\..+:5173$/
    ];
    
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
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