// C:\Proyectos\Label\frontend\src\main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx'; // Importa AuthProvider
import { BrowserRouter } from 'react-router-dom'; // Importa BrowserRouter
import { CurrencyProvider } from './context/CurrencyContext.jsx'; // <-- NUEVA LÍNEA

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Este es el ÚNICO Router en tu aplicación */}
      <AuthProvider>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);