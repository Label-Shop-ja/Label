import express from 'express';
const router = express.Router();
import {
  createCustomRate,
  getCustomRates,
  updateCustomRate,
  deleteCustomRate,
} from '../controllers/customExchangeRateController.js';
import { protect } from '../middleware/authMiddleware.js'; // Asumimos que tienes este middleware

// Rutas relativas a /api/custom-rates

// GET /api/custom-rates/ y POST /api/custom-rates/
router.route('/')
  .get(protect, getCustomRates)
  .post(protect, createCustomRate);

// PUT /api/custom-rates/:id y DELETE /api/custom-rates/:id
router.route('/:id')
  .put(protect, updateCustomRate)
  .delete(protect, deleteCustomRate);

export default router;