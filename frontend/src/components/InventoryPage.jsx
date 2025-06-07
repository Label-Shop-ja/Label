// C:\Proyectos\Label\frontend\src\components\InventoryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
// Importamos iconos de lucide-react para un aspecto más profesional
import { PlusSquare, Edit, Trash2, XCircle, Save, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const InventoryPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas las Categorías');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [availableCategories, setAvailableCategories] = useState([]);

    // Actualización del estado inicial para incluir los nuevos campos
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        stock: '',
        costPrice: '', // Nuevo campo: costo unitario
        sku: '',       // Nuevo campo: SKU
        unitOfMeasure: 'unidad', // Nuevo campo: unidad de medida, con valor por defecto
        brand: '',     // Nuevo campo: marca
        supplier: '',  // Nuevo campo: proveedor
    });

    // Definir las opciones para la unidad de medida (debe coincidir con el enum del backend)
    const unitOfMeasureOptions = ['unidad', 'kg', 'litro', 'metro', 'paquete', 'caja', 'docena', 'otro'];

    // Función para mostrar mensajes de éxito o error
    const displayMessage = (msg, type) => {
        if (type === 'success') {
            setSuccessMessage(msg);
            setError('');
        } else {
            setError(msg);
            setSuccessMessage('');
        }
        setTimeout(() => {
            setSuccessMessage('');
            setError('');
        }, 5000); // Los mensajes desaparecen después de 5 segundos
    };

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(''); // Limpia errores anteriores antes de una nueva carga
            setSuccessMessage(''); // Limpia mensajes de éxito anteriores

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
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al cargar productos. Por favor, inténtalo de nuevo.';
            displayMessage(errorMessage, 'error'); // Usa la nueva función displayMessage
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
            // Trae un número suficiente de productos para asegurar que todas las categorías sean recolectadas
            // O idealmente, el backend debería proveer un endpoint /categories
            const response = await axiosInstance.get('/products?limit=1000'); // Aumentar el límite para cubrir más productos
            const categories = [...new Set(response.data.products.map(p => p.category))];
            setAvailableCategories(['Todas las Categorías', ...categories.sort()]);
        } catch (err) {
            console.error("Error al cargar categorías:", err.response?.data?.message || err.message);
            // No mostramos un error visible en la UI por la carga de categorías si no es crítico
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Manejador para el cambio de inputs del formulario de añadir/editar
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Para el formulario de añadir
        if (showAddForm) {
            setNewProduct(prev => ({ ...prev, [name]: value }));
        }
        // Para el formulario de edición
        else if (showEditForm) {
            setEditingProduct(prev => ({ ...prev, [name]: value }));
        }
        setError(''); // Limpia el error al empezar a escribir
        setSuccessMessage(''); // Limpia mensajes de éxito al empezar a escribir
    };

    // Manejador para el envío del formulario de añadir producto
    const handleAddProduct = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar errores antes de intentar la operación
        setSuccessMessage(''); // Limpiar mensajes de éxito

        // Validación básica en frontend - ahora incluye los nuevos campos requeridos
        if (!newProduct.name || !newProduct.category || !newProduct.price || newProduct.stock === '' ||
            newProduct.costPrice === '' || !newProduct.sku || !newProduct.unitOfMeasure) {
            displayMessage('Por favor, completa todos los campos obligatorios: Nombre, Categoría, Precio de Venta, Costo, SKU, Unidad de Medida y Stock.', 'error');
            return;
        }
        if (isNaN(Number(newProduct.price)) || Number(newProduct.price) <= 0) {
            displayMessage('El precio de venta debe ser un número positivo.', 'error');
            return;
        }
        if (isNaN(Number(newProduct.costPrice)) || Number(newProduct.costPrice) < 0) {
            displayMessage('El costo unitario debe ser un número no negativo.', 'error');
            return;
        }
        if (isNaN(Number(newProduct.stock)) || Number(newProduct.stock) < 0) {
            displayMessage('El stock debe ser un número no negativo.', 'error');
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.post('/products', newProduct);
            displayMessage('Producto añadido exitosamente.', 'success'); // Mensaje de éxito
            setProducts(prev => [response.data, ...prev]); // Añadir el nuevo producto al inicio
            // Resetear formulario, incluyendo los nuevos campos con sus valores por defecto si aplica
            setNewProduct({
                name: '', description: '', category: '', price: '', stock: '',
                costPrice: '', sku: '', unitOfMeasure: 'unidad', brand: '', supplier: ''
            });
            setShowAddForm(false); // Ocultar formulario después de añadir
            fetchCategories(); // Refrescar categorías por si se añadió una nueva
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al añadir producto. Por favor, inténtalo de nuevo.';
            displayMessage(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Manejador para el clic en el botón de edición
    const handleEditClick = (product) => {
        // Asegurarse de que todos los campos existan al iniciar la edición
        setEditingProduct({
            ...product,
            price: parseFloat(product.price).toFixed(2),
            costPrice: parseFloat(product.costPrice).toFixed(2), // Formatear costo para el input
            unitOfMeasure: product.unitOfMeasure || 'unidad', // Valor por defecto si falta
            brand: product.brand || '', // Valor por defecto si falta
            supplier: product.supplier || '', // Valor por defecto si falta
            description: product.description || '', // Valor por defecto si falta
        });
        setShowEditForm(true);
        setShowAddForm(false); // Oculta el formulario de añadir si está visible
        setError(''); // Limpia cualquier error previo
        setSuccessMessage(''); // Limpia cualquier mensaje de éxito previo
    };

    // Manejador para el envío del formulario de actualización de producto
    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        if (!editingProduct || !editingProduct._id) return;
        setError(''); // Limpiar errores antes de intentar la operación
        setSuccessMessage(''); // Limpiar mensajes de éxito

        // Validación básica en frontend para el producto editado - ahora incluye nuevos campos
        if (!editingProduct.name || !editingProduct.category || !editingProduct.price || editingProduct.stock === '' ||
            editingProduct.costPrice === '' || !editingProduct.sku || !editingProduct.unitOfMeasure) {
            displayMessage('Por favor, completa todos los campos obligatorios: Nombre, Categoría, Precio de Venta, Costo, SKU, Unidad de Medida y Stock.', 'error');
            return;
        }
        if (isNaN(Number(editingProduct.price)) || Number(editingProduct.price) <= 0) {
            displayMessage('El precio de venta debe ser un número positivo.', 'error');
            return;
        }
        if (isNaN(Number(editingProduct.costPrice)) || Number(editingProduct.costPrice) < 0) {
            displayMessage('El costo unitario debe ser un número no negativo.', 'error');
            return;
        }
        if (isNaN(Number(editingProduct.stock)) || Number(editingProduct.stock) < 0) {
            displayMessage('El stock debe ser un número no negativo.', 'error');
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.put(`/products/${editingProduct._id}`, editingProduct);
            displayMessage('Producto actualizado exitosamente.', 'success'); // Mensaje de éxito
            setProducts(prev => prev.map(p => (p._id === editingProduct._id ? response.data : p)));
            setEditingProduct(null); // Limpiar producto en edición
            setShowEditForm(false); // Ocultar formulario
            fetchCategories(); // Refrescar categorías por si se cambió una categoría existente
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al actualizar producto. Por favor, inténtalo de nuevo.';
            displayMessage(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Manejador para iniciar la eliminación (muestra modal de confirmación)
    const confirmDeleteProduct = (productId) => {
        setProductToDelete(productId);
        setShowConfirmModal(true);
        setError(''); // Limpia cualquier error previo
        setSuccessMessage(''); // Limpia cualquier mensaje de éxito previo
    };

    // Manejador para la eliminación real del producto
    const handleDeleteProduct = async () => {
        if (!productToDelete) return;

        try {
            setLoading(true);
            setError('');
            setSuccessMessage('');
            await axiosInstance.delete(`/products/${productToDelete}`);
            displayMessage('Producto eliminado exitosamente.', 'success'); // Mensaje de éxito
            // Actualiza la lista de productos filtrando el eliminado
            setProducts(prev => prev.filter(p => p._id !== productToDelete));
            // Si eliminamos el último producto de una página, intentar ir a la página anterior
            if (products.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            } else {
                fetchProducts(); // Refrescar productos para recalcular paginación
            }
            setShowConfirmModal(false); // Cierra el modal de confirmación
            setProductToDelete(null); // Limpiar el ID del producto a eliminar
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al eliminar producto. Por favor, inténtalo de nuevo.';
            displayMessage(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Funciones de paginación
    const goToPrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    return (
        <div className="p-6 bg-dark-slate-gray rounded-lg shadow-xl min-h-screen">
            <h2 className="text-4xl font-extrabold text-copper-rose-accent mb-8 border-b-2 border-action-blue pb-4">Gestión de Inventario</h2>

            {/* Mensaje de éxito global */}
            {successMessage && (
                <div className="bg-green-700 bg-opacity-30 border border-green-500 text-green-300 px-4 py-3 rounded relative mb-6 animate-fade-in-down" role="alert">
                    <strong className="font-bold">¡Éxito!</strong>
                    <span className="block sm:inline ml-2">{successMessage}</span>
                </div>
            )}

            {/* Mensaje de error global */}
            {error && (
                <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-6 animate-fade-in-down" role="alert">
                    <strong className="font-bold">¡Error!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-deep-night-blue p-8 rounded-lg shadow-2xl text-neutral-light max-w-sm w-full text-center border border-neutral-gray-700 transform scale-95 opacity-0 animate-scale-in">
                        <h3 className="text-xl font-bold mb-4 text-copper-rose-accent">Confirmar Eliminación</h3>
                        <p className="mb-6 text-neutral-gray-300">¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => { setShowConfirmModal(false); setProductToDelete(null); setError(''); setSuccessMessage(''); }}
                                className="bg-neutral-gray-500 hover:bg-neutral-gray-600 text-neutral-light font-bold py-2 px-5 rounded-lg transition duration-200 shadow-md"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteProduct}
                                className="bg-red-600 hover:bg-red-700 text-neutral-light font-bold py-2 px-5 rounded-lg transition duration-200 shadow-md"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Botones de Añadir/Ocultar y Cancelar Edición */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                <button
                    onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); setEditingProduct(null); setError(''); setSuccessMessage(''); }}
                    className="bg-action-blue hover:bg-blue-700 text-neutral-light font-bold py-3 px-6 rounded-lg text-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
                >
                    <PlusSquare size={24} className="mr-2" /> {showAddForm ? 'Ocultar Formulario' : 'Añadir Nuevo Producto'}
                </button>
                {showEditForm && (
                    <button
                        onClick={() => { setShowEditForm(false); setEditingProduct(null); setError(''); setSuccessMessage(''); }}
                        className="bg-neutral-gray-500 hover:bg-neutral-gray-600 text-neutral-light font-bold py-3 px-6 rounded-lg text-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 flex items-center justify-center"
                    >
                        <XCircle size={24} className="mr-2" /> Cancelar Edición
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8 border border-neutral-gray-700 animate-fade-in-down">
                    <h3 className="text-2xl font-semibold text-neutral-light mb-4 text-copper-rose-accent">Añadir Nuevo Producto</h3>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre del Producto */}
                        <div>
                            <label htmlFor="name" className="block text-neutral-light text-sm font-bold mb-2">Nombre del Producto:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={newProduct.name}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                placeholder="Ej. Camiseta Deportiva"
                                required
                            />
                        </div>
                        {/* SKU */}
                        <div>
                            <label htmlFor="sku" className="block text-neutral-light text-sm font-bold mb-2">SKU:</label>
                            <input
                                type="text"
                                id="sku"
                                name="sku"
                                value={newProduct.sku}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                placeholder="Ej. CAMI-DEP-AZUL-M"
                                required
                            />
                        </div>
                        {/* Categoría */}
                        <div>
                            <label htmlFor="category" className="block text-neutral-light text-sm font-bold mb-2">Categoría:</label>
                            <input
                                type="text"
                                id="category"
                                name="category"
                                value={newProduct.category}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                placeholder="Ej. Ropa, Electrónica, Alimentos"
                                required
                            />
                        </div>
                        {/* Unidad de Medida */}
                        <div>
                            <label htmlFor="unitOfMeasure" className="block text-neutral-light text-sm font-bold mb-2">Unidad de Medida:</label>
                            <select
                                id="unitOfMeasure"
                                name="unitOfMeasure"
                                value={newProduct.unitOfMeasure}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer"
                                required
                            >
                                {unitOfMeasureOptions.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                        {/* Marca (Opcional) */}
                        <div>
                            <label htmlFor="brand" className="block text-neutral-light text-sm font-bold mb-2">Marca (Opcional):</label>
                            <input
                                type="text"
                                id="brand"
                                name="brand"
                                value={newProduct.brand}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                placeholder="Ej. Nike, Samsung"
                            />
                        </div>
                        {/* Proveedor (Opcional) */}
                        <div>
                            <label htmlFor="supplier" className="block text-neutral-light text-sm font-bold mb-2">Proveedor (Opcional):</label>
                            <input
                                type="text"
                                id="supplier"
                                name="supplier"
                                value={newProduct.supplier}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                placeholder="Ej. Distribuciones ABC"
                            />
                        </div>
                        {/* Precio de Venta */}
                        <div>
                            <label htmlFor="price" className="block text-neutral-light text-sm font-bold mb-2">Precio de Venta ($):</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={newProduct.price}
                                onChange={handleInputChange}
                                step="0.01"
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                placeholder="Ej. 29.99"
                                required
                            />
                        </div>
                        {/* Costo Unitario */}
                        <div>
                            <label htmlFor="costPrice" className="block text-neutral-light text-sm font-bold mb-2">Costo Unitario ($):</label>
                            <input
                                type="number"
                                id="costPrice"
                                name="costPrice"
                                value={newProduct.costPrice}
                                onChange={handleInputChange}
                                step="0.01"
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                placeholder="Ej. 15.00"
                                required
                            />
                        </div>
                        {/* Stock */}
                        <div>
                            <label htmlFor="stock" className="block text-neutral-light text-sm font-bold mb-2">Stock:</label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={newProduct.stock}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                placeholder="Ej. 150"
                                required
                            />
                        </div>
                        {/* Descripción (Opcional, abarca 2 columnas) */}
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-neutral-light text-sm font-bold mb-2">Descripción (Opcional):</label>
                            <textarea
                                id="description"
                                name="description"
                                value={newProduct.description}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 h-24"
                                placeholder="Descripción detallada del producto..."
                            />
                        </div>
                        <div className="md:col-span-2 text-right">
                            <button
                                type="submit"
                                className="bg-copper-rose-accent hover:bg-rose-700 text-deep-night-blue font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center float-right"
                            >
                                <Save size={20} className="mr-2" /> Guardar Producto
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showEditForm && editingProduct && (
                <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8 border border-neutral-gray-700 animate-fade-in-down">
                    <h3 className="text-2xl font-semibold text-neutral-light mb-4 text-copper-rose-accent">Editar Producto: {editingProduct.name}</h3>
                    <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre del Producto */}
                        <div>
                            <label htmlFor="editName" className="block text-neutral-light text-sm font-bold mb-2">Nombre del Producto:</label>
                            <input
                                type="text"
                                id="editName"
                                name="name"
                                value={editingProduct.name}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                required
                            />
                        </div>
                        {/* SKU */}
                        <div>
                            <label htmlFor="editSku" className="block text-neutral-light text-sm font-bold mb-2">SKU:</label>
                            <input
                                type="text"
                                id="editSku"
                                name="sku"
                                value={editingProduct.sku}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                required
                            />
                        </div>
                        {/* Categoría */}
                        <div>
                            <label htmlFor="editCategory" className="block text-neutral-light text-sm font-bold mb-2">Categoría:</label>
                            <input
                                type="text"
                                id="editCategory"
                                name="category"
                                value={editingProduct.category}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                required
                            />
                        </div>
                        {/* Unidad de Medida */}
                        <div>
                            <label htmlFor="editUnitOfMeasure" className="block text-neutral-light text-sm font-bold mb-2">Unidad de Medida:</label>
                            <select
                                id="editUnitOfMeasure"
                                name="unitOfMeasure"
                                value={editingProduct.unitOfMeasure}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer"
                                required
                            >
                                {unitOfMeasureOptions.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                        {/* Marca (Opcional) */}
                        <div>
                            <label htmlFor="editBrand" className="block text-neutral-light text-sm font-bold mb-2">Marca (Opcional):</label>
                            <input
                                type="text"
                                id="editBrand"
                                name="brand"
                                value={editingProduct.brand}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                placeholder="Ej. Nike, Samsung"
                            />
                        </div>
                        {/* Proveedor (Opcional) */}
                        <div>
                            <label htmlFor="editSupplier" className="block text-neutral-light text-sm font-bold mb-2">Proveedor (Opcional):</label>
                            <input
                                type="text"
                                id="editSupplier"
                                name="supplier"
                                value={editingProduct.supplier}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                placeholder="Ej. Distribuciones ABC"
                            />
                        </div>
                        {/* Precio de Venta */}
                        <div>
                            <label htmlFor="editPrice" className="block text-neutral-light text-sm font-bold mb-2">Precio de Venta ($):</label>
                            <input
                                type="number"
                                id="editPrice"
                                name="price"
                                value={editingProduct.price}
                                onChange={handleInputChange}
                                step="0.01"
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                required
                            />
                        </div>
                        {/* Costo Unitario */}
                        <div>
                            <label htmlFor="editCostPrice" className="block text-neutral-light text-sm font-bold mb-2">Costo Unitario ($):</label>
                            <input
                                type="number"
                                id="editCostPrice"
                                name="costPrice"
                                value={editingProduct.costPrice}
                                onChange={handleInputChange}
                                step="0.01"
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                required
                            />
                        </div>
                        {/* Stock */}
                        <div>
                            <label htmlFor="editStock" className="block text-neutral-light text-sm font-bold mb-2">Stock:</label>
                            <input
                                type="number"
                                id="editStock"
                                name="stock"
                                value={editingProduct.stock}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                                required
                            />
                        </div>
                        {/* Descripción (Opcional, abarca 2 columnas) */}
                        <div className="md:col-span-2">
                            <label htmlFor="editDescription" className="block text-neutral-light text-sm font-bold mb-2">Descripción (Opcional):</label>
                            <textarea
                                id="editDescription"
                                name="description"
                                value={editingProduct.description}
                                onChange={handleInputChange}
                                className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 h-24"
                                placeholder="Descripción detallada del producto..."
                            />
                        </div>
                        <div className="md:col-span-2 text-right">
                            <button
                                type="submit"
                                className="bg-action-blue hover:bg-blue-700 text-neutral-light font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center float-right"
                            >
                                <Save size={20} className="mr-2" /> Actualizar Producto
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
                        className="shadow appearance-none border border-neutral-gray-700 rounded-full w-full py-2 px-4 pr-10 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal pl-10"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-400" />
                </div>

                <div className="w-full md:w-auto">
                    <label htmlFor="categoryFilter" className="sr-only">Filtrar por Categoría:</label>
                    <select
                        id="categoryFilter"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="shadow appearance-none border border-neutral-gray-700 rounded-full w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer"
                    >
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </form>
            {/* --- Fin Sección de Búsqueda y Filtro --- */}

            <h3 className="text-3xl font-semibold text-neutral-light mb-6 border-b border-neutral-gray-700 pb-3">Lista de Productos</h3>

            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 size={48} className="animate-spin text-copper-rose-accent" />
                    <span className="sr-only">Cargando...</span>
                </div>
            ) : products.length === 0 ? (
                <p className="text-neutral-gray-300 text-lg text-center mt-10">No hay productos que coincidan con la búsqueda o el filtro. ¡Intenta añadir uno!</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product._id} className="bg-deep-night-blue p-6 rounded-lg shadow-lg border border-action-blue-light flex flex-col justify-between transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl">
                            <div>
                                <h4 className="text-xl font-bold text-copper-rose-accent mb-2 truncate">{product.name}</h4>
                                <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold text-action-blue">SKU:</span> {product.sku || 'N/A'}</p> {/* Mostrar SKU */}
                                {product.category && <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold text-action-blue">Categoría:</span> <span className="bg-neutral-gray-700 text-neutral-light px-2 py-0.5 rounded-full text-xs font-medium">{product.category}</span></p>}
                                {product.brand && <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold text-action-blue">Marca:</span> {product.brand}</p>} {/* Mostrar Marca */}
                                {product.supplier && <p className="text-neutral-light mb-1 text-sm"><span className="font-semibold text-action-blue">Proveedor:</span> {product.supplier}</p>} {/* Mostrar Proveedor */}
                                {product.description && <p className="text-neutral-gray-300 mb-2 text-sm line-clamp-2">{product.description}</p>}
                                <p className="text-neutral-light mb-1"><span className="font-semibold">Unidad:</span> {product.unitOfMeasure}</p> {/* Mostrar Unidad de Medida */}
                                <p className="text-neutral-light mb-1"><span className="font-semibold">Precio de Venta:</span> <span className="text-success-green font-bold text-lg">${parseFloat(product.price).toFixed(2)}</span></p>
                                <p className="text-neutral-light mb-1"><span className="font-semibold">Costo Unitario:</span> <span className="text-yellow-400 font-bold">${parseFloat(product.costPrice).toFixed(2)}</span></p> {/* Mostrar Costo Unitario */}
                                <p className="text-neutral-light mb-3"><span className="font-semibold">Stock:</span> <span className={`${product.stock <= 5 ? 'text-red-400' : 'text-yellow-400'} font-bold`}>{product.stock} unidades</span></p>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => handleEditClick(product)}
                                    className="bg-neutral-gray-700 text-neutral-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-gray-600 transition duration-200 flex items-center shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-gray-500"
                                >
                                    <Edit size={16} className="mr-1"/> Editar
                                </button>
                                <button
                                    onClick={() => confirmDeleteProduct(product._id)}
                                    className="bg-red-600 text-neutral-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition duration-200 flex items-center shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <Trash2 size={16} className="mr-1"/> Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- Controles de Paginación --- */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-3 mt-8 text-neutral-light">
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1 || loading}
                        className="bg-action-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-lg font-semibold text-copper-rose-accent">Página {currentPage} de {totalPages}</span>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages || loading}
                        className="bg-action-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
            {/* --- Fin Controles de Paginación --- */}
        </div>
    );
};

export default InventoryPage;
