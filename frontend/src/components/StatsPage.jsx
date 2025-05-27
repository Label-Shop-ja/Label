// C:\Proyectos\Label\frontend\src\components\StatsPage.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar los componentes de Chart.js que vamos a usar
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch Financial Summary
        const financialRes = await axiosInstance.get('/transactions/summary');
        setFinancialSummary(financialRes.data);

        // Fetch Sales and Product Stats
        const statsRes = await axiosInstance.get('/stats/sales-products');
        setStats(statsRes.data);

      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
        const errorMessage = err.response?.data?.message || 'Error al cargar las estadísticas.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen">
        <p className="text-xl text-action-blue">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-dark-slate-gray rounded-lg shadow-xl min-h-screen">
        <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">¡Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      </div>
    );
  }

  // --- Datos para gráficos ---

  // 1. Balance Financiero (Gráfico de Barras)
  const balanceData = {
    labels: ['Ingresos Totales', 'Gastos Totales', 'Balance Neto'],
    datasets: [
      {
        label: 'Monto ($)',
        data: [
          financialSummary?.totalIncome || 0,
          financialSummary?.totalExpense || 0,
          financialSummary?.netBalance || 0
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // Ingresos (verde azulado)
          'rgba(255, 99, 132, 0.6)', // Gastos (rojo)
          financialSummary?.netBalance >= 0 ? 'rgba(54, 162, 235, 0.6)' : 'rgba(200, 50, 50, 0.6)' // Balance (azul o rojo oscuro)
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          financialSummary?.netBalance >= 0 ? 'rgba(54, 162, 235, 1)' : 'rgba(200, 50, 50, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  const balanceOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#cbd5e1' // neutral-gray-300
        }
      },
      title: {
        display: true,
        text: 'Resumen Financiero',
        color: '#e2e8f0' // neutral-light
      },
    },
    scales: {
      x: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  // 2. Transacciones por Categoría (Gráfico de Tarta/Dona) - Gastos
  const expenseCategoryLabels = Object.keys(financialSummary?.expenseByCategory || {});
  const expenseCategoryData = Object.values(financialSummary?.expenseByCategory || {});

  const expenseCategoryChartData = {
    labels: expenseCategoryLabels,
    datasets: [
      {
        label: 'Monto ($)',
        data: expenseCategoryData,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  const categoryOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#cbd5e1'
        }
      },
      title: {
        display: true,
        text: 'Gastos por Categoría',
        color: '#e2e8f0'
      },
    },
  };

  // 3. Productos más Vendidos (Gráfico de Barras)
  const topProductsLabels = stats?.products?.topSellingProducts.map(p => p.productName) || [];
  const topProductsData = stats?.products?.topSellingProducts.map(p => p.totalQuantitySold) || [];
  const topProductsChartData = {
    labels: topProductsLabels,
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: topProductsData,
        backgroundColor: 'rgba(153, 102, 255, 0.6)', // color morado
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };
  const topProductsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#cbd5e1'
        }
      },
      title: {
        display: true,
        text: 'Top 5 Productos Más Vendidos (por Cantidad)',
        color: '#e2e8f0'
      },
    },
    scales: {
      x: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };


  // 4. Ventas por Método de Pago (Gráfico de Tarta/Dona)
  const paymentMethodLabels = stats?.sales?.salesByPaymentMethod.map(s => s._id) || [];
  const paymentMethodData = stats?.sales?.salesByPaymentMethod.map(s => s.total) || [];

  const paymentMethodChartData = {
    labels: paymentMethodLabels,
    datasets: [
      {
        label: 'Monto ($)',
        data: paymentMethodData,
        backgroundColor: [
          'rgba(255, 159, 64, 0.6)', // Naranja (cash)
          'rgba(54, 162, 235, 0.6)', // Azul (card)
          'rgba(75, 192, 192, 0.6)', // Verde azulado (transfer)
          'rgba(199, 199, 199, 0.6)' // Gris (other)
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(199, 199, 199, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  const paymentMethodOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#cbd5e1'
        }
      },
      title: {
        display: true,
        text: 'Ventas por Método de Pago',
        color: '#e2e8f0'
      },
    },
  };


  return (
    <div className="p-6 bg-dark-slate-gray rounded-lg shadow-xl min-h-screen">
      <h2 className="text-4xl font-extrabold text-copper-rose-accent mb-8 border-b-2 border-action-blue pb-4">Estadísticas y Análisis</h2>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-center">
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner border border-action-blue-light">
          <p className="text-action-blue-light text-2xl font-bold">Total de Ventas</p>
          <p className="text-neutral-light text-3xl font-extrabold mt-2">${stats?.sales?.totalSalesAmount.toFixed(2) || '0.00'}</p>
          <p className="text-neutral-gray-300 text-sm">({stats?.sales?.totalSalesCount} transacciones)</p>
        </div>
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner border border-green-500">
          <p className="text-green-400 text-2xl font-bold">Ingresos Totales</p>
          <p className="text-neutral-light text-3xl font-extrabold mt-2">${financialSummary?.totalIncome.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner border border-red-500">
          <p className="text-red-400 text-2xl font-bold">Gastos Totales</p>
          <p className="text-neutral-light text-3xl font-extrabold mt-2">${financialSummary?.totalExpense.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner border border-purple-500">
          <p className="text-purple-400 text-2xl font-bold">Total Clientes</p>
          <p className="text-neutral-light text-3xl font-extrabold mt-2">{stats?.clients?.totalClients || 0}</p>
        </div>
      </div>

      {/* Sección de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-lg border border-neutral-gray-700">
          <Bar data={balanceData} options={balanceOptions} />
        </div>

        <div className="bg-deep-night-blue p-6 rounded-lg shadow-lg border border-neutral-gray-700">
          {expenseCategoryLabels.length > 0 ? (
            <Doughnut data={expenseCategoryChartData} options={categoryOptions} />
          ) : (
            <p className="text-neutral-gray-300 text-lg text-center mt-4">No hay datos de gastos por categoría para mostrar.</p>
          )}
        </div>

        <div className="bg-deep-night-blue p-6 rounded-lg shadow-lg border border-neutral-gray-700">
          {topProductsLabels.length > 0 ? (
            <Bar data={topProductsChartData} options={topProductsOptions} />
          ) : (
            <p className="text-neutral-gray-300 text-lg text-center mt-4">No hay datos de productos más vendidos para mostrar.</p>
          )}
        </div>

        <div className="bg-deep-night-blue p-6 rounded-lg shadow-lg border border-neutral-gray-700">
          {paymentMethodLabels.length > 0 ? (
            <Pie data={paymentMethodChartData} options={paymentMethodOptions} />
          ) : (
            <p className="text-neutral-gray-300 text-lg text-center mt-4">No hay datos de ventas por método de pago para mostrar.</p>
          )}
        </div>
      </div>

      {/* Detalles adicionales de inventario */}
      <div className="mt-8 bg-deep-night-blue p-6 rounded-lg shadow-inner border border-action-blue-light">
        <h3 className="text-2xl font-semibold text-neutral-light mb-4">Información de Inventario</h3>
        <p className="text-neutral-light mb-2">
          <span className="font-semibold">Total de Productos:</span> {stats?.products?.totalProducts || 0}
        </p>
        <p className="text-neutral-light">
          <span className="font-semibold">Productos con Stock Bajo (&lt;= 10):</span>{' '}
          <span className={`${stats?.products?.lowStockProducts > 0 ? 'text-red-400 font-bold' : 'text-green-400'}`}>
            {stats?.products?.lowStockProducts || 0}
          </span>
        </p>
      </div>
    </div>
  );
};

export default StatsPage;