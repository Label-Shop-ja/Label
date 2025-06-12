// src/components/Common/ConfirmModal.jsx
import React, { useEffect } from 'react';
import { XCircle } from 'lucide-react'; // Ícono para cerrar

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    // Si el modal no está abierto, no renderiza nada para optimizar el rendimiento.
    if (!isOpen) return null;

    // Efecto para añadir un event listener para la tecla 'Escape'
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);

        // Limpieza del event listener al desmontar el componente
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]); // Dependencia en onClose para que el efecto se re-ejecute si cambia

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300 p-4" // Añadido padding
            onClick={(e) => {
                e.stopPropagation(); // Previene el cierre al hacer clic en el fondo
                onClose(); // Llama a la función onClose pasada por props
            }}
        >
            <div
                className="bg-deep-night-blue p-6 sm:p-8 rounded-lg shadow-2xl text-neutral-light max-w-sm w-full text-center border border-neutral-gray-700 transform transition-transform duration-300 scale-100 relative" // Ajustes de padding y posición de la "X"
                onClick={(e) => e.stopPropagation()} // Previene el cierre del modal al hacer clic dentro
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-neutral-gray-400 hover:text-red-500 transition-colors duration-200 z-10" // Z-index para asegurar visibilidad
                    title="Cerrar"
                >
                    <XCircle size={24} />
                </button>
                <h3 className="text-xl font-bold mb-4 text-copper-rose-accent">{title}</h3>
                <p className="mb-6 text-neutral-gray-300">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onClose}
                        type="button"
                        className="bg-neutral-gray-500 hover:bg-neutral-gray-600 text-neutral-light font-bold py-2 px-5 rounded-lg transition duration-200 shadow-md"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-neutral-light font-bold py-2 px-5 rounded-lg transition duration-200 shadow-md"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
