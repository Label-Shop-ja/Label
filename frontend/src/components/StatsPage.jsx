import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import ErrorBoundary from "./Common/ErrorBoundary";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
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

  // --- Datos para gráficos ---

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
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          financialSummary?.netBalance >= 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          financialSummary?.netBalance >= 0 ? 'rgba(59, 130, 246, 1)' : 'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };
  const balanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: {
        ticks: { 
          color: '#94a3b8',
          font: { size: 12, weight: '500' }
        },
        grid: { 
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false
        }
      },
      y: {
        ticks: { 
          color: '#94a3b8',
          font: { size: 12, weight: '500' },
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        },
        grid: { 
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false
        }
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
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 8
      },
    ],
  };
  const categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#cbd5e1',
          padding: 20,
          usePointStyle: true,
          font: { size: 12, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return context.label + ': $' + context.parsed.toLocaleString();
          }
        }
      }
    },
  };

  // 3. Productos más Vendidos (Gráfico de Barras)
  const topProductsLabels = stats?.products?.topSellingProducts?.map(p => p.productName) || [];
  const topProductsData = stats?.products?.topSellingProducts?.map(p => p.totalQuantitySold) || [];
  const topProductsChartData = {
    labels: topProductsLabels,
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: topProductsData,
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };
  const topProductsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: {
        ticks: { 
          color: '#94a3b8',
          font: { size: 12, weight: '500' },
          maxRotation: 45
        },
        grid: { 
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false
        }
      },
      y: {
        ticks: { 
          color: '#94a3b8',
          font: { size: 12, weight: '500' }
        },
        grid: { 
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false
        }
      }
    }
  };


  // 4. Ventas por Método de Pago (Gráfico de Tarta/Dona)
  const paymentMethodLabels = stats?.sales?.salesByPaymentMethod?.map(s => s._id) || [];
  const paymentMethodData = stats?.sales?.salesByPaymentMethod?.map(s => s.total) || [];

  const paymentMethodChartData = {
    labels: paymentMethodLabels,
    datasets: [
      {
        label: 'Monto ($)',
        data: paymentMethodData,
        backgroundColor: [
          'rgba(249, 115, 22, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgba(249, 115, 22, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 8
      },
    ],
  };
  const paymentMethodOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#cbd5e1',
          padding: 20,
          usePointStyle: true,
          font: { size: 12, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return context.label + ': $' + context.parsed.toLocaleString();
          }
        }
      }
    },
  };


  return (
    <ErrorBoundary>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Header Espectacular */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-4">
            📊 Estadísticas y Análisis
          </h2>
          <div className="text-right">
            <p className="text-neutral-gray-300 text-sm">Dashboard Analítico</p>
            <p className="text-action-blue font-semibold">{new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </motion.div>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-96"
            >
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xl text-blue-400 font-medium">Cargando estadísticas...</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="p-4 bg-gradient-to-r from-red-900/40 to-red-800/30 border border-red-500/50 text-red-300 rounded-xl backdrop-blur-sm shadow-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-xl">⚠️</span>
                <strong className="font-bold">Error:</strong>
                <span className="ml-2">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && !error && (
          <>
            {/* KPI Cards Espectaculares */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative overflow-hidden bg-gradient-to-br from-blue-900/60 to-blue-800/30 p-6 rounded-xl border border-blue-500/40 backdrop-blur-sm shadow-2xl group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">💰</span>
                    <div className="text-blue-400 text-sm font-bold bg-blue-400/20 px-3 py-1 rounded-full">
                      VENTAS
                    </div>
                  </div>
                  <p className="text-blue-400 text-lg font-bold mb-1">Total de Ventas</p>
                  <p className="text-white text-3xl font-extrabold tracking-tight">
                    ${stats?.sales?.totalSalesAmount?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                  <p className="text-blue-300 text-sm mt-2">({stats?.sales?.totalSalesCount || 0} transacciones)</p>
                  <div className="mt-3 h-1.5 bg-blue-900/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.8, duration: 1 }}
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-300 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative overflow-hidden bg-gradient-to-br from-green-900/60 to-green-800/30 p-6 rounded-xl border border-green-500/40 backdrop-blur-sm shadow-2xl group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">📈</span>
                    <div className="text-green-400 text-sm font-bold bg-green-400/20 px-3 py-1 rounded-full">
                      INGRESOS
                    </div>
                  </div>
                  <p className="text-green-400 text-lg font-bold mb-1">Ingresos Totales</p>
                  <p className="text-white text-3xl font-extrabold tracking-tight">
                    ${financialSummary?.totalIncome?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                  <div className="mt-3 h-1.5 bg-green-900/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.9, duration: 1 }}
                      className="h-full bg-gradient-to-r from-green-400 to-green-300 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative overflow-hidden bg-gradient-to-br from-red-900/60 to-red-800/30 p-6 rounded-xl border border-red-500/40 backdrop-blur-sm shadow-2xl group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-400/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">📉</span>
                    <div className="text-red-400 text-sm font-bold bg-red-400/20 px-3 py-1 rounded-full">
                      GASTOS
                    </div>
                  </div>
                  <p className="text-red-400 text-lg font-bold mb-1">Gastos Totales</p>
                  <p className="text-white text-3xl font-extrabold tracking-tight">
                    ${financialSummary?.totalExpense?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                  <div className="mt-3 h-1.5 bg-red-900/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 1, duration: 1 }}
                      className="h-full bg-gradient-to-r from-red-400 to-red-300 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative overflow-hidden bg-gradient-to-br from-purple-900/60 to-purple-800/30 p-6 rounded-xl border border-purple-500/40 backdrop-blur-sm shadow-2xl group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">👥</span>
                    <div className="text-purple-400 text-sm font-bold bg-purple-400/20 px-3 py-1 rounded-full">
                      CLIENTES
                    </div>
                  </div>
                  <p className="text-purple-400 text-lg font-bold mb-1">Total Clientes</p>
                  <p className="text-white text-3xl font-extrabold tracking-tight">
                    {stats?.clients?.totalClients || 0}
                  </p>
                  <div className="mt-3 h-1.5 bg-purple-900/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 1.1, duration: 1 }}
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-300 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Gráficos Espectaculares */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 p-6 rounded-xl border border-slate-700/30 backdrop-blur-sm shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Balance Financiero</h3>
                </div>
                <Bar data={balanceData} options={balanceOptions} />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 p-6 rounded-xl border border-slate-700/30 backdrop-blur-sm shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🍩</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Gastos por Categoría</h3>
                </div>
                {expenseCategoryLabels.length > 0 ? (
                  <Doughnut data={expenseCategoryChartData} options={categoryOptions} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <span className="text-6xl mb-4">📊</span>
                    <p className="text-slate-400 text-center">No hay datos de gastos por categoría</p>
                  </div>
                )}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 p-6 rounded-xl border border-slate-700/30 backdrop-blur-sm shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🏆</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Top Productos</h3>
                </div>
                {topProductsLabels.length > 0 ? (
                  <Bar data={topProductsChartData} options={topProductsOptions} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <span className="text-6xl mb-4">📦</span>
                    <p className="text-slate-400 text-center">No hay datos de productos más vendidos</p>
                  </div>
                )}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 p-6 rounded-xl border border-slate-700/30 backdrop-blur-sm shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">💳</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Métodos de Pago</h3>
                </div>
                {paymentMethodLabels.length > 0 ? (
                  <Pie data={paymentMethodChartData} options={paymentMethodOptions} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <span className="text-6xl mb-4">💳</span>
                    <p className="text-slate-400 text-center">No hay datos de métodos de pago</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Panel de Inventario Mejorado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 p-8 rounded-xl border border-slate-700/30 backdrop-blur-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold">📦</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Información de Inventario</h3>
                  <p className="text-slate-400 text-sm">Estado actual del stock</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-700/30 border border-slate-600/30 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">Total de Productos</span>
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats?.products?.totalProducts || 0}</p>
                </div>
                
                <div className="bg-slate-700/30 border border-slate-600/30 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">Stock Bajo (≤ 10)</span>
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className={`text-3xl font-bold ${
                    (stats?.products?.lowStockProducts || 0) > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {stats?.products?.lowStockProducts || 0}
                  </p>
                  {(stats?.products?.lowStockProducts || 0) > 0 && (
                    <p className="text-red-300 text-sm mt-1">Requiere atención</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </ErrorBoundary>
  );
};

export default StatsPage;