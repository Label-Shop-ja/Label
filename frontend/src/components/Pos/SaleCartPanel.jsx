// C:\Proyectos\Label\frontend\src\components\Pos\SaleCartPanel.jsx
import React from 'react';
import { FaPlusCircle, FaMinusCircle, FaTimesCircle } from 'react-icons/fa';

const SaleCartPanel = ({ saleItems, adjustQuantity, removeItemFromSale, formatPrice, convertPrice, exchangeRate }) => {
    return (
        <div className="flex-1 overflow-y-auto pr-2 mb-6">
            {saleItems.length === 0 ? (
                <p className="text-neutral-gray-300 text-lg text-center mt-4">El carrito está vacío. Añade productos de la lista de búsqueda.</p>
            ) : (
                <>
                    {saleItems.map((item, index) => (
                        <div key={item.product._id + (item.variantId || '') + index} className="flex items-center justify-between bg-dark-charcoal p-3 rounded-lg mb-3 shadow-sm border border-neutral-gray-700">
                            {/* Imagen del producto/variante */}
                            <div className="w-16 h-16 flex-shrink-0 bg-neutral-gray-900 rounded-md overflow-hidden mr-3">
                                <img
                                    src={item.product.imageUrl || item.product.variants?.[0]?.imageUrl || 'https://placehold.co/100x100/2D3748/F8F8F2?text=Sin+Img'}
                                    alt={item.product.name}
                                    className="object-cover w-full h-full"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/2D3748/F8F8F2?text=Error'; }}
                                />
                            </div>
                            <div className="flex-grow">
                                <p className="text-neutral-light font-medium">{item.product.name} {item.variantId ? `- ${item.product.name}` : ''}</p>
                                <p className="text-sm text-neutral-gray-300">
                                    {formatPrice(item.priceAtSale, exchangeRate?.fromCurrency || 'USD')}
                                    {exchangeRate && exchangeRate.rate && (
                                        <span className="ml-2 text-xs text-neutral-gray-400">
                                            ({formatPrice(convertPrice(item.priceAtSale, exchangeRate.fromCurrency, exchangeRate.toCurrency), exchangeRate.toCurrency)})
                                        </span>
                                    )} c/u
                                </p>
                                {/* Muestra la unidad de medida si es un producto pesado */}
                                {['kg', 'litro', 'metro'].includes(item.product.unitOfMeasure) && (
                                    <p className="text-sm text-neutral-gray-400">({item.quantity} {item.product.unitOfMeasure})</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => adjustQuantity(index, -1)} className="text-copper-rose-accent hover:text-red-500 transition duration-200">
                                    <FaMinusCircle size={20} />
                                </button>
                                <span className="text-xl font-bold text-neutral-light">{item.quantity}</span>
                                <button onClick={() => adjustQuantity(index, 1)} className="text-action-blue hover:text-blue-500 transition duration-200">
                                    <FaPlusCircle size={20} />
                                </button>
                                <button onClick={() => removeItemFromSale(index)} className="text-red-600 hover:text-red-700 ml-2 transition duration-200">
                                    <FaTimesCircle size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default SaleCartPanel;