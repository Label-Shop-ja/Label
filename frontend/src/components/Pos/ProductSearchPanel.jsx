// C:\Proyectos\Label\frontend\src\components\Pos\ProductSearchPanel.jsx
import React, { lazy, Suspense } from 'react';
import { FaSearch } from 'react-icons/fa';

const ProductSelectItem = lazy(() => import('./ProductSelectItem'));

const ProductSearchPanel = ({
    searchTerm, setSearchTerm, searchResults, loading,
    addProductToSale, searchInputRef, formatPrice, convertPrice, exchangeRate
}) => {
    return (
        <div className="flex-1 bg-deep-night-blue p-6 rounded-lg shadow-inner flex flex-col min-h-0">
            <h2 className="text-4xl font-extrabold text-copper-rose-accent mb-8 border-b-2 border-action-blue pb-4">Punto de Venta (POS)</h2>
            <div className="relative mb-6">
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar producto por nombre, categoría o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 px-4 pl-10 bg-dark-charcoal text-neutral-light leading-tight border border-neutral-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-action-blue text-lg placeholder-neutral-gray-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-300" size={20} />
            </div>
            {loading ? (
                <p className="text-xl text-action-blue text-center animate-pulse">Buscando productos...</p>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2">
                    {searchTerm.length < 2 ? (
                        <p className="text-neutral-gray-300 text-lg text-center mt-4">Escribe 2 o más caracteres para buscar un producto.</p>
                    ) : searchResults.length === 0 ? (
                        <p className="text-neutral-gray-300 text-lg text-center mt-4">No se encontraron productos para "{searchTerm}".</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                            {searchResults.map((product) => (
                                <Suspense key={product._id} fallback={
                                    <div className="bg-dark-charcoal p-4 rounded-lg shadow h-32 animate-pulse"></div>
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
            )}
        </div>
    );
};

export default React.memo(ProductSearchPanel);