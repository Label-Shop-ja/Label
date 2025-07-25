// C:\Proyectos\Label\frontend\src\utils\unitConversion.js
export const convertToGrams = (kg) => {
    return kg * 1000;
};

export const convertToKilograms = (grams) => {
    return grams / 1000;
};

export const convertToMilliliters = (liters) => {
    return liters * 1000;
};

export const convertToLiters = (milliliters) => {
    return milliliters / 1000;
};

export const convertToCentimeters = (meters) => {
    return meters * 100;
};

export const convertToMeters = (centimeters) => {
    return centimeters / 100;
};

/**
 * Calcula el precio de una cantidad fraccionada de un producto por unidad de medida.
 * @param {number} basePrice El precio por unidad base (ej. $ por kg, $ por litro).
 * @param {number} quantityInMinorUnit La cantidad en la unidad menor (ej. gramos, mililitros, centímetros).
 * @param {string} unitOfMeasure La unidad de medida del producto base (ej. 'kg', 'litro', 'metro').
 * @returns {number} El precio calculado para la cantidad fraccionada.
 */
export const calculateFractionalPrice = (basePrice, quantityInMinorUnit, unitOfMeasure) => {
    let price = 0;
    switch (unitOfMeasure) {
        case 'kg':
            // Si el precio base es por KG, y la cantidad es en gramos, dividimos por 1000
            price = (basePrice / 1000) * quantityInMinorUnit;
            break;
        case 'litro':
            // Si el precio base es por Litro, y la cantidad es en mililitros, dividimos por 1000
            price = (basePrice / 1000) * quantityInMinorUnit;
            break;
        case 'metro':
            // Si el precio base es por Metro, y la cantidad es en centímetros, dividimos por 100
            price = (basePrice / 100) * quantityInMinorUnit;
            break;
        default:
            // Para otras unidades, o si no aplica, devolvemos el precio base o 0.
            price = basePrice;
            break;
    }
    return price;
};