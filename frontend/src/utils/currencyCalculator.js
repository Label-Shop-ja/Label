// C:\Proyectos\Label\frontend\src\utils\currencyCalculator.js

/**
 * Función centralizada para manejar todos los cálculos de divisas y precios en la plataforma.
 * Se encarga de la precisión y flexibilidad en las conversiones.
 */

// Función auxiliar para encontrar una tasa de conversión directa en el array
const findRateInConversions = (conversionsArray, fromCurrency, toCurrency) => {
    if (!Array.isArray(conversionsArray)) return null;
    return conversionsArray.find(
        c => c.fromCurrency === fromCurrency && c.toCurrency === toCurrency
    );
};

/**
 * Obtiene la tasa de conversión entre dos monedas usando la configuración de tasas proporcionada.
 * Maneja conversiones directas e inversas.
 */
const getConversionRate = (fromCurrency, toCurrency, exchangeRateConfig, customRates = []) => {
    if (!exchangeRateConfig || !Array.isArray(exchangeRateConfig.conversions)) {
        console.error('¡Coño! Configuración de tasas de cambio inválida o no hay conversiones.');
        return null;
    }

    if (!fromCurrency || !toCurrency) {
        console.error('Monedas de origen o destino no definidas.');
        return null;
    }

    if (fromCurrency === toCurrency) {
        return 1;
    }

    // 1. Tasa personalizada activa
    const customRate = Array.isArray(customRates)
        ? customRates.find(
            rate => rate.fromCurrency === fromCurrency &&
                    rate.toCurrency === toCurrency &&
                    rate.isActive
        )
        : null;

    if (customRate) {
        const officialDirectRate = findRateInConversions(exchangeRateConfig.conversions, fromCurrency, toCurrency);
        if (officialDirectRate && officialDirectRate.rate > 0) {
            return officialDirectRate.rate + customRate.adjustmentValue;
        } else {
            console.warn(`Tasa personalizada para ${fromCurrency}->${toCurrency}, pero no hay tasa oficial directa.`);
        }
    }

    // 2. Tasa oficial directa
    const directConversion = findRateInConversions(exchangeRateConfig.conversions, fromCurrency, toCurrency);
    if (directConversion && directConversion.rate > 0) {
        return directConversion.rate;
    }

    // 3. Tasa oficial inversa
    const inverseConversion = findRateInConversions(exchangeRateConfig.conversions, toCurrency, fromCurrency);
    if (inverseConversion && inverseConversion.rate > 0) {
        return 1 / inverseConversion.rate;
    }

    console.warn(`No se encontró una tasa de conversión directa o inversa para ${fromCurrency} a ${toCurrency}.`);
    return null;
};

/**
 * Convierte un monto de una moneda a otra.
 */
const convertPrice = (amount, fromCurrency, toCurrency, exchangeRateConfig, customRates = []) => {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
        console.error('Monto inválido para convertir.');
        return null;
    }
    const rate = getConversionRate(fromCurrency, toCurrency, exchangeRateConfig, customRates);
    if (rate !== null) {
        return parseFloat((amount * rate).toFixed(4));
    }
    return null;
};

/**
 * Calcula el precio de venta de un producto basado en su costo, porcentaje de ganancia y monedas.
 */
const calculateSalePrice = (cost, costCurrency, profitPercentage, exchangeRateConfig, saleCurrency, customRates = []) => {
    if (cost === null || cost === undefined || isNaN(Number(cost)) || cost < 0) {
        console.error("Costo inválido para calcular precio de venta.");
        return null;
    }
    if (profitPercentage === null || profitPercentage === undefined || isNaN(Number(profitPercentage)) || profitPercentage < 0) {
        console.error("Porcentaje de ganancia inválido para calcular precio de venta.");
        return null;
    }

    let basePrice = Number(cost) * (1 + Number(profitPercentage) / 100);

    if (costCurrency !== saleCurrency) {
        basePrice = convertPrice(basePrice, costCurrency, saleCurrency, exchangeRateConfig, customRates);
        if (basePrice === null) {
            console.error(`No se pudo convertir el precio base de ${costCurrency} a ${saleCurrency}.`);
            return null;
        }
    }
    return parseFloat(basePrice.toFixed(2));
};

/**
 * Calcula el monto de ganancia y el precio de venta en una moneda de visualización específica.
 */
const calculateProfitAndPriceForDisplay = (cost, costCurrency, profitPercentage, exchangeRateConfig, displayCurrency, customRates = []) => {
    if (cost === null || cost === undefined || isNaN(Number(cost)) || cost < 0 ||
        profitPercentage === null || profitPercentage === undefined || isNaN(Number(profitPercentage)) || profitPercentage < 0) {
        console.warn("Entradas inválidas para calcular ganancia y precio para display.");
        return { salePrice: null, profitAmount: null, profitPercentage: profitPercentage };
    }

    const salePriceInCostCurrency = Number(cost) * (1 + Number(profitPercentage) / 100);
    const profitAmountInCostCurrency = salePriceInCostCurrency - Number(cost);

    let salePriceDisplay = null;
    let profitAmountDisplay = null;

    if (costCurrency === displayCurrency) {
        salePriceDisplay = parseFloat(salePriceInCostCurrency.toFixed(2));
        profitAmountDisplay = parseFloat(profitAmountInCostCurrency.toFixed(2));
    } else {
        salePriceDisplay = convertPrice(salePriceInCostCurrency, costCurrency, displayCurrency, exchangeRateConfig, customRates);
        profitAmountDisplay = convertPrice(profitAmountInCostCurrency, costCurrency, displayCurrency, exchangeRateConfig, customRates);
        if (salePriceDisplay !== null) salePriceDisplay = parseFloat(salePriceDisplay.toFixed(2));
        if (profitAmountDisplay !== null) profitAmountDisplay = parseFloat(profitAmountDisplay.toFixed(2));
    }

    return {
        salePrice: salePriceDisplay,
        profitAmount: profitAmountDisplay,
        profitPercentage: parseFloat(Number(profitPercentage).toFixed(2))
    };
};

export {
    getConversionRate,
    convertPrice,
    calculateSalePrice,
    calculateProfitAndPriceForDisplay
};