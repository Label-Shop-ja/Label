// C:\Proyectos\Label\backend\controllers\exchangeRateController.js
import asyncHandler from 'express-async-handler';
import ExchangeRate from '../models/ExchangeRate.js'; // Ensure the model uses 'export default'
import axios from 'axios';
// dotenv.config() is already called in server.js, no need to call it here.

// --- INICIO: LISTA DE MONEDAS OBJETIVO PARA LA EXPANSIÓN ---
// ¡CRÍTICO! Esta lista DEBE ser la misma que en el modelo ExchangeRate.js
const TARGET_CURRENCIES = [
    'USD', 'VES', 'EUR', 'COP', 'BRL', 'MXN', 'CLP', 'PEN', 'ARS', 'UYU',
    'DOP', 'GTQ', 'CRC', 'HNL', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'
];
// --- FIN: LISTA DE MONEDAS OBJETIVO ---

// @desc    Obtener la configuración de tasas de cambio para el usuario
// @route   GET /api/exchangeRate
// @access  Private
const getExchangeRate = asyncHandler(async (req, res) => {
    const exchangeRateConfig = await ExchangeRate.findOne({ user: req.user.id });

    if (exchangeRateConfig) {
        res.status(200).json(exchangeRateConfig);
    } else {
        res.status(404).json({ message: 'No se ha configurado ninguna tasa de cambio para este usuario.' });
    }
});

// @desc    Configurar o actualizar las tasas de cambio y el porcentaje de ganancia
// @route   POST /api/exchangeRate
// @access  Private
const setExchangeRate = asyncHandler(async (req, res) => {
    // personalRate es el campo que el usuario puede setear manualmente (su propia tasa USD-VES)
    const { conversions, defaultProfitPercentage, personalRateThresholdPercentage, personalRate } = req.body; 
    const userId = req.user.id;

    // Validaciones (mantienen las mismas lógicas robustas)
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

    const numDefaultProfitPercentage = Number(defaultProfitPercentage);
    if (isNaN(numDefaultProfitPercentage) || numDefaultProfitPercentage < 0 || numDefaultProfitPercentage > 500) {
        res.status(400);
        throw new Error('El porcentaje de ganancia debe ser un número entre 0 y 500.');
    }

    const numPersonalRateThresholdPercentage = Number(personalRateThresholdPercentage);
    if (isNaN(numPersonalRateThresholdPercentage) || numPersonalRateThresholdPercentage < 0 || numPersonalRateThresholdPercentage > 100) {
        res.status(400);
        throw new Error('El umbral de tasa personalizada debe ser un número entre 0 y 100.');
    }

    const numPersonalRate = Number(personalRate);
    if (personalRate !== undefined && (isNaN(numPersonalRate) || numPersonalRate <= 0)) {
        res.status(400);
        throw new Error('La tasa personalizada debe ser un número positivo.');
    }

    let exchangeRateConfig = await ExchangeRate.findOne({ user: userId });

    if (exchangeRateConfig) {
        exchangeRateConfig.conversions = conversions.map(conv => ({ ...conv, lastUpdated: new Date() }));
        exchangeRateConfig.defaultProfitPercentage = numDefaultProfitPercentage;
        exchangeRateConfig.personalRateThresholdPercentage = numPersonalRateThresholdPercentage;
        
        // Actualiza el campo personalRate del documento con la nueva tasa del usuario
        if (personalRate !== undefined) { 
            exchangeRateConfig.personalRate = numPersonalRate;
        }
        await exchangeRateConfig.save();
        res.status(200).json(exchangeRateConfig);
    } else {
        // Crea una nueva configuración si no existe para este usuario
        exchangeRateConfig = await ExchangeRate.create({
            user: userId,
            conversions: conversions.map(conv => ({ ...conv, lastUpdated: new Date() })),
            defaultProfitPercentage: numDefaultProfitPercentage,
            personalRateThresholdPercentage: numPersonalRateThresholdPercentage,
            personalRate: numPersonalRate || 0, 
        });
        res.status(201).json(exchangeRateConfig);
    }
});

