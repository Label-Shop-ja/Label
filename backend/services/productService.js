import Product from '../models/productModel.js';
import ExchangeRate from '../models/ExchangeRate.js';
import { calculateSalePrice } from '../utils/currencyCalculator.js';
import logInventoryMovement from '../utils/inventoryLogger.js';
import { createGlobalProduct } from '../controllers/globalProductController.js';
import mongoose from 'mongoose';

const getProducts = async (userId, queryParams) => {
    const { searchTerm, category, brand, supplier, variantColor, variantSize, page, limit, sortBy, sortOrder } = queryParams;

    const query = { user: userId };

    if (searchTerm) {
        query.$or = [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { sku: { $regex: searchTerm, '$options': 'i' } },
            { brand: { $regex: searchTerm, '$options': 'i' } },
            { supplier: { $regex: searchTerm, '$options': 'i' } },
            { 'variants.name': { $regex: searchTerm, $options: 'i' } },
            { 'variants.sku': { $regex: searchTerm, '$options': 'i' } },
        ];
    }

    if (category && category !== 'Todas las Categorías') query.category = category;
    if (brand && brand !== 'Todas las Marcas') query.brand = brand;
    if (supplier && supplier !== 'Todos los Proveedores') query.supplier = supplier;
    if (variantColor && variantColor !== 'Todos los Colores') query['variants.color'] = variantColor;
    if (variantSize && variantSize !== 'Todas las Tallas') query['variants.size'] = variantSize;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    let sortOptions = { createdAt: -1 };
    if (sortBy) {
        sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    }

    const products = await Product.find(query).sort(sortOptions).skip(skip).limit(limitNum);
    const totalProducts = await Product.countDocuments(query);

    return {
        products,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(totalProducts / limitNum),
            totalProducts,
            limit: limitNum,
        },
    };
};

const getProductById = async (productId, userId) => {
    const product = await Product.findById(productId);
    if (!product) {
        const error = new Error('Producto no encontrado');
        error.status = 404;
        throw error;
    }
    if (product.user.toString() !== userId) {
        const error = new Error('No autorizado para ver este producto');
        error.status = 401;
        throw error;
    }
    return product;
};

const processProductData = async (productData, userId) => {
    const { variants, profitPercentage, ...restOfData } = productData;

    const exchangeRateDoc = await ExchangeRate.findOne({ user: userId });
    if (!exchangeRateDoc) {
        const error = new Error('No se encontró la configuración de tasas de cambio para este usuario.');
        error.status = 400;
        throw error;
    }
    const exchangeRateConfig = exchangeRateDoc.toObject();
    const actualProfitPercentage = profitPercentage !== undefined ? Number(profitPercentage) : exchangeRateConfig.defaultProfitPercentage;

    const processedVariants = (variants || []).map(variant => {
        const calculatedVariantPrice = calculateSalePrice(
            Number(variant.costPrice),
            variant.costCurrency || restOfData.costCurrency || 'USD',
            variant.profitPercentage !== undefined ? Number(variant.profitPercentage) : actualProfitPercentage,
            exchangeRateConfig,
            variant.saleCurrency || restOfData.saleCurrency || 'USD'
        );
        if (calculatedVariantPrice === null) {
            const error = new Error(`No se pudo calcular el precio para la variante ${variant.name || variant.sku}.`);
            error.status = 500;
            throw error;
        }
        return { ...variant, price: calculatedVariantPrice };
    });

    let finalPriceForMainProduct = 0;
    if (!processedVariants.length) {
        finalPriceForMainProduct = calculateSalePrice(
            Number(restOfData.costPrice),
            restOfData.costCurrency || 'USD',
            actualProfitPercentage,
            exchangeRateConfig,
            restOfData.saleCurrency || 'USD'
        );
        if (finalPriceForMainProduct === null) {
            const error = new Error('No se pudo calcular el precio de venta para el producto principal.');
            error.status = 500;
            throw error;
        }
    }

    return {
        ...restOfData,
        price: finalPriceForMainProduct,
        variants: processedVariants,
        profitPercentage: actualProfitPercentage,
    };
};

