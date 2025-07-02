// C:\Proyectos\Label\frontend\src\components\PosPage.jsx
import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useCurrency } from '../context/CurrencyContext';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../hooks/useDebounce';
import ErrorBoundary from "./Common/ErrorBoundary";

// Importaciones perezosas de los nuevos componentes
const ProductSearchPanel = lazy(() => import('./Pos/ProductSearchPanel'));
const SaleCartPanel = lazy(() => import('./Pos/SaleCartPanel'));
const PaymentSection = lazy(() => import('./Pos/PaymentSection'));
const VariantSelectModal = lazy(() => import('./Pos/VariantSelectModal')); // Para la selección de variantes
const WeightInputModal = lazy(() => import('./Pos/WeightInputModal')); // Para el peso digital

function PosPage() {
  // Estados principales (ya no se guarda todo el inventario)
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Resultados de búsqueda filtrados localmente
  const [saleItems, setSaleItems] = useState([]); // Productos en el carrito de venta
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false); // <-- Estado de loading del PosPage
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para modales de selección de variante y peso digital
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState(null); // Producto que se va a vender por variante
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [selectedProductForWeight, setSelectedProductForWeight] = useState(null); // Producto que se va a pesar

  const searchInputRef = useRef(null); // Ref para enfocar el campo de búsqueda

  // Usa el contexto de moneda
  const { exchangeRate, loadingCurrency, currencyError, fetchExchangeRate, convertPrice, formatPrice } = useCurrency(); // <-- ¡NUEVO!

  // --- NUEVO: Debounce del término de búsqueda para no sobrecargar el servidor ---
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms de espera

  // --- MODIFICADO: Busca productos en el servidor en lugar de cargar todo ---
  const searchProductsOnServer = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get(`/products?searchTerm=${term}&limit=50`); // Limitamos a 50 resultados por búsqueda
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

  // --- Calcular el total de la venta cada vez que cambian los items en el carrito ---
  useEffect(() => {
    const calculateTotal = saleItems.reduce(
      (acc, item) => acc + item.quantity * item.priceAtSale, // Usar priceAtSale que es el precio real
      0
    );
    setTotalAmount(calculateTotal);
  }, [saleItems]);

  // Función global para mostrar mensajes
  const { showNotification } = useNotification();
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
      // Para evitar sobreescribir el nombre del producto, creamos un objeto combinado más explícito.
      itemToAdd = {
        ...productToAdd,
        ...selectedVariant,
        _id: productToAdd._id, // Mantenemos el ID del producto padre
        productName: productToAdd.name, // Guardamos explícitamente el nombre del producto
        variantName: selectedVariant.name, // y el nombre de la variante
      };
      itemStock = selectedVariant.stock; // Usar stock de la variante
      itemPrice = selectedVariant.price; // Usar precio de la variante
      variantId = selectedVariant._id;
    } else {
      // Para productos simples, aseguramos que la estructura sea consistente.
      itemToAdd = { ...productToAdd, productName: productToAdd.name, variantName: null };
    }

    // Si es un producto que se vende por peso y no se ha medido aún
    if (['kg', 'litro', 'metro'].includes(itemToAdd.unitOfMeasure) && measuredQuantity === null) {
      setSelectedProductForWeight(itemToAdd);
      setShowWeightModal(true);
      return; // Detener la adición al carrito hasta que se ingrese el peso
    }

    // Si es un producto con variantes y no se ha seleccionado una variante
    if (itemToAdd.variants && itemToAdd.variants.length > 0 && !selectedVariant) {
        setSelectedProductForVariant(itemToAdd);
        setShowVariantModal(true);
        return; // Detener la adición al carrito hasta que se seleccione la variante
    }

    const existingItemIndex = saleItems.findIndex(
      (item) => item.product._id === itemToAdd._id && (item.variantId === variantId || (!item.variantId && !variantId))
    );

    let quantityToAdd = measuredQuantity !== null ? measuredQuantity : 1; // Si hay cantidad medida, usarla

    if (existingItemIndex !== -1) {
      const existingItem = saleItems[existingItemIndex];
      const newQuantity = existingItem.quantity + quantityToAdd;
      if (newQuantity > itemStock) { // Usamos los nombres explícitos para el mensaje de error
        setError(`No hay suficiente stock para ${itemToAdd.productName}${itemToAdd.variantName ? ` (${itemToAdd.variantName})` : ''}. Stock disponible: ${itemStock}`);
        return;
      }
      setSaleItems(
        saleItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } else {
      if (quantityToAdd > itemStock) {
          setError(`No hay suficiente stock para ${itemToAdd.productName}${itemToAdd.variantName ? ` (${itemToAdd.variantName})` : ''}. Stock disponible: ${itemStock}`);
          return;
      }
      setSaleItems([
        ...saleItems,
        {
          product: itemToAdd, // Guarda el objeto completo (producto o variante)
          quantity: quantityToAdd,
          priceAtSale: itemPrice, // El precio que se usará para el cálculo de la venta
          variantId: variantId, // Guarda el ID de la variante si aplica
          // `name` y `unitOfMeasure` se tomarán de `itemToAdd`
        },
      ]);
    }
    setSearchTerm('');
    searchInputRef.current.focus();
    // Cierra modales si estaban abiertos
    setShowVariantModal(false);
    setSelectedProductForVariant(null);
    setShowWeightModal(false);
    setSelectedProductForWeight(null); // No más dependencia de `products`
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
              setError(`No hay suficiente stock para ${item.product.productName}${item.product.variantName ? ` (${item.product.variantName})` : ''}. Stock disponible: ${availableStock}`);
              return item; // No actualizar si excede el stock
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
      setSearchTerm('');
      setCustomerName('');
      setPaymentMethod('cash');
      // Limpiar los resultados de búsqueda, ya no es necesario recargar todo
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
    displayMessage("Bienvenido al POS", "info");
  }, []);

  return (
    <ErrorBoundary>
      <div className="p-6 bg-dark-slate-gray rounded-lg shadow-xl min-h-screen flex flex-col lg:flex-row gap-6">
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
          <div className="bg-orange-700 bg-opacity-30 border border-orange-500 text-orange-300 px-4 py-3 rounded relative mb-6" role="alert">
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
            <div className="flex-1 bg-deep-night-blue p-6 rounded-lg shadow-inner flex flex-col min-h-0">
              <h2 className="text-4xl font-extrabold text-copper-rose-accent mb-8 border-b-2 border-action-blue pb-4">Punto de Venta (POS)</h2>
              <Suspense fallback={<div className="h-48 bg-neutral-gray-700 rounded-lg animate-pulse"></div>}>
                <ProductSearchPanel
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  searchResults={searchResults}
                  loading={loading} // Pasamos el loading de la búsqueda
                  addProductToSale={addProductToSale}
                  searchInputRef={searchInputRef}
                  formatPrice={formatPrice}
                  convertPrice={convertPrice}
                  exchangeRate={exchangeRate}
                />
              </Suspense>
            </div>

            {/* Columna del Carrito de Venta y Pago */}
            <div className="lg:w-1/3 bg-deep-night-blue p-6 rounded-lg shadow-inner flex flex-col">
              <Suspense fallback={<div className="h-48 bg-neutral-gray-700 rounded-lg animate-pulse mb-6"></div>}>
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
              <h3 className="text-3xl font-semibold text-neutral-light my-6 border-b border-neutral-gray-200 pb-3">Carrito</h3>
              <Suspense fallback={<div className="flex-1 overflow-y-auto pr-2 h-64 bg-neutral-gray-700 rounded-lg animate-pulse"></div>}>
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