// C:\Proyectos\Label\backend\routes\globalProductRoutes.js
const express = require('express');
const router = express.Router();
const { getGlobalProducts } = require('../controllers/globalProductController'); // Importa solo la función de búsqueda pública

console.log('Cargando rutas globalProductRoutes...'); // <-- Log de depuración

// @route   GET /api/globalproducts
// @desc    Obtener productos del catálogo global por nombre o SKU (para sugerencias)
// @access  Public (estas rutas son para la búsqueda de sugerencias, no requieren protección inicial por token)
router.get('/', getGlobalProducts);

module.exports = router;
