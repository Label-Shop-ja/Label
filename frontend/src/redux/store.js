import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productReducer from './productSlice';
import currencyReducer from './currencySlice';
import themeReducer from './themeSlice';
import notificationReducer from './notificationSlice';
import { setupAxiosInterceptors } from '../api/axiosInstance';

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    currency: currencyReducer,
    theme: themeReducer,
    notification: notificationReducer,
  },
});

// Now that the store is created, we call the setup function and pass the store to it.
// This "injects" the store into the Axios instance, breaking the circular dependency.
setupAxiosInterceptors(store);

export default store;