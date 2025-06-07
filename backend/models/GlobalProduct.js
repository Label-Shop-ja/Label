// C:\Proyectos\Label\backend\models\GlobalProduct.js
const mongoose = require('mongoose');

console.log('Cargando modelo GlobalProduct...');

const globalProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor, añade un nombre para el producto global'],
      trim: true,
    },
    description: {
      type: String,
      required: false, // La descripción es opcional en el catálogo global
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Por favor, añade una categoría para el producto global'],
      trim: true,
    },
    sku: { // Stock Keeping Unit - Identificador único global
      type: String,
      required: [true, 'Por favor, añade un SKU para el producto global'],
      unique: true, // Cada SKU debe ser único a nivel global
      trim: true,
      uppercase: true, // Estandarizar SKUs en mayúsculas
    },
    unitOfMeasure: { // Unidad de medida (ej. unidad, kg, litro)
      type: String,
      required: [true, 'Por favor, añade una unidad de medida para el producto global'],
      trim: true,
      // Usar las mismas opciones de enum que en Product.js para consistencia
      enum: ['unidad', 'kg', 'litro', 'metro', 'paquete', 'caja', 'docena', 'otro'],
      default: 'unidad',
    },
    brand: { // Marca o fabricante del producto
      type: String,
      required: false,
      trim: true,
    },
    supplier: { // Proveedor principal del producto (si aplica a nivel global, sino se puede omitir o hacer opcional)
      type: String,
      required: false,
      trim: true,
    },
    // Si en el futuro quieres una imagen "genérica" para el catálogo global, puedes añadir un campo aquí:
    // imageUrl: {
    //   type: String,
    //   required: false,
    //   trim: true,
    //   default: 'https://placehold.co/600x400/2D3748/F8F8F2?text=Imagen+No+Disponible',
    // },
  },
  {
    timestamps: true, // Mantiene `createdAt` y `updatedAt` para seguimiento
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Middleware de Mongoose para manejar el error de SKU duplicado de forma más amigable
globalProductSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
    next(new Error('El SKU proporcionado ya existe en el catálogo global. Por favor, utiliza un SKU diferente.'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('GlobalProduct', globalProductSchema);
