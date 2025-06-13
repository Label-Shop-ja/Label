// C:\Proyectos\Label\backend\routes\transactionRoutes.js
const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary,
} = require('../controllers/transactionController');
// Importamos el middleware de protección. ¡Ahora lo importamos directamente!
const protect = require('../middleware/authMiddleware'); // <--- ¡CAMBIO AQUÍ!

// Rutas protegidas

// SIEMPRE COLOCA LAS RUTAS ESPECÍFICAS PRIMERO
router.get('/summary', protect, getFinancialSummary); // Esta ruta debe ir primero

router.route('/').get(protect, getTransactions).post(protect, createTransaction);
router.route('/:id').get(protect, getTransactionById).put(protect, updateTransaction).delete(protect, deleteTransaction);

module.exports = router;
