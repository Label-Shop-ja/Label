import asyncHandler from 'express-async-handler';
import { productService } from '../services/productService.js';

// @desc    Obtener todos los productos del usuario con filtros, paginación y ordenamiento
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
    const result = await productService.getProducts(req.user.id, req.query);
    res.status(200).json(result);
});

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id, req.user.id);
    res.status(200).json(product);
});

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body, req.user.id);
    res.status(201).json(product);
});

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
    const updatedProduct = await productService.updateProduct(
        req.params.id,
        req.body,
        req.user.id
    );
    res.status(200).json(updatedProduct);
});

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
    await productService.deleteProduct(req.params.id, req.user.id);
    res.status(200).json({ message: 'Producto eliminado exitosamente.' });
});

// @desc    Obtener reporte de inventario detallado por variante
// @route   GET /api/products/reports/variants
// @access  Private
const getVariantInventoryReport = asyncHandler(async (req, res) => {
    const report = await productService.getVariantInventoryReport(req.user.id);
    res.status(200).json(report);
});

// @desc    Obtener productos con stock bajo
// @route   GET /api/products/alerts/low-stock
// @access  Private
const getLowStockProducts = asyncHandler(async (req, res) => {
    const products = await productService.getLowStockProducts(req.user.id);
    res.status(200).json(products);
});

// @desc    Obtener productos con stock alto (perecederos)
// @route   GET /api/products/alerts/high-stock
// @access  Private
const getHighStockProducts = asyncHandler(async (req, res) => {
    const products = await productService.getHighStockProducts(req.user.id);
    res.status(200).json(products);
});

export {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getHighStockProducts,
    getVariantInventoryReport,
};