// C:\Proyectos\Label\backend\models\Product.js
const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: [true, 'Por favor, añade un nombre de producto'],
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        description: {
            type: String,
            default: '', // Puede ser una cadena vacía si no hay descripción
            maxlength: 500,
        },
        category: {
            type: String,
            required: [true, 'Por favor, añade una categoría'],
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        price: {
            type: Number,
            required: [true, 'Por favor, añade un precio de venta'],
            min: 0.01, // El precio debe ser al menos 0.01
            set: (v) => parseFloat(v).toFixed(2), // Guarda el precio con 2 decimales
        },
        stock: {
            type: Number,
            required: [true, 'Por favor, añade la cantidad en stock'],
            min: 0, // El stock no puede ser negativo
        },
        costPrice: { // Nuevo campo para el costo unitario del producto
            type: Number,
            required: [true, 'Por favor, añade el costo unitario'],
            min: 0, // El costo unitario no puede ser negativo
            set: (v) => parseFloat(v).toFixed(2), // Guarda el costo con 2 decimales
        },
        sku: { // Stock Keeping Unit - Identificador único
            type: String,
            required: [true, 'Por favor, añade un SKU'],
            unique: true, // Cada SKU debe ser único por usuario
            trim: true,
            uppercase: true, // Estandarizar SKUs en mayúsculas
            minlength: 3,
            maxlength: 30,
        },
        unitOfMeasure: { // Unidad de medida (ej. unidad, kg, litro)
            type: String,
            required: [true, 'Por favor, añade una unidad de medida'],
            trim: true,
            enum: ['unidad', 'kg', 'litro', 'metro', 'paquete', 'caja', 'docena', 'otro'],
            default: 'unidad',
        },
        brand: { // Marca o fabricante del producto
            type: String,
            default: '', // Opcional
            trim: true,
            maxlength: 50,
        },
        supplier: { // Proveedor principal del producto
            type: String,
            default: '', // Opcional
            trim: true,
            maxlength: 50,
        },
        // Nuevo campo para la URL de la imagen del producto
        imageUrl: {
            type: String,
            default: 'https://placehold.co/600x400/2D3748/F8F8F2?text=Sin+Imagen', // Placeholder por defecto
            trim: true,
        },
    },
    {
        timestamps: true, // Mantiene `createdAt` y `updatedAt` para seguimiento
    }
);

// Middleware de Mongoose para manejar el error de SKU duplicado de forma más amigable
productSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
        next(new Error('El SKU proporcionado ya existe en tu inventario. Por favor, utiliza un SKU diferente.'));
    } else {
        next(error);
    }
});

module.exports = mongoose.model('Product', productSchema);
