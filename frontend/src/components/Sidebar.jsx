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
          <li className="mb-2"> {/* Reducimos el mb para mejor espaciado con padding en NavLink */}
            <NavLink to="/" className={getNavLinkClass} end> {/* 'end' para que solo active si la ruta es EXACTAMENTE '/' */}
              <span className="mr-3 text-2xl">📊</span> Dashboard
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/inventario" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">🏷️</span> Inventario y Catálogo
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/finanzas" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">💰</span> Gestión Financiera
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/pos" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">🛒</span> Punto de Venta (POS)
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/clientes" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">👥</span> Clientes y Proveedores
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/estadisticas" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">📈</span> Estadísticas y Reportes
            </NavLink>
          </li>
          {/* Espaciador para empujar Ajustes al final si es necesario */}
          <li className="flex-grow"></li>
          <li>
            <NavLink to="/ajustes" className={getNavLinkClass}>
              <span className="mr-3 text-2xl">⚙️</span> Ajustes
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;