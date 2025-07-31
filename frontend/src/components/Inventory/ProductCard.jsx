// src/components/Inventory/ProductCard.jsx
import React from 'react';
import { Edit, Trash2, MoreVertical, Info, BadgeDollarSign, TrendingUp, Package2, AlertTriangle } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Transition } from '@headlessui/react';

const ProductCard = ({ product, handleEditClick, confirmDeleteProduct, isExpanded, toggleProductExpansion, onViewDetails }) => {
    const { exchangeRate, convertPrice, formatPrice } = useCurrency();
    const { theme } = useTheme();

    // Mostrar precios en su moneda original (incluyendo precios auto-calculados)
    const salePrice = product.price;
    const saleCurrency = product.saleCurrency || 'USD';
    const costPrice = product.costPrice;
    const costCurrency = product.costCurrency || 'USD';
    
    // Usar porcentaje de ganancia almacenado en lugar de calcularlo
    const profitMargin = product.profitPercentage || 0;

    const isLowStock = product.stock <= 5;
    const hasVariants = product.variants && product.variants.length > 0;

    return (
        <div className={`relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] border ${
            theme === 'light' 
                ? 'bg-white border-gray-200 hover:shadow-lg' 
                : 'bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-900/20'
        }`}>
            {/* Gradiente decorativo superior */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                isLowStock 
                    ? 'from-red-500 to-orange-500' 
                    : 'from-blue-500 to-purple-500'
            }`} />
            
            <div className="flex h-36">
                {/* Imagen - Lado Izquierdo */}
                <div className={`relative w-32 flex-shrink-0 ${
                    theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
                }`}>
                    {product.imageUrl || (hasVariants && product.variants[0].imageUrl) ? (
                        <img
                            src={product.imageUrl || product.variants[0].imageUrl}
                            alt={product.name || 'Product'}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${
                        !product.imageUrl && !(hasVariants && product.variants[0].imageUrl) ? 'flex' : 'hidden'
                    } bg-gradient-to-br from-blue-500 to-purple-600 text-white`}>
                        {product.name ? product.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    
                    {/* Badge de stock bajo */}
                    {isLowStock && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <AlertTriangle size={12} className="text-white" />
                        </div>
                    )}
                </div>
                
                {/* Información - Lado Derecho */}
                <div className="flex-1 p-3 flex flex-col justify-between">
                    {/* Header con nombre, SKU y menú */}
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`text-sm font-bold truncate leading-tight ${
                                    theme === 'light' ? 'text-gray-900' : 'text-white'
                                }`}>{product.name}</h4>
                                <span className={`text-xs px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${
                                    theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-gray-700 text-gray-300'
                                }`}>
                                    {product.sku || 'Sin SKU'}
                                </span>
                                {product.category && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 flex-shrink-0">
                                        {product.category}
                                    </span>
                                )}
                                {hasVariants && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 flex-shrink-0">
                                        {product.variants.length} variantes
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Menú de acciones */}
                        <Menu as="div" className="relative">
                            <Menu.Button className={`p-1 rounded transition-colors ${
                                theme === 'light'
                                    ? 'hover:bg-gray-100 text-gray-600'
                                    : 'hover:bg-gray-700 text-gray-400'
                            }`}>
                                <MoreVertical size={14} />
                            </Menu.Button>
                            <Transition
                                as={React.Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className={`absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-lg shadow-lg ring-1 focus:outline-none ${
                                    theme === 'light'
                                        ? 'bg-white ring-black/5'
                                        : 'bg-gray-800 ring-white/5'
                                }`}>
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => onViewDetails?.(product)}
                                                    className={`flex items-center w-full px-2 py-1 text-xs gap-1 ${
                                                        active 
                                                            ? theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
                                                            : ''
                                                    } ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}
                                                >
                                                    <Info size={12} /> Detalles
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => handleEditClick(product)}
                                                    className={`flex items-center w-full px-2 py-1 text-xs gap-1 ${
                                                        active ? 'bg-blue-50 text-blue-600' : theme === 'light' ? 'text-gray-700' : 'text-gray-200'
                                                    }`}
                                                >
                                                    <Edit size={12} /> Editar
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => confirmDeleteProduct(product._id)}
                                                    className={`flex items-center w-full px-2 py-1 text-xs gap-1 ${
                                                        active ? 'bg-red-50' : ''
                                                    } text-red-600`}
                                                >
                                                    <Trash2 size={12} /> Eliminar
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                    


                    {/* Grid 2x2 - Información Financiera Moderna */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className={`py-3 px-3 rounded-lg flex items-center justify-between transition-all duration-200 hover:scale-105 ${
                            theme === 'light' 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100' 
                                : 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 hover:from-green-800/30 hover:to-emerald-800/30'
                        }`}>
                            <div className="flex items-center gap-2">
                                <BadgeDollarSign size={16} className="text-white" />
                                <span className={`text-sm font-medium ${
                                    theme === 'light' ? 'text-green-700' : 'text-green-300'
                                }`}>Venta</span>
                            </div>
                            <div className="font-bold text-green-600 text-base">
                                {salePrice ? formatPrice(salePrice, saleCurrency) : 'N/A'}
                            </div>
                        </div>
                        
                        <div className={`py-3 px-3 rounded-lg flex items-center justify-between transition-all duration-200 hover:scale-105 ${
                            theme === 'light' 
                                ? 'bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100' 
                                : 'bg-gradient-to-r from-orange-900/20 to-amber-900/20 hover:from-orange-800/30 hover:to-amber-800/30'
                        }`}>
                            <div className="flex items-center gap-2">
                                <BadgeDollarSign size={16} className="text-white" />
                                <span className={`text-sm font-medium ${
                                    theme === 'light' ? 'text-orange-700' : 'text-orange-300'
                                }`}>Costo</span>
                            </div>
                            <div className="font-bold text-orange-500 text-base">
                                {costPrice ? formatPrice(costPrice, costCurrency) : 'N/A'}
                            </div>
                        </div>
                        
                        <div className={`py-3 px-3 rounded-lg flex items-center justify-between transition-all duration-200 hover:scale-105 ${
                            theme === 'light' 
                                ? isLowStock 
                                    ? 'bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100'
                                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100'
                                : isLowStock
                                    ? 'bg-gradient-to-r from-red-900/20 to-pink-900/20 hover:from-red-800/30 hover:to-pink-800/30'
                                    : 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 hover:from-blue-800/30 hover:to-indigo-800/30'
                        }`}>
                            <div className="flex items-center gap-2">
                                <Package2 size={16} className="text-white" />
                                <span className={`text-sm font-medium ${
                                    theme === 'light' 
                                        ? isLowStock ? 'text-red-700' : 'text-blue-700'
                                        : isLowStock ? 'text-red-300' : 'text-blue-300'
                                }`}>Stock</span>
                            </div>
                            <div className={`font-bold text-base ${
                                isLowStock ? 'text-red-600' : 'text-blue-600'
                            }`}>
                                {product.stock} uds
                            </div>
                        </div>
                        
                        <div className={`py-3 px-3 rounded-lg flex items-center justify-between transition-all duration-200 hover:scale-105 ${
                            theme === 'light' 
                                ? profitMargin > 20
                                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100'
                                    : 'bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100'
                                : profitMargin > 20
                                    ? 'bg-gradient-to-r from-emerald-900/20 to-teal-900/20 hover:from-emerald-800/30 hover:to-teal-800/30'
                                    : 'bg-gradient-to-r from-yellow-900/20 to-amber-900/20 hover:from-yellow-800/30 hover:to-amber-800/30'
                        }`}>
                            <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-white" />
                                <span className={`text-sm font-medium ${
                                    theme === 'light' 
                                        ? profitMargin > 20 ? 'text-emerald-700' : 'text-yellow-700'
                                        : profitMargin > 20 ? 'text-emerald-300' : 'text-yellow-300'
                                }`}>Ganancia</span>
                            </div>
                            <div className={`font-bold text-base ${
                                profitMargin > 20 ? 'text-emerald-600' : 'text-yellow-600'
                            }`}>
                                {profitMargin}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;