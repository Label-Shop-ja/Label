// C:\Proyectos\Label\frontend\src\context\CurrencyContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

// Importamos las funciones de nuestra calculadora criminal del frontend
import { convertPrice as currencyCalculatorConvertPrice, getConversionRate } from '../utils/currencyCalculator';

const CurrencyContext = createContext();

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

  const fetchExchangeRate = useCallback(async () => {
    if (!user) {
      setLoadingCurrency(false);
      setCurrencyError('No hay usuario logueado. No se puede cargar la tasa de cambio.'); 
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
    const savedRate = localStorage.getItem('exchangeRate');
    if (savedRate) {
      try {
        setExchangeRate(JSON.parse(savedRate));
        setLoadingCurrency(false);
      } catch (e) {
        console.error('Error al parsear exchangeRate de localStorage:', e);
        localStorage.removeItem('exchangeRate');
      }
    }
    fetchExchangeRate();
  }, [fetchExchangeRate]);

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
    return currencyCalculatorConvertPrice(amount, fromCurrency, toCurrency, exchangeRate);
  }, [exchangeRate]);

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
    baseCurrency: exchangeRate?.baseCurrency || 'USD',
    defaultProfitPercentage: exchangeRate?.defaultProfitPercentage,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};