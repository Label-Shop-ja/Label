import React, { useState } from 'react';
import { X, Package, DollarSign, TrendingUp, Tag, Palette, Ruler, BarChart3, FileText, Scale, Apple, Edit, Trash2 } from 'lucide-react';
import { useReduxTheme } from '../../hooks/useReduxTheme';
import { useReduxCurrency } from '../../hooks/useReduxCurrency';
import ChangeReasonModal from './ChangeReasonModal';

const ProductDetailsModal = ({ isOpen, onClose, product, onEdit, onDelete }) => {
    const { theme } = useReduxTheme();
    const { formatPrice } = useReduxCurrency();
    const [showChangeReasonModal, setShowChangeReasonModal] = useState(false);

    if (!isOpen || !product) return null;

    const hasVariants = product.variants && product.variants.length > 0;

    const handleEditClick = () => {
        setShowChangeReasonModal(true);
    };

    const handleChangeReasonConfirm = (changeData) => {
        setShowChangeReasonModal(false);
        if (onEdit) {
            onEdit(product, changeData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative shadow-2xl ${
                theme === 'light' 
                    ? 'bg-white' 
                    : 'bg-slate-800'
            }`}>
                {/* Header */}
                <div className={`p-6 border-b ${
                    theme === 'light' 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-slate-700/50 border-slate-600'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Imagen del producto */}
                            <div className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ${
                                theme === 'light' ? 'bg-gray-100' : 'bg-slate-600'
                            }`}>
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600">
                                        {product.name?.charAt(0)?.toUpperCase() || 'P'}
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <h2 className={`text-xl font-bold ${
                                    theme === 'light' ? 'text-gray-900' : 'text-white'
                                }`}>
                                    {product.name}
                                </h2>
                                <p className={`text-sm ${
                                    theme === 'light' ? 'text-gray-500' : 'text-slate-400'
                                }`}>
                                    Información completa
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {onEdit && (
                                <button
                                    onClick={handleEditClick}
                                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                    title="Editar producto"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(product)}
                                    className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                                    title="Eliminar producto"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg transition-colors ${
                                    theme === 'light' 
                                        ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-600'
                                }`}
                                title="Cerrar"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
                    <div className="p-6 space-y-6">
                        {/* Descripción */}
                        {product.description && (
                            <div className={`p-4 rounded-xl ${
                                theme === 'light' 
                                    ? 'bg-slate-50 border border-slate-200' 
                                    : 'bg-slate-700/50 border border-slate-600'
                            }`}>
                                <div className={`text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                                }`}>
                                    Descripción
                                </div>
                                <div className={`font-medium ${
                                    theme === 'light' ? 'text-slate-900' : 'text-white'
                                }`}>
                                    {product.description}
                                </div>
                            </div>
                        )}

                        {/* Métricas principales */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className={`p-4 rounded-xl ${
                                theme === 'light' 
                                    ? 'bg-green-50 border border-green-200' 
                                    : 'bg-green-900/20 border border-green-700/50'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign size={16} className="text-green-600" />
                                    <span className={`text-sm font-medium ${
                                        theme === 'light' ? 'text-green-800' : 'text-green-300'
                                    }`}>
                                        Precio Venta
                                    </span>
                                </div>
                                <div className="text-xl font-bold text-green-600">
                                    {product.price ? formatPrice(product.price, product.saleCurrency || 'USD') : 'N/A'}
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl ${
                                theme === 'light' 
                                    ? 'bg-orange-50 border border-orange-200' 
                                    : 'bg-orange-900/20 border border-orange-700/50'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign size={16} className="text-orange-600" />
                                    <span className={`text-sm font-medium ${
                                        theme === 'light' ? 'text-orange-800' : 'text-orange-300'
                                    }`}>
                                        Costo
                                    </span>
                                </div>
                                <div className="text-xl font-bold text-orange-600">
                                    {product.costPrice ? formatPrice(product.costPrice, product.costCurrency || 'USD') : 'N/A'}
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl ${
                                theme === 'light' 
                                    ? 'bg-blue-50 border border-blue-200' 
                                    : 'bg-blue-900/20 border border-blue-700/50'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Package size={16} className="text-blue-600" />
                                    <span className={`text-sm font-medium ${
                                        theme === 'light' ? 'text-blue-800' : 'text-blue-300'
                                    }`}>
                                        Stock
                                    </span>
                                </div>
                                <div className="text-xl font-bold text-blue-600">
                                    {product.stock || 0} {product.unitOfMeasure || 'uds'}
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl ${
                                theme === 'light' 
                                    ? 'bg-purple-50 border border-purple-200' 
                                    : 'bg-purple-900/20 border border-purple-700/50'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp size={16} className="text-purple-600" />
                                    <span className={`text-sm font-medium ${
                                        theme === 'light' ? 'text-purple-800' : 'text-purple-300'
                                    }`}>
                                        Ganancia
                                    </span>
                                </div>
                                <div className="text-xl font-bold text-purple-600">
                                    {product.profitPercentage || 0}%
                                </div>
                            </div>
                        </div>

                        {/* Historial de cambios */}
                        <div className={`p-4 rounded-xl mb-6 ${theme === 'light' ? 'bg-slate-50 border border-slate-200' : 'bg-slate-700/50 border border-slate-600'}`}>
                            <div className={`text-sm font-medium mb-3 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                                Historial de Cambios
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {product.changeLogs && product.changeLogs.length > 0 ? (
                                    product.changeLogs.slice(0, 3).map((log, index) => (
                                        <div key={index} className={`text-xs p-2 rounded ${theme === 'light' ? 'bg-white' : 'bg-slate-600/50'}`}>
                                            <div className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                                {log.reason}
                                            </div>
                                            <div className={`${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {new Date(log.createdAt).toLocaleDateString()} - {log.changeType}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Sin cambios registrados
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Información detallada */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Información del producto */}
                            <div className={`p-4 rounded-xl ${
                                theme === 'light' 
                                    ? 'bg-slate-50 border border-slate-200' 
                                    : 'bg-slate-700/50 border border-slate-600'
                            }`}>
                                <div className={`text-sm font-medium mb-3 ${
                                    theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                                }`}>
                                    Información del Producto
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                                            Categoría
                                        </span>
                                        <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                            {product.category || 'Sin categoría'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                                            SKU
                                        </span>
                                        <span className={`text-sm font-mono ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                            {product.sku || 'Sin SKU'}
                                        </span>
                                    </div>
                                    {product.brand && (
                                        <div className="flex justify-between">
                                            <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                                                Marca
                                            </span>
                                            <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                                {product.brand}
                                            </span>
                                        </div>
                                    )}
                                    {product.supplier && (
                                        <div className="flex justify-between">
                                            <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                                                Proveedor
                                            </span>
                                            <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                                {product.supplier}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                                            Unidad de medida
                                        </span>
                                        <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                            {product.unitOfMeasure || 'unidad'}
                                        </span>
                                    </div>
                                    {product.createdAt && (
                                        <div className="flex justify-between">
                                            <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                                                Fecha
                                            </span>
                                            <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                                {new Date(product.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Gestión de stock */}
                            <div className={`p-4 rounded-xl ${
                                theme === 'light' 
                                    ? 'bg-slate-50 border border-slate-200' 
                                    : 'bg-slate-700/50 border border-slate-600'
                            }`}>
                                <div className={`text-sm font-medium mb-3 ${
                                    theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                                }`}>
                                    Gestión de Stock
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                                            Stock actual
                                        </span>
                                        <span className={`text-sm font-bold ${
                                            product.stock <= 5 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                            {product.stock || 0}
                                        </span>
                                    </div>
                                    {product.reorderThreshold > 0 && (
                                        <div className="flex justify-between">
                                            <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                                                Umbral de reorden
                                            </span>
                                            <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                                {product.reorderThreshold}
                                            </span>
                                        </div>
                                    )}
                                    {product.isPerishable && (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                                                    Producto perecedero
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <Apple size={14} className="text-orange-600" />
                                                    <span className="text-sm font-medium text-orange-600">Sí</span>
                                                </div>
                                            </div>
                                            {product.shelfLifeDays > 0 && (
                                                <div className="flex justify-between">
                                                    <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                                                        Vida útil
                                                    </span>
                                                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                                        {product.shelfLifeDays} días
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Variantes */}
                        {hasVariants && (
                            <div>
                                <div className={`text-sm font-medium mb-4 ${
                                    theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                                }`}>
                                    Variantes ({product.variants.length})
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {product.variants.map((variant, index) => (
                                        <div key={index} className={`p-4 rounded-xl ${
                                            theme === 'light' 
                                                ? 'bg-slate-50 border border-slate-200' 
                                                : 'bg-slate-700/50 border border-slate-600'
                                        }`}>
                                            <div className={`font-medium mb-3 ${
                                                theme === 'light' ? 'text-slate-900' : 'text-white'
                                            }`}>
                                                {variant.name || `Variante ${index + 1}`}
                                            </div>
                                            
                                            <div className="space-y-2 text-sm">
                                                {variant.color && (
                                                    <div className="flex justify-between">
                                                        <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Color:</span>
                                                        <span className={theme === 'light' ? 'text-slate-900' : 'text-white'}>{variant.color}</span>
                                                    </div>
                                                )}
                                                {variant.size && (
                                                    <div className="flex justify-between">
                                                        <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Talla:</span>
                                                        <span className={theme === 'light' ? 'text-slate-900' : 'text-white'}>{variant.size}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Stock:</span>
                                                    <span className={`font-bold ${
                                                        variant.stock <= 5 ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                        {variant.stock || 0}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Precio:</span>
                                                    <span className="font-bold text-green-600">
                                                        {variant.price ? formatPrice(variant.price, variant.saleCurrency || 'USD') : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <ChangeReasonModal
                isOpen={showChangeReasonModal}
                onClose={() => setShowChangeReasonModal(false)}
                onConfirm={handleChangeReasonConfirm}
                productName={product.name}
            />
        </div>
    );
};

export default ProductDetailsModal;