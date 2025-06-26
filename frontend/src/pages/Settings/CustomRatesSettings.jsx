import React, { useState, useEffect, useMemo } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { toast } from 'react-toastify';
import { PlusCircle, Edit, Trash2, Loader2, Save, XCircle, AlertTriangle } from 'lucide-react';
import ErrorBoundary from "../../components/Common/ErrorBoundary";

// Un pequeño componente pa' mostrar la tasa oficial y que el usuario se guíe
const OfficialRateHelper = ({ from, to }) => {
    const { exchangeRate, formatPrice } = useCurrency();
    const [rate, setRate] = useState(null);

    useEffect(() => {
        if (exchangeRate && from && to) {
            const conversion = exchangeRate.conversions.find(c => c.fromCurrency === from && c.toCurrency === to);
            setRate(conversion ? conversion.rate : null);
        } else {
            setRate(null);
        }
    }, [from, to, exchangeRate]);

    if (!rate) return null;

    return (
        <span className="text-xs text-neutral-gray-400 ml-2">
            (Oficial: {formatPrice(rate, to)})
        </span>
    );
};

const CustomRatesSettings = () => {
    const {
        customRates,
        loadingCustomRates,
        availableCurrencies,
        createCustomRate,
        updateCustomRate,
        deleteCustomRate,
        formatPrice,
        exchangeRate,
        currencyError, // Si lo tienes en el contexto
    } = useCurrency();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRate, setEditingRate] = useState(null); // Guarda el objeto completo que se está editando
    const [formData, setFormData] = useState({
        fromCurrency: 'USD',
        toCurrency: '',
        customRateValue: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleOpenFormForCreate = () => {
        setEditingRate(null);
        setFormData({ fromCurrency: 'USD', toCurrency: '', customRateValue: '' });
        setIsFormOpen(true);
    };

    const handleOpenFormForEdit = (rate) => {
        // Para editar, necesitamos calcular el valor que el usuario ve.
        // El backend guarda el 'ajuste', pero el usuario edita el 'valor final'.
        const officialRate = exchangeRate?.conversions.find(c => c.fromCurrency === rate.fromCurrency && c.toCurrency === rate.toCurrency)?.rate || 0;
        const currentCustomValue = officialRate + rate.adjustmentValue;

        setEditingRate(rate);
        setFormData({
            fromCurrency: rate.fromCurrency,
            toCurrency: rate.toCurrency,
            customRateValue: currentCustomValue > 0 ? currentCustomValue.toString() : '',
        });
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingRate(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSaving) return;

        const { fromCurrency, toCurrency, customRateValue } = formData;
        if (!fromCurrency || !toCurrency || !customRateValue) {
            toast.error('¡Mi loco! Tienes que llenar todos los campos.');
            return;
        }
        if (fromCurrency === toCurrency) {
            toast.error('¡Nojoda! No puedes convertir una moneda a sí misma.');
            return;
        }

        setIsSaving(true);
        const dataToSend = {
            fromCurrency,
            toCurrency,
            customRateValue: parseFloat(customRateValue),
        };

        let result;
        if (editingRate) {
            result = await updateCustomRate(editingRate._id, dataToSend);
        } else {
            result = await createCustomRate(dataToSend);
        }

        if (result.success) {
            toast.success(`¡De pinga! Tasa ${editingRate ? 'actualizada' : 'creada'}.`);
            handleCloseForm();
        } else {
            toast.error(result.error || '¡Verga! Hubo un peo al guardar la tasa.');
        }
        setIsSaving(false);
    };

    const handleDelete = async (rateId) => {
        if (window.confirm('¿Seguro que quieres eliminar este guiso, mi pana?')) {
            const result = await deleteCustomRate(rateId);
            if (result.success) {
                toast.success('¡Listo el pollo! Tasa eliminada.');
            } else {
                toast.error(result.error || '¡Coño! No se pudo eliminar la tasa.');
            }
        }
    };

    // Filtramos las monedas de destino para que no incluyan la de origen
    const toCurrencies = useMemo(() => {
        return availableCurrencies.filter(c => c !== formData.fromCurrency);
    }, [availableCurrencies, formData.fromCurrency]);

    return (
        <ErrorBoundary>
            <div className="p-6 bg-dark-charcoal text-neutral-light rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-6 border-b border-neutral-gray-600 pb-4">
                    <h1 className="text-2xl font-bold text-action-blue">Mis Tasas de Cambio Personalizadas</h1>
                    <button
                        onClick={handleOpenFormForCreate}
                        className="bg-action-blue hover:bg-blue-700 text-deep-night-blue font-bold py-2 px-4 rounded-lg flex items-center transition duration-200"
                    >
                        <PlusCircle size={20} className="mr-2" />
                        Crear Tasa
                    </button>
                </div>

                {/* Mensaje de error destacado */}
                {currencyError && (
                    <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-6" role="alert">
                        <strong className="font-bold">¡Error!</strong>
                        <span className="block sm:inline ml-2">{currencyError}</span>
                    </div>
                )}

                {isFormOpen && (
                    <div className="bg-neutral-gray-800 p-6 rounded-lg mb-6 border border-neutral-gray-700">
                        <h2 className="text-xl font-semibold mb-4">{editingRate ? 'Editando Tasa' : 'Creando Nueva Tasa'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* From Currency */}
                                <div>
                                    <label className="block text-sm font-bold mb-2">De:</label>
                                    <select name="fromCurrency" value={formData.fromCurrency} onChange={handleChange} disabled={!!editingRate} className="w-full p-2 rounded bg-dark-charcoal border border-neutral-gray-700 disabled:opacity-50">
                                        {availableCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                {/* To Currency */}
                                <div>
                                    <label className="block text-sm font-bold mb-2">A:</label>
                                    <select name="toCurrency" value={formData.toCurrency} onChange={handleChange} disabled={!!editingRate} className="w-full p-2 rounded bg-dark-charcoal border border-neutral-gray-700 disabled:opacity-50">
                                        <option value="">Selecciona...</option>
                                        {toCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                {/* Custom Rate Value */}
                                <div>
                                    <label className="block text-sm font-bold mb-2">
                                        Mi Tasa (1 {formData.fromCurrency})
                                        <OfficialRateHelper from={formData.fromCurrency} to={formData.toCurrency} />
                                    </label>
                                    <input
                                        type="number"
                                        name="customRateValue"
                                        value={formData.customRateValue}
                                        onChange={handleChange}
                                        step="any"
                                        className="w-full p-2 rounded bg-dark-charcoal border border-neutral-gray-700"
                                        placeholder="Ej: 113.50"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={handleCloseForm} className="bg-neutral-gray-600 hover:bg-neutral-gray-700 py-2 px-4 rounded-lg flex items-center"><XCircle size={18} className="mr-2" />Cancelar</button>
                                <button type="submit" disabled={isSaving} className="bg-success-green hover:bg-green-700 text-deep-night-blue font-bold py-2 px-4 rounded-lg flex items-center">
                                    {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                    Guardar Tasa
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {loadingCustomRates ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 size={32} className="animate-spin text-action-blue" />
                    </div>
                ) : customRates.length > 0 ? (
                    <div className="bg-neutral-gray-800 rounded-lg overflow-hidden border border-neutral-gray-700">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-gray-900">
                                <tr>
                                    <th className="p-4">De</th>
                                    <th className="p-4">A</th>
                                    <th className="p-4">Mi Tasa (Calculada)</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customRates.map(rate => {
                                    const officialRate = exchangeRate?.conversions.find(c => c.fromCurrency === rate.fromCurrency && c.toCurrency === rate.toCurrency)?.rate || 0;
                                    const finalRate = officialRate + rate.adjustmentValue;
                                    return (
                                        <tr key={rate._id} className="border-t border-neutral-gray-700">
                                            <td className="p-4">{rate.fromCurrency}</td>
                                            <td className="p-4">{rate.toCurrency}</td>
                                            <td className="p-4 font-mono text-success-green">{formatPrice(finalRate, rate.toCurrency)}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleOpenFormForEdit(rate)} className="text-action-blue hover:text-blue-400 mr-4"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(rate._id)} className="text-copper-rose-accent hover:text-red-400"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 bg-neutral-gray-800 rounded-lg border border-dashed border-neutral-gray-600">
                        <AlertTriangle size={40} className="mx-auto text-neutral-gray-500 mb-4" />
                        <h3 className="text-lg font-semibold">No hay guisos por aquí</h3>
                        <p className="text-neutral-gray-400">Aún no has creado ninguna tasa personalizada. ¡Dale al botón de arriba y crea la primera!</p>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default CustomRatesSettings;