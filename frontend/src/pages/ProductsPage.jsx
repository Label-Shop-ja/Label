// C:\Proyectos\Label\frontend\src\pages\ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProductList from '../components/ProductList'; // Lo crearemos en el siguiente paso

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

function ProductsPage() {
  const { user } = useAuth(); // Obtenemos el usuario autenticado
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Función para cargar los productos del backend
    const fetchProducts = async () => {
      if (!user) { // No intentar cargar productos si no hay usuario autenticado
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        // Axios ya tiene el token configurado globalmente desde AuthContext
        const response = await axios.get(`${API_URL}/products`);
        setProducts(response.data);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError(err.response?.data?.message || 'Error al cargar los productos.');
        setProducts([]); // Limpiar productos si hay un error
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]); // Vuelve a cargar si el usuario cambia (ej. al loguearse/desloguearse)

  // Función para manejar la eliminación de un producto
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }
    try {
      await axios.delete(`<span class="math-inline">\{API\_URL\}/products/</span>{productId}`);
      // Si la eliminación es exitosa, filtra el producto de la lista local
      setProducts(products.filter(product => product._id !== productId));
      alert('Producto eliminado con éxito.');
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      setError(err.response?.data?.message || 'Error al eliminar el producto.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl text-neutral-light">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        <p className="text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-graphite-dark rounded-lg shadow-xl min-h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-copper-rose-accent">Gestión de Productos</h2>
        <button className="bg-action-blue hover:bg-blue-700 text-neutral-light px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200">
          Añadir Nuevo Producto
        </button>
      </div>
      {products.length === 0 ? (
        <p className="text-neutral-light text-center text-xl mt-10">No hay productos para mostrar. ¡Añade uno nuevo!</p>
      ) : (
        <ProductList products={products} onDelete={handleDeleteProduct} />
      )}
    </div>
  );
}

export default ProductsPage;