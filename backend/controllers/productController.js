// C:\Proyectos\Label\backend\controllers\productController.js
const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel'); // Ensure this line is correct

// @desc    Get all products
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
            { color: { $regex: searchTerm, $options: 'i' } }, // New: Search by main product color
            { size: { $regex: searchTerm, $options: 'i' } },   // New: Search by main product size
            { material: { $regex: searchTerm, $options: 'i' } }, // New: Search by main product material
            // Search also in variants
            { 'variants.name': { $regex: searchTerm, $options: 'i' } },
            { 'variants.sku': { $regex: searchTerm, $options: 'i' } },
            { 'variants.color': { $regex: searchTerm, $options: 'i' } },
            { 'variants.size': { $regex: searchTerm, '$options': 'i' } },
            { 'variants.material': { $regex: searchTerm, '$options': 'i' } },
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

// @desc    Get a product by ID
// @route   GET /api/products/:id
// @access  Private
const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to view this product');
    }

    res.status(200).json(product);
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
    // --- Debugging Step: Print received data ---
    console.log('Product data received in createProduct:', JSON.stringify(req.body, null, 2));
    // --- End Debugging Step ---

    const {
        name,
        description,
        category,
        price,
        stock,
        costPrice,
        sku, // Main product SKU
        unitOfMeasure,
        brand,
        supplier,
        imageUrl,
        color,
        size,
        material,
        isPerishable, // New field
        reorderThreshold, // New field
        optimalMaxStock, // New field
        shelfLifeDays, // New field
        variants
    } = req.body;

    // Validation if no variants: main fields are mandatory
    if (!variants || variants.length === 0) {
        if (!name || !category || price === undefined || stock === undefined || costPrice === undefined || !sku || !unitOfMeasure) {
            res.status(400);
            throw new Error('Please complete all mandatory fields for the main product if there are no variants.');
        }
        if (isNaN(Number(price)) || Number(price) <= 0) {
            res.status(400);
            throw new Error('Selling price must be a positive number.');
        }
        if (isNaN(Number(costPrice)) || Number(costPrice) < 0) {
            res.status(400);
            throw new Error('Unit cost must be a non-negative number.');
        }
        if (isNaN(Number(stock)) || Number(stock) < 0) {
            res.status(400);
            throw new Error('Stock must be a non-negative number.');
        }
    } else {
        // If there are variants, validate that each variant has the required fields
        for (const variant of variants) {
            if (!variant.name || variant.price === undefined || variant.costPrice === undefined || variant.stock === undefined || !variant.unitOfMeasure) {
                res.status(400);
                throw new Error('All variants must have name, price, cost, stock, and unit of measure.');
            }
            if (isNaN(Number(variant.price)) || Number(variant.price) <= 0) {
                res.status(400);
                throw new Error('Variant price must be a positive number.');
            }
            if (isNaN(Number(variant.costPrice)) || Number(variant.costPrice) < 0) {
                res.status(400);
                throw new Error('Variant cost must be a non-negative number.');
            }
            if (isNaN(Number(variant.stock)) || Number(variant.stock) < 0) {
                res.status(400);
                throw new Error('Variant stock must be a non-negative number.');
            }
        }
    }

    // Process variants: ensure variant SKU is a string and parse new fields.
    const processedVariants = variants ? variants.map(variant => {
        const finalVariantSku = variant.sku || variant.autoGeneratedVariantSku || '';
        
        return {
            ...variant,
            sku: finalVariantSku, // Assign final processed SKU
            price: Number(variant.price),
            costPrice: Number(variant.costPrice),
            stock: Number(variant.stock),
            // New fields for variants
            isPerishable: Boolean(variant.isPerishable),
            reorderThreshold: Number(variant.reorderThreshold) || 0,
            optimalMaxStock: Number(variant.optimalMaxStock) || 0,
            shelfLifeDays: Number(variant.shelfLifeDays) || 0,
        };
    }) : [];

    // Build the main product object
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
        sku: sku,
        price: price,
        stock: stock,
        costPrice: costPrice,
        unitOfMeasure: unitOfMeasure,
        // New fields for the main product (if no variants)
        isPerishable: Boolean(isPerishable),
        reorderThreshold: Number(reorderThreshold) || 0,
        optimalMaxStock: Number(optimalMaxStock) || 0,
        shelfLifeDays: Number(shelfLifeDays) || 0,
    };

    try {
        const product = await Product.create(productFields);
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        // Specific handling for main SKU duplicate key error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
            return res.status(400).json({ message: 'The main product SKU already exists. Please enter a unique SKU.' });
        }
        res.status(500).json({ message: 'Internal server error creating product.' });
    }
});


// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
    // --- Debugging Step: Print received data ---
    console.log('Product data received in updateProduct:', JSON.stringify(req.body, null, 2));
    // --- End Debugging Step ---

    const { id } = req.params;
    const {
        name,
        description,
        category,
        price,
        stock,
        costPrice,
        sku, // Main product SKU
        unitOfMeasure,
        brand,
        supplier,
        imageUrl,
        color,
        size,
        material,
        isPerishable, // New field
        reorderThreshold, // New field
        optimalMaxStock, // New field
        shelfLifeDays, // New field
        variants
    } = req.body;

    const product = await Product.findById(id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to update this product');
    }

    // Validation if no variants or all were removed
    if (!variants || variants.length === 0) {
        if (!name || !category || price === undefined || stock === undefined || costPrice === undefined || !sku || !unitOfMeasure) {
            res.status(400);
            throw new Error('Please complete all mandatory fields for the main product if there are no variants.');
        }
        if (isNaN(Number(price)) || Number(price) <= 0) {
            res.status(400);
            throw new Error('Selling price must be a positive number.');
        }
        if (isNaN(Number(costPrice)) || Number(costPrice) < 0) {
            res.status(400);
            throw new Error('Unit cost must be a non-negative number.');
        }
        if (isNaN(Number(stock)) || Number(stock) < 0) {
            res.status(400);
            throw new Error('Stock must be a non-negative number.');
        }
    } else {
        // If there are variants, validate that each variant has the required fields
        for (const variant of variants) {
            if (!variant.name || variant.price === undefined || variant.costPrice === undefined || variant.stock === undefined || !variant.unitOfMeasure) {
                res.status(400);
                throw new Error('All variants must have name, price, cost, stock, and unit of measure.');
            }
            if (isNaN(Number(variant.price)) || Number(variant.price) <= 0) {
                res.status(400);
                throw new Error('Variant price must be a positive number.');
            }
            if (isNaN(Number(variant.costPrice)) || Number(variant.costPrice) < 0) {
                res.status(400);
                throw new Error('Variant cost must be a non-negative number.');
            }
            if (isNaN(Number(variant.stock)) || Number(variant.stock) < 0) {
                res.status(400);
                throw new Error('Variant stock must be a non-negative number.');
            }
        }
    }

    // Process variants before updating
    const processedVariants = variants ? variants.map(variant => {
        const finalVariantSku = variant.sku || variant.autoGeneratedVariantSku || '';

        return {
            ...variant,
            sku: finalVariantSku, // Assign final processed SKU
            price: Number(variant.price),
            costPrice: Number(variant.costPrice),
            stock: Number(variant.stock),
            // New fields for variants
            isPerishable: Boolean(variant.isPerishable),
            reorderThreshold: Number(variant.reorderThreshold) || 0,
            optimalMaxStock: Number(variant.optimalMaxStock) || 0,
            shelfLifeDays: Number(variant.shelfLifeDays) || 0,
        };
    }) : [];

    // Update main product fields
    product.name = name;
    product.description = description;
    product.category = category;
    product.brand = brand;
    product.supplier = supplier;
    product.imageUrl = imageUrl || '';
    
    // Assign main product fields directly from req.body
    product.sku = sku;
    product.price = price;
    product.stock = stock;
    product.costPrice = costPrice;
    product.unitOfMeasure = unitOfMeasure;
    product.color = color;
    product.size = size;
    product.material = material;
    // New fields for the main product
    product.isPerishable = Boolean(isPerishable);
    product.reorderThreshold = Number(reorderThreshold) || 0;
    product.optimalMaxStock = Number(optimalMaxStock) || 0;
    product.shelfLifeDays = Number(shelfLifeDays) || 0;

    // Replace existing variants with processed ones
    product.variants = processedVariants;

    try {
        // Use product.save() for Mongoose to validate subdocuments and execute hooks if any
        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        // Specific handling for main SKU duplicate key error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
            return res.status(400).json({ message: 'The main product SKU already exists. Please enter a unique SKU.' });
        }
        res.status(500).json({ message: 'Internal server error updating product.' });
    }
});

