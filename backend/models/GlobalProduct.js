// C:\Proyectos\Label\backend\models\GlobalProduct.js
const mongoose = require('mongoose');

const globalProductSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Por favor, añade un nombre para el producto global'],
            trim: true,
            minlength: 2,
            maxlength: 100, // Añadido max length para consistencia
        },
        description: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500, // Añadido max length
        },
        category: {
            type: String,
            required: [true, 'Por favor, añade una categoría para el producto global'],
            trim: true,
            minlength: 2,
            maxlength: 50, // Añadido max length
        },
        sku: {
            type: String,
            required: [true, 'Por favor, añade un SKU para el producto global'],
            unique: true,
            trim: true,
            uppercase: true,
            minlength: 3,
            maxlength: 30, // Añadido max length
        },
        unitOfMeasure: {
            type: String,
            required: [true, 'Por favor, añade una unidad de medida para el producto global'],
            trim: true,
            enum: ['unidad', 'kg', 'litro', 'metro', 'paquete', 'caja', 'docena', 'otro'],
            default: 'unidad',
        },
        brand: {
            type: String,
            required: false,
            trim: true,
            maxlength: 50, // Añadido max length
        },
        supplier: {
            type: String,
            required: false,
            trim: true,
            maxlength: 50, // Añadido max length
        },
        // Nuevo campo para la purga de datos
        // Registrará la última vez que este producto global fue usado/referenciado por un producto de usuario.
        // Se inicializa al crearse o se actualiza cuando se referencia.
        lastUsedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // `createdAt` y `updatedAt`
        toJSON: { getters: true },
        toObject: { getters: true },
    }
);

// Middleware para asegurar que lastUsedAt se actualice en cada guardado
// Si lastUsedAt no está seteado o es nulo, lo ponemos a la fecha actual.
// Esto es útil si se insertan documentos directamente o si se migra data.
globalProductSchema.pre('save', function (next) {
    if (this.isModified() || this.isNew) { // Si el documento es nuevo o ha sido modificado
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

module.exports = mongoose.model('GlobalProduct', globalProductSchema);
