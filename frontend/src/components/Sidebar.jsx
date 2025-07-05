// C:\Proyectos\Label\frontend\src\components\Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Package, 
    DollarSign, 
    ShoppingCart, 
    Users, 
    BarChart2, 
    Settings,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';

const navLinks = [
  { to: "/dashboard", icon: LayoutDashboard, text: "Panel", end: true },
  { to: "/dashboard/inventario", icon: Package, text: "Inventario" },
  { to: "/dashboard/pos", icon: ShoppingCart, text: "Punto de Venta" },
  { to: "/dashboard/clientes", icon: Users, text: "Clientes" },
  { to: "/dashboard/estadisticas", icon: BarChart2, text: "Estadísticas" },
  { to: "/dashboard/finanzas", icon: DollarSign, text: "Finanzas" },
];

function Sidebar({ isExpanded, isPinned, onTogglePin, onMouseEnter, onMouseLeave }) {
  const getNavLinkClass = ({ isActive }) =>
    `flex items-center py-3 px-3 my-1 rounded-lg transition-all duration-200 ease-in-out ${
      isActive
        ? 'bg-primary text-white font-semibold shadow-lg'
        : 'text-text-muted hover:bg-surface-secondary hover:text-text-base'
    }`;

  return (
    <aside
      className={`bg-surface text-text-base p-4 flex flex-col shadow-xl sticky top-0 h-full transition-all duration-300 ease-in-out z-30 border-r border-surface-secondary ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ¡AQUÍ ESTÁ EL CAMBIO! El botón de anclar ahora es el rey */}
      <div className="flex items-center mb-8 h-[28px]">
        <button 
          onClick={onTogglePin} 
          className="p-1 rounded-lg hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={isPinned ? 'Desfijar menú' : 'Fijar menú'}
        >
          {isPinned ? <PanelLeftClose size={24} className="text-primary" /> : <PanelLeftOpen size={24} className="text-text-muted" />}
        </button>
        <span className={`whitespace-nowrap font-semibold text-sm text-text-muted transition-opacity duration-200 ml-3 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            Fijar menú
        </span>
      </div>
      
      <nav className="flex-1 flex flex-col justify-between">
        <div>
          <ul>
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={getNavLinkClass} end={link.end} title={link.text}>
                  <link.icon className={`min-w-[32px] transition-all duration-200 ${isActive => isActive ? 'text-white' : ''}`} strokeWidth={1.5} size={24} />
                  <span className={`whitespace-nowrap transition-opacity duration-200 ml-3 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                    {link.text}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <div className="border-t border-surface-secondary my-2"></div>
          <NavLink to="/dashboard/ajustes" className={getNavLinkClass} title="Ajustes">
            <Settings className="min-w-[32px]" strokeWidth={1.5} size={24} />
            <span className={`whitespace-nowrap transition-opacity duration-200 ml-3 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
              Ajustes
            </span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;