import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Un mapa simple para traducir los segmentos de la URL a nombres legibles.
// En una aplicación más grande, esto podría venir de tu sistema i18n.
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
  // Divide la URL en segmentos y filtra los elementos vacíos (por el primer '/')
  const pathnames = location.pathname.split('/').filter((x) => x);

  // No mostrar breadcrumbs si no estamos dentro del dashboard
  if (pathnames.length === 0 || pathnames[0] !== 'dashboard') {
    return null;
  }

  return (
    <nav aria-label="breadcrumb" className="mb-4 text-sm text-neutral-gray">
      <ol className="flex items-center space-x-2">
        {/* El enlace base al Dashboard siempre estará presente */}
        <li>
          <Link to="/dashboard" className="hover:text-copper-rose-accent transition-colors">
            {breadcrumbNameMap['dashboard']}
          </Link>
        </li>
        {/* Mapeamos el resto de los segmentos para crear los enlaces */}
        {pathnames.slice(1).map((value, index) => {
          const last = index === pathnames.length - 2;
          const to = `/${pathnames.slice(0, index + 2).join('/')}`;
          const name = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <li key={to} className="flex items-center">
              <span className="mx-2 select-none">/</span>
              {last ? (<span className="text-neutral-light font-semibold" aria-current="page">{name}</span>) : (<Link to={to} className="hover:text-copper-rose-accent transition-colors">{name}</Link>)}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;