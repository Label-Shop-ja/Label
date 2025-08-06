// Currency state management with Redux
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import { convertPrice as currencyCalculatorConvertPrice } from '../utils/currencyCalculator';

// Async thunks
export const fetchExchangeRate = createAsyncThunk(
  'currency/fetchExchangeRate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/exchangeRate');
      localStorage.setItem('exchangeRate', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error loading exchange rate';
      localStorage.removeItem('exchangeRate');
      return rejectWithValue(message);
    }
  }
);

export const updateExchangeRate = createAsyncThunk(
  'currency/updateExchangeRate',
  async (rateData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/exchangeRate', rateData);
      localStorage.setItem('exchangeRate', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error updating exchange rate';
      return rejectWithValue(message);
    }
  }
);

export const updateExchangeRatesManually = createAsyncThunk(
  'currency/updateExchangeRatesManually',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/exchangeRate/update');
      if (response.data.updated) {
        localStorage.setItem('exchangeRate', JSON.stringify(response.data.exchangeRateConfig));
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error updating exchange rates';
      return rejectWithValue(message);
    }
  }
);

export const fetchCustomRates = createAsyncThunk(
  'currency/fetchCustomRates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/custom-rates');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error loading custom rates';
      return rejectWithValue(message);
    }
  }
);

export const createCustomRate = createAsyncThunk(
  'currency/createCustomRate',
  async (rateData, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post('/custom-rates', rateData);
      dispatch(fetchCustomRates());
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error creating custom rate';
      return rejectWithValue(message);
    }
  }
);

export const updateCustomRate = createAsyncThunk(
  'currency/updateCustomRate',
  async ({ rateId, rateData }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.put(`/custom-rates/${rateId}`, rateData);
      dispatch(fetchCustomRates());
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error updating custom rate';
      return rejectWithValue(message);
    }
  }
);

export const deleteCustomRate = createAsyncThunk(
  'currency/deleteCustomRate',
  async (rateId, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/custom-rates/${rateId}`);
      dispatch(fetchCustomRates());
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error deleting custom rate';
      return rejectWithValue(message);
    }
  }
);

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    exchangeRate: null,
    customRates: [],
    availableCurrencies: [],
    loading: false,
    customRatesLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetCurrency: (state) => {
      state.exchangeRate = null;
      state.customRates = [];
      state.availableCurrencies = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch exchange rate
      .addCase(fetchExchangeRate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExchangeRate.fulfilled, (state, action) => {
        state.loading = false;
        state.exchangeRate = action.payload;
        // Extract available currencies
        if (action.payload?.conversions) {
          const uniqueCurrencies = new Set();
          action.payload.conversions.forEach(conv => {
            uniqueCurrencies.add(conv.fromCurrency);
            uniqueCurrencies.add(conv.toCurrency);
          });
          state.availableCurrencies = Array.from(uniqueCurrencies).sort();
        }
      })
      .addCase(fetchExchangeRate.rejected, (state, action) => {
        state.loading = false;
        state.error = null; // No mostrar error, usar valores por defecto
        state.exchangeRate = {
          baseCurrency: 'USD',
          displayCurrency: 'USD',
          conversions: [],
          defaultProfitPercentage: 0
        };
      })
      
      // Update exchange rate
      .addCase(updateExchangeRate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExchangeRate.fulfilled, (state, action) => {
        state.loading = false;
        state.exchangeRate = action.payload;
      })
      .addCase(updateExchangeRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update exchange rates manually
      .addCase(updateExchangeRatesManually.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExchangeRatesManually.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.updated) {
          state.exchangeRate = action.payload.exchangeRateConfig;
        }
      })
      .addCase(updateExchangeRatesManually.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch custom rates
      .addCase(fetchCustomRates.pending, (state) => {
        state.customRatesLoading = true;
      })
      .addCase(fetchCustomRates.fulfilled, (state, action) => {
        state.customRatesLoading = false;
        state.customRates = action.payload;
      })
      .addCase(fetchCustomRates.rejected, (state, action) => {
        state.customRatesLoading = false;
        state.customRates = [];
      });
  }
});

// Selectors
export const selectExchangeRate = (state) => state.currency.exchangeRate;
export const selectCustomRates = (state) => state.currency.customRates;
export const selectAvailableCurrencies = (state) => state.currency.availableCurrencies;
export const selectCurrencyLoading = (state) => state.currency.loading;
export const selectCustomRatesLoading = (state) => state.currency.customRatesLoading;
export const selectCurrencyError = (state) => state.currency.error;
export const selectBaseCurrency = (state) => state.currency.exchangeRate?.baseCurrency || 'USD';
export const selectDefaultProfitPercentage = (state) => state.currency.exchangeRate?.defaultProfitPercentage;

// Helper functions
export const convertPrice = (amount, fromCurrency, toCurrency, exchangeRate, customRates) => {
  if (!exchangeRate?.conversions) return null;
  return currencyCalculatorConvertPrice(amount, fromCurrency, toCurrency, exchangeRate, customRates);
};

export const formatPrice = (amount, currency, exchangeRate) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return 'N/A';
  const effectiveCurrency = currency || exchangeRate?.displayCurrency || 'USD';
  const formatter = new Intl.NumberFormat('es-VE', { 
    style: 'currency',
    currency: effectiveCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

export const { clearError, resetCurrency } = currencySlice.actions;
export default currencySlice.reducer;