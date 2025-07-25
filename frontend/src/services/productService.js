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

// En el futuro, podrías mover más lógica aquí, como:
// const deleteProduct = (id) => axiosInstance.delete(`/products/${id}`);

export const productService = {
    getLowStockProducts,
    getHighStockProducts,
    getVariantInventoryReport,
};