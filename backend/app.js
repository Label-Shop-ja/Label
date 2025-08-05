import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { createHelmet, mongoSanitizer, additionalSecurity } from './middleware/securityMiddleware.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { requestLogger, securityLogger } from './middleware/loggingMiddleware.js';

// Load environment variables BEFORE any other imports that need them
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
import healthRoutes from './routes/healthRoutes.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import './config/passport-setup.js'; // Ahora sí puede leer las variables de entorno

const app = express();

// Security middleware - Apply early in the middleware stack
app.use(createHelmet()); // Security headers
app.use(mongoSanitizer); // Prevent NoSQL injection
app.use(additionalSecurity); // Custom security headers

// Express Session configuration (required by Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Una clave secreta para firmar la cookie de sesión
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
// CORS configuration for production and development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN?.split(',') || [process.env.FRONTEND_URL]
    : ['http://localhost:5173', /^http:\/\/192\.168\..+:5173$/],
  credentials: true,
  optionsSuccessStatus: 200 // Support legacy browsers
};

app.use(cors(corsOptions));

// Middleware para que Express pueda entender el formato JSON en el cuerpo de las peticiones
app.use(express.json());

// Middleware para parsear las cookies de las peticiones
app.use(cookieParser());

// Logging middleware
app.use(requestLogger);
app.use(securityLogger);

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

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

// Health check routes (no rate limiting)
app.use('/', healthRoutes);

// --- Middlewares de manejo de errores (deben ir al final) ---
app.use(notFound);
app.use(errorHandler);

export default app;