// C:\Proyectos\Label\frontend\src\components\Currency\ExchangeRateModal.jsx
import React, { useState, useCallback } from 'react';
import { X, Loader2, RefreshCw, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Estilos para scrollbar personalizada
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.5);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.7);
  }
  .custom-scrollbar-light::-webkit-scrollbar-thumb {
    background: rgba(107, 114, 128, 0.4);
  }
  .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
    background: rgba(107, 114, 128, 0.6);
  }
`;

const ExchangeRateModal = ({ isOpen, onClose }) => {
    const { theme } = useTheme();
    const { 
        exchangeRate, 
        loadingCurrency, 
        currencyError, 
        updateExchangeRatesManually,
        formatPrice, 
    } = useCurrency();

    const [isUpdatingRates, setIsUpdatingRates] = useState(false);

    const handleUpdateRates = useCallback(async () => {
        setIsUpdatingRates(true);
        try {
            const result = await updateExchangeRatesManually();
            if (result.success) {
                if (result.updated) {
                    toast.success('Tasas actualizadas desde la API externa');
                } else {
                    toast.info('Las tasas ya están actualizadas (menos de 30 minutos)');
                }
            } else {
                toast.error(result.message || 'Error al actualizar tasas');
            }
        } catch (error) {
            console.error('Error al actualizar tasas:', error);
            toast.error('Error inesperado al actualizar tasas');
        } finally {
            setIsUpdatingRates(false);
        }
    }, [updateExchangeRatesManually]);

    if (!isOpen) return null;

    return (
        <>
            <style>{scrollbarStyles}</style>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${
                theme === 'light' 
                    ? 'bg-white border-gray-200 text-gray-900' 
                    : 'bg-gray-900 border-gray-700 text-white'
            } p-6 rounded-2xl shadow-2xl border w-full max-w-2xl max-h-[85vh] overflow-hidden relative transform transition-all duration-300`}>
                <button
                    onClick={onClose}
                    className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
                        theme === 'light'
                            ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                >
                    <X size={20} />
                </button>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-xl ${
                        theme === 'light' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-blue-900/50 text-blue-400'
                    }`}>
                        <TrendingUp size={28} />
                    </div>
                    <h2 className={`text-3xl font-bold ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                        Tasas de Cambio Oficiales
                    </h2>
                </div>

                {loadingCurrency && (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 size={32} className="animate-spin text-blue-500 mr-3" />
                        <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'}>Cargando tasas...</p>
                    </div>
                )}
                
                {currencyError && (
                    <div className={`px-4 py-3 rounded-lg mb-6 border ${
                        theme === 'light'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-red-900/20 border-red-500/50 text-red-300'
                    }`}>
                        <strong className="font-semibold">¡Error de Moneda!</strong>
                        <span className="block sm:inline ml-2">{currencyError}</span>
                    </div>
                )}
                
                {exchangeRate && (
                    <div className="space-y-6">
                        {/* Tasa Principal USD-VES */}
                        <div className={`relative overflow-hidden rounded-xl p-6 ${
                            theme === 'light'
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                        }`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <DollarSign size={28} className="text-white/90" />
                                        <h3 className="text-2xl font-bold">USD - VES</h3>
                                    </div>
                                    <button 
                                        onClick={handleUpdateRates} 
                                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105" 
                                        disabled={isUpdatingRates || loadingCurrency}
                                    >
                                        {isUpdatingRates ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />} 
                                        Actualizar
                                    </button>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold mb-2">
                                        {formatPrice(exchangeRate.officialRate, 'VES')}
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                                        <Clock size={14} />
                                        <span>{exchangeRate.lastOfficialUpdate ? new Date(exchangeRate.lastOfficialUpdate).toLocaleString() : 'Nunca'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Todas las Conversiones */}
                        <div className={`rounded-xl p-4 border ${
                            theme === 'light'
                                ? 'bg-gray-50 border-gray-200'
                                : 'bg-gray-800/50 border-gray-700'
                        }`}>
                            <h3 className={`text-lg font-semibold mb-3 ${
                                theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>Todas las Conversiones</h3>
                            <div className={`max-h-48 overflow-y-auto rounded-lg p-3 custom-scrollbar ${
                                theme === 'light' ? 'custom-scrollbar-light' : ''
                            } ${
                                theme === 'light'
                                    ? 'bg-white border border-gray-200'
                                    : 'bg-gray-900/50 border border-gray-600'
                            }`}>
                                {exchangeRate.conversions && exchangeRate.conversions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {exchangeRate.conversions.map((conv, idx) => (
                                            <div key={idx} className={`p-3 rounded-lg border ${
                                                theme === 'light'
                                                    ? 'bg-gray-50 border-gray-200 text-gray-700'
                                                    : 'bg-gray-800 border-gray-600 text-gray-300'
                                            }`}>
                                                <span className="text-sm font-medium">
                                                    1 {conv.fromCurrency} = 
                                                </span>
                                                <span className={`font-bold ml-1 ${
                                                    theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                                                }`}>
                                                    {formatPrice(conv.rate, conv.toCurrency)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={`text-center py-8 ${
                                        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                    }`}>No hay conversiones disponibles</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={onClose}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
                                    theme === 'light'
                                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                                }`}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default ExchangeRateModal;