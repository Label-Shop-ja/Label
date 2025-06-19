// C:\Proyectos\Label\frontend\src\main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux'; // <-- ¡ESTA LÍNEA ES CLAVE Y TIENE QUE ESTAR ASÍ!
import store from './redux/store'; // <-- ¡ESTA LÍNEA ES CLAVE Y TIENE QUE ESTAR ASÍ!
import { AuthProvider } from './context/AuthContext.jsx';
import { BrowserRouter } from 'react-router-dom';
import { CurrencyProvider } from './context/CurrencyContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode> // TEMPORALMENTE COMENTA ESTA LÍNEA PARA DEBUGGING EN DESARROLLO
      <BrowserRouter>
          <Provider store={store}>
              <AuthProvider>
                  <CurrencyProvider>
                      <App />
                  </CurrencyProvider>
              </AuthProvider>
          </Provider>
      </BrowserRouter>
  // </React.StrictMode> // TEMPORALMENTE COMENTA ESTA LÍNEA PARA DEBUGGING EN DESARROLLO
);