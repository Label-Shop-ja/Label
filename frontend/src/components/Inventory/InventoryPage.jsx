// C:\Proyectos\Label\frontend\src\components\Inventory\InventoryPage.jsx
import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import axiosInstance from '../../api/axiosInstance';
import ErrorBoundary from '../Common/ErrorBoundary';

// Importaciones de componentes lazily loaded
const ProductModal = lazy(() => import('../Common/ProductModal'));
const ConfirmDeleteModal = lazy(() => import('../Common/ConfirmModal'));
const ProductFilterAndSearch = lazy(() => import('./ProductFilterAndSearch'));
const ProductList = lazy(() => import('./ProductList'));
const InventoryAlerts = lazy(() => import('./InventoryAlerts'));
const VariantReportTable = lazy(() => import('./VariantReportTable'));
const PaginationControls = lazy(() => import('../Common/PaginationControls'));
const MessageDisplay = lazy(() => import('../Common/MessageDisplay'));

// Importa el nuevo componente lógico del formulario
const AddEditProductFormLogic = lazy(() => import('./AddEditProductFormLogic'));

// NUEVAS IMPORTACIONES
import { useCurrency } from '../../context/CurrencyContext'; // <-- ¡NUEVA LÍNEA!
const ExchangeRateDisplay = lazy(() => import('../Currency/ExchangeRateDisplay')); // <-- ¡NUEVA LÍNEA!
const ExchangeRateModal = lazy(() => import('../Currency/ExchangeRateModal'));   // <-- ¡NUEVA LÍNEA!

// Íconos de Lucide React, si se usan directamente en este componente principal
import { Loader2, Upload } from 'lucide-react';

