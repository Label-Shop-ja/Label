// E:\Proyectos\Label\backend\routes\productRoutes.js
const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getGlobalProducts,
    getLowStockProducts,
    getHighStockProducts, // <-- ASEGÚRATE DE QUE ESTA FUNCIÓN ESTÉ AQUÍ
    getVariantInventoryReport, // <-- NUEVA FUNCIÓN IMPORTADA
} = require('../controllers/productController');
const protect = require('../middleware/authMiddleware'); // Middleware para proteger rutas

// Rutas para productos (requieren autenticación)
router.route('/').get(protect, getProducts).post(protect, createProduct);
router.route('/:id').get(protect, getProduct).put(protect, updateProduct).delete(protect, deleteProduct);

// Ruta para productos globales (puede ser pública o privada según tu necesidad)
// Por ahora la dejamos pública, pero puedes añadir `protect` si prefieres
router.get('/globalproducts', getGlobalProducts); // <-- NUEVA RUTA AQUÍ
// Rutas para alertas de stock bajo y alto
router.get('/alerts/low-stock', protect, getLowStockProducts); // Nueva ruta para alertas de stock bajo
router.get('/alerts/high-stock', protect, getHighStockProducts); // Nueva ruta para alertas de stock alto (perecederos)

// NUEVA RUTA: Reporte de inventario por variante
    router.get('/reports/variants', protect, getVariantInventoryReport); // Requiere autenticación

module.exports = router;
