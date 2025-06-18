// C:\Proyectos\Label\frontend\src\components\Pos\VariantSelectModal.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import ProductModal from '../Common/ProductModal'; // Reutilizamos el modal base

const VariantSelectModal = ({ isOpen, onClose, product, onSelectVariant, formatPrice, convertPrice, exchangeRate }) => {
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [error, setError] = useState('');

    const primaryCurrency = exchangeRate?.fromCurrency || 'USD';
    const secondaryCurrency = exchangeRate?.toCurrency || 'VES';

    useEffect(() => {
        if (product && product.variants && product.variants.length > 0) {
            // Selecciona la primera variante por defecto si no hay ninguna seleccionada
            if (!selectedVariantId) {
                setSelectedVariantId(product.variants[0]._id);
                setSelectedVariant(product.variants[0]);
            } else {
                // Asegurarse de que selectedVariant esté actualizado si el product prop cambia
                const current = product.variants.find(v => v._id === selectedVariantId);
                setSelectedVariant(current || product.variants[0]);
            }
        }
    }, [product, selectedVariantId]);

    const handleVariantChange = useCallback((e) => {
        const id = e.target.value;
        setSelectedVariantId(id);
        const variant = product.variants.find(v => v._id === id);
        setSelectedVariant(variant);
        setError('');
    }, [product.variants]);

    const handleConfirm = useCallback(() => {
        if (!selectedVariant) {
            setError('Por favor, selecciona una variante.');
            return;
        }
        if (selectedVariant.stock <= 0) {
            setError(`La variante seleccionada (${selectedVariant.name}) no tiene stock disponible.`);
            return;
        }
        onSelectVariant(selectedVariant);
        onClose();
    }, [selectedVariant, onSelectVariant, onClose]);

    if (!product || !product.variants || product.variants.length === 0) {
        return null; // O manejar caso de error
    }

    return (
        <ProductModal isOpen={isOpen} onClose={onClose} title={`Seleccionar Variante para ${product.name}`}>
            <div className="p-4">
                {error && (
                    <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">¡Error!</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="variantSelect" className="block text-neutral-light text-sm font-bold mb-2">Selecciona una Variante:</label>
                    <select
                        id="variantSelect"
                        value={selectedVariantId}
                        onChange={handleVariantChange}
                        className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-neutral-light leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer"
                    >
                        {product.variants.map(variant => (
                            <option key={variant._id} value={variant._id} disabled={variant.stock <= 0}>
                                {variant.name} ({variant.stock} disponibles) - {formatPrice(variant.price, primaryCurrency)}
                                {primaryCurrency !== secondaryCurrency && exchangeRate && (
                                    ` (${formatPrice(convertPrice(variant.price, primaryCurrency, secondaryCurrency), secondaryCurrency)})`
                                )}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedVariant && (
                    <div className="bg-neutral-gray-800 p-4 rounded-lg border border-neutral-gray-700">
                        <h4 className="text-xl font-semibold text-action-blue mb-3">{selectedVariant.name}</h4>
                        <img
                            src={selectedVariant.imageUrl || 'https://placehold.co/150x100/2D3748/F8F8F2?text=Var+Img'}
                            alt={selectedVariant.name}
                            className="w-32 h-auto object-cover rounded-md mb-3"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x100/2D3748/F8F8F2?text=Error'; }}
                        />
                        <p className="text-neutral-light mb-1">SKU: {selectedVariant.sku}</p>
                        <p className="text-neutral-light mb-1">Stock Disponible: <span className={`${selectedVariant.stock <= 5 ? 'text-red-400' : 'text-yellow-400'} font-bold`}>{selectedVariant.stock} {selectedVariant.unitOfMeasure}</span></p>
                        <p className="text-success-green font-bold text-lg mt-2">Precio: {formatPrice(selectedVariant.price, primaryCurrency)}
                            {primaryCurrency !== secondaryCurrency && exchangeRate && (
                                <span className="ml-2 text-sm text-neutral-gray-400">
                                    ({formatPrice(convertPrice(selectedVariant.price, primaryCurrency, secondaryCurrency), secondaryCurrency)})
                                </span>
                            )}
                        </p>
                        {selectedVariant.color && <p className="text-neutral-gray-300 text-sm">Color: {selectedVariant.color}</p>}
                        {selectedVariant.size && <p className="text-neutral-gray-300 text-sm">Talla: {selectedVariant.size}</p>}
                    </div>
                )}

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleConfirm}
                        className="bg-action-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                        disabled={!selectedVariant || selectedVariant.stock <= 0}
                    >
                        Confirmar Selección
                    </button>
                </div>
            </div>
        </ProductModal>
    );
};

export default VariantSelectModal;