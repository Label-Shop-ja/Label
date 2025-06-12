// src/components/Inventory/ProductFilterAndSearch.jsx
import React, { useRef } from 'react';
import { Search, XCircle, PlusSquare, ChevronDown, ChevronUp, Info } from 'lucide-react'; // Íconos

const ProductFilterAndSearch = ({
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory, availableCategories,
    selectedBrand, setSelectedBrand, availableBrands,
    selectedSupplier, setSelectedSupplier, availableSuppliers,
    selectedVariantColor, setSelectedVariantColor, availableVariantColors,
    selectedVariantSize, setSelectedVariantSize, availableVariantSizes,
    sortBy, setSortBy, sortOrder, setSortOrder,
    onAddProductClick,
    // Las siguientes props ya no son gestionadas directamente por este componente
    // pero se mantienen para compatibilidad si ProductFilterAndSearch realmente necesita "leerlas"
    // para mostrar sugerencias globales, aunque la lógica de fetch se ha movido al padre.
    fetchGlobalProductSuggestions, // Este prop se pasa desde InventoryPage, pero su lógica de debounce/fetch está en AddEditProductFormLogic
    globalProductSuggestions,
    showGlobalSuggestions,
    setShowGlobalSuggestions,
    noGlobalSuggestionsFound,
    handleSelectGlobalProduct,
}) => {
    // Referencia para el temporizador de debounce en la búsqueda de sugerencias
    // NOTA: Esta referencia es para el debounce del buscador general, no del de sugerencias de AddEditProductForm
    const debounceTimeoutRef = useRef(null);

    // Maneja los cambios en el término de búsqueda.
    // La lógica de debounce para "fetchGlobalProductSuggestions" ya no se maneja aquí directamente
    // porque ProductFilterAndSearch solo busca en tu inventario local.
    // Las sugerencias globales son parte del formulario de AÑADIR.
    const handleSearchTermChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        // Si tienes una función de búsqueda principal en InventoryPage, la llamarías aquí después de un debounce.
        // Por ahora, setSearchTerm por sí solo dispara el fetchProducts en InventoryPage vía useEffect.
    };

    // Función para limpiar el término de búsqueda y TODOS los filtros
    const handleClearSearch = () => {
        setSearchTerm(''); // Limpia el término de búsqueda
        setSelectedCategory('Todas las Categorías'); // Restablece categoría
        setSelectedBrand('Todas las Marcas'); // Restablece marca
        setSelectedSupplier('Todos los Proveedores'); // Restablece proveedor
        setSelectedVariantColor('Todos los Colores'); // Restablece color de variante
        setSelectedVariantSize('Todas las Tallas'); // Restablece talla de variante
        setSortBy('createdAt'); // Opcional: restablece el ordenamiento a default si lo deseas
        setSortOrder('desc');   // Opcional: restablece el ordenamiento a default si lo deseas
    };

    return (
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8 border border-neutral-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-center">
            {/* Campo de Búsqueda Consolidado */}
            <div className="relative col-span-full mb-4 md:mb-0">
                <input
                    type="text"
                    placeholder="Buscar por nombre, SKU, Marca, Proveedor..."
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                    className="shadow appearance-none border border-neutral-gray-700 rounded-full w-full py-2 px-4 pl-10 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500 text-neutral-light"
                    // Eliminamos onBlur y onFocus relacionados con sugerencias globales aquí
                    // Ya que la lógica de sugerencias globales está en AddEditProductFormLogic.
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-400" />
                {searchTerm && ( // Solo muestra la X si hay un término de búsqueda
                    <XCircle
                        size={20}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-300"
                        onClick={handleClearSearch} // Llama a la nueva función para limpiar
                    />
                )}
            </div>

            {/* Desplegables de Filtro - Diseño Responsivo */}
            <select
                id="categoryFilter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="shadow appearance-none border border-neutral-gray-700 rounded-full w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer text-neutral-light"
            >
                {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            <select
                id="brandFilter"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="shadow appearance-none border border-neutral-gray-700 rounded-full w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer text-neutral-light"
            >
                {availableBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                ))}
            </select>

            <select
                id="supplierFilter"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="shadow appearance-none border border-neutral-gray-700 rounded-full w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer text-neutral-light"
            >
                {availableSuppliers.map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                ))}
            </select>

            <select
                id="variantColorFilter"
                value={selectedVariantColor}
                onChange={(e) => setSelectedVariantColor(e.target.value)}
                className="shadow appearance-none border border-neutral-gray-700 rounded-full w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer text-neutral-light"
            >
                {availableVariantColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                ))}
            </select>

            <select
                id="variantSizeFilter"
                value={selectedVariantSize}
                onChange={(e) => setSelectedVariantSize(e.target.value)}
                className="shadow appearance-none border border-neutral-gray-700 rounded-full w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer text-neutral-light"
            >
                {availableVariantSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                ))}
            </select>

            {/* Selector para Ordenar Por */}
            <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="shadow appearance-none border border-neutral-gray-700 rounded-full w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer text-neutral-light"
            >
                <option value="createdAt">Ordenar por Fecha</option>
                <option value="name">Ordenar por Nombre</option>
                <option value="price">Ordenar por Precio</option>
                <option value="stock">Ordenar por Stock</option>
                <option value="category">Ordenar por Categoría</option>
                <option value="brand">Ordenar por Marca</option>
            </select>

            {/* Selector para Ordenar Dirección */}
            <select
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="shadow appearance-none border border-neutral-gray-700 rounded-full w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer text-neutral-light"
            >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
            </select>

            {/* Botón para Añadir Nuevo Producto */}
            <button
                onClick={onAddProductClick}
                type="button"
                className="col-span-full md:col-span-1 lg:col-span-2 xl:col-span-1 bg-action-blue hover:bg-blue-700 text-neutral-light font-bold py-3 px-6 rounded-lg text-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center w-full mt-4 md:mt-0"
            >
                <PlusSquare size={24} className="mr-2" /> Añadir Nuevo Producto
            </button>
        </div>
    );
};

export default ProductFilterAndSearch;
