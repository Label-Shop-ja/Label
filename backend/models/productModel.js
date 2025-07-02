// C:\Proyectos\Label\backend\models\productModel.js
import mongoose from 'mongoose';
import { SUPPORTED_CURRENCIES } from '../constants.js';
import { calculateSalePrice } from '../utils/currencyCalculator.js';

// Define el esquema para las variantes de producto
const variantSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Por favor, añade un nombre para la variante'],
            trim: true,
        },
        sku: {
            type: String,
            required: false, // Ahora es opcional a nivel de BD.
            unique: false,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Por favor, añade un precio de venta para la variante'],
            default: 0,
            min: 0,
        },
        costPrice: {
            type: Number,
            required: [true, 'Por favor, añade un costo para la variante'],
            default: 0,
            min: 0,
        },
        costCurrency: { // Moneda en la que se registra el costo de esta variante
            type: String,
            required: true,
            enum: SUPPORTED_CURRENCIES,
            default: 'USD',
            },
        saleCurrency: { // Moneda en la que se registra el precio de venta de esta variante
            type: String,
            required: true,
            enum: SUPPORTED_CURRENCIES,
            default: 'USD',
            },
        profitPercentage: {
            type: Number,
            required: false,
            min: 0,
        },
        // Stock y unidad de medida para la variante
        stock: {
            type: Number,
            required: [true, 'Por favor, añade el stock de la variante'],
            default: 0,
            min: 0,
        },
        unitOfMeasure: {
            type: String,
            required: [true, 'Por favor, añade una unidad de medida para la variante'],
            default: 'unidad',
            trim: true,
        },
        // Atributos adicionales para las variantes
        color: {
            type: String,
            trim: true,
            default: '',
        },
        size: {
            type: String,
            trim: true,
            default: '',
        },
        material: {
            type: String,
            trim: true,
            default: '',
        },
        imageUrl: {
            type: String,
            default: '', // URL de la imagen específica de la variante
        },
        // --- NUEVOS CAMPOS PARA ALERTAS DE STOCK Y PERECEDEROS ---
        isPerishable: { // Indica si esta variante es perecedera
            type: Boolean,
            default: false,
        },
        reorderThreshold: { // Umbral para alerta de stock bajo
            type: Number,
            default: 0,
            min: 0,
        },
        optimalMaxStock: { // Umbral para alerta de stock alto/óptimo (para perecederos)
            type: Number,
            default: 0,
            min: 0,
        },
        shelfLifeDays: { // Días de vida útil (para perecederos)
            type: Number,
            default: 0,
            min: 0,
        },
        // --- FIN NUEVOS CAMPOS ---
    },
    {
        timestamps: true, // Añade createdAt y updatedAt para cada variante
    }
);

// Define el esquema principal del producto
const productSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Esto asume que tienes un modelo de usuario
        },
        name: {
            type: String,
            required: [true, 'Por favor, añade un nombre de producto'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Por favor, añade una categoría'],
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        costPrice: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        costCurrency: { // Moneda en la que se registra el costo del producto principal
            type: String,
            required: true,
            enum: SUPPORTED_CURRENCIES,
            default: 'USD',
        },
        saleCurrency: { // Moneda en la que se registra el precio de venta del producto principal
            type: String,
            required: true,
            enum: SUPPORTED_CURRENCIES,
            default: 'USD',
        },
        displayCurrency: { // Moneda preferida para mostrar en la UI de listas (ej. InventoryPage)
            type: String,
            required: true,
            enum: SUPPORTED_CURRENCIES,
            default: 'USD',
        },
        // SKU del producto principal (Stock Keeping Unit)
        // Este es el identificador único del producto principal, que puede ser diferente al SKU de las variantes
        // Si el producto tiene variantes, el SKU del producto principal puede ser opcional o derivado de las variantes
        // Si el producto no tiene variantes, el SKU es obligatorio y debe ser único
        sku: {
            type: String,
            required: true,
            unique: true, // El SKU del producto principal debe ser único
            trim: true,
        },
        unitOfMeasure: {
            type: String,
            required: true,
            default: 'unidad',
            trim: true,
        },
        // Moneda base del precio y costo del producto principal y sus variantes (ej. 'USD', 'VES')
        baseCurrency: {
            type: String,
            required: true,
            enum: SUPPORTED_CURRENCIES, // Puedes añadir más si quieres
            default: 'USD', // Por defecto, se asume que los precios se manejan en USD
        },
        profitPercentage: { // Porcentaje de ganancia para productos simples
            type: Number,
            required: false,
            min: 0,
            default: 20,
        },
        brand: {
            type: String,
            default: '',
            trim: true,
        },
        supplier: {
            type: String,
            default: '',
            trim: true,
        },
        imageUrl: {
            type: String,
            default: '', // URL de la imagen principal del producto
        },
        // Nuevos atributos para el producto principal (opcionales)
        color: {
            type: String,
            trim: true,
            default: '',
        },
        size: {
            type: String,
            trim: true,
            default: '',
        },
        material: {
            type: String,
            trim: true,
            default: '',
        },
        // --- NUEVOS CAMPOS PARA ALERTAS DE STOCK Y PERECEDEROS (PARA PRODUCTOS SIN VARIANTES) ---
        isPerishable: { // Indica si el producto principal es perecedero
            type: Boolean,
            default: false,
        },
        reorderThreshold: { // Umbral para alerta de stock bajo
            type: Number,
            default: 0,
            min: 0,
        },
        optimalMaxStock: { // Umbral para alerta de stock alto/óptimo (para perecederos)
            type: Number,
            default: 0,
            min: 0,
        },
        shelfLifeDays: { // Días de vida útil (para perecederos)
            type: Number,
            default: 0,
            min: 0,
        },
        // --- FIN NUEVOS CAMPOS ---
        // Array de variantes, utilizando el esquema de variantes definido arriba
        variants: [variantSchema],
    },
    {
        timestamps: true, // Añade createdAt y updatedAt para el producto principal
    }
);

