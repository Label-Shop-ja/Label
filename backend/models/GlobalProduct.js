// C:\Proyectos\Label\backend\models\GlobalProduct.js
import mongoose from 'mongoose';

const globalProductSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Por favor, añade un nombre para el producto global'],
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        description: {
            type: String,
            default: '',
            maxlength: 500,
        },
        category: {
            type: String,
            required: [true, 'Por favor, añade una categoría para el producto global'],
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        sku: { // Stock Keeping Unit - Identificador único global
            type: String,
            required: [true, 'Por favor, añade un SKU para el producto global'],
            unique: true, // Cada SKU debe ser único a nivel global
            trim: true,
            uppercase: true, // Estandarizar SKUs en mayúsculas
            minlength: 3,
            maxlength: 30,
        },
        unitOfMeasure: { // Unidad de medida (ej. unidad, kg, litro)
            type: String,
            required: [true, 'Por favor, añade una unidad de medida para el producto global'],
            trim: true,
            enum: ['unidad', 'kg', 'litro', 'metro', 'paquete', 'caja', 'docena', 'otro'],
            default: 'unidad',
        },
        brand: { // Marca o fabricante del producto
            type: String,
            default: '',
            trim: true,
            maxlength: 50,
        },
        supplier: { // Proveedor principal del producto (si aplica a nivel global, sino se puede omitir o hacer opcional)
            type: String,
            default: '',
            trim: true,
            maxlength: 50,
        },
        // Nuevo campo para la URL de la imagen del producto
        imageUrl: {
            type: String,
            default: 'https://placehold.co/600x400/2D3748/F8F8F2?text=Sin+Imagen', // Placeholder por defecto
            trim: true,
        },
        // Campo para la purga de datos
        lastUsedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // Mantiene `createdAt` y `updatedAt` para seguimiento
        toJSON: { getters: true },
        toObject: { getters: true },
    }
);

// Middleware para asegurar que lastUsedAt se actualice en cada guardado
globalProductSchema.pre('save', function (next) {
    if (this.isModified() || this.isNew) {
        this.lastUsedAt = Date.now();
    }
    next();
});

// Middleware de Mongoose para manejar el error de SKU duplicado de forma más amigable
globalProductSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
        next(new Error('El SKU proporcionado ya existe en el catálogo global. Por favor, utiliza un SKU diferente.'));
    } else {
        next(error);
    }
});

export default mongoose.model('GlobalProduct', globalProductSchema);
