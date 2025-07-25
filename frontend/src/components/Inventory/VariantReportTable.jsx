// src/components/Inventory/VariantReportTable.jsx
import React from 'react';
import { Loader2 } from 'lucide-react'; // Ícono de carga

const VariantReportTable = ({ variantReport, loading, exportVariantReportToCSV }) => {
    if (loading) {
        return (
            <div className="mt-12 bg-deep-night-blue p-8 rounded-lg shadow-2xl border border-action-blue-light h-64 flex items-center justify-center text-neutral-light">
                <Loader2 size={48} className="animate-spin text-action-blue" />
                <span className="ml-4 text-xl">Cargando reporte de variantes...</span>
            </div>
        );
    }

    if (!variantReport || variantReport.length === 0) {
        return (
            <p className="text-neutral-gray-300 text-lg text-center mt-10">No hay datos de variantes para generar el reporte.</p>
        );
    }

    return (
        <div className="mt-12 bg-deep-night-blue p-8 rounded-lg shadow-2xl border border-action-blue-light overflow-x-auto">
            <h3 className="text-3xl font-semibold text-copper-rose-accent mb-6 border-b border-neutral-gray-700 pb-3">
                Reporte de Inventario por Variantes
            </h3>
            <p className="text-neutral-gray-300 mb-6">Este reporte muestra el detalle de cada variante de producto, incluyendo su valorización de stock.</p>

            <div className="overflow-x-auto rounded-lg shadow-md border border-neutral-gray-700">
                <table className="min-w-full divide-y divide-neutral-gray-700">
                    <thead className="bg-neutral-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-gray-300 uppercase tracking-wider">
                                Producto Principal
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-gray-300 uppercase tracking-wider">
                                Variante
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-gray-300 uppercase tracking-wider">
                                SKU Variante
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-gray-300 uppercase tracking-wider">
                                Stock
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-gray-300 uppercase tracking-wider">
                                Precio Venta Unitario
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-gray-300 uppercase tracking-wider">
                                Valor Total (Stock * Precio)
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-gray-300 uppercase tracking-wider">
                                Costo Unitario
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-gray-300 uppercase tracking-wider">
                                Costo Total (Stock * Costo)
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-gray-300 uppercase tracking-wider">
                                Perecedero
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-gray-300 uppercase tracking-wider">
                                Umbral Reapro.
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-gray-300 uppercase tracking-wider">
                                Vida Útil (Días)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-dark-charcoal divide-y divide-neutral-gray-800 text-neutral-light">
                        {variantReport.map((item, index) => (
                            <tr key={item.variantId || index} className={`${index % 2 === 0 ? 'bg-deep-night-blue' : 'bg-dark-charcoal'} hover:bg-neutral-gray-700 transition duration-150`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-copper-rose-accent">
                                    {item.productName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-light">
                                    {item.variantName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-gray-300">
                                    {item.variantSku}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`${item.variantStock <= item.variantReorderThreshold ? 'text-red-400' : 'text-yellow-400'} font-semibold`}>
                                        {item.variantStock}
                                    </span> {item.unitOfMeasure}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-success-green font-semibold">
                                    ${parseFloat(item.variantPrice).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400 font-semibold">
                                    ${parseFloat(item.variantTotalValue).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-400">
                                    ${parseFloat(item.variantCostPrice).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">
                                    ${parseFloat(item.variantTotalCostValue).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-light">
                                    {item.variantIsPerishable ? <span className="text-orange-300 font-medium">Sí</span> : 'No'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-light">
                                    {item.variantReorderThreshold}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-light">
                                    {item.variantIsPerishable ? (item.variantShelfLifeDays > 0 ? `${item.variantShelfLifeDays} días` : 'N/A') : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-neutral-gray-800">
                            <td colSpan="3" className="px-6 py-4 text-left text-base font-bold text-neutral-light">
                                Totales
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-yellow-400">
                                {variantReport.reduce((acc, item) => acc + item.variantStock, 0)} uds.
                            </td>
                            <td></td> {/* Columna para Precio Venta Unitario, no hay total significativo */}
                            <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-purple-400">
                                ${variantReport.reduce((acc, item) => acc + item.variantTotalValue, 0).toFixed(2)}
                            </td>
                            <td></td> {/* Columna para Costo Unitario, no hay total significativo */}
                            <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-blue-400">
                                ${variantReport.reduce((acc, item) => acc + item.variantTotalCostValue, 0).toFixed(2)}
                            </td>
                            <td colSpan="3"></td> {/* Columnas restantes sin totales */}
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* El botón de exportar a CSV se muestra en InventoryPage.jsx */}
        </div>
    );
};

export default VariantReportTable;
