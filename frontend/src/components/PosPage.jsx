// C:\Proyectos\Label\frontend\src\components\PosPage.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useReduxCurrency } from '../hooks/useReduxCurrency';
import { useReduxNotification } from '../hooks/useReduxNotification';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { useReduxTheme } from '../hooks/useReduxTheme';
import ErrorBoundary from "./Common/ErrorBoundary";

// Importaciones perezosas de los nuevos componentes
const ProductSelectItem = lazy(() => import('./Pos/ProductSelectItem'));
const SaleCartPanel = lazy(() => import('./Pos/SaleCartPanel'));
const PaymentSection = lazy(() => import('./Pos/PaymentSection'));
const VariantSelectModal = lazy(() => import('./Pos/VariantSelectModal')); // Para la selección de variantes
const WeightInputModal = lazy(() => import('./Pos/WeightInputModal')); // Para el peso digital

function PosPage() {
  // Estados principales (ya no se guarda todo el inventario)
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Resultados de búsqueda filtrados localmente
  const [saleItems, setSaleItems] = useState(() => {
    const saved = localStorage.getItem('posCartItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false); // <-- Estado de loading del PosPage
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stockWarning, setStockWarning] = useState('');
  const stockTimeoutRef = useRef(null);

  // Helper optimizado para mostrar mensaje de stock
  const showStockWarning = useCallback((productName, variantName, availableStock) => {
    if (stockTimeoutRef.current) return; // Ya hay un mensaje activo
    
    const message = `Stock insuficiente para ${productName}${variantName ? ` (${variantName})` : ''}. Disponible: ${availableStock}`;
    setStockWarning(message);
    
    stockTimeoutRef.current = setTimeout(() => {
      setStockWarning('');
      stockTimeoutRef.current = null;
    }, 2000);
  }, []);

  // Helper para limpiar mensaje si no hay timeout activo
  const clearStockWarning = useCallback(() => {
    if (!stockTimeoutRef.current) {
      setStockWarning('');
    }
  }, []);


  // Estados para modales de selección de variante y peso digital
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState(null); // Producto que se va a vender por variante
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [selectedProductForWeight, setSelectedProductForWeight] = useState(null); // Producto que se va a pesar

  const searchInputRef = useRef(null); // Ref para enfocar el campo de búsqueda

  // Usa el contexto de moneda y tema
  const { exchangeRate, loadingCurrency, currencyError, fetchExchangeRate, convertPrice, formatPrice } = useReduxCurrency();
  const { theme } = useReduxTheme();
  const location = useLocation();

  // --- NUEVO: Debounce del término de búsqueda para no sobrecargar el servidor ---
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms de espera

  // --- MODIFICADO: Busca productos en el servidor o carga todos si no hay término ---
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

  // --- NUEVO: useEffect para disparar la búsqueda con debounce ---
  useEffect(() => {
    searchProductsOnServer(debouncedSearchTerm);
  }, [debouncedSearchTerm, searchProductsOnServer]);

  // --- Cargar productos iniciales al montar el componente ---
  useEffect(() => {
    searchProductsOnServer('');
  }, [searchProductsOnServer]);

  // --- Calcular el total de la venta cada vez que cambian los items en el carrito ---
  useEffect(() => {
    const calculateTotal = saleItems.reduce(
      (acc, item) => acc + item.quantity * item.priceAtSale,
      0
    );
    setTotalAmount(calculateTotal);
    // Guardar en localStorage
    localStorage.setItem('posCartItems', JSON.stringify(saleItems));
  }, [saleItems]);

  // Función global para mostrar mensajes
  const { showNotification } = useReduxNotification();
  const { t } = useTranslation();
  const displayMessage = useCallback((msg, type) => {
    showNotification(msg, type);
  }, [showNotification]);

  // --- Función principal para añadir producto (o abrir modal) al carrito de venta ---
  const addProductToSale = useCallback((productToAdd, selectedVariant = null, measuredQuantity = null) => {
    setSuccessMessage('');
    setError('');

    // Determinar el producto/variante real y su stock/precio
    let itemToAdd = { ...productToAdd };
    let itemStock = productToAdd.displayStock; // Stock que se muestra
    let itemPrice = productToAdd.displayPrice; // Precio que se muestra
    let variantId = undefined; // ID de la variante si aplica

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

    // Verificar stock antes de proceder
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

    // Si es un producto que se vende por peso y no se ha medido aún
    if (['kg', 'litro', 'metro'].includes(itemToAdd.unitOfMeasure) && measuredQuantity === null) {
      setSelectedProductForWeight(itemToAdd);
      setShowWeightModal(true);
      return;
    }

    // Si es un producto con variantes y no se ha seleccionado una variante
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
    searchInputRef.current.focus();
    setShowVariantModal(false);
    setSelectedProductForVariant(null);
    setShowWeightModal(false);
    setSelectedProductForWeight(null);
  }, [saleItems, displayMessage]);


  // --- Ajustar cantidad de un producto en el carrito ---
  const adjustQuantity = useCallback((itemIndex, delta) => {
    setSuccessMessage('');
    setError('');
    setSaleItems(
      saleItems
        .map((item, index) => {
          if (index === itemIndex) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null; // Eliminar si la cantidad es 0 o menos

            // Obtener el stock real del producto o variante
            const originalProduct = item.product; // El producto ya está en el item del carrito
            let availableStock = originalProduct.displayStock; // Stock del producto principal

            if (item.variantId && originalProduct?.variants) {
              const variant = originalProduct.variants.find(v => v._id === item.variantId);
              if (variant) availableStock = variant.stock; // Usar stock de la variante
            }


            if (delta > 0 && newQuantity > availableStock) {
              showStockWarning(item.product.productName, item.product.variantName, availableStock);
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) // Eliminar items que retornaron null
    );
  }, [saleItems]); // No más dependencia de `products`

  // --- Eliminar producto del carrito ---
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

  // Loader global para carga inicial de productos
  const isLoadingGlobal = loadingCurrency; // El loading principal ahora es solo para la moneda

  useEffect(() => {
    showNotification(`Bienvenido al POS ${Math.random()}`, "info");
  }, [showNotification, location.pathname]);

  // Cleanup del timeout al desmontar
  useEffect(() => {
    return () => {
      if (stockTimeoutRef.current) {
        clearTimeout(stockTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mensaje de error destacado */}
        {error && (
          <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">¡Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-700 bg-opacity-30 border border-green-500 text-green-300 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">¡Éxito!</strong>
            <span className="block sm:inline ml-2">{successMessage}</span>
          </div>
        )}
        {currencyError && (
          <div className="bg-sky-700 bg-opacity-20 border border-sky-400 text-sky-300 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">¡Alerta de Moneda!</strong>
            <span className="block sm:inline ml-2">{currencyError} Si tienes un perfil nuevo, configura la tasa del día en Ajustes.</span>
          </div>
        )}

        {/* Loader global */}
        {isLoadingGlobal ? (
          <div className="w-full flex justify-center items-center h-64">
            <span className="animate-spin text-action-blue text-3xl">Cargando...</span>
          </div>
        ) : (
          <>
            {/* Columna de Búsqueda de Productos y Resultados */}
            <div className="flex-1 p-6 rounded-xl shadow-xl flex flex-col min-h-0 bg-surface border border-surface-secondary">
              <div style={{marginBottom: '16px'}}>
                <div className="flex items-center gap-3">
                  <div className="relative w-full max-w-md">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Buscar producto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface-secondary text-text-base border border-surface-secondary rounded-lg outline-none text-base transition-all duration-200 shadow-sm focus:shadow-md focus:-translate-y-px"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                    </div>
                  </div>
                  {useMemo(() => stockWarning && (
                    <div className="text-sm text-orange-400 bg-orange-900/20 px-3 py-2 rounded-md border border-orange-500/30 animate-pulse whitespace-nowrap">
                      {stockWarning}
                    </div>
                  ), [stockWarning])}
                </div>
              </div>
              
              {searchTerm.length > 0 && searchTerm.length < 2 && (
                <div style={{marginBottom: '16px'}}>
                  <p className="text-text-muted">Escribe al menos 2 caracteres para buscar</p>
                </div>
              )}
              
              {searchTerm.length >= 2 && loading && (
                <div style={{marginBottom: '16px'}}>
                  <p className="text-primary">Buscando productos...</p>
                </div>
              )}
              
              {!loading && searchResults.length === 0 && (
                <div style={{marginBottom: '16px'}}>
                  <p className="text-text-muted">{searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}</p>
                </div>
              )}
              
              <div className="flex-1 rounded-xl p-4 overflow-y-auto min-h-96 shadow-inner bg-surface-secondary border border-surface-secondary">
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {searchResults.map((product) => (
                      <Suspense key={product._id} fallback={<div className="bg-surface p-3 rounded-lg shadow h-28 animate-pulse"></div>}>
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
                ) : (
                  <div></div>
                )}
              </div>
            </div>

            {/* Columna del Carrito de Venta y Pago */}
            <div className="lg:w-1/3 p-6 rounded-xl shadow-xl flex flex-col bg-surface border border-surface-secondary">
              <Suspense fallback={<div className="h-48 bg-surface-secondary rounded-lg animate-pulse mb-6"></div>}>
                <PaymentSection
                  totalAmount={totalAmount}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  handleProcessSale={handleProcessSale}
                  loading={loading}
                  saleItemsLength={saleItems.length}
                  formatPrice={formatPrice}
                  convertPrice={convertPrice}
                  exchangeRate={exchangeRate}
                />
              </Suspense>
              <h3 className="text-xl font-semibold text-text-base my-4">Carrito</h3>
              <Suspense fallback={<div className="flex-1 overflow-y-auto pr-2 h-64 bg-surface-secondary rounded-lg animate-pulse"></div>}>
                <SaleCartPanel
                  saleItems={saleItems}
                  adjustQuantity={adjustQuantity}
                  removeItemFromSale={removeItemFromSale}
                  formatPrice={formatPrice}
                  convertPrice={convertPrice}
                  exchangeRate={exchangeRate}
                />
              </Suspense>
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
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default PosPage;