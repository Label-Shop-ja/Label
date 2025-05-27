// C:\Proyectos\Label\backend\routes\saleRoutes.js
const express = require('express');
const router = express.Router();
const {
  createSale,
  getSales,
  getSaleById,
} = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware'); // Importa el middleware de protección

// Rutas protegidas
router.route('/').post(protect, createSale).get(protect, getSales);
router.route('/:id').get(protect, getSaleById);

module.exports = router;