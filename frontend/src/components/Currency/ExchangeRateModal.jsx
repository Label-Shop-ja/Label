// C:\Proyectos\Label\frontend\src\components\Currency\ExchangeRateModal.jsx
import React, { useState, useEffect } from 'react';
import ProductModal from '../Common/ProductModal'; // Reutilizamos el modal base
import { Loader2, Info } from 'lucide-react'; // Íconos de carga y de información

const ExchangeRateModal = ({ isOpen, onClose, currentExchangeRate, loading, error, onSave }) => {
    // Inicializamos los estados con números o vacío para números, y con el tipo de moneda
    const [rate, setRate] = useState(''); // Se inicializa como string para el input, se convierte a Number en handleSubmit
    const [defaultProfitPercentage, setDefaultProfitPercentage] = useState(''); // Se inicializa como string para el input
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('VES');
    // NUEVO: Estado para el umbral de actualización automática
    const [personalRateThresholdPercentage, setPersonalRateThresholdPercentage] = useState('');
    const [localError, setLocalError] = useState(''); // Errores internos del modal

    useEffect(() => {
        if (isOpen && currentExchangeRate) {
            // Si hay una tasa existente, la precargamos
            const usdVesConversion = currentExchangeRate.conversions?.find(c => c.fromCurrency === 'USD' && c.toCurrency === 'VES');
            if (usdVesConversion) {
                setRate(usdVesConversion.rate.toString());
            } else if (currentExchangeRate.officialRate) { // Fallback a officialRate si existe
                setRate(currentExchangeRate.officialRate.toString());
            } else {
                setRate('');
            }

            setDefaultProfitPercentage(currentExchangeRate.defaultProfitPercentage?.toString() || '30');
            setPersonalRateThresholdPercentage(currentExchangeRate.personalRateThresholdPercentage?.toString() || '1'); // Default a 1%
            // Los campos fromCurrency y toCurrency para la conversión principal son fijos por ahora (USD a VES)
            setFromCurrency('USD');
            setToCurrency('VES');

        } else if (isOpen && !currentExchangeRate) {
            // Resetear a valores por defecto si no hay tasa configurada
            setRate('');
            setDefaultProfitPercentage('30');
            setFromCurrency('USD');
            setToCurrency('VES');
            setPersonalRateThresholdPercentage('1');
        }
        setLocalError(''); // Limpiar errores al abrir/cerrar
    }, [isOpen, currentExchangeRate]);

    const handleSubmit = async () => {
        setLocalError('');
        // Validación de campos antes de enviar
        const numRate = Number(rate);
        const numProfit = Number(defaultProfitPercentage);
        const numThreshold = Number(personalRateThresholdPercentage);

        if (rate.trim() === '' || isNaN(numRate) || numRate <= 0) {
            setLocalError('La tasa de cambio debe ser un número positivo.');
            return;
        }
        if (defaultProfitPercentage.trim() === '' || isNaN(numProfit) || numProfit < 0) {
            setLocalError('El porcentaje de ganancia debe ser un número no negativo.');
            return;
        }
        if (numProfit > 500) {
            setLocalError('El porcentaje de ganancia no puede ser mayor a 500%.');
            return;
        }
        if (personalRateThresholdPercentage.trim() === '' || isNaN(numThreshold) || numThreshold < 0 || numThreshold > 100) {
            setLocalError('El umbral de tasa debe ser un número entre 0 y 100.');
            return;
        }

        // Construimos el array de conversiones esperado por el backend
        const conversionsToSend = [
            {
                fromCurrency: fromCurrency,
                toCurrency: toCurrency,
                rate: numRate,
            }
        ];
        // En este punto, solo estamos enviando la conversión principal (USD-VES o EUR-VES)
        // La lógica para añadir múltiples conversiones (Euro a Dólar, etc.) será una mejora futura del modal.

        const success = await onSave({
            conversions: conversionsToSend, // <-- ¡AHORA SÍ ENVIAMOS EL ARRAY DE CONVERSIONES!
            defaultProfitPercentage: numProfit,
            personalRateThresholdPercentage: numThreshold,
        });

        if (success) {
            onClose(); // Cierra el modal si la operación fue exitosa
        } else {
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
                        className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    >
                        <option value="VES">VES - Bolívar</option>
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
                        className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    >
                        <option value="VES">VES - Bolívar</option>
                        <option value="USD">USD - Dólar</option>
                        <option value="EUR">EUR - Euro</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="rate" className="block text-neutral-light text-sm font-bold mb-2">Tasa de Cambio ({fromCurrency} a {toCurrency}):</label>
                    <input
                        type="number"
                        id="rate"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        step="0.01"
                        min="0.01"
                        placeholder="Ej. 102.81"
                        className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="defaultProfitPercentage" className="block text-neutral-light text-sm font-bold mb-2">Porcentaje de Ganancia por Defecto (%):</label>
                    <input
                        type="number"
                        id="defaultProfitPercentage"
                        value={defaultProfitPercentage}
                        onChange={(e) => setDefaultProfitPercentage(e.target.value)}
                        step="1"
                        min="0"
                        max="500"
                        placeholder="Ej. 30"
                        className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    />
                </div>

                {/* NUEVO CAMPO: Umbral de Tasa Personalizada */}
                <div className="mb-6">
                    <label htmlFor="personalRateThresholdPercentage" className="block text-neutral-light text-sm font-bold mb-2">
                        Umbral de Actualización de Tasa Personalizada (%):
                        <span className="relative inline-block ml-2 group">
                            <Info size={16} className="text-action-blue cursor-pointer" />
                            <span className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 w-64 p-2 bg-neutral-gray-800 text-xs text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-normal text-center shadow-lg">
                                Si tu tasa personalizada difiere de la tasa oficial en más de este porcentaje, la aplicación sugerirá una actualización. Ej: 1 para 1%.
                            </span>
                        </span>
                    </label>
                    <input
                        type="number"
                        id="personalRateThresholdPercentage"
                        value={personalRateThresholdPercentage}
                        onChange={(e) => setPersonalRateThresholdPercentage(e.target.value)}
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="Ej. 1 (para 1%)"
                        className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
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