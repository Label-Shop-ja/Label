import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export const useProductEdit = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateProductWithReason = async (productId, productData, changeData) => {
        setLoading(true);
        setError(null);
        
        try {
            const updateData = {
                ...productData,
                changeReason: changeData.reason,
                changeType: changeData.changeType,
            };

            const response = await axios.put(`${API_URL}/products/${productId}`, updateData);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al actualizar el producto';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getProductChangeLogs = async (productId) => {
        try {
            const response = await axios.get(`${API_URL}/products/${productId}/changes`);
            return response.data;
        } catch (err) {
            console.error('Error fetching product change logs:', err);
            return [];
        }
    };

    return {
        updateProductWithReason,
        getProductChangeLogs,
        loading,
        error,
    };
};