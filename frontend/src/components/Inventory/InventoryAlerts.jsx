// src/components/Inventory/InventoryAlerts.jsx
import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Info } from 'lucide-react'; // Íconos

const InventoryAlerts = ({ lowStockAlerts, highStockAlerts }) => {
    const hasLowStockAlerts = lowStockAlerts && lowStockAlerts.length > 0;
    const hasHighStockAlerts = highStockAlerts && highStockAlerts.length > 0;

    // Estado para mostrar la notificación temporal
    const [showHealthyAlert, setShowHealthyAlert] = useState(false);

    useEffect(() => {
        if (!hasLowStockAlerts && !hasHighStockAlerts) {
            setShowHealthyAlert(true);
            const timeout = setTimeout(() => setShowHealthyAlert(false), 3000);
            return () => clearTimeout(timeout);
        }
    }, [hasLowStockAlerts, hasHighStockAlerts]);

    // Notificación superpuesta
    {showHealthyAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-900 bg-opacity-90 text-green-100 border border-green-500 rounded-lg px-6 py-3 shadow-xl flex items-center gap-3 animate-fade-in-down">
            <Info size={24} className="flex-shrink-0" />
            <span className="text-base font-semibold">¡Todos tus productos están en niveles de stock saludables! Buen trabajo.</span>
        </div>
    )}

    // Si hay alertas, muestra el panel normal
    if (hasLowStockAlerts || hasHighStockAlerts) {
        return (
            <div className="mb-6 p-6 rounded-lg shadow-xl border border-neutral-gray-700 bg-deep-night-blue animate-fade-in-down">
                <h3 className="text-2xl font-bold text-orange-400 mb-4 flex items-center border-b border-neutral-gray-600 pb-3">
                    <AlertTriangle size={28} className="mr-3" /> Alertas de Inventario
                </h3>

                {hasLowStockAlerts && (
                    <div className="mb-6 p-4 rounded-lg bg-red-900 bg-opacity-20 text-red-300 border border-red-500">
                        <h4 className="text-xl font-semibold mb-3 flex items-center">
                            <TrendingDown size={24} className="mr-2" /> Stock Bajo: ¡Necesita Reaprovisionamiento!
                        </h4>
                        <p className="text-sm mb-3">Estos productos/variantes tienen un stock igual o inferior a su umbral de reaprovisionamiento:</p>
                        <ul className="list-disc list-inside text-neutral-light text-sm pl-4">
                            {lowStockAlerts.map(alert => (
                                <li key={alert._id || alert.variantId} className="mb-1">
                                    <span className="font-semibold text-action-blue">{alert.productName}</span>
                                    {alert.variantName && <span className="ml-2 italic text-neutral-gray-300">({alert.variantName})</span>}
                                    <span className="ml-2">- Stock Actual: <span className="font-bold text-red-400">{alert.stock}</span> {alert.unitOfMeasure}</span>
                                    <span className="ml-2">- Umbral: {alert.reorderThreshold} {alert.unitOfMeasure}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {hasHighStockAlerts && (
                    <div className="p-4 rounded-lg bg-yellow-900 bg-opacity-20 text-yellow-300 border border-yellow-500">
                        <h4 className="text-xl font-semibold mb-3 flex items-center">
                            <TrendingUp size={24} className="mr-2" /> Stock Alto (Perecederos): ¡Considera Ventas!
                        </h4>
                        <p className="text-sm mb-3">Estos productos/variantes perecederos tienen un stock igual o superior a su stock óptimo máximo:</p>
                        <ul className="list-disc list-inside text-neutral-light text-sm pl-4">
                            {highStockAlerts.map(alert => (
                                <li key={alert._id || alert.variantId} className="mb-1">
                                    <span className="font-semibold text-action-blue">{alert.productName}</span>
                                    {alert.variantName && <span className="ml-2 italic text-neutral-gray-300">({alert.variantName})</span>}
                                    <span className="ml-2">- Stock Actual: <span className="font-bold text-yellow-400">{alert.stock}</span> {alert.unitOfMeasure}</span>
                                    <span className="ml-2">- Stock Óptimo Máx: {alert.optimalMaxStock} {alert.unitOfMeasure}</span>
                                    {alert.shelfLifeDays > 0 && <span className="ml-2">- Vida Útil: {alert.shelfLifeDays} días restantes</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    // Si no hay alertas, no muestra nada en el flujo normal (solo la notificación temporal)
    return showHealthyAlert ? null : <></>;
};

export default InventoryAlerts;
