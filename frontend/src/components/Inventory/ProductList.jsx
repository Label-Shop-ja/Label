// src/components/Inventory/ProductList.jsx
import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react'; // Ícono de carga
import { useCurrency } from '../../context/CurrencyContext'; // <-- ¡NUEVA LÍNEA!
import ErrorBoundary from '../ErrorBoundary'; // <-- ¡NUEVA LÍNEA!

// Importación perezosa del componente ProductCard
const ProductCard = lazy(() => import('./ProductCard'));

const ProductList = ({ products, handleEditClick, confirmDeleteProduct, expandedProducts, toggleProductExpansion, loading, error, onEdit, onDelete }) => {
    const { exchangeRate, convertPrice, formatPrice } = useCurrency(); // <-- ¡NUEVA LÍNEA!
    return (
        <ErrorBoundary>
            <div className="w-full">
                {/* Loader global */}
                {loading && (
                    <div className="flex justify-center items-center h-32">
                        <span className="animate-spin text-action-blue text-2xl">Cargando productos...</span>
                    </div>
                )}

                {/* Mensaje de error destacado */}
                {error && (
                    <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Lista de productos */}
                {!loading && !error && (
                    products.length === 0 ? (
                        <p className="text-neutral-gray-300 text-lg text-center mt-10">No hay productos para mostrar.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <Suspense key={product._id} fallback={
                                    <div className="bg-deep-night-blue p-6 rounded-lg shadow-lg border border-action-blue-light flex flex-col justify-between transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl animate-pulse">
                                        <div className="w-full h-48 mb-4 bg-neutral-gray-800 rounded-md"></div>
                                        <div className="h-6 bg-neutral-gray-700 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-neutral-gray-700 rounded w-1/2 mb-1"></div>
                                        <div className="h-4 bg-neutral-gray-700 rounded w-2/3 mb-4"></div>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <div className="h-10 w-24 bg-neutral-gray-600 rounded-lg"></div>
                                            <div className="h-10 w-24 bg-red-600 rounded-lg"></div>
                                        </div>
                                    </div>
                                }>
                                    <ProductCard
                                        product={product}
                                        handleEditClick={handleEditClick}
                                        confirmDeleteProduct={confirmDeleteProduct}
                                        isExpanded={expandedProducts.has(product._id)}
                                        toggleProductExpansion={toggleProductExpansion}
                                        // <-- ¡NUEVAS PROPS!
                                        formatPrice={formatPrice}
                                        convertPrice={convertPrice}
                                        exchangeRate={exchangeRate}
                                    />
                                </Suspense>
                            ))}
                        </div>
                    )
                )}
            </div>
        </ErrorBoundary>
    );
};

export default ProductList;