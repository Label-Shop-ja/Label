import { calculateSalePrice } from './currencyCalculator';

// `describe` agrupa pruebas relacionadas. Es como un capítulo.
describe('calculateSalePrice', () => {

  // Mock de la configuración de tasas de cambio para las pruebas
  const mockExchangeRateConfig = {
    conversions: [
      { fromCurrency: 'USD', toCurrency: 'VES', rate: 36.5 },
      { fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.1 },
    ],
  };

  // `it` o `test` define una prueba individual. Describe lo que debería pasar.
  it('debería calcular el precio de venta correctamente en la misma moneda', () => {
    const salePrice = calculateSalePrice(
      100,        // cost
      'USD',      // costCurrency
      30,         // profitPercentage
      mockExchangeRateConfig, // exchangeRateConfig
      'USD'       // saleCurrency
    );
    // `expect` es la afirmación. `toBe` comprueba igualdad estricta.
    // 100 * (1 + 30/100) = 130
    expect(salePrice).toBe(130.00);
  });

  it('debería calcular el precio de venta correctamente con conversión de moneda directa', () => {
    const salePrice = calculateSalePrice(
      10,         // cost
      'USD',      // costCurrency
      50,         // profitPercentage
      mockExchangeRateConfig, // exchangeRateConfig
      'VES'       // saleCurrency
    );
    // Costo base con ganancia: 10 * (1 + 50/100) = 15 USD
    // Precio de venta convertido: 15 * 36.5 = 547.5
    // `toBeCloseTo` es mejor para números con decimales para evitar errores de precisión.
    expect(salePrice).toBeCloseTo(547.50);
  });

  it('debería manejar un porcentaje de ganancia de cero', () => {
    const salePrice = calculateSalePrice(
      75,         // cost
      'USD',      // costCurrency
      0,          // profitPercentage
      mockExchangeRateConfig, // exchangeRateConfig
      'USD'       // saleCurrency
    );
    // El precio de venta debe ser igual al costo.
    expect(salePrice).toBe(75.00);
  });

  it('debería devolver null si falta la tasa de cambio para una conversión', () => {
    const salePrice = calculateSalePrice(
      10,         // cost
      'COP',      // costCurrency (no existe en el mock)
      20,         // profitPercentage
      mockExchangeRateConfig, // exchangeRateConfig
      'VES'       // saleCurrency
    );
    expect(salePrice).toBeNull();
  });

  it('debería devolver null si el costo o el porcentaje son negativos', () => {
    const salePrice1 = calculateSalePrice(-100, 'USD', 20, mockExchangeRateConfig, 'USD');
    const salePrice2 = calculateSalePrice(100, 'USD', -10, mockExchangeRateConfig, 'USD');

    expect(salePrice1).toBeNull();
    expect(salePrice2).toBeNull();
  });

});