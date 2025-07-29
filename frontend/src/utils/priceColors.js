// utils/priceColors.js
export const getPriceColorClass = (amount) => {
  if (amount >= 10000) return 'text-cyan-400'; // Azul aqua para montos muy altos
  if (amount >= 5000) return 'text-purple-400'; // Púrpura para montos altos
  if (amount >= 1000) return 'text-orange-400'; // Naranja para montos medianos-altos
  if (amount >= 500) return 'text-red-400'; // Rojo para montos medianos
  if (amount >= 100) return 'text-yellow-400'; // Amarillo para montos bajos-medianos
  if (amount >= 50) return 'text-green-400'; // Verde para montos bajos
  return 'text-text-muted'; // Color por defecto para montos muy bajos
};

export const getPriceBgColorClass = (amount) => {
  if (amount >= 10000) return 'bg-cyan-500/20'; 
  if (amount >= 5000) return 'bg-purple-500/20'; 
  if (amount >= 1000) return 'bg-orange-500/20'; 
  if (amount >= 500) return 'bg-red-500/20'; 
  if (amount >= 100) return 'bg-yellow-500/20'; 
  if (amount >= 50) return 'bg-green-500/20'; 
  return 'bg-surface-secondary'; 
};