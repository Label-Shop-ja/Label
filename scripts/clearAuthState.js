// Script para limpiar el estado de autenticación
console.log('🧹 Limpiando estado de autenticación...');

// Limpiar localStorage
if (typeof window !== 'undefined') {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('wasLoggedOut');
  console.log('✅ LocalStorage limpiado');
}

// Limpiar cookies del navegador
document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
console.log('✅ Cookies limpiadas');

console.log('🎉 Estado de autenticación limpiado completamente');
console.log('💡 Recarga la página para aplicar los cambios');