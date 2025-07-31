// src/components/Inventory/ProductCard.jsx
import React from 'react';
import { Edit, Trash2, MoreVertical, Info, DollarSign, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Transition } from '@headlessui/react';

const ProductCard = ({ product, handleEditClick, confirmDeleteProduct, isExpanded, toggleProductExpansion, onViewDetails }) => {
    const { exchangeRate, convertPrice, formatPrice } = useCurrency();
    const { theme } = useTheme();

    // Convertir precios a la moneda actual
    const convertedPrice = convertPrice(product.price, product.saleCurrency || 'USD', exchangeRate?.toCurrency || 'VES');
    const convertedCostPrice = convertPrice(product.costPrice, product.costCurrency || 'USD', exchangeRate?.toCurrency || 'VES');
    
    // Calcular ganancia
    const profitMargin = product.price && product.costPrice ? 
        Math.round(((product.price - product.costPrice) / product.costPrice) * 100) : 0;

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
                    


                    {/* Grid 2x2 - Información Financiera con bordes */}
                    <div className={`grid grid-cols-2 border rounded text-center ${
                        theme === 'light' ? 'border-gray-200' : 'border-gray-600'
                    }`}>
                        <div className={`py-2 px-1 border-r border-b ${
                            theme === 'light' ? 'border-gray-200' : 'border-gray-600'
                        }`}>
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <DollarSign size={10} className="text-green-600" />
                                <span className="text-xs text-gray-500">Venta</span>
                            </div>
                            <div className="font-bold text-green-600 text-sm leading-tight">
                                {convertedPrice ? formatPrice(convertedPrice, exchangeRate?.toCurrency || 'VES') : 'N/A'}
                            </div>
                        </div>
                        
                        <div className={`py-2 px-1 border-b ${
                            theme === 'light' ? 'border-gray-200' : 'border-gray-600'
                        }`}>
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <DollarSign size={10} className="text-orange-500" />
                                <span className="text-xs text-gray-500">Costo</span>
                            </div>
                            <div className="font-bold text-orange-500 text-sm leading-tight">
                                {convertedCostPrice ? formatPrice(convertedCostPrice, exchangeRate?.toCurrency || 'VES') : 'N/A'}
                            </div>
                        </div>
                        
                        <div className={`py-2 px-1 border-r ${
                            theme === 'light' ? 'border-gray-200' : 'border-gray-600'
                        }`}>
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Package size={10} className={isLowStock ? 'text-red-600' : 'text-blue-600'} />
                                <span className="text-xs text-gray-500">Stock</span>
                            </div>
                            <div className={`font-bold text-sm leading-tight ${
                                isLowStock ? 'text-red-600' : 'text-blue-600'
                            }`}>
                                {product.stock} uds
                            </div>
                        </div>
                        
                        <div className="py-2 px-1">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <TrendingUp size={10} className={profitMargin > 20 ? 'text-green-600' : 'text-yellow-600'} />
                                <span className="text-xs text-gray-500">Ganancia</span>
                            </div>
                            <div className={`font-bold text-sm leading-tight ${
                                profitMargin > 20 ? 'text-green-600' : 'text-yellow-600'
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