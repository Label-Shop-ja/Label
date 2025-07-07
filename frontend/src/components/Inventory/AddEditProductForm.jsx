// src/components/Inventory/AddEditProductForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Upload, Loader2, Save, Settings, Package, DollarSign } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import VariantForm from './VariantForm';

const AddEditProductForm = ({
    isNewProduct,
    productData,
    formErrors,
    imagePreviewUrl,
    isUploadingMainImage,
    loading,
    onSubmit,
    handleProductInputChange,
    handleAddVariant,
    handleRemoveVariant,
    handleVariantInputChange,
    handleMainImageFileChange,
    handleVariantImageFileChange,
    variantImageUploading,
    unitOfMeasureOptions,
    availableCurrencies,
    calculatedProductProfitPercentage,
    calculatedProductPricePlaceholder,
    calculatedVariantProfitPercentage,
    calculatedVariantPricePlaceholder,
    formatPrice,
}) => {
    const { theme } = useTheme();
    const [activeSection, setActiveSection] = useState('basic');
    const [expandedVariants, setExpandedVariants] = useState(new Set());
    const sectionRefs = useRef({});
    
    const currencies = availableCurrencies && availableCurrencies.length > 0 
        ? availableCurrencies 
        : ['USD', 'VES', 'EUR'];

    const scrollToSection = (sectionId) => {
        setActiveSection(sectionId);
        if (sectionRefs.current[sectionId]) {
            sectionRefs.current[sectionId].scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Detectar sección activa automáticamente
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const sectionId = entry.target.getAttribute('data-section');
                        if (sectionId) {
                            setActiveSection(sectionId);
                        }
                    }
                });
            },
            { threshold: 0.5 }
        );

        Object.values(sectionRefs.current).forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [productData.variants]);

    const toggleVariantExpansion = (variantIndex) => {
        setExpandedVariants(prev => {
            const newSet = new Set(prev);
            if (newSet.has(variantIndex)) {
                newSet.delete(variantIndex);
            } else {
                newSet.add(variantIndex);
            }
            return newSet;
        });
        // Auto-scroll to variant when expanding
        setTimeout(() => scrollToSection(`variant-${variantIndex}`), 100);
    };

    const getVariantStatus = (variant, index) => {
        const hasErrors = Object.keys(formErrors).some(key => key.startsWith(`variant-${index}-`));
        const isComplete = variant.name && variant.costPrice && variant.stock;
        
        if (hasErrors) return '⚠️';
        if (isComplete) return '✅';
        return index + 1;
    };

    const getSectionStatus = (sectionName) => {
        const sectionErrors = {
            basic: ['name', 'category'].some(field => formErrors[field]),
            pricing: ['costPrice', 'stock', 'unitOfMeasure'].some(field => formErrors[field]),
            variants: productData.variants?.some((_, index) => 
                Object.keys(formErrors).some(key => key.startsWith(`variant-${index}-`))
            ),
            advanced: ['reorderThreshold', 'optimalMaxStock', 'shelfLifeDays'].some(field => formErrors[field])
        };
        return sectionErrors[sectionName] ? '⚠️' : null;
    };

    return (
        <div className={`flex h-full max-h-[80vh] relative ${
            theme === 'light' ? 'bg-surface-primary' : 'bg-gray-900'
        }`}>
            {/* Sidebar */}
            <div className={`w-64 flex-shrink-0 p-6 border-r ${
                theme === 'light' ? 'border-border-subtle bg-surface-secondary' : 'border-gray-700 bg-gray-800'
            }`}>
                {/* Imagen del producto */}
                <div className={`w-full h-48 rounded-xl overflow-hidden mb-4 ${
                    theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
                }`}>
                    {imagePreviewUrl || productData.imageUrl ? (
                        <img
                            src={imagePreviewUrl || productData.imageUrl}
                            alt="Producto"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center text-4xl font-bold ${
                            theme === 'light' 
                                ? 'bg-gradient-to-br from-blue-400 to-purple-500 text-white' 
                                : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                        }`}>
                            {productData.name ? productData.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                    )}
                </div>

                {/* Botón subir imagen */}
                <div className="mb-6">
                    <label className={`w-full py-2 px-3 rounded-lg text-center cursor-pointer transition-colors text-sm flex items-center justify-center gap-2 ${
                        theme === 'light' 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}>
                        {isUploadingMainImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        Subir Imagen
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageFileChange}
                        className="hidden"
                    />
                </div>

                {/* Índice de navegación */}
                <div className={`rounded-lg p-3 ${
                    theme === 'light' ? 'bg-surface-primary' : 'bg-gray-700'
                }`}>
                    <h4 className={`text-sm font-bold mb-3 ${
                        theme === 'light' ? 'text-text-emphasis' : 'text-gray-100'
                    }`}>ÍNDICE</h4>
                    
                    <div className="space-y-1">
                        {/* Básico */}
                        <button
                            type="button"
                            onClick={() => scrollToSection('basic')}
                            className={`w-full text-left px-2 py-1 rounded text-sm transition-colors flex items-center gap-2 ${
                                activeSection === 'basic'
                                    ? theme === 'light' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-blue-900/50 text-blue-200'
                                    : theme === 'light'
                                        ? 'hover:bg-gray-100 text-text-base'
                                        : 'hover:bg-gray-600 text-gray-300'
                            }`}
                        >
                            <span>{activeSection === 'basic' ? '●' : '○'}</span>
                            Básico
                            {getSectionStatus('basic') && <span className="ml-auto animate-pulse">{getSectionStatus('basic')}</span>}
                        </button>

                        {/* Precios */}
                        <button
                            type="button"
                            onClick={() => scrollToSection('pricing')}
                            className={`w-full text-left px-2 py-1 rounded text-sm transition-colors flex items-center gap-2 ${
                                activeSection === 'pricing'
                                    ? theme === 'light' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-blue-900/50 text-blue-200'
                                    : theme === 'light'
                                        ? 'hover:bg-gray-100 text-text-base'
                                        : 'hover:bg-gray-600 text-gray-300'
                            }`}
                        >
                            <DollarSign size={12} />
                            Precios
                            {getSectionStatus('pricing') && <span className="ml-auto animate-pulse">{getSectionStatus('pricing')}</span>}
                        </button>

                        {/* Variantes */}
                        <button
                            type="button"
                            onClick={() => scrollToSection('variants')}
                            className={`w-full text-left px-2 py-1 rounded text-sm transition-colors flex items-center gap-2 ${
                                activeSection === 'variants'
                                    ? theme === 'light' 
                                        ? 'bg-purple-100 text-purple-800' 
                                        : 'bg-purple-900/50 text-purple-200'
                                    : theme === 'light'
                                        ? 'hover:bg-gray-100 text-text-base'
                                        : 'hover:bg-gray-600 text-gray-300'
                            }`}
                        >
                            <Package size={12} />
                            Variantes ({productData.variants ? productData.variants.length : 0})
                            {getSectionStatus('variants') && <span className="ml-auto animate-pulse">{getSectionStatus('variants')}</span>}
                        </button>
                        
                        {/* Lista de variantes */}
                        {productData.variants && productData.variants.length > 0 && (
                            <div className="ml-4 space-y-1">
                                {productData.variants.map((variant, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => scrollToSection(`variant-${index}`)}
                                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center gap-2 ${
                                            activeSection === `variant-${index}`
                                                ? theme === 'light' 
                                                    ? 'bg-purple-50 text-purple-700' 
                                                    : 'bg-purple-900/30 text-purple-300'
                                                : theme === 'light'
                                                    ? 'hover:bg-gray-50 text-text-muted'
                                                    : 'hover:bg-gray-600 text-gray-400'
                                        }`}
                                    >
                                        <span className="text-xs">{getVariantStatus(variant, index)}</span>
                                        <span className="truncate">{variant.name || `Variante ${index + 1}`}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Botón añadir variante */}
                        <button
                            type="button"
                            onClick={handleAddVariant}
                            className={`w-full text-left px-2 py-1 rounded text-sm transition-colors flex items-center gap-2 ${
                                theme === 'light' 
                                    ? 'hover:bg-green-50 text-green-600 hover:text-green-700' 
                                    : 'hover:bg-green-900/20 text-green-400 hover:text-green-300'
                            }`}
                        >
                            <Plus size={12} />
                            Nueva
                        </button>

                        {/* Avanzado */}
                        <button
                            type="button"
                            onClick={() => scrollToSection('advanced')}
                            className={`w-full text-left px-2 py-1 rounded text-sm transition-colors flex items-center gap-2 ${
                                activeSection === 'advanced'
                                    ? theme === 'light' 
                                        ? 'bg-gray-100 text-gray-800' 
                                        : 'bg-gray-600 text-gray-200'
                                    : theme === 'light'
                                        ? 'hover:bg-gray-100 text-text-base'
                                        : 'hover:bg-gray-600 text-gray-300'
                            }`}
                        >
                            <Settings size={12} />
                            Avanzado
                            {getSectionStatus('advanced') && <span className="ml-auto animate-pulse">{getSectionStatus('advanced')}</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 overflow-y-auto">
                <form onSubmit={onSubmit} className="p-6 space-y-8">
                    {/* Sección Básica */}
                    <section 
                        ref={el => sectionRefs.current['basic'] = el}
                        data-section="basic"
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-blue-900/50 text-blue-200'
                            }`}>
                                📝
                            </div>
                            <h3 className={`text-xl font-bold ${
                                theme === 'light' ? 'text-text-emphasis' : 'text-gray-100'
                            }`}>Información Básica</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>
                                    Nombre del Producto *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={productData.name || ''}
                                    onChange={handleProductInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formErrors.name ? 'border-red-500' : 
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    placeholder="Ej. Camiseta Deportiva"
                                    required
                                />
                                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>
                                    Categoría *
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={productData.category || ''}
                                    onChange={handleProductInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formErrors.category ? 'border-red-500' : 
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    placeholder="Ej. Ropa, Electrónica"
                                    required
                                />
                                {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                            </div>

                            {/* Marca */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>
                                    Marca
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={productData.brand || ''}
                                    onChange={handleProductInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    placeholder="Ej. Nike, Samsung"
                                />
                            </div>

                            {/* SKU */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>
                                    SKU
                                </label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={productData.sku || ''}
                                    onChange={handleProductInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formErrors.sku ? 'border-red-500' : 
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    placeholder="Auto-generado"
                                />
                                {formErrors.sku && <p className="text-red-500 text-xs mt-1">{formErrors.sku}</p>}
                            </div>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-text-base' : 'text-gray-200'
                            }`}>
                                Descripción
                            </label>
                            <textarea
                                name="description"
                                value={productData.description || ''}
                                onChange={handleProductInputChange}
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                }`}
                                placeholder="Descripción detallada del producto..."
                            />
                        </div>

                        {/* Tipo de producto */}
                        <div>
                            <label className={`block text-sm font-medium mb-3 ${
                                theme === 'light' ? 'text-text-base' : 'text-gray-200'
                            }`}>
                                Tipo de Producto
                            </label>
                            <div className="flex gap-6">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="hasVariants"
                                        checked={!productData.variants || productData.variants.length === 0}
                                        onChange={() => handleProductInputChange({ target: { name: 'variants', value: [] } })}
                                        className="mr-2 text-blue-600"
                                    />
                                    <span className={theme === 'light' ? 'text-text-base' : 'text-gray-200'}>
                                        Producto Simple
                                    </span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="hasVariants"
                                        checked={productData.variants && productData.variants.length > 0}
                                        onChange={() => {
                                            if (!productData.variants || productData.variants.length === 0) {
                                                handleAddVariant();
                                            }
                                        }}
                                        className="mr-2 text-blue-600"
                                    />
                                    <span className={theme === 'light' ? 'text-text-base' : 'text-gray-200'}>
                                        Con Variantes
                                    </span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Sección de Precios */}
                    <section 
                        ref={el => sectionRefs.current['pricing'] = el}
                        data-section="pricing"
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                theme === 'light' ? 'bg-green-100 text-green-800' : 'bg-green-900/50 text-green-200'
                            }`}>
                                💰
                            </div>
                            <h3 className={`text-xl font-bold ${
                                theme === 'light' ? 'text-text-emphasis' : 'text-gray-100'
                            }`}>Precios y Costos</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Precio de Venta */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>
                                    Precio de Venta *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={calculatedProductPricePlaceholder !== null ? parseFloat(calculatedProductPricePlaceholder).toFixed(2) : ''}
                                        readOnly
                                        className={`flex-1 px-3 py-2 border rounded-lg ${
                                            theme === 'light' ? 'border-border-subtle bg-gray-50 text-text-base' : 'border-gray-600 bg-gray-600 text-gray-100'
                                        }`}
                                        disabled={productData.variants && productData.variants.length > 0}
                                    />
                                    <select
                                        name="saleCurrency"
                                        value={productData.saleCurrency || 'USD'}
                                        onChange={handleProductInputChange}
                                        className={`w-20 px-2 py-2 border rounded-lg ${
                                            theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                        }`}
                                        disabled={productData.variants && productData.variants.length > 0}
                                    >
                                        {currencies.map(currency => (
                                            <option key={currency} value={currency}>{currency}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Costo */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>
                                    Costo Unitario *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        name="costPrice"
                                        value={productData.costPrice || ''}
                                        onChange={handleProductInputChange}
                                        step="0.01"
                                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            formErrors.costPrice ? 'border-red-500' : 
                                            theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                        }`}
                                        placeholder="15.00"
                                        required={!productData.variants || productData.variants.length === 0}
                                        disabled={productData.variants && productData.variants.length > 0}
                                    />
                                    <select
                                        name="costCurrency"
                                        value={productData.costCurrency || 'USD'}
                                        onChange={handleProductInputChange}
                                        className={`w-20 px-2 py-2 border rounded-lg ${
                                            theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                        }`}
                                        disabled={productData.variants && productData.variants.length > 0}
                                    >
                                        {currencies.map(currency => (
                                            <option key={currency} value={currency}>{currency}</option>
                                        ))}
                                    </select>
                                </div>
                                {formErrors.costPrice && <p className="text-red-500 text-xs mt-1">{formErrors.costPrice}</p>}
                            </div>

                            {/* Ganancia */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>
                                    % Ganancia
                                </label>
                                <input
                                    type="number"
                                    name="profitPercentage"
                                    value={calculatedProductProfitPercentage !== null ? parseFloat(calculatedProductProfitPercentage).toFixed(2) : ''}
                                    onChange={handleProductInputChange}
                                    step="0.1"
                                    min="0"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    placeholder="%"
                                    disabled={productData.variants && productData.variants.length > 0}
                                />
                            </div>

                            {/* Stock */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>
                                    Stock *
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={productData.stock || ''}
                                    onChange={handleProductInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formErrors.stock ? 'border-red-500' : 
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    placeholder="100"
                                    required={!productData.variants || productData.variants.length === 0}
                                    disabled={productData.variants && productData.variants.length > 0}
                                />
                                {formErrors.stock && <p className="text-red-500 text-xs mt-1">{formErrors.stock}</p>}
                            </div>

                            {/* Unidad de Medida */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>
                                    Unidad de Medida *
                                </label>
                                <select
                                    name="unitOfMeasure"
                                    value={productData.unitOfMeasure || 'unidad'}
                                    onChange={handleProductInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formErrors.unitOfMeasure ? 'border-red-500' : 
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    required={!productData.variants || productData.variants.length === 0}
                                    disabled={productData.variants && productData.variants.length > 0}
                                >
                                    {unitOfMeasureOptions.map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                                {formErrors.unitOfMeasure && <p className="text-red-500 text-xs mt-1">{formErrors.unitOfMeasure}</p>}
                            </div>
                        </div>
                    </section>

                    {/* Sección de Variantes */}
                    {productData.variants && productData.variants.length > 0 && (
                        <section 
                            ref={el => sectionRefs.current['variants'] = el}
                            data-section="variants"
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    theme === 'light' ? 'bg-purple-100 text-purple-800' : 'bg-purple-900/50 text-purple-200'
                                }`}>
                                    🎨
                                </div>
                                <h3 className={`text-xl font-bold ${
                                    theme === 'light' ? 'text-text-emphasis' : 'text-gray-100'
                                }`}>Variantes del Producto</h3>
                            </div>
                            <div className="space-y-4">
                                {productData.variants.map((variant, index) => (
                                    <div key={index} ref={el => sectionRefs.current[`variant-${index}`] = el}>
                                        <VariantForm
                                            variant={variant}
                                            index={index}
                                            handleVariantInputChange={handleVariantInputChange}
                                            handleRemoveVariant={handleRemoveVariant}
                                            handleVariantImageFileChange={handleVariantImageFileChange}
                                            variantImageUploading={variantImageUploading}
                                            formErrors={formErrors}
                                            calculatedVariantProfitPercentage={calculatedVariantProfitPercentage[index]}
                                            calculatedVariantPricePlaceholder={calculatedVariantPricePlaceholder[index]}
                                            formatPrice={formatPrice}
                                            availableCurrencies={availableCurrencies}
                                            unitOfMeasureOptions={unitOfMeasureOptions}
                                            isExpanded={expandedVariants.has(index)}
                                            onToggleExpand={() => toggleVariantExpansion(index)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Sección Avanzada */}
                    <section 
                        ref={el => sectionRefs.current['advanced'] = el}
                        data-section="advanced"
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-gray-600 text-gray-200'
                            }`}>
                                ⚙️
                            </div>
                            <h3 className={`text-xl font-bold ${
                                theme === 'light' ? 'text-text-emphasis' : 'text-gray-100'
                            }`}>Opciones Avanzadas</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Proveedor */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>Proveedor</label>
                                <input
                                    type="text"
                                    name="supplier"
                                    value={productData.supplier || ''}
                                    onChange={handleProductInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    placeholder="Ej. Distribuciones ABC"
                                />
                            </div>

                            {/* URL de Imagen */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>
                                    URL de Imagen
                                </label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={productData.imageUrl || ''}
                                    onChange={handleProductInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                />
                            </div>

                            {/* Color (solo para productos simples) */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>
                                    Color
                                </label>
                                <input
                                    type="text"
                                    name="color"
                                    value={productData.color || ''}
                                    onChange={handleProductInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    placeholder="Ej. Azul, Negro"
                                    disabled={productData.variants && productData.variants.length > 0}
                                />
                            </div>

                            {/* Talla/Tamaño (solo para productos simples) */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>
                                    Talla/Tamaño
                                </label>
                                <input
                                    type="text"
                                    name="size"
                                    value={productData.size || ''}
                                    onChange={handleProductInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    placeholder="Ej. S, L, XL"
                                    disabled={productData.variants && productData.variants.length > 0}
                                />
                            </div>

                            {/* Material (solo para productos simples) */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                }`}>
                                    Material
                                </label>
                                <input
                                    type="text"
                                    name="material"
                                    value={productData.material || ''}
                                    onChange={handleProductInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                    }`}
                                    placeholder="Ej. Algodón, Plástico"
                                    disabled={productData.variants && productData.variants.length > 0}
                                />
                            </div>
                        </div>

                        {/* Gestión de Stock Avanzada */}
                        <div className={`p-4 rounded-lg border ${
                            theme === 'light' ? 'border-border-subtle bg-surface-secondary' : 'border-gray-600 bg-gray-700'
                        }`}>
                            <h4 className={`text-lg font-semibold mb-4 ${
                                theme === 'light' ? 'text-text-emphasis' : 'text-gray-100'
                            }`}>Gestión de Stock</h4>
                            
                            <div className="space-y-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isPerishable"
                                        checked={productData.isPerishable || false}
                                        onChange={handleProductInputChange}
                                        className="mr-2 text-blue-600"
                                        disabled={productData.variants && productData.variants.length > 0}
                                    />
                                    <span className={theme === 'light' ? 'text-text-base' : 'text-gray-200'}>
                                        ¿Es Perecedero?
                                    </span>
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${
                                            theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                        }`}>
                                            Umbral de Reaprovisionamiento
                                        </label>
                                        <input
                                            type="number"
                                            name="reorderThreshold"
                                            value={productData.reorderThreshold || ''}
                                            onChange={handleProductInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                            }`}
                                            placeholder="10"
                                            disabled={productData.variants && productData.variants.length > 0}
                                        />
                                    </div>

                                    {productData.isPerishable && (
                                        <>
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${
                                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                                }`}>
                                                    Stock Óptimo Máximo
                                                </label>
                                                <input
                                                    type="number"
                                                    name="optimalMaxStock"
                                                    value={productData.optimalMaxStock || ''}
                                                    onChange={handleProductInputChange}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                                    }`}
                                                    placeholder="50"
                                                    disabled={productData.variants && productData.variants.length > 0}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${
                                                    theme === 'light' ? 'text-text-base' : 'text-gray-200'
                                                }`}>
                                                    Vida Útil (días)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="shelfLifeDays"
                                                    value={productData.shelfLifeDays || ''}
                                                    onChange={handleProductInputChange}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        theme === 'light' ? 'border-border-subtle bg-white text-text-base' : 'border-gray-600 bg-gray-700 text-gray-100'
                                                    }`}
                                                    placeholder="30"
                                                    disabled={productData.variants && productData.variants.length > 0}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Botón de envío */}
                    <div className="flex justify-end pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 ${
                                loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {isNewProduct ? 'Crear Producto' : 'Actualizar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditProductForm;