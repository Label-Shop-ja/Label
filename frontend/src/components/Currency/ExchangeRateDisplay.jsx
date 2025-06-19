// C:\Proyectos\Label\frontend\src\components\Currency\ExchangeRateDisplay.jsx
import React from 'react';
import { Loader2, Info } from 'lucide-react';

const ExchangeRateDisplay = ({ exchangeRate, loading, error, formatPrice, primaryCurrency, secondaryCurrency }) => {
    return (
        <div className="flex items-center space-x-3 text-neutral-light">
            {loading ? (
                <Loader2 size={20} className="animate-spin text-action-blue" />
            ) : error ? (
                <span className="text-red-400 flex items-center">
                    <Info size={16} className="mr-1" /> {error}
                </span>
            ) : exchangeRate ? (
                <>
                    <p className="text-lg font-bold">{formatPrice(1, primaryCurrency)} = {formatPrice(exchangeRate.rate, secondaryCurrency)}</p>
                    <span className="text-sm text-neutral-gray-400">(Ganancia por Defecto: {exchangeRate.defaultProfitPercentage}%)</span>
                </>
            ) : (
                <span className="text-yellow-400 flex items-center">
                    <Info size={16} className="mr-1" /> Tasa no configurada.
                </span>
            )}
        </div>
    );
};

export default ExchangeRateDisplay;