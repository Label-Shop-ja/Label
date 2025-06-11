const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel'); // Asegúrate de que esta línea sea correcta

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
    const { searchTerm, category, brand, supplier, variantColor, variantSize, page, limit } = req.query;

    const query = { user: req.user.id };

    if (searchTerm) {
        query.$or = [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { sku: { $regex: searchTerm, $options: 'i' } },
            { brand: { $regex: searchTerm, $options: 'i' } },
            { supplier: { $regex: searchTerm, $options: 'i' } },
            { color: { $regex: searchTerm, $options: 'i' } }, // Nuevo: Buscar por color del producto principal
            { size: { $regex: searchTerm, $options: 'i' } },   // Nuevo: Buscar por talla/tamaño del producto principal
            { material: { $regex: searchTerm, $options: 'i' } }, // Nuevo: Buscar por material del producto principal
            // Buscar también en las variantes
            { 'variants.name': { $regex: searchTerm, $options: 'i' } },
            { 'variants.sku': { $regex: searchTerm, $options: 'i' } },
            { 'variants.color': { $regex: searchTerm, $options: 'i' } },
            { 'variants.size': { $regex: searchTerm, $options: 'i' } },
            { 'variants.material': { $regex: searchTerm, $options: 'i' } },
        ];
    }

    if (category && category !== 'Todas las Categorías') {
        query.category = category;
    }
    if (brand && brand !== 'Todas las Marcas') {
        query.brand = brand;
    }
    if (supplier && supplier !== 'Todos los Proveedores') {
        query.supplier = supplier;
    }
    if (variantColor && variantColor !== 'Todos los Colores') {
        query['variants.color'] = variantColor;
    }
    if (variantSize && variantSize !== 'Todas las Tallas') {
        query['variants.size'] = variantSize;
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum);

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNum);

    res.status(200).json({
        products,
        pagination: {
            currentPage: pageNum,
            totalPages,
            totalProducts,
            limit: limitNum,
        },
    });
});

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Private
const getProduct = asyncHandler(async (req, res) => {
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

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
    // --- Paso de Depuración: Imprime los datos recibidos ---
    console.log('Datos de producto recibidos en createProduct:', JSON.stringify(req.body, null, 2));
    // --- Fin del Paso de Depuración ---

    const {
        name,
        description,
        category,
        price,
        stock,
        costPrice,
        sku, // SKU del producto principal
        unitOfMeasure,
        brand,
        supplier,
        imageUrl,
        color,
        size,
        material,
        variants
    } = req.body;

    // Validación si no hay variantes: los campos principales son obligatorios
    if (!variants || variants.length === 0) {
        if (!name || !category || price === undefined || stock === undefined || costPrice === undefined || !sku || !unitOfMeasure) {
            res.status(400);
            throw new Error('Por favor, completa todos los campos obligatorios para el producto principal si no hay variantes.');
        }
        if (isNaN(Number(price)) || Number(price) <= 0) {
            res.status(400);
            throw new Error('El precio de venta debe ser un número positivo.');
        }
        if (isNaN(Number(costPrice)) || Number(costPrice) < 0) {
            res.status(400);
            throw new Error('El costo unitario debe ser un número no negativo.');
        }
        if (isNaN(Number(stock)) || Number(stock) < 0) {
            res.status(400);
            throw new Error('El stock debe ser un número no negativo.');
        }
    } else {
        // Si hay variantes, validamos que cada variante tenga los campos requeridos
        for (const variant of variants) {
            if (!variant.name || variant.price === undefined || variant.costPrice === undefined || variant.stock === undefined || !variant.unitOfMeasure) {
                res.status(400);
                throw new Error('Todas las variantes deben tener nombre, precio, costo, stock y unidad de medida.');
            }
            if (isNaN(Number(variant.price)) || Number(variant.price) <= 0) {
                res.status(400);
                throw new Error('El precio de la variante debe ser un número positivo.');
            }
            if (isNaN(Number(variant.costPrice)) || Number(variant.costPrice) < 0) {
                res.status(400);
                throw new Error('El costo de la variante debe ser un número no negativo.');
            }
            if (isNaN(Number(variant.stock)) || Number(variant.stock) < 0) {
                res.status(400);
                throw new Error('El stock de la variante debe ser un número no negativo.');
            }
        }
    }

    // Procesa las variantes: asegura que el SKU de la variante sea una cadena de texto.
    const processedVariants = variants ? variants.map(variant => {
        const finalVariantSku = variant.sku || variant.autoGeneratedVariantSku || '';
        
        return {
            ...variant,
            sku: finalVariantSku, // Asigna el SKU final procesado
            price: Number(variant.price),
            costPrice: Number(variant.costPrice),
            stock: Number(variant.stock),
        };
    }) : [];

    // Construye el objeto del producto principal
    const productFields = {
        user: req.user.id,
        name,
        description,
        category,
        brand,
        supplier,
        imageUrl: imageUrl || '',
        color: color || '',
        size: size || '',
        material: material || '',
        variants: processedVariants,
        // *** IMPORTANTE: El SKU del producto principal se toma directamente del 'sku' del req.body.
        // El frontend ya se encarga de autogenerarlo si no se introduce manualmente.
        sku: sku,
        price: price,
        stock: stock,
        costPrice: costPrice,
        unitOfMeasure: unitOfMeasure
    };

    try {
        const product = await Product.create(productFields);
        res.status(201).json(product);
    } catch (error) {
        console.error('Error al crear el producto:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        // Manejo específico para el error de clave duplicada del SKU principal
        if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
            return res.status(400).json({ message: 'El SKU del producto principal ya existe. Por favor, introduce un SKU único.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear el producto.' });
    }
});


// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
    // --- Paso de Depuración: Imprime los datos recibidos ---
    console.log('Datos de producto recibidos en updateProduct:', JSON.stringify(req.body, null, 2));
    // --- Fin del Paso de Depuración ---

    const { id } = req.params;
    const {
        name,
        description,
        category,
        price,
        stock,
        costPrice,
        sku, // SKU del producto principal
        unitOfMeasure,
        brand,
        supplier,
        imageUrl,
        color,
        size,
        material,
        variants
    } = req.body;

    const product = await Product.findById(id);

    if (!product) {
        res.status(404);
        throw new Error('Producto no encontrado');
    }

    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('No autorizado para actualizar este producto');
    }

    // Validación si no hay variantes o se eliminaron todas
    if (!variants || variants.length === 0) {
        if (!name || !category || price === undefined || stock === undefined || costPrice === undefined || !sku || !unitOfMeasure) {
            res.status(400);
            throw new Error('Por favor, completa todos los campos obligatorios para el producto principal si no hay variantes.');
        }
        if (isNaN(Number(price)) || Number(price) <= 0) {
            res.status(400);
            throw new Error('El precio de venta debe ser un número positivo.');
        }
        if (isNaN(Number(costPrice)) || Number(costPrice) < 0) {
            res.status(400);
            throw new Error('El costo unitario debe ser un número no negativo.');
        }
        if (isNaN(Number(stock)) || Number(stock) < 0) {
            res.status(400);
            throw new Error('El stock debe ser un número no negativo.');
        }
    } else {
        // Si hay variantes, validamos que cada variante tenga los campos requeridos
        for (const variant of variants) {
            if (!variant.name || variant.price === undefined || variant.costPrice === undefined || variant.stock === undefined || !variant.unitOfMeasure) {
                res.status(400);
                throw new Error('Todas las variantes deben tener nombre, precio, costo, stock y unidad de medida.');
            }
            if (isNaN(Number(variant.price)) || Number(variant.price) <= 0) {
                res.status(400);
                throw new Error('El precio de la variante debe ser un número positivo.');
            }
            if (isNaN(Number(variant.costPrice)) || Number(variant.costPrice) < 0) {
                res.status(400);
                throw new Error('El costo de la variante debe ser un número no negativo.');
            }
            if (isNaN(Number(variant.stock)) || Number(variant.stock) < 0) {
                res.status(400);
                throw new Error('El stock de la variante debe ser un número no negativo.');
            }
        }
    }

    // Procesa las variantes antes de actualizar
    const processedVariants = variants ? variants.map(variant => {
        const finalVariantSku = variant.sku || variant.autoGeneratedVariantSku || '';

        return {
            ...variant,
            sku: finalVariantSku, // Asigna el SKU final procesado
            price: Number(variant.price),
            costPrice: Number(variant.costPrice),
            stock: Number(variant.stock),
        };
    }) : [];

    // Actualizar los campos del producto principal
    product.name = name;
    product.description = description;
    product.category = category;
    product.brand = brand;
    product.supplier = supplier;
    product.imageUrl = imageUrl || '';
    
    // *** IMPORTANTE: Asignar sku, price, stock, costPrice, unitOfMeasure, color, size, material
    // basándose directamente en los valores del req.body, que ya vienen preparados desde el frontend.
    product.sku = sku;
    product.price = price;
    product.stock = stock;
    product.costPrice = costPrice;
    product.unitOfMeasure = unitOfMeasure;
    product.color = color;
    product.size = size;
    product.material = material;

    // Reemplaza las variantes existentes con las procesadas
    product.variants = processedVariants;

    try {
        // Usa product.save() para que Mongoose valide los subdocumentos y se ejecuten los hooks si los hubiera
        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        // Manejo específico para el error de clave duplicada del SKU principal
        if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
            return res.status(400).json({ message: 'El SKU del producto principal ya existe. Por favor, introduce un SKU único.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar el producto.' });
    }
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

    res.status(200).json({ message: 'Producto eliminado' });
});

