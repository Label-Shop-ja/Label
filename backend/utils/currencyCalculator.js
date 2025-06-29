// C:\Proyectos\Label\backend\utils\currencyCalculator.js

/**
 * Función centralizada para manejar todos los cálculos de divisas y precios en la plataforma.
 * Se encarga de la precisión y flexibilidad en las conversiones.
 */

// Función auxiliar para encontrar una tasa de conversión directa en el array
const findRateInConversions = (conversionsArray, fromCurrency, toCurrency) => {
    return conversionsArray.find(c => c.fromCurrency === fromCurrency && c.toCurrency === toCurrency);
};

/**
 * Obtiene la tasa de conversión entre dos monedas usando la configuración de tasas proporcionada.
 * Maneja conversiones directas e inversas.
 *
 * @param {string} fromCurrency - Código de la moneda de origen (ej. 'USD', 'VES', 'EUR').
 * @param {string} toCurrency - Código de la moneda de destino (ej. 'USD', 'VES', 'EUR').
 * @param {object} exchangeRateConfig - Objeto de configuración de tasas de cambio (del modelo ExchangeRate de la BD).
 * @returns {number|null} La tasa de conversión o null si no se puede determinar.
 */
const getConversionRate = (fromCurrency, toCurrency, exchangeRateConfig) => {
    if (!exchangeRateConfig || !exchangeRateConfig.conversions) {
        console.error('¡Coño! Configuración de tasas de cambio inválida o no hay conversiones.');
        return null;
    }

    if (fromCurrency === toCurrency) {
        return 1; // La tasa de conversión de una moneda a sí misma es 1
    }

    // 1. Intentar encontrar una tasa directa (ej. USD-VES)
    const directConversion = findRateInConversions(exchangeRateConfig.conversions, fromCurrency, toCurrency);
    if (directConversion && directConversion.rate > 0) {
        return directConversion.rate;
    }

    // 2. Intentar encontrar la tasa inversa y calcular (ej. si buscas VES-USD y tienes USD-VES)
    const inverseConversion = findRateInConversions(exchangeRateConfig.conversions, toCurrency, fromCurrency);
    if (inverseConversion && inverseConversion.rate > 0) {
        return 1 / inverseConversion.rate;
    }

    // Si llegamos aquí, significa que las tasas que `fetchOfficialRate` guarda no cubren directamente
    // este par. Esto es poco probable si `fetchOfficialRate` está guardando USD-VES, EUR-USD y EUR-VES,
    // ya que cubren las bases. Pero por si acaso:

    console.warn(`¡Coño! No se encontró una tasa de conversión directa o inversa para ${fromCurrency} a ${toCurrency}. Revisa las conversiones almacenadas.`);
    return null;
};

/**
 * Convierte un monto de una moneda a otra.
 *
 * @param {number} amount - El monto a convertir.
 * @param {string} fromCurrency - Moneda de origen.
 * @param {string} toCurrency - Moneda de destino.
 * @param {object} exchangeRateConfig - Configuración de tasas de cambio.
 * @returns {number|null} El monto convertido o null si no se puede convertir.
 */
const convertPrice = (amount, fromCurrency, toCurrency, exchangeRateConfig) => {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
        console.error('¡Verga! Monto inválido para convertir.');
        return null;
    }
    const rate = getConversionRate(fromCurrency, toCurrency, exchangeRateConfig);
    if (rate !== null) {
        return parseFloat((amount * rate).toFixed(4)); // Precisión a 4 decimales para divisas
    }
    return null;
};

/**
 * Calcula el precio de venta de un producto basado en su costo, porcentaje de ganancia
 * y las monedas de costo y venta deseadas.
 *
 * @param {number} cost - El costo base del producto.
 * @param {string} costCurrency - La moneda del costo (ej. 'USD').
 * @param {number} profitPercentage - El porcentaje de ganancia deseado (ej. 20 para 20%).
 * @param {object} exchangeRateConfig - Configuración de tasas de cambio.
 * @param {string} saleCurrency - La moneda en la que se desea el precio de venta (ej. 'VES').
 * @returns {number|null} El precio de venta calculado o null si falla.
 */
