// Frontend error handling utilities
import { toast } from 'react-hot-toast';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};

// Determine error type from response
export const getErrorType = (error) => {
  if (!error.response) {
    return ERROR_TYPES.NETWORK;
  }
  
  const status = error.response.status;
  
  if (status === 400) return ERROR_TYPES.VALIDATION;
  if (status === 401) return ERROR_TYPES.AUTHENTICATION;
  if (status === 403) return ERROR_TYPES.AUTHORIZATION;
  if (status >= 500) return ERROR_TYPES.SERVER;
  
  return ERROR_TYPES.UNKNOWN;
};

// Get user-friendly error message
export const getErrorMessage = (error) => {
  const errorType = getErrorType(error);
  
  // If we have a specific message from the server, use it
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Default messages based on error type
  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      return 'Error de conexión. Verifica tu conexión a internet.';
    case ERROR_TYPES.AUTHENTICATION:
      return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    case ERROR_TYPES.AUTHORIZATION:
      return 'No tienes permisos para realizar esta acción.';
    case ERROR_TYPES.SERVER:
      return 'Error del servidor. Intenta nuevamente en unos momentos.';
    case ERROR_TYPES.VALIDATION:
      return 'Datos inválidos. Verifica la información ingresada.';
    default:
      return 'Ha ocurrido un error inesperado.';
  }
};

// Handle API errors with appropriate user feedback
export const handleApiError = (error, customMessage = null) => {
  const errorType = getErrorType(error);
  const message = customMessage || getErrorMessage(error);
  
  // Log error details for debugging
  console.error('API Error:', {
    type: errorType,
    message,
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method
  });
  
  // Show appropriate toast notification
  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      toast.error(message, {
        duration: 5000,
        icon: '🌐'
      });
      break;
    case ERROR_TYPES.AUTHENTICATION:
      toast.error(message, {
        duration: 4000,
        icon: '🔐'
      });
      // Redirect to login if needed
      if (window.location.pathname !== '/') {
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
      break;
    case ERROR_TYPES.AUTHORIZATION:
      toast.error(message, {
        duration: 4000,
        icon: '🚫'
      });
      break;
    case ERROR_TYPES.SERVER:
      toast.error(message, {
        duration: 6000,
        icon: '⚠️'
      });
      break;
    case ERROR_TYPES.VALIDATION:
      toast.error(message, {
        duration: 4000,
        icon: '❌'
      });
      break;
    default:
      toast.error(message, {
        duration: 4000,
        icon: '❓'
      });
  }
  
  return {
    type: errorType,
    message,
    errorId: error.response?.data?.errorId
  };
};

// Handle success responses
export const handleApiSuccess = (message, options = {}) => {
  toast.success(message, {
    duration: 3000,
    icon: '✅',
    ...options
  });
};

// Handle loading states
export const handleApiLoading = (message = 'Cargando...') => {
  return toast.loading(message);
};

// Dismiss loading toast
export const dismissLoading = (toastId) => {
  toast.dismiss(toastId);
};