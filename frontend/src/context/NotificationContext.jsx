import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
    }
    return context;
}

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState({ message: '', type: '' });

    /**
     * La función showNotification ahora está envuelta en `useCallback`.
     * Esto es CRUCIAL. `useCallback` memoriza la función, asegurando que no se
     * vuelva a crear en cada renderizado. Esto rompe el bucle infinito en
     * los componentes que la usan como dependencia en un `useEffect`, como AccessModal.
     */
    const showNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 4000);
    }, []); // El array de dependencias vacío significa que la función nunca cambiará.

    return (
        <NotificationContext.Provider value={{ notification, showNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}