import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { setupAxiosInterceptors } from '../api/axiosInstance';

const store = configureStore({
  reducer: {
    // This is where authReducer is initialized.
    auth: authReducer,
    // You can add other reducers here in the future.
  },
});

// Now that the store is created, we call the setup function and pass the store to it.
// This "injects" the store into the Axios instance, breaking the circular dependency.
setupAxiosInterceptors(store);

export default store;