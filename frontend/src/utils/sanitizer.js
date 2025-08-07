/**
 * Utilidades de sanitización para el frontend
 */

/**
 * Sanitiza entrada de usuario para logs seguros
 * @param {any} input - Entrada a sanitizar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Entrada sanitizada
 */
export const sanitizeForLog = (input, maxLength = 100) => {
  if (input === null || input === undefined) {
    return 'null';
  }
  
  let sanitized;
  if (typeof input === 'string') {
    // Remover caracteres peligrosos y limitar longitud
    sanitized = input
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Caracteres de control
      .replace(/[<>'"&]/g, '') // Caracteres HTML peligrosos
      .replace(/[\r\n\t]/g, ' ') // Saltos de línea
      .trim();
  } else {
    try {
      sanitized = JSON.stringify(input);
    } catch {
      sanitized = String(input);
    }
  }
  
  return sanitized.length > maxLength 
    ? sanitized.substring(0, maxLength) + '...'
    : sanitized;
};

/**
 * Sanitiza datos antes de enviar a analytics
 * @param {object} data - Datos a sanitizar
 * @returns {object} - Datos sanitizados
 */
export const sanitizeAnalyticsData = (data) => {
  const sanitized = {};
  
  Object.entries(data).forEach(([key, value]) => {
    // No incluir datos sensibles en analytics
    if (key.toLowerCase().includes('password') || 
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('secret')) {
      return;
    }
    
    sanitized[key] = sanitizeForLog(value, 50);
  });
  
  return sanitized;
};