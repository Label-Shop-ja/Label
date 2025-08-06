import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { useReduxTheme } from '../../hooks/useReduxTheme';

const ProductSearchStep = ({ onProductSelect, onNewProduct, searchValue, onSearchChange, onClose }) => {
    const { theme } = useReduxTheme();
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariants, setSelectedVariants] = useState([]);
    
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        const searchProducts = async () => {
            if (searchValue.trim().length < 3) {
                setSearchResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await axiosInstance.get(`/products/global-search?q=${encodeURIComponent(searchValue)}`);
                setSearchResults(response.data || []);
            } catch (error) {
                console.error('Error searching products:', error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(searchProducts, 300);
        return () => clearTimeout(timeoutId);
    }, [searchValue]);

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setSelectedVariants(product.variants?.map((_, index) => index) || []);
    };

    const handleVariantToggle = (variantIndex) => {
        setSelectedVariants(prev => 
            prev.includes(variantIndex) 
                ? prev.filter(i => i !== variantIndex)
                : [...prev, variantIndex]
        );
    };

    const handleContinue = () => {
        const productData = {
            ...selectedProduct,
            variants: selectedProduct.variants?.filter((_, index) => selectedVariants.includes(index)) || []
        };
        onProductSelect(productData);
    };

    const hasNoResults = searchValue.trim().length > 2 && !isLoading && searchResults.length === 0;

    if (selectedProduct) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        {selectedProduct.imageUrl && (
                            <img
                                src={selectedProduct.imageUrl}
                                alt={selectedProduct.name}
                                className="w-16 h-16 object-cover rounded-lg"
                            />
                        )}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {selectedProduct.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {selectedProduct.category}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedProduct(null)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {selectedProduct.variants?.length > 0 && (
                    <div>
                        <h4 className="text-lg font-medium mb-3">Selecciona las variantes que tienes:</h4>
                        <div className="space-y-2">
                            {selectedProduct.variants.map((variant, index) => (
                                <label
                                    key={index}
                                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedVariants.includes(index)}
                                        onChange={() => handleVariantToggle(index)}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <div className="flex-1">
                                        <span className="font-medium">{variant.name}</span>
                                        {(variant.color || variant.size) && (
                                            <span className="text-sm text-gray-500 ml-2">
                                                {[variant.color, variant.size].filter(Boolean).join(' - ')}
                                            </span>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={handleContinue}
                        disabled={selectedProduct.variants?.length > 0 && selectedVariants.length === 0}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Continuar al Formulario
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className={`text-2xl font-bold mb-2 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                    Productos Globales
                </h2>
                <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                    Busca productos existentes o registra uno nuevo
                </p>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Nombre del Producto"
                    className={`block w-full pl-10 pr-3 py-4 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'light' 
                            ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500' 
                            : 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    }`}
                />
            </div>

            {isLoading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Buscando...</p>
                </div>
            )}

            {searchResults.length > 0 && (
                <div className={`rounded-xl shadow-xl border max-h-96 overflow-hidden ${
                    theme === 'light' 
                        ? 'bg-white border-gray-200' 
                        : 'bg-gray-800 border-gray-600'
                }`}>
                    <div className="overflow-y-auto max-h-96">
                    {searchResults.map((product, index) => (
                        <div
                            key={product._id || index}
                            onClick={() => handleProductClick(product)}
                            className={`p-4 cursor-pointer transition-all duration-200 ${
                                theme === 'light'
                                    ? 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                                    : 'hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-500'
                            } ${index !== searchResults.length - 1 ? (theme === 'light' ? 'border-b border-gray-200' : 'border-b border-gray-600') : ''}`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 ${
                                    theme === 'light' ? 'bg-gray-100' : 'bg-gray-600'
                                }`}>
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center text-xl font-bold text-white ${
                                            theme === 'light' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-gray-500 to-gray-700'
                                        }`}>
                                            {product.name?.charAt(0)?.toUpperCase() || 'P'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold text-base truncate ${
                                        theme === 'light' ? 'text-gray-900' : 'text-white'
                                    }`}>
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-sm px-2 py-1 rounded-full ${
                                            theme === 'light' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'bg-blue-900/50 text-blue-300'
                                        }`}>
                                            {product.category}
                                        </span>
                                        {product.variants?.length > 0 && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                theme === 'light' 
                                                    ? 'bg-purple-100 text-purple-700' 
                                                    : 'bg-purple-900/50 text-purple-300'
                                            }`}>
                                                {product.variants.length} variantes
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            )}

            {hasNoResults && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center py-8 rounded-lg shadow-lg border ${
                        theme === 'light' 
                            ? 'bg-white border-gray-200' 
                            : 'bg-gray-700 border-gray-600'
                    }`}
                >
                    <p className={`mb-4 ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                        Sin resultado. Estás Registrando un Nuevo Producto
                    </p>
                    <button
                        onClick={() => onNewProduct(searchValue)}
                        className={`px-6 py-3 text-white rounded-lg ${
                            theme === 'light' 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    >
                        Registrar Producto
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default ProductSearchStep;