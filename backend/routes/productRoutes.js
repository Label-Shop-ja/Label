// E:\Proyectos\Label\backend\routes\productRoutes.js
const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getGlobalProducts, // <-- ASEGÚRATE DE QUE ESTA FUNCIÓN ESTÉ AQUÍ
} = require('../controllers/productController');
const protect = require('../middleware/authMiddleware'); // Middleware para proteger rutas

// Rutas para productos (requieren autenticación)
router.route('/').get(protect, getProducts).post(protect, createProduct);
router.route('/:id').get(protect, getProduct).put(protect, updateProduct).delete(protect, deleteProduct);

// Ruta para productos globales (puede ser pública o privada según tu necesidad)
// Por ahora la dejamos pública, pero puedes añadir `protect` si prefieres
router.get('/globalproducts', getGlobalProducts); // <-- NUEVA RUTA AQUÍ

module.exports = router;
