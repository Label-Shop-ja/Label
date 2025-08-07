// C:\Proyectos\Label\frontend\src\main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { initSentry } from './utils/sentry.js';
import { initGA4 } from './utils/analytics.js';
import { initializeAuthState } from './utils/authCleanup.js';
import './i18n';
import App from './App.jsx';
import './index.css';

// Initialize monitoring and analytics
initSentry();
initGA4();

// Limpiar estado corrupto antes de iniciar la app
initializeAuthState();

const lang = 'es'; // O 'en' para inglés

// Initialize theme on app start
const savedTheme = localStorage.getItem('theme');
const theme = savedTheme === 'light' ? 'light' : 'dark';
const root = window.document.documentElement;
root.classList.remove('light', 'dark', 'classic');
if (theme === 'light') {
  root.classList.add('light');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);