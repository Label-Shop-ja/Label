// C:\Proyectos\Label\backend\controllers\globalProductController.js
const GlobalProduct = require('../models/GlobalProduct');
const asyncHandler = require('express-async-handler');

console.log('Cargando controlador globalProductController...'); // <-- Log de depuración

// @desc    Obtener productos del catálogo global por nombre o SKU (para sugerencias)
// @route   GET /api/globalproducts
// @access  Public
const getGlobalProducts = asyncHandler(async (req, res) => {
    console.log('Accediendo a getGlobalProducts...'); // <-- Log de depuración
    const { searchTerm } = req.query; // Término de búsqueda desde la URL

    // Si no hay término de búsqueda, retornamos una lista vacía
    if (!searchTerm || searchTerm.trim() === '') {
        console.log('No searchTerm proporcionado para productos globales.'); // <-- Log de depuración
        return res.status(200).json([]);
    }

    // Construir la consulta de búsqueda
    // Buscamos en 'name' o 'sku' usando expresiones regulares para búsqueda parcial e insensible a mayúsculas/minúsculas
    const query = {
        $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { sku: { $regex: searchTerm, $options: 'i' } },
        ]
    };

    // Limitar la cantidad de resultados para las sugerencias
    const limit = parseInt(req.query.limit, 10) || 10; // Por defecto, 10 sugerencias

    try {
        const globalProducts = await GlobalProduct.find(query)
            .limit(limit)
            .select('name description category sku unitOfMeasure brand supplier'); // Selecciona solo los campos relevantes

        console.log(`Sugerencias encontradas para "${searchTerm}": ${globalProducts.length}`); // <-- Log de depuración
        res.status(200).json(globalProducts);
    } catch (error) {
        console.error("Error al buscar sugerencias de productos globales:", error); // <-- Mantener este log
        res.status(500).json({ message: 'Error al buscar sugerencias de productos.' });
    }
});

// @desc    Añadir un producto al catálogo global (uso interno/moderación)
// @route   POST /api/globalproducts
// @access  Private (para que solo usuarios autorizados o el sistema lo añadan)
// NOTA: Esta función será llamada internamente desde createProduct del productController
//       cuando un usuario añade un producto nuevo y no existe en el catálogo global.
const createGlobalProduct = asyncHandler(async (productData) => {
    console.log('Intentando crear/actualizar producto global:', productData.sku); // <-- Log de depuración
    const { name, description, category, sku, unitOfMeasure, brand, supplier } = productData;

    // Asegurarse de limpiar el SKU aquí también
    const cleanedSku = String(sku).trim();
    if (cleanedSku === '') {
        console.error('SKU vacío enviado a createGlobalProduct.');
        throw new Error('El SKU global no puede estar vacío.');
    }

    // Verificar si el SKU ya existe en el catálogo global
    const existingGlobalProduct = await GlobalProduct.findOne({ sku: cleanedSku.toUpperCase() });

    if (existingGlobalProduct) {
        // Actualizar el producto global si ya existe (mejora la calidad del catálogo)
        const updatedGlobalProduct = await GlobalProduct.findOneAndUpdate(
            { sku: cleanedSku.toUpperCase() }, // Criterio de búsqueda
            {
                name: name || existingGlobalProduct.name, // Actualiza si se proporciona, sino mantiene el anterior
                description: description !== undefined ? description : existingGlobalProduct.description,
                category: category || existingGlobalProduct.category,
                unitOfMeasure: unitOfMeasure || existingGlobalProduct.unitOfMeasure,
                brand: brand !== undefined ? brand : existingGlobalProduct.brand,
                supplier: supplier !== undefined ? supplier : existingGlobalProduct.supplier,
            },
            { new: true, runValidators: true } // new: true devuelve el documento actualizado; runValidators: true aplica validaciones
        );
        console.log(`Producto global con SKU ${cleanedSku} actualizado.`); // <-- Log de depuración
        return updatedGlobalProduct; // Retorna el producto existente pero actualizado
    }

    // Si no existe, crear el nuevo producto global
    const newGlobalProduct = await GlobalProduct.create({
        name,
        description: description || '',
        category,
        sku: cleanedSku.toUpperCase(),
        unitOfMeasure,
        brand: brand || '',
        supplier: supplier || '',
    });

    console.log(`Nuevo producto global creado: ${newGlobalProduct.name} (${newGlobalProduct.sku})`); // <-- Log de depuración
    return newGlobalProduct; // Retorna el nuevo producto global
});

module.exports = {
    getGlobalProducts,
    createGlobalProduct, // Exportamos esta función también para uso interno
};
