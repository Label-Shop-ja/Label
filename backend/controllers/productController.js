// C:\Proyectos\Label\backend\controllers\productController.js
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const { createGlobalProduct } = require('./globalProductController'); // Importamos la función para uso interno

// @desc    Obtener todos los productos del usuario con búsqueda, filtro y paginación
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
    // 1. Inicializar el objeto de consulta para Mongoose
    const query = { user: req.user.id };

    // 2. Implementar búsqueda por nombre (name)
    if (req.query.name) {
        // Usar una expresión regular para búsqueda parcial e insensible a mayúsculas/minúsculas
        query.name = { $regex: req.query.name, $options: 'i' };
    }

    // 3. Implementar filtrado por categoría (category)
    if (req.query.category && req.query.category !== 'Todas las Categorías') {
        query.category = req.query.category;
    }

    // Opcional: Filtrado por SKU, marca, proveedor o unidad de medida si se agregan en el frontend
    if (req.query.sku) {
        query.sku = { $regex: req.query.sku, $options: 'i' };
    }
    if (req.query.brand) {
        query.brand = { $regex: req.query.brand, $options: 'i' };
    }
    if (req.query.supplier) {
        query.supplier = { $regex: req.query.supplier, $options: 'i' };
    }
    if (req.query.unitOfMeasure) {
        query.unitOfMeasure = req.query.unitOfMeasure;
    }

    // 4. Paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // 5. Contar el total de productos que coinciden con la consulta (sin paginación)
    const totalProducts = await Product.countDocuments(query);

    // 6. Obtener los productos con paginación y ordenamiento
    const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // 7. Calcular información de paginación
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 8. Enviar la respuesta con los productos y la información de paginación
    res.status(200).json({
        products,
        pagination: {
            totalProducts,
            totalPages,
            currentPage: page,
            limit,
            hasNextPage,
            hasPrevPage,
        },
    });
});

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, category, price, stock, costPrice, sku, unitOfMeasure, brand, supplier } = req.body;

    // Validaciones iniciales para campos requeridos, incluyendo SKU y Costo
    if (!name || !category || !price || !stock || costPrice === undefined || !sku || !unitOfMeasure) {
        res.status(400);
        throw new Error('Por favor, completa todos los campos obligatorios: Nombre, Categoría, Precio de Venta, Costo, SKU, Unidad de Medida y Stock.');
    }

    // *** Validar y limpiar SKU al inicio ***
    const cleanedSku = String(sku).trim();
    if (cleanedSku === '') {
        res.status(400);
        throw new Error('El SKU no puede estar vacío.');
    }

    // Parsear y validar números
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedCostPrice = Number(costPrice);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
        res.status(400);
        throw new Error('El precio de venta debe ser un número positivo.');
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
        res.status(400);
        throw new Error('El stock debe ser un número no negativo.');
    }
    if (isNaN(parsedCostPrice) || parsedCostPrice < 0) {
        res.status(400);
        throw new Error('El costo unitario debe ser un número no negativo.');
    }

    // Validar unitOfMeasure contra el enum del modelo
    const validUnits = Product.schema.path('unitOfMeasure').enumValues;
    if (!validUnits.includes(unitOfMeasure)) {
        res.status(400);
        throw new Error(`La unidad de medida "${unitOfMeasure}" no es válida. Las opciones son: ${validUnits.join(', ')}.`);
    }

    // Crear el producto personal
    const product = await Product.create({
        user: req.user.id,
        name,
        description: description || '',
        category,
        price: parsedPrice,
        stock: parsedStock,
        costPrice: parsedCostPrice,
        sku: cleanedSku.toUpperCase(), // Usar el SKU limpio y en mayúsculas
        unitOfMeasure,
        brand: brand || '',
        supplier: supplier || '',
    });

    // *** Integración con el Catálogo Global (Registro Exponencial Unificado) ***
    // Si el producto se creó exitosamente, intentar añadirlo al catálogo global.
    // No manejamos el error de createGlobalProduct aquí directamente en la respuesta del usuario,
    // ya que la creación del producto personal es la prioridad.
    // El error de SKU duplicado en GlobalProduct.js ya está manejado por su post-save hook.
    try {
        await createGlobalProduct({
            name,
            description: description || '',
            category,
            sku: cleanedSku, // Envía el SKU limpio (se hará uppercase en el globalProductController)
            unitOfMeasure,
            brand: brand || '',
            supplier: supplier || '',
        });
    } catch (globalProductError) {
        // Esto podría ser un SKU duplicado en el catálogo global, o algún otro error.
        // Lo logueamos para depuración, pero no detenemos la respuesta al usuario.
        console.error("Error al añadir/actualizar producto en el catálogo global:", globalProductError.message);
        // Podemos añadir un mensaje de advertencia si es necesario, pero la creación del producto del usuario es lo importante.
    }

    res.status(201).json(product);
});

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Producto no encontrado');
    }

    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('No autorizado para ver este producto');
    }

    res.status(200).json(product);
});

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
    const { name, description, category, price, stock, costPrice, sku, unitOfMeasure, brand, supplier } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Producto no encontrado');
    }

    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('No autorizado para actualizar este producto');
    }

    // *** Validar y limpiar SKU al inicio para la actualización ***
    const cleanedSku = String(sku).trim();
    if (cleanedSku === '') {
        res.status(400);
        throw new Error('El SKU no puede estar vacío.');
    }

    // Validar unicidad del SKU si se ha cambiado
    if (cleanedSku.toUpperCase() !== product.sku.toUpperCase()) {
        const existingProductWithSku = await Product.findOne({ sku: cleanedSku.toUpperCase(), user: req.user.id });
        if (existingProductWithSku && existingProductWithSku._id.toString() !== req.params.id) {
            res.status(400);
            throw new Error('El SKU proporcionado ya existe para otro producto en tu inventario.');
        }
    }

    // Parsear y validar números
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedCostPrice = Number(costPrice);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
        res.status(400);
        throw new Error('El precio de venta debe ser un número positivo.');
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
        res.status(400);
        throw new Error('El stock debe ser un número no negativo.');
    }
    if (costPrice === undefined || isNaN(parsedCostPrice) || parsedCostPrice < 0) {
        res.status(400);
        throw new Error('El costo unitario debe ser un número no negativo.');
    }

    // Validar unitOfMeasure contra el enum del modelo
    const validUnits = Product.schema.path('unitOfMeasure').enumValues;
    if (!validUnits.includes(unitOfMeasure)) {
        res.status(400);
        throw new Error(`La unidad de medida "${unitOfMeasure}" no es válida. Las opciones son: ${validUnits.join(', ')}.`);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: name || product.name,
            description: description !== undefined ? description : product.description,
            category: category || product.category,
            price: parsedPrice,
            stock: parsedStock,
            costPrice: parsedCostPrice,
            sku: cleanedSku.toUpperCase(), // Usar el SKU limpio y en mayúsculas
            unitOfMeasure: unitOfMeasure || product.unitOfMeasure,
            brand: brand !== undefined ? brand : product.brand,
            supplier: supplier !== undefined ? supplier : product.supplier,
        },
        { new: true, runValidators: true }
    );

    res.status(200).json(updatedProduct);
});

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Producto no encontrado');
    }

    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('No autorizado para eliminar este producto');
    }

    await product.deleteOne();
    res.status(200).json({ message: 'Producto eliminado exitosamente', id: req.params.id });
});

module.exports = {
    getProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
};
