// c:/Respaldo Jhosber/Proyectos/Label/backend/utils/currencyCalculator.test.js

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { calculateSalePrice, convertPrice } from './currencyCalculator';

// Datos de prueba simulando la configuración de la BD
const mockExchangeRateConfig = {
    conversions: [
        { fromCurrency: 'USD', toCurrency: 'VES', rate: 40.0 },
        { fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.1 },
    ],
    // ...otras propiedades del modelo
};

describe('currencyCalculator', () => {
    let errorSpy;
    let warnSpy;

    // Antes de que comiencen las pruebas, reemplazamos console.error y console.warn
    beforeAll(() => {
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    // Después de que terminen todas las pruebas, restauramos las funciones originales
    afterAll(() => {
        errorSpy.mockRestore();
        warnSpy.mockRestore();
    });
    
    describe('convertPrice', () => {
        it('debería convertir correctamente de USD a VES', () => {
            const amount = 10; // 10 USD
            const expected = 400; // 400 VES
            expect(convertPrice(amount, 'USD', 'VES', mockExchangeRateConfig)).toBeCloseTo(expected);
        });

        it('debería convertir correctamente de VES a USD (tasa inversa)', () => {
            const amount = 400; // 400 VES
            const expected = 10; // 10 USD
            expect(convertPrice(amount, 'VES', 'USD', mockExchangeRateConfig)).toBeCloseTo(expected);
        });

        it('debería devolver 1 si las monedas son iguales', () => {
            const amount = 100;
            expect(convertPrice(amount, 'USD', 'USD', mockExchangeRateConfig)).toBe(100);
        });

        it('debería devolver null si no se encuentra una tasa', () => {
            const amount = 100;
            expect(convertPrice(amount, 'COP', 'USD', mockExchangeRateConfig)).toBeNull();
        });

        it('debería devolver null si el monto es inválido', () => {
            expect(convertPrice(null, 'USD', 'VES', mockExchangeRateConfig)).toBeNull();
            expect(convertPrice(undefined, 'USD', 'VES', mockExchangeRateConfig)).toBeNull();
        });
    });

    describe('calculateSalePrice', () => {
        it('debería calcular el precio de venta en la misma moneda', () => {
            // Costo: 100 USD, Ganancia: 25% => Precio de Venta: 125 USD
            const price = calculateSalePrice(100, 'USD', 25, mockExchangeRateConfig, 'USD');
            expect(price).toBeCloseTo(125.00);
        });

        it('debería calcular el precio de venta convirtiendo la moneda', () => {
            // Costo: 100 USD, Ganancia: 20% => 120 USD
            // 120 USD * 40.0 (tasa USD-VES) => 4800 VES
            const price = calculateSalePrice(100, 'USD', 20, mockExchangeRateConfig, 'VES');
            expect(price).toBeCloseTo(4800.00);
        });

        it('debería devolver null si el costo es negativo', () => {
            const price = calculateSalePrice(-50, 'USD', 20, mockExchangeRateConfig, 'USD');
            expect(price).toBeNull();
        });

        it('debería devolver null si el porcentaje de ganancia es negativo', () => {
            const price = calculateSalePrice(100, 'USD', -10, mockExchangeRateConfig, 'USD');
            expect(price).toBeNull();
        });
    });
});
