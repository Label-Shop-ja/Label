// C:\Proyectos\Label\backend\models\productModel.js
const mongoose = require('mongoose');

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
            enum: ['USD', 'VES', 'EUR'], // Puedes añadir más si quieres
            default: 'USD', // Por defecto, se asume que los precios se manejan en USD
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

// Middleware pre-save para productos con variantes
productSchema.pre('save', function(next) {
    if (this.variants && this.variants.length > 0) {
        // Si el producto tiene variantes, su stock, precio, costo y unidad de medida
        // se derivan de las variantes o se ponen a cero/valor por defecto
        this.stock = this.variants.reduce((acc, variant) => acc + variant.stock, 0);

        // Establecer precio y costo del producto padre a un valor que indique que se usan variantes
        // Usamos el precio y costo de la primera variante como base, o 0 si no hay variantes (aunque siempre habrá al menos 1)
        this.price = this.variants.length > 0 ? this.variants[0].price : 0;
        this.costPrice = this.variants.length > 0 ? this.variants[0].costPrice : 0;
        this.unitOfMeasure = this.variants.length > 0 ? this.variants[0].unitOfMeasure : 'unidad';

        // Para el SKU del padre: si el frontend no lo envía y hay variantes, lo dejamos vacío
        // si el esquema permite que sea opcional. Actualmente es `required: true`.
        // Por ahora, asumimos que el frontend maneja el SKU del padre si hay variantes.
        // Si el SKU del padre debe ser vacío o derivado cuando hay variantes, tendríamos que cambiar `required: true` a `false` en `productModel.js` para el SKU principal.
    }
    next();
});

// Exporta el modelo Product
module.exports = mongoose.model('Product', productSchema);