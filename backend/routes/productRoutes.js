// C:\Proyectos\Label\backend\routes\productRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Importamos el middleware de protección
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController'); // Importamos los controladores

// Rutas para obtener todos los productos y crear un nuevo producto
// Ambas rutas están protegidas por el middleware 'protect'
router.route('/')
  .get(protect, getProducts) // GET /api/products
  .post(protect, createProduct); // POST /api/products

// Rutas para obtener, actualizar y eliminar un producto por ID
// Todas están protegidas y validan la pertenencia del producto al usuario
router.route('/:id')
  .get(protect, getProductById)   // GET /api/products/:id
  .put(protect, updateProduct)    // PUT /api/products/:id
  .delete(protect, deleteProduct); // DELETE /api/products/:id

module.exports = router;