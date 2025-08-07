// C:\Proyectos\Label\frontend\src\components\Pos\SaleCartPanel.jsx
import React from 'react';
import { FaPlusCircle, FaMinusCircle, FaTimesCircle } from 'react-icons/fa';

const SaleCartPanel = ({ saleItems, adjustQuantity, removeItemFromSale, formatPrice, convertPrice, exchangeRate }) => {
    return (
        <div className="flex-1 overflow-y-auto pr-2 mb-6">
            {saleItems.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-text-base mb-2">Carrito vacío</h3>
                    <p className="text-text-muted">Añade productos desde la lista de búsqueda</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {saleItems.map((item, index) => {
                        const totalItemPrice = item.quantity * item.priceAtSale;
                        const totalItemPriceSecondary = exchangeRate && exchangeRate.rate 
                            ? convertPrice(totalItemPrice, exchangeRate.fromCurrency, exchangeRate.toCurrency)
                            : totalItemPrice;
                        
                        return (
                            <div key={item.product._id + (item.variantId || '') + index} className="group bg-surface backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-surface-secondary hover:shadow-xl transition-all duration-300 hover:bg-surface-secondary">
                                <div className="flex items-center gap-4">
                                    {/* Imagen del producto mejorada */}
                                    <div className="w-14 h-14 flex-shrink-0 bg-surface-secondary rounded-xl overflow-hidden shadow-inner ring-2 ring-surface-secondary">
                                        <img
                                            src={item.product.imageUrl || item.product.variants?.[0]?.imageUrl || 'https://placehold.co/100x100/E5E7EB/6B7280?text=📦'}
                                            alt={item.product.name}
                                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/E5E7EB/6B7280?text=❌'; }}
                                        />
                                    </div>
                                    
                                    {/* Información del producto */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-text-base truncate">
                                            {item.product.productName}
                                            {item.product.variantName && (
                                                <span className="ml-2 text-sm bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                                                    {item.product.variantName}
                                                </span>
                                            )}
                                        </h4>
                                        
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm font-medium text-primary">
                                                {formatPrice(item.priceAtSale, exchangeRate?.fromCurrency || 'USD')} c/u
                                            </span>
                                            {exchangeRate && exchangeRate.rate && (
                                                <span className="text-xs text-secondary">
                                                    ({formatPrice(convertPrice(item.priceAtSale, exchangeRate.fromCurrency, exchangeRate.toCurrency), exchangeRate.toCurrency)})
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Unidad de medida para productos pesados */}
                                        {['kg', 'litro', 'metro'].includes(item.product.unitOfMeasure) && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <svg className="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                </svg>
                                                <span className="text-xs text-text-muted">
                                                    {item.quantity} {item.product.unitOfMeasure}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {/* Total del item */}
                                        <div className="mt-2 bg-primary/10 px-3 py-1 rounded-lg inline-block">
                                            <span className="text-sm font-bold text-primary">
                                                Total: {formatPrice(totalItemPrice, exchangeRate?.fromCurrency || 'USD')}
                                            </span>
                                            {exchangeRate && exchangeRate.rate && (
                                                <span className="ml-2 text-xs text-secondary">
                                                    ({formatPrice(totalItemPriceSecondary, exchangeRate.toCurrency)})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Controles de cantidad */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-2 bg-surface-secondary rounded-xl p-2">
                                            <button 
                                                onClick={() => adjustQuantity(index, -1)} 
                                                className="w-8 h-8 bg-error/20 hover:bg-error/30 text-error rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95"
                                                title="Disminuir cantidad"
                                            >
                                                <FaMinusCircle size={16} />
                                            </button>
                                            
                                            <div className="bg-surface px-3 py-1 rounded-lg border border-surface-secondary min-w-[3rem] text-center">
                                                <span className="text-lg font-bold text-text-base">{item.quantity}</span>
                                            </div>
                                            
                                            <button 
                                                onClick={() => adjustQuantity(index, 1)} 
                                                className="w-8 h-8 bg-success/20 hover:bg-success/30 text-success rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95"
                                                title="Aumentar cantidad"
                                            >
                                                <FaPlusCircle size={16} />
                                            </button>
                                        </div>
                                        
                                        <button 
                                            onClick={() => removeItemFromSale(index)} 
                                            className="w-8 h-8 bg-error/20 hover:bg-error/30 text-error rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                                            title="Eliminar del carrito"
                                        >
                                            <FaTimesCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default React.memo(SaleCartPanel);