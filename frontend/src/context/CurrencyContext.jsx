// C:\Proyectos\Label\frontend\src\context\CurrencyContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance'; // Asegúrate que esta ruta sea correcta
import { useAuth } from './AuthContext'; // Asumo que tienes un AuthContext

const CurrencyContext = createContext();

export const useCurrency = () => {
  return useContext(CurrencyContext);
};

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth(); // Obtener el usuario del AuthContext
  const [exchangeRate, setExchangeRate] = useState(null); // Tasa de cambio actual
  const [loadingCurrency, setLoadingCurrency] = useState(true);
  const [currencyError, setCurrencyError] = useState('');

  // Función para obtener la tasa de cambio desde el backend
  const fetchExchangeRate = useCallback(async () => {
    if (!user) { // No intentar cargar si no hay usuario logueado
      setLoadingCurrency(false);
      return;
    }
    setLoadingCurrency(true);
    setCurrencyError('');
    try {
      const response = await axiosInstance.get('/exchangeRate');
      setExchangeRate(response.data);
      localStorage.setItem('exchangeRate', JSON.stringify(response.data)); // Guardar en localStorage
    } catch (err) {
      console.error('Error al cargar la tasa de cambio:', err.response?.data?.message || err.message);
      // Si no hay tasa configurada, se puede usar un default o dejar null
      setExchangeRate(null);
      setCurrencyError(err.response?.data?.message || 'Error al cargar la tasa de cambio.');
      localStorage.removeItem('exchangeRate'); // Limpiar si hubo error
    } finally {
      setLoadingCurrency(false);
    }
  }, [user]);

  // Función para establecer/actualizar la tasa de cambio en el backend
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
      console.error('Error al actualizar la tasa de cambio:', err.response?.data?.message || err.message);
      setCurrencyError(err.response?.data?.message || 'Error al actualizar la tasa de cambio.');
      return false;
    } finally {
      setLoadingCurrency(false);
    }
  }, [user]);

  // Efecto para cargar la tasa de cambio al inicio o cuando el usuario cambia
  useEffect(() => {
    // Intentar cargar desde localStorage primero
    const savedRate = localStorage.getItem('exchangeRate');
    if (savedRate) {
      setExchangeRate(JSON.parse(savedRate));
      setLoadingCurrency(false);
    }
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  // Función auxiliar para convertir precios
  const convertPrice = useCallback((amount, from, to) => {
    if (!exchangeRate || !exchangeRate.rate || amount === undefined || amount === null) {
      return null; // O un valor por defecto si no hay tasa
    }

    if (from === to) return amount;

    if (from === exchangeRate.fromCurrency && to === exchangeRate.toCurrency) {
      return amount * exchangeRate.rate;
    } else if (from === exchangeRate.toCurrency && to === exchangeRate.fromCurrency) {
      return amount / exchangeRate.rate;
    }
    return null; // No se puede convertir
  }, [exchangeRate]);

  // Función auxiliar para formatear precios con la moneda correcta
  const formatPrice = useCallback((amount, currency) => {
    if (amount === undefined || amount === null) return 'N/A';
    const formatter = new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  }, []);


  const value = {
    exchangeRate,
    loadingCurrency,
    currencyError,
    fetchExchangeRate,
    updateExchangeRate,
    convertPrice,
    formatPrice,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};