// @desc    Obtener productos globales
// @route   GET /api/globalproducts
// @access  Public (o Private si solo usuarios autenticados pueden verlos)
const getGlobalProducts = asyncHandler(async (req, res) => {
    const { searchTerm } = req.query;

    let query = {};
    if (searchTerm) {
        query.name = { $regex: searchTerm, $options: 'i' };
    }

    // Datos simulados (incluyendo color, size, material para el producto principal y variantes)
    const globalProducts = [
        {
            sku: 'CAMI-ALG-ROJO-M',
            name: 'Camiseta Básica de Algodón',
            description: 'Camiseta de algodón suave y cómoda para uso diario.',
            category: 'Ropa',
            unitOfMeasure: 'unidad',
            brand: 'Genérica',
            imageUrl: 'https://res.cloudinary.com/your_cloud_name/image/upload/v1678901234/label_products/camiseta_roja.jpg',
            color: 'Rojo', // Añadido para producto principal
            size: 'M',    // Añadido para producto principal
            material: 'Algodón', // Añadido para producto principal
            variants: [
                {
                    name: 'Talla S - Rojo', sku: 'CAMI-S-ROJO', price: 15.00, costPrice: 7.00, stock: 50, unitOfMeasure: 'unidad', color: 'Rojo', size: 'S', material: 'Algodón', imageUrl: 'https://placehold.co/150x100/A02C2C/F8F8F2?text=S-Rojo'
                },
                {
                    name: 'Talla M - Rojo', sku: 'CAMI-M-ROJO', price: 15.00, costPrice: 7.00, stock: 45, unitOfMeasure: 'unidad', color: 'Rojo', size: 'M', material: 'Algodón', imageUrl: 'https://placehold.co/150x100/A02C2C/F8F8F2?text=M-Rojo'
                },
                {
                    name: 'Talla L - Rojo', sku: 'CAMI-L-ROJO', price: 15.00, costPrice: 7.00, stock: 30, unitOfMeasure: 'unidad', color: 'Rojo', size: 'L', material: 'Algodón', imageUrl: 'https://placehold.co/150x100/A02C2C/F8F8F2?text=L-Rojo'
                },
                {
                    name: 'Talla M - Azul', sku: 'CAMI-M-AZUL', price: 16.00, costPrice: 7.50, stock: 60, unitOfMeasure: 'unidad', color: 'Azul', size: 'M', material: 'Algodón', imageUrl: 'https://placehold.co/150x100/2C3CA0/F8F8F2?text=M-Azul'
                },
            ]
        },
        {
            sku: 'PANT-JEAN-AZUL-32',
            name: 'Pantalón Jean Clásico',
            description: 'Pantalón de jean azul clásico, ajuste recto.',
            category: 'Ropa',
            unitOfMeasure: 'unidad',
            brand: 'DenimCo',
            imageUrl: 'https://res.cloudinary.com/your_cloud_name/image/upload/v1678901235/label_products/jean_azul.jpg',
            color: 'Azul', // Añadido para producto principal
            size: '32',   // Añadido para producto principal
            material: 'Jean', // Añadido para producto principal
            variants: [
                { name: 'Talla 30', sku: 'PANT-30-AZUL', price: 45.00, costPrice: 20.00, stock: 25, unitOfMeasure: 'unidad', size: '30', color: 'Azul' },
                { name: 'Talla 32', sku: 'PANT-32-AZUL', price: 45.00, costPrice: 20.00, stock: 40, unitOfMeasure: 'unidad', size: '32', color: 'Azul' },
                { name: 'Talla 34', sku: 'PANT-34-AZUL', price: 45.00, costPrice: 20.00, stock: 35, unitOfMeasure: 'unidad', size: '34', color: 'Azul' },
            ]
        },
        {
            sku: 'CEL-SMART-ULTRA-256',
            name: 'Smartphone Ultra X',
            description: 'Último modelo de smartphone con cámara de alta resolución y gran almacenamiento.',
            category: 'Electrónica',
            unitOfMeasure: 'unidad',
            brand: 'TechGadget',
            imageUrl: 'https://res.cloudinary.com/your_cloud_name/image/upload/v1678901236/label_products/smartphone_ultra.jpg',
            color: 'Negro', // Añadido para producto principal
            size: '256GB', // Añadido para producto principal
            material: 'Metal/Cristal', // Añadido para producto principal
            variants: [
                { name: 'Color Negro - 128GB', sku: 'SMART-NEGRO-128', price: 799.99, costPrice: 500.00, stock: 15, unitOfMeasure: 'unidad', color: 'Negro', size: '128GB' },
                { name: 'Color Negro - 256GB', sku: 'SMART-NEGRO-256', price: 899.99, costPrice: 600.00, stock: 10, unitOfMeasure: 'unidad', color: 'Negro', size: '256GB' },
                { name: 'Color Plata - 256GB', sku: 'SMART-PLATA-256', price: 899.99, costPrice: 600.00, stock: 8, unitOfMeasure: 'unidad', color: 'Plata', size: '256GB' },
            ]
        },
        {
            sku: 'AUDI-BLUETOOTH-SPORT',
            name: 'Audífonos Bluetooth Deportivos',
            description: 'Audífonos inalámbricos ideales para el ejercicio, con sonido de alta fidelidad.',
            category: 'Electrónica',
            unitOfMeasure: 'unidad',
            brand: 'SoundBlast',
            imageUrl: 'https://placehold.co/600x400/2D3748/F8F8F2?text=Audifonos',
            color: 'Negro', // Añadido para producto principal
            size: 'N/A',   // Añadido para producto principal
            material: 'Plástico', // Añadido para producto principal
            variants: []
        },
        {
            sku: 'CAFE-ESPECIAL-KG',
            name: 'Café Especial de Origen',
            description: 'Granos de café arábica, tostado medio, de fincas seleccionadas.',
            category: 'Alimentos y Bebidas',
            unitOfMeasure: 'kg',
            brand: 'AromaPuro',
            imageUrl: 'https://placehold.co/600x400/2D3748/F8F8F2?text=Cafe',
            color: 'Marrón', // Añadido para producto principal
            size: '1KG',     // Añadido para producto principal
            material: 'Grano', // Añadido para producto principal
            variants: []
        },
        {
            sku: 'ZAP-DEP-CORR-40',
            name: 'Zapatillas Deportivas Running',
            description: 'Zapatillas ligeras y transpirables para corredores.',
            category: 'Calzado',
            unitOfMeasure: 'unidad',
            brand: 'RunFast',
            imageUrl: 'https://placehold.co/600x400/2D3748/F8F8F2?text=Zapatillas',
            color: 'Azul', // Añadido para producto principal
            size: '40',   // Añadido para producto principal
            material: 'Malla/Sintético', // Añadido para producto principal
            variants: [
                { name: 'Talla 40 - Azul', sku: 'ZAP-40-AZUL', price: 60.00, costPrice: 30.00, stock: 20, unitOfMeasure: 'unidad', size: '40', color: 'Azul' },
                { name: 'Talla 42 - Negro', sku: 'ZAP-42-NEGRO', price: 65.00, costPrice: 32.00, stock: 15, unitOfMeasure: 'unidad', size: '42', color: 'Negro' },
            ]
        },
    ];

    const filteredSuggestions = globalProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.variants && p.variants.some(v => v.name.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    res.status(200).json(filteredSuggestions.slice(0, 5));
});


module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getGlobalProducts,
};
