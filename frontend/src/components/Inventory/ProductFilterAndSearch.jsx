// src/components/Inventory/ProductFilterAndSearch.jsx
import React, { useRef, useState } from 'react';
import { Search, XCircle, PlusSquare, Filter } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { ChevronDown, BarChart2, AlertTriangle } from 'lucide-react';

const ProductFilterAndSearch = ({
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory, availableCategories,
    selectedBrand, setSelectedBrand, availableBrands,
    selectedSupplier, setSelectedSupplier, availableSuppliers,
    selectedVariantColor, setSelectedVariantColor, availableVariantColors,
    selectedVariantSize, setSelectedVariantSize, availableVariantSizes,
    sortBy, setSortBy, sortOrder, setSortOrder,
    onAddProductClick,
    onShowReportClick,
    onSuggestPricesClick,
}) => {
    const debounceTimeoutRef = useRef(null);
    const [filtersVisible, setFiltersVisible] = useState(false);

    const handleSearchTermChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSelectedCategory('Todas las Categorías');
        setSelectedBrand('Todas las Marcas');
        setSelectedSupplier('Todos los Proveedores');
        setSelectedVariantColor('Todos los Colores');
        setSelectedVariantSize('Todas las Tallas');
        setSortBy('createdAt');
        setSortOrder('desc');
    };

    const handleToggleFilters = () => {
        setFiltersVisible((prev) => !prev);
    };

    return (
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow px-4 py-3 rounded-lg mb-6 flex flex-col gap-4 border border-neutral-gray-200">
            {/* Barra superior: búsqueda y acciones */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                {/* Búsqueda */}
                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, SKU, Marca, Proveedor..."
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                        className="w-full py-2 pl-10 pr-10 rounded-full border border-neutral-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-gray-400" />
                    {searchTerm && (
                        <XCircle
                            size={20}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                            onClick={handleClearSearch}
                        />
                    )}
                </div>
                {/* Acciones principales */}
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <button
                        className={`px-3 py-2 rounded-full font-medium flex items-center gap-1 transition ${
                            filtersVisible
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                        onClick={handleToggleFilters}
                    >
                        <Filter size={18} /> {filtersVisible ? "Ocultar filtros" : "Mostrar filtros"}
                    </button>
                    {/* Menú Acciones */}
                    <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium flex items-center gap-1 transition">
                            Acciones <ChevronDown size={16} />
                        </Menu.Button>
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
                            <div className="py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={onShowReportClick}
                                            className={`${
                                                active ? 'bg-gray-100' : ''
                                            } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                        >
                                            <BarChart2 size={16} className="mr-2" />
                                            Reporte de Variantes
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={onSuggestPricesClick}
                                            className={`${
                                                active ? 'bg-gray-100' : ''
                                            } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                        >
                                            <AlertTriangle size={16} className="mr-2" />
                                            Sugerir Precios
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Menu>
                    {/* Botón Añadir */}
                    <button
                        className="px-3 py-2 rounded-full bg-green-600 text-white font-medium flex items-center gap-1 hover:bg-green-700 transition"
                        onClick={onAddProductClick}
                    >
                        <PlusSquare size={18} /> Añadir
                    </button>
                </div>
            </div>
            {/* Filtros rápidos: solo visibles si filtersVisible es true */}
            {filtersVisible && (
                <div className="flex flex-wrap gap-2 mt-2">
                    <select
                        id="categoryFilter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="rounded-full border border-neutral-gray-300 bg-white py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select
                        id="brandFilter"
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="rounded-full border border-neutral-gray-300 bg-white py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                        {availableBrands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                    <select
                        id="supplierFilter"
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                        className="rounded-full border border-neutral-gray-300 bg-white py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                        {availableSuppliers.map(supplier => (
                            <option key={supplier} value={supplier}>{supplier}</option>
                        ))}
                    </select>
                    <select
                        id="variantColorFilter"
                        value={selectedVariantColor}
                        onChange={(e) => setSelectedVariantColor(e.target.value)}
                        className="rounded-full border border-neutral-gray-300 bg-white py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                        {availableVariantColors.map(color => (
                            <option key={color} value={color}>{color}</option>
                        ))}
                    </select>
                    <select
                        id="variantSizeFilter"
                        value={selectedVariantSize}
                        onChange={(e) => setSelectedVariantSize(e.target.value)}
                        className="rounded-full border border-neutral-gray-300 bg-white py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                        {availableVariantSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="rounded-full border border-neutral-gray-300 bg-white py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                        <option value="createdAt">Fecha</option>
                        <option value="name">Nombre</option>
                        <option value="price">Precio</option>
                        <option value="stock">Stock</option>
                        <option value="category">Categoría</option>
                        <option value="brand">Marca</option>
                    </select>
                    <select
                        id="sortOrder"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="rounded-full border border-neutral-gray-300 bg-white py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                        <option value="asc">Ascendente</option>
                        <option value="desc">Descendente</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default ProductFilterAndSearch;
