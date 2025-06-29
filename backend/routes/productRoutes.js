// E:\Proyectos\Label\backend\routes\productRoutes.js
import express from 'express';
const router = express.Router();
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getHighStockProducts, // <-- ASEGÚRATE DE QUE ESTA FUNCIÓN ESTÉ AQUÍ
    getVariantInventoryReport, // <-- NUEVA FUNCIÓN IMPORTADA
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js'; // Middleware para proteger rutas

// --- CRUD de Productos ---
router.route('/').get(protect, getProducts).post(protect, createProduct);
router.route('/:id').get(protect, getProduct).put(protect, updateProduct).delete(protect, deleteProduct);

// --- Alertas de Inventario ---
router.get('/alerts/low-stock', protect, getLowStockProducts);
router.get('/alerts/high-stock', protect, getHighStockProducts);

// --- Reportes de Inventario ---
router.get('/reports/variants', protect, getVariantInventoryReport);

export default router;
