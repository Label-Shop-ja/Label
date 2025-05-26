// C:\Proyectos\Label\backend\models\Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio.'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder los 100 caracteres.'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres.'],
  },
  sku: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true,
    required: [true, 'El SKU es obligatorio.'],
  },
  category: {
    type: String,
    trim: true,
    default: 'General',
  },
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio.'],
    min: [0, 'El precio no puede ser negativo.'],
    default: 0,
  },
  cost: {
    type: Number,
    min: [0, 'El costo no puede ser negativo.'],
    default: 0,
  },
  quantityInStock: {
    type: Number,
    required: [true, 'La cantidad en stock es obligatoria.'],
    min: [0, 'La cantidad en stock no puede ser negativa.'],
    default: 0,
  },
  reorderPoint: {
    type: Number,
    min: [0, 'El punto de reorden no puede ser negativo.'],
    default: 0,
  },
  imageUrl: {
    type: String,
    trim: true,
    default: '',
  },
  supplier: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);