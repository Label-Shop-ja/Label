// C:\Proyectos\Label\frontend\src\context\CurrencyContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';
// Importamos las funciones de nuestra calculadora criminal del frontend
import { convertPrice as currencyCalculatorConvertPrice, getConversionRate } from '../utils/currencyCalculator';

const CurrencyContext = createContext({});

export const useCurrency = () => {
  return useContext(CurrencyContext);
};

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();
  const [exchangeRate, setExchangeRate] = useState(null); 
  const [loadingCurrency, setLoadingCurrency] = useState(true);
  const [currencyError, setCurrencyError] = useState('');
  // ¡NUEVO ESTADO! Para guardar la lista de todas las monedas disponibles.
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  // ¡ESTADO CRIMINAL! Aquí guardamos las tasas personalizadas del pana.
  const [customRates, setCustomRates] = useState([]);
  const [loadingCustomRates, setLoadingCustomRates] = useState(true);

  const fetchExchangeRate = useCallback(async () => {
    if (!user) {
      setLoadingCurrency(false);
      // ¡CLAVE! Si no hay usuario, no es un error. Simplemente no podemos cargar las tasas.
      // Limpiamos el estado y salimos para que la app no se tranque.
      setExchangeRate(null);
      setCurrencyError(''); // Limpiamos cualquier error previo.
      return;
    }
    setLoadingCurrency(true);
    setCurrencyError('');
    try {
      const response = await axiosInstance.get('/exchangeRate');
      setExchangeRate(response.data);
      localStorage.setItem('exchangeRate', JSON.stringify(response.data));
    } catch (err) {
      const msg = String(err.response?.data?.message || err.message || 'Error desconocido al cargar tasa.');
      console.error('¡Coño! Error al cargar la tasa de cambio:', msg);
      setExchangeRate(null);
      setCurrencyError(msg);
      localStorage.removeItem('exchangeRate');
    } finally {
      setLoadingCurrency(false);
    }
  }, [user]);

  // ¡NUEVA FUNCIÓN CRIMINAL! Pa' ir a buscar las tasas personalizadas del usuario.
  const fetchCustomRates = useCallback(async () => {
    if (!user) {
      setLoadingCustomRates(false);
      return;
    }
    setLoadingCustomRates(true);
    try {
      // Le metemos un GET al nuevo endpoint que creamos en el backend
      const response = await axiosInstance.get('/custom-rates');
      setCustomRates(response.data);
    } catch (err) {
      const msg = String(err.response?.data?.message || err.message || 'Error desconocido al cargar tasas personalizadas.');
      console.error('¡Coño! Error al cargar las tasas personalizadas:', msg);
      setCustomRates([]); // Si hay peo, lo dejamos vacío pa' no romper nada.
    } finally {
      setLoadingCustomRates(false);
    }
  }, [user]);

  const updateExchangeRate = useCallback(async (rateData) => {
    if (!user) {
      setCurrencyError('Debes iniciar sesión para actualizar la tasa de cambio.');
      return false;
    }
    setLoadingCurrency(true);
    setCurrencyError('');
    try {
      const response = await axiosInstance.post('/exchangeRate', rateData);
      setExchangeRate(response.data);
      localStorage.setItem('exchangeRate', JSON.stringify(response.data));
      return true;
    } catch (err) {
      const msg = String(err.response?.data?.message || err.message || 'Error desconocido al actualizar tasa.');
      console.error('¡Verga! Error al actualizar la tasa de cambio:', msg);
      setCurrencyError(msg);
      return false;
    } finally {
      setLoadingCurrency(false);
    }
  }, [user]);

  useEffect(() => {
    // Lógica para cargar la tasa de cambio solo una vez
    fetchExchangeRate();
  }, [fetchExchangeRate]); // <-- ¡ARREGLADO! Ahora escucha los cambios en el usuario a través del hook

  // ¡DE UNA! Llamamos a la nueva función aquí también.
  useEffect(() => {
    fetchCustomRates();
  }, [fetchCustomRates]);

  // --- ¡NUEVO EFECTO! Para extraer y almacenar las monedas disponibles ---
  useEffect(() => {
    if (exchangeRate && exchangeRate.conversions) {
      const uniqueCurrencies = new Set();
      exchangeRate.conversions.forEach(conv => {
        uniqueCurrencies.add(conv.fromCurrency);
        uniqueCurrencies.add(conv.toCurrency);
      });
      // Convertir a array y ordenar alfabéticamente
      setAvailableCurrencies(Array.from(uniqueCurrencies).sort());
    } else {
      setAvailableCurrencies([]); // Vaciar si no hay tasas
    }
  }, [exchangeRate]); // Este efecto se dispara cada vez que exchangeRate cambia


  const convertPrice = useCallback((amount, fromCurrency, toCurrency) => {
    if (!exchangeRate || !exchangeRate.conversions) {
      console.warn('¡Coño! No hay configuración de tasas de cambio disponible para convertir. Devolviendo null.');
      return null;
    }
    // ¡LA JUGADA MAESTRA! Le pasamos las tasas personalizadas a la calculadora.
    return currencyCalculatorConvertPrice(amount, fromCurrency, toCurrency, exchangeRate, customRates);
  }, [exchangeRate, customRates]); // ¡OJO! Añadimos customRates a las dependencias.

  const formatPrice = useCallback((amount, currency) => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) return 'N/A';
    const effectiveCurrency = currency || exchangeRate?.displayCurrency || 'USD';
    const formatter = new Intl.NumberFormat('es-VE', { 
      style: 'currency',
      currency: effectiveCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  }, [exchangeRate]);

  // --- ¡NUEVAS FUNCIONES! Pa' que el usuario meta mano en sus tasas (CRUD) ---

  const createCustomRate = useCallback(async (rateData) => {
    try {
      await axiosInstance.post('/custom-rates', rateData);
      await fetchCustomRates(); // Refrescamos la lista después de crear
      return { success: true };
    } catch (err) {
      const msg = String(err.response?.data?.message || err.message || 'Error al crear tasa.');
      console.error('¡Peo creando tasa personalizada!', msg);
      return { success: false, error: msg };
    }
  }, [fetchCustomRates]);

  const updateCustomRate = useCallback(async (rateId, rateData) => {
    try {
      await axiosInstance.put(`/custom-rates/${rateId}`, rateData);
      await fetchCustomRates(); // Refrescamos la lista después de actualizar
      return { success: true };
    } catch (err) {
      const msg = String(err.response?.data?.message || err.message || 'Error al actualizar tasa.');
      console.error('¡Peo actualizando tasa personalizada!', msg);
      return { success: false, error: msg };
    }
  }, [fetchCustomRates]);

  const deleteCustomRate = useCallback(async (rateId) => {
    try {
      await axiosInstance.delete(`/custom-rates/${rateId}`);
      await fetchCustomRates(); // Refrescamos la lista después de borrar
      return { success: true };
    } catch (err) {
      const msg = String(err.response?.data?.message || err.message || 'Error al eliminar tasa.');
      console.error('¡Peo eliminando tasa personalizada!', msg);
      return { success: false, error: msg };
    }
  }, [fetchCustomRates]);


  const value = {
    exchangeRate,
    loadingCurrency,
    currencyError,
    fetchExchangeRate,
    updateExchangeRate,
    convertPrice,
    formatPrice,
    // ¡NUEVA PROP! Exportamos la lista de monedas disponibles
    availableCurrencies, 
    // ¡EXPORTANDO EL NUEVO GUISO!
    customRates,
    loadingCustomRates,
    fetchCustomRates,
    createCustomRate,
    updateCustomRate,
    deleteCustomRate,
    baseCurrency: exchangeRate?.baseCurrency || 'USD',
    defaultProfitPercentage: exchangeRate?.defaultProfitPercentage,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};