// @desc    Obtener una tasa oficial desde una fuente externa (para el cron job)
// @route   GET /api/exchangeRate/fetchOfficialRate
// @access  Private (o podría ser más restringido solo para cron/admin)
const fetchOfficialRate = asyncHandler(async (req, res) => {
    const API_KEY = process.env.EXCHANGE_RATE_API_KEY;
    const API_BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

    try {
        console.log('¡Coño, intentando conseguir las tasas oficiales externas de ExchangeRate-API.com!');
        const response = await axios.get(API_BASE_URL);
        const data = response.data;

        if (data && data.result === 'success' && data.conversion_rates) {
            let exchangeRateConfig = await ExchangeRate.findOne({ user: req.user.id });

            if (!exchangeRateConfig) {
                console.log('Creando nueva configuración de tasa de cambio para el usuario (al obtener oficial).');
                exchangeRateConfig = new ExchangeRate({
                    user: req.user.id,
                    conversions: [],
                    defaultProfitPercentage: 20,
                    personalRateThresholdPercentage: 5,
                    personalRate: 0 // Inicializa en 0 si es un nuevo documento
                });
            }

            // Actualiza la tasa oficial principal (USD-VES) si está disponible
            const officialRateUSDVES = data.conversion_rates.VES;
            if (officialRateUSDVES) {
                exchangeRateConfig.officialRate = officialRateUSDVES;
            }
            exchangeRateConfig.lastOfficialUpdate = new Date();

            // --- INICIO: Lógica para guardar TODAS las CONVERSIONES de monedas objetivo ---
            const updatedConversions = [];
            const conversionRatesFromAPI = data.conversion_rates;
            
            // Usamos un mapa para almacenar las tasas y evitar duplicados al construirlas
            // También sirve para hacer búsquedas rápidas al calcular conversiones cruzadas
            const tempConversionMap = new Map(); 

            // Primero, añadir todas las tasas directas desde USD a nuestras TARGET_CURRENCIES
            // Y sus inversas si la moneda destino es USD (ej. EUR->USD)
            for (const currency of TARGET_CURRENCIES) {
                if (currency === 'USD') continue; // USD a USD es 1, no necesita ser explícito

                const rateFromUSD = conversionRatesFromAPI[currency];

                if (rateFromUSD && rateFromUSD > 0) {
                    const keyUSDToCurrency = `USD-${currency}`;
                    if (!tempConversionMap.has(keyUSDToCurrency)) {
                        updatedConversions.push({
                            fromCurrency: 'USD',
                            toCurrency: currency,
                            rate: rateFromUSD,
                            lastUpdated: new Date(),
                        });
                        tempConversionMap.set(keyUSDToCurrency, rateFromUSD);
                    }
                    
                    // También guardamos la inversa de inmediato para conversiones directas a USD
                    const keyCurrencyToUSD = `${currency}-USD`;
                    if (!tempConversionMap.has(keyCurrencyToUSD)) {
                         updatedConversions.push({
                            fromCurrency: currency,
                            toCurrency: 'USD',
                            rate: 1 / rateFromUSD,
                            lastUpdated: new Date(),
                        });
                        tempConversionMap.set(keyCurrencyToUSD, 1 / rateFromUSD);
                    }
                } else if (rateFromUSD === 0) {
                    console.warn(`¡Coño! La tasa de USD a ${currency} es 0. No se puede usar.`);
                } else {
                    console.warn(`¡Atención! La API no devolvió la tasa de USD a ${currency} o es inválida.`);
                }
            }
            
            // Ahora, calcular y añadir TODAS las combinaciones cruzadas posibles (FROM -> TO)
            // utilizando USD como moneda puente (FROM -> USD -> TO)
            for (const fromCurr of TARGET_CURRENCIES) {
                for (const toCurr of TARGET_CURRENCIES) {
                    if (fromCurr === toCurr) continue; // No convertir a sí mismo

                    const key = `${fromCurr}-${toCurr}`;
                    if (tempConversionMap.has(key)) continue; // Si ya se guardó directamente (ej. USD-X o X-USD)

                    const rateFromUsdToFromCurr = tempConversionMap.get(`${fromCurr}-USD`); // Cuántos USD por 1 FROM_CURR
                    const rateFromUsdToToCurr = tempConversionMap.get(`USD-${toCurr}`);   // Cuántos TO_CURR por 1 USD

                    if (rateFromUsdToFromCurr && rateFromUsdToToCurr && rateFromUsdToFromCurr > 0 && rateFromUsdToToCurr > 0) {
                        const crossRate = rateFromUsdToFromCurr * rateFromUsdToToCurr; // (USD/FROM_CURR) * (TO_CURR/USD) = TO_CURR/FROM_CURR
                        updatedConversions.push({
                            fromCurrency: fromCurr,
                            toCurrency: toCurr,
                            rate: crossRate,
                            lastUpdated: new Date(),
                        });
                        tempConversionMap.set(key, crossRate);
                    } else {
                        // console.warn(`No se pudo calcular la tasa cruzada ${fromCurr}-${toCurr}. Datos insuficientes.`);
                    }
                }
            }

            // Ordenar las conversiones para tener un array consistente en la BD
            updatedConversions.sort((a, b) => {
                if (a.fromCurrency === b.fromCurrency) return a.toCurrency.localeCompare(b.toCurrency);
                return a.fromCurrency.localeCompare(b.fromCurrency);
            });

            exchangeRateConfig.conversions = updatedConversions;
            // --- FIN: Lógica para guardar TODAS las CONVERSIONES ---

            await exchangeRateConfig.save();

            console.log(`¡Tasas oficiales actualizadas! USD/VES: ${officialRateUSDVES || 'N/A'}. Total de conversiones guardadas: ${updatedConversions.length}. ¡Éxito criminal!`);
            res.status(200).json({
                message: 'Tasas oficiales actualizadas.',
                officialRate: officialRateUSDVES,
                exchangeRateConfig: exchangeRateConfig
            });

        } else {
            console.error('¡Verga, la API no me devolvió los datos esperados o falló! Respuesta completa:', JSON.stringify(data, null, 2));
            res.status(500).json({ message: '¡Hubo un peo al procesar la respuesta de la API externa!' });
        }

    } catch (error) {
        console.error('¡Coño, un peo grave al conectar con la API de tasas de cambio!', error.message);
        if (error.response) {
            console.error('Detalles del error (respuesta de la API):', error.response.status, error.response.data);
            if (error.response.status === 429) {
                console.error('¡Cuidado, mi loco! Puede que hayas excedido el límite de peticiones de la API (429 Too Many Requests).');
            }
        }
        res.status(500).json({ message: '¡Error al intentar obtener la tasa oficial externa!' });
    }
});

export {
  getExchangeRate,
  setExchangeRate,
  fetchOfficialRate,
};