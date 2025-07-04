// C:\Proyectos\Label\frontend\src\main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'; // <-- ¡ESTA LÍNEA ES CLAVE Y TIENE QUE ESTAR ASÍ!
import store from './redux/store'; // <-- ¡ESTA LÍNEA ES CLAVE Y TIENE QUE ESTAR ASÍ!
import { BrowserRouter } from 'react-router-dom';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext.jsx'; // 1. Importamos el ThemeProvider
import './i18n'; // Importa antes de renderizar la app
import App from './App.jsx';
import './index.css'; // ¡Esta es la línea que restaura los estilos!

const lang = 'es'; // O 'en' para inglés

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
        <Provider store={store}>
            <CurrencyProvider>
                <NotificationProvider>
                    {/* 2. Envolvemos la App con el ThemeProvider */}
                    <ThemeProvider>
                        <App />
                    </ThemeProvider>
                </NotificationProvider>
            </CurrencyProvider>
        </Provider>
    </BrowserRouter>
  </React.StrictMode>
);