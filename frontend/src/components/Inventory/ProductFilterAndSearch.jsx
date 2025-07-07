// src/components/Inventory/ProductFilterAndSearch.jsx
import React, { useRef, useState } from 'react';
import { Search, XCircle, PlusSquare, Filter } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { ChevronDown, BarChart2, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
    const { theme } = useTheme();

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

    // Clases dinámicas basadas en el tema - aquí está la salsa del asunto
    const containerClasses = `
        sticky top-0 z-20 backdrop-blur-md shadow-lg px-4 py-3 rounded-3xl mb-6 
        flex flex-col gap-4 border transition-all duration-300 ease-in-out
        ${theme === 'light' 
            ? 'bg-surface-primary/90 border-border-subtle' 
            : 'bg-gray-800/90 border-gray-600'
        }
    `;

    // Input con mejor contraste en tema oscuro - fondo claro y texto oscuro
    const inputClasses = `
        w-full py-2 pl-10 pr-10 rounded-full border transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${theme === 'light'
            ? 'border-border-subtle bg-surface-secondary text-text-base placeholder-text-muted'
            : 'border-gray-400 bg-gray-100 text-gray-900 placeholder-gray-500'
        }
    `;

    // Aquí está la magia pa' que los selects se vean brutal en ambos temas
    const selectClasses = `
        rounded-full border py-1.5 pl-1 pr-1 text-center duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer
        appearance-none bg-no-repeat bg-right bg-[length:16px_16px] pr-8
        ${theme === 'light'
            ? 'border-border-subtle bg-surface-secondary text-text-base bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")]'
            : 'border-gray-500 bg-gray-700 text-gray-100 bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23d1d5db\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")]'
        }
    `;

    // Aquí está el flow mejorado para el botón de filtros
    const filterButtonClasses = `
        px-3 py-2 rounded-full font-medium flex items-center gap-1 transition-all duration-300 ease-in-out
        ${filtersVisible
            ? theme === 'light'
                ? "bg-blue-600 text-white shadow-md"
                : "bg-action-blue-light text-white shadow-md"
            : theme === 'light'
                ? "bg-surface-tertiary hover:bg-surface-secondary text-text-base hover:text-text-emphasis"
                : "bg-gray-200 hover:bg-gray-100 text-gray-800 hover:text-gray-900 shadow-sm"
        }
    `;
    // Aquí está el flow mejorado para el botón del menú de acciones
    const menuButtonClasses = `
        px-3 py-2 rounded-full font-medium flex items-center gap-1 transition-all duration-300 ease-in-out
        ${theme === 'light'
            ? 'bg-surface-tertiary hover:bg-surface-secondary text-text-base hover:text-text-emphasis'
            : 'bg-gray-200 hover:bg-gray-100 text-gray-800 hover:text-gray-900 shadow-sm'
        }
    `;

    const menuItemsClasses = `
        absolute right-0 mt-2 w-56 origin-top-right border rounded-2xl shadow-lg focus:outline-none z-50
        transition-all duration-200 ease-in-out
        ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-gray-200 border-gray-400'}
    `;

    // Iconos con mejor contraste - adaptados al fondo claro del input en tema oscuro
    const iconColor = theme === 'light' ? 'text-text-muted' : 'text-gray-600';
    const iconHoverColor = theme === 'light' ? 'hover:text-text-base' : 'hover:text-gray-800';

    // Estilos inline pa' los options que algunos navegadores respetan
    const optionStyles = theme === 'light' 
        ? { backgroundColor: '#ffffff', color: '#1f2937' }
        : { backgroundColor: '#374151', color: '#f9fafb' };

    return (
        <div className={containerClasses}>
            {/* Barra superior: búsqueda y acciones */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                {/* Búsqueda - Extendida horizontalmente */}
                <div className="relative w-full md:w-[480px] lg:w-[480px]">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, SKU, Marca..."
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                        className={inputClasses}
                    />
                    <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconColor} transition-colors duration-300`} />
                    {searchTerm && (
                        <XCircle
                            size={20}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${iconColor} ${iconHoverColor} cursor-pointer transition-colors duration-300`}
                            onClick={handleClearSearch}
                        />
                    )}
                </div>

                {/* Acciones principales */}
                <div className="flex items-center gap-2 mt-2 md:mt-0 flex-shrink-0">
                    <button
                        className={filterButtonClasses}
                        onClick={handleToggleFilters}
                    >
                        <Filter size={18} /> {filtersVisible ? "Ocultar filtros" : "Mostrar filtros"}
                    </button>

                    {/* Menú Acciones */}
                    <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className={menuButtonClasses}>
                            Acciones <ChevronDown size={16} />
                        </Menu.Button>
                        <Menu.Items className={menuItemsClasses}>
                            <div className="py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={onShowReportClick}
                                            className={`flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 text-gray-900 ${
                                                active ? 'bg-gray-300' : 'hover:bg-gray-300'
                                            }`}
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
                                            className={`flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 text-gray-900 ${
                                                active ? 'bg-gray-300' : 'hover:bg-gray-300'
                                            }`}
                                        >
                                            <AlertTriangle size={16} className="mr-2" />
                                            Sugerir Precios
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Menu>

                    {/* Botón Añadir - con color azul fijo y hover verde */}
                    <button
                        className="px-4 py-2 rounded-full bg-blue-600 hover:bg-green-600 text-white font-bold flex items-center gap-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
                        onClick={onAddProductClick}
                    >
                        <PlusSquare size={18} /> Añadir Producto
                    </button>
                </div>
            </div>

            {/* Filtros rápidos: solo visibles si filtersVisible es true */}
            {filtersVisible && (
                <div className="flex flex-wrap gap-2 mt-2 animate-in slide-in-from-top-2 duration-200 [&>select]:w-auto [&>select]:min-w-fit">
                    <select
                        id="categoryFilter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={selectClasses}
                        style={theme === 'dark' ? { colorScheme: 'dark' } : {}}
                    >
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat} style={optionStyles}>{cat}</option>
                        ))}
                    </select>
                    <select
                        id="brandFilter"
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className={selectClasses}
                        style={theme === 'dark' ? { colorScheme: 'dark' } : {}}
                    >
                        {availableBrands.map(brand => (
                            <option key={brand} value={brand} style={optionStyles}>{brand}</option>
                        ))}
                    </select>
                    <select
                        id="supplierFilter"
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                        className={selectClasses}
                        style={theme === 'dark' ? { colorScheme: 'dark' } : {}}
                    >
                        {availableSuppliers.map(supplier => (
                            <option key={supplier} value={supplier} style={optionStyles}>{supplier}</option>
                        ))}
                    </select>
                    <select
                        id="variantColorFilter"
                        value={selectedVariantColor}
                        onChange={(e) => setSelectedVariantColor(e.target.value)}
                        className={selectClasses}
                        style={theme === 'dark' ? { colorScheme: 'dark' } : {}}
                    >
                        {availableVariantColors.map(color => (
                            <option key={color} value={color} style={optionStyles}>{color}</option>
                        ))}
                    </select>
                    <select
                        id="variantSizeFilter"
                        value={selectedVariantSize}
                        onChange={(e) => setSelectedVariantSize(e.target.value)}
                        className={selectClasses}
                        style={theme === 'dark' ? { colorScheme: 'dark' } : {}}
                    >
                        {availableVariantSizes.map(size => (
                            <option key={size} value={size} style={optionStyles}>{size}</option>
                        ))}
                    </select>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={selectClasses}
                        style={theme === 'dark' ? { colorScheme: 'dark' } : {}}
                    >
                        <option value="createdAt" style={optionStyles}>Fecha</option>
                        <option value="name" style={optionStyles}>Nombre</option>
                        <option value="price" style={optionStyles}>Precio</option>
                        <option value="stock" style={optionStyles}>Stock</option>
                        <option value="category" style={optionStyles}>Categoría</option>
                        <option value="brand" style={optionStyles}>Marca</option>
                    </select>
                    <select
                        id="sortOrder"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className={selectClasses}
                        style={theme === 'dark' ? { colorScheme: 'dark' } : {}}
                    >
                        <option value="asc" style={optionStyles}>Ascendente</option>
                        <option value="desc" style={optionStyles}>Descendente</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default ProductFilterAndSearch;