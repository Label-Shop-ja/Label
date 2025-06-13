// src/components/Common/PaginationControls.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Íconos de Lucide React

const PaginationControls = ({ currentPage, totalPages, goToPrevPage, goToNextPage, loading }) => {
    // Si no hay más de una página, no se necesitan controles de paginación
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center space-x-3 mt-8 text-neutral-light">
            <button
                onClick={goToPrevPage}
                disabled={currentPage === 1 || loading}
                className="bg-action-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
            >
                <ChevronLeft size={20} />
            </button>
            <span className="text-lg font-semibold text-copper-rose-accent">Página {currentPage} de {totalPages}</span>
            <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages || loading}
                className="bg-action-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default PaginationControls;
