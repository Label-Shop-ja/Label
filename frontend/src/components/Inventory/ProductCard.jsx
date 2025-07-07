// src/components/Inventory/ProductCard.jsx
import React from 'react';
import { Edit, Trash2, ChevronDown, ChevronUp, MoreVertical, Info, DollarSign, TrendingUp, Package } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Transition } from '@headlessui/react';

const ProductCard = ({ product, handleEditClick, confirmDeleteProduct, isExpanded, toggleProductExpansion, onViewDetails }) => {
    const { exchangeRate, convertPrice, formatPrice } = useCurrency();
    const { theme } = useTheme();

    const primaryCurrency = exchangeRate?.fromCurrency || 'USD';
    const secondaryCurrency = exchangeRate?.toCurrency || 'VES';

    return (
        <div className={`w-full rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl border flex gap-4 p-4 ${
            theme === 'light' 
                ? 'bg-surface-primary border-border-subtle hover:shadow-gray-200' 
                : 'bg-gray-800 border-gray-600 hover:shadow-gray-900/50'
        }`}>
            {/* Imagen del Producto - Lado Izquierdo */}
            <div className={`w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden ${
                theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
            }`}>
                {product.imageUrl || (product.variants && product.variants.length > 0 && product.variants[0].imageUrl) ? (
                    <img
                        src={product.imageUrl || product.variants[0].imageUrl}
                        alt={product.name || 'Product'}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                            // Si falla la imagen, mostrar placeholder con letra
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                {/* Placeholder con primera letra */}
                <div className={`w-full h-full flex items-center justify-center text-4xl font-bold ${
                    !product.imageUrl && !(product.variants && product.variants.length > 0 && product.variants[0].imageUrl) ? 'flex' : 'hidden'
                } ${
                    theme === 'light' 
                        ? 'bg-gradient-to-br from-blue-400 to-purple-500 text-white' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                }`}>
                    {product.name ? product.name.charAt(0).toUpperCase() : 'P'}
                </div>
            </div>
            
            {/* Información del Producto - Lado Derecho */}
            <div className="flex-1 min-w-0">
                {/* Header con nombre y menú */}
                <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-lg font-bold truncate pr-2 ${
                        theme === 'light' ? 'text-text-emphasis' : 'text-gray-100'
                    }`}>{product.name}</h4>
                    
                    {/* Menú de acciones integrado */}
                    <Menu as="div" className="relative inline-block text-left flex-shrink-0">
                        <Menu.Button className={`p-1.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            theme === 'light'
                                ? 'hover:bg-surface-secondary text-text-muted hover:text-text-base'
                                : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                        }`}>
                            <MoreVertical size={16} />
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
                            <Menu.Items className={`absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-xl shadow-lg ring-1 focus:outline-none ${
                                theme === 'light'
                                    ? 'bg-white ring-black/5 border border-gray-200'
                                    : 'bg-gray-800 ring-white/5 border border-gray-600'
                            }`}>
                                <div className="py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => onViewDetails(product)}
                                                className={`flex items-center w-full px-3 py-2 text-sm gap-2 transition-colors duration-200 ${
                                                    active 
                                                        ? theme === 'light' 
                                                            ? 'bg-gray-50 text-gray-700' 
                                                            : 'bg-gray-700/20 text-gray-300'
                                                        : theme === 'light'
                                                            ? 'text-text-base'
                                                            : 'text-gray-200'
                                                }`}
                                            >
                                                <Info size={14} /> Ver Detalles
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => handleEditClick(product)}
                                                className={`flex items-center w-full px-3 py-2 text-sm gap-2 transition-colors duration-200 ${
                                                    active 
                                                        ? theme === 'light' 
                                                            ? 'bg-blue-50 text-blue-600' 
                                                            : 'bg-blue-900/20 text-blue-400'
                                                        : theme === 'light'
                                                            ? 'text-text-base'
                                                            : 'text-gray-200'
                                                }`}
                                            >
                                                <Edit size={14} /> Editar
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => confirmDeleteProduct(product._id)}
                                                className={`flex items-center w-full px-3 py-2 text-sm gap-2 transition-colors duration-200 ${
                                                    active 
                                                        ? theme === 'light'
                                                            ? 'bg-red-50 text-red-600'
                                                            : 'bg-red-900/20 text-red-400'
                                                        : 'text-red-600'
                                                }`}
                                            >
                                                <Trash2 size={14} /> Eliminar
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
                
                {/* Info básica compacta */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3">
                    <span className={`font-medium ${
                        theme === 'light' ? 'text-text-base' : 'text-gray-200'
                    }`}>SKU: {product.sku || 'N/A'}</span>
                    {product.category && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-blue-900/50 text-blue-200'
                    }`}>{product.category}</span>}
                    {product.brand && <span className={`${
                        theme === 'light' ? 'text-text-muted' : 'text-gray-400'
                    }`}>Marca: {product.brand}</span>}
                </div>

                {/* Información comercial */}
                <div className={`mb-2 text-sm flex items-center flex-wrap gap-x-4 gap-y-1 ${
                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                }`}>
                    <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-green-600" />
                        <span className="font-semibold">Venta:</span> 
                        <span className="text-green-600 font-bold">{formatPrice(product.price, primaryCurrency)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-orange-500" />
                        <span className="font-semibold">Costo:</span> 
                        <span className="text-orange-500 font-bold">{formatPrice(product.costPrice, primaryCurrency)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp size={14} className="text-blue-600" />
                        <span className="font-semibold">Ganancia:</span> 
                        <span className="text-blue-600 font-bold">
                            {product.price && product.costPrice ? 
                                Math.round(((product.price - product.costPrice) / product.costPrice) * 100) : 0}%
                        </span>
                    </div>
                </div>
                
                {/* Stock e indicadores */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                        <Package size={14} className={product.stock <= 5 ? 'text-red-500' : 'text-amber-500'} />
                        <span className={`font-medium ${
                            theme === 'light' ? 'text-text-base' : 'text-gray-200'
                        }`}>Stock:</span>
                        <span className={`font-bold ${
                            product.stock <= 5 ? 'text-red-500' : 'text-amber-500'
                        }`}>{product.stock} uds</span>
                    </div>
                    
                    {product.stock <= 5 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 ml-2">Stock Bajo</span>
                    )}
                    {product.isPerishable && (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">Perecedero</span>
                    )}
                    {product.variants && product.variants.length > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            theme === 'light' ? 'bg-purple-100 text-purple-700' : 'bg-purple-900/50 text-purple-300'
                        }`}>Variantes: {product.variants.length}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;