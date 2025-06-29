import express from 'express';
const router = express.Router();
import {
  getExchangeRate,
  setExchangeRate,
  fetchOfficialRate,
} from '../controllers/exchangeRateController.js';
import { protect } from '../middleware/authMiddleware.js'; // Asumimos que tienes este middleware de protección

// Rutas relativas a /api/exchangeRate

// GET /api/exchangeRate/ y POST /api/exchangeRate/
router.route('/')
  .get(protect, getExchangeRate)
  .post(protect, setExchangeRate);

// GET /api/exchangeRate/fetch
router.get('/fetch', protect, fetchOfficialRate);

export default router;