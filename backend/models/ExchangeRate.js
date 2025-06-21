// C:\Proyectos\Label\backend\models\ExchangeRate.js
const mongoose = require('mongoose');

// Esquema para cada conversión individual (ej. USD-VES, EUR-USD)
const conversionSchema = mongoose.Schema({
    fromCurrency: {
        type: String,
        required: true,
        enum: ['USD', 'VES', 'EUR'],
    },
    toCurrency: {
        type: String,
        required: true,
        enum: ['USD', 'VES', 'EUR'],
    },
    rate: {
        type: Number,
        required: [true, 'Por favor, añade la tasa de cambio'],
        min: 0.000001, // Tasa mínima
    },
    lastUpdated: { // Para saber cuándo fue actualizada esta conversión específica
        type: Date,
        default: Date.now,
    }
}, { _id: false }); // No queremos IDs automáticos para cada subdocumento de conversión

// Esquema principal de la Tasa de Cambio por usuario
const exchangeRateSchema = mongoose.Schema({
    user: { // Para saber qué usuario configuró esta tasa, si se quiere multi-usuario
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Este array guardará todas las conversiones que el usuario configure (ej. USD-VES, EUR-USD)
    conversions: [conversionSchema],

    // Campo para la tasa oficial (la que viene de una API externa)
    officialRate: {
        type: Number,
        required: false, // No es requerido si no se usa fuente externa aún
        min: 0.000001,
    },
    lastOfficialUpdate: { // Fecha de la última actualización de la tasa oficial
        type: Date,
        required: false,
    },
    // Un porcentaje de ganancia estándar para auto-calcular precios (se mantiene)
    defaultProfitPercentage: {
        type: Number,
        default: 30, // 30% de ganancia por defecto
        min: 0,
        max: 500, // Un límite razonable
    },
    // Nuevo: Umbral para auto-actualización de tasa personalizada vs. oficial
    personalRateThresholdPercentage: {
        type: Number,
        default: 1, // 1% de diferencia por defecto
        min: 0,
        max: 100,
    }
}, {
    timestamps: true, // Añade `createdAt` y `updatedAt` automáticamente (para la entidad ExchangeRate global)
});

// Asegúrate de que las conversiones sean únicas por fromCurrency y toCurrency para el mismo usuario
exchangeRateSchema.index({ user: 1, 'conversions.fromCurrency': 1, 'conversions.toCurrency': 1 }, { unique: true, partialFilterExpression: { 'conversions.fromCurrency': { $exists: true } } });

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);