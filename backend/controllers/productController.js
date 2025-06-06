// C:\Proyectos\Label\backend\controllers\productController.js
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

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
    if (req.query.category && req.query.category !== 'Todas las Categorías') { // 'Todas las Categorías' es el valor por defecto en el frontend
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
    const page = parseInt(req.query.page, 10) || 1; // Página actual, por defecto 1
    const limit = parseInt(req.query.limit, 10) || 10; // Cantidad de productos por página, por defecto 10
    const skip = (page - 1) * limit; // Cuántos documentos saltar

    // 5. Contar el total de productos que coinciden con la consulta (sin paginación)
    const totalProducts = await Product.countDocuments(query);

    // 6. Obtener los productos con paginación y ordenamiento
    const products = await Product.find(query)
        .sort({ createdAt: -1 }) // Ordenar por fecha de creación descendente por defecto
        // Considerar añadir opciones de ordenamiento a la query si el frontend lo requiere (ej. req.query.sort)
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
    // Desestructurar todos los campos, incluidos los nuevos
    const { name, description, category, price, stock, costPrice, sku, unitOfMeasure, brand, supplier } = req.body;

    // Validación de campos requeridos (ahora incluye los nuevos)
    if (!name || !category || !price || !stock || costPrice === undefined || !sku || !unitOfMeasure) {
        res.status(400);
        throw new Error('Por favor, ingresa todos los campos requeridos: nombre, categoría, precio, stock, costo, SKU, unidad de medida.');
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
    if (isNaN(parsedCostPrice) || parsedCostPrice < 0) { // costPrice puede ser 0
        res.status(400);
        throw new Error('El costo unitario debe ser un número no negativo.');
    }

    // Validar SKU (ya se validará como único por el middleware de Mongoose en el modelo)
    if (typeof sku !== 'string' || sku.trim() === '') {
        res.status(400);
        throw new Error('El SKU debe ser una cadena de texto válida.');
    }

    // Validar unitOfMeasure contra el enum del modelo
    const validUnits = Product.schema.path('unitOfMeasure').enumValues;
    if (!validUnits.includes(unitOfMeasure)) {
        res.status(400);
        throw new Error(`La unidad de medida "${unitOfMeasure}" no es válida. Las opciones son: ${validUnits.join(', ')}.`);
    }

    // Crear el producto con todos los campos
    const product = await Product.create({
        user: req.user.id,
        name,
        description: description || '', // Permite que la descripción sea opcional
        category,
        price: parsedPrice,
        stock: parsedStock,
        costPrice: parsedCostPrice,
        sku: sku.toUpperCase(), // Asegurar que el SKU se guarde en mayúsculas
        unitOfMeasure,
        brand: brand || '', // Permite que la marca sea opcional
        supplier: supplier || '', // Permite que el proveedor sea opcional
    });

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

    // Asegurarse de que el usuario sea el dueño del producto
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
    // Desestructurar todos los campos, incluidos los nuevos
    const { name, description, category, price, stock, costPrice, sku, unitOfMeasure, brand, supplier } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Producto no encontrado');
    }

    // Asegurarse de que el usuario sea el dueño del producto
    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('No autorizado para actualizar este producto');
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
    // costPrice es requerido en el modelo, por lo que debe existir y ser válido
    if (costPrice === undefined || isNaN(parsedCostPrice) || parsedCostPrice < 0) {
        res.status(400);
        throw new Error('El costo unitario debe ser un número no negativo.');
    }

    // Validar SKU (si se proporciona, debe ser único)
    if (typeof sku !== 'string' || sku.trim() === '') {
        res.status(400);
        throw new Error('El SKU debe ser una cadena de texto válida.');
    }
    // Si el SKU se actualiza y es diferente al existente, verificar unicidad
    if (sku && sku.toUpperCase() !== product.sku) {
        const existingProductWithSku = await Product.findOne({ sku: sku.toUpperCase(), user: req.user.id });
        if (existingProductWithSku && existingProductWithSku._id.toString() !== req.params.id) {
            res.status(400);
            throw new Error('El SKU proporcionado ya existe para otro producto de tu inventario.');
        }
    }


    // Validar unitOfMeasure contra el enum del modelo
    const validUnits = Product.schema.path('unitOfMeasure').enumValues;
    if (!validUnits.includes(unitOfMeasure)) {
        res.status(400);
        throw new new Error(`La unidad de medida "${unitOfMeasure}" no es válida. Las opciones son: ${validUnits.join(', ')}.`);
    }

    // Construir el objeto de actualización con los nuevos campos
    // Usamos el operador '||' para campos opcionales que pueden ser cadenas vacías,
    // y para campos que deben conservar su valor si no se proporcionan.
    const updateData = {
        name: name || product.name,
        description: description !== undefined ? description : product.description, // Permite descripción vacía
        category: category || product.category,
        price: parsedPrice,
        stock: parsedStock,
        costPrice: parsedCostPrice,
        sku: sku ? sku.toUpperCase() : product.sku, // Actualiza SKU si se proporciona
        unitOfMeasure: unitOfMeasure || product.unitOfMeasure,
        brand: brand !== undefined ? brand : product.brand, // Permite marca vacía
        supplier: supplier !== undefined ? supplier : product.supplier, // Permite proveedor vacío
    };

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true } // 'new: true' devuelve el documento actualizado, 'runValidators: true' ejecuta las validaciones del esquema
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

    // Asegurarse de que el usuario sea el dueño del producto
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
