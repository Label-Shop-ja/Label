// src/components/Inventory/AddEditProductForm.jsx (Componente de UI Puro)
import React, { lazy, Suspense } from 'react';
import { Plus, X, Upload, Loader2, Info, ChevronDown, ChevronUp, Save } from 'lucide-react'; // Íconos
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from "./components/Common/ErrorBoundary";

// Importación perezosa del componente VariantForm
const VariantForm = lazy(() => import('./VariantForm'));

const lang = 'es'; // O usa un contexto/estado global

function AddEditProductForm({ producto, onSave }) {
    const { showNotification } = useNotification();
    const { t } = useTranslation();

    const handleSubmit = async (data) => {
        try {
            await guardarProducto(data);
            if (onSave) onSave();
        } catch (error) {
        }
    };

    const handleAddClient = async (nuevoCliente) => {
        try {
            await axiosInstance.post('/clients', nuevoCliente);
            showNotification(t('CLIENT_ADD_SUCCESS'), 'success');
        } catch (err) {
            // Usa el mensaje traducible si existe, si no, usa uno genérico
            const errorMessage = t(err.translatedMessage || 'CLIENT_ADD_ERROR');
            showNotification(errorMessage, 'error');
        }
    };

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
                <label htmlFor="name" className="block text-neutral-light text-sm font-bold mb-2">
                    Nombre del Producto:
                    <span className="relative inline-block ml-2 group">
                        <Info size={16} className="text-action-blue cursor-pointer" />
                        <span className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 w-48 p-2 bg-neutral-gray-800 text-xs text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-normal text-center shadow-lg">
                            {isNewProduct ? 'Empieza a escribir para buscar sugerencias del catálogo global.' : 'Nombre principal del producto.'}
                        </span>
                    </span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={productData.name}
                    onChange={handleProductInputChange}
                    className={`shadow appearance-none border ${formErrors.name ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                    placeholder="Ej. Camiseta Deportiva"
                    required
                    onBlur={() => setTimeout(() => setShowGlobalSuggestions(false), 100)}
                    onFocus={() => {
                        if (isNewProduct && productData.name.trim().length >= 2 && globalProductSuggestions.length > 0) {
                            setShowGlobalSuggestions(true);
                        }
                    }}
                />
                {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
                {isNewProduct && showGlobalSuggestions && globalProductSuggestions.length > 0 && (
                    <ul className="absolute z-20 w-full bg-neutral-gray-800 border border-neutral-gray-700 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                        {globalProductSuggestions.map((suggestion) => (
                            <li
                                key={suggestion.sku || suggestion.name}
                                className="px-4 py-2 cursor-pointer hover:bg-action-blue-light hover:text-white text-neutral-light border-b border-neutral-gray-700 last:border-b-0"
                                onClick={() => {
                                    handleSelectGlobalProduct(suggestion);
                                    setShowGlobalSuggestions(false);
                                }}
                            >
                                <p className="font-semibold">{suggestion.name}</p>
                                <p className="text-xs text-neutral-gray-400">SKU: {suggestion.sku || 'N/A'} - Cat: {suggestion.category || 'N/A'}</p>
                                {suggestion.imageUrl && (
                                    <img src={suggestion.imageUrl} alt="Image of suggestion" className="w-16 h-16 object-cover rounded-md mt-1" />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                {isNewProduct && noGlobalSuggestionsFound && !showGlobalSuggestions && productData.name.trim().length >= 2 && (
                    <p className="text-orange-400 text-sm mt-2 animate-fade-in-down">
                        No hay coincidencias. <span className="text-success-green">¡Estás registrando un nuevo producto!</span>
                    </p>
                )}
            </div>
            <div className="md:col-span-2">
                <label className="block text-neutral-light text-sm font-bold mb-2">Tipo de Producto:</label>
                <div className="flex items-center space-x-4 mb-4">
                    <input
                        type="radio"
                        id="simpleProduct"
                        name="hasVariants"
                        value="false"
                        checked={productData.variants.length === 0}
                        onChange={() => {
                            handleProductInputChange({ target: { name: 'variants', value: [] } });
                        }}
                        className="mr-2 h-4 w-4 text-action-blue rounded focus:ring-action-blue border-neutral-gray-600 bg-neutral-gray-700"
                    />
                    <label htmlFor="simpleProduct" className="text-neutral-light cursor-pointer">Producto Simple (Sin Tallas/Colores)</label>
                </div>
                <div className="flex items-center space-x-4">
                    <input
                        type="radio"
                        id="productWithVariants"
                        name="hasVariants"
                        value="true"
                        checked={productData.variants.length > 0}
                        onChange={() => {
                            if (productData.variants.length === 0) {
                                handleAddVariant();
                            }
                        }}
                        className="mr-2 h-4 w-4 text-action-blue rounded focus:ring-action-blue border-neutral-gray-600 bg-neutral-gray-700"
                    />
                    <label htmlFor="productWithVariants" className="text-neutral-light cursor-pointer">Producto con Variantes (Tallas/Colores)</label>
                </div>
            </div>
            <div>
                <label htmlFor="sku" className="block text-neutral-light text-sm font-bold mb-2">
                    SKU:
                    <span className="relative inline-block ml-2 group">
                        <Info size={16} className="text-action-blue cursor-pointer" />
                        <span className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 w-64 p-2 bg-neutral-gray-800 text-xs text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-normal text-center shadow-lg">
                            Código único para el producto. Si lo dejas vacío, se generará uno automáticamente. Si usas variantes, este SKU será el del producto padre.
                        </span>
                    </span>
                </label>
                <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={isNewProduct && !isMainSkuManuallyEdited ? '' : productData.sku}
                    onChange={handleProductInputChange}
                    placeholder={autoGeneratedSku || 'Ej. CAMI-DEP-AZUL-M'}
                    className={`shadow appearance-none border ${formErrors.sku ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                    disabled={productData.variants.length > 0}
                />
                {formErrors.sku && <p className="text-red-400 text-xs mt-1">{formErrors.sku}</p>}
            </div>
            <div>
                <label htmlFor="category" className="block text-neutral-light text-sm font-bold mb-2">Categoría:</label>
                <input
                    type="text"
                    id="category"
                    name="category"
                    value={productData.category}
                    onChange={handleProductInputChange}
                    className={`shadow appearance-none border ${formErrors.category ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                    placeholder="Ej. Ropa, Electrónica, Alimentos"
                    required
                />
                {formErrors.category && <p className="text-red-400 text-xs mt-1">{formErrors.category}</p>}
            </div>
            <div>
                <label htmlFor="unitOfMeasure" className="block text-neutral-light text-sm font-bold mb-2">Unidad de Medida:</label>
                <select
                    id="unitOfMeasure"
                    name="unitOfMeasure"
                    value={productData.unitOfMeasure}
                    onChange={handleProductInputChange}
                    className={`shadow appearance-none border ${formErrors.unitOfMeasure ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer text-neutral-light`}
                    required={productData.variants.length === 0}
                    disabled={productData.variants.length > 0}
                >
                    {unitOfMeasureOptions.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                    ))}
                </select>
                {formErrors.unitOfMeasure && <p className="text-red-400 text-xs mt-1">{formErrors.unitOfMeasure}</p>}
            </div>
            <div>
                {/* Moneda Base es la moneda de registro interna del producto (ej. USD por defecto) */}
                <label htmlFor="baseCurrency" className="block text-neutral-light text-sm font-bold mb-2">Moneda de Registro Interna:</label>
                <select
                    id="baseCurrency"
                    name="baseCurrency"
                    value={productData.baseCurrency}
                    onChange={handleProductInputChange}
                    className={`shadow appearance-none border ${formErrors.baseCurrency ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer text-neutral-light`}
                    required
                    disabled // Se deshabilita para que el usuario no lo cambie fácilmente, es más técnico
                >
                    {/* Generar opciones dinámicamente */}
                    {availableCurrencies.map(currency => (
                        <option key={currency} value={currency}>{currency} - {currency === 'USD' ? 'Dólar' : currency === 'VES' ? 'Bolívar' : currency === 'EUR' ? 'Euro' : currency}</option>
                    ))}
                </select>
                {formErrors.baseCurrency && <p className="text-red-400 text-xs mt-1">{formErrors.baseCurrency}</p>}
            </div>
            <div>
                {/* Moneda Principal de Visualización en Listas */}
                <label htmlFor="displayCurrency" className="block text-neutral-light text-sm font-bold mb-2">Moneda Principal de Vista:</label>
                <select
                    id="displayCurrency"
                    name="displayCurrency"
                    value={productData.displayCurrency}
                    onChange={handleProductInputChange}
                    className={`shadow appearance-none border ${formErrors.displayCurrency ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer text-neutral-light`}
                    required={productData.variants.length === 0}
                    disabled={productData.variants.length > 0}
                >
                    {/* Generar opciones dinámicamente */}
                    {availableCurrencies.map(currency => (
                        <option key={currency} value={currency}>{currency} - {currency === 'USD' ? 'Dólar' : currency === 'VES' ? 'Bolívar' : currency === 'EUR' ? 'Euro' : currency}</option>
                    ))}
                </select>
                {formErrors.displayCurrency && <p className="text-red-400 text-xs mt-1">{formErrors.displayCurrency}</p>}
            </div>
            <div>
                <label htmlFor="brand" className="block text-neutral-light text-sm font-bold mb-2">Marca (Opcional):</label>
                <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={productData.brand}
                    onChange={handleProductInputChange}
                    className={`shadow appearance-none border ${formErrors.brand ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                    placeholder="Ej. Nike, Samsung"
                />
                {formErrors.brand && <p className="text-red-400 text-xs mt-1">{formErrors.brand}</p>}
            </div>
            <div>
                <label htmlFor="supplier" className="block text-neutral-light text-sm font-bold mb-2">Proveedor (Opcional):</label>
                <input
                    type="text"
                    id="supplier"
                    name="supplier"
                    value={productData.supplier}
                    onChange={handleProductInputChange}
                    className={`shadow appearance-none border ${formErrors.supplier ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                    placeholder="Ej. Distribuciones ABC"
                />
                {formErrors.supplier && <p className="text-red-400 text-xs mt-1">{formErrors.supplier}</p>}
            </div>
            {/* Campo de Precio de Venta con selector de moneda y porcentaje de ganancia */}
            <div className="flex items-end gap-2">
                <div className="flex-grow">
                    <label htmlFor="price" className="block text-neutral-light text-sm font-bold mb-2">Precio para la Venta:</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={calculatedProductPricePlaceholder !== null ? parseFloat(calculatedProductPricePlaceholder).toFixed(2) : ''}
                        onChange={() => {}}
                        step="0.01"
                        className={`shadow appearance-none border ${formErrors.price ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                        placeholder={`Ej. ${formatPrice(calculatedProductPricePlaceholder, productData.saleCurrency || 'USD')}`}
                        required={productData.variants.length === 0}
                        readOnly={true}
                        disabled={productData.variants.length > 0}
                    />
                    {formErrors.price && <p className="text-red-400 text-xs mt-1">{formErrors.price}</p>}
                </div>
                <div className="w-24 flex-shrink-0">
                    <label htmlFor="saleCurrency" className="block text-neutral-light text-sm font-bold mb-2">Moneda:</label>
                    <select
                        id="saleCurrency"
                        name="saleCurrency"
                        value={productData.saleCurrency}
                        onChange={handleProductInputChange}
                        className={`shadow appearance-none border ${formErrors.saleCurrency ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer text-neutral-light`}
                        required={productData.variants.length === 0}
                        disabled={productData.variants.length > 0}
                    >
                        {/* Generar opciones dinámicamente */}
                        {availableCurrencies.map(currency => (
                            <option key={currency} value={currency}>{currency}</option>
                        ))}
                    </select>
                </div>
                <div className="w-24 flex-shrink-0">
                    <label htmlFor="profitPercentage" className="block text-neutral-light text-sm font-bold mb-2">% Ganancia:</label>
                    <input
                        type="number"
                        id="profitPercentage"
                        name="profitPercentage"
                        value={calculatedProductProfitPercentage !== null ? parseFloat(calculatedProductProfitPercentage).toFixed(2) : ''}
                        onChange={handleProductInputChange}
                        step="0.1"
                        min="0"
                        className={`shadow appearance-none border ${formErrors.profitPercentage ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                        placeholder="%"
                        disabled={productData.variants.length > 0}
                    />
                </div>
            </div>
            {/* Campo de Costo Unitario con selector de moneda */}
            <div className="flex items-end gap-2">
                <div className="flex-grow">
                    <label htmlFor="costPrice" className="block text-neutral-light text-sm font-bold mb-2">Costo Unitario del Producto:</label>
                    <input
                        type="number"
                        id="costPrice"
                        name="costPrice"
                        value={productData.costPrice}
                        onChange={handleProductInputChange}
                        step="0.01"
                        className={`shadow appearance-none border ${formErrors.costPrice ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                        placeholder="Ej. 15.00"
                        required={productData.variants.length === 0}
                        disabled={productData.variants.length > 0}
                    />
                    {formErrors.costPrice && <p className="text-red-400 text-xs mt-1">{formErrors.costPrice}</p>}
                </div>
                <div className="w-24 flex-shrink-0">
                    <label htmlFor="costCurrency" className="block text-neutral-light text-sm font-bold mb-2">Moneda:</label>
                    <select
                        id="costCurrency"
                        name="costCurrency"
                        value={productData.costCurrency}
                        onChange={handleProductInputChange}
                        className={`shadow appearance-none border ${formErrors.costCurrency ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer text-neutral-light`}
                        required={productData.variants.length === 0}
                        disabled={productData.variants.length > 0}
                    >
                        {/* Generar opciones dinámicamente */}
                        {availableCurrencies.map(currency => (
                            <option key={currency} value={currency}>{currency}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="stock" className="block text-neutral-light text-sm font-bold mb-2">STOCK:</label>
                <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={productData.stock}
                    onChange={handleProductInputChange}
                    className={`shadow appearance-none border ${formErrors.stock ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                    placeholder="Ej. 100"
                    required={productData.variants.length === 0}
                    disabled={productData.variants.length > 0}
                />
                {formErrors.stock && <p className="text-red-400 text-xs mt-1">{formErrors.stock}</p>}
            </div>
            <div className="md:col-span-2">
                <label htmlFor="description" className="block text-neutral-light text-sm font-bold mb-2">Descripción (Opcional):</label>
                <textarea
                    id="description"
                    name="description"
                    value={productData.description}
                    onChange={handleProductInputChange}
                    className={`shadow appearance-none border ${formErrors.description ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 h-24 text-neutral-light`}
                    placeholder="Descripción detallada del producto..."
                />
                {formErrors.description && <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>}
            </div>

            {/* --- INICIO DE LA SECCIÓN DE OPCIONES AVANZADAS --- */}
            <div className="md:col-span-2 mt-4">
                {productData.variants.length > 0 && (
                    <p className="text-yellow-400 text-sm mb-4">
                        <Info size={16} className="inline-block mr-1" /> Los campos de Precio, Stock, Costo, SKU, Unidad de Medida, Color, Talla/Tamaño y Material del producto principal están deshabilitados porque este producto tiene variantes. Gestiona estos detalles en cada variante.
                    </p>
                )}
                <button
                    type="button"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="w-full bg-neutral-gray-700 hover:bg-neutral-gray-600 text-neutral-light font-bold py-3 px-4 rounded-lg flex items-center justify-between transition duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-gray-500"
                >
                    <span>Opciones Avanzadas</span>
                    {showAdvancedOptions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {showAdvancedOptions && (
                    <div className="mt-4 border border-neutral-gray-700 rounded-lg p-4 bg-dark-charcoal animate-fade-in-down">
                        {/* Atributos del Producto Principal (Color, Talla, Material) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label htmlFor="color" className="block text-neutral-light text-sm font-bold mb-2">Color (Producto Principal - Opcional):</label>
                                <input
                                    type="text"
                                    id="color"
                                    name="color"
                                    value={productData.color}
                                    onChange={handleProductInputChange}
                                    className={`shadow appearance-none border ${formErrors.color ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                                    placeholder="Ej. Azul, Negro"
                                    disabled={productData.variants.length > 0}
                                />
                                {formErrors.color && <p className="text-red-400 text-xs mt-1">{formErrors.color}</p>}
                            </div>
                            <div>
                                <label htmlFor="size" className="block text-neutral-light text-sm font-bold mb-2">Talla/Tamaño (Producto Principal - Opcional):</label>
                                <input
                                    type="text"
                                    id="size"
                                    name="size"
                                    value={productData.size}
                                    onChange={handleProductInputChange}
                                    className={`shadow appearance-none border ${formErrors.size ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                                    placeholder="Ej. S, L, XL, 32GB"
                                    disabled={productData.variants.length > 0}
                                />
                                {formErrors.size && <p className="text-red-400 text-xs mt-1">{formErrors.size}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="material" className="block text-neutral-light text-sm font-bold mb-2">Material (Opcional):</label>
                                <input
                                    type="text"
                                    id="material"
                                    name="material"
                                    value={productData.material}
                                    onChange={handleProductInputChange}
                                    className={`shadow appearance-none border ${formErrors.material ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                                    placeholder="Ej. Algodón, Plástico, Metal"
                                    disabled={productData.variants.length > 0}
                                />
                                {formErrors.material && <p className="text-red-400 text-xs mt-1">{formErrors.material}</p>}
                            </div>
                        </div>

                        {/* --- NUEVOS CAMPOS DE STOCK/PERECEDEROS PARA PRODUCTO PRINCIPAL --- */}
                        <div className="mb-6 border-t border-neutral-gray-700 pt-6 mt-6">
                            <h4 className="text-xl font-semibold text-neutral-light mb-3">Gestión de Stock Avanzada (Producto Principal):</h4>
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    id="isPerishable"
                                    name="isPerishable"
                                    checked={productData.isPerishable}
                                    onChange={handleProductInputChange}
                                    className="mr-2 h-5 w-5 text-action-blue rounded focus:ring-action-blue border-neutral-gray-600 bg-neutral-gray-700"
                                    disabled={productData.variants.length > 0}
                                />
                                <label htmlFor="isPerishable" className="text-neutral-light text-base font-bold">¿Es Perecedero?</label>
                            </div>

                            <div>
                                <label htmlFor="reorderThreshold" className="block text-neutral-light text-sm font-bold mb-2">
                                    Umbral de Reaprovisionamiento:
                                    <span className="relative inline-block ml-2 group">
                                        <Info size={16} className="text-action-blue cursor-pointer" />
                                        <span className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 w-64 p-2 bg-neutral-gray-800 text-xs text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-normal text-center shadow-lg">
                                            El stock mínimo de este producto/variante para generar una alerta de "Stock Bajo".
                                        </span>
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    id="reorderThreshold"
                                    name="reorderThreshold"
                                    value={productData.reorderThreshold}
                                    onChange={handleProductInputChange}
                                    className={`shadow appearance-none border ${formErrors.reorderThreshold ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                                    placeholder="Ej. 10 (unidades para alertar stock bajo)"
                                    disabled={productData.variants.length > 0}
                                />
                                {formErrors.reorderThreshold && <p className="text-red-400 text-xs mt-1">{formErrors.reorderThreshold}</p>}
                            </div>

                            {productData.isPerishable && (
                                <>
                                    <div className="mt-4">
                                        <label htmlFor="optimalMaxStock" className="block text-neutral-light text-sm font-bold mb-2">Stock Óptimo Máximo (Perecedero):</label>
                                        <input
                                            type="number"
                                            id="optimalMaxStock"
                                            name="optimalMaxStock"
                                            value={productData.optimalMaxStock}
                                            onChange={handleProductInputChange}
                                            className={`shadow appearance-none border ${formErrors.optimalMaxStock ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                                            placeholder="Ej. 50 (unidades para evitar excesos)"
                                            required={productData.isPerishable && productData.variants.length === 0}
                                            disabled={productData.variants.length > 0}
                                        />
                                        {formErrors.optimalMaxStock && <p className="text-red-400 text-xs mt-1">{formErrors.optimalMaxStock}</p>}
                                    </div>
                                    <div className="mt-4">
                                        <label htmlFor="shelfLifeDays" className="block text-neutral-light text-sm font-bold mb-2">Vida Útil (en días - Perecedero):</label>
                                        <input
                                            type="number"
                                            id="shelfLifeDays"
                                            name="shelfLifeDays"
                                            value={productData.shelfLifeDays}
                                            onChange={handleProductInputChange}
                                            className={`shadow appearance-none border ${formErrors.shelfLifeDays ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                                            placeholder="Ej. 30 (días hasta caducidad)"
                                            required={productData.isPerishable && productData.variants.length === 0}
                                            disabled={productData.variants.length > 0}
                                        />
                                        {formErrors.shelfLifeDays && <p className="text-red-400 text-xs mt-1">{formErrors.shelfLifeDays}</p>}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Sección para carga o URL de imagen principal del producto */}
                        <div className="mb-6">
                            <h4 className="text-xl font-semibold text-neutral-light mb-3">Imagen Principal del Producto (Opcional):</h4>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col">
                                    <label htmlFor="imageFile" className="block text-neutral-light text-sm font-bold mb-2 cursor-pointer bg-neutral-gray-600 hover:bg-neutral-gray-700 py-2 px-4 rounded-lg text-center flex items-center justify-center transition duration-200">
                                        {isUploadingMainImage ? <Loader2 size={20} className="mr-2 animate-spin" /> : <Upload size={20} className="mr-2"/>} Cargar Imagen desde mi Dispositivo
                                    </label>
                                    <input
                                        type="file"
                                        id="imageFile"
                                        name="imageFile"
                                        accept="image/*"
                                        onChange={handleMainImageFileChange}
                                        className="hidden"
                                    />
                                    {imageFile && (
                                        <p className="text-neutral-gray-400 text-sm mt-2">Archivo seleccionado: <span className="font-semibold">{imageFile.name}</span></p>
                                    )}
                                </div>

                                <div className="text-neutral-gray-400 text-center text-sm my-2">O</div>

                                <div>
                                    <label htmlFor="imageUrl" className="block text-neutral-light text-sm font-bold mb-2">
                                        Pega la URL de una Imagen Externa:
                                        <span className="relative inline-block ml-2 group">
                                            <Info size={16} className="text-action-blue cursor-pointer" />
                                            <span className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 w-72 p-2 bg-neutral-gray-800 text-xs text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-normal text-center shadow-lg">
                                                Pega aquí la URL de la imagen principal de tu producto.
                                                Si cargas un archivo, esta URL será ignorada.
                                            </span>
                                        </span>
                                    </label>
                                    <input
                                        type="url"
                                        id="imageUrl"
                                        name="imageUrl"
                                        value={productData.imageUrl}
                                        onChange={handleProductInputChange}
                                        onBlur={handleMainImageUrlBlur}
                                        className={`shadow appearance-none border ${formErrors.imageUrl ? 'border-red-500' : 'border-neutral-gray-700'} rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light`}
                                        placeholder="Ej. https://tuservicio.com/imagen.jpg"
                                    />
                                    {formErrors.imageUrl && <p className="text-red-400 text-xs mt-1">{formErrors.imageUrl}</p>}
                                </div>

                                {(imagePreviewUrl || productData.imageUrl) ? (
                                    <div className="mt-4 border border-neutral-gray-600 rounded-lg p-2 text-center bg-neutral-gray-800">
                                        <p className="text-neutral-gray-400 text-sm mb-2">Previsualización:</p>
                                        <img
                                            src={imagePreviewUrl || productData.imageUrl}
                                            alt="Previsualización del producto"
                                            className="max-w-full h-auto max-h-48 object-contain mx-auto rounded-md"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/600x400/2D3748/F8F8F2?text=Error+Cargando+Imagen';
                                                e.target.classList.add('border-red-500', 'border-2');
                                            }}
                                        />
                                        <p className="text-orange-400 text-xs mt-1">Si la imagen no carga, la URL puede ser incorrecta o el archivo no es válido.</p>
                                    </div>
                                ) : (
                                    <div className="mt-4 border border-neutral-gray-600 rounded-lg p-2 text-center bg-neutral-gray-800 text-neutral-gray-400 text-sm py-8">
                                        No hay imagen para previsualizar.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sección para Gestión de Variantes */}
                        <div className="mt-6 border-t border-neutral-gray-700 pt-6">
                            <h4 className="text-xl font-semibold text-neutral-light mb-4">Gestión de Variantes de Producto:</h4>
                            <p className="text-neutral-gray-300 text-sm mb-4">Define diferentes versiones de tu producto (ej. tallas, colores, materiales). Cada variante tendrá su propio SKU, precio, costo y stock.</p>

                            {productData.variants.map((variant, index) => (
                                <React.Suspense key={variant._id || index} fallback={
                                    <div className="bg-neutral-gray-800 p-4 rounded-lg mb-4 border border-neutral-gray-700 animate-pulse h-64"></div>
                                }>
                                    <VariantForm
                                        variant={variant}
                                        index={index}
                                        handleVariantInputChange={handleVariantInputChange}
                                        removeVariant={handleRemoveVariant}
                                        unitOfMeasureOptions={unitOfMeasureOptions}
                                        handleVariantImageFileChange={handleVariantImageFileChange}
                                        variantImageUploading={variantImageUploading}
                                        formErrors={formErrors}
                                        uploadImageToCloud={uploadImageToCloud}
                                        isNewProduct={isNewProduct}
                                        // NUEVAS PROPS PARA EL PORCENTAJE DINÁMICO (¡TIENEN QUE ESTAR AQUÍ!)
                                        calculatedVariantProfitPercentage={calculatedVariantProfitPercentage[index]}
                                        calculatedVariantPricePlaceholder={calculatedVariantPricePlaceholder[index]}
                                        formatPrice={formatPrice}
                                        convertPrice={convertPrice}
                                        exchangeRate={exchangeRate}
                                        // ¡NUEVA PROP! Pasamos la lista de monedas
                                        availableCurrencies={availableCurrencies} 
                                    />
                                </React.Suspense>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddVariant}
                                className="w-full bg-success-green hover:bg-green-700 text-deep-night-blue font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 mt-4"
                            >
                                <Plus size={20} className="mr-2" /> Añadir Variante
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* --- FIN DE LA SECCIÓN DE OPCIONES AVANZADAS --- */}

            {/* Botón de Envío del Formulario */}
            <div className="md:col-span-2 text-right">
                <button
                    type="submit"
                    className="bg-copper-rose-accent hover:bg-rose-700 text-deep-night-blue font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center float-right"
                    disabled={loading || isUploadingMainImage || Object.values(variantImageUploading).some(val => val)}
                >
                    {loading ? <Loader2 size={20} className="mr-2 animate-spin" /> : <Save size={20} className="mr-2" />} {isNewProduct ? 'Guardar Producto' : 'Actualizar Producto'}
                </button>
            </div>
        </form>
    );
};

export default AddEditProductForm;