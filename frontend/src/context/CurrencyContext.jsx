// C:\Proyectos\Label\frontend\src\context\CurrencyContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';
// Import currency calculator functions
import { convertPrice as currencyCalculatorConvertPrice, getConversionRate } from '../utils/currencyCalculator';

const CurrencyContext = createContext({});

export const useCurrency = () => {
  return useContext(CurrencyContext);
};

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();
  const [exchangeRate, setExchangeRate] = useState(null); 
  const [loadingCurrency, setLoadingCurrency] = useState(false);
  const [currencyError, setCurrencyError] = useState('');
  // Available currencies list
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  // Custom exchange rates state
  const [customRates, setCustomRates] = useState([]);
  const [loadingCustomRates, setLoadingCustomRates] = useState(true);

  const fetchExchangeRate = useCallback(async () => {
    if (!user) {
      // No user authenticated - clear state and exit early to prevent app blocking
      setExchangeRate(null);
      setCurrencyError(''); // Clear any previous errors
      setLoadingCurrency(false);
      return;
    }
    setLoadingCurrency(true);
    setCurrencyError('');
    try {
      const response = await axiosInstance.get('/exchangeRate');
      setExchangeRate(response.data);
      localStorage.setItem('exchangeRate', JSON.stringify(response.data));
    } catch (err) {
      const msg = String(err.response?.data?.message || err.message || 'Unknown error loading exchange rate.');
      console.error('Error loading exchange rate:', msg);
      setExchangeRate(null);
      setCurrencyError(msg);
      localStorage.removeItem('exchangeRate');
    } finally {
      setLoadingCurrency(false);
    }
  }, [user]);

  // Fetch custom exchange rates for the user
  const fetchCustomRates = useCallback(async () => {
    if (!user) {
      setLoadingCustomRates(false);
      return;
    }
    setLoadingCustomRates(true);
    try {
      // GET request to custom rates endpoint
      const response = await axiosInstance.get('/custom-rates');
      setCustomRates(response.data);
    } catch (err) {
      const msg = String(err.response?.data?.message || err.message || 'Unknown error loading custom rates.');
      console.error('Error loading custom rates:', msg);
      setCustomRates([]); // Set empty array on error to prevent breaking
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
      const msg = String(err.response?.data?.message || err.message || 'Unknown error updating exchange rate.');
      console.error('Error updating exchange rate:', msg);
      setCurrencyError(msg);
      return false;
    } finally {
      setLoadingCurrency(false);
    }
  }, [user]);

  const updateExchangeRatesManually = useCallback(async () => {
    if (!user) {
      setCurrencyError('Debes iniciar sesión para actualizar las tasas.');
      return { success: false, message: 'Usuario no autenticado' };
    }
    setLoadingCurrency(true);
    setCurrencyError('');
    try {
      const response = await axiosInstance.post('/exchangeRate/update');
      if (response.data.updated) {
        setExchangeRate(response.data.exchangeRateConfig);
        localStorage.setItem('exchangeRate', JSON.stringify(response.data.exchangeRateConfig));
      }
      return { success: true, message: response.data.message, updated: response.data.updated };
    } catch (err) {
      const msg = String(err.response?.data?.message || err.message || 'Error updating exchange rates.');
      console.error('Error updating exchange rates manually:', msg);
      setCurrencyError(msg);
      return { success: false, message: msg };
    } finally {
      setLoadingCurrency(false);
    }
  }, [user]);

  useEffect(() => {
    // Lógica para cargar la tasa de cambio solo una vez
    fetchExchangeRate();
  }, [fetchExchangeRate]); // Listen for user changes through the hook

  // Fetch custom rates when component mounts
  useEffect(() => {
    fetchCustomRates();
  }, [fetchCustomRates]);

  // Extract and store available currencies from exchange rate data
  useEffect(() => {
    if (exchangeRate && exchangeRate.conversions) {
      const uniqueCurrencies = new Set();
      exchangeRate.conversions.forEach(conv => {
        uniqueCurrencies.add(conv.fromCurrency);
        uniqueCurrencies.add(conv.toCurrency);
      });
      // Convert to array and sort alphabetically
      setAvailableCurrencies(Array.from(uniqueCurrencies).sort());
    } else {
      setAvailableCurrencies([]); // Clear if no exchange rates
    }
  }, [exchangeRate]); // Effect triggers when exchangeRate changes


  const convertPrice = useCallback((amount, fromCurrency, toCurrency) => {
    if (!exchangeRate || !exchangeRate.conversions) {
      console.warn('No exchange rate configuration available for conversion. Returning null.');
      return null;
    }
    // Pass custom rates to the calculator
    return currencyCalculatorConvertPrice(amount, fromCurrency, toCurrency, exchangeRate, customRates);
  }, [exchangeRate, customRates]); // Include customRates in dependencies

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

  // CRUD functions for custom exchange rates

  const createCustomRate = useCallback(async (rateData) => {
    try {
      await axiosInstance.post('/custom-rates', rateData);
      await fetchCustomRates(); // Refresh list after creating
      return { success: true };
    } catch (err) {
      const msg = String(err.response?.data?.message || err.message || 'Error creating custom rate.');
      console.error('Error creating custom rate:', msg);
      return { success: false, error: msg };
    }
  }, [fetchCustomRates]);

  const updateCustomRate = useCallback(async (rateId, rateData) => {
    try {
      await axiosInstance.put(`/custom-rates/${rateId}`, rateData);
      await fetchCustomRates(); // Refresh list after updating
      return { success: true };
    } catch (err) {
      const msg = String(err.response?.data?.message || err.message || 'Error updating custom rate.');
      console.error('Error updating custom rate:', msg);
      return { success: false, error: msg };
    }
  }, [fetchCustomRates]);

  const deleteCustomRate = useCallback(async (rateId) => {
    try {
      await axiosInstance.delete(`/custom-rates/${rateId}`);
      await fetchCustomRates(); // Refresh list after deleting
      return { success: true };
    } catch (err) {
      const msg = String(err.response?.data?.message || err.message || 'Error deleting custom rate.');
      console.error('Error deleting custom rate:', msg);
      return { success: false, error: msg };
    }
  }, [fetchCustomRates]);


  const value = {
    exchangeRate,
    loadingCurrency,
    currencyError,
    fetchExchangeRate,
    updateExchangeRate,
    updateExchangeRatesManually,
    convertPrice,
    formatPrice,
    // Available currencies list
    availableCurrencies, 
    // Custom rates functionality
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