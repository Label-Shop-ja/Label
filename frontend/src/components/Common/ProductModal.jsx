// src/components/Common/ProductModal.jsx
import React, { useEffect } from 'react';
import { XCircle } from 'lucide-react'; // Ícono para cerrar

const ProductModal = ({ isOpen, onClose, title, children }) => {
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
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300 p-4 sm:p-6 overflow-y-auto" // Añadido padding y overflow-y-auto
            onClick={onClose} // Cierra el modal al hacer clic en el fondo
        >
            <div
                className="bg-deep-night-blue p-6 sm:p-8 rounded-lg shadow-2xl text-neutral-light w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto my-auto relative border border-neutral-gray-700 transform transition-transform duration-300 scale-100 flex flex-col max-h-[90vh]" // Ajustes de tamaño y altura máxima
                onClick={(e) => e.stopPropagation()} // Evita que los clics dentro del modal cierren el modal
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-neutral-gray-400 hover:text-red-500 transition-colors duration-200 z-10" // Z-index para asegurar visibilidad
                    title="Cerrar"
                >
                    <XCircle size={28} />
                </button>
                <h3 className="text-2xl sm:text-3xl font-bold text-copper-rose-accent mb-4 sm:mb-6 text-center border-b-2 border-action-blue pb-3">
                    {title}
                </h3>
                <div className="overflow-y-auto flex-grow pr-2 -mr-2"> {/* Contenido desplazable */}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
