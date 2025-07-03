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
            {/* Ruta absoluta para asegurar que siempre apunte a la raíz del dashboard */}
            <NavLink to="/dashboard" className={getNavLinkClass} end>
              <span className="mr-3 text-2xl">📊</span> Panel
            </NavLink>
          </li>
          <li className="mb-2">
            {/* Ruta absoluta para el inventario */}
            <NavLink to="/dashboard/inventario" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">🏷️</span> Inventario
            </NavLink>
          </li>
          <li className="mb-2">
            {/* Ruta absoluta para finanzas */}
            <NavLink to="/dashboard/finanzas" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">💰</span> Finanzas
            </NavLink>
          </li>
          <li className="mb-2">
            {/* Ruta absoluta para el punto de venta */}
            <NavLink to="/dashboard/pos" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">🛒</span> Punto de Venta
            </NavLink>
          </li>
          <li className="mb-2">
            {/* Ruta absoluta para clientes */}
            <NavLink to="/dashboard/clientes" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">👥</span> Clientes y Proveedores
            </NavLink>
          </li>
          <li className="mb-2">
            {/* Ruta absoluta para estadísticas */}
            <NavLink to="/dashboard/estadisticas" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">📈</span> Estadísticas y Reportes
            </NavLink>
          </li>
          {/* Espaciador para empujar Ajustes al final si es necesario */}
          <li className="flex-grow"></li>
          <li>
            {/* Ruta absoluta para ajustes */}
            <NavLink to="/dashboard/ajustes" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">⚙️</span> Ajustes
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
