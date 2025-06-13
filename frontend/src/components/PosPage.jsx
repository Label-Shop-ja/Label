// C:\Proyect// C:\Proyectos\Label\frontend\src\components\PosPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { FaSearch, FaPlusCircle, FaMinusCircle, FaTimesCircle, FaDollarSign } from 'react-icons/fa'; // Iconos

const PosPage = () => {
  const [products, setProducts] = useState([]); // Todos los productos del inventario
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Resultados de búsqueda filtrados localmente
  const [saleItems, setSaleItems] = useState([]); // Productos en el carrito de venta
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const searchInputRef = useRef(null); // Ref para enfocar el campo de búsqueda

  // --- Función para cargar todos los productos del inventario (para POS) ---
  const fetchAllProductsForPOS = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Pedimos un límite muy alto para asegurarnos de obtener todos los productos
      const response = await axiosInstance.get('/products?limit=99999');
      setProducts(response.data.products);
    } catch (err) {
      console.error('Error al cargar productos para el POS:', err);
      setError('Error al cargar productos para el POS.');
      setProducts([]); // Asegurarse de que 'products' sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Cargar todos los productos al inicio del componente ---
  useEffect(() => {
    fetchAllProductsForPOS();
  }, [fetchAllProductsForPOS]);

  // --- Calcular el total de la venta cada vez que cambian los items en el carrito ---
  useEffect(() => {
    const calculateTotal = saleItems.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );
    setTotalAmount(calculateTotal);
  }, [saleItems]);

  // --- Manejar búsqueda de productos localmente (sobre el array 'products') ---
  // Este efecto se ejecuta cada vez que searchTerm o products cambian
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]); // No hay término de búsqueda, no hay resultados filtrados específicos
    }
  }, [searchTerm, products]);

  // --- Añadir producto al carrito de venta ---
  const addProductToSale = (product) => {
    setSuccessMessage(''); // Limpiar mensajes de éxito anteriores
    setError(''); // Limpiar errores anteriores

    const existingItem = saleItems.find((item) => item.product._id === product._id);

    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        setError(`No hay suficiente stock para ${product.name}. Stock disponible: ${product.stock}`);
        return;
      }
      setSaleItems(
        saleItems.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (1 > product.stock) {
        setError(`No hay suficiente ${product.name} para vender. Stock disponible: ${product.stock}`);
        return;
      }
      setSaleItems([...saleItems, { product, quantity: 1, price: product.price }]);
    }
    setSearchTerm(''); // Limpiar búsqueda después de añadir
    // searchResults se limpia automáticamente gracias al useEffect de búsqueda
    searchInputRef.current.focus(); // Volver a enfocar el campo de búsqueda
  };

  // --- Ajustar cantidad de un producto en el carrito ---
  const adjustQuantity = (productId, delta) => {
    setSuccessMessage('');
    setError('');
    setSaleItems(
      saleItems
        .map((item) => {
          if (item.product._id === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;
            if (delta > 0 && newQuantity > item.product.stock) {
              setError(`No hay suficiente stock para ${item.product.name}. Stock disponible: ${item.product.stock}`);
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // --- Eliminar producto del carrito ---
  const removeItemFromSale = (productId) => {
    setSuccessMessage('');
    setError('');
    setSaleItems(saleItems.filter((item) => item.product._id !== productId));
  };

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
      })),
      paymentMethod,
      customerName,
    };

    setLoading(true);
    try {
      const response = await axiosInstance.post('/sales', saleData);
      setSuccessMessage(`Venta registrada con éxito. Total: $${response.data.sale.totalAmount.toFixed(2)}`);
      // Limpiar el carrito y el formulario
      setSaleItems([]);
      setSearchTerm('');
      setCustomerName('');
      setPaymentMethod('cash');
      // Volver a cargar la lista de productos para reflejar los stocks actualizados
      fetchAllProductsForPOS(); // Usamos la misma función para recargar
      searchInputRef.current.focus(); // Volver a enfocar el campo de búsqueda
    } catch (err) {
      console.error('Error al procesar la venta:', err);
      const errorMessage = err.response?.data?.message || 'Error al procesar la venta.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-dark-slate-gray rounded-lg shadow-xl min-h-screen flex flex-col lg:flex-row gap-6">
      {/* Columna de Búsqueda de Productos y Resultados */}
      <div className="lg:w-2/3 bg-deep-night-blue p-6 rounded-lg shadow-inner flex flex-col">
        <h2 className="text-4xl font-extrabold text-copper-rose-accent mb-8 border-b-2 border-action-blue pb-4">Punto de Venta (POS)</h2>

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

        <div className="relative mb-6">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar producto por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // Aseguramos que el texto sea visible con neutral-light
            className="w-full py-3 px-4 pl-10 bg-dark-charcoal text-gray-900 leading-tight border border-neutral-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-action-blue text-lg"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-300" size={20} />
        </div>

        {loading ? (
          <p className="text-xl text-action-blue text-center">Cargando productos...</p>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2"> {/* pr-2 para espacio del scrollbar */}
            {searchTerm.length > 0 ? ( // Si hay un término de búsqueda
              searchResults.length === 0 ? (
                <p className="text-neutral-gray-300 text-lg text-center mt-4">No se encontraron productos para "{searchTerm}".</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      className="bg-dark-charcoal p-4 rounded-lg shadow flex justify-between items-center border border-action-blue-light cursor-pointer hover:bg-neutral-gray-800 transition duration-200"
                      onClick={() => addProductToSale(product)}
                    >
                      <div>
                        <p className="text-xl font-semibold text-neutral-light">{product.name}</p>
                        <p className="text-sm text-neutral-gray-300">{product.category} - Stock: {product.stock}</p>
                      </div>
                      <p className="text-2xl font-bold text-copper-rose-accent">${product.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )
            ) : ( // Si el término de búsqueda está vacío, mostrar todos los productos
              products.length === 0 ? (
                <p className="text-neutral-gray-300 text-lg text-center mt-4">No hay productos en el inventario. Añade algunos desde la sección de Inventario.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => ( // Mapeamos el array 'products' completo aquí
                    <div
                      key={product._id}
                      className="bg-dark-charcoal p-4 rounded-lg shadow flex justify-between items-center border border-action-blue-light cursor-pointer hover:bg-neutral-gray-800 transition duration-200"
                      onClick={() => addProductToSale(product)}
                    >
                      <div>
                        <p className="text-xl font-semibold text-neutral-light">{product.name}</p>
                        <p className="text-sm text-neutral-gray-300">{product.category} - Stock: {product.stock}</p>
                      </div>
                      <p className="text-2xl font-bold text-copper-rose-accent">${product.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Columna del Carrito de Venta y Pago */}
      <div className="lg:w-1/3 bg-deep-night-blue p-6 rounded-lg shadow-inner flex flex-col">
        <h3 className="text-3xl font-semibold text-neutral-light mb-6 border-b border-neutral-gray-200 pb-3">Resumen de Venta</h3>

        {saleItems.length === 0 ? (
          <p className="text-neutral-gray-300 text-lg text-center mt-4">El carrito está vacío. Añade productos de la lista de búsqueda.</p>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 mb-6">
            {saleItems.map((item) => (
              <div key={item.product._id} className="flex items-center justify-between bg-dark-charcoal p-3 rounded-lg mb-3 shadow-sm border border-neutral-gray-700">
                <div>
                  <p className="text-neutral-light font-medium">{item.product.name}</p>
                  <p className="text-sm text-neutral-gray-300">${item.price.toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => adjustQuantity(item.product._id, -1)} className="text-copper-rose-accent hover:text-red-500 transition duration-200">
                    <FaMinusCircle size={20} />
                  </button>
                  <span className="text-xl font-bold text-neutral-light">{item.quantity}</span>
                  <button onClick={() => adjustQuantity(item.product._id, 1)} className="text-action-blue hover:text-blue-500 transition duration-200">
                    <FaPlusCircle size={20} />
                  </button>
                  <button onClick={() => removeItemFromSale(item.product._id)} className="text-red-600 hover:text-red-700 ml-2 transition duration-200">
                    <FaTimesCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto border-t border-neutral-gray-200 pt-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-2xl font-bold text-neutral-light">Total:</p>
            <p className="text-4xl font-extrabold text-copper-rose-accent flex items-center">
              <FaDollarSign size={28} className="mr-2" />{totalAmount.toFixed(2)}
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="paymentMethod" className="block text-neutral-light text-sm font-bold mb-2">Método de Pago:</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              // Corrección aquí: text-neutral-light para que el texto del select sea visible
              className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
            >
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="customerName" className="block text-neutral-light text-sm font-bold mb-2">Nombre del Cliente (Opcional):</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              // Aseguramos que el texto sea visible con neutral-light
              className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
            />
          </div>

          <button
            onClick={handleProcessSale}
            className="bg-action-blue hover:bg-blue-700 text-neutral-light font-bold py-4 px-8 rounded-lg text-xl w-full shadow-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
            disabled={loading || saleItems.length === 0}
          >
            {loading ? (
              <div className="spinner-border animate-spin inline-block w-6 h-6 border-4 rounded-full border-t-transparent border-white"></div>
            ) : (
              <>
                <FaDollarSign className="mr-3" size={24} /> Procesar Venta
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PosPage;