// C:\Proyectos\Label\frontend\src\components\Pos\PaymentSection.jsx
import React from 'react';
import { FaDollarSign, FaCreditCard, FaMoneyBillWave, FaExchangeAlt } from 'react-icons/fa'; // Iconos

const PaymentSection = ({
    totalAmount, paymentMethod, setPaymentMethod, customerName,
    setCustomerName, handleProcessSale, loading, saleItemsLength,
    formatPrice, convertPrice, exchangeRate
}) => {
    const primaryCurrency = exchangeRate?.fromCurrency || 'USD';
    const secondaryCurrency = exchangeRate?.toCurrency || 'VES';
    const rate = exchangeRate?.rate || 1;

    const totalAmountSecondaryCurrency = convertPrice(totalAmount, primaryCurrency, secondaryCurrency);

    return (
        <div className="mt-auto border-t border-neutral-gray-700 pt-4">
            <div className="flex justify-between items-center mb-4">
                <p className="text-2xl font-bold text-neutral-light">Total:</p>
                <div className="flex flex-col items-end">
                    <p className="text-4xl font-extrabold text-copper-rose-accent flex items-center">
                        <FaDollarSign size={28} className="mr-2" />{formatPrice(totalAmount, primaryCurrency)}
                    </p>
                    {primaryCurrency !== secondaryCurrency && (
                        <p className="text-sm font-semibold text-neutral-gray-300 mt-1">
                            <FaExchangeAlt size={16} className="inline-block mr-1 text-action-blue" />
                            {formatPrice(totalAmountSecondaryCurrency, secondaryCurrency)}
                        </p>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="paymentMethod" className="block text-neutral-light text-sm font-bold mb-2">Método de Pago:</label>
                <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer"
                >
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta de Débito/Crédito</option>
                    <option value="transfer">Transferencia Bancaria</option>
                    <option value="mobile-payment">Pago Móvil</option>
                    <option value="credit">Fiado / Crédito</option>
                    <option value="other">Otro</option>
                </select>
            </div>

            <div className="mb-6">
                <label htmlFor="customerName" className="block text-neutral-light text-sm font-bold mb-2">Nombre del Cliente (Opcional):</label>
                <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-neutral-light leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal placeholder-neutral-gray-500"
                />
            </div>

            <button
                onClick={handleProcessSale}
                className="bg-action-blue hover:bg-blue-700 text-neutral-light font-bold py-4 px-8 rounded-lg text-xl w-full shadow-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
                disabled={loading || saleItemsLength === 0}
            >
                {loading ? (
                    <div className="spinner-border animate-spin inline-block w-6 h-6 border-4 rounded-full border-t-transparent border-white"></div>
                ) : (
                    <>
                        <FaDollarSign className="mr-3" size={24} /> Procesar Venta
                    </>
                )}
            </button>
        </div>
    );
};

export default PaymentSection;