// C:\Proyectos\Label\backend\models\ExchangeRate.js
import mongoose from 'mongoose';

// --- INICIO: LISTA DE MONEDAS DISPONIBLES EN EL MODELO ---
// ¡CRÍTICO! Esta lista DEBE ser la misma que en el controlador exchangeRateController.js
const ALL_CURRENCIES = [
    'USD', 'VES', 'EUR', 'COP', 'BRL', 'MXN', 'CLP', 'PEN', 'ARS', 'UYU',
    'DOP', 'GTQ', 'CRC', 'HNL', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'
];
// --- FIN: LISTA DE MONEDAS DISPONIBLES EN EL MODELO ---

// Esquema para cada conversión individual (ej. USD-VES, EUR-USD)
const conversionSchema = new mongoose.Schema({
    fromCurrency: {
        type: String,
        required: true,
        enum: ALL_CURRENCIES, // Valida que la moneda sea una de las permitidas
    },
    toCurrency: {
        type: String,
        required: true,
        enum: ALL_CURRENCIES, // Valida que la moneda sea una de las permitidas
    },
    rate: {
        type: Number,
        required: true,
        min: 0.0000000001, // Tasa mínima muy pequeña para manejar decimales ínfimos
    },
    lastUpdated: { // Para saber cuándo fue actualizada esta conversión específica
        type: Date,
        default: Date.now,
    }
}, { _id: false }); // No queremos IDs automáticos para cada subdocumento de conversión

// Esquema principal de la Tasa de Cambio por usuario
const exchangeRateSchema = new mongoose.Schema({
    user: { // Para saber qué usuario configuró esta tasa
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Cada usuario solo tiene un documento de configuración de tasas
    },
    // Este array guardará TODAS las conversiones oficiales calculadas
    conversions: [conversionSchema],

    // Un porcentaje de ganancia estándar para auto-calcular precios (se mantiene)
    defaultProfitPercentage: {
        type: Number,
        default: 20, // 20% de ganancia por defecto
    },
    // Umbral para auto-actualización de tasa personalizada vs. oficial (para alertas)
    personalRateThresholdPercentage: {
        type: Number,
        default: 5, // 5% de diferencia por defecto
    },
    // La tasa de cambio USD-VES que el usuario puede definir manualmente (su preferencia)
    personalRate: { 
        type: Number,
        default: 0 // Se inicializa en 0 o se actualizará con la oficial al inicio
    },
    // La tasa oficial de USD-VES obtenida de la API externa
    officialRate: { 
        type: Number,
        default: 0 // Se inicializa en 0 o se actualizará con la obtenida de la API
    },
    lastOfficialUpdate: { // Fecha de la última actualización de la tasa oficial (del fetch de la API)
        type: Date,
    },
    // fromCurrency, toCurrency, rate a nivel raíz del documento son redundantes si las conversiones están en el array
    // Se eliminan si tu modelo los tenía aquí directamente
}, {
    timestamps: true, // Añade `createdAt` y `updatedAt` automáticamente
});

// ¡IMPORTANTE! Eliminamos el índice único en subdocumentos `conversions.fromCurrency/toCurrency`.
// La unicidad de los pares de conversión DENTRO del array `conversions` para un mismo documento
// se maneja a nivel de aplicación (en `exchangeRateController.js` con el `Map`).
// Un índice `unique` aquí aplicaría a través de TODOS los documentos `ExchangeRate`,
// lo que impediría que diferentes usuarios tuvieran el mismo par de conversión (ej. USD-VES),
// lo cual es incorrecto. El `user: unique` ya asegura que cada usuario solo tiene un documento.
// exchangeRateSchema.index({ user: 1, 'conversions.fromCurrency': 1, 'conversions.toCurrency': 1 }, { unique: true, partialFilterExpression: { 'conversions.fromCurrency': { $exists: true } } }); // ¡ELIMINAR O COMENTAR!

export default mongoose.model('ExchangeRate', exchangeRateSchema);