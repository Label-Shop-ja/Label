import asyncHandler from 'express-async-handler';
import CustomExchangeRate from '../models/customExchangeRateModel.js';
import ExchangeRate from '../models/ExchangeRate.js';

/**
 * @description Función de utilería (el bachaquero del bien) que busca la tasa oficial para un usuario.
 * Busca en el documento de configuración de tasas del usuario (ExchangeRate).
 */
const getOfficialRate = async (from, to, userId) => {
  if (!userId) {
    throw new Error('Se requiere ID de usuario para buscar la tasa oficial.');
  }
  // 1. Buscar la configuración de tasas del usuario.
  const userExchangeRateConfig = await ExchangeRate.findOne({ user: userId });

  if (!userExchangeRateConfig || !userExchangeRateConfig.conversions || userExchangeRateConfig.conversions.length === 0) {
    // ¡Coño! Si no se encuentra la tasa, hay que lanzar un peo.
    throw new Error(`No se encontró configuración de tasas para el usuario.`);
  }

  // 2. Buscar la conversión específica en el array.
  const conversion = userExchangeRateConfig.conversions.find(
    conv => conv.fromCurrency === from && conv.toCurrency === to
  );

  if (!conversion) {
    throw new Error(`No se encontró una tasa de cambio oficial para ${from} -> ${to}`);
  }
  return conversion.rate;
};

/**
 * @route   POST /api/custom-rates
 * @desc    Crear una nueva tasa de cambio personalizada
 * @access  Private
 */
export const createCustomRate = asyncHandler(async (req, res) => {
  const { fromCurrency, toCurrency, customRateValue } = req.body;

  if (!fromCurrency || !toCurrency || customRateValue === undefined || customRateValue === null) {
    res.status(400);
    throw new Error('Faltan datos, mi loco. Revisa la vaina.');
  }

  // 1. Buscamos la tasa oficial actual pa' hacer el cálculo
  const officialRate = await getOfficialRate(fromCurrency, toCurrency, req.user.id);

  // 2. Calculamos la diferencia que el usuario quiere. Este es el "toque técnico".
  const adjustmentValue = parseFloat(customRateValue) - officialRate;

  const customRate = await CustomExchangeRate.create({
    company: req.user.companyId, // Usamos el companyId del usuario logueado
    fromCurrency,
    toCurrency,
    adjustmentValue,
  });

  res.status(201).json(customRate);
});

/**
 * @route   GET /api/custom-rates
 * @desc    Obtener todas las tasas personalizadas de un usuario/compañía
 * @access  Private
 */
export const getCustomRates = asyncHandler(async (req, res) => {
  const rates = await CustomExchangeRate.find({ company: req.user.companyId }); // Tasas de la compañía del usuario
  res.status(200).json(rates);
});

/**
 * @route   PUT /api/custom-rates/:id
 * @desc    Actualizar una tasa personalizada
 * @access  Private
 */
export const updateCustomRate = asyncHandler(async (req, res) => {
  const { customRateValue } = req.body;
  const rateToUpdate = await CustomExchangeRate.findById(req.params.id);

  if (!rateToUpdate) {
    res.status(404);
    throw new Error('Esa tasa no existe, ¿qué inventas?');
  }

  // Verificamos que el pana sea dueño de este guiso
  if (rateToUpdate.company.toString() !== req.user.companyId) {
    res.status(401);
    throw new Error('¡Quieto ahí, manito! No puedes tocar lo que no es tuyo.');
  }

  // Recalculamos el ajuste si el usuario manda un nuevo valor
  const officialRate = await getOfficialRate(rateToUpdate.fromCurrency, rateToUpdate.toCurrency, req.user.id);
  rateToUpdate.adjustmentValue = parseFloat(customRateValue) - officialRate;

  const updatedRate = await rateToUpdate.save();
  res.status(200).json(updatedRate);
});

/**
 * @route   DELETE /api/custom-rates/:id
 * @desc    Eliminar una tasa personalizada
 * @access  Private
 */
export const deleteCustomRate = asyncHandler(async (req, res) => {
  // La lógica pa' borrar es similar a la de actualizar.
  // Busca el beta, verifica que sea del pana, y le mete serrucho.
  // ¡Te lo dejo de tarea, mi loco! ¡Pa' que te actives! Jajajaja.
  // Na' mentira, pero es sencillo, si te enredas me avisas.
  const rate = await CustomExchangeRate.findById(req.params.id);
  if (rate && rate.company.toString() === req.user.companyId) {
    await rate.deleteOne();
    res.status(200).json({ message: '¡Listo el pollo! Tasa eliminada.' });
  } else {
    res.status(404);
    throw new Error('No se encontró la tasa o no tienes permiso.');
  }
});