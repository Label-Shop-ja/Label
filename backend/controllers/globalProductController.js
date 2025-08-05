// C:\Proyectos\Label\backend\controllers\globalProductController.js
import GlobalProduct from '../models/GlobalProduct.js';
import asyncHandler from 'express-async-handler';

// @desc    Crea o actualiza un producto global.
//          Esta función es llamada internamente por productController cuando un usuario crea un producto.
// @access  Internal (no es una ruta API directa)
export const createGlobalProduct = async (productData) => {
    // Extraer todos los campos necesarios del producto
    const { 
        name, description, category, sku, unitOfMeasure, brand, supplier, imageUrl,
        model, barcode, weight, length, width, height, color, size, material,
        isPerishable, reorderThreshold, optimalMaxStock, shelfLifeDays, profitPercentage
    } = productData;

    // Asegurarse de que el SKU esté limpio y en mayúsculas para la búsqueda.
    const cleanedSku = String(sku).trim().toUpperCase();

    try {
        let globalProduct = await GlobalProduct.findOne({ sku: cleanedSku });

        if (globalProduct) {
            // Si el producto global ya existe, lo actualizamos con la nueva información
            globalProduct.name = name;
            globalProduct.description = description || '';
            globalProduct.category = category;
            globalProduct.unitOfMeasure = unitOfMeasure;
            globalProduct.brand = brand || '';
            globalProduct.supplier = supplier || '';
            globalProduct.imageUrl = imageUrl !== undefined && imageUrl !== null ? imageUrl : globalProduct.imageUrl;
            globalProduct.model = model || globalProduct.model;
            globalProduct.barcode = barcode || globalProduct.barcode;
            globalProduct.weight = weight !== undefined ? weight : globalProduct.weight;
            globalProduct.length = length !== undefined ? length : globalProduct.length;
            globalProduct.width = width !== undefined ? width : globalProduct.width;
            globalProduct.height = height !== undefined ? height : globalProduct.height;
            globalProduct.color = color || globalProduct.color;
            globalProduct.size = size || globalProduct.size;
            globalProduct.material = material || globalProduct.material;
            globalProduct.isPerishable = isPerishable !== undefined ? isPerishable : globalProduct.isPerishable;
            globalProduct.reorderThreshold = reorderThreshold !== undefined ? reorderThreshold : globalProduct.reorderThreshold;
            globalProduct.optimalMaxStock = optimalMaxStock !== undefined ? optimalMaxStock : globalProduct.optimalMaxStock;
            globalProduct.shelfLifeDays = shelfLifeDays !== undefined ? shelfLifeDays : globalProduct.shelfLifeDays;
            globalProduct.profitPercentage = profitPercentage !== undefined ? profitPercentage : globalProduct.profitPercentage;
            globalProduct.lastUsedAt = Date.now();

            await globalProduct.save();
            return globalProduct;
        } else {
            // Si no existe, creamos un nuevo producto global con todos los campos
            globalProduct = await GlobalProduct.create({
                name,
                description: description || '',
                category,
                sku: cleanedSku,
                unitOfMeasure,
                brand: brand || '',
                supplier: supplier || '',
                imageUrl: imageUrl || undefined,
                model: model || '',
                barcode: barcode || '',
                weight: weight || 0,
                length: length || 0,
                width: width || 0,
                height: height || 0,
                color: color || '',
                size: size || '',
                material: material || '',
                isPerishable: isPerishable || false,
                reorderThreshold: reorderThreshold || 0,
                optimalMaxStock: optimalMaxStock || 0,
                shelfLifeDays: shelfLifeDays || 0,
                profitPercentage: profitPercentage || 30,
                lastUsedAt: Date.now(),
            });
            // console.log(`Nuevo GlobalProduct creado: ${globalProduct.sku}`);
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
