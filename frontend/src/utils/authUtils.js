// Utilidades para manejo de autenticación

export const clearAuthState = () => {
  // Limpiar localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('wasLoggedOut');
  
  // Limpiar cookies
  document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  console.log('🧹 Estado de autenticación limpiado');
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.warn('Error checking token expiration:', error);
    return true;
  }
};

export const getTokenTimeRemaining = (token) => {
  if (!token) return 0;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return Math.max(0, payload.exp - currentTime);
  } catch (error) {
    console.warn('Error getting token time remaining:', error);
    return 0;
  }
};