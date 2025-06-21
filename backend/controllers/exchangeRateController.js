// C:\Proyectos\Label\backend\controllers\exchangeRateController.js
const asyncHandler = require('express-async-handler');
const ExchangeRate = require('../models/ExchangeRate');

// @desc    Obtener la configuración de tasas de cambio para el usuario
// @route   GET /api/exchangeRate
// @access  Private
const getExchangeRate = asyncHandler(async (req, res) => {
    const exchangeRateConfig = await ExchangeRate.findOne({ user: req.user.id });

    if (exchangeRateConfig) {
        res.status(200).json(exchangeRateConfig);
    } else {
        // Si no hay configuración, devolver un estado 404 con un mensaje
        // Esto es normal si el usuario aún no ha configurado nada
        res.status(404).json({ message: 'No se ha configurado ninguna tasa de cambio para este usuario.' });
    }
});

// @desc    Configurar o actualizar las tasas de cambio y el porcentaje de ganancia
// @route   POST /api/exchangeRate
// @access  Private
const setExchangeRate = asyncHandler(async (req, res) => {
    const { conversions, defaultProfitPercentage, personalRateThresholdPercentage } = req.body;
    const userId = req.user.id;

    // Validaciones básicas para conversiones
    if (!conversions || !Array.isArray(conversions) || conversions.length === 0) {
        res.status(400);
        throw new Error('Debe proporcionar al menos una conversión de moneda.');
    }

    for (const conv of conversions) {
        if (!conv.fromCurrency || !conv.toCurrency || isNaN(Number(conv.rate)) || Number(conv.rate) <= 0) {
            res.status(400);
            throw new Error('Cada conversión debe tener moneda origen, destino y una tasa válida y positiva.');
        }
    }

    // Validar porcentaje de ganancia
    const numDefaultProfitPercentage = Number(defaultProfitPercentage);
    if (isNaN(numDefaultProfitPercentage) || numDefaultProfitPercentage < 0 || numDefaultProfitPercentage > 500) {
        res.status(400);
        throw new Error('El porcentaje de ganancia debe ser un número entre 0 y 500.');
    }

    // Validar umbral de tasa personalizada
    const numPersonalRateThresholdPercentage = Number(personalRateThresholdPercentage);
    if (isNaN(numPersonalRateThresholdPercentage) || numPersonalRateThresholdPercentage < 0 || numPersonalRateThresholdPercentage > 100) {
        res.status(400);
        throw new Error('El umbral de tasa personalizada debe ser un número entre 0 y 100.');
    }

    let exchangeRateConfig = await ExchangeRate.findOne({ user: userId });

    if (exchangeRateConfig) {
        // Actualizar configuración existente
        exchangeRateConfig.conversions = conversions.map(conv => ({ ...conv, lastUpdated: new Date() })); // Actualizar todas las conversiones
        exchangeRateConfig.defaultProfitPercentage = numDefaultProfitPercentage;
        exchangeRateConfig.personalRateThresholdPercentage = numPersonalRateThresholdPercentage;
        await exchangeRateConfig.save();
        res.status(200).json(exchangeRateConfig);
    } else {
        // Crear nueva configuración
        exchangeRateConfig = await ExchangeRate.create({
            user: userId,
            conversions: conversions.map(conv => ({ ...conv, lastUpdated: new Date() })),
            defaultProfitPercentage: numDefaultProfitPercentage,
            personalRateThresholdPercentage: numPersonalRateThresholdPercentage,
        });
        res.status(201).json(exchangeRateConfig);
    }
});

// @desc    Obtener una tasa oficial desde una fuente externa (para el cron job)
// @route   GET /api/exchangeRate/fetchOfficialRate
// @access  Private (o podría ser más restringido solo para cron/admin)
const fetchOfficialRate = asyncHandler(async (req, res) => {
    // NOTA: En una implementación real, aquí se haría la llamada a la API externa
    // (ej. de BCV o un servicio como Fixer.io, Open Exchange Rates, etc.)
    // Por ahora, simularemos un valor.
    const simulatedOfficialRate = 105.00 + Math.random() * 2; // Simula una variación
    const simulatedOfficialEurToUsdRate = 1.08 + Math.random() * 0.02; // Simula EUR a USD

    let exchangeRateConfig = await ExchangeRate.findOne({ user: req.user.id });

    // Si no existe, crea una configuración básica para este usuario
    if (!exchangeRateConfig) {
        exchangeRateConfig = await ExchangeRate.create({
            user: req.user.id,
            conversions: [], // Inicialmente vacío, se llenará con la oficial
        });
    }

    // Encuentra o actualiza la conversión USD-VES y EUR-USD
    let usdVesConversion = exchangeRateConfig.conversions.find(c => c.fromCurrency === 'USD' && c.toCurrency === 'VES');
    if (usdVesConversion) {
        usdVesConversion.rate = simulatedOfficialRate;
        usdVesConversion.lastUpdated = new Date();
    } else {
        exchangeRateConfig.conversions.push({
            fromCurrency: 'USD',
            toCurrency: 'VES',
            rate: simulatedOfficialRate,
            lastUpdated: new Date(),
        });
    }

    let eurUsdConversion = exchangeRateConfig.conversions.find(c => c.fromCurrency === 'EUR' && c.toCurrency === 'USD');
    if (eurUsdConversion) {
        eurUsdConversion.rate = simulatedOfficialEurToUsdRate;
        eurUsdConversion.lastUpdated = new Date();
    } else {
        exchangeRateConfig.conversions.push({
            fromCurrency: 'EUR',
            toCurrency: 'USD',
            rate: simulatedOfficialEurToUsdRate,
            lastUpdated: new Date(),
        });
    }

    exchangeRateConfig.officialRate = simulatedOfficialRate; // La tasa oficial para la principal (USD-VES)
    exchangeRateConfig.lastOfficialUpdate = new Date();

    await exchangeRateConfig.save();

    res.status(200).json({
        message: 'Tasa oficial actualizada/simulada.',
        officialRate: simulatedOfficialRate,
        exchangeRateConfig: exchangeRateConfig
    });
});

module.exports = {
    getExchangeRate,
    setExchangeRate,
    fetchOfficialRate, // <-- ¡NUEVA FUNCIÓN EXPORTADA!
};