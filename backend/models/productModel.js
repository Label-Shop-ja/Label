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

// Exporta el modelo Product
module.exports = mongoose.model('Product', productSchema);
