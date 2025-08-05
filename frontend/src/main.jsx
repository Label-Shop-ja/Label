// C:\Proyectos\Label\frontend\src\main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store';
import { BrowserRouter } from 'react-router-dom';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { initSentry } from './utils/sentry.js';
import { initGA4 } from './utils/analytics.js';
import './i18n';
import App from './App.jsx';
import './index.css';

// Initialize monitoring and analytics
initSentry();
initGA4();

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