const calculateSalePrice = (cost, costCurrency, profitPercentage, exchangeRateConfig, saleCurrency) => {
    if (cost === null || cost === undefined || isNaN(Number(cost)) || cost < 0) {
        console.error("Costo inválido para calcular precio de venta.");
        return null;
    }
    if (profitPercentage === null || profitPercentage === undefined || isNaN(Number(profitPercentage)) || profitPercentage < 0) {
        console.error("Porcentaje de ganancia inválido para calcular precio de venta.");
        return null;
    }

    let basePrice = Number(cost) * (1 + Number(profitPercentage) / 100);

    // Si la moneda de costo es diferente a la moneda de venta, necesitamos convertir
    if (costCurrency !== saleCurrency) {
        basePrice = convertPrice(basePrice, costCurrency, saleCurrency, exchangeRateConfig);
        if (basePrice === null) {
            console.error(`¡Peo! No se pudo convertir el precio base de ${costCurrency} a ${saleCurrency}.`);
            return null;
        }
    }
    return parseFloat(basePrice.toFixed(2)); // Precio de venta a 2 decimales para la mayoría de monedas
};

/**
 * Calcula el monto de ganancia y el precio de venta en una moneda de visualización específica.
 * Útil para formularios y displays donde se quiere ver el desglose.
 *
 * @param {number} cost - El costo base del producto.
 * @param {string} costCurrency - La moneda del costo.
 * @param {number} profitPercentage - El porcentaje de ganancia.
 * @param {object} exchangeRateConfig - Configuración de tasas de cambio.
 * @param {string} displayCurrency - La moneda en la que se desean los resultados para visualización.
 * @returns {object} Un objeto con salePrice, profitAmount y profitPercentage en la displayCurrency.
 */
const calculateProfitAndPriceForDisplay = (cost, costCurrency, profitPercentage, exchangeRateConfig, displayCurrency) => {
    if (cost === null || cost === undefined || isNaN(Number(cost)) || cost < 0 ||
        profitPercentage === null || profitPercentage === undefined || isNaN(Number(profitPercentage)) || profitPercentage < 0) {
        console.warn("Entradas inválidas para calcular ganancia y precio para display.");
        return { salePrice: null, profitAmount: null, profitPercentage: profitPercentage };
    }

    // Calcula el precio de venta y la ganancia en la moneda de costo
    const salePriceInCostCurrency = Number(cost) * (1 + Number(profitPercentage) / 100);
    const profitAmountInCostCurrency = salePriceInCostCurrency - Number(cost);

    let salePriceDisplay = null;
    let profitAmountDisplay = null;

    // Convierte a la moneda de visualización si es diferente
    if (costCurrency === displayCurrency) {
        salePriceDisplay = parseFloat(salePriceInCostCurrency.toFixed(2));
        profitAmountDisplay = parseFloat(profitAmountInCostCurrency.toFixed(2));
    } else {
        salePriceDisplay = convertPrice(salePriceInCostCurrency, costCurrency, displayCurrency, exchangeRateConfig);
        profitAmountDisplay = convertPrice(profitAmountInCostCurrency, costCurrency, displayCurrency, exchangeRateConfig);
        if (salePriceDisplay !== null) salePriceDisplay = parseFloat(salePriceDisplay.toFixed(2));
        if (profitAmountDisplay !== null) profitAmountDisplay = parseFloat(profitAmountDisplay.toFixed(2));
    }

    return {
        salePrice: salePriceDisplay,
        profitAmount: profitAmountDisplay,
        profitPercentage: parseFloat(Number(profitPercentage).toFixed(2)) // Asegura que el porcentaje también tenga precisión
    };
};


export {
    getConversionRate,
    convertPrice,
    calculateSalePrice,
    calculateProfitAndPriceForDisplay
};