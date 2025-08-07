// C:\Proyectos\Label\frontend\src\components\Pos\PaymentSection.jsx
import React from 'react';
import { FaDollarSign, FaCreditCard, FaMoneyBillWave, FaExchangeAlt } from 'react-icons/fa';
import { useReduxTheme } from '../../hooks/useReduxTheme';

const PaymentSection = ({
    totalAmount, paymentMethod, setPaymentMethod, customerName,
    setCustomerName, handleProcessSale, loading, saleItemsLength,
    formatPrice, convertPrice, exchangeRate
}) => {
    const { theme } = useReduxTheme();
    const primaryCurrency = exchangeRate?.fromCurrency || 'USD';
    const secondaryCurrency = exchangeRate?.toCurrency || 'VES';
    const rate = exchangeRate?.rate || 1;

    const totalAmountSecondaryCurrency = convertPrice(totalAmount, primaryCurrency, secondaryCurrency);

    const paymentMethods = [
        { value: 'cash', label: 'Efectivo', icon: '💵' },
        { value: 'card', label: 'Tarjeta', icon: '💳' },
        { value: 'transfer', label: 'Transferencia', icon: '🏦' },
        { value: 'mobile-payment', label: 'Pago Móvil', icon: '📱' },
        { value: 'credit', label: 'Crédito', icon: '📋' },
        { value: 'other', label: 'Otro', icon: '💰' }
    ];

    return (
        <div className="space-y-6">
            {/* Total destacado */}
            <div className="bg-primary/10 backdrop-blur-sm rounded-2xl p-6 border border-surface-secondary shadow-xl">
                <div className="text-center">
                    <p className="text-sm font-medium text-text-muted mb-2">Total a Pagar</p>
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center shadow-lg">
                            <FaDollarSign size={20} className="text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-success">
                                {formatPrice(totalAmount, primaryCurrency)}
                            </p>
                            {primaryCurrency !== secondaryCurrency && (
                                <p className="text-lg font-semibold text-secondary flex items-center justify-end gap-1">
                                    <FaExchangeAlt size={14} />
                                    {formatPrice(totalAmountSecondaryCurrency, secondaryCurrency)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Método de pago */}
            <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Método de Pago
                </label>
                <div className="relative">
                    <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-surface-secondary backdrop-blur-sm text-text-base border-2 border-surface-secondary rounded-xl outline-none text-base transition-all duration-300 focus:border-primary focus:bg-surface focus:shadow-lg appearance-none cursor-pointer"
                    >
                        {paymentMethods.map(method => (
                            <option key={method.value} value={method.value}>
                                {method.icon} {method.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">
                        {paymentMethods.find(m => m.value === paymentMethod)?.icon || '💰'}
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Nombre del cliente */}
            <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Cliente (Opcional)
                </label>
                <div className="relative">
                    <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nombre del cliente..."
                        className="w-full pl-12 pr-4 py-4 bg-surface-secondary backdrop-blur-sm text-text-base border-2 border-surface-secondary rounded-xl outline-none text-base transition-all duration-300 focus:border-primary focus:bg-surface focus:shadow-lg placeholder-text-muted"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Botón de procesar venta */}
            <button
                onClick={handleProcessSale}
                disabled={loading || saleItemsLength === 0}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform shadow-xl ${
                    loading || saleItemsLength === 0
                        ? 'bg-surface-secondary text-text-muted cursor-not-allowed'
                        : 'bg-success hover:bg-success/80 text-white hover:scale-105 hover:shadow-2xl active:scale-95'
                } flex items-center justify-center gap-3`}
            >
                {loading ? (
                    <>
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Procesando...</span>
                    </>
                ) : (
                    <>
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <FaDollarSign size={18} />
                        </div>
                        <span>Procesar Venta</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </>
                )}
            </button>
            
            {saleItemsLength === 0 && (
                <p className="text-center text-sm text-text-muted mt-2">
                    Agrega productos al carrito para procesar la venta
                </p>
            )}
        </div>
    );
};

export default React.memo(PaymentSection); // React.memo