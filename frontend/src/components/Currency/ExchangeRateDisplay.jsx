// C:\Proyectos\Label\frontend\src\components\Currency\ExchangeRateDisplay.jsx
import React from 'react';
import { Loader2, Info } from 'lucide-react';

const ExchangeRateDisplay = ({ exchangeRate, loading, error, formatPrice }) => {
    // Determinar la tasa principal a mostrar (siempre de USD a VES para este display)
    // Daremos prioridad a la tasa personal del usuario si está definida y es positiva,
    // de lo contrario, usaremos la tasa oficial del sistema.
    const rateToDisplay = exchangeRate?.personalRate > 0 && exchangeRate.personalRate !== null
        ? exchangeRate.personalRate
        : exchangeRate?.officialRate > 0 && exchangeRate.officialRate !== null
            ? exchangeRate.officialRate
            : null; // Si ninguna está disponible o es positiva

    // Determinar la fecha de actualización más relevante
    // Si hay una actualización oficial, la mostramos. De lo contrario, la fecha de la última actualización general del documento.
    const lastUpdate = exchangeRate?.lastOfficialUpdate || exchangeRate?.updatedAt;
    const formattedLastUpdate = lastUpdate ? new Date(lastUpdate).toLocaleString() : 'N/A';

    return (
        <div className="flex items-center space-x-3 text-neutral-light">
            {loading ? (
                <Loader2 size={20} className="animate-spin text-action-blue" />
            ) : error ? (
                <span className="text-red-400 flex items-center">
                    <Info size={16} className="mr-1" /> {error}
                </span>
            ) : rateToDisplay ? ( // Solo si tenemos una tasa válida para mostrar
                <>
                    <p className="text-lg font-bold">
                        1 USD = <span className="text-success-green">{formatPrice(rateToDisplay, 'VES')}</span>
                    </p>
                    {/* Mostrar un indicador si la tasa mostrada es la personal del usuario o la oficial */}
                    {exchangeRate?.personalRate > 0 && exchangeRate.personalRate === rateToDisplay &&
                        <span className="text-sm text-neutral-gray-400">(Tu Tasa Personal)</span>
                    }
                    {exchangeRate?.officialRate > 0 && exchangeRate.officialRate === rateToDisplay && exchangeRate.personalRate !== rateToDisplay &&
                        // Solo muestra "Tasa Oficial" si se está usando la oficial y NO es la misma que la personal
                        <span className="text-sm text-neutral-gray-400">(Tasa Oficial)</span>
                    }
                    
                    <span className="text-sm text-neutral-gray-400">
                        (Última Act: {formattedLastUpdate})
                    </span>
                </>
            ) : (
                // Mensaje si no hay ninguna tasa USD-VES válida disponible
                <span className="text-yellow-400 flex items-center">
                    <Info size={16} className="mr-1" /> Tasa USD-VES no disponible o configurada.
                </span>
            )}
        </div>
    );
};

export default ExchangeRateDisplay;