// C:\Proyectos\Label\frontend\src\components\PosPage.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useReduxCurrency } from '../hooks/useReduxCurrency';
import { useReduxNotification } from '../hooks/useReduxNotification';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { useReduxTheme } from '../hooks/useReduxTheme';
import { FaDollarSign, FaExchangeAlt } from 'react-icons/fa';
import ErrorBoundary from "./Common/ErrorBoundary";

// Importaciones perezosas de los nuevos componentes
const ProductSelectItem = lazy(() => import('./Pos/ProductSelectItem'));
const SaleCartPanel = lazy(() => import('./Pos/SaleCartPanel'));
const PaymentSection = lazy(() => import('./Pos/PaymentSection'));
const VariantSelectModal = lazy(() => import('./Pos/VariantSelectModal')); // Para la selección de variantes
const WeightInputModal = lazy(() => import('./Pos/WeightInputModal')); // Para el peso digital

function PosPage() {
  // Estados principales
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [saleItems, setSaleItems] = useState(() => {
    const saved = localStorage.getItem('posCartItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stockWarning, setStockWarning] = useState('');
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState(null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [selectedProductForWeight, setSelectedProductForWeight] = useState(null);
  
  // Refs
  const stockTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  // Hooks de contexto
  const { exchangeRate, loadingCurrency, currencyError, fetchExchangeRate, convertPrice, formatPrice } = useReduxCurrency();
  const { theme } = useReduxTheme();
  const location = useLocation();
  const { showNotification } = useReduxNotification();
  const { t } = useTranslation();
  
  // Debounce
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Callbacks
  const displayMessage = useCallback((msg, type) => {
    showNotification(msg, type);
  }, [showNotification]);

  const showStockWarning = useCallback((productName, variantName, availableStock) => {
    if (stockTimeoutRef.current) return;
    
    const message = `Stock insuficiente para ${productName}${variantName ? ` (${variantName})` : ''}. Disponible: ${availableStock}`;
    setStockWarning(message);
    
    stockTimeoutRef.current = setTimeout(() => {
      setStockWarning('');
      stockTimeoutRef.current = null;
    }, 2000);
  }, []);

  const clearStockWarning = useCallback(() => {
    if (!stockTimeoutRef.current) {
      setStockWarning('');
    }
  }, []);

  const searchProductsOnServer = useCallback(async (term) => {
    setLoading(true);
    setError('');
    try {
      const endpoint = term && term.length >= 2 
        ? `/products?searchTerm=${term}&limit=50`
        : `/products?limit=50&sortBy=createdAt&sortOrder=desc`;
      
      const response = await axiosInstance.get(endpoint);
      setSearchResults(response.data.products.map(p => ({
          ...p,
          displayStock: p.variants && p.variants.length > 0 ? p.totalStock : p.stock,
          displayPrice: p.variants && p.variants.length > 0 ? p.variants[0]?.price || p.price : p.price
      })));
    } catch (err) {
      console.error('Error al cargar productos para el POS:', err);
      setError('Error al cargar productos para el POS.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    searchProductsOnServer(debouncedSearchTerm);
  }, [debouncedSearchTerm, searchProductsOnServer]);

  useEffect(() => {
    searchProductsOnServer('');
  }, [searchProductsOnServer]);

  useEffect(() => {
    const calculateTotal = saleItems.reduce(
      (acc, item) => acc + item.quantity * item.priceAtSale,
      0
    );
    setTotalAmount(calculateTotal);
    localStorage.setItem('posCartItems', JSON.stringify(saleItems));
  }, [saleItems]);

  const addProductToSale = useCallback((productToAdd, selectedVariant = null, measuredQuantity = null) => {
    setSuccessMessage('');
    setError('');

    let itemToAdd = { ...productToAdd };
    let itemStock = productToAdd.displayStock;
    let itemPrice = productToAdd.displayPrice;
    let variantId = undefined;

    if (selectedVariant) {
      itemToAdd = {
        ...productToAdd,
        ...selectedVariant,
        _id: productToAdd._id,
        productName: productToAdd.name,
        variantName: selectedVariant.name,
      };
      itemStock = selectedVariant.stock;
      itemPrice = selectedVariant.price;
      variantId = selectedVariant._id;
    } else {
      itemToAdd = { ...productToAdd, productName: productToAdd.name, variantName: null };
    }

    const existingItemIndex = saleItems.findIndex(
      (item) => item.product._id === itemToAdd._id && (item.variantId === variantId || (!item.variantId && !variantId))
    );
    
    let quantityToAdd = measuredQuantity !== null ? measuredQuantity : 1;
    const currentQuantityInCart = existingItemIndex !== -1 ? saleItems[existingItemIndex].quantity : 0;
    const totalQuantityAfterAdd = currentQuantityInCart + quantityToAdd;
    
    if (totalQuantityAfterAdd > itemStock) {
      showStockWarning(itemToAdd.productName, itemToAdd.variantName, itemStock);
      return;
    }
    
    clearStockWarning();

    if (['kg', 'litro', 'metro'].includes(itemToAdd.unitOfMeasure) && measuredQuantity === null) {
      setSelectedProductForWeight(itemToAdd);
      setShowWeightModal(true);
      return;
    }

    if (itemToAdd.variants && itemToAdd.variants.length > 0 && !selectedVariant) {
        setSelectedProductForVariant(itemToAdd);
        setShowVariantModal(true);
        return;
    }

    if (existingItemIndex !== -1) {
      setSaleItems(
        saleItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: totalQuantityAfterAdd }
            : item
        )
      );
    } else {
      setSaleItems([
        ...saleItems,
        {
          product: itemToAdd,
          quantity: quantityToAdd,
          priceAtSale: itemPrice,
          variantId: variantId,
        },
      ]);
    }
    setSearchTerm('');
    searchInputRef.current?.focus();
    setShowVariantModal(false);
    setSelectedProductForVariant(null);
    setShowWeightModal(false);
    setSelectedProductForWeight(null);
  }, [saleItems, showStockWarning, clearStockWarning]);


  const adjustQuantity = useCallback((itemIndex, delta) => {
    setSuccessMessage('');
    setError('');
    setSaleItems(
      saleItems
        .map((item, index) => {
          if (index === itemIndex) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;

            const originalProduct = item.product;
            let availableStock = originalProduct.displayStock;

            if (item.variantId && originalProduct?.variants) {
              const variant = originalProduct.variants.find(v => v._id === item.variantId);
              if (variant) availableStock = variant.stock;
            }

            if (delta > 0 && newQuantity > availableStock) {
              showStockWarning(item.product.productName, item.product.variantName, availableStock);
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean)
    );
  }, [saleItems, showStockWarning]);

  const removeItemFromSale = useCallback((itemIndex) => {
    setSuccessMessage('');
    setError('');
    setSaleItems(saleItems.filter((_, index) => index !== itemIndex));
  }, [saleItems]);

  // --- Procesar la venta ---
  const handleProcessSale = async () => {
    setError('');
    setSuccessMessage('');
    if (saleItems.length === 0) {
      setError('El carrito de venta está vacío.');
      return;
    }

    const saleData = {
      productsSold: saleItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        variantId: item.variantId, // Incluir ID de variante si aplica
      })),
      totalAmount, // Incluir totalAmount, aunque el backend lo recalcule por seguridad
      paymentMethod,
      customerName,
    };

    setLoading(true);
    try {
      const response = await axiosInstance.post('/sales', saleData);
      setSuccessMessage(`Venta registrada con éxito. Total: ${formatPrice(response.data.sale.totalAmount, exchangeRate?.fromCurrency || 'USD')}`);
      // Limpiar el carrito y el formulario
      setSaleItems([]);
      localStorage.removeItem('posCartItems');
      setSearchTerm('');
      setCustomerName('');
      setPaymentMethod('cash');
      setSearchResults([]);
      searchInputRef.current.focus();
    } catch (err) {
      console.error('Error al procesar la venta:', err);
      const errorMessage = err.response?.data?.message || 'Error al procesar la venta.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    showNotification(`Bienvenido al POS ${Math.random()}`, "info");
  }, [showNotification, location.pathname]);

  useEffect(() => {
    return () => {
      if (stockTimeoutRef.current) {
        clearTimeout(stockTimeoutRef.current);
      }
    };
  }, []);

  const isLoadingGlobal = loadingCurrency;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background p-4">
        {/* Header con título moderno */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Punto de Venta
              </h1>
              <p className="text-text-muted">Sistema de ventas inteligente</p>
            </div>
          </div>
        </div>

        {/* Mensajes de estado con diseño moderno */}
        <div className="space-y-3 mb-6">
          {error && (
            <div className="bg-error/10 border border-error/30 text-error px-6 py-4 rounded-2xl backdrop-blur-sm shadow-lg" role="alert">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-error rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <strong className="font-semibold">Error</strong>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          {successMessage && (
            <div className="bg-success/10 border border-success/30 text-success px-6 py-4 rounded-2xl backdrop-blur-sm shadow-lg" role="alert">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <strong className="font-semibold">¡Éxito!</strong>
                  <p className="text-sm mt-1">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
          {currencyError && (
            <div className="bg-warning/10 border border-warning/30 text-warning px-6 py-4 rounded-2xl backdrop-blur-sm shadow-lg" role="alert">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <strong className="font-semibold">Alerta de Moneda</strong>
                  <p className="text-sm mt-1">{currencyError} Si tienes un perfil nuevo, configura la tasa del día en Ajustes.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loader global */}
        {isLoadingGlobal ? (
          <div className="flex justify-center items-center h-96">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Panel de Productos - Más ancho */}
            <div className="xl:col-span-2">
              <div className="bg-surface backdrop-blur-xl rounded-3xl shadow-2xl border border-surface-secondary p-6 h-full">
                {/* Barra de búsqueda moderna */}
                <div className="mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-2xl">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Buscar productos por nombre, categoría o código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-surface-secondary text-text-base border-2 border-surface-secondary rounded-2xl outline-none text-lg transition-all duration-300 focus:border-primary focus:bg-surface focus:shadow-lg focus:scale-[1.02] placeholder-text-muted"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.35-4.35"></path>
                        </svg>
                      </div>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-base transition-colors"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                    {useMemo(() => stockWarning && (
                      <div className="bg-warning/20 border border-warning/50 text-warning px-4 py-3 rounded-xl backdrop-blur-sm animate-pulse whitespace-nowrap shadow-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="text-sm font-medium">{stockWarning}</span>
                        </div>
                      </div>
                    ), [stockWarning])}
                  </div>
                </div>
                
                {/* Estados de búsqueda */}
                {searchTerm.length > 0 && searchTerm.length < 2 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <p className="text-text-muted text-lg">Escribe al menos 2 caracteres para buscar</p>
                  </div>
                )}
                
                {searchTerm.length >= 2 && loading && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-primary text-lg font-medium">Buscando productos...</p>
                  </div>
                )}
                
                {!loading && searchResults.length === 0 && searchTerm && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-text-base mb-2">No se encontraron productos</h3>
                    <p className="text-text-muted">Intenta con otros términos de búsqueda</p>
                  </div>
                )}
                
                {/* Grid de productos */}
                <div className="bg-surface-secondary/50 rounded-2xl p-4 min-h-[500px] overflow-y-auto">
                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {searchResults.map((product) => (
                        <Suspense key={product._id} fallback={
                          <div className="bg-surface p-4 rounded-xl shadow-sm h-32 animate-pulse border border-surface-secondary"></div>
                        }>
                          <ProductSelectItem
                            product={product}
                            onClick={() => {}}
                            onAddClick={() => addProductToSale(product)}
                            formatPrice={formatPrice}
                            convertPrice={convertPrice}
                            exchangeRate={exchangeRate}
                          />
                        </Suspense>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel del Carrito - Más compacto */}
            <div className="xl:col-span-1">
              <div className="bg-surface backdrop-blur-xl rounded-3xl shadow-2xl border border-surface-secondary p-6 h-full flex flex-col">
                {/* Total destacado */}
                <div className="bg-primary/10 backdrop-blur-sm rounded-2xl p-6 border border-surface-secondary shadow-xl mb-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-text-muted mb-2">Total a Pagar</p>
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center shadow-lg">
                        <FaDollarSign size={20} className="text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-success">
                          {formatPrice(totalAmount, exchangeRate?.fromCurrency || 'USD')}
                        </p>
                        {exchangeRate?.fromCurrency !== exchangeRate?.toCurrency && exchangeRate && (
                          <p className="text-lg font-semibold text-secondary flex items-center justify-end gap-1">
                            <FaExchangeAlt size={14} />
                            {formatPrice(convertPrice(totalAmount, exchangeRate.fromCurrency, exchangeRate.toCurrency), exchangeRate.toCurrency)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-text-base">Carrito de Compras</h3>
                  {saleItems.length > 0 && (
                    <span className="bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
                      {saleItems.length}
                    </span>
                  )}
                </div>
                
                <Suspense fallback={<div className="flex-1 bg-surface-secondary rounded-2xl animate-pulse mb-6"></div>}>
                  <SaleCartPanel
                    saleItems={saleItems}
                    adjustQuantity={adjustQuantity}
                    removeItemFromSale={removeItemFromSale}
                    formatPrice={formatPrice}
                    convertPrice={convertPrice}
                    exchangeRate={exchangeRate}
                  />
                </Suspense>
                
                {/* Resto de PaymentSection sin el total */}
                <div className="space-y-6 mt-auto">
                  {/* Método de pago */}
                  <div>
                    <label className="block text-text-base text-sm font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Método de Pago
                    </label>
                    <div className="relative">
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-surface-secondary backdrop-blur-sm text-text-base border-2 border-surface-secondary rounded-xl outline-none text-base transition-all duration-300 focus:border-primary focus:bg-surface focus:shadow-lg appearance-none cursor-pointer"
                      >
                        <option value="cash">💵 Efectivo</option>
                        <option value="card">💳 Tarjeta</option>
                        <option value="transfer">🏦 Transferencia</option>
                        <option value="mobile-payment">📱 Pago Móvil</option>
                        <option value="credit">📋 Crédito</option>
                        <option value="other">💰 Otro</option>
                      </select>
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">
                        {paymentMethod === 'cash' ? '💵' : paymentMethod === 'card' ? '💳' : paymentMethod === 'transfer' ? '🏦' : paymentMethod === 'mobile-payment' ? '📱' : paymentMethod === 'credit' ? '📋' : '💰'}
                      </div>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Nombre del cliente */}
                  <div>
                    <label className="block text-text-base text-sm font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Cliente (Opcional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nombre del cliente..."
                        className="w-full pl-12 pr-4 py-4 bg-surface-secondary backdrop-blur-sm text-text-base border-2 border-surface-secondary rounded-xl outline-none text-base transition-all duration-300 focus:border-primary focus:bg-surface focus:shadow-lg placeholder-text-muted"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Botón de procesar venta */}
                  <button
                    onClick={handleProcessSale}
                    disabled={loading || saleItems.length === 0}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform shadow-xl ${
                      loading || saleItems.length === 0
                        ? 'bg-surface-secondary text-text-muted cursor-not-allowed'
                        : 'bg-success hover:bg-success/80 text-white hover:scale-105 hover:shadow-2xl active:scale-95'
                    } flex items-center justify-center gap-3`}
                  >
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <FaDollarSign size={18} />
                        </div>
                        <span>Procesar Venta</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                  
                  {saleItems.length === 0 && (
                    <p className="text-center text-sm text-text-muted mt-2">
                      Agrega productos al carrito para procesar la venta
                    </p>
                  )}
                </div>
                
                {/* Panel de peso digital si aplica */}
                {showWeightModal && selectedProductForWeight && (
                  <div className="mt-6">
                    <Suspense fallback={<div>Cargando peso digital...</div>}>
                      <WeightInputModal
                        isOpen={true}
                        onClose={() => setShowWeightModal(false)}
                        product={selectedProductForWeight}
                        onMeasureAndAdd={(measuredQuantity) => addProductToSale(selectedProductForWeight, null, measuredQuantity)}
                        formatPrice={formatPrice}
                        convertPrice={convertPrice}
                        exchangeRate={exchangeRate}
                        loading={loading}
                      />
                    </Suspense>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modales para selección de variante y peso */}
        <Suspense fallback={<div>Cargando modales...</div>}>
          {showVariantModal && selectedProductForVariant && (
            <VariantSelectModal
              isOpen={showVariantModal}
              onClose={() => setShowVariantModal(false)}
              product={selectedProductForVariant}
              onSelectVariant={(selectedVariant) => addProductToSale(selectedProductForVariant, selectedVariant)}
              formatPrice={formatPrice}
              convertPrice={convertPrice}
              exchangeRate={exchangeRate}
            />
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default PosPage;