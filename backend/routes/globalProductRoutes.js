// C:\Proyectos\Label\backend\routes\globalProductRoutes.js
import express from 'express';
const router = express.Router();
import { getGlobalProducts } from '../controllers/globalProductController.js'; // Importa solo la función de búsqueda pública

console.log('Cargando rutas globalProductRoutes...'); // <-- Log de depuración

// @route   GET /api/globalproducts
// @desc    Obtener productos del catálogo global por nombre o SKU (para sugerencias)
// @access  Public (estas rutas son para la búsqueda de sugerencias, no requieren protección inicial por token)
router.get('/', getGlobalProducts);

export default router;
