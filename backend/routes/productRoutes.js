import express from 'express';
const router = express.Router();
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    updateMultipleProducts,
    deleteProduct,
    deleteMultipleProducts,
    getLowStockProducts,
    getHighStockProducts,
    getVariantInventoryReport,
    getProductFilterOptions,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import Product from '../models/productModel.js';

// Todas las rutas en este archivo estarán protegidas y requerirán un token válido.

// Rutas para reportes y alertas. Deben ir antes de la ruta con /:id para evitar conflictos.
router.route('/reports/variants')
    .get(protect, getVariantInventoryReport);

router.route('/alerts/low-stock')
    .get(protect, getLowStockProducts);

router.route('/alerts/high-stock')
    .get(protect, getHighStockProducts);

// Ruta base para obtener todos los productos y crear uno nuevo.
router.route('/')
    .get(protect, getProducts)
    .post(protect, createProduct)
    .delete(protect, deleteMultipleProducts); // <-- NUEVA LÍNEA

// NUEVA RUTA: Endpoint optimizado para obtener las opciones de los filtros
router.get('/filter-options', protect, getProductFilterOptions);

// NUEVA RUTA: Endpoint para actualizaciones en lote
router.put('/bulk-update', protect, updateMultipleProducts);

// NUEVA RUTA: Búsqueda global de productos
router.get('/global-search', protect, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json([]);
        }
        const products = await Product.find({
            user: req.user.id,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } },
                { sku: { $regex: q, $options: 'i' } }
            ]
        }).limit(10).select('name category sku imageUrl').lean();
        res.json(products);
    } catch (error) {
        console.error('Error en global-search:', error);
        res.status(500).json({ message: 'Error en búsqueda global' });
    }
});


// Ruta para un producto específico por su ID.
router.route('/:id')
    .get(protect, getProductById)
    .put(protect, updateProduct)
    .delete(protect, deleteProduct);

export default router;