// @desc    Get low stock products
// @route   GET /api/products/alerts/low-stock
// @access  Private
const getLowStockProducts = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Find main products with low stock (if they have no variants)
    const lowStockMainProducts = await Product.aggregate([
        { $match: { user: userId, variants: { $size: 0 } } }, // Products without variants
        { $match: { $expr: { $lte: ['$stock', '$reorderThreshold'] } } } // Stock <= Reorder threshold using $expr
    ]);

    // Find products with variants where any perishable variant has high stock
    const lowStockVariantProducts = await Product.aggregate([
        { $match: { user: userId, 'variants.0': { $exists: true } } }, // Products with at least one variant
        { $unwind: '$variants' }, // Unwind the variants array
        { $match: { $expr: { $lte: ['$variants.stock', '$variants.reorderThreshold'] } } }, // Filter variants with low stock using $expr
        {
            $group: {
                _id: '$_id', // Group back by product ID to get the complete product
                name: { $first: '$name' },
                sku: { $first: '$sku' },
                imageUrl: { $first: '$imageUrl' },
                variants: {
                    $push: { // Reconstruct only the variants with low stock
                        _id: '$variants._id',
                        name: '$variants.name',
                        sku: '$variants.sku',
                        stock: '$variants.stock',
                        reorderThreshold: '$variants.reorderThreshold',
                        imageUrl: '$variants.imageUrl',
                        // Add other variant fields needed for frontend display
                    }
                }
            }
        }
    ]);

    // Combine results, ensuring products with variants only show variants in alert.
    const combinedLowStock = [];

    // Add main products
    lowStockMainProducts.forEach(p => {
        combinedLowStock.push({
            _id: p._id,
            name: p.name,
            sku: p.sku,
            stock: p.stock,
            reorderThreshold: p.reorderThreshold,
            imageUrl: p.imageUrl,
            isMainProduct: true, // Indicator for the frontend
        });
    });

    // Add products with variants in alert (only the alerting variants)
    lowStockVariantProducts.forEach(p => {
        combinedLowStock.push({
            _id: p._id,
            name: p.name,
            sku: p.sku,
            imageUrl: p.imageUrl,
            variantsInAlert: p.variants, // Contains only the variants that triggered the alert
            isMainProduct: false, // Indicator for the frontend
        });
    });

    res.status(200).json(combinedLowStock);
});

