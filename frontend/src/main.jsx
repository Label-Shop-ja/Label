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
import { NotificationProvider } from './context/NotificationContext';
import './i18n'; // Importa antes de renderizar la app

const lang = 'es'; // O 'en' para inglés

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
        <Provider store={store}>
            <AuthProvider>
                <CurrencyProvider>
                    <NotificationProvider>
                        <App />
                    </NotificationProvider>
                </CurrencyProvider>
            </AuthProvider>
        </Provider>
    </BrowserRouter>
  </React.StrictMode>
);