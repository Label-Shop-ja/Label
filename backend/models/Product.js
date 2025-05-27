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
    category: { // <--- ¡AÑADIMOS ESTE CAMPO!
      type: String,
      required: [true, 'Por favor, añade una categoría para el producto'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Por favor, añade un precio para el producto'],
      min: [0.01, 'El precio debe ser un número positivo'],
      set: (v) => parseFloat(v).toFixed(2),
      get: (v) => parseFloat(v),
    },
    stock: {
      type: Number,
      required: [true, 'Por favor, añade el stock del producto'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

module.exports = mongoose.model('Product', productSchema);