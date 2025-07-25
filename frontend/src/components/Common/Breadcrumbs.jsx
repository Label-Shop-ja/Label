import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ExchangeRateDisplay from '../Currency/ExchangeRateDisplay';
import { useCurrency } from '../../context/CurrencyContext';

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
        <ExchangeRateDisplay
          exchangeRate={exchangeRate}
          loading={loadingCurrency}
          error={currencyError}
          formatPrice={formatPrice}
          primaryCurrency={exchangeRate?.fromCurrency || 'USD'}
          secondaryCurrency={exchangeRate?.toCurrency || 'VES'}
        />
      </div>
    </div>
  );
};

export default Breadcrumbs;