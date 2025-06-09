// C:\Proyectos\Label\backend\controllers\globalProductController.js
const GlobalProduct = require('../models/GlobalProduct');
const asyncHandler = require('express-async-handler');

// @desc    Crea o actualiza un producto global.
//          Esta función es llamada internamente por productController cuando un usuario crea un producto.
// @access  Internal (no es una ruta API directa)
const createGlobalProduct = async (productData) => {
    const { name, description, category, sku, unitOfMeasure, brand, supplier } = productData;

    // Asegurarse de que el SKU esté limpio y en mayúsculas para la búsqueda.
    const cleanedSku = String(sku).trim().toUpperCase();

    try {
        let globalProduct = await GlobalProduct.findOne({ sku: cleanedSku });

        if (globalProduct) {
            // Si el producto global ya existe, simplemente lo devolvemos.
            // La actualización de `lastUsedAt` se maneja en el `productController`
            // o a través del middleware `pre('save')` en el modelo `GlobalProduct`.
            return globalProduct;
        } else {
            // Si no existe, creamos un nuevo producto global
            globalProduct = await GlobalProduct.create({
                name,
                description: description || '',
                category,
                sku: cleanedSku,
                unitOfMeasure,
                brand: brand || '',
                supplier: supplier || '',
                lastUsedAt: Date.now(), // Se establece la primera vez que se usa
            });
            console.log(`Nuevo GlobalProduct creado: ${globalProduct.sku}`);
            return globalProduct;
        }
    } catch (error) {
        console.error(`Error en createGlobalProduct para SKU ${cleanedSku}:`, error.message);
        throw new Error('Error al procesar el producto en el catálogo global: ' + error.message);
    }
};

// @desc    Obtener todas las categorías únicas del catálogo global
// @route   GET /api/globalproducts/categories
// @access  Private (o se podría hacer pública si el catálogo global no requiere autenticación para esto)
const getGlobalProductCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await GlobalProduct.distinct('category');
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías globales', error: error.message });
    }
});

// @desc    Obtener todas las marcas únicas del catálogo global
// @route   GET /api/globalproducts/brands
// @access  Private
const getGlobalProductBrands = asyncHandler(async (req, res) => {
    try {
        const brands = await GlobalProduct.distinct('brand');
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener marcas globales', error: error.message });
    }
});

// @desc    Obtener todos los proveedores únicos del catálogo global
// @route   GET /api/globalproducts/suppliers
// @access  Private
const getGlobalProductSuppliers = asyncHandler(async (req, res) => {
    try {
        const suppliers = await GlobalProduct.distinct('supplier');
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proveedores globales', error: error.message });
    }
});

// @desc    Obtener productos globales con búsqueda
// @route   GET /api/globalproducts
// @access  Private (para sugerencias)
const getGlobalProducts = asyncHandler(async (req, res) => {
    const { searchTerm } = req.query;
    const query = {};

    if (searchTerm) {
        const trimmedSearchTerm = searchTerm.trim();
        if (trimmedSearchTerm) {
            query.$or = [
                { name: { $regex: trimmedSearchTerm, $options: 'i' } },
                { sku: { $regex: trimmedSearchTerm, $options: 'i' } },
                { category: { $regex: trimmedSearchTerm, $options: 'i' } },
                { brand: { $regex: trimmedSearchTerm, $options: 'i' } },
                { supplier: { $regex: trimmedSearchTerm, $options: 'i' } },
            ];
        }
    }

    const globalProducts = await GlobalProduct.find(query).limit(10); // Limitar sugerencias a 10
    res.status(200).json(globalProducts);
});


module.exports = {
    createGlobalProduct,
    getGlobalProductCategories,
    getGlobalProductBrands,
    getGlobalProductSuppliers,
    getGlobalProducts,
};
