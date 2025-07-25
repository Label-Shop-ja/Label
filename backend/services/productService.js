import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import { createGlobalProduct } from '../controllers/globalProductController.js';

// --- OBTENER PRODUCTOS Y FILTROS ---
const getProducts = async (userId, query) => {
    const { searchTerm, category, brand, supplier, variantColor, variantSize, sortBy, sortOrder, page, limit } = query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    let filter = { user: userId };

    if (searchTerm) {
        filter.$text = { $search: searchTerm };
    }
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (supplier) filter.supplier = supplier;
    if (variantColor) filter['variants.color'] = variantColor;
    if (variantSize) filter['variants.size'] = variantSize;

    const sortOptions = {};
    if (sortBy) {
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
        sortOptions.createdAt = -1; // Default sort
    }

    const products = await Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(); // .lean() for better performance on read operations

    const totalProducts = await Product.countDocuments(filter);

    return {
        products,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(totalProducts / limitNum),
            totalProducts,
        },
    };
};

const getFilterOptions = async (userId) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Using Promise.all to run queries concurrently for better performance
    const [categories, brands, suppliers, variantOptions] = await Promise.all([
        Product.distinct('category', { user: userObjectId }),
        Product.distinct('brand', { user: userObjectId }),
        Product.distinct('supplier', { user: userObjectId }),
        Product.aggregate([
            { $match: { user: userObjectId, 'variants.0': { $exists: true } } }, // Consider only products with variants
            { $unwind: '$variants' },
            {
                $group: {
                    _id: null,
                    colors: { $addToSet: '$variants.color' },
                    sizes: { $addToSet: '$variants.size' },
                }
            },
            {
                $project: {
                    _id: 0,
                    // Filter out empty strings from the results
                    colors: { $filter: { input: '$colors', as: 'color', cond: { $ne: ['$$color', null] } } },
                    sizes: { $filter: { input: '$sizes', as: 'size', cond: { $ne: ['$$size', null] } } },
                }
            }
        ])
    ]);

    return {
        categories: categories.filter(Boolean).sort(),
        brands: brands.filter(Boolean).sort(),
        suppliers: suppliers.filter(Boolean).sort(),
        variantColors: variantOptions[0]?.colors.filter(Boolean).sort() || [],
        variantSizes: variantOptions[0]?.sizes.filter(Boolean).sort() || [],
    };
};

// --- CRUD DE PRODUCTOS ---

const getProductById = async (productId, userId) => {
    const product = await Product.findById(productId);

    if (!product) {
        const error = new Error('Producto no encontrado');
        error.statusCode = 404;
        throw error;
    }

    if (product.user.toString() !== userId) {
        const error = new Error('No autorizado para ver este producto');
        error.statusCode = 401;
        throw error;
    }

    return product;
};

const createProduct = async (productData, userId) => {
    const product = await Product.create({
        ...productData,
        user: userId, // ¡CRUCIAL! Asocia el producto con el usuario.
    });

    // Actualiza el catálogo global de productos.
    await createGlobalProduct(product);

    return product;
};

const updateProduct = async (productId, productData, userId) => {
    const product = await getProductById(productId, userId); // Reutilizamos para buscar y validar propiedad.

    // Actualiza los campos del producto con los nuevos datos.
    Object.assign(product, productData);

    // Guardamos para que se ejecuten los hooks de Mongoose (ej. pre-save para calcular precios).
    const updatedProduct = await product.save();

    // Actualiza el catálogo global también.
    await createGlobalProduct(updatedProduct);

    return updatedProduct;
};

const deleteProduct = async (productId, userId) => {
    const product = await getProductById(productId, userId); // Reutilizamos para buscar y validar.
    await product.deleteOne();
};

// --- ALERTAS Y REPORTES ---

const getLowStockProducts = async (userId) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    // Usamos una agregación para poder comparar campos dentro de los subdocumentos de variantes.
    const lowStockAlerts = await Product.aggregate([
        { $match: { user: userObjectId } },
        {
            $addFields: {
                // Creamos un campo temporal que contiene solo las variantes con stock bajo.
                lowStockVariants: {
                    $filter: {
                        input: '$variants',
                        as: 'variant',
                        cond: {
                            $and: [
                                { $gt: ['$$variant.reorderThreshold', 0] },
                                { $lte: ['$$variant.stock', '$$variant.reorderThreshold'] }
                            ]
                        }
                    }
                }
            }
        },
        {
            $match: {
                $or: [
                    // Caso 1: Es un producto simple (sin variantes) y su stock es bajo.
                    { 'variants.0': { $exists: false }, $expr: { $lte: ['$stock', '$reorderThreshold'] }, reorderThreshold: { $gt: 0 } },
                    // Caso 2: Es un producto con variantes y tiene al menos una variante con stock bajo.
                    { 'lowStockVariants.0': { $exists: true } }
                ]
            }
        }
    ]);
    return lowStockAlerts;
};

const getHighStockProducts = async (userId) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const highStockAlerts = await Product.aggregate([
        { $match: { user: userObjectId } },
        {
            $addFields: {
                highStockVariants: {
                    $filter: {
                        input: '$variants',
                        as: 'variant',
                        cond: {
                            $and: [
                                { $eq: ['$$variant.isPerishable', true] },
                                { $gt: ['$$variant.optimalMaxStock', 0] },
                                { $gt: ['$$variant.stock', '$$variant.optimalMaxStock'] }
                            ]
                        }
                    }
                }
            }
        },
        {
            $match: {
                $or: [
                    { 'variants.0': { $exists: false }, isPerishable: true, $expr: { $gt: ['$stock', '$optimalMaxStock'] }, optimalMaxStock: { $gt: 0 } },
                    { 'highStockVariants.0': { $exists: true } }
                ]
            }
        }
    ]);
    return highStockAlerts;
};

const getVariantInventoryReport = async (userId) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const report = await Product.aggregate([
        { $match: { user: userObjectId, 'variants.0': { $exists: true } } },
        { $unwind: '$variants' },
        {
            $project: {
                _id: 0,
                productName: '$name',
                variantName: '$variants.name',
                sku: '$variants.sku',
                stock: '$variants.stock',
                costPrice: '$variants.costPrice',
                salePrice: '$variants.price',
                totalCostValue: { $multiply: ['$variants.stock', '$variants.costPrice'] },
                totalSaleValue: { $multiply: ['$variants.stock', '$variants.price'] },
            }
        }
    ]);
    return report;
};

export const productService = {
    getProducts,
    getFilterOptions,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getHighStockProducts,
    getVariantInventoryReport,
};