// src/components/Inventory/VariantForm.jsx
import React from 'react';
import { X, Upload, Loader2, ChevronDown, ChevronUp, Trash2, Copy, GripVertical } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const VariantForm = ({
    variant,
    index,
    handleVariantInputChange,
    handleRemoveVariant,
    handleVariantImageFileChange,
    variantImageUploading,
    formErrors,
    calculatedVariantProfitPercentage,
    calculatedVariantPricePlaceholder,
    formatPrice,
    availableCurrencies,
    unitOfMeasureOptions,
    isExpanded = false,
    onToggleExpand,
    onDuplicateVariant,
}) => {
    const { theme } = useTheme();
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    
    const currencies = availableCurrencies && availableCurrencies.length > 0
        ? availableCurrencies
        : ['USD', 'VES', 'EUR'];

    const getVariantStatus = () => {
        const hasErrors = Object.keys(formErrors).some(key => key.startsWith(`variant-${index}-`));
        const isComplete = variant.name && variant.costPrice && variant.stock;
        
        if (hasErrors) return '⚠️';
        if (isComplete) return '✅';
        return (index + 1).toString();
    };

    const getVariantSummary = () => {
        const parts = [];
        if (variant.costPrice) parts.push(`💰 $${variant.costPrice} ${variant.costCurrency || 'USD'}`);
        if (variant.stock) parts.push(`📦 ${variant.stock} uds`);
        if (calculatedVariantPricePlaceholder) parts.push(`💵 $${parseFloat(calculatedVariantPricePlaceholder).toFixed(2)}`);
        if (calculatedVariantProfitPercentage) parts.push(`📈 ${parseFloat(calculatedVariantProfitPercentage).toFixed(0)}%`);
        if (variant.color) parts.push(`🎨 ${variant.color}`);
        if (variant.size) parts.push(`📏 ${variant.size}`);
        return parts.join(' • ');
    };

    const getCompletionPercentage = () => {
        const requiredFields = ['name', 'costPrice', 'stock', 'unitOfMeasure'];
        const completedFields = requiredFields.filter(field => variant[field]);
        return Math.round((completedFields.length / requiredFields.length) * 100);
    };

    return (
        <div className={`rounded-lg mb-4 border transition-all duration-300 ${
            theme === 'light' ? 'bg-surface-secondary border-border-subtle' : 'bg-gray-800 border-gray-600'
        }`}>
            {/* Header colapsable */}
            <div className={`p-4 cursor-pointer ${
                theme === 'light' ? 'hover:bg-surface-tertiary' : 'hover:bg-gray-700'
            }`} onClick={onToggleExpand}>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getVariantStatus()}</span>
                            <h5 className={`text-lg font-bold ${
                                theme === 'light' ? 'text-text-emphasis' : 'text-gray-100'
                            }`}>
                                Variante #{index + 1}: 
                                <span className={theme === 'light' ? 'text-blue-600' : 'text-blue-400'}>
                                    {variant.name || 'Nueva Variante'}
                                </span>
                            </h5>
                            <div className="flex items-center gap-1 ml-auto">
                                {/* Imagen miniatura si existe */}
                                {variant.imageUrl && (
                                    <div className="w-8 h-8 rounded overflow-hidden mr-2">
                                        <img
                                            src={variant.imageUrl}
                                            alt={variant.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                
                                {/* Drag handle */}
                                <button
                                    type="button"
                                    className={`p-1 rounded transition-colors cursor-grab active:cursor-grabbing ${
                                        theme === 'light' ? 'hover:bg-gray-200 text-gray-400' : 'hover:bg-gray-600 text-gray-500'
                                    }`}
                                    title="Arrastrar para reordenar"
                                >
                                    <GripVertical size={14} />
                                </button>
                                
                                {/* Duplicar */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDuplicateVariant && onDuplicateVariant(index);
                                    }}
                                    className={`p-1 rounded transition-colors ${
                                        theme === 'light' ? 'hover:bg-blue-100 text-blue-600' : 'hover:bg-blue-900/20 text-blue-400'
                                    }`}
                                    title="Duplicar variante"
                                >
                                    <Copy size={14} />
                                </button>
                                
                                {/* Expandir/Colapsar */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleExpand();
                                    }}
                                    className={`p-1 rounded transition-colors ${
                                        theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-600'
                                    }`}
                                >
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                
                                {/* Eliminar */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveVariant(index);
                                    }}
                                    className="p-1 rounded text-red-500 hover:text-red-400 hover:bg-red-50 transition-colors"
                                    aria-label={`Eliminar variante ${index + 1}`}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className={`text-sm flex-1 ${
                                theme === 'light' ? 'text-text-muted' : 'text-gray-400'
                            }`}>
                                {getVariantSummary() || '⚠️ Campos incompletos'}
                            </p>
                            <div className={`text-xs px-2 py-1 rounded-full ml-2 ${
                                getCompletionPercentage() === 100
                                    ? theme === 'light' ? 'bg-green-100 text-green-800' : 'bg-green-900/50 text-green-200'
                                    : theme === 'light' ? 'bg-orange-100 text-orange-800' : 'bg-orange-900/50 text-orange-200'
                            }`}>
                                {getCompletionPercentage()}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido expandible */}
            {isExpanded && (
                <div className={`px-4 pb-4 border-t ${
                    theme === 'light' ? 'border-border-subtle' : 'border-gray-600'
                }`}>

                    {/* Campos Básicos */}
                    <div className="mt-4">
                        <h6 className={`text-sm font-semibold mb-3 ${
                            theme === 'light' ? 'text-text-base' : 'text-gray-200'
                        }`}>Campos Básicos</h6>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Nombre */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>Nombre Variante *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={variant.name || ''}
                                    placeholder="Ej. Rojo, Talla M"
                                    onChange={(e) => handleVariantInputChange(index, e)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formErrors[`variant-${index}-name`] ? 'border-red-500' : 
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    required
                                />
                                {formErrors[`variant-${index}-name`] && <p className="text-red-500 text-xs mt-1">{formErrors[`variant-${index}-name`]}</p>}
                            </div>

                            {/* SKU */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>SKU Variante</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="sku"
                                        value={variant.sku || ''}
                                        placeholder={variant.autoGeneratedVariantSku || "Auto-generado basado en nombre"}
                                        onChange={(e) => handleVariantInputChange(index, e)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            formErrors[`variant-${index}-sku`] ? 'border-red-500' : 
                                            theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                        }`}
                                    />
                                    {!variant.sku && variant.autoGeneratedVariantSku && (
                                        <div className={`absolute right-2 top-2 text-xs ${
                                            theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                                        }`}>
                                            🏷️
                                        </div>
                                    )}
                                </div>
                                {formErrors[`variant-${index}-sku`] && <p className="text-red-500 text-xs mt-1">{formErrors[`variant-${index}-sku`]}</p>}
                                {!variant.sku && variant.autoGeneratedVariantSku && (
                                    <p className={`text-xs mt-1 ${
                                        theme === 'light' ? 'text-green-600' : 'text-green-400'
                                    }`}>
                                        SKU generado: {variant.autoGeneratedVariantSku}
                                    </p>
                                )}
                            </div>

                            {/* Costo */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>Costo Unitario *</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        name="costPrice"
                                        value={variant.costPrice || ''}
                                        placeholder="15.00"
                                        onChange={(e) => handleVariantInputChange(index, e)}
                                        step="0.01"
                                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            formErrors[`variant-${index}-costPrice`] ? 'border-red-500' : 
                                            theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                        }`}
                                        required
                                    />
                                    <select
                                        name="costCurrency"
                                        value={variant.costCurrency || 'USD'}
                                        onChange={(e) => handleVariantInputChange(index, e)}
                                        className={`w-20 px-2 py-2 border rounded-lg ${
                                            theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                        }`}
                                    >
                                        {currencies.map(currency => (
                                            <option key={currency} value={currency}>{currency}</option>
                                        ))}
                                    </select>
                                </div>
                                {formErrors[`variant-${index}-costPrice`] && <p className="text-red-500 text-xs mt-1">{formErrors[`variant-${index}-costPrice`]}</p>}
                            </div>

                            {/* Stock */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>Stock *</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={variant.stock || ''}
                                    placeholder="100"
                                    onChange={(e) => handleVariantInputChange(index, e)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formErrors[`variant-${index}-stock`] ? 'border-red-500' : 
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    required
                                />
                                {formErrors[`variant-${index}-stock`] && <p className="text-red-500 text-xs mt-1">{formErrors[`variant-${index}-stock`]}</p>}
                            </div>

                            {/* Precio de Venta */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>Precio de Venta</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={calculatedVariantPricePlaceholder !== null ? parseFloat(calculatedVariantPricePlaceholder).toFixed(2) : ''}
                                        readOnly
                                        className={`flex-1 px-3 py-2 border rounded-lg ${
                                            theme === 'light' ? 'border-border-subtle bg-gray-50 text-text-base' : 'border-gray-600 bg-gray-600 text-gray-100'
                                        }`}
                                    />
                                    <select
                                        name="saleCurrency"
                                        value={variant.saleCurrency || 'USD'}
                                        onChange={(e) => handleVariantInputChange(index, e)}
                                        className={`w-20 px-2 py-2 border rounded-lg ${
                                            theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                        }`}
                                    >
                                        {currencies.map(currency => (
                                            <option key={currency} value={currency}>{currency}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Unidad de Medida */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>Unidad de Medida *</label>
                                <select
                                    name="unitOfMeasure"
                                    value={variant.unitOfMeasure || 'unidad'}
                                    onChange={(e) => handleVariantInputChange(index, e)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formErrors[`variant-${index}-unitOfMeasure`] ? 'border-red-500' : 
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    required
                                >
                                    {unitOfMeasureOptions.map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                                {formErrors[`variant-${index}-unitOfMeasure`] && <p className="text-red-500 text-xs mt-1">{formErrors[`variant-${index}-unitOfMeasure`]}</p>}
                            </div>

                            {/* Ganancia */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>% Ganancia *</label>
                                <input
                                    type="number"
                                    name="profitPercentage"
                                    value={variant.profitPercentage || ''}
                                    placeholder="20"
                                    onChange={(e) => handleVariantInputChange(index, e)}
                                    step="0.1"
                                    min="0"
                                    max="500"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formErrors[`variant-${index}-profitPercentage`] ? 'border-red-500' : 
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    required
                                />
                                {formErrors[`variant-${index}-profitPercentage`] && <p className="text-red-500 text-xs mt-1">{formErrors[`variant-${index}-profitPercentage`]}</p>}
                                {calculatedVariantProfitPercentage !== null && (
                                    <p className={`text-xs mt-1 ${
                                        theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                                    }`}>
                                        Ganancia real: {parseFloat(calculatedVariantProfitPercentage).toFixed(1)}%
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Opciones Avanzadas */}
                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-between transition-colors ${
                                theme === 'light' 
                                    ? 'bg-surface-tertiary hover:bg-surface-secondary text-text-base' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                            }`}
                        >
                            <span>Opciones Avanzadas</span>
                            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        
                        {showAdvanced && (
                            <div className={`mt-4 p-4 rounded-lg border ${
                                theme === 'light' ? 'border-border-subtle bg-surface-secondary' : 'border-gray-600 bg-gray-700'
                            }`}>
                                {/* Atributos */}
                                <div className="mb-6">
                                    <h6 className={`text-sm font-semibold mb-3 ${
                                        theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                    }`}>🏷️ Atributos</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${
                                                theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                            }`}>Color</label>
                                            <input
                                                type="text"
                                                name="color"
                                                value={variant.color || ''}
                                                onChange={(e) => handleVariantInputChange(index, e)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                                }`}
                                                placeholder="Ej. Rojo"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${
                                                theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                            }`}>Talla/Tamaño</label>
                                            <input
                                                type="text"
                                                name="size"
                                                value={variant.size || ''}
                                                onChange={(e) => handleVariantInputChange(index, e)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                                }`}
                                                placeholder="Ej. M, 42"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${
                                                theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                            }`}>Material</label>
                                            <input
                                                type="text"
                                                name="material"
                                                value={variant.material || ''}
                                                onChange={(e) => handleVariantInputChange(index, e)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                                }`}
                                                placeholder="Ej. Algodón"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Gestión de Stock */}
                                <div className="mb-6">
                                    <h6 className={`text-sm font-semibold mb-3 ${
                                        theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                    }`}>📦 Gestión de Stock</h6>
                                    <div className="space-y-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="isPerishable"
                                                checked={variant.isPerishable || false}
                                                onChange={(e) => handleVariantInputChange(index, e)}
                                                className="mr-2 text-blue-600"
                                            />
                                            <span className={theme === 'light' ? 'text-text-base' : 'text-gray-200'}>
                                                ¿Es Perecedero?
                                            </span>
                                        </label>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${
                                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                                }`}>Umbral de Reaprovisionamiento</label>
                                                <input
                                                    type="number"
                                                    name="reorderThreshold"
                                                    value={variant.reorderThreshold || ''}
                                                    onChange={(e) => handleVariantInputChange(index, e)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                                    }`}
                                                    placeholder="5"
                                                />
                                            </div>
                                            
                                            {variant.isPerishable && (
                                                <>
                                                    <div>
                                                        <label className={`block text-sm font-medium mb-2 ${
                                                            theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                                        }`}>Stock Óptimo Máximo</label>
                                                        <input
                                                            type="number"
                                                            name="optimalMaxStock"
                                                            value={variant.optimalMaxStock || ''}
                                                            onChange={(e) => handleVariantInputChange(index, e)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                                theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                                            }`}
                                                            placeholder="50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={`block text-sm font-medium mb-2 ${
                                                            theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                                        }`}>Vida Útil (días)</label>
                                                        <input
                                                            type="number"
                                                            name="shelfLifeDays"
                                                            value={variant.shelfLifeDays || ''}
                                                            onChange={(e) => handleVariantInputChange(index, e)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                                theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                                            }`}
                                                            placeholder="30"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Imagen */}
                                <div>
                                    <h6 className={`text-sm font-semibold mb-3 ${
                                        theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                    }`}>🖼️ Imagen de Variante</h6>
                                    <div className="space-y-3">
                                        {/* Subir archivo */}
                                        <label className={`w-full py-2 px-3 rounded-lg text-center cursor-pointer transition-colors text-sm flex items-center justify-center gap-2 ${
                                            theme === 'light' 
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                                        }`}>
                                            {variantImageUploading && variantImageUploading[index] ? 
                                                <Loader2 size={16} className="animate-spin" /> : 
                                                <Upload size={16} />
                                            }
                                            Subir Imagen
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleVariantImageFileChange(index, e)}
                                            className="hidden"
                                        />
                                        
                                        {/* URL externa */}
                                        <div>
                                            <label className={`block text-xs font-medium mb-1 ${
                                                theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                            }`}>O pegar URL de imagen:</label>
                                            <input
                                                type="url"
                                                name="imageUrl"
                                                value={variant.imageUrl || ''}
                                                onChange={(e) => handleVariantInputChange(index, e)}
                                                className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                                    theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                                }`}
                                                placeholder="https://ejemplo.com/imagen.jpg"
                                            />
                                        </div>
                                        
                                        {/* Preview */}
                                        {variant.imageUrl && (
                                            <div className={`p-2 rounded-lg border text-center ${
                                                theme === 'light' ? 'border-border-subtle bg-surface-primary' : 'border-gray-600 bg-gray-800'
                                            }`}>
                                                <p className={`text-xs mb-2 ${
                                                    theme === 'light' ? 'text-text-muted' : 'text-gray-400'
                                                }`}>Previsualización:</p>
                                                <img
                                                    src={variant.imageUrl}
                                                    alt={`Previsualización de ${variant.name}`}
                                                    className="max-w-full h-auto max-h-24 object-contain mx-auto rounded"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://placehold.co/120x80/gray/white?text=Error';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VariantForm;