// @desc    Get high stock products (perishable)
// @route   GET /api/products/alerts/high-stock
// @access  Private
const getHighStockProducts = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Find main products with high stock (if perishable and have no variants)
    const highStockMainProducts = await Product.aggregate([
        { $match: { user: userId, variants: { $size: 0 }, isPerishable: true } }, // Products without variants and perishable
        { $match: { $expr: { $gt: ['$stock', '$optimalMaxStock'] } } } // Stock > Optimal max stock using $expr
    ]);

    // Find products with variants where any perishable variant has high stock
    const highStockVariantProducts = await Product.aggregate([
        { $match: { user: userId, 'variants.0': { $exists: true } } }, // Products with at least one variant
        { $unwind: '$variants' }, // Unwind the variants array
        { $match: {
            'variants.isPerishable': true, // Only perishable variants
            $expr: { $gt: ['$variants.stock', '$variants.optimalMaxStock'] } // Stock > Optimal max stock using $expr
        } },
        {
            $group: {
                _id: '$_id', // Group back by product ID to get the complete product
                name: { $first: '$name' },
                sku: { $first: '$sku' },
                imageUrl: { $first: '$imageUrl' },
                variants: {
                    $push: { // Reconstruct only the variants with high stock
                        _id: '$variants._id',
                        name: '$variants.name',
                        sku: '$variants.sku',
                        stock: '$variants.stock',
                        optimalMaxStock: '$variants.optimalMaxStock',
                        shelfLifeDays: '$variants.shelfLifeDays',
                        imageUrl: '$variants.imageUrl',
                        // Add other variant fields needed for frontend display
                    }
                }
            }
        }
    ]);

    // Combine results, ensuring products with variants only show variants in alert.
    const combinedHighStock = [];

    // Add main products
    highStockMainProducts.forEach(p => {
        combinedHighStock.push({
            _id: p._id,
            name: p.name,
            sku: p.sku,
            stock: p.stock,
            optimalMaxStock: p.optimalMaxStock,
            shelfLifeDays: p.shelfLifeDays,
            imageUrl: p.imageUrl,
            isMainProduct: true, // Indicator for the frontend
        });
    });

    // Add products with variants in alert (only the alerting variants)
    highStockVariantProducts.forEach(p => {
        combinedHighStock.push({
            _id: p._id,
            name: p.name,
            sku: p.sku,
            imageUrl: p.imageUrl,
            variantsInAlert: p.variants, // Contains only the variants that triggered the alert
            isMainProduct: false, // Indicator for the frontend
        });
    });

    res.status(200).json(combinedHighStock);
});


// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this product');
    }

    await product.deleteOne();

    res.status(200).json({ message: 'Product removed' });
});

