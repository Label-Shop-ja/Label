// src/services/productService.js
import axiosInstance from '../api/axiosInstance';

const getLowStockProducts = () => {
    return axiosInstance.get('/products/alerts/low-stock');
};

const getHighStockProducts = () => {
    return axiosInstance.get('/products/alerts/high-stock');
};

const getVariantInventoryReport = () => {
    return axiosInstance.get('/products/reports/variants');
};

const searchGlobalProducts = async (searchTerm) => {
    try {
        const response = await axiosInstance.get(`/products/global-search?q=${encodeURIComponent(searchTerm)}`);
        return response.data;
    } catch (error) {
        console.error('Error searching global products:', error);
        return [];
    }
};

export const productService = {
    getLowStockProducts,
    getHighStockProducts,
    getVariantInventoryReport,
};

export { searchGlobalProducts };