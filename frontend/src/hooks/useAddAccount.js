import { useState } from 'react';
import { authService } from '../redux/authService';
import AccountManager from '../services/AccountManager';
import { useNotification } from '../context/NotificationContext';

export const useAddAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');
  const { showNotification } = useNotification();

  const addAccount = async (userData, provider = 'local') => {
    setIsLoading(true);
    setIsError(false);
    setMessage('');

    try {
      let response;
      
      if (provider === 'local') {
        response = await authService.login(userData);
      }
      // TODO: Implementar para Google OAuth
      
      if (response?.data) {
        // Guardar la nueva cuenta sin cambiar la sesión actual
        AccountManager.saveAccount(response.data.user, response.data.accessToken, provider);
        
        showNotification(`Cuenta ${response.data.user.email} añadida exitosamente`, 'success');
        setMessage('Cuenta añadida exitosamente');
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      const errorMessage = 
        (error.response?.data?.message) || 
        error.message || 
        'Error al añadir cuenta';
      
      setIsError(true);
      setMessage(errorMessage);
      showNotification(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setIsError(false);
    setMessage('');
  };

  return {
    addAccount,
    isLoading,
    isError,
    message,
    reset
  };
};

export default useAddAccount;