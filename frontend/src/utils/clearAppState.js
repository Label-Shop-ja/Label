/**
 * Limpia completamente el estado de la aplicación
 */
export const clearAppState = () => {
  // Limpiar localStorage
  const keysToRemove = [
    'accessToken',
    'refreshToken',
    'user',
    'wasLoggedOut',
    'theme',
    'language',
    'exchangeRates',
    'lastExchangeRateUpdate'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Limpiar sessionStorage
  sessionStorage.clear();
  
  // Recargar página
  window.location.reload();
};

// Función para usar en consola del navegador
window.clearAppState = clearAppState;