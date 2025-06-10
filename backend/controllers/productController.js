// C:\Proyectos\Label\backend\controllers\productController.js
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const GlobalProduct = require('../models/GlobalProduct');
const { createGlobalProduct } = require('./globalProductController');

// @desc    Obtener todos los productos del usuario con búsqueda, filtro y paginación
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
    // 1. Inicializar el objeto de consulta para Mongoose
    const query = { user: req.user.id };

    // Obtener parámetros de la query
    const { searchTerm, category, brand, supplier, page, limit } = req.query;

    // 2. Implementar búsqueda consolidada usando un único searchTerm
    if (searchTerm) {
        const trimmedSearchTerm = searchTerm.trim();
        if (trimmedSearchTerm) {
            query.$or = [
                { name: { $regex: trimmedSearchTerm, $options: 'i' } },
                { sku: { $regex: trimmedSearchTerm, $options: 'i' } },
                { brand: { $regex: trimmedSearchTerm, $options: 'i' } },
                { supplier: { $regex: trimmedSearchTerm, $options: 'i' } }
            ];
        }
    }

    // 3. Implementar filtrado por Categoría (dropdown)
    if (category && category !== 'Todas las Categorías') {
        query.category = category;
    }

    // 4. Implementar filtrado por Marca (dropdown)
    if (brand && brand !== 'Todas las Marcas') {
        query.brand = brand;
    }

    // 5. Implementar filtrado por Proveedor (dropdown)
    if (supplier && supplier !== 'Todos los Proveedores') {
        query.supplier = supplier;
    }

    // 6. Paginación
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // 7. Contar el total de productos que coinciden con la consulta (sin paginación)
    const totalProducts = await Product.countDocuments(query);

    // 8. Obtener los productos con paginación y ordenamiento
    const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

    // 9. Calcular información de paginación
    const totalPages = Math.ceil(totalProducts / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // 10. Enviar la respuesta con los productos y la información de paginación
    res.status(200).json({
        products,
        pagination: {
            totalProducts,
            totalPages,
            currentPage: pageNum,
            limit: limitNum,
            hasNextPage,
            hasPrevPage,
        },
    });
});

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, category, price, stock, costPrice, sku, unitOfMeasure, brand, supplier, imageUrl } = req.body;

    if (!name || !category || !price || !stock || costPrice === undefined || !sku || !unitOfMeasure) {
        res.status(400);
        throw new Error('Por favor, completa todos los campos obligatorios: Nombre, Categoría, Precio de Venta, Costo, SKU, Unidad de Medida y Stock.');
    }

    const cleanedSku = String(sku).trim();
    if (cleanedSku === '') {
        res.status(400);
        throw new Error('El SKU no puede estar vacío.');
    }

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

    const validUnits = Product.schema.path('unitOfMeasure').enumValues;
    if (!validUnits.includes(unitOfMeasure)) {
        res.status(400);
        throw new Error(`La unidad de medida "${unitOfMeasure}" no es válida. Las opciones son: ${validUnits.join(', ')}.`);
    }

    const product = await Product.create({
        user: req.user.id,
        name,
        description: description || '',
        category,
        price: parsedPrice,
        stock: parsedStock,
        costPrice: parsedCostPrice,
        sku: cleanedSku.toUpperCase(),
        unitOfMeasure,
        brand: brand || '',
        supplier: supplier || '',
        imageUrl: imageUrl || undefined,
    });

    try {
        const globalProductData = {
            name,
            description: description || '',
            category,
            sku: cleanedSku,
            unitOfMeasure,
            brand: brand || '',
            supplier: supplier || '',
            imageUrl: imageUrl || undefined,
        };
        
        const newOrExistingGlobalProduct = await createGlobalProduct(globalProductData);

        if (newOrExistingGlobalProduct) {
            await GlobalProduct.findByIdAndUpdate(
                newOrExistingGlobalProduct._id,
                { lastUsedAt: Date.now() },
                { new: true }
            );
            console.log(`GlobalProduct SKU: ${newOrExistingGlobalProduct.sku} lastUsedAt actualizado en creación.`);
        }
    } catch (globalProductError) {
        console.error("Error al añadir/actualizar producto en el catálogo global o actualizar lastUsedAt en creación:", globalProductError.message);
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
    const { name, description, category, price, stock, costPrice, sku, unitOfMeasure, brand, supplier, imageUrl } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Producto no encontrado');
    }

    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('No autorizado para actualizar este producto');
    }

    const cleanedSku = String(sku).trim();
    if (cleanedSku === '') {
        res.status(400);
        throw new Error('El SKU no puede estar vacío.');
    }

    if (cleanedSku.toUpperCase() !== product.sku.toUpperCase()) {
        const existingProductWithSku = await Product.findOne({ sku: cleanedSku.toUpperCase(), user: req.user.id });
        if (existingProductWithSku && existingProductWithSku._id.toString() !== req.params.id) {
            res.status(400);
            throw new Error('El SKU proporcionado ya existe para otro producto en tu inventario.');
        }
    }

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

    const validUnits = Product.schema.path('unitOfMeasure').enumValues;
    if (!validUnits.includes(unitOfMeasure)) {
        res.status(400);
        throw new new Error(`La unidad de medida "${unitOfMeasure}" no es válida. Las opciones son: ${validUnits.join(', ')}.`);
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
            sku: cleanedSku.toUpperCase(),
            unitOfMeasure: unitOfMeasure || product.unitOfMeasure,
            brand: brand !== undefined ? brand : product.brand,
            supplier: supplier !== undefined ? supplier : product.supplier,
            imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl,
        },
        { new: true, runValidators: true }
    );

    try {
        const globalProduct = await GlobalProduct.findOne({ sku: cleanedSku.toUpperCase() });

        if (globalProduct) {
            await GlobalProduct.findByIdAndUpdate(
                globalProduct._id,
                { lastUsedAt: Date.now() },
                { new: true }
            );
            console.log(`GlobalProduct SKU: ${globalProduct.sku} lastUsedAt actualizado durante la edición.`);
        } else {
            console.warn(`No se encontró GlobalProduct con SKU: ${cleanedSku.toUpperCase()} durante la actualización. No se actualizó lastUsedAt.`);
        }
    } catch (globalProductError) {
        console.error("Error al actualizar lastUsedAt del GlobalProduct durante la edición:", globalProductError.message);
    }

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

    if (!req.user || product.user.toString() !== req.user.id) {
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
