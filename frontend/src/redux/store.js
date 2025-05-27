// C:\Proyectos\Label\frontend\src\redux\store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // Importa el reducer de autenticación

const store = configureStore({
  reducer: {
    auth: authReducer, // Añade el reducer de autenticación al store
    // Aquí puedes añadir otros reducers si los creas en el futuro
  },
});

export default store;