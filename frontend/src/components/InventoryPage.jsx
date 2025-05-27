// C:\Proyectos\Label\frontend\src\components\InventoryPage.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { FaPlusSquare, FaEdit, FaTrash } from 'react-icons/fa'; // Iconos

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '', // <--- ¡AÑADIMOS ESTE CAMPO!
    price: '',
    stock: '',
  });

  // --- Cargar productos al montar el componente ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/products');
        setProducts(response.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar productos:', err);
        const errorMessage = err.response?.data?.message || 'Error al cargar productos';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // --- Manejar cambios en el formulario de nuevo producto ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Manejar el envío del formulario de nuevo producto ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos
    try {
      // Validar campos requeridos antes de enviar
      if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock) { // <--- ¡Category es ahora requerido!
        setError('Por favor, ingresa todos los campos requeridos: nombre, categoría, precio y stock.');
        return;
      }

      if (isNaN(newProduct.price) || parseFloat(newProduct.price) <= 0) {
        setError('El precio debe ser un número positivo.');
        return;
      }

      if (isNaN(newProduct.stock) || parseInt(newProduct.stock) < 0) {
        setError('El stock debe ser un número no negativo.');
        return;
      }

      const response = await axiosInstance.post('/products', {
        ...newProduct,
        price: parseFloat(newProduct.price), // Asegurar que se envía como número
        stock: parseInt(newProduct.stock),   // Asegurar que se envía como entero
      });
      setProducts((prev) => [response.data, ...prev]); // Añadir el nuevo producto al principio de la lista
      setNewProduct({ // Limpiar el formulario
        name: '',
        description: '',
        category: '',
        price: '',
        stock: '',
      });
      setShowAddForm(false); // Ocultar el formulario después de agregar
      setError(''); // Limpiar cualquier error previo
    } catch (err) {
      console.error('Error al añadir producto:', err);
      const errorMessage = err.response?.data?.message || 'Error al añadir producto.';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen">
        <p className="text-xl text-action-blue">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-dark-slate-gray rounded-lg shadow-xl min-h-screen">
      <h2 className="text-4xl font-extrabold text-copper-rose-accent mb-8 border-b-2 border-action-blue pb-4">Gestión de Inventario</h2>

      {error && (
        <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">¡Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      <div className="mb-8">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-action-blue hover:bg-blue-700 text-neutral-light font-bold py-3 px-6 rounded-lg text-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
        >
          <FaPlusSquare className="mr-2" /> {showAddForm ? 'Ocultar Formulario' : 'Añadir Nuevo Producto'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8">
          <h3 className="text-2xl font-semibold text-neutral-light mb-4">Añadir Nuevo Producto</h3>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-neutral-light text-sm font-bold mb-2">Nombre del Producto:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                required
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-neutral-light text-sm font-bold mb-2">Categoría:</label>
              <input
                type="text"
                id="category"
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-neutral-light text-sm font-bold mb-2">Descripción (Opcional):</label>
              <textarea
                id="description"
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal h-24"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-neutral-light text-sm font-bold mb-2">Precio ($):</label>
              <input
                type="number"
                id="price"
                name="price"
                value={newProduct.price}
                onChange={handleInputChange}
                step="0.01" // Permite decimales para el precio
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                required
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-neutral-light text-sm font-bold mb-2">Stock:</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={newProduct.stock}
                onChange={handleInputChange}
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                required
              />
            </div>
            <div className="md:col-span-2 text-right">
              <button
                type="submit"
                className="bg-copper-rose-accent hover:bg-rose-700 text-neutral-light font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
              >
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      )}

      <h3 className="text-3xl font-semibold text-neutral-light mb-6 border-b border-neutral-gray-200 pb-3">Lista de Productos</h3>

      {products.length === 0 ? (
        <p className="text-neutral-gray-300 text-lg">No hay productos registrados. ¡Añade uno!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-deep-night-blue p-6 rounded-lg shadow-lg border border-action-blue-light flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-bold text-copper-rose-accent mb-2">{product.name}</h4>
                {product.category && <p className="text-neutral-light mb-1"><span className="font-semibold">Categoría:</span> {product.category}</p>}
                {product.description && <p className="text-neutral-light mb-1 text-sm">{product.description}</p>}
                <p className="text-neutral-light mb-1"><span className="font-semibold">Precio:</span> ${parseFloat(product.price).toFixed(2)}</p>
                <p className="text-neutral-light mb-3"><span className="font-semibold">Stock:</span> {product.stock}</p>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                {/* Botones de Editar y Eliminar (funcionalidad futura) */}
                <button className="bg-neutral-gray-200 text-dark-charcoal px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-gray-300 transition duration-200 opacity-50 cursor-not-allowed flex items-center">
                  <FaEdit className="mr-1"/> Editar
                </button>
                <button className="bg-red-600 text-neutral-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition duration-200 opacity-50 cursor-not-allowed flex items-center">
                  <FaTrash className="mr-1"/> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryPage;