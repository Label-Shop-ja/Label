import React from 'react';
import { useNotification } from '../../context/NotificationContext';

const lang = 'es'; // O 'en' para inglés

export default function Toast() {
    const { notification } = useNotification();
    if (!notification.message) return null;
    return (
        <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg
            ${notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
            {notification.message}
        </div>
    );
}