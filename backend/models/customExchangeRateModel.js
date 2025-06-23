const mongoose = require('mongoose');

/**
 * @description Este es el modelo para las tasas de cambio personalizadas de cada compañía/usuario.
 * Aquí guardamos la "regla" que el usuario define, no el valor final.
 * Por ejemplo, si la tasa oficial USD a VES es 105 y el usuario quiere que sea 110,
 * aquí guardamos la diferencia (+5). Así, si la tasa oficial sube a 108, el sistema
 * automáticamente sabe que la tasa del usuario es 113 (108 + 5).
 */
const customExchangeRateSchema = new mongoose.Schema(
  {
    // Pa' saber de quién es este guiso
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company', // O 'User', dependiendo de tu estructura
      required: true,
    },
    // La moneda de origen, ej: 'USD'
    fromCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    // La moneda a la que se convierte, ej: 'VES'
    toCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    // El "toque técnico" del usuario: la diferencia que quiere añadirle a la tasa oficial.
    adjustmentValue: {
      type: Number,
      required: true,
    },
    // Pa' saber si esta regla está activa o no
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Un índice pa' que no haya dos guisos iguales pa' la misma compañía y el mismo par de monedas.
customExchangeRateSchema.index({ company: 1, fromCurrency: 1, toCurrency: 1 }, { unique: true });

module.exports = mongoose.model('CustomExchangeRate', customExchangeRateSchema);