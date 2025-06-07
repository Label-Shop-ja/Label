// C:\Proyectos\Label\backend\controllers\globalProductController.js
const GlobalProduct = require('../models/GlobalProduct');
const asyncHandler = require('express-async-handler');

// @desc    Obtener productos del catálogo global por nombre o SKU (para sugerencias)
// @route   GET /api/globalproducts
// @access  Public (no requiere autenticación, ya que es un catálogo de sugerencias)
const getGlobalProducts = asyncHandler(async (req, res) => {
    const { searchTerm } = req.query; // Término de búsqueda desde la URL

    // Si no hay término de búsqueda, podríamos retornar una lista vacía
    // o un mensaje, o los primeros 10 productos para mostrar ejemplos.
    // Por ahora, si no hay searchTerm, no devolvemos nada (o un array vacío).
    if (!searchTerm || searchTerm.trim() === '') {
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

    // Opcional: Limitar la cantidad de resultados para las sugerencias
    // Una búsqueda de sugerencias no debería devolver miles de resultados.
    const limit = parseInt(req.query.limit, 10) || 10; // Por defecto, 10 sugerencias

    try {
        const globalProducts = await GlobalProduct.find(query)
            .limit(limit)
            .select('name description category sku unitOfMeasure brand supplier'); // Selecciona solo los campos relevantes para la sugerencia

        res.status(200).json(globalProducts);
    } catch (error) {
        console.error("Error al buscar productos globales:", error);
        res.status(500).json({ message: 'Error al buscar sugerencias de productos.' });
    }
});

// @desc    Añadir un producto al catálogo global (uso interno/moderación)
// @route   POST /api/globalproducts
// @access  Private (para que solo usuarios autorizados o el sistema lo añadan)
// NOTA: Esta función será llamada internamente desde createProduct del productController
//       cuando un usuario añade un producto nuevo y no existe en el catálogo global.
const createGlobalProduct = asyncHandler(async (productData) => {
    const { name, description, category, sku, unitOfMeasure, brand, supplier } = productData;

    // Verificar si el SKU ya existe en el catálogo global
    const existingGlobalProduct = await GlobalProduct.findOne({ sku: sku.toUpperCase() });

    if (existingGlobalProduct) {
        // console.log(`Producto global con SKU ${sku} ya existe. No se duplicará.`);
        return existingGlobalProduct; // Retorna el producto existente si ya está
    }

    // Crear el nuevo producto global
    const newGlobalProduct = await GlobalProduct.create({
        name,
        description: description || '',
        category,
        sku: sku.toUpperCase(),
        unitOfMeasure,
        brand: brand || '',
        supplier: supplier || '',
    });

    // console.log(`Nuevo producto global creado: ${newGlobalProduct.name} (${newGlobalProduct.sku})`);
    return newGlobalProduct; // Retorna el nuevo producto global
});


module.exports = {
    getGlobalProducts,
    createGlobalProduct, // Exportamos esta función también para uso interno
};
