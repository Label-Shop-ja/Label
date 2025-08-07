/**
 * Utilidades para limpiar estado de autenticación corrupto
 */

export const cleanupAuthState = () => {
  const keysToRemove = [
    'accessToken',
    'refreshToken', 
    'user',
    'exchangeRate',
    'lastExchangeRateUpdate'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  localStorage.setItem('wasLoggedOut', 'true');
  sessionStorage.clear();
};

export const isAuthStateCorrupted = () => {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  
  // Si hay token pero no user, o viceversa, el estado está corrupto
  if ((token && !user) || (!token && user)) {
    return true;
  }
  
  // Si el token parece inválido (muy corto o formato incorrecto)
  if (token && (token.length < 10 || !token.includes('.'))) {
    return true;
  }
  
  return false;
};

export const initializeAuthState = () => {
  if (isAuthStateCorrupted()) {
    console.warn('Estado de autenticación corrupto detectado, limpiando...');
    cleanupAuthState();
    return false;
  }
  return true;
};