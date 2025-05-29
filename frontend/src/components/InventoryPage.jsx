// C:\Proyectos\Label\frontend\src\components\InventoryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { FaPlusSquare, FaEdit, FaTrash, FaTimesCircle, FaSave, FaSearch, FaAngleLeft, FaAngleRight } from 'react-icons/fa';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas las Categorías');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [availableCategories, setAvailableCategories] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      if (searchTerm) {
        queryParams.append('name', searchTerm);
      }
      if (selectedCategory && selectedCategory !== 'Todas las Categorías') {
        queryParams.append('category', selectedCategory);
      }
      queryParams.append('page', currentPage);
      queryParams.append('limit', limit);

      const response = await axiosInstance.get(`/products?${queryParams.toString()}`);

      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar productos.';
      setError(errorMessage);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, currentPage, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/products?limit=99999');
      const categories = [...new Set(response.data.products.map(p => p.category))];
      setAvailableCategories(['Todas las Categorías', ...categories.sort()]);
    } catch (err) {
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ... (el resto de tu código de InventoryPage.jsx) ...

  return (
    <div className="p-6 bg-dark-slate-gray rounded-lg shadow-xl min-h-screen">
      <h2 className="text-4xl font-extrabold text-copper-rose-accent mb-8 border-b-2 border-action-blue pb-4">Gestión de Inventario</h2>

      {error && (
        <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">¡Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {/* Botones de Añadir/Ocultar y Cancelar Edición */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <button
          onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); setEditingProduct(null); setError(''); }}
          className="bg-action-blue hover:bg-blue-700 text-neutral-light font-bold py-3 px-6 rounded-lg text-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
        >
          <FaPlusSquare className="mr-2" /> {showAddForm ? 'Ocultar Formulario' : 'Añadir Nuevo Producto'}
        </button>
        {showEditForm && (
            <button
                onClick={() => { setShowEditForm(false); setEditingProduct(null); setError(''); }}
                className="bg-neutral-gray-500 hover:bg-neutral-gray-600 text-neutral-light font-bold py-3 px-6 rounded-lg text-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 flex items-center justify-center"
            >
                <FaTimesCircle className="mr-2" /> Cancelar Edición
            </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8 border border-neutral-gray-700">
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
                step="0.01"
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

      {showEditForm && editingProduct && (
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8 border border-neutral-gray-700">
          <h3 className="text-2xl font-semibold text-neutral-light mb-4">Editar Producto: {editingProduct.name}</h3>
          <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="editName" className="block text-neutral-light text-sm font-bold mb-2">Nombre del Producto:</label>
              <input
                type="text"
                id="editName"
                name="name"
                value={editingProduct.name}
                onChange={handleEditFormChange}
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                required
              />
            </div>
            <div>
              <label htmlFor="editCategory" className="block text-neutral-light text-sm font-bold mb-2">Categoría:</label>
              <input
                type="text"
                id="editCategory"
                name="category"
                value={editingProduct.category}
                onChange={handleEditFormChange}
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="editDescription" className="block text-neutral-light text-sm font-bold mb-2">Descripción (Opcional):</label>
              <textarea
                id="editDescription"
                name="description"
                value={editingProduct.description}
                onChange={handleEditFormChange}
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal h-24"
              />
            </div>
            <div>
              <label htmlFor="editPrice" className="block text-neutral-light text-sm font-bold mb-2">Precio ($):</label>
              <input
                type="number"
                id="editPrice"
                name="price"
                value={editingProduct.price}
                onChange={handleEditFormChange}
                step="0.01"
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                required
              />
            </div>
            <div>
              <label htmlFor="editStock" className="block text-neutral-light text-sm font-bold mb-2">Stock:</label>
              <input
                type="number"
                id="editStock"
                name="stock"
                value={editingProduct.stock}
                onChange={handleEditFormChange}
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                required
              />
            </div>
            <div className="md:col-span-2 text-right">
              <button
                type="submit"
                className="bg-action-blue hover:bg-blue-700 text-neutral-light font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center float-right"
              >
                <FaSave className="mr-2" /> Actualizar Producto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Sección de Búsqueda y Filtro --- */}
      <form onSubmit={(e) => { e.preventDefault(); }}
            className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8 border border-neutral-gray-700 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-grow w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-4 pr-10 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal pl-10"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-400" />
        </div>

        <div className="w-full md:w-auto">
          <label htmlFor="categoryFilter" className="sr-only">Filtrar por Categoría:</label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={(e) => {
              console.log('onChange del select de categoría. Valor:', e.target.value); // DEBUG
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
          >
            {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </form>
      {/* --- Fin Sección de Búsqueda y Filtro --- */}

      <h3 className="text-3xl font-semibold text-neutral-light mb-6 border-b border-neutral-gray-200 pb-3">Lista de Productos</h3>

      {products.length === 0 && !loading ? (
        <p className="text-neutral-gray-300 text-lg">No hay productos que coincidan con la búsqueda o el filtro. ¡Intenta añadir uno!</p>
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
                <button
                  onClick={() => handleEditClick(product)}
                  className="bg-neutral-gray-200 text-dark-charcoal px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-gray-300 transition duration-200 flex items-center"
                >
                  <FaEdit className="mr-1"/> Editar
                </button>
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="bg-red-600 text-neutral-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition duration-200 flex items-center"
                >
                  <FaTrash className="mr-1"/> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Controles de Paginación --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8 text-neutral-light">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="bg-action-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            <FaAngleLeft />
          </button>
          <span className="text-lg">Página {currentPage} de {totalPages}</span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="bg-action-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            <FaAngleRight />
          </button>
        </div>
      )}
      {/* --- Fin Controles de Paginación --- */}
    </div>
  );
};

export default InventoryPage;