// Índices para optimizar las búsquedas
productSchema.index({ user: 1 }); // Para filtrar productos por usuario rápidamente
productSchema.index({ name: 'text', description: 'text', sku: 'text', brand: 'text', supplier: 'text' }); // Para búsquedas de texto

// Virtual para calcular el stock total del producto a partir de sus variantes
productSchema.virtual('totalStock').get(function() {
    if (this.variants && this.variants.length > 0) {
        return this.variants.reduce((acc, variant) => acc + variant.stock, 0);
    }
    return this.stock; // Si no tiene variantes, usa su propio stock
});

// Virtual para calcular el valor total del inventario de este producto/variante en USD
productSchema.virtual('totalValueUSD').get(function() {
    // Si tiene variantes, suma los valores de sus variantes
    if (this.variants && this.variants.length > 0) {
        return this.variants.reduce((acc, variant) => acc + (variant.stock * variant.price), 0);
    }
    // Si no tiene variantes, usa su propio stock y precio
    return this.stock * this.price;
});

// Configura toJSON y toObject para incluir virtuals
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Hook para calcular el precio de venta y sincronizar datos antes de guardar
productSchema.pre('save', async function (next) {
    // Si no se ha modificado nada relevante para el precio, no hacemos nada.
    const isCostModified = this.isModified('costPrice') || this.isModified('profitPercentage');
    const areVariantsModified = this.isModified('variants');

    if (!isCostModified && !areVariantsModified) {
        return next();
    }

    // Necesitamos la configuración de tasas del usuario para hacer cualquier cálculo
    const ExchangeRate = mongoose.model('ExchangeRate');
    const exchangeRateConfig = await ExchangeRate.findOne({ user: this.user });

    if (!exchangeRateConfig) {
        const error = new Error('No se encontró la configuración de tasas de cambio para este usuario. No se puede calcular el precio.');
        error.statusCode = 400; // Bad Request
        return next(error);
    }

    // CASO 1: Producto con variantes.
    if (this.variants && this.variants.length > 0) {
        // Sincronizar el stock total del padre
        this.stock = this.variants.reduce((acc, variant) => acc + variant.stock, 0);

        // Calcular el precio de cada variante
        for (const variant of this.variants) {
            variant.price = calculateSalePrice(
                variant.costPrice,
                variant.costCurrency,
                variant.profitPercentage,
                exchangeRateConfig,
                variant.saleCurrency
            );
            if (variant.price === null) {
                return next(new Error(`No se pudo calcular el precio para la variante "${variant.name}" debido a una configuración de moneda inválida.`));
            }
        }
    } else if (isCostModified) { // CASO 2: Producto simple (sin variantes) y se modificó su costo o ganancia.
        this.price = calculateSalePrice(this.costPrice, this.costCurrency, this.profitPercentage, exchangeRateConfig, this.saleCurrency);
        if (this.price === null) {
            return next(new Error(`No se pudo calcular el precio para el producto "${this.name}" debido a una configuración de moneda inválida.`));
        }
    }

    next();
});

// Exporta el modelo Product
export default mongoose.model('Product', productSchema);
