// C:\Proyectos\Label\backend\controllers\exchangeRateController.js
const asyncHandler = require('express-async-handler');
const ExchangeRate = require('../models/ExchangeRate');

// @desc    Obtener la tasa de cambio actual para el usuario
// @route   GET /api/exchangeRate
// @access  Private
const getExchangeRate = asyncHandler(async (req, res) => {
  const exchangeRate = await ExchangeRate.findOne({ user: req.user.id });

  if (exchangeRate) {
    res.status(200).json(exchangeRate);
  } else {
    // Si no hay tasa definida, devolver una por defecto o un mensaje
    res.status(404).json({ message: 'No se ha configurado una tasa de cambio. Por favor, configúrala.' });
  }
});

// @desc    Configurar o actualizar la tasa de cambio
// @route   POST /api/exchangeRate
// @access  Private
const setExchangeRate = asyncHandler(async (req, res) => {
  const { fromCurrency, toCurrency, rate, defaultProfitPercentage } = req.body;

  if (!rate || isNaN(Number(rate)) || Number(rate) <= 0) {
    res.status(400);
    throw new Error('Por favor, ingresa una tasa de cambio válida y positiva.');
  }

  let exchangeRate = await ExchangeRate.findOne({ user: req.user.id });

  if (exchangeRate) {
    // Actualizar existente
    exchangeRate.fromCurrency = fromCurrency || exchangeRate.fromCurrency;
    exchangeRate.toCurrency = toCurrency || exchangeRate.toCurrency;
    exchangeRate.rate = Number(rate);
    exchangeRate.defaultProfitPercentage = Number(defaultProfitPercentage) || exchangeRate.defaultProfitPercentage;
    await exchangeRate.save();
    res.status(200).json(exchangeRate);
  } else {
    // Crear nuevo
    exchangeRate = await ExchangeRate.create({
      user: req.user.id,
      fromCurrency: fromCurrency || 'USD',
      toCurrency: toCurrency || 'VES',
      rate: Number(rate),
      defaultProfitPercentage: Number(defaultProfitPercentage) || 30,
    });
    res.status(201).json(exchangeRate);
  }
});

module.exports = {
  getExchangeRate,
  setExchangeRate,
};