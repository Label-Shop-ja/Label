// C:\Proyectos\Label\backend\routes\saleRoutes.js
const express = require('express');
const router = express.Router();
const {
  createSale,
  getSales,
  getSaleById,
} = require('../controllers/saleController');
// Importamos el middleware de protección. ¡Ahora lo importamos directamente!
const protect = require('../middleware/authMiddleware'); // <--- ¡CAMBIO AQUÍ!

// Rutas protegidas
router.route('/').post(protect, createSale).get(protect, getSales);
router.route('/:id').get(protect, getSaleById);

module.exports = router;
