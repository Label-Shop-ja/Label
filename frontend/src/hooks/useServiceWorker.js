// Service Worker registration hook
import { useEffect, useState } from 'react';
import { trackEvent } from '../utils/analytics';

export const useServiceWorker = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.VITE_APP_ENV === 'production') {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setIsRegistered(true);
      
      trackEvent('service_worker_registered', 'performance');

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
            trackEvent('service_worker_update_available', 'performance');
          }
        });
      });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'CACHE_UPDATED') {
          trackEvent('cache_updated', 'performance', event.data.url);
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      trackEvent('service_worker_registration_failed', 'errors', error.message);
    }
  };

  const updateServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  return {
    isSupported,
    isRegistered,
    updateAvailable,
    updateServiceWorker
  };
};