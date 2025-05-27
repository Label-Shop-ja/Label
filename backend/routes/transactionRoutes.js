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
const { protect } = require('../middleware/authMiddleware');

// Rutas protegidas

// SIEMPRE COLOCA LAS RUTAS ESPECÍFICAS PRIMERO
router.get('/summary', protect, getFinancialSummary); // <--- ESTA RUTA DEBE IR PRIMERO

router.route('/').get(protect, getTransactions).post(protect, createTransaction);
router.route('/:id').get(protect, getTransactionById).put(protect, updateTransaction).delete(protect, deleteTransaction);

module.exports = router;