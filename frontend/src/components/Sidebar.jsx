// C:\Proyectos\Label\frontend\src\components\Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom'; // <-- Importa NavLink

function Sidebar() {
  // Función para aplicar estilos a los enlaces activos.
  // isActive es true si el NavLink actual coincide con la ruta.
  const getNavLinkClass = ({ isActive }) =>
    `flex items-center text-lg py-2 px-3 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-copper-rose-accent text-deep-night-blue font-semibold shadow-md' : 'hover:bg-gray-700 text-neutral-light'
    }`;

  return (
    <aside className="w-64 bg-deep-night-blue text-neutral-light p-6 flex flex-col shadow-xl sticky top-0 h-screen">
      <div className="text-2xl font-bold mb-8 text-copper-rose-accent">
        Menú Principal
      </div>
      <nav className="flex-1">
        <ul>
          <li className="mb-2">
            {/* Ruta relativa: "." significa la ruta actual del padre (/dashboard) */}
            <NavLink to="." className={getNavLinkClass} end>
              <span className="mr-3 text-2xl">📊</span> Panel
            </NavLink>
          </li>
          <li className="mb-2">
            {/* Ruta relativa: "inventario" se resolverá como /dashboard/inventario */}
            <NavLink to="inventario" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">🏷️</span> Inventario
            </NavLink>
          </li>
          <li className="mb-2">
            {/* Ruta relativa: "finanzas" se resolverá como /dashboard/finanzas */}
            <NavLink to="finanzas" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">💰</span> Finanzas
            </NavLink>
          </li>
          <li className="mb-2">
            {/* Ruta relativa: "pos" se resolverá como /dashboard/pos */}
            <NavLink to="pos" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">🛒</span> Punto de Venta
            </NavLink>
          </li>
          <li className="mb-2">
            {/* Ruta relativa: "clientes" se resolverá como /dashboard/clientes */}
            <NavLink to="clientes" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">👥</span> Clientes y Proveedores
            </NavLink>
          </li>
          <li className="mb-2">
            {/* Ruta relativa: "estadisticas" se resolverá como /dashboard/estadisticas */}
            <NavLink to="estadisticas" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">📈</span> Estadísticas y Reportes
            </NavLink>
          </li>
          {/* Espaciador para empujar Ajustes al final si es necesario */}
          <li className="flex-grow"></li>
          <li>
            {/* Ruta relativa: "ajustes" se resolverá como /dashboard/ajustes */}
            <NavLink to="ajustes" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">⚙️</span> Ajustes
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
