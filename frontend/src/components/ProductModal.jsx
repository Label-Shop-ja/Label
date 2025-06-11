// E:\Proyectos\Label\frontend\src\components\ProductModal.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react'; // Importamos el icono X para cerrar

const ProductModal = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef(null);

    // Close modal on Esc key press
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // Focus trapping
    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Tab' && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }
    }, []);

    // Set initial focus when modal opens
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const firstFocusableElement = modalRef.current.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (firstFocusableElement) {
                firstFocusableElement.focus();
            }
        }
    }, [isOpen]);

    if (!isOpen) return null; // No renderiza nada si el modal no está abierto

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in"
            onClick={onClose} // Permite cerrar el modal haciendo clic fuera de él
        >
            <div
                ref={modalRef} // Assign ref to the modal content
                className="bg-deep-night-blue p-8 rounded-lg shadow-2xl text-neutral-light max-w-4xl w-11/12 max-h-[90vh] overflow-y-auto relative border border-neutral-gray-700 transform transition-transform duration-300 scale-100"
                onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
                onKeyDown={handleKeyDown} // Listen for tab key for focus trapping
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-gray-400 hover:text-neutral-light transition-colors duration-200"
                    title="Cerrar formulario"
                >
                    <X size={28} /> {/* Icono X para cerrar */}
                </button>
                <h3 id="modal-title" className="text-2xl font-semibold text-neutral-light mb-6 text-copper-rose-accent border-b border-neutral-gray-600 pb-3">
                    {title}
                </h3>
                {children} {/* Aquí se renderizará el contenido del formulario */}
            </div>
        </div>
    );
};

export default ProductModal;
