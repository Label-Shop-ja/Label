// C:\Proyectos\Label\backend\routes\statsRoutes.js
const express = require('express');
const router = express.Router();
const { getSalesAndProductStats } = require('../controllers/statsController');
// Importamos el middleware de protección. ¡Ahora lo importamos directamente!
const protect = require('../middleware/authMiddleware'); // <--- ¡CAMBIO AQUÍ!

// Rutas protegidas
router.get('/sales-products', protect, getSalesAndProductStats);

module.exports = router;
