// C:\Proyectos\Label\backend\models\Transaction.js
import mongoose from 'mongoose';

const transactionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Referencia al modelo de Usuario
    },
    description: {
      type: String,
      required: [true, 'Por favor, añade una descripción de la transacción'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Por favor, añade un monto'],
    },
    type: { // 'income' o 'expense'
      type: String,
      required: [true, 'Por favor, especifica el tipo de transacción (ingreso o gasto)'],
      enum: ['income', 'expense'], // Solo permite estos dos valores
    },
    category: {
      type: String,
      required: [true, 'Por favor, añade una categoría para la transacción'],
      trim: true,
    },
  },
  {
    timestamps: true, // Añade campos `createdAt` y `updatedAt` automáticamente
  }
);

// Índices optimizados para consultas de transacciones
transactionSchema.index({ user: 1, createdAt: -1 }); // Transacciones recientes
transactionSchema.index({ user: 1, type: 1 }); // Filtro por tipo (ingreso/gasto)
transactionSchema.index({ user: 1, category: 1 }); // Filtro por categoría
transactionSchema.index({ user: 1, amount: -1 }); // Transacciones de alto valor
transactionSchema.index({ createdAt: -1 }); // Transacciones recientes globales

export default mongoose.model('Transaction', transactionSchema);