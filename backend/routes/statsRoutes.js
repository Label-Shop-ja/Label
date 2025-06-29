// C:\Proyectos\Label\backend\routes\statsRoutes.js
import express from 'express';
const router = express.Router();
import { getSalesAndProductStats } from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';

// Rutas protegidas
router.get('/sales-products', protect, getSalesAndProductStats);

export default router;
