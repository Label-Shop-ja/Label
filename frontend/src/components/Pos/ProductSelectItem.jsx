// C:\Proyectos\Label\frontend\src\components\Pos\ProductSelectItem.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Info, MoreHorizontal } from 'lucide-react';

const ProductSelectItem = ({ product, onClick, onAddClick, formatPrice, convertPrice, exchangeRate }) => {
    const [isFlashing, setIsFlashing] = useState(false);
    const [showDots, setShowDots] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowDots(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const primaryCurrency = exchangeRate?.fromCurrency || 'USD';
    const secondaryCurrency = exchangeRate?.toCurrency || 'VES';

    const displayedPrice = product.variants && product.variants.length > 0
        ? product.variants[0]?.price || product.price
        : product.price;

    const priceInPrimary = displayedPrice;
    const priceInSecondary = convertPrice(displayedPrice, primaryCurrency, secondaryCurrency);
    const displayStock = product.variants && product.variants.length > 0 ? product.totalStock : product.stock;

    const handleClick = () => {
        onAddClick();
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 300);
    };

    const handleDotsClick = (e) => {
        e.stopPropagation();
        setShowModal(true);
    };

    const handleButtonClick = (e) => {
        e.stopPropagation();
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 300);
        onAddClick();
    };

    return (
        <>
        <div
            ref={containerRef}
            className={`group relative bg-gradient-to-br from-dark-charcoal to-neutral-gray-900 border border-neutral-gray-700/50 rounded-2xl shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] hover:border-primary/40 hover:from-dark-charcoal hover:to-neutral-gray-800 overflow-hidden ${
                isFlashing ? 'bg-primary/20 scale-105 shadow-2xl border-primary' : ''
            }`}
            onClick={handleClick}
            onMouseEnter={() => setShowDots(true)}
            onMouseLeave={() => setShowDots(false)}
        >
            {/* Overlay de hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-secondary/8 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative p-5 flex items-center gap-4">
                {/* Imagen moderna */}
                <div className="w-20 h-20 bg-gradient-to-br from-neutral-gray-800 to-neutral-gray-900 rounded-xl overflow-hidden shadow-lg ring-2 ring-neutral-gray-700/50 flex-shrink-0">
                    <img
                        src={product.imageUrl || (product.variants && product.variants.length > 0 && product.variants[0].imageUrl) || 'https://placehold.co/120x120/374151/9CA3AF?text=📦'}
                        alt={product.name}
                        className="object-cover w-full h-full transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/120x120/374151/9CA3AF?text=❌'; }}
                    />
                </div>

                {/* Info del producto mejorada */}
                <div className="flex-1 min-w-0 space-y-2">
                    <div>
                        <h3 className="text-xl font-semibold text-neutral-light leading-tight group-hover:text-primary transition-colors duration-200">
                            {product.name}
                        </h3>
                        <p className="text-sm text-neutral-gray-400 mt-0.5 font-mono">
                            SKU: {product.sku}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                        {product.variants && product.variants.length > 0 ? (
                            <span className="bg-gradient-to-r from-secondary to-secondary/80 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                                {product.variants.length} variantes
                            </span>
                        ) : (
                            <span className="bg-neutral-gray-800 text-neutral-gray-300 text-xs font-medium px-3 py-1 rounded-lg border border-neutral-gray-700">
                                {product.category}
                            </span>
                        )}
                        
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${
                            displayStock > 10 
                                ? 'bg-success/10 text-success border-success/30' 
                                : displayStock > 0 
                                    ? 'bg-warning/10 text-warning border-warning/30'
                                    : 'bg-error/10 text-error border-error/30'
                        }`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${
                                displayStock > 10 ? 'bg-success' 
                                : displayStock > 0 ? 'bg-warning' : 'bg-error'
                            }`}></div>
                            <span>Stock: {displayStock}</span>
                        </div>
                    </div>
                </div>

                {/* Sección de precio y acción */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="text-right bg-gradient-to-br from-primary/10 to-secondary/10 px-4 py-2 rounded-xl border border-primary/20">
                        <p className="text-xl font-bold text-primary leading-none">
                            {formatPrice(priceInPrimary, primaryCurrency)}
                        </p>
                        {primaryCurrency !== secondaryCurrency && exchangeRate && (
                            <p className="text-sm text-secondary font-medium mt-0.5">
                                {formatPrice(priceInSecondary, secondaryCurrency)}
                            </p>
                        )}
                    </div>
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleButtonClick(e);
                        }}
                        className="px-4 py-2.5 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 min-w-[100px] justify-center"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Agregar
                    </button>
                </div>

                {/* Botón de detalles */}
                {showDots && (
                    <div 
                        className="absolute top-2 right-2 w-6 h-6 bg-neutral-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-gray-700 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        onClick={handleDotsClick}
                        title="Ver detalles"
                    >
                        <MoreHorizontal size={12} className="text-neutral-light" />
                    </div>
                )}
            </div>
        </div>
            
        {/* Product Details Modal */}
        {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                <div className="bg-dark-charcoal backdrop-blur-xl p-8 rounded-3xl max-w-lg w-full shadow-2xl border border-neutral-gray-700 transform transition-all duration-300 scale-100" onClick={(e) => e.stopPropagation()}>
                    {/* Header del modal */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-20 h-20 bg-neutral-gray-800 rounded-2xl overflow-hidden shadow-lg ring-2 ring-neutral-gray-600">
                            <img
                                src={product.imageUrl || 'https://placehold.co/100x100/2D3748/F8F8F2?text=📦'}
                                alt={product.name}
                                className="object-cover w-full h-full"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/2D3748/F8F8F2?text=❌'; }}
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-neutral-light mb-2">{product.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">
                                    {product.category}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowModal(false)}
                            className="w-8 h-8 bg-neutral-gray-800 hover:bg-neutral-gray-700 rounded-full flex items-center justify-center transition-colors"
                        >
                            <svg className="w-4 h-4 text-neutral-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Contenido del modal */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-neutral-gray-800 p-4 rounded-xl">
                                <p className="text-sm text-neutral-gray-400 mb-1">Stock Disponible</p>
                                <p className="text-xl font-bold text-neutral-light">{displayStock} {product.unitOfMeasure}</p>
                            </div>
                            <div className="bg-primary/10 p-4 rounded-xl">
                                <p className="text-sm text-neutral-gray-400 mb-1">Precio</p>
                                <p className="text-xl font-bold text-primary">{formatPrice(priceInPrimary, primaryCurrency)}</p>
                            </div>
                        </div>
                        
                        {product.description && (
                            <div className="bg-neutral-gray-800 p-4 rounded-xl">
                                <p className="text-sm text-neutral-gray-400 mb-2">Descripción</p>
                                <p className="text-neutral-light">{product.description}</p>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {product.brand && (
                                <div>
                                    <p className="text-neutral-gray-400 mb-1">Marca</p>
                                    <p className="font-medium text-neutral-light">{product.brand}</p>
                                </div>
                            )}
                            {product.sku && (
                                <div>
                                    <p className="text-neutral-gray-400 mb-1">SKU</p>
                                    <p className="font-mono text-neutral-light">{product.sku}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Footer del modal */}
                    <div className="flex gap-3 mt-8">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-6 py-3 bg-neutral-gray-800 text-neutral-light rounded-xl font-medium hover:bg-neutral-gray-700 transition-colors"
                        >
                            Cerrar
                        </button>
                        <button 
                            onClick={() => {
                                setShowModal(false);
                                onAddClick();
                            }}
                            className="flex-1 px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default ProductSelectItem;