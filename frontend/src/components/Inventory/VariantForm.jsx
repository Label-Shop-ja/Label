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
    const [expandedSections, setExpandedSections] = React.useState(new Set(['basic']));
    const formRef = React.useRef(null);
    const [needsScroll, setNeedsScroll] = React.useState(false);
    
    // Detectar si necesita scroll basándose en el tamaño del modal
    React.useEffect(() => {
        if (isExpanded && formRef.current) {
            const checkScrollNeed = () => {
                const formElement = formRef.current;
                const modal = formElement.closest('[role="dialog"], .modal-container, .fixed');
                
                if (modal) {
                    const modalRect = modal.getBoundingClientRect();
                    const formRect = formElement.getBoundingClientRect();
                    const availableHeight = modalRect.bottom - formRect.top - 100; // 100px margen conservador
                    
                    // Temporalmente quitar restricción para medir altura real
                    formElement.style.maxHeight = 'none';
                    formElement.style.overflow = 'visible';
                    
                    // Forzar reflow para obtener medición precisa
                    formElement.offsetHeight;
                    
                    const naturalHeight = formElement.scrollHeight;
                    const needsScrolling = naturalHeight > (availableHeight - 20); // 20px buffer adicional
                    
                    setNeedsScroll(needsScrolling);
                    
                    // Restaurar estilos después de la medición
                    if (needsScrolling) {
                        formElement.style.maxHeight = `${availableHeight - 20}px`;
                        formElement.style.overflow = 'auto';
                    } else {
                        formElement.style.maxHeight = 'none';
                        formElement.style.overflow = 'visible';
                    }
                }
            };
            
            // Verificar después de que el DOM se actualice completamente
            setTimeout(checkScrollNeed, 200);
            // Verificación adicional para mayor precisión
            setTimeout(checkScrollNeed, 400);
            window.addEventListener('resize', checkScrollNeed);
            
            return () => window.removeEventListener('resize', checkScrollNeed);
        }
    }, [isExpanded, expandedSections]);
    
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => {
            if (prev.has(sectionId)) {
                return new Set();
            } else {
                return new Set([sectionId]);
            }
        });
    };
    
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
                                {variant.imageUrl && (
                                    <div className="w-8 h-8 rounded overflow-hidden mr-2">
                                        <img
                                            src={variant.imageUrl}
                                            alt={variant.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                
                                <button
                                    type="button"
                                    className={`p-1 rounded transition-colors cursor-grab active:cursor-grabbing ${
                                        theme === 'light' ? 'hover:bg-gray-200 text-gray-400' : 'hover:bg-gray-600 text-gray-500'
                                    }`}
                                    title="Arrastrar para reordenar"
                                >
                                    <GripVertical size={14} />
                                </button>
                                
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

            {isExpanded && (
                <div className={`px-4 pb-4 border-t ${
                    theme === 'light' ? 'border-border-subtle' : 'border-gray-600'
                }`}>
                    <div 
                        ref={formRef}
                        className={`mt-4 space-y-4 ${
                            needsScroll ? 'pr-2' : ''
                        }`}
                        style={{ 
                            scrollbarWidth: 'thin',
                            scrollbarColor: theme === 'light' ? '#d1d5db #f3f4f6' : '#6b7280 #374151'
                        }}
                    >
                        <div className={`rounded-xl border ${
                            theme === 'light' ? 'border-blue-200 bg-blue-50/50' : 'border-blue-700/50 bg-blue-900/20'
                        }`}>
                            <button
                                type="button"
                                onClick={() => toggleSection('basic')}
                                className={`w-full p-4 flex items-center justify-between hover:bg-opacity-80 transition-all duration-200 ${
                                    theme === 'light' ? 'hover:bg-blue-100/50' : 'hover:bg-blue-800/20'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📝</span>
                                    <h6 className={`text-sm font-semibold ${
                                        theme === 'light' ? 'text-blue-800' : 'text-blue-200'
                                    }`}>Información Básica</h6>
                                </div>
                                <ChevronDown 
                                    size={16} 
                                    className={`transition-transform duration-200 ${
                                        expandedSections.has('basic') ? 'rotate-180' : ''
                                    } ${
                                        theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                                    }`}
                                />
                            </button>
                            
                            {expandedSections.has('basic') && (
                                <div className={`p-4 border-t ${
                                    theme === 'light' ? 'border-blue-200' : 'border-blue-700/50'
                                }`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${
                                                theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                            }`}>SKU Variante</label>
                                            <input
                                                type="text"
                                                name="sku"
                                                value={variant.sku || ''}
                                                placeholder={variant.autoGeneratedVariantSku || "Auto-generado"}
                                                onChange={(e) => handleVariantInputChange(index, e)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    formErrors[`variant-${index}-sku`] ? 'border-red-500' : 
                                                    theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                                }`}
                                            />
                                        </div>

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
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className={`rounded-xl border ${
                            theme === 'light' ? 'border-green-200 bg-green-50/50' : 'border-green-700/50 bg-green-900/20'
                        }`}>
                            <button
                                type="button"
                                onClick={() => toggleSection('pricing')}
                                className={`w-full p-4 flex items-center justify-between hover:bg-opacity-80 transition-all duration-200 ${
                                    theme === 'light' ? 'hover:bg-green-100/50' : 'hover:bg-green-800/20'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">💰</span>
                                    <h6 className={`text-sm font-semibold ${
                                        theme === 'light' ? 'text-green-800' : 'text-green-200'
                                    }`}>Precios y Stock</h6>
                                </div>
                                <ChevronDown 
                                    size={16} 
                                    className={`transition-transform duration-200 ${
                                        expandedSections.has('pricing') ? 'rotate-180' : ''
                                    } ${
                                        theme === 'light' ? 'text-green-600' : 'text-green-400'
                                    }`}
                                />
                            </button>
                            
                            {expandedSections.has('pricing') && (
                                <div className={`p-4 border-t ${
                                    theme === 'light' ? 'border-green-200' : 'border-green-700/50'
                                }`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        </div>

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
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${
                                                theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                            }`}>% Ganancia *</label>
                                            <input
                                                type="number"
                                                name="profitPercentage"
                                                value={variant.profitPercentage || ''}
                                                placeholder="30"
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
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${
                                                theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                            }`}>Precio de Venta</label>
                                            <input
                                                type="number"
                                                value={calculatedVariantPricePlaceholder !== null ? parseFloat(calculatedVariantPricePlaceholder).toFixed(2) : ''}
                                                readOnly
                                                className={`w-full px-3 py-2 border rounded-lg ${
                                                    theme === 'light' ? 'border-border-subtle bg-gray-50 text-text-base' : 'border-gray-600 bg-gray-600 text-gray-100'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`rounded-xl border ${
                            theme === 'light' ? 'border-orange-200 bg-orange-50/50' : 'border-orange-700/50 bg-orange-900/20'
                        }`}>
                            <button
                                type="button"
                                onClick={() => toggleSection('advanced')}
                                className={`w-full p-4 flex items-center justify-between hover:bg-opacity-80 transition-all duration-200 ${
                                    theme === 'light' ? 'hover:bg-orange-100/50' : 'hover:bg-orange-800/20'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">⚙️</span>
                                    <h6 className={`text-sm font-semibold ${
                                        theme === 'light' ? 'text-orange-800' : 'text-orange-200'
                                    }`}>Opciones Avanzadas</h6>
                                </div>
                                <ChevronDown 
                                    size={16} 
                                    className={`transition-transform duration-200 ${
                                        expandedSections.has('advanced') ? 'rotate-180' : ''
                                    } ${
                                        theme === 'light' ? 'text-orange-600' : 'text-orange-400'
                                    }`}
                                />
                            </button>
                            
                            {expandedSections.has('advanced') && (
                                <div className={`p-4 border-t ${
                                    theme === 'light' ? 'border-orange-200' : 'border-orange-700/50'
                                }`}>
                                    <div className="space-y-4">
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

                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${
                                                theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                            }`}>Imagen de Variante</label>
                                            <div className="space-y-3">
                                                <label htmlFor={`variant-image-upload-${index}`} className={`w-full py-2 px-3 rounded-lg text-center cursor-pointer transition-colors text-sm flex items-center justify-center gap-2 ${
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
                                                    id={`variant-image-upload-${index}`}
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                    onChange={(e) => handleVariantImageFileChange(index, e)}
                                                    className="hidden"
                                                />
                                                
                                                <input
                                                    type="url"
                                                    name="imageUrl"
                                                    value={variant.imageUrl || ''}
                                                    onChange={(e) => handleVariantInputChange(index, e)}
                                                    className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                                    }`}
                                                    placeholder="O pegar URL de imagen"
                                                />
                                                
                                                {variant.imageUrl && (
                                                    <div className={`p-2 rounded-lg border text-center ${
                                                        theme === 'light' ? 'border-border-subtle bg-surface-primary' : 'border-gray-600 bg-gray-800'
                                                    }`}>
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
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VariantForm;