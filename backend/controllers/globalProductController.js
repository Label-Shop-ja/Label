// C:\Proyectos\Label\backend\controllers\globalProductController.js
import GlobalProduct from '../models/GlobalProduct.js';
import asyncHandler from 'express-async-handler';

// @desc    Crea o actualiza un producto global.
//          Esta función es llamada internamente por productController cuando un usuario crea un producto.
// @access  Internal (no es una ruta API directa)
export const createGlobalProduct = async (productData) => {
    // Añadimos imageUrl al destructuring para poder recibirlo desde productController
    const { name, description, category, sku, unitOfMeasure, brand, supplier, imageUrl } = productData;

    // Asegurarse de que el SKU esté limpio y en mayúsculas para la búsqueda.
    const cleanedSku = String(sku).trim().toUpperCase();

    try {
        let globalProduct = await GlobalProduct.findOne({ sku: cleanedSku });

        if (globalProduct) {
            // Si el producto global ya existe, lo actualizamos con la nueva información,
            // incluyendo la imageUrl si viene.
            globalProduct.name = name;
            globalProduct.description = description || '';
            globalProduct.category = category;
            globalProduct.unitOfMeasure = unitOfMeasure;
            globalProduct.brand = brand || '';
            globalProduct.supplier = supplier || '';
            // Solo actualizamos imageUrl si se proporciona una nueva (no si es undefined o null)
            globalProduct.imageUrl = imageUrl !== undefined && imageUrl !== null ? imageUrl : globalProduct.imageUrl;
            globalProduct.lastUsedAt = Date.now(); // Aseguramos que se actualice el lastUsedAt con cada uso

            await globalProduct.save(); // Guardar los cambios actualizados
            return globalProduct;
        } else {
            // Si no existe, creamos un nuevo producto global, incluyendo imageUrl
            globalProduct = await GlobalProduct.create({
                name,
                description: description || '',
                category,
                sku: cleanedSku,
                unitOfMeasure,
                brand: brand || '',
                supplier: supplier || '',
                imageUrl: imageUrl || undefined, // Guardamos la URL, si no viene, Mongoose usará el default del modelo
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
// @access  Private
export const getGlobalProductCategories = asyncHandler(async (req, res) => {
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
export const getGlobalProductBrands = asyncHandler(async (req, res) => {
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
export const getGlobalProductSuppliers = asyncHandler(async (req, res) => {
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
export const getGlobalProducts = asyncHandler(async (req, res) => {
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
