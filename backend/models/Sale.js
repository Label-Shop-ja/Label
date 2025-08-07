// C:\Proyectos\Label\backend\models\Sale.js
import mongoose from 'mongoose';

const saleProductSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product', // Referencia al producto que se vendió
  },
  name: { // Guardamos el nombre para historial, por si el producto original cambia
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  priceAtSale: { // Precio del producto en el momento de la venta
    type: Number,
    required: true,
  },
}, {
  _id: false // No crear un _id para cada subdocumento de producto vendido
});

const saleSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // El usuario que realizó la venta
    },
    productsSold: [saleProductSchema], // Array de productos vendidos en esta transacción
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Por favor, especifica el método de pago'],
      enum: ['cash', 'card', 'transfer', 'other'], // Métodos de pago comunes
      default: 'cash',
    },
    customerName: { // Opcional: Nombre del cliente (por si no hay modelo de cliente aún)
      type: String,
      required: false,
      trim: true,
    },
    // Opcional: Para futura referencia a una transacción financiera específica
    financialTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: false,
    },
  },
  {
    timestamps: true, // Añade campos `createdAt` y `updatedAt` automáticamente
  }
);

// Índices optimizados para consultas de ventas
saleSchema.index({ user: 1, createdAt: -1 }); // Ventas recientes por usuario
saleSchema.index({ user: 1, paymentMethod: 1 }); // Ventas por método de pago
saleSchema.index({ 'productsSold.product': 1 }); // Historial de ventas por producto
saleSchema.index({ user: 1, totalAmount: -1 }); // Ventas de alto valor
saleSchema.index({ user: 1, customerName: 1 }); // Ventas por cliente
saleSchema.index({ createdAt: -1 }); // Ventas recientes globales

export default mongoose.model('Sale', saleSchema);