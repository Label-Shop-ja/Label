// C:\Proyectos\Label\backend\routes\statsRoutes.js
const express = require('express');
const router = express.Router();
const { getSalesAndProductStats } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

// Rutas protegidas
router.get('/sales-products', protect, getSalesAndProductStats);

module.exports = router;