/**
 * Utilidades de sanitización para prevenir inyección de logs
 */

/**
 * Sanitiza entrada de usuario para logs seguros
 * @param {any} input - Entrada a sanitizar
 * @param {number} maxLength - Longitud máxima (default: 100)
 * @returns {string} - Entrada sanitizada
 */
export const sanitizeForLog = (input, maxLength = 100) => {
  if (input === null || input === undefined) {
    return 'null';
  }
  
  let sanitized;
  if (typeof input === 'string') {
    // Remover caracteres de control y limitar longitud
    sanitized = input
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remover caracteres de control
      .replace(/[\r\n\t]/g, ' ') // Reemplazar saltos de línea
      .trim();
  } else {
    sanitized = JSON.stringify(input);
  }
  
  return sanitized.length > maxLength 
    ? sanitized.substring(0, maxLength) + '...'
    : sanitized;
};

/**
 * Sanitiza objetos de error para logs
 * @param {Error} error - Error a sanitizar
 * @returns {object} - Error sanitizado
 */
export const sanitizeError = (error) => {
  return {
    message: sanitizeForLog(error.message),
    stack: error.stack ? sanitizeForLog(error.stack, 500) : undefined,
    name: sanitizeForLog(error.name)
  };
};