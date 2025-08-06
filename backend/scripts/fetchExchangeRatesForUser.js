// Script para obtener tasas de cambio para un usuario específico
import mongoose from 'mongoose';
import ExchangeRate from '../models/ExchangeRate.js';
import axios from 'axios';
import { SUPPORTED_CURRENCIES } from '../constants.js';
import dotenv from 'dotenv';

dotenv.config();

const TARGET_CURRENCIES = SUPPORTED_CURRENCIES;
const USER_ID = '6882d40d8dc650e7a0c1a874';

const fetchExchangeRatesForUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        const API_KEY = process.env.EXCHANGE_RATE_API_KEY;
        const API_BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

        console.log('🔄 Obteniendo tasas de cambio desde la API...');
        const response = await axios.get(API_BASE_URL);
        const data = response.data;

        if (data && data.result === 'success' && data.conversion_rates) {
            const updatedConversions = [];
            const tempConversionMap = new Map();

            // Conversiones directas desde USD
            for (const currency of TARGET_CURRENCIES) {
                if (currency === 'USD') continue;

                const rateFromUSD = data.conversion_rates[currency];
                if (rateFromUSD && rateFromUSD > 0) {
                    updatedConversions.push({
                        fromCurrency: 'USD',
                        toCurrency: currency,
                        rate: rateFromUSD,
                        lastUpdated: new Date(),
                    });
                    tempConversionMap.set(`USD-${currency}`, rateFromUSD);

                    updatedConversions.push({
                        fromCurrency: currency,
                        toCurrency: 'USD',
                        rate: 1 / rateFromUSD,
                        lastUpdated: new Date(),
                    });
                    tempConversionMap.set(`${currency}-USD`, 1 / rateFromUSD);
                }
            }

            // Conversiones cruzadas
            for (const fromCurr of TARGET_CURRENCIES) {
                for (const toCurr of TARGET_CURRENCIES) {
                    if (fromCurr === toCurr) continue;

                    const key = `${fromCurr}-${toCurr}`;
                    if (tempConversionMap.has(key)) continue;

                    const rateFromUsdToFromCurr = tempConversionMap.get(`${fromCurr}-USD`);
                    const rateFromUsdToToCurr = tempConversionMap.get(`USD-${toCurr}`);

                    if (rateFromUsdToFromCurr && rateFromUsdToToCurr && rateFromUsdToFromCurr > 0 && rateFromUsdToToCurr > 0) {
                        const crossRate = rateFromUsdToFromCurr * rateFromUsdToToCurr;
                        updatedConversions.push({
                            fromCurrency: fromCurr,
                            toCurrency: toCurr,
                            rate: crossRate,
                            lastUpdated: new Date(),
                        });
                        tempConversionMap.set(key, crossRate);
                    }
                }
            }

            updatedConversions.sort((a, b) => {
                if (a.fromCurrency === b.fromCurrency) return a.toCurrency.localeCompare(b.toCurrency);
                return a.fromCurrency.localeCompare(b.fromCurrency);
            });

            // Crear configuración para el usuario
            const exchangeRateConfig = await ExchangeRate.create({
                user: USER_ID,
                conversions: updatedConversions,
                defaultProfitPercentage: 20,
                personalRateThresholdPercentage: 5,
                personalRate: data.conversion_rates.VES || 0,
                officialRate: data.conversion_rates.VES || 0,
                lastOfficialUpdate: new Date()
            });

            console.log('✅ Tasas de cambio creadas para el usuario');
            console.log(`📊 Total conversiones: ${updatedConversions.length}`);
            console.log(`💱 Tasa USD-VES: ${data.conversion_rates.VES}`);

        } else {
            console.error('❌ Error en respuesta de la API');
        }

        await mongoose.connection.close();
        console.log('✅ Conexión cerrada');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

fetchExchangeRatesForUser();