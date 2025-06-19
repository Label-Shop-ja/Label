// C:\Proyectos\Label\frontend\src\components\Currency\ExchangeRateModal.jsx
import React, { useState, useEffect } from 'react';
import ProductModal from '../Common/ProductModal'; // Reutilizamos el modal base
import { Loader2 } from 'lucide-react'; // Ícono de carga

const ExchangeRateModal = ({ isOpen, onClose, currentExchangeRate, loading, error, onSave }) => {
    // Inicializamos los estados con números o vacío para números, y con el tipo de moneda
    const [rate, setRate] = useState(''); // Se inicializa como string para el input, se convierte a Number en handleSubmit
    const [defaultProfitPercentage, setDefaultProfitPercentage] = useState(''); // Se inicializa como string para el input
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('VES');
    const [localError, setLocalError] = useState(''); // Errores internos del modal

    useEffect(() => {
        if (isOpen && currentExchangeRate) {
            // Convertimos a string para mostrar en el input type="number"
            setRate(currentExchangeRate.rate.toString());
            setDefaultProfitPercentage(currentExchangeRate.defaultProfitPercentage.toString());
            setFromCurrency(currentExchangeRate.fromCurrency);
            setToCurrency(currentExchangeRate.toCurrency);
        } else if (isOpen && !currentExchangeRate) {
            // Resetear a valores por defecto si no hay tasa configurada
            setRate(''); // Deja vacío para placeholder
            setDefaultProfitPercentage('30'); // Default profit como string para input
            setFromCurrency('USD');
            setToCurrency('VES');
        }
        setLocalError(''); // Limpiar errores al abrir/cerrar
    }, [isOpen, currentExchangeRate]);

    const handleSubmit = async () => {
        setLocalError('');
        // Validación de campos antes de enviar
        const numRate = Number(rate);
        const numProfit = Number(defaultProfitPercentage);

        if (rate.trim() === '' || isNaN(numRate) || numRate <= 0) {
            setLocalError('La tasa de cambio debe ser un número positivo.');
            return;
        }
        if (defaultProfitPercentage.trim() === '' || isNaN(numProfit) || numProfit < 0) {
            setLocalError('El porcentaje de ganancia debe ser un número no negativo.');
            return;
        }
        if (numProfit > 500) { // Validación frontend adicional para defaultProfitPercentage
            setLocalError('El porcentaje de ganancia no puede ser mayor a 500%.');
            return;
        }

        const success = await onSave({
            fromCurrency,
            toCurrency,
            rate: numRate, // <-- Convertir a número aquí al enviar
            defaultProfitPercentage: numProfit // <-- Convertir a número aquí al enviar
        });

        if (success) {
            onClose(); // Cierra el modal si la operación fue exitosa
        } else {
            // El error ya lo maneja el CurrencyContext y se propaga via 'error' prop
            setLocalError(error || 'Error al guardar la tasa. Inténtalo de nuevo.');
        }
    };

    return (
        <ProductModal isOpen={isOpen} onClose={onClose} title="Configurar Tasa de Cambio y Ganancia">
            <div className="p-4">
                {/* Mensajes de error globales o locales del modal */}
                {(localError || error) && (
                    <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">¡Error!</strong>
                        <span className="block sm:inline ml-2">{localError || error}</span>
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="fromCurrency" className="block text-neutral-light text-sm font-bold mb-2">Moneda Origen:</label>
                    <select
                        id="fromCurrency"
                        value={fromCurrency}
                        onChange={(e) => setFromCurrency(e.target.value)}
                        className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-neutral-light leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    >
                        <option value="USD">USD - Dólar</option>
                        <option value="EUR">EUR - Euro</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="toCurrency" className="block text-neutral-light text-sm font-bold mb-2">Moneda Destino:</label>
                    <select
                        id="toCurrency"
                        value={toCurrency}
                        onChange={(e) => setToCurrency(e.target.value)}
                        className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-neutral-light leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    >
                        <option value="VES">VES - Bolívar</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="rate" className="block text-neutral-light text-sm font-bold mb-2">Tasa de Cambio ({fromCurrency} a {toCurrency}):</label>
                    <input
                        type="number"
                        id="rate"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)} // Mantener como string en el estado para el input
                        step="0.01"
                        min="0.01"
                        placeholder="Ej. 102.81"
                        className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-neutral-light leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal" // <-- Asegurar text-neutral-light aquí
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="defaultProfitPercentage" className="block text-neutral-light text-sm font-bold mb-2">Porcentaje de Ganancia por Defecto (%):</label>
                    <input
                        type="number"
                        id="defaultProfitPercentage"
                        value={defaultProfitPercentage}
                        onChange={(e) => setDefaultProfitPercentage(e.target.value)} // Mantener como string en el estado para el input
                        step="1"
                        min="0"
                        max="500" // El max HTML, la validación del backend es 500
                        placeholder="Ej. 30"
                        className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-neutral-light leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal" // <-- Asegurar text-neutral-light aquí
                    />
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleSubmit}
                        className="bg-action-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center"
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={20} className="mr-2 animate-spin" /> : 'Guardar Tasa'}
                    </button>
                </div>
            </div>
        </ProductModal>
    );
};

export default ExchangeRateModal;