import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';



export default function Toast() {
    const { notification } = useNotification();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        if (notification.message) {
            setIsVisible(true);
            setIsLeaving(false);
            
            // Flash inicial
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 200);
            
            // Iniciar animación de salida después de 2 segundos
            const timer = setTimeout(() => {
                setIsLeaving(true);
                // Ocultar completamente después de la animación
                setTimeout(() => setIsVisible(false), 400);
            }, 2500);
            
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            setIsLeaving(false);
            setShowFlash(false);
        }
    }, [notification.message]);

    // Ocultar toast inmediatamente al cambiar de página
    useEffect(() => {
        setIsVisible(false);
        setIsLeaving(false);
        setShowFlash(false);
    }, [location.pathname]);

    if (!isVisible) return null;

    const getToastStyles = () => {
        const baseStyles = {
            position: 'fixed',
            top: '35px',
            left: '50%',
            transform: isLeaving ? 'translateX(-50%) translateY(-80px) scale(0.9)' : 'translateX(-50%) translateY(0) scale(1)',
            zIndex: 1000,
            padding: '12px 28px',
            borderRadius: '50px',
            fontSize: '14px',
            fontWeight: '500',
            backdropFilter: 'blur(12px)',
            border: showFlash ? '2px solid rgba(255, 255, 255, 0.6)' : 'none',
            transition: showFlash ? 'all 0.1s ease-out' : 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            opacity: isLeaving ? 0 : 1,
            boxShadow: showFlash ? '0 0 30px rgba(255, 255, 255, 0.3), 0 8px 30px rgba(59, 130, 246, 0.2)' : (isLeaving ? '0 0 25px rgba(59, 130, 246, 0.1)' : '0 6px 25px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)')
        };

        if (notification.type === 'error') {
            return {
                ...baseStyles,
                backgroundColor: showFlash ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.15)',
                color: showFlash ? '#ffffff' : '#f87171'
            };
        } else if (notification.type === 'info') {
            return {
                ...baseStyles,
                backgroundColor: showFlash ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.15)',
                color: showFlash ? '#ffffff' : '#60a5fa'
            };
        } else {
            return {
                ...baseStyles,
                backgroundColor: showFlash ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.15)',
                color: showFlash ? '#ffffff' : '#4ade80'
            };
        }
    };

    return (
        <div style={getToastStyles()}>
            {notification.message.split(' ').slice(0, 3).join(' ')}
        </div>
    );
}