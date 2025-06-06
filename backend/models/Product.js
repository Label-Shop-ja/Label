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
      required: [true, 'Por favor, añade un nombre para el producto'],
      trim: true,
    },
    description: {
      type: String,
      required: false, // La descripción es opcional
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Por favor, añade una categoría para el producto'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Por favor, añade un precio de venta para el producto'],
      min: [0.01, 'El precio de venta debe ser un número positivo'],
      set: (v) => parseFloat(v).toFixed(2), // Almacena con 2 decimales
      get: (v) => parseFloat(v), // Recupera como número flotante
    },
    // *** NUEVOS CAMPOS AÑADIDOS ***
    costPrice: { // Costo unitario del producto
      type: Number,
      required: [true, 'Por favor, añade un costo unitario para el producto'],
      min: [0.00, 'El costo unitario no puede ser negativo'], // Puede ser 0 si es un regalo o costo insignificante
      set: (v) => parseFloat(v).toFixed(2),
      get: (v) => parseFloat(v),
      default: 0.00,
    },
    sku: { // Stock Keeping Unit - Identificador único interno
      type: String,
      required: [true, 'Por favor, añade un SKU para el producto'],
      unique: true, // Cada SKU debe ser único
      trim: true,
      uppercase: true, // Opcional: Para estandarizar SKUs en mayúsculas
    },
    unitOfMeasure: { // Unidad de medida (ej. unidad, kg, litro)
      type: String,
      required: [true, 'Por favor, añade una unidad de medida'],
      trim: true,
      enum: ['unidad', 'kg', 'litro', 'metro', 'paquete', 'caja', 'docena', 'otro'], // Define las unidades permitidas
      default: 'unidad',
    },
    brand: { // Marca o fabricante del producto
      type: String,
      required: false, // Hacemos la marca opcional
      trim: true,
    },
    supplier: { // Proveedor principal del producto
      type: String,
      required: false, // Hacemos el proveedor opcional por ahora
      trim: true,
    },
    // *** FIN NUEVOS CAMPOS ***
    stock: {
      type: Number,
      required: [true, 'Por favor, añade el stock del producto'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
  },
  {
    timestamps: true, // Mantiene `createdAt` y `updatedAt`
    toJSON: { getters: true }, // Aplica getters al convertir a JSON (importante para price y costPrice)
    toObject: { getters: true }, // Aplica getters al convertir a objeto
  }
);

// Middleware de Mongoose para manejar el error de SKU duplicado de forma más amigable
productSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
    next(new Error('El SKU proporcionado ya existe. Por favor, utiliza un SKU diferente.'));
  } else {
    next(error);
  }
});


module.exports = mongoose.model('Product', productSchema);
