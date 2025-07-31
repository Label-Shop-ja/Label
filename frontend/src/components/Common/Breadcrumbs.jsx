import React, { useState, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DollarSign, TrendingUp } from 'lucide-react';
import ExchangeRateDisplay from '../Currency/ExchangeRateDisplay';
import { useCurrency } from '../../context/CurrencyContext';
const ExchangeRateModal = lazy(() => import('../Currency/ExchangeRateModal'));

const breadcrumbNameMap = {
  'dashboard': 'Dashboard',
  'inventario': 'Inventario',
  'finanzas': 'Finanzas',
  'pos': 'Punto de Venta',
  'clientes': 'Clientes',
  'estadisticas': 'Estadísticas',
  'ajustes': 'Ajustes',
  'tasas-personalizadas': 'Tasas Personalizadas',
  'panel-admin': 'Panel de Administración',
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const [showExchangeRateModal, setShowExchangeRateModal] = useState(false);

  // Obtén la tasa desde el contexto
  const { exchangeRate, loadingCurrency, currencyError, formatPrice } = useCurrency();

  if (pathnames.length === 0 || pathnames[0] !== 'dashboard') {
    return null;
  }

  return (
    <div className="flex items-center justify-between mb-8">
      <nav aria-label="breadcrumb" className="text-sm text-neutral-gray">
        <ol className="flex items-center space-x-2">
          <li>
            <Link to="/dashboard" className="hover:text-copper-rose-accent transition-colors">
              {breadcrumbNameMap['dashboard']}
            </Link>
          </li>
          {pathnames.slice(1).map((value, index) => {
            const to = `/${pathnames.slice(0, index + 2).join('/')}`;
            const name = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);
            const isLast = index === pathnames.length - 2;
            return (
              <li key={to} className="flex items-center">
                <span className="mx-2 select-none">/</span>
                {isLast ? (
                  <h2 className="inline text-4xl font-bold text-text-base" aria-current="page">
                    {name}
                  </h2>
                ) : (
                  <Link to={to} className="hover:text-copper-rose-accent transition-colors">
                    {name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="ml-4 flex-shrink-0">
        <button
          onClick={() => setShowExchangeRateModal(true)}
          className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
          title="Configurar tasas de cambio"
        >
          {exchangeRate ? (
            <>
              <DollarSign size={16} className="text-blue-200" />
              <div className="text-right">
                <div className="font-bold text-sm leading-tight">
                  1 USD = {formatPrice(exchangeRate.personalRate > 0 ? exchangeRate.personalRate : exchangeRate.officialRate, 'VES')}
                </div>
                <div className="text-xs text-blue-200 leading-tight">
                  {exchangeRate.personalRate > 0 ? 'Personal' : 'Oficial'} • {exchangeRate.lastOfficialUpdate ? new Date(exchangeRate.lastOfficialUpdate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </div>
              </div>
              <TrendingUp size={14} className="text-blue-200 opacity-60 group-hover:opacity-100 transition-opacity" />
            </>
          ) : (
            <>
              <DollarSign size={16} className="text-blue-200" />
              <span className="text-sm">Configurar Tasa</span>
            </>
          )}
        </button>
        
        <Suspense fallback={<div>Cargando...</div>}>
          <ExchangeRateModal
            isOpen={showExchangeRateModal}
            onClose={() => setShowExchangeRateModal(false)}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default Breadcrumbs;