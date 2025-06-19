// C:\Proyectos\Label\frontend\src\components\Pos\PaymentModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ProductModal from '../Common/ProductModal'; // Reutilizamos el modal base
import { Loader2 } from 'lucide-react'; // Ícono de carga
import { FaMoneyBillWave, FaCreditCard, FaExchangeAlt, FaUserCircle, FaMobileAlt, FaListAlt } from 'react-icons/fa'; // Iconos de métodos de pago
import axiosInstance from '../../api/axiosInstance'; // Para buscar clientes

const PaymentModal = ({
    isOpen,
    onClose,
    totalAmount,
    primaryCurrency,
    secondaryCurrency,
    exchangeRate,
    formatPrice,
    convertPrice,
    onProcessSale // Esta función viene de PosPage y procesa la venta final
}) => {
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountPaidCash, setAmountPaidCash] = useState('');
    const [changeDue, setChangeDue] = useState(0);
    const [mobilePaymentRef, setMobilePaymentRef] = useState('');
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [customerSearchResults, setCustomerSearchResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [localError, setLocalError] = useState('');
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Para deshabilitar el botón de procesar

    // Efecto para inicializar estados al abrir el modal o si cambia el total
    useEffect(() => {
        if (isOpen) {
            setPaymentMethod('cash');
            setAmountPaidCash('');
            setChangeDue(0);
            setMobilePaymentRef('');
            setCustomerSearchTerm('');
            setCustomerSearchResults([]);
            setSelectedCustomer(null);
            setNewCustomerName('');
            setShowNewCustomerForm(false);
            setLocalError('');
        }
    }, [isOpen, totalAmount]);

    // Calcular el vuelto
    useEffect(() => {
        const paid = Number(amountPaidCash);
        const total = totalAmount;
        if (!isNaN(paid) && paid >= total) {
            setChangeDue(paid - total);
        } else {
            setChangeDue(0);
        }
    }, [amountPaidCash, totalAmount]);

    // Búsqueda de clientes con debounce (simplificado para el ejemplo)
    const debounceTimeoutRef = useRef(null);
    useEffect(() => {
        if (customerSearchTerm.length > 2) {
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = setTimeout(async () => {
                setLoadingCustomers(true);
                try {
                    // Asumiendo que tienes una ruta /api/clients que busca clientes
                    const response = await axiosInstance.get(`/clients?searchTerm=${customerSearchTerm}`);
                    setCustomerSearchResults(response.data.clients || []);
                } catch (err) {
                    console.error('Error searching customers:', err);
                    setLocalError('Error al buscar clientes.');
                } finally {
                    setLoadingCustomers(false);
                }
            }, 300);
        } else {
            setCustomerSearchResults([]);
        }
    }, [customerSearchTerm]);


    const handleConfirmPayment = async () => {
        setLocalError('');
        setIsProcessingPayment(true);

        let finalCustomerName = selectedCustomer?.fullName || newCustomerName;
        let finalCustomerId = selectedCustomer?._id;

        // Validaciones básicas del modal
        if (paymentMethod === 'cash') {
            if (Number(amountPaidCash) < totalAmount) {
                setLocalError('El monto pagado en efectivo es insuficiente.');
                setIsProcessingPayment(false);
                return;
            }
        }
        if (paymentMethod === 'credit') {
            if (!finalCustomerName) {
                setLocalError('Debe seleccionar o crear un cliente para pago a crédito/fiado.');
                setIsProcessingPayment(false);
                return;
            }
        }
        // Puedes añadir más validaciones para otros métodos de pago

        try {
            // Llama a la función onProcessSale que viene de PosPage.jsx
            // y le pasa el método de pago y el nombre/ID del cliente si aplica.
            const success = await onProcessSale({ // onProcessSale espera un objeto
                paymentMethod,
                customerName: finalCustomerName,
                customerId: finalCustomerId, // Pasa el ID del cliente si se seleccionó uno
                amountPaid: Number(amountPaidCash), // Monto pagado en efectivo
                mobilePaymentRef, // Referencia de pago móvil
                // Aquí podrías añadir más detalles para pagos mixtos si se implementan
            });

            if (success) {
                onClose(); // Cierra el modal si la venta fue procesada con éxito
            } else {
                // El error de onProcessSale ya se muestra en PosPage.jsx
                // Aquí solo nos aseguramos de que el spinner se desactive
            }
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const totalAmountInSecondary = convertPrice(totalAmount, primaryCurrency, secondaryCurrency);

    return (
        <ProductModal isOpen={isOpen} onClose={onClose} title="Procesar Venta">
            <div className="p-4">
                {localError && (
                    <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">¡Error!</strong>
                        <span className="block sm:inline ml-2">{localError}</span>
                    </div>
                )}

                <h3 className="text-xl font-bold text-neutral-light mb-4">Total de la Venta:</h3>
                <p className="text-4xl font-extrabold text-copper-rose-accent flex items-center mb-6">
                    {formatPrice(totalAmount, primaryCurrency)}
                    {primaryCurrency !== secondaryCurrency && exchangeRate && (
                        <span className="ml-3 text-2xl text-neutral-gray-300">
                            ({formatPrice(totalAmountInSecondary, secondaryCurrency)})
                        </span>
                    )}
                </p>

                <div className="mb-6">
                    <label htmlFor="paymentMethod" className="block text-neutral-light text-sm font-bold mb-2">Método de Pago:</label>
                    <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => {
                            setPaymentMethod(e.target.value);
                            setLocalError(''); // Limpiar errores al cambiar método
                            setAmountPaidCash(''); // Limpiar monto pagado en efectivo
                            setMobilePaymentRef(''); // Limpiar referencia pago móvil
                            setSelectedCustomer(null); // Limpiar cliente
                            setCustomerSearchTerm('');
                            setShowNewCustomerForm(false);
                            setNewCustomerName('');
                        }}
                        className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-neutral-light leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal cursor-pointer"
                    >
                        <option value="cash">Efectivo</option>
                        <option value="card">Tarjeta de Débito/Crédito</option>
                        <option value="transfer">Transferencia Bancaria</option>
                        <option value="mobile-payment">Pago Móvil</option>
                        <option value="credit">Fiado / Crédito</option>
                        <option value="other">Otro</option>
                    </select>
                </div>

                {paymentMethod === 'cash' && (
                    <div className="mb-4 animate-fade-in-down">
                        <label htmlFor="amountPaidCash" className="block text-neutral-light text-sm font-bold mb-2">Monto Recibido (Efectivo):</label>
                        <input
                            type="number"
                            id="amountPaidCash"
                            value={amountPaidCash}
                            onChange={(e) => setAmountPaidCash(e.target.value)}
                            step="0.01"
                            min="0"
                            placeholder={formatPrice(totalAmount, primaryCurrency)}
                            className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-neutral-light leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                        />
                        <p className="text-neutral-gray-300 text-sm mt-2">Vuelto a devolver: <span className="font-bold text-success-green">{formatPrice(changeDue, primaryCurrency)}</span></p>
                    </div>
                )}

                {paymentMethod === 'mobile-payment' && (
                    <div className="mb-4 animate-fade-in-down">
                        <label htmlFor="mobilePaymentRef" className="block text-neutral-light text-sm font-bold mb-2">Referencia Pago Móvil (Opcional):</label>
                        <input
                            type="text"
                            id="mobilePaymentRef"
                            value={mobilePaymentRef}
                            onChange={(e) => setMobilePaymentRef(e.target.value)}
                            placeholder="Últimos 4 dígitos o código"
                            className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-neutral-light leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                        />
                    </div>
                )}

                {paymentMethod === 'credit' && (
                    <div className="mb-4 animate-fade-in-down">
                        <label htmlFor="customerSearch" className="block text-neutral-light text-sm font-bold mb-2">Cliente (Fiado):</label>
                        {!selectedCustomer ? (
                            <>
                                <input
                                    type="text"
                                    id="customerSearch"
                                    value={customerSearchTerm}
                                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                    placeholder="Buscar cliente por nombre o cédula"
                                    className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-neutral-light leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                                />
                                {loadingCustomers ? (
                                    <p className="text-neutral-gray-400 mt-2">Buscando clientes...</p>
                                ) : (
                                    customerSearchResults.length > 0 && (
                                        <ul className="bg-neutral-gray-800 border border-neutral-gray-700 rounded-lg shadow-xl mt-2 max-h-40 overflow-y-auto">
                                            {customerSearchResults.map(customer => (
                                                <li
                                                    key={customer._id}
                                                    className="px-4 py-2 cursor-pointer hover:bg-action-blue-light hover:text-white text-neutral-light border-b border-neutral-gray-700 last:border-b-0"
                                                    onClick={() => setSelectedCustomer(customer)}
                                                >
                                                    {customer.fullName} ({customer.idNumber})
                                                </li>
                                            ))}
                                        </ul>
                                    )
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowNewCustomerForm(true)}
                                    className="mt-2 bg-neutral-gray-600 hover:bg-neutral-gray-500 text-neutral-light text-sm font-bold py-2 px-4 rounded-lg w-full flex items-center justify-center"
                                >
                                    <FaPlusCircle size={14} className="mr-2" /> O crear nuevo cliente
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center justify-between bg-neutral-gray-700 p-3 rounded-lg text-neutral-light font-bold">
                                <span>Cliente Seleccionado: {selectedCustomer.fullName}</span>
                                <button onClick={() => setSelectedCustomer(null)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                            </div>
                        )}

                        {showNewCustomerForm && !selectedCustomer && (
                            <div className="mt-4 p-3 border border-neutral-gray-700 rounded-lg bg-neutral-gray-800 animate-fade-in-down">
                                <label htmlFor="newCustomerName" className="block text-neutral-light text-sm font-bold mb-2">Nombre del Nuevo Cliente:</label>
                                <input
                                    type="text"
                                    id="newCustomerName"
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                    placeholder="Nombre completo del cliente"
                                    className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-neutral-light leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                                />
                                {/* Aquí podrías añadir más campos para crear cliente (cédula, etc.) si tu backend lo requiere */}
                            </div>
                        )}
                    </div>
                )}
                {/* Puedes añadir más lógica para 'card', 'transfer', 'other' */}
                {/* Por ejemplo, un campo para el número de tarjeta o referencia de transferencia */}
                {(paymentMethod === 'card' || paymentMethod === 'transfer' || paymentMethod === 'other') && (
                    <div className="mb-4 animate-fade-in-down">
                        <label htmlFor="reference" className="block text-neutral-light text-sm font-bold mb-2">Referencia / Detalles (Opcional):</label>
                        <input
                            type="text"
                            id="reference"
                            placeholder="Ej. Últimos 4 dígitos de tarjeta, número de transferencia"
                            className="shadow appearance-none border border-neutral-gray-700 rounded w-full py-2 px-3 text-neutral-light leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                        />
                    </div>
                )}

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleConfirmPayment}
                        className="bg-success-green hover:bg-green-700 text-deep-night-blue font-bold py-3 px-6 rounded-lg text-xl shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center"
                        disabled={isProcessingPayment || loading}
                    >
                        {isProcessingPayment ? <Loader2 size={24} className="mr-2 animate-spin" /> : <FaListAlt size={20} className="mr-2" />} Confirmar Pago
                    </button>
                </div>
            </div>
        </ProductModal>
    );
};

export default PaymentModal;