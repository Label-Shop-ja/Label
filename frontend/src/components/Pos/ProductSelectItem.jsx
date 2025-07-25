// C:\Proyectos\Label\frontend\src\components\Pos\ProductSelectItem.jsx
import React from 'react';
import { Info } from 'lucide-react'; // Para tooltips

const ProductSelectItem = ({ product, onClick, formatPrice, convertPrice, exchangeRate }) => {
    const primaryCurrency = exchangeRate?.fromCurrency || 'USD';
    const secondaryCurrency = exchangeRate?.toCurrency || 'VES';

    const displayedPrice = product.variants && product.variants.length > 0
        ? product.variants[0]?.price || product.price // Precio de la primera variante si existe, sino del padre
        : product.price; // Precio del producto principal si no tiene variantes

    const priceInPrimary = displayedPrice;
    const priceInSecondary = convertPrice(displayedPrice, primaryCurrency, secondaryCurrency);

    // Determinar stock a mostrar (totalStock si tiene variantes, stock normal si no)
    const displayStock = product.variants && product.variants.length > 0 ? product.totalStock : product.stock;

    return (
        <div
            className="bg-dark-charcoal p-4 rounded-lg shadow flex justify-between items-center border border-action-blue-light cursor-pointer hover:bg-neutral-gray-800 transition duration-200"
            onClick={onClick}
        >
            {/* Sección de Imagen */}
            <div className="w-20 h-20 flex-shrink-0 bg-neutral-gray-900 rounded-md overflow-hidden mr-4">
                <img
                    src={product.imageUrl || (product.variants && product.variants.length > 0 && product.variants[0].imageUrl) || 'https://placehold.co/100x100/2D3748/F8F8F2?text=Sin+Img'}
                    alt={product.name}
                    className="object-cover w-full h-full"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/2D3748/F8F8F2?text=Error'; }}
                />
            </div>

            {/* Sección de Info del Producto */}
            <div className="flex-1 min-w-0">
                <p className="text-xl font-semibold text-neutral-light truncate">{product.name}</p>
                {product.variants && product.variants.length > 0 ? (
                    <p className="text-sm text-neutral-gray-300">
                        Producto con {product.variants.length} variantes
                        <span className="relative inline-block ml-1 group">
                            <Info size={14} className="text-action-blue cursor-pointer" />
                            <span className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 w-48 p-2 bg-neutral-gray-800 text-xs text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-normal text-center shadow-lg">
                                Haz click para seleccionar una variante específica.
                            </span>
                        </span>
                    </p>
                ) : (
                    <p className="text-sm text-neutral-gray-300">{product.category} - SKU: {product.sku}</p>
                )}
                <p className="text-sm text-neutral-gray-300">Stock: {displayStock} {product.unitOfMeasure}</p>
            </div>

            {/* Sección de Precio */}
            <div className="flex flex-col items-end ml-4 flex-shrink-0">
                <p className="text-2xl font-bold text-copper-rose-accent">{formatPrice(priceInPrimary, primaryCurrency)}</p>
                {primaryCurrency !== secondaryCurrency && exchangeRate && (
                    <p className="text-sm text-neutral-gray-400">
                        {formatPrice(priceInSecondary, secondaryCurrency)}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProductSelectItem;