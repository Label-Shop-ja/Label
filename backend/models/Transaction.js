// C:\Proyectos\Label\backend\models\Transaction.js
const mongoose = require('mongoose');

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

module.exports = mongoose.model('Transaction', transactionSchema);