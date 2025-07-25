// src/components/Common/MessageDisplay.jsx
import React from 'react';

const MessageDisplay = ({ successMessage, error }) => {
    return (
        <>
            {/* Visualización de Mensaje de Éxito */}
            {successMessage && (
                <div className="bg-green-700 bg-opacity-30 border border-green-500 text-green-300 px-4 py-3 rounded relative mb-6 animate-fade-in-down" role="alert">
                    <strong className="font-bold">¡Éxito!</strong>
                    <span className="block sm:inline ml-2">{successMessage}</span>
                </div>
            )}

            {/* Visualización de Mensaje de Error */}
            {error && (
                <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-6 animate-fade-in-down" role="alert">
                    <strong className="font-bold">¡Error!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}
        </>
    );
};

export default MessageDisplay;
