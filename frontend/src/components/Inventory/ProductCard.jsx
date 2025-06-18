// src/components/Inventory/ProductCard.jsx
import React from 'react';
import { Edit, Trash2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext'; // <-- ¡NUEVA LÍNEA!

const ProductCard = ({ product, handleEditClick, confirmDeleteProduct, isExpanded, toggleProductExpansion }) => {
    const { exchangeRate, convertPrice, formatPrice } = useCurrency(); // <-- ¡NUEVA LÍNEA!

    const primaryCurrency = exchangeRate?.fromCurrency || 'USD';
    const secondaryCurrency = exchangeRate?.toCurrency || 'VES';

    return (
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-lg border border-action-blue-light flex flex-col justify-between transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div>
                {/* Imagen del Producto (primero la imagen principal del producto, luego la primera variante, luego el fallback) */}
                <div className="w-full h-48 mb-4 bg-neutral-gray-800 rounded-md overflow-hidden flex items-center justify-center">
                    <img
                        src={product.imageUrl || ((product.variants && product.variants.length > 0 && product.variants[0].imageUrl) ? product.variants[0].imageUrl : 'https://placehold.co/600x400/2D3748/F8F8F2?text=Sin+Imagen')}
                        alt={product.name || 'Product'}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/600x400/2D3748/F8F8F2?text=Error+Cargando+Imagen';
                            e.target.classList.add('border-red-500', 'border-2');
                        }}
                    />
                </div>
                <h4 className="text-xl font-bold text-copper-rose-accent mb-2 truncate">{product.name}</h4>
                <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold text-action-blue">SKU:</span> {product.sku || 'N/A'}</p>
                {product.category && <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold text-action-blue">Categoría:</span> <span className="bg-neutral-gray-700 text-neutral-light px-2 py-0.5 rounded-full text-xs font-medium">{product.category}</span></p>}
                {product.brand && <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold text-action-blue">Marca:</span> {product.brand}</p>}
                {product.supplier && <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold text-action-blue">Proveedor:</span> {product.supplier}</p>}
                {product.description && <p className="text-neutral-gray-300 mb-2 text-sm line-clamp-2">{product.description}</p>}

                {/* Mostrar información del producto principal si NO tiene variantes */}
                {!product.variants || product.variants.length === 0 ? (
                    <>
                        <p className="text-neutral-light mb-1"><span className="font-semibold">Unidad:</span> {product.unitOfMeasure}</p>
                        <p className="text-neutral-light mb-1">
                            <span className="font-semibold">Precio de Venta:</span>
                            <span className="text-success-green font-bold text-lg ml-2">{formatPrice(product.price, primaryCurrency)}</span>
                            {primaryCurrency !== secondaryCurrency && exchangeRate && (
                                <span className="ml-2 text-xs text-neutral-gray-400">
                                    ({formatPrice(convertPrice(product.price, primaryCurrency, secondaryCurrency), secondaryCurrency)})
                                </span>
                            )}
                        </p>
                        <p className="text-neutral-light mb-1">
                            <span className="font-semibold">Costo Unitario:</span>
                            <span className="text-yellow-400 font-bold ml-2">{formatPrice(product.costPrice, primaryCurrency)}</span>
                            {primaryCurrency !== secondaryCurrency && exchangeRate && (
                                <span className="ml-2 text-xs text-neutral-gray-400">
                                    ({formatPrice(convertPrice(product.costPrice, primaryCurrency, secondaryCurrency), secondaryCurrency)})
                                </span>
                            )}
                        </p>
                        <p className="text-neutral-light mb-3"><span className="font-semibold">Stock:</span> <span className={`${product.stock <= 5 ? 'text-red-400' : 'text-yellow-400'} font-bold`}>{product.stock} unidades</span></p>
                        {product.color && <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold">Color:</span> {product.color}</p>}
                        {product.size && <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold">Talla:</span> {product.size}</p>}
                        {product.material && <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold">Material:</span> {product.material}</p>}
                        {product.isPerishable && <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold">Perecedero:</span> Sí</p>}
                        {product.reorderThreshold > 0 && <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold">Umbral de Reapro.:</span> {product.reorderThreshold}</p>}
                        {product.isPerishable && product.optimalMaxStock > 0 && <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold">Stock Óptimo Máx:</span> {product.optimalMaxStock}</p>}
                        {product.isPerishable && product.shelfLifeDays > 0 && <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold">Vida Útil:</span> {product.shelfLifeDays} días</p>}
                    </>
                ) : (
                    // Si tiene variantes, muestra el resumen de variantes y el botón para expandir/colapsar
                    <div className="mt-2 pt-2 border-t border-neutral-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-neutral-light font-bold text-sm">Variantes ({product.variants.length}):</p>
                            <button
                                onClick={() => toggleProductExpansion(product._id)}
                                className="text-action-blue hover:text-blue-500 transition duration-200"
                                title={isExpanded ? 'Colapsar variantes' : 'Expandir variantes'}
                            >
                                {isExpanded ? (
                                    <ChevronUp size={20} />
                                ) : (
                                    <ChevronDown size={20} />
                                )}
                            </button>
                        </div>
                        {/* Sección de variantes expandida condicionalmente */}
                        {isExpanded && (
                            <div className="mt-3 grid grid-cols-1 gap-3 animate-fade-in-down">
                                {product.variants.map((variant, idx) => (
                                    <div key={variant._id || idx} className="bg-neutral-gray-700 p-3 rounded-md border border-neutral-gray-600 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                        {/* Imagen de la variante */}
                                        <div className="w-16 h-16 sm:w-16 sm:h-16 flex-shrink-0 bg-neutral-gray-900 rounded-md overflow-hidden">
                                            <img
                                                src={variant.imageUrl || 'https://placehold.co/100x100/2D3748/F8F8F2?text=Var+Img'}
                                                alt={variant.name || 'Variant'}
                                                className="object-cover w-full h-full"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/2D3748/F8F8F2?text=Error'; }}
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-neutral-light text-base font-semibold mb-1">{variant.name}</p>
                                            <p className="text-neutral-gray-400 text-xs">SKU: {variant.sku}</p>
                                            <p className="text-success-green font-bold text-sm mt-1">
                                                Precio: {formatPrice(variant.price, primaryCurrency)}
                                                {primaryCurrency !== secondaryCurrency && exchangeRate && (
                                                    <span className="ml-2 text-xs text-neutral-gray-400">
                                                        ({formatPrice(convertPrice(variant.price, primaryCurrency, secondaryCurrency), secondaryCurrency)})
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-yellow-400 text-sm">Stock: {variant.stock} {variant.unitOfMeasure}</p>
                                            <div className="flex flex-wrap gap-x-3 text-neutral-gray-400 text-xs mt-1">
                                                {variant.color && <span>Color: {variant.color}</span>}
                                                {variant.size && <span>Talla: {variant.size}</span>}
                                                {variant.material && <span>Material: {variant.material}</span>}
                                                {variant.isPerishable && <span className="text-orange-300">Perecedero</span>}
                                                {variant.reorderThreshold > 0 && <span>Umbral: {variant.reorderThreshold}</span>}
                                                {variant.isPerishable && variant.optimalMaxStock > 0 && <span>Óptimo Máx: {variant.optimalMaxStock}</span>}
                                                {variant.isPerishable && variant.shelfLifeDays > 0 && <span>Vida Útil: {variant.shelfLifeDays} días</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Botones de Acción */}
            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={() => handleEditClick(product)}
                    className="bg-neutral-gray-700 text-neutral-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-gray-600 transition duration-200 flex items-center shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-gray-500"
                >
                    <Edit size={16} className="mr-1"/> Editar
                </button>
                <button
                    onClick={() => confirmDeleteProduct(product._id)}
                    className="bg-red-600 text-neutral-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition duration-200 flex items-center shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <Trash2 size={16} className="mr-1"/> Eliminar
                </button>
            </div>
        </div>
    );
};

export default ProductCard;