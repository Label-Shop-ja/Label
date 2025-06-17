// C:\Proyectos\Label\backend\models\ExchangeRate.js
const mongoose = require('mongoose');

const exchangeRateSchema = mongoose.Schema({
  user: { // Para saber qué usuario configuró esta tasa, si se quiere multi-usuario
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fromCurrency: { // La moneda base (ej. 'USD')
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR'], // Solo las monedas que queremos convertir
  },
  toCurrency: { // La moneda a la que se convierte (ej. 'VES')
    type: String,
    required: true,
    default: 'VES',
    enum: ['VES'], // La moneda local
  },
  rate: { // La tasa de cambio actual (ej. 36.5)
    type: Number,
    required: [true, 'Por favor, añade la tasa de cambio'],
    min: 0.01,
  },
  // Opcional: Un porcentaje de ganancia estándar para auto-calcular precios
  defaultProfitPercentage: {
    type: Number,
    default: 30, // 30% de ganancia por defecto
    min: 0,
    max: 500, // Un límite razonable
  },
}, {
  timestamps: true, // Para saber cuándo fue actualizada la tasa
});

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);