const createProduct = async (productData, userId) => {
    const processedData = await processProductData(productData, userId);
    const product = await Product.create({ ...processedData, user: userId });

    // Log inventory for new product
    if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
            if (variant.stock > 0) await logInventoryMovement({ user: userId, product: product._id, variantId: variant._id, productName: product.name, variantName: variant.name, sku: variant.sku, movementType: 'in', quantityChange: variant.stock, finalStock: variant.stock, reason: 'initial_stock' });
        }
    } else if (product.stock > 0) {
        await logInventoryMovement({ user: userId, product: product._id, productName: product.name, sku: product.sku, movementType: 'in', quantityChange: product.stock, finalStock: product.stock, reason: 'initial_stock' });
    }

    await createGlobalProduct(product.toObject());
    return product;
};

const updateProduct = async (productId, productData, userId) => {
    const product = await getProductById(productId, userId);
    const oldProduct = product.toObject(); // Get a plain object copy for comparison

    const processedData = await processProductData(productData, userId);
    
    Object.assign(product, processedData);
    const updatedProduct = await product.save();

    // Log inventory changes by comparing old and new stock
    // (This is a simplified version, a more detailed one would compare each variant)
    if (oldProduct.stock !== updatedProduct.stock) {
        const quantityDiff = updatedProduct.stock - oldProduct.stock;
        await logInventoryMovement({ user: userId, product: updatedProduct._id, productName: updatedProduct.name, sku: updatedProduct.sku, movementType: quantityDiff > 0 ? 'in' : 'out', quantityChange: Math.abs(quantityDiff), finalStock: updatedProduct.stock, reason: 'adjustment' });
    }

    await createGlobalProduct(updatedProduct.toObject());
    return updatedProduct;
};

const deleteProduct = async (productId, userId) => {
    const product = await getProductById(productId, userId);
    await product.deleteOne();
    return { message: 'Producto eliminado' };
};

const getLowStockProducts = async (userId) => {
    const lowStockMainProducts = await Product.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), variants: { $size: 0 } } },
        { $match: { $expr: { $lte: ['$stock', '$reorderThreshold'] } } }
    ]);

    const lowStockVariantProducts = await Product.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), 'variants.0': { $exists: true } } },
        { $unwind: '$variants' },
        { $match: { $expr: { $lte: ['$variants.stock', '$variants.reorderThreshold'] } } },
        { $group: { _id: '$_id', name: { $first: '$name' }, sku: { $first: '$sku' }, imageUrl: { $first: '$imageUrl' }, variants: { $push: '$variants' } } }
    ]);

    const combined = [];
    lowStockMainProducts.forEach(p => combined.push({ ...p, isMainProduct: true }));
    lowStockVariantProducts.forEach(p => combined.push({ ...p, variantsInAlert: p.variants, isMainProduct: false }));

    return combined;
};

const getHighStockProducts = async (userId) => {
    const highStockMainProducts = await Product.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), variants: { $size: 0 }, isPerishable: true } },
        { $match: { $expr: { $gt: ['$stock', '$optimalMaxStock'] } } }
    ]);
 
    const highStockVariantProducts = await Product.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), 'variants.0': { $exists: true } } },
        { $unwind: '$variants' },
        { $match: { 'variants.isPerishable': true, $expr: { $gt: ['$variants.stock', '$variants.optimalMaxStock'] } } },
        {
            $group: {
                _id: '$_id',
                name: { $first: '$name' },
                sku: { $first: '$sku' },
                imageUrl: { $first: '$imageUrl' },
                variants: { $push: '$variants' }
            }
        }
    ]);

    const combined = [];
    highStockMainProducts.forEach(p => combined.push({ ...p, isMainProduct: true }));
    highStockVariantProducts.forEach(p => combined.push({ ...p, variantsInAlert: p.variants, isMainProduct: false }));

    return combined;
};

const getVariantInventoryReport = async (userId) => {
    const report = await Product.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                'variants.0': { $exists: true }
            }
        },
        { $unwind: '$variants' },
        {
            $project: {
                _id: 0,
                productId: '$_id',
                productName: '$name',
                variantId: '$variants._id',
                variantName: '$variants.name',
                variantSku: '$variants.sku',
                variantStock: '$variants.stock',
                variantPrice: '$variants.price',
                variantCostPrice: '$variants.costPrice',
                variantTotalValue: { $multiply: ['$variants.stock', '$variants.price'] },
                variantTotalCostValue: { $multiply: ['$variants.stock', '$variants.costPrice'] }
            }
        },
        { $sort: { productName: 1, variantName: 1 } }
    ]);
    return report;
};

export const productService = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getHighStockProducts,
    getVariantInventoryReport,
};