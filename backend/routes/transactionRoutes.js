// C:\Proyectos\Label\backend\routes\transactionRoutes.js
import express from 'express';
const router = express.Router();
import {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

// Rutas protegidas

// SIEMPRE COLOCA LAS RUTAS ESPECÍFICAS PRIMERO
router.get('/summary', protect, getFinancialSummary); // Esta ruta debe ir primero

router.route('/').get(protect, getTransactions).post(protect, createTransaction);
router.route('/:id').get(protect, getTransactionById).put(protect, updateTransaction).delete(protect, deleteTransaction);

export default router;
