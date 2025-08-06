// C:\Proyectos\Label\frontend\src\components\Pos\ProductSelectItem.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Info, MoreHorizontal } from 'lucide-react';
import { getPriceColorClass } from '../../utils/priceColors';

const ProductSelectItem = ({ product, onClick, onAddClick, formatPrice, convertPrice, exchangeRate }) => {
    const [isFlashing, setIsFlashing] = useState(false);
    const [isButtonPressed, setIsButtonPressed] = useState(false);
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
        setIsButtonPressed(true);
        setTimeout(() => setIsButtonPressed(false), 150);
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 300);
        onAddClick();
    };

    return (
        <>
        <div
            ref={containerRef}
            className={`bg-surface p-4 rounded-lg shadow flex justify-between items-center border border-primary/20 cursor-pointer hover:bg-surface-secondary transition-all duration-200 relative group ${
                isFlashing ? 'bg-primary/20 scale-105' : ''
            }`}
            onClick={handleClick}
            onMouseEnter={() => setShowDots(true)}
            onMouseLeave={() => setShowDots(false)}
        >
            {/* Sección de Imagen */}
            <div className="w-20 h-20 flex-shrink-0 bg-surface-secondary rounded-md overflow-hidden mr-4">
                <img
                    src={product.imageUrl || (product.variants && product.variants.length > 0 && product.variants[0].imageUrl) || 'https://placehold.co/100x100/2D3748/F8F8F2?text=Sin+Img'}
                    alt={product.name}
                    className="object-cover w-full h-full"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/2D3748/F8F8F2?text=Error'; }}
                />
            </div>

            {/* Sección de Info del Producto */}
            <div className="flex-1 min-w-0">
                <p className="text-xl font-semibold text-text-base truncate">{product.name}</p>
                {product.variants && product.variants.length > 0 ? (
                    <p className="text-sm text-text-muted">
                        Producto con {product.variants.length} variantes
                        <span className="relative inline-block ml-1 group">
                            <Info size={14} className="text-primary cursor-pointer" />
                            <span className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 w-48 p-2 bg-surface-secondary text-xs text-text-base rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-normal text-center shadow-lg">
                                Haz click para seleccionar una variante específica.
                            </span>
                        </span>
                    </p>
                ) : (
                    <p className="text-sm text-text-muted">{product.category} - SKU: {product.sku}</p>
                )}
                <p className="text-sm text-text-muted">Stock: {displayStock} {product.unitOfMeasure}</p>
            </div>

            {/* Sección de Precio */}
            <div className="flex flex-col items-end ml-4 flex-shrink-0 relative">
                <p className={`text-2xl font-bold ${getPriceColorClass(priceInPrimary)}`}>{formatPrice(priceInPrimary, primaryCurrency)}</p>
                {primaryCurrency !== secondaryCurrency && exchangeRate && (
                    <p className={`text-sm ${getPriceColorClass(priceInSecondary)}`}>
                        {formatPrice(priceInSecondary, secondaryCurrency)}
                    </p>
                )}
            </div>

            {/* Botón de 3 puntos en esquina superior derecha */}
            {showDots && (
                <div 
                    className="absolute top-2 right-2 w-6 h-6 bg-gray-600/80 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-500/80 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    onClick={handleDotsClick}
                    title="Ver detalles"
                >
                    <MoreHorizontal size={12} className="text-white" />
                </div>
            )}
        </div>
            
        {/* Product Details Modal */}
        {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                <div className="bg-surface p-6 rounded-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-xl font-bold mb-4">{product.name}</h3>
                    <div className="space-y-2 text-sm">
                        <p><strong>Category:</strong> {product.category}</p>
                        <p><strong>Stock:</strong> {displayStock}</p>
                        <p><strong>Price:</strong> {formatPrice(priceInPrimary, primaryCurrency)}</p>
                        {product.description && <p><strong>Description:</strong> {product.description}</p>}
                        {product.brand && <p><strong>Brand:</strong> {product.brand}</p>}
                        {product.sku && <p><strong>SKU:</strong> {product.sku}</p>}
                    </div>
                    <button 
                        onClick={() => setShowModal(false)}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
                    >
                        Close
                    </button>
                </div>
            </div>
        )}
        </>
    );
};

export default ProductSelectItem;