// C:\Proyectos\Label\backend\routes\saleRoutes.js
import express from 'express';
const router = express.Router();
import {
  createSale,
  getSales,
  getSaleById,
} from '../controllers/saleController.js';
import { protect } from '../middleware/authMiddleware.js';

// Rutas protegidas
router.route('/').post(protect, createSale).get(protect, getSales);
router.route('/:id').get(protect, getSaleById);

export default router;