// @desc    Get global products
// @route   GET /api/globalproducts
// @access  Public (or Private depending on your needs)
const getGlobalProducts = asyncHandler(async (req, res) => {
    const { searchTerm } = req.query;

    let query = {};
    if (searchTerm) {
        query.name = { $regex: searchTerm, $options: 'i' };
    }

    // Simulated data (including color, size, material for main product and variants)
    const globalProducts = [
        {
            sku: 'CAMI-ALG-ROJO-M',
            name: 'Basic Cotton T-shirt',
            description: 'Soft and comfortable cotton t-shirt for daily use.',
            category: 'Clothing',
            unitOfMeasure: 'unit',
            brand: 'Generic',
            imageUrl: 'https://res.cloudinary.com/your_cloud_name/image/upload/v1678901234/label_products/camiseta_roja.jpg',
            color: 'Red', // Added for main product
            size: 'M',    // Added for main product
            material: 'Cotton', // Added for main product
            variants: [
                {
                    name: 'Size S - Red', sku: 'CAMI-S-ROJO', price: 15.00, costPrice: 7.00, stock: 50, unitOfMeasure: 'unit', color: 'Red', size: 'S', material: 'Cotton', imageUrl: 'https://placehold.co/150x100/A02C2C/F8F8F2?text=S-Red'
                },
                {
                    name: 'Size M - Red', sku: 'CAMI-M-ROJO', price: 15.00, costPrice: 7.00, stock: 45, unitOfMeasure: 'unit', color: 'Red', size: 'M', material: 'Cotton', imageUrl: 'https://placehold.co/150x100/A02C2C/F8F8F2?text=M-Red'
                },
                {
                    name: 'Size L - Red', sku: 'CAMI-L-ROJO', price: 15.00, costPrice: 7.00, stock: 30, unitOfMeasure: 'unit', color: 'Red', size: 'L', material: 'Cotton', imageUrl: 'https://placehold.co/150x100/A02C2C/F8F8F2?text=L-Red'
                },
                {
                    name: 'Size M - Blue', sku: 'CAMI-M-AZUL', price: 16.00, costPrice: 7.50, stock: 60, unitOfMeasure: 'unit', color: 'Blue', size: 'M', material: 'Cotton', imageUrl: 'https://placehold.co/150x100/2C3CA0/F8F8F2?text=M-Blue'
                },
            ]
        },
        {
            sku: 'PANT-JEAN-AZUL-32',
            name: 'Classic Blue Jean Pants',
            description: 'Classic blue jean pants, straight fit.',
            category: 'Clothing',
            unitOfMeasure: 'unit',
            brand: 'DenimCo',
            imageUrl: 'https://res.cloudinary.com/your_cloud_name/image/upload/v1678901235/label_products/jean_azul.jpg',
            color: 'Blue', // Added for main product
            size: '32',   // Added for main product
            material: 'Jean', // Added for main product
            variants: [
                { name: 'Size 30', sku: 'PANT-30-AZUL', price: 45.00, costPrice: 20.00, stock: 25, unitOfMeasure: 'unit', size: '30', color: 'Blue' },
                { name: 'Size 32', sku: 'PANT-32-AZUL', price: 45.00, costPrice: 20.00, stock: 40, unitOfMeasure: 'unit', size: '32', color: 'Blue' },
                { name: 'Size 34', sku: 'PANT-34-AZUL', price: 45.00, costPrice: 20.00, stock: 35, unitOfMeasure: 'unit', size: '34', color: 'Blue' },
            ]
        },
        {
            sku: 'CEL-SMART-ULTRA-256',
            name: 'Smartphone Ultra X',
            description: 'Latest smartphone model with high-resolution camera and large storage.',
            category: 'Electronics',
            unitOfMeasure: 'unit',
            brand: 'TechGadget',
            imageUrl: 'https://res.cloudinary.com/your_cloud_name/image/upload/v1678901236/label_products/smartphone_ultra.jpg',
            color: 'Black', // Added for main product
            size: '256GB', // Added for main product
            material: 'Metal/Glass', // Added for main product
            variants: [
                { name: 'Black Color - 128GB', sku: 'SMART-NEGRO-128', price: 799.99, costPrice: 500.00, stock: 15, unitOfMeasure: 'unit', color: 'Black', size: '128GB' },
                { name: 'Black Color - 256GB', sku: 'SMART-NEGRO-256', price: 899.99, costPrice: 600.00, stock: 10, unitOfMeasure: 'unit', color: 'Black', size: '256GB' },
                { name: 'Silver Color - 256GB', sku: 'SMART-PLATA-256', price: 899.99, costPrice: 600.00, stock: 8, unitOfMeasure: 'unit', color: 'Silver', size: '256GB' },
            ]
        },
        {
            sku: 'AUDI-BLUETOOTH-SPORT',
            name: 'Sport Bluetooth Headphones',
            description: 'Wireless headphones ideal for exercise, with high-fidelity sound.',
            category: 'Electronics',
            unitOfMeasure: 'unit',
            brand: 'SoundBlast',
            imageUrl: 'https://placehold.co/600x400/2D3748/F8F8F2?text=Headphones',
            color: 'Black', // Added for main product
            size: 'N/A',   // Added for main product
            material: 'Plastic', // Added for main product
            variants: []
        },
        {
            sku: 'CAFE-ESPECIAL-KG',
            name: 'Special Origin Coffee',
            description: 'Arabica coffee beans, medium roasted, from selected farms.',
            category: 'Food and Beverages',
            unitOfMeasure: 'kg',
            brand: 'AromaPuro',
            imageUrl: 'https://placehold.co/600x400/2D3748/F8F8F2?text=Coffee',
            color: 'Brown', // Added for main product
            size: '1KG',     // Added for main product
            material: 'Grain', // Added for main product
            variants: []
        },
        {
            sku: 'ZAP-DEP-CORR-40',
            name: 'Running Sports Shoes',
            description: 'Lightweight and breathable running shoes.',
            category: 'Footwear',
            unitOfMeasure: 'unit',
            brand: 'RunFast',
            imageUrl: 'https://placehold.co/600x400/2D3748/F8F8F2?text=Shoes',
            color: 'Blue', // Added for main product
            size: '40',   // Added for main product
            material: 'Mesh/Synthetic', // Added for main product
            variants: [
                { name: 'Size 40 - Blue', sku: 'ZAP-40-AZUL', price: 60.00, costPrice: 30.00, stock: 20, unitOfMeasure: 'unit', size: '40', color: 'Blue' },
                { name: 'Size 42 - Black', sku: 'ZAP-42-NEGRO', price: 65.00, costPrice: 32.00, stock: 15, unitOfMeasure: 'unit', size: '42', color: 'Black' },
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
    getLowStockProducts, // Export new function
    getHighStockProducts, // Export new function
};
