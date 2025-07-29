// C:\Proyectos\Label\frontend\src\components\Pos\ProductSearchPanel.jsx
import React, { lazy, Suspense } from 'react';
import { FaSearch } from 'react-icons/fa';

const ProductSelectItem = lazy(() => import('./ProductSelectItem'));

const ProductSearchPanel = ({
    searchTerm, setSearchTerm, searchResults, loading,
    addProductToSale, searchInputRef, formatPrice, convertPrice, exchangeRate
}) => {
    return (
        <>
            <h2 className="text-2xl font-bold text-copper-rose-accent mb-4 border-b border-neutral-gray-600 pb-2">Punto de Venta (POS)</h2>
            <div className="relative mb-4">
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar producto por nombre, categoría o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-lg py-2 px-3 pl-9 bg-dark-charcoal text-neutral-light leading-tight border border-neutral-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-action-blue placeholder-neutral-gray-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-400" size={16} />
            </div>
            <div className="flex-1 bg-neutral-gray-800 rounded-lg p-4 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <p className="text-action-blue animate-pulse">Buscando productos...</p>
                    </div>
                ) : searchTerm.length < 2 ? (
                    <div className="flex items-center justify-center h-40">
                        <p className="text-neutral-gray-300">Escribe 2 o más caracteres para buscar un producto.</p>
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="flex items-center justify-center h-40">
                        <p className="text-neutral-gray-300">No se encontraron productos para "{searchTerm}".</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        {searchResults.map((product) => (
                            <Suspense key={product._id} fallback={
                                <div className="bg-dark-charcoal p-3 rounded-lg shadow h-28 animate-pulse"></div>
                            }>
                                <ProductSelectItem
                                    product={product}
                                    onClick={() => addProductToSale(product)}
                                    formatPrice={formatPrice}
                                    convertPrice={convertPrice}
                                    exchangeRate={exchangeRate}
                                />
                            </Suspense>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default React.memo(ProductSearchPanel);