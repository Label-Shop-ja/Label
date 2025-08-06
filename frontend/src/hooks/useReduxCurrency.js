// Custom hook for currency management with Redux
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  fetchExchangeRate,
  updateExchangeRate,
  updateExchangeRatesManually,
  fetchCustomRates,
  createCustomRate,
  updateCustomRate,
  deleteCustomRate,
  clearError,
  resetCurrency,
  selectExchangeRate,
  selectCustomRates,
  selectAvailableCurrencies,
  selectCurrencyLoading,
  selectCustomRatesLoading,
  selectCurrencyError,
  selectBaseCurrency,
  selectDefaultProfitPercentage,
  convertPrice,
  formatPrice
} from '../redux/currencySlice';

export const useReduxCurrency = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const exchangeRate = useSelector(selectExchangeRate);
  const customRates = useSelector(selectCustomRates);
  const availableCurrencies = useSelector(selectAvailableCurrencies);
  const loadingCurrency = useSelector(selectCurrencyLoading);
  const loadingCustomRates = useSelector(selectCustomRatesLoading);
  const currencyError = useSelector(selectCurrencyError);
  const baseCurrency = useSelector(selectBaseCurrency);
  const defaultProfitPercentage = useSelector(selectDefaultProfitPercentage);

  // Actions
  const fetchExchangeRateAction = useCallback(() => {
    dispatch(fetchExchangeRate());
  }, [dispatch]);

  const updateExchangeRateAction = useCallback((rateData) => {
    return dispatch(updateExchangeRate(rateData));
  }, [dispatch]);

  const updateExchangeRatesManuallyAction = useCallback(() => {
    return dispatch(updateExchangeRatesManually());
  }, [dispatch]);

  const fetchCustomRatesAction = useCallback(() => {
    dispatch(fetchCustomRates());
  }, [dispatch]);

  const createCustomRateAction = useCallback((rateData) => {
    return dispatch(createCustomRate(rateData));
  }, [dispatch]);

  const updateCustomRateAction = useCallback((rateId, rateData) => {
    return dispatch(updateCustomRate({ rateId, rateData }));
  }, [dispatch]);

  const deleteCustomRateAction = useCallback((rateId) => {
    return dispatch(deleteCustomRate(rateId));
  }, [dispatch]);

  const clearErrorAction = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const resetCurrencyAction = useCallback(() => {
    dispatch(resetCurrency());
  }, [dispatch]);

  // Helper functions
  const convertPriceHelper = useCallback((amount, fromCurrency, toCurrency) => {
    return convertPrice(amount, fromCurrency, toCurrency, exchangeRate, customRates);
  }, [exchangeRate, customRates]);

  const formatPriceHelper = useCallback((amount, currency) => {
    return formatPrice(amount, currency, exchangeRate);
  }, [exchangeRate]);

  // Auto-fetch on mount
  useEffect(() => {
    if (!exchangeRate) {
      fetchExchangeRateAction();
    }
    if (customRates.length === 0) {
      fetchCustomRatesAction();
    }
  }, [exchangeRate, customRates.length, fetchExchangeRateAction, fetchCustomRatesAction]);

  return {
    // State
    exchangeRate,
    customRates,
    availableCurrencies,
    loadingCurrency,
    loadingCustomRates,
    currencyError,
    baseCurrency,
    defaultProfitPercentage,
    
    // Actions
    fetchExchangeRate: fetchExchangeRateAction,
    updateExchangeRate: updateExchangeRateAction,
    updateExchangeRatesManually: updateExchangeRatesManuallyAction,
    fetchCustomRates: fetchCustomRatesAction,
    createCustomRate: createCustomRateAction,
    updateCustomRate: updateCustomRateAction,
    deleteCustomRate: deleteCustomRateAction,
    clearError: clearErrorAction,
    resetCurrency: resetCurrencyAction,
    
    // Helpers
    convertPrice: convertPriceHelper,
    formatPrice: formatPriceHelper
  };
};