function InventoryPage() {
    // Estados principales para la gestión de productos y la interfaz de usuario
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const [expandedProducts, setExpandedProducts] = useState(new Set());

    // Estados para filtros y paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas las Categorías');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    // Estados para opciones de filtro dinámicas
    const [availableCategories, setAvailableCategories] = useState([]);
    const [availableBrands, setAvailableBrands] = useState(['Todas las Marcas']);
    const [selectedBrand, setSelectedBrand] = useState('Todas las Marcas');
    const [availableSuppliers, setAvailableSuppliers] = useState(['Todos los Proveedores']);
    const [selectedSupplier, setSelectedSupplier] = useState('Todos los Proveedores');
    const [availableVariantColors, setAvailableVariantColors] = useState(['Todos los Colores']);
    const [selectedVariantColor, setSelectedVariantColor] = useState('Todos los Colores');
    const [availableVariantSizes, setAvailableVariantSizes] = useState(['Todas las Tallas']);
    const [selectedVariantSize, setSelectedVariantSize] = useState('Todas las Tallas');

    // Estados para el reporte de inventario por variante
    const [variantReport, setVariantReport] = useState([]);
    const [showVariantReport, setShowVariantReport] = useState(false);

    // Estados para ordenamiento
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Referencia para el debounce en la búsqueda de productos globales
    const debounceTimeoutRef = useRef(null);

    // Estado para los datos del producto nuevo (se usa como initialProductData para AddEditProductFormLogic)
    const defaultNewProductState = {
        name: '', description: '', category: '', price: '', stock: '',
        costPrice: '', sku: '', unitOfMeasure: 'unidad', brand: '', supplier: '', imageUrl: '',
        color: '', size: '', material: '', variants: [],
        isPerishable: false, reorderThreshold: 0, optimalMaxStock: 0, shelfLifeDays: 0,
    };
    const [newProductInitialData, setNewProductInitialData] = useState(defaultNewProductState);


    // Opciones predefinidas para la unidad de medida
    const unitOfMeasureOptions = ['unidad', 'kg', 'litro', 'metro', 'paquete', 'caja', 'docena', 'otro'];

    // --- NUEVOS ESTADOS PARA ALERTAS DE STOCK ---
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [highStockAlerts, setHighStockAlerts] = useState([]);

    // Usa el contexto de moneda
    const { exchangeRate, loadingCurrency, currencyError, fetchExchangeRate, updateExchangeRate, convertPrice, formatPrice } = useCurrency(); // <-- ¡NUEVA LÍNEA!

    // Estado para controlar la visibilidad del modal de tasa de cambio
    const [showExchangeRateModal, setShowExchangeRateModal] = useState(false); // <-- ¡NUEVA LÍNEA!

    // Función auxiliar para mostrar mensajes de éxito o error al usuario
    const displayMessage = useCallback((msg, type) => {
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
        }, 5000);
    }, []);

    // Función para generar un SKU único a partir de un nombre, limpiando y añadiendo un hash
    // Se mueve a AddEditProductFormLogic si solo se usa allí. Si ProductFilterAndSearch la necesita, se mantiene aquí.
    // De momento, la mantenemos aquí por si acaso, aunque la de Logic será la que se use realmente para la creación.
    const generateSkuFromName = useCallback((name) => {
        if (!name || name.trim() === '') return '';
        const cleanedName = name
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .trim()
            .toUpperCase()
            .split(/\s+/)
            .slice(0, 4)
            .join('-');
        const hash = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${cleanedName.substring(0, 15)}-${hash}`;
    }, []);

    // Función para alternar la visibilidad de las variantes de un producto
    const toggleProductExpansion = useCallback((productId) => {
        setExpandedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    }, []);

    // Function to navigate to the previous page in pagination.
    const goToPrevPage = useCallback(() => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    }, []);

    // Function to navigate to the next page in pagination.
    const goToNextPage = useCallback(() => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    }, [totalPages]);

    // Obtiene productos del backend basados en los filtros y paginación actuales.
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            setSuccessMessage('');

            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('searchTerm', searchTerm);
            if (selectedCategory && selectedCategory !== 'Todas las Categorías') queryParams.append('category', selectedCategory);
            if (selectedBrand && selectedBrand !== 'Todas las Marcas') queryParams.append('brand', selectedBrand);
            if (selectedSupplier && selectedSupplier !== 'Todos los Proveedores') queryParams.append('supplier', selectedSupplier);
            if (selectedVariantColor && selectedVariantColor !== 'Todos los Colores') queryParams.append('variantColor', selectedVariantColor);
            if (selectedVariantSize && selectedVariantSize !== 'Todas las Tallas') queryParams.append('variantSize', selectedVariantSize);

            queryParams.append('page', currentPage);
            queryParams.append('limit', limit);

            if (sortBy) queryParams.append('sortBy', sortBy);
            if (sortOrder) queryParams.append('sortOrder', sortOrder);

            const response = await axiosInstance.get(`/products?${queryParams.toString()}`);

            setProducts(response.data.products);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al cargar productos. Por favor, inténtalo de nuevo.';
            displayMessage(errorMessage, 'error');
            setProducts([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedCategory, selectedBrand, selectedSupplier, selectedVariantColor, selectedVariantSize, currentPage, limit, sortBy, sortOrder, displayMessage]);

    // Obtiene todas las categorías, marcas, proveedores, colores y tallas disponibles para los filtros.
    const fetchFilterOptions = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/products?limit=9999');
            const allProducts = response.data.products;

            const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))].sort();
            setAvailableCategories(['Todas las Categorías', ...categories]);

            const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))].sort();
            setAvailableBrands(['Todas las Marcas', ...brands]);

            const suppliers = [...new Set(allProducts.map(p => p.supplier).filter(Boolean))].sort();
            setAvailableSuppliers(['Todos los Proveedores', ...suppliers]);

            const colors = new Set();
            const sizes = new Set();
            allProducts.forEach(p => {
                if (p.variants && p.variants.length > 0) {
                    p.variants.forEach(v => {
                        if (v.color) colors.add(v.color);
                        if (v.size) sizes.add(v.size);
                    });
                } else {
                    if (p.color) colors.add(p.color);
                    if (p.size) sizes.add(p.size);
                }
            });
            setAvailableVariantColors(['Todos los Colores', ...Array.from(colors).sort()]);
            setAvailableVariantSizes(['Todas las Tallas', ...Array.from(sizes).sort()]);

        } catch (err) {
            displayMessage('Error al cargar las opciones de filtro. Algunos filtros pueden no estar disponibles.', 'error');
        }
    }, [displayMessage]);

    // --- FUNCIONES PARA OBTENER ALERTAS DE STOCK DESDE EL BACKEND ---
    const fetchLowStockAlerts = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/products/alerts/low-stock');
            setLowStockAlerts(response.data);
        } catch (err) {
            console.error('Error al cargar alertas de stock bajo:', err.response?.data?.message || err.message);
        }
    }, []);

    const fetchHighStockAlerts = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/products/alerts/high-stock');
            setHighStockAlerts(response.data);
        } catch (err) {
            console.error('Error al cargar alertas de stock alto:', err.response?.data?.message || err.message);
        }
    }, []);

    const fetchVariantInventoryReport = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axiosInstance.get('/products/reports/variants');
            setVariantReport(response.data);
            setShowVariantReport(true);
        } catch (err) {
            console.error('Error al cargar el reporte de variantes:', err.response?.data?.message || err.message);
            displayMessage('Error al cargar el reporte de variantes. Por favor, inténtalo de nuevo.', 'error');
            setVariantReport([]);
            setShowVariantReport(false);
        } finally {
            setLoading(false);
        }
    }, [displayMessage]);


    // Cierra cualquier modal abierto y reinicia los estados relacionados.
    const closeModal = useCallback(() => {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowConfirmModal(false);
        setProductToDelete(null);
        setError('');
        setSuccessMessage('');
        // Reiniciar los estados del formulario para la próxima apertura del modal
        setNewProductInitialData(defaultNewProductState);
    }, [defaultNewProductState]);

    // Abre el modal para añadir un nuevo producto.
    const openAddModal = useCallback(() => {
        setNewProductInitialData(defaultNewProductState); // Asegura un estado inicial limpio
        setShowAddModal(true);
        setError('');
        setSuccessMessage('');
    }, [defaultNewProductState]);


    // Maneja el envío del formulario para añadir un nuevo producto.
    const handleAddProduct = useCallback(async (productDataToSave) => {
        setError('');
        setSuccessMessage('');
        setLoading(true);

        // Prepara los datos para enviar al backend (ya gestionados en AddEditProductFormLogic)
        const productToSend = {
            ...productDataToSave,
            price: Number(productDataToSave.price),
            stock: Number(productDataToSave.stock),
            costPrice: Number(productDataToSave.costPrice),
            isPerishable: Boolean(productDataToSave.isPerishable),
            reorderThreshold: Number(productDataToSave.reorderThreshold),
            optimalMaxStock: Number(productDataToSave.optimalMaxStock),
            shelfLifeDays: Number(productDataToSave.shelfLifeDays),
        };

        productToSend.variants = productDataToSave.variants.map(variant => ({
            ...variant,
            price: Number(variant.price),
            costPrice: Number(variant.costPrice),
            stock: Number(variant.stock),
            isPerishable: Boolean(variant.isPerishable),
            reorderThreshold: Number(variant.reorderThreshold),
            optimalMaxStock: Number(variant.optimalMaxStock),
            shelfLifeDays: Number(variant.shelfLifeDays),
        }));


        try {
            const response = await axiosInstance.post('/products', productToSend);
            displayMessage('Producto añadido exitosamente.', 'success');
            // Optimistic update para no tener que volver a cargar todo el inventario
            setProducts(prev => [response.data, ...prev]);
            closeModal();
            fetchFilterOptions(); // Actualizar opciones de filtro
            fetchLowStockAlerts(); // Actualizar alertas
            fetchHighStockAlerts(); // Actualizar alertas
            fetchProducts(); // Refrescar la lista de productos para asegurar la paginación correcta
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al añadir producto. Por favor, inténtalo de nuevo.';
            displayMessage(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, [displayMessage, closeModal, fetchFilterOptions, fetchLowStockAlerts, fetchHighStockAlerts, setProducts, fetchProducts]);


    // Maneja el envío del formulario para actualizar un producto existente.
    const handleUpdateProduct = useCallback(async (productDataToSave) => {
        if (!productDataToSave || !productDataToSave._id) return;

        setError('');
        setSuccessMessage('');
        setLoading(true);

        const productToSend = {
            ...productDataToSave,
            price: Number(productDataToSave.price),
            stock: Number(productDataToSave.stock),
            costPrice: Number(productDataToSave.costPrice),
            isPerishable: Boolean(productDataToSave.isPerishable),
            reorderThreshold: Number(productDataToSave.reorderThreshold),
            optimalMaxStock: Number(productDataToSave.optimalMaxStock),
            shelfLifeDays: Number(productDataToSave.shelfLifeDays),
        };

        productToSend.variants = productDataToSave.variants.map(variant => ({
            ...variant,
            price: Number(variant.price),
            costPrice: Number(variant.costPrice),
            stock: Number(variant.stock),
            isPerishable: Boolean(variant.isPerishable),
            reorderThreshold: Number(variant.reorderThreshold),
            optimalMaxStock: Number(variant.optimalMaxStock),
            shelfLifeDays: Number(variant.shelfLifeDays),
            ...(variant._id && { _id: variant._id }) // Mantener _id para variantes existentes
        }));

        try {
            const response = await axiosInstance.put(`/products/${productDataToSave._id}`, productToSend);
            displayMessage('Producto actualizado exitosamente.', 'success');
            setProducts(prev => prev.map(p => (p._id === productDataToSave._id ? response.data : p)));
            closeModal();
            fetchFilterOptions();
            fetchLowStockAlerts();
            fetchHighStockAlerts();
            fetchProducts(); // Refrescar la lista de productos para asegurar la paginación correcta
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al actualizar producto. Por favor, inténtalo de nuevo.';
            displayMessage(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, [displayMessage, closeModal, fetchFilterOptions, fetchLowStockAlerts, fetchHighStockAlerts, setProducts, fetchProducts]);


    // Displays a confirmation modal before deleting a product.
    const confirmDeleteProduct = useCallback((productId) => {
        setProductToDelete(productId);
        setShowConfirmModal(true);
        setError('');
        setSuccessMessage('');
    }, []);

    // Handles the actual deletion of a product after user confirmation.
    const handleDeleteProduct = useCallback(async (e) => {
        e.stopPropagation();
        if (!productToDelete) {
            displayMessage('No se pudo identificar el producto a eliminar.', 'error');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccessMessage('');
            await axiosInstance.delete(`/products/${productToDelete}`);

            displayMessage('Producto eliminado exitosamente.', 'success');
            setProducts(prev => {
                const updatedProducts = prev.filter(p => p._id !== productToDelete);
                return updatedProducts;
            });

            // Ajustar página actual si se eliminó el último producto de la página
            if (products.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            } else {
                fetchProducts(); // O simplemente refrescar la lista
            }

            closeModal();
            setProductToDelete(null);
            fetchFilterOptions();
            fetchLowStockAlerts();
            fetchHighStockAlerts();

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al eliminar producto. Por favor, inténtalo de nuevo.';
            displayMessage(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, [productToDelete, products.length, currentPage, fetchProducts, closeModal, fetchFilterOptions, fetchLowStockAlerts, fetchHighStockAlerts, displayMessage, setProducts]);

    // NUEVA FUNCIÓN PARA EXPORTAR EL REPORTE A CSV (pasa a VariantReportTable)
    const exportVariantReportToCSV = useCallback((data) => {
        if (!data || data.length === 0) {
            displayMessage('No hay datos en el reporte para exportar.', 'error');
            return;
        }

        const headers = [
            'Producto Principal', 'Variante', 'SKU Variante', 'Stock', 'Precio Venta Unitario',
            'Valor Total (Stock * Precio)', 'Costo Unitario', 'Costo Total (Stock * Costo)',
            'Perecedero', 'Umbral Reapro.', 'Vida Útil (Días)'
        ];

        const csvRows = data.map(item => {
            return [
                `"${item.productName}"`,
                `"${item.variantName}"`,
                `"${item.variantSku}"`,
                item.variantStock,
                parseFloat(item.variantPrice).toFixed(2),
                parseFloat(item.variantTotalValue).toFixed(2), // Valor total de venta
                parseFloat(item.variantTotalCostValue).toFixed(2), // Valor total de costo
                item.variantIsPerishable ? 'Sí' : 'No',
                item.variantReorderThreshold,
                item.variantShelfLifeDays > 0 ? `${item.variantShelfLifeDays} días` : 'N/A'
            ].join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'reporte_inventario_variantes.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            displayMessage('Reporte exportado exitosamente a CSV.', 'success');
        } else {
            window.open('data:text/csv;charset=utf-8,' + escape(csvContent));
            displayMessage('Reporte generado en una nueva ventana. Por favor, guarda el archivo manualmente.', 'success');
        }
    }, [displayMessage]);

    // Efecto para obtener productos y opciones de filtro al montar el componente y cuando las dependencias cambian.
    useEffect(() => {
        // Este efecto se encarga de recargar la lista de productos cuando cambian los filtros o la paginación.
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        // Este efecto se ejecuta UNA SOLA VEZ al montar la página para cargar datos que no cambian con frecuencia.
        // Se encadenan con async/await para que se ejecuten en orden y no ahoguen al navegador.
        const loadInitialData = async () => {
            await fetchFilterOptions();
            await fetchLowStockAlerts();
            await fetchHighStockAlerts();
            // Ya no llamamos a fetchExchangeRate aquí, el CurrencyContext se encarga.
        };
        loadInitialData();
    }, [fetchFilterOptions, fetchLowStockAlerts, fetchHighStockAlerts]);


    // JSX para renderizar el componente de la página de inventario
    return (
        <ErrorBoundary>
            {/* Este div ya no necesita clases de layout (padding, background, height)
                porque el DashboardLayout ya las proporciona. Solo actúa como un contenedor. */}
            <div>
                {/* Mensaje de error destacado */}
                {error && (
                    <div className="mb-4 p-4 bg-red-900 bg-opacity-30 text-red-300 rounded-lg text-center font-semibold">
                        {error}
                    </div>
                )}

                <Suspense fallback={<div>Cargando tasa...</div>}>
                    <ExchangeRateDisplay
                        exchangeRate={exchangeRate}
                        loading={loadingCurrency}
                        error={currencyError}
                        formatPrice={formatPrice}
                        primaryCurrency={exchangeRate?.fromCurrency || 'USD'}
                        secondaryCurrency={exchangeRate?.toCurrency || 'VES'}
                    />
                </Suspense>
                <button
                    onClick={() => setShowExchangeRateModal(true)}
                    className="bg-action-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Configurar Tasa
                </button>

                {/* Visualización de Mensajes de Éxito y Error */}
                <Suspense fallback={<div>Cargando mensajes...</div>}>
                    <MessageDisplay successMessage={successMessage} error={error} />
                </Suspense>

                {/* Modal de Confirmación para Eliminación */}
                <Suspense fallback={<div>Cargando confirmación...</div>}>
                    <ConfirmDeleteModal
                        isOpen={showConfirmModal}
                        onClose={closeModal}
                        onConfirm={handleDeleteProduct}
                        title="Confirmar Eliminación"
                        message="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
                    />
                </Suspense>

                {/* Sección de Búsqueda, Filtros y Añadir Producto */}
                <Suspense fallback={<div className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8 border border-neutral-gray-700 h-32 flex items-center justify-center text-neutral-light">Cargando filtros...</div>}>
                    <ProductFilterAndSearch
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        availableCategories={availableCategories}
                        selectedBrand={selectedBrand}
                        setSelectedBrand={setSelectedBrand}
                        availableBrands={availableBrands}
                        selectedSupplier={selectedSupplier}
                        setSelectedSupplier={setSelectedSupplier}
                        availableSuppliers={availableSuppliers}
                        selectedVariantColor={selectedVariantColor}
                        setSelectedVariantColor={setSelectedVariantColor}
                        availableVariantColors={availableVariantColors}
                        selectedVariantSize={selectedVariantSize}
                        setSelectedVariantSize={setSelectedVariantSize}
                        availableVariantSizes={availableVariantSizes}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        onAddProductClick={openAddModal}
                    />
                </Suspense>

                {/* Controles para Reportes y Acciones Masivas */}
                <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8 border border-neutral-gray-700 flex flex-wrap gap-4 justify-between items-center">
                    <button
                        onClick={() => {
                            if (!showVariantReport) {
                                fetchVariantInventoryReport();
                            } else {
                                setShowVariantReport(false);
                                setVariantReport([]);
                            }
                        }}
                        className="bg-action-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center text-sm shadow-md"
                    >
                        {showVariantReport ? 'Ocultar Reporte de Variantes' : 'Mostrar Reporte de Variantes'}
                    </button>
                    {showVariantReport && variantReport.length > 0 && (
                        <Suspense fallback={<div>Cargando exportación...</div>}>
                            <button
                                onClick={() => exportVariantReportToCSV(variantReport)}
                                className="bg-success-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center text-sm shadow-md"
                            >
                                Exportar Reporte a CSV
                                <Upload size={16} className="ml-2" />
                            </button>
                        </Suspense>
                    )}
                </div>

                {/* Modal para Configurar Tasa de Cambio */}
                <Suspense fallback={<div>Cargando modal de tasa...</div>}>
                    {showExchangeRateModal && (
                        <ExchangeRateModal
                            isOpen={showExchangeRateModal}
                            onClose={() => setShowExchangeRateModal(false)}
                            currentExchangeRate={exchangeRate}
                            loading={loadingCurrency}
                            error={currencyError}
                            onSave={updateExchangeRate}
                        />
                    )}
                </Suspense>

                {/* Botón para la Lógica de Actualización Inteligente de Precios */}
                <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8 border border-neutral-gray-700 flex flex-wrap gap-4 justify-between items-center">
                    <button
                        onClick={() => displayMessage('La lógica de actualización inteligente de precios se implementará aquí.', 'info')}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md flex items-center justify-center text-sm"
                    >
                        Sugerir Actualización de Precios (Devaluación)
                    </button>
                </div>

                {/* Sección de Alertas de Stock */}
                <Suspense fallback={<div className="mb-6 p-4 border rounded-md bg-yellow-900 bg-opacity-20 text-yellow-300">Cargando alertas...</div>}>
                    <InventoryAlerts lowStockAlerts={lowStockAlerts} highStockAlerts={highStockAlerts} />
                </Suspense>

                <h3 className="text-3xl font-semibold text-neutral-light mb-6 border-b border-neutral-gray-700 pb-3">Lista de Productos</h3>

                {/* Renderizado condicional para carga, no hay productos o lista de productos */}
                {loading && !products?.length ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 size={48} className="animate-spin text-copper-rose-accent" />
                        <span className="sr-only">Cargando...</span>
                    </div>
                ) : products?.length === 0 ? (
                    <p className="text-neutral-gray-300 text-lg text-center mt-10">No hay productos que coincidan con la búsqueda o el filtro. ¡Intenta añadir uno!</p>
                ) : (
                    <Suspense fallback={
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <div className="h-64 bg-deep-night-blue rounded-lg animate-pulse"></div>
                            <div className="h-64 bg-deep-night-blue rounded-lg animate-pulse"></div>
                            <div className="h-64 bg-deep-night-blue rounded-lg animate-pulse"></div>
                        </div>
                    }>
                        <ProductList
                            products={products}
                            handleEditClick={(product) => {
                                // Prepara los datos del producto para el modal de edición
                                setEditingProduct({
                                    ...product,
                                    price: product.price !== undefined && product.price !== null ? parseFloat(product.price).toFixed(2) : '',
                                    costPrice: product.costPrice !== undefined && product.costPrice !== null ? parseFloat(product.costPrice).toFixed(2) : '',
                                    unitOfMeasure: product.unitOfMeasure || 'unidad',
                                    brand: product.brand || '',
                                    supplier: product.supplier || '',
                                    description: product.description || '',
                                    imageUrl: product.imageUrl || '',
                                    color: product.color || '',
                                    size: product.size || '',
                                    material: product.material || '',
                                    isPerishable: product.isPerishable || false,
                                    reorderThreshold: product.reorderThreshold || 0,
                                    optimalMaxStock: product.optimalMaxStock || 0,
                                    shelfLifeDays: product.shelfLifeDays || 0,
                                    variants: product.variants ? product.variants.map(v => ({
                                        ...v,
                                        price: parseFloat(v.price).toFixed(2),
                                        costPrice: parseFloat(v.costPrice).toFixed(2),
                                        stock: Number(v.stock),
                                        unitOfMeasure: v.unitOfMeasure || 'unidad',
                                        color: v.color || '',
                                        size: v.size || '',
                                        material: v.material || '',
                                        imageUrl: v.imageUrl || '',
                                        // SKU autogenerado de variante (si no tiene uno manual)
                                        autoGeneratedVariantSku: v.sku && v.sku.trim() !== '' ? '' : generateSkuFromName(v.name || ''),
                                        isPerishable: v.isPerishable || false,
                                        reorderThreshold: v.reorderThreshold || 0,
                                        optimalMaxStock: v.optimalMaxStock || 0,
                                        shelfLifeDays: v.shelfLifeDays || 0,
                                    })) : [],
                                });
                                setShowEditModal(true);
                                setShowAddModal(false);
                                setError('');
                                setSuccessMessage('');
                            }}
                            confirmDeleteProduct={confirmDeleteProduct}
                            expandedProducts={expandedProducts}
                            toggleProductExpansion={toggleProductExpansion}
                        />
                    </Suspense>
                )}

                {/* Modal para Añadir Producto */}
                <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"><Loader2 size={48} className="animate-spin text-action-blue" /></div>}>
                    {showAddModal && (
                        <ProductModal
                            isOpen={showAddModal}
                            onClose={closeModal}
                            title="Añadir Nuevo Producto"
                        >
                            {/* Ahora renderizamos AddEditProductFormLogic */}
                            <AddEditProductFormLogic
                                isNewProduct={true}
                                initialProductData={newProductInitialData} // Pasa el estado inicial para el nuevo producto
                                onProductSave={handleAddProduct} // Callback para guardar
                                loading={loading}
                                displayMessage={displayMessage}
                                unitOfMeasureOptions={unitOfMeasureOptions}
                                debounceTimeoutRef={debounceTimeoutRef}
                                currencyContext={useCurrency()} // Pasamos el contexto completo
                            />
                        </ProductModal>
                    )}
                </Suspense>

                {/* Modal para Editar Producto */}
                <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"><Loader2 size={48} className="animate-spin text-action-blue" /></div>}>
                    {showEditModal && editingProduct && (
                        <ProductModal
                            isOpen={showEditModal}
                            onClose={closeModal}
                            title={`Editar Producto: ${editingProduct?.name || ''}`}
                        >
                            {/* Ahora renderizamos AddEditProductFormLogic */}
                            <AddEditProductFormLogic
                                isNewProduct={false}
                                initialProductData={editingProduct} // Pasa el producto a editar
                                onProductSave={handleUpdateProduct} // Callback para actualizar
                                loading={loading}
                                displayMessage={displayMessage}
                                unitOfMeasureOptions={unitOfMeasureOptions}
                                debounceTimeoutRef={debounceTimeoutRef}
                                currencyContext={useCurrency()} // Pasamos el contexto completo
                            />
                        </ProductModal>
                    )}
                </Suspense>


                {/* Reporte de Inventario por Variante */}
                <Suspense fallback={<div className="mt-12 bg-deep-night-blue p-8 rounded-lg shadow-2xl border border-action-blue-light h-64 flex items-center justify-center text-neutral-light">Cargando reporte...</div>}>
                    {showVariantReport && variantReport.length > 0 && (
                        <VariantReportTable
                            variantReport={variantReport}
                            loading={loading}
                            exportVariantReportToCSV={exportVariantReportToCSV}
                        />
                    )}
                    {showVariantReport && variantReport.length === 0 && !loading && (
                        <p className="text-neutral-gray-300 text-lg text-center mt-10">No hay datos de variantes para generar el reporte.</p>
                    )}
                </Suspense>

                {/* Controles de Paginación */}
                <Suspense fallback={<div>Cargando paginación...</div>}>
                    {totalPages > 1 && (
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            goToPrevPage={goToPrevPage}
                            goToNextPage={goToNextPage}
                            loading={loading}
                        />
                    )}
                </Suspense>
            </div>
        </ErrorBoundary>
    );
}

export default InventoryPage;