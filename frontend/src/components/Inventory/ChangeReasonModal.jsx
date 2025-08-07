import React, { useState } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import { useReduxTheme } from '../../hooks/useReduxTheme';

const ChangeReasonModal = ({ isOpen, onClose, onConfirm, productName }) => {
    const { theme } = useReduxTheme();
    const [reason, setReason] = useState('');
    const [changeType, setChangeType] = useState('UPDATE');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) return;
        
        onConfirm({
            reason: reason.trim(),
            changeType,
        });
        
        setReason('');
        setChangeType('UPDATE');
    };

    const handleClose = () => {
        setReason('');
        setChangeType('UPDATE');
        onClose();
    };

    if (!isOpen) return null;

    const changeTypeOptions = [
        { value: 'UPDATE', label: 'Actualización general' },
        { value: 'STOCK_ADJUSTMENT', label: 'Ajuste de inventario' },
        { value: 'PRICE_CHANGE', label: 'Cambio de precio' },
        { value: 'VARIANT_CHANGE', label: 'Modificación de variantes' },
        { value: 'OTHER', label: 'Otro' },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl w-full max-w-md overflow-hidden shadow-2xl ${
                theme === 'light' ? 'bg-white' : 'bg-slate-800'
            }`}>
                {/* Header */}
                <div className={`p-6 border-b ${
                    theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-700/50 border-slate-600'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-600">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold ${
                                    theme === 'light' ? 'text-gray-900' : 'text-white'
                                }`}>
                                    Razón del Cambio
                                </h3>
                                <p className={`text-sm ${
                                    theme === 'light' ? 'text-gray-500' : 'text-slate-400'
                                }`}>
                                    {productName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className={`p-2 rounded-lg transition-colors ${
                                theme === 'light' 
                                    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Tipo de cambio */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${
                            theme === 'light' ? 'text-gray-700' : 'text-slate-300'
                        }`}>
                            Tipo de cambio
                        </label>
                        <select
                            value={changeType}
                            onChange={(e) => setChangeType(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                theme === 'light' 
                                    ? 'bg-white border-gray-300 text-gray-900' 
                                    : 'bg-slate-700 border-slate-600 text-white'
                            }`}
                        >
                            {changeTypeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Razón */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${
                            theme === 'light' ? 'text-gray-700' : 'text-slate-300'
                        }`}>
                            Razón del cambio *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Describe por qué se está realizando este cambio..."
                            rows={3}
                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                                theme === 'light' 
                                    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
                                    : 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                            }`}
                            required
                        />
                    </div>

                    {/* Alert */}
                    <div className={`flex items-start gap-2 p-3 rounded-lg ${
                        theme === 'light' ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-700/50'
                    }`}>
                        <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                        }`} />
                        <p className={`text-xs ${
                            theme === 'light' ? 'text-blue-700' : 'text-blue-300'
                        }`}>
                            Este cambio quedará registrado en el historial del producto para auditoría.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                                theme === 'light' 
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                            }`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!reason.trim()}
                            className="flex-1 px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Continuar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangeReasonModal;