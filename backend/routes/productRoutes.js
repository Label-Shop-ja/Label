// C:\Proyectos\Label\backend\routes\productRoutes.js
const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware'); // Importa el middleware de protección

// Rutas protegidas
router.route('/').get(protect, getProducts).post(protect, createProduct);
router.route('/:id').get(protect, getProductById).put(protect, updateProduct).delete(protect, deleteProduct);

module.exports = router;