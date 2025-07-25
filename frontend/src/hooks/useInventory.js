import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useDebounce } from './useDebounce';

export const useInventory = () => {
    // Estados de datos
    const [products, setProducts] = useState([]);
    const [filterOptions, setFilterOptions] = useState({
        categories: [], brands: [], suppliers: [], variantColors: [], variantSizes: []
    });

    // Estados de UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados de filtros y paginación
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('Todas las Categorías');
    const [brand, setBrand] = useState('Todas las Marcas');
    const [supplier, setSupplier] = useState('Todos los Proveedores');
    const [variantColor, setVariantColor] = useState('Todos los Colores');
    const [variantSize, setVariantSize] = useState('Todas las Tallas');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Función para obtener los productos del backend
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page, limit: 10, sortBy, sortOrder });
            if (debouncedSearchTerm) params.append('searchTerm', debouncedSearchTerm);
            if (category !== 'Todas las Categorías') params.append('category', category);
            if (brand !== 'Todas las Marcas') params.append('brand', brand);
            if (supplier !== 'Todos los Proveedores') params.append('supplier', supplier);
            if (variantColor !== 'Todos los Colores') params.append('variantColor', variantColor);
            if (variantSize !== 'Todas las Tallas') params.append('variantSize', variantSize);

            const response = await axiosInstance.get(`/products?${params.toString()}`);
            setProducts(response.data.products);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cargar productos.');
            setProducts([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearchTerm, category, brand, supplier, variantColor, variantSize, sortBy, sortOrder]);

    // Función para obtener las opciones de los filtros (categorías, marcas, etc.)
    const fetchFilterOptions = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/products/filter-options');
            const { categories, brands, suppliers, variantColors, variantSizes } = response.data;
            setFilterOptions({
                categories: ['Todas las Categorías', ...categories],
                brands: ['Todas las Marcas', ...brands],
                suppliers: ['Todos los Proveedores', ...suppliers],
                variantColors: ['Todos los Colores', ...variantColors],
                variantSizes: ['Todas las Tallas', ...variantSizes],
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cargar opciones de filtro.');
        }
    }, []);

    // Efecto para resetear la página a 1 cuando los filtros cambian
    useEffect(() => {
        if (page !== 1) setPage(1);
    }, [debouncedSearchTerm, category, brand, supplier, variantColor, variantSize, sortBy, sortOrder]);

    // Efecto para obtener los productos cuando cambian los filtros o la página
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Efecto para cargar las opciones de filtro una sola vez al montar el componente
    useEffect(() => {
        fetchFilterOptions();
    }, [fetchFilterOptions]);

    // Función para refrescar todos los datos, útil después de añadir/editar/eliminar un producto
    const refreshData = useCallback(() => {
        fetchProducts();
        fetchFilterOptions();
    }, [fetchProducts, fetchFilterOptions]);

    return {
        products, loading, error, setError, page, totalPages, setPage,
        filters: { searchTerm, category, brand, supplier, variantColor, variantSize, sortBy, sortOrder },
        setters: { setSearchTerm, setCategory, setBrand, setSupplier, setVariantColor, setVariantSize, setSortBy, setSortOrder },
        filterOptions, refreshData
    };
};