// C:\Proyectos\Label\frontend\src\components\Currency\ExchangeRateModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, RefreshCw, Info, AlertTriangle, Save } from 'lucide-react'; // Añadimos AlertTriangle
import { useCurrency } from '../../context/CurrencyContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ExchangeRateModal = ({ isOpen, onClose }) => {
    const { 
        exchangeRate, 
        loadingCurrency, 
        currencyError, 
        fetchExchangeRate, 
        updateExchangeRate,
        formatPrice, 
        convertPrice,
    } = useCurrency();

    const [personalRateInput, setPersonalRateInput] = useState('');
    const [defaultProfitPercentageInput, setDefaultProfitPercentageInput] = useState('');
    const [personalRateThresholdPercentageInput, setPersonalRateThresholdPercentageInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [personalRateAlert, setPersonalRateAlert] = useState(null); // Estado para la alerta de tasa personal

    // Sincronizar estados locales con los valores del contexto al abrir el modal o al cambiar exchangeRate
    useEffect(() => {
        if (exchangeRate) {
            // Usa el campo personalRate (o el que hayas definido en tu modelo)
            setPersonalRateInput(exchangeRate.personalRate !== undefined && exchangeRate.personalRate !== null ? exchangeRate.personalRate.toString() : ''); 
            setDefaultProfitPercentageInput(exchangeRate.defaultProfitPercentage !== undefined && exchangeRate.defaultProfitPercentage !== null ? exchangeRate.defaultProfitPercentage.toString() : '');
            setPersonalRateThresholdPercentageInput(exchangeRate.personalRateThresholdPercentage !== undefined && exchangeRate.personalRateThresholdPercentage !== null ? exchangeRate.personalRateThresholdPercentage.toString() : '');

            // Calcular y mostrar alerta si la tasa personal se desvía mucho de la oficial
            if (exchangeRate.personalRate && exchangeRate.officialRate && exchangeRate.personalRateThresholdPercentage !== undefined && exchangeRate.personalRateThresholdPercentage !== null) {
                const diff = Math.abs(exchangeRate.personalRate - exchangeRate.officialRate);
                const thresholdValue = (exchangeRate.officialRate * exchangeRate.personalRateThresholdPercentage) / 100;
                
                if (diff > thresholdValue) {
                    setPersonalRateAlert(`Tu tasa personal (${formatPrice(exchangeRate.personalRate, 'VES')}) difiere en más del ${exchangeRate.personalRateThresholdPercentage}% de la tasa oficial (${formatPrice(exchangeRate.officialRate, 'VES')}). Considera actualizarla.`);
                } else {
                    setPersonalRateAlert(null);
                }
            } else {
                setPersonalRateAlert(null);
            }

        } else {
            // Inicializar con valores por defecto si no hay exchangeRate cargado
            setPersonalRateInput('');
            setDefaultProfitPercentageInput('20'); // Default profit si no hay configuración
            setPersonalRateThresholdPercentageInput('5'); // Default threshold
            setPersonalRateAlert(null);
        }
    }, [exchangeRate, formatPrice]);

    // Manejador para guardar la configuración del usuario
    const handleSaveConfig = useCallback(async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const numPersonalRate = parseFloat(personalRateInput);
            const numDefaultProfit = parseFloat(defaultProfitPercentageInput);
            const numThreshold = parseFloat(personalRateThresholdPercentageInput);

            // Validaciones básicas del frontend
            if (isNaN(numPersonalRate) || numPersonalRate <= 0) {
                toast.error('La tasa personalizada debe ser un número positivo.');
                setIsSaving(false); return;
            }
            if (isNaN(numDefaultProfit) || numDefaultProfit < 0 || numDefaultProfit > 500) {
                toast.error('El porcentaje de ganancia debe ser un número entre 0 y 500.');
                setIsSaving(false); return;
            }
            if (isNaN(numThreshold) || numThreshold < 0 || numThreshold > 100) {
                toast.error('El umbral de tasa personalizada debe ser un número entre 0 y 100.');
                setIsSaving(false); return;
            }

            const updatedData = {
                personalRate: numPersonalRate, 
                defaultProfitPercentage: numDefaultProfit,
                personalRateThresholdPercentage: numThreshold,
                // ¡IMPORTANTE! Enviamos las conversiones EXISTENTES que tenemos del backend.
                // Esto es para que `setExchangeRate` en el backend no las borre, ya que las espera.
                conversions: exchangeRate?.conversions || [], 
            };

            const success = await updateExchangeRate(updatedData);
            if (success) {
                toast.success('Configuración de tasas guardada exitosamente. ¡Criminal!');
                onClose(); 
            } else {
                // El error ya lo maneja updateExchangeRate y lo setea en currencyError
                toast.error(currencyError || 'Error al guardar la configuración.');
            }
        } catch (error) {
            console.error('Error al guardar config en modal:', error);
            toast.error('Error inesperado al guardar la configuración.');
        } finally {
            setIsSaving(false);
        }
    }, [personalRateInput, defaultProfitPercentageInput, personalRateThresholdPercentageInput, updateExchangeRate, onClose, currencyError, exchangeRate]);

    // No renderizar si el modal no está abierto
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-neutral-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-deep-night-blue p-8 rounded-lg shadow-xl border border-action-blue w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-light hover:text-copper-rose-accent transition-colors"
                >
                    <X size={24} />
                </button>
                <h2 className="text-3xl font-extrabold text-action-blue mb-6 border-b border-neutral-gray-600 pb-3">
                    Configuración de Tasas de Cambio
                </h2>

                {loadingCurrency && (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 size={32} className="animate-spin text-action-blue" />
                        <p className="text-neutral-light ml-3">Cargando tasas...</p>
                    </div>
                )}
                {currencyError && (
                    <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-4">
                        <strong className="font-bold">¡Error de Moneda!</strong>
                        <span className="block sm:inline ml-2">{currencyError}</span>
                    </div>
                )}
                {exchangeRate && (
                    <form onSubmit={handleSaveConfig} className="space-y-6">
                        {/* Sección de Tasas Oficiales */}
                        <div className="bg-neutral-gray-800 p-4 rounded-lg border border-neutral-gray-700">
                            <h3 className="text-xl font-semibold text-neutral-light mb-4 flex items-center">
                                <Info size={20} className="mr-2 text-action-blue" />Tasas Oficiales (Actualizadas Automáticamente)
                                <button type="button" onClick={fetchExchangeRate} className="ml-auto text-sm text-action-blue hover:text-action-blue-light flex items-center" disabled={loadingCurrency}>
                                    <RefreshCw size={16} className="mr-1" /> Forzar Actualización
                                </button>
                            </h3>
                            <p className="text-neutral-gray-300 text-sm mb-2">Estas tasas se obtienen de una fuente externa y se actualizan periódicamente en el backend de forma automática (con un cron job).</p>
                            <p className="text-neutral-gray-300 text-sm mb-4">Última actualización: {exchangeRate.lastOfficialUpdate ? new Date(exchangeRate.lastOfficialUpdate).toLocaleString() : 'N/A'}</p>
                            
                            {/* Mostrar las tasas oficiales cargadas */}
                            <div className="max-h-60 overflow-y-auto border border-neutral-gray-600 rounded-md p-3">
                                <h4 className="text-neutral-light font-semibold mb-2">Todas las Conversiones Oficiales:</h4>
                                {exchangeRate.conversions && exchangeRate.conversions.length > 0 ? (
                                    <ul className="text-neutral-gray-300 text-sm space-y-1">
                                        {exchangeRate.conversions.map((conv, idx) => (
                                            <li key={idx}>
                                                1 {conv.fromCurrency} = <span className="text-yellow-400">{formatPrice(conv.rate, conv.toCurrency)}</span> ({conv.toCurrency})
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-neutral-gray-400 text-sm">No hay conversiones oficiales disponibles.</p>
                                )}
                            </div>
                        </div>

                        {/* Sección de Configuración del Usuario */}
                        <div className="bg-neutral-gray-800 p-4 rounded-lg border border-neutral-gray-700">
                            <h3 className="text-xl font-semibold text-neutral-light mb-4 flex items-center">
                                <Info size={20} className="mr-2 text-action-blue" />Tu Configuración Personal
                            </h3>
                            <p className="text-neutral-gray-300 text-sm mb-4">Aquí puedes definir tu tasa preferida para USD a VES, el porcentaje de ganancia por defecto y el umbral de alerta.</p>

                            {/* Alerta de Tasa Personal vs. Oficial */}
                            {personalRateAlert && (
                                <div className="bg-orange-700 bg-opacity-30 border border-orange-500 text-orange-300 px-4 py-3 rounded relative mb-4 flex items-center">
                                    <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
                                    <span className="block sm:inline">{personalRateAlert}</span>
                                </div>
                            )}

                            {/* Campo de Tasa Personalizada USD a VES */}
                            <div>
                                <label htmlFor="personalRateInput" className="block text-neutral-light text-sm font-bold mb-2">
                                    Tu Tasa Personal (1 USD a VES):
                                    <span className="relative inline-block ml-2 group">
                                        <Info size={16} className="text-action-blue cursor-pointer" />
                                        <span className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 w-64 p-2 bg-neutral-gray-800 text-xs text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-normal text-center shadow-lg">
                                            Establece tu propia tasa de USD a VES. Esta se usará por defecto para cálculos si no usas la oficial.
                                            La tasa oficial actual es: {formatPrice(exchangeRate.officialRate, 'VES')}.
                                        </span>
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    id="personalRateInput"
                                    value={personalRateInput}
                                    onChange={(e) => setPersonalRateInput(e.target.value)}
                                    step="0.0001"
                                    min="0.0001"
                                    className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light"
                                    placeholder={formatPrice(exchangeRate.officialRate, 'VES')}
                                />
                            </div>

                            {/* Campo de Porcentaje de Ganancia por Defecto */}
                            <div className="mt-4">
                                <label htmlFor="defaultProfitPercentageInput" className="block text-neutral-light text-sm font-bold mb-2">
                                    % Ganancia por Defecto:
                                    <span className="relative inline-block ml-2 group">
                                        <Info size={16} className="text-action-blue cursor-pointer" />
                                        <span className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 w-64 p-2 bg-neutral-gray-800 text-xs text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-normal text-center shadow-lg">
                                            Este porcentaje se aplicará al costo de los productos para sugerir un precio de venta si no especificas uno.
                                        </span>
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    id="defaultProfitPercentageInput"
                                    value={defaultProfitPercentageInput}
                                    onChange={(e) => setDefaultProfitPercentageInput(e.target.value)}
                                    step="0.1"
                                    min="0"
                                    max="500"
                                    className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light"
                                    placeholder="Ej. 20 (para 20%)"
                                />
                            </div>

                            {/* Campo de Umbral de Tasa Personalizada */}
                            <div className="mt-4">
                                <label htmlFor="personalRateThresholdPercentageInput" className="block text-neutral-light text-sm font-bold mb-2">
                                    Umbral de Alerta de Tasa Personal (%):
                                    <span className="relative inline-block ml-2 group">
                                        <Info size={16} className="text-action-blue cursor-pointer" />
                                        <span className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 w-64 p-2 bg-neutral-gray-800 text-xs text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-normal text-center shadow-lg">
                                            Porcentaje de diferencia entre tu tasa personal y la oficial que activa una alerta (Ej. 5 para alertar si la diferencia es mayor al 5%).
                                        </span>
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    id="personalRateThresholdPercentageInput"
                                    value={personalRateThresholdPercentageInput}
                                    onChange={(e) => setPersonalRateThresholdPercentageInput(e.target.value)}
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light"
                                    placeholder="Ej. 5"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-neutral-gray-600 hover:bg-neutral-gray-700 text-neutral-light font-bold py-2 px-4 rounded-lg transition duration-200"
                                disabled={isSaving}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-action-blue hover:bg-blue-700 text-deep-night-blue font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-200"
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 size={20} className="mr-2 animate-spin" /> : <Save size={20} className="mr-2" />} Guardar Configuración
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ExchangeRateModal;