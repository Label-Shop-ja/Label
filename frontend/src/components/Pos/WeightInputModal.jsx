// C:\Proyectos\Label\frontend\src\components\Pos\WeightInputModal.jsx
import React, { useState, useCallback, useEffect } from 'react';
import ProductModal from '../Common/ProductModal'; // Reutilizamos el modal base
import { calculateFractionalPrice } from '../../utils/unitConversion'; // <-- ¡Importa la utilidad!

const WeightInputModal = ({ isOpen, onClose, product, onMeasureAndAdd, formatPrice, convertPrice, exchangeRate }) => {
    const [inputQuantity, setInputQuantity] = useState(''); // Cantidad ingresada por el usuario (ej. gramos)
    const [calculatedPrice, setCalculatedPrice] = useState(0); // Precio calculado en tiempo real
    const [error, setError] = useState('');

    const primaryCurrency = exchangeRate?.fromCurrency || 'USD';
    const secondaryCurrency = exchangeRate?.toCurrency || 'VES';

    // Determinar la unidad menor y mayor
    let minorUnitName = '';
    let majorUnitName = '';
    switch (product?.unitOfMeasure) {
        case 'kg': minorUnitName = 'gramos'; majorUnitName = 'kilogramos'; break;
        case 'litro': minorUnitName = 'mililitros'; majorUnitName = 'litros'; break;
        case 'metro': minorUnitName = 'centímetros'; majorUnitName = 'metros'; break;
        default: minorUnitName = 'unidades'; majorUnitName = product?.unitOfMeasure; break;
    }

    // Calcula el precio al cambiar la cantidad ingresada
    useEffect(() => {
        setError('');
        if (inputQuantity === '' || isNaN(Number(inputQuantity)) || Number(inputQuantity) <= 0) {
            setCalculatedPrice(0);
            return;
        }
        const quantity = Number(inputQuantity);
        // El stock del producto principal (o de la variante) es en la unidad mayor (kg, litro, metro)
        // Necesitamos convertir la cantidad ingresada (ej. gramos) a la unidad mayor para verificar el stock
        let quantityInMajorUnit = quantity;
        if (product.unitOfMeasure === 'kg') quantityInMajorUnit = quantity / 1000;
        else if (product.unitOfMeasure === 'litro') quantityInMajorUnit = quantity / 1000;
        else if (product.unitOfMeasure === 'metro') quantityInMajorUnit = quantity / 100;

        if (quantityInMajorUnit > product.displayStock) { // Usamos displayStock que ya viene ajustado
            setError(`Stock insuficiente. Disponible: ${product.displayStock} ${product.unitOfMeasure}`);
            setCalculatedPrice(0);
            return;
        }

        const price = calculateFractionalPrice(product.displayPrice, quantity, product.unitOfMeasure);
        setCalculatedPrice(price);
    }, [inputQuantity, product, exchangeRate]); // Dependencias de cálculo

    const handleConfirm = useCallback(() => {
        if (calculatedPrice <= 0 || inputQuantity === '' || isNaN(Number(inputQuantity)) || Number(inputQuantity) <= 0) {
            setError('Por favor, ingresa una cantidad válida y positiva.');
            return;
        }
        if (error) { // No confirmar si hay un error de stock
            return;
        }
        // Pasamos la cantidad ingresada por el usuario (en gramos, ml, cm)
        // La lógica de addProductToSale se encargará de guardarla en el carrito en la unidad principal (kg, litro, metro)
        onMeasureAndAdd(Number(inputQuantity));
        onClose();
    }, [calculatedPrice, inputQuantity, error, onMeasureAndAdd, onClose]);


    if (!product) return null;

    return (
        <ProductModal isOpen={isOpen} onClose={onClose} title={`Ingresar Cantidad por ${majorUnitName.toUpperCase()} para ${product.name}`}>
            <div className="p-4">
                {error && (
                    <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">¡Error!</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}

                <div className="mb-4">
                    <p className="text-neutral-light text-base font-semibold mb-2">{product.name}</p>
                    <p className="text-neutral-gray-300 text-sm mb-1">Precio por {majorUnitName}: {formatPrice(product.displayPrice, primaryCurrency)}
                        {primaryCurrency !== secondaryCurrency && exchangeRate && (
                            <span className="ml-1 text-xs text-neutral-gray-400">
                                ({formatPrice(convertPrice(product.displayPrice, primaryCurrency, secondaryCurrency), secondaryCurrency)})
                            </span>
                        )}
                    </p>
                    <p className="text-neutral-gray-300 text-sm mb-3">Stock Disponible: <span className={`${product.displayStock <= 5 ? 'text-red-400' : 'text-yellow-400'} font-bold`}>{product.displayStock} {majorUnitName}</span></p>

                    <label htmlFor="inputQuantity" className="block text-neutral-light text-sm font-bold mb-2">
                        Cantidad en {minorUnitName} a vender:
                    </label>
                    <input
                        type="number"
                        id="inputQuantity"
                        value={inputQuantity}
                        onChange={(e) => setInputQuantity(e.target.value)}
                        step="any"
                        min="0.01"
                        placeholder={`Ej. 155 para ${minorUnitName}`}
                        className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-neutral-light leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    />
                </div>

                <div className="flex justify-between items-center mb-4 border-t border-neutral-gray-600 pt-4">
                    <p className="text-xl font-bold text-neutral-light">Precio Calculado:</p>
                    <p className="text-3xl font-extrabold text-success-green">
                        {formatPrice(calculatedPrice, primaryCurrency)}
                        {primaryCurrency !== secondaryCurrency && exchangeRate && calculatedPrice > 0 && (
                            <span className="ml-2 text-base text-neutral-gray-400">
                                ({formatPrice(convertPrice(calculatedPrice, primaryCurrency, secondaryCurrency), secondaryCurrency)})
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleConfirm}
                        className="bg-action-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                        disabled={calculatedPrice <= 0 || loading}
                    >
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        </ProductModal>
    );
};

export default WeightInputModal;