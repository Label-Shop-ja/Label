// C:\Proyectos\Label\frontend\src\components\DashboardHome.jsx
import React from 'react';

function DashboardHome() {
  return (
    // Contenedor del Home del Dashboard:
    // flex-1: Ocupa todo el espacio horizontal restante.
    // p-8: Relleno.
    // bg-gray-900: Fondo ligeramente más claro que el deep-night-blue.
    // text-neutral-light: Color de texto.
    // El tag <main> y las clases de layout se eliminan. DashboardLayout ya los provee.
    <div>
      <h1 className="text-4xl font-bold mb-8 text-copper-rose-accent">
        Panel de Control
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Tarjeta de Resumen 1 */}
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-2 text-action-blue">Ventas del Día</h2>
          <p className="text-3xl font-bold">$1,234.56</p>
          <p className="text-sm text-neutral-gray mt-2">▲ 12% respecto a ayer</p>
        </div>
        {/* Tarjeta de Resumen 2 */}
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-2 text-success-green">Productos en Stock</h2>
          <p className="text-3xl font-bold">543</p>
          <p className="text-sm text-neutral-gray mt-2">5 con bajo stock</p>
        </div>
        {/* Tarjeta de Resumen 3 */}
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-2 text-error-red">Gastos Pendientes</h2>
          <p className="text-3xl font-bold">$789.00</p>
          <p className="text-sm text-neutral-gray mt-2">Próximo pago: Lunes</p>
        </div>
      </div>

      {/* Sección de Actividad Reciente */}
      <section className="bg-deep-night-blue p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-neutral-light">Actividad Reciente</h2>
        <ul>
          <li className="border-b border-gray-700 py-3 flex justify-between items-center">
            <span className="text-lg">Venta #1001 a Cliente A</span>
            <span className="text-success-green font-semibold">+$50.00</span>
          </li>
          <li className="border-b border-gray-700 py-3 flex justify-between items-center">
            <span className="text-lg">Producto 'Leche' actualizado</span>
            <span className="text-neutral-gray text-sm">Inventario</span>
          </li>
          <li className="py-3 flex justify-between items-center">
            <span className="text-lg">Pago a Proveedor X</span>
            <span className="text-error-red font-semibold">-$200.00</span>
          </li>
        </ul>
      </section>

      {/* Sección de Gráficos (Placeholder) */}
      <section className="bg-deep-night-blue p-6 rounded-lg shadow-md h-64 flex items-center justify-center text-xl text-neutral-gray">
        Aquí irán gráficos y reportes visuales
      </section>

    </div>
  );
}

export default DashboardHome;