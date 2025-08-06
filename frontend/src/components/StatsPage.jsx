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
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
        {/* Header Ultra Moderno */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="relative overflow-hidden bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/30 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-slate-400 text-lg font-medium">Insights empresariales en tiempo real</p>
            </div>
            <div className="text-right space-y-2">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl px-6 py-3 border border-slate-600/30">
                <p className="text-slate-300 text-sm font-medium">Última actualización</p>
                <p className="text-white text-xl font-bold">{new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </div>
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
            {/* KPI Cards Ultra Modernos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                className="relative overflow-hidden bg-gradient-to-br from-blue-950/90 via-blue-900/70 to-cyan-900/50 p-8 rounded-3xl border border-blue-400/20 backdrop-blur-xl shadow-2xl group perspective-1000"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-cyan-400/5 group-hover:from-blue-400/10 group-hover:to-cyan-400/10 transition-all duration-700" />
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="text-blue-300 text-xs font-bold bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">
                      REVENUE
                    </div>
                  </div>
                  <h3 className="text-blue-200 text-sm font-semibold mb-2 uppercase tracking-wider">Total Ventas</h3>
                  <p className="text-white text-4xl font-black mb-3 tracking-tight">
                    ${stats?.sales?.totalSalesAmount?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                  <p className="text-blue-300/80 text-sm font-medium">
                    {stats?.sales?.totalSalesCount || 0} transacciones completadas
                  </p>
                  <div className="mt-4 h-2 bg-blue-950/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: '100%', opacity: 1 }}
                      transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 rounded-full shadow-lg"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                className="relative overflow-hidden bg-gradient-to-br from-emerald-950/90 via-green-900/70 to-teal-900/50 p-8 rounded-3xl border border-emerald-400/20 backdrop-blur-xl shadow-2xl group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-transparent to-teal-400/5 group-hover:from-emerald-400/10 group-hover:to-teal-400/10 transition-all duration-700" />
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                      <span className="text-2xl">📈</span>
                    </div>
                    <div className="text-emerald-300 text-xs font-bold bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                      INCOME
                    </div>
                  </div>
                  <h3 className="text-emerald-200 text-sm font-semibold mb-2 uppercase tracking-wider">Ingresos</h3>
                  <p className="text-white text-4xl font-black mb-3 tracking-tight">
                    ${financialSummary?.totalIncome?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                  <p className="text-emerald-300/80 text-sm font-medium">Flujo de caja positivo</p>
                  <div className="mt-4 h-2 bg-emerald-950/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: '100%', opacity: 1 }}
                      transition={{ delay: 1.1, duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 rounded-full shadow-lg"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                className="relative overflow-hidden bg-gradient-to-br from-rose-950/90 via-red-900/70 to-pink-900/50 p-8 rounded-3xl border border-rose-400/20 backdrop-blur-xl shadow-2xl group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400/5 via-transparent to-pink-400/5 group-hover:from-rose-400/10 group-hover:to-pink-400/10 transition-all duration-700" />
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-rose-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                      <span className="text-2xl">📉</span>
                    </div>
                    <div className="text-rose-300 text-xs font-bold bg-rose-400/10 px-3 py-1.5 rounded-full border border-rose-400/20">
                      EXPENSES
                    </div>
                  </div>
                  <h3 className="text-rose-200 text-sm font-semibold mb-2 uppercase tracking-wider">Gastos</h3>
                  <p className="text-white text-4xl font-black mb-3 tracking-tight">
                    ${financialSummary?.totalExpense?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                  <p className="text-rose-300/80 text-sm font-medium">Inversión operativa</p>
                  <div className="mt-4 h-2 bg-rose-950/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: '100%', opacity: 1 }}
                      transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-rose-400 via-pink-400 to-rose-300 rounded-full shadow-lg"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                className="relative overflow-hidden bg-gradient-to-br from-violet-950/90 via-purple-900/70 to-indigo-900/50 p-8 rounded-3xl border border-violet-400/20 backdrop-blur-xl shadow-2xl group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-400/5 via-transparent to-indigo-400/5 group-hover:from-violet-400/10 group-hover:to-indigo-400/10 transition-all duration-700" />
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-violet-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div className="text-violet-300 text-xs font-bold bg-violet-400/10 px-3 py-1.5 rounded-full border border-violet-400/20">
                      CLIENTS
                    </div>
                  </div>
                  <h3 className="text-violet-200 text-sm font-semibold mb-2 uppercase tracking-wider">Clientes</h3>
                  <p className="text-white text-4xl font-black mb-3 tracking-tight">
                    {stats?.clients?.totalClients || 0}
                  </p>
                  <p className="text-violet-300/80 text-sm font-medium">Base de usuarios activa</p>
                  <div className="mt-4 h-2 bg-violet-950/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: '100%', opacity: 1 }}
                      transition={{ delay: 1.3, duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-300 rounded-full shadow-lg"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                className="relative overflow-hidden bg-gradient-to-br from-amber-950/90 via-yellow-900/70 to-orange-900/50 p-8 rounded-3xl border border-amber-400/20 backdrop-blur-xl shadow-2xl group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-orange-400/5 group-hover:from-amber-400/10 group-hover:to-orange-400/10 transition-all duration-700" />
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                      <span className="text-2xl">💱</span>
                    </div>
                    <div className="text-amber-300 text-xs font-bold bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
                      USD/LOCAL
                    </div>
                  </div>
                  <h3 className="text-amber-200 text-sm font-semibold mb-2 uppercase tracking-wider">Tasa Cambio</h3>
                  <p className="text-white text-4xl font-black mb-3 tracking-tight">
                    ${financialSummary?.exchangeRate?.rate?.toFixed(2) || 'N/A'}
                  </p>
                  <p className="text-amber-300/80 text-sm font-medium">
                    {financialSummary?.exchangeRate?.lastUpdated 
                      ? `Actualizado ${new Date(financialSummary.exchangeRate.lastUpdated).toLocaleDateString('es-ES')}`
                      : 'Pendiente actualización'
                    }
                  </p>
                  <div className="mt-4 h-2 bg-amber-950/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: '100%', opacity: 1 }}
                      transition={{ delay: 1.4, duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 rounded-full shadow-lg"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Gráficos Ultra Modernos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <motion.div 
                initial={{ opacity: 0, x: -40, rotateY: -20 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ delay: 0.8, duration: 1, type: "spring" }}
                whileHover={{ scale: 1.02, rotateY: 2 }}
                className="relative overflow-hidden bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-slate-800/60 p-8 rounded-3xl border border-slate-600/30 backdrop-blur-2xl shadow-2xl group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-1000" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform duration-500">
                      <span className="text-white text-xl font-bold">📊</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Balance Financiero</h3>
                      <p className="text-slate-400 text-sm font-medium">Análisis de flujo de caja</p>
                    </div>
                  </div>
                  <div className="h-72 relative cursor-pointer group/chart" onClick={() => setShowBalanceModal(true)}>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent rounded-2xl group-hover/chart:from-blue-900/30 transition-all duration-300" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover/chart:opacity-100 transition-opacity duration-300">
                      <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded-full border border-slate-600/50">📊 Ver detalles</span>
                    </div>
                    <Bar data={balanceData} options={balanceOptions} />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 40, rotateY: 20 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ delay: 0.9, duration: 1, type: "spring" }}
                whileHover={{ scale: 1.02, rotateY: -2 }}
                className="relative overflow-hidden bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-slate-800/60 p-8 rounded-3xl border border-slate-600/30 backdrop-blur-2xl shadow-2xl group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-600/5 via-transparent to-pink-600/5 group-hover:from-rose-600/10 group-hover:to-pink-600/10 transition-all duration-1000" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform duration-500">
                      <span className="text-white text-xl font-bold">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Distribución de Gastos</h3>
                      <p className="text-slate-400 text-sm font-medium">Análisis por categorías</p>
                    </div>
                  </div>
                  {expenseCategoryLabels.length > 0 ? (
                    <div className="h-72 relative cursor-pointer group/chart" onClick={() => setShowExpenseModal(true)}>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent rounded-2xl group-hover/chart:from-rose-900/30 transition-all duration-300" />
                      <div className="absolute top-2 right-2 opacity-0 group-hover/chart:opacity-100 transition-opacity duration-300">
                        <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded-full border border-slate-600/50">🎯 Ver detalles</span>
                      </div>
                      <Doughnut data={expenseCategoryChartData} options={categoryOptions} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-72">
                      <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mb-6">
                        <span className="text-4xl">📊</span>
                      </div>
                      <p className="text-slate-400 text-center font-medium">No hay datos de gastos disponibles</p>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -40, rotateY: -20 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ delay: 1, duration: 1, type: "spring" }}
                whileHover={{ scale: 1.02, rotateY: 2 }}
                className="relative overflow-hidden bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-slate-800/60 p-8 rounded-3xl border border-slate-600/30 backdrop-blur-2xl shadow-2xl group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-indigo-600/5 group-hover:from-purple-600/10 group-hover:to-indigo-600/10 transition-all duration-1000" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform duration-500">
                      <span className="text-white text-xl font-bold">🏆</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Productos Estrella</h3>
                      <p className="text-slate-400 text-sm font-medium">Top ventas por cantidad</p>
                    </div>
                  </div>
                  {topProductsLabels.length > 0 ? (
                    <div className="h-72 relative cursor-pointer group/chart" onClick={() => setShowProductsModal(true)}>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent rounded-2xl group-hover/chart:from-purple-900/30 transition-all duration-300" />
                      <div className="absolute top-2 right-2 opacity-0 group-hover/chart:opacity-100 transition-opacity duration-300">
                        <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded-full border border-slate-600/50">🏆 Ver detalles</span>
                      </div>
                      <Bar data={topProductsChartData} options={topProductsOptions} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-72">
                      <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mb-6">
                        <span className="text-4xl">📦</span>
                      </div>
                      <p className="text-slate-400 text-center font-medium">No hay datos de productos disponibles</p>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 40, rotateY: 20 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ delay: 1.1, duration: 1, type: "spring" }}
                whileHover={{ scale: 1.02, rotateY: -2 }}
                className="relative overflow-hidden bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-slate-800/60 p-8 rounded-3xl border border-slate-600/30 backdrop-blur-2xl shadow-2xl group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 via-transparent to-amber-600/5 group-hover:from-orange-600/10 group-hover:to-amber-600/10 transition-all duration-1000" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform duration-500">
                      <span className="text-white text-xl font-bold">💳</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Métodos de Pago</h3>
                      <p className="text-slate-400 text-sm font-medium">Preferencias de clientes</p>
                    </div>
                  </div>
                  {paymentMethodLabels.length > 0 ? (
                    <div className="h-72 relative cursor-pointer group/chart" onClick={() => setShowPaymentModal(true)}>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent rounded-2xl group-hover/chart:from-orange-900/30 transition-all duration-300" />
                      <div className="absolute top-2 right-2 opacity-0 group-hover/chart:opacity-100 transition-opacity duration-300">
                        <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded-full border border-slate-600/50">💳 Ver detalles</span>
                      </div>
                      <Pie data={paymentMethodChartData} options={paymentMethodOptions} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-72">
                      <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mb-6">
                        <span className="text-4xl">💳</span>
                      </div>
                      <p className="text-slate-400 text-center font-medium">No hay datos de pagos disponibles</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Panel de Inventario Ultra Moderno */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.2, duration: 1, type: "spring" }}
              whileHover={{ scale: 1.01, y: -4 }}
              className="relative overflow-hidden bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-slate-800/60 p-10 rounded-3xl border border-slate-600/30 backdrop-blur-2xl shadow-2xl group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-cyan-600/5 group-hover:from-indigo-600/10 group-hover:to-cyan-600/10 transition-all duration-1000" />
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-indigo-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-cyan-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform duration-700">
                    <span className="text-white text-2xl font-bold">📦</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white mb-2">Control de Inventario</h3>
                    <p className="text-slate-400 text-lg font-medium">Monitoreo en tiempo real del stock</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotateY: 5 }}
                    className="relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-slate-600/40 p-8 rounded-2xl backdrop-blur-sm group/card"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent group-hover/card:from-blue-600/10 transition-all duration-500" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-300 text-lg font-semibold">Total Productos</span>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <span className="text-xl">📊</span>
                        </div>
                      </div>
                      <p className="text-5xl font-black text-white mb-2">{stats?.products?.totalProducts || 0}</p>
                      <p className="text-blue-300 text-sm font-medium">Productos registrados</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05, rotateY: -5 }}
                    className="relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-slate-600/40 p-8 rounded-2xl backdrop-blur-sm group/card"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-500 ${
                      (stats?.products?.lowStockProducts || 0) > 0 
                        ? 'from-red-600/5 to-transparent group-hover/card:from-red-600/10' 
                        : 'from-green-600/5 to-transparent group-hover/card:from-green-600/10'
                    }`} />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-300 text-lg font-semibold">Stock Crítico</span>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          (stats?.products?.lowStockProducts || 0) > 0 
                            ? 'bg-gradient-to-br from-red-500 to-rose-500' 
                            : 'bg-gradient-to-br from-green-500 to-emerald-500'
                        }`}>
                          <span className="text-xl">{(stats?.products?.lowStockProducts || 0) > 0 ? '⚠️' : '✅'}</span>
                        </div>
                      </div>
                      <p className={`text-5xl font-black mb-2 ${
                        (stats?.products?.lowStockProducts || 0) > 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {stats?.products?.lowStockProducts || 0}
                      </p>
                      <p className={`text-sm font-medium ${
                        (stats?.products?.lowStockProducts || 0) > 0 ? 'text-red-300' : 'text-green-300'
                      }`}>
                        {(stats?.products?.lowStockProducts || 0) > 0 ? 'Requiere reposición' : 'Stock saludable'}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Modales Elegantes */}
        <AnimatePresence>
          {/* Modal Balance Financiero */}
          {showBalanceModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowBalanceModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-gradient-to-br from-slate-900/95 to-slate-800/90 p-8 rounded-3xl border border-slate-600/30 backdrop-blur-xl shadow-2xl max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Análisis Financiero Detallado</h3>
                </div>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                    <p className="text-green-400 text-sm font-medium mb-1">Ingresos</p>
                    <p className="text-white text-2xl font-bold">${financialSummary?.totalIncome?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                    <p className="text-red-400 text-sm font-medium mb-1">Gastos</p>
                    <p className="text-white text-2xl font-bold">${financialSummary?.totalExpense?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                    <p className="text-blue-400 text-sm font-medium mb-1">Balance</p>
                    <p className={`text-2xl font-bold ${(financialSummary?.netBalance || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${financialSummary?.netBalance?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Cerrar
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Modal Gastos por Categoría */}
          {showExpenseModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowExpenseModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-gradient-to-br from-slate-900/95 to-slate-800/90 p-8 rounded-3xl border border-slate-600/30 backdrop-blur-xl shadow-2xl max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Desglose de Gastos</h3>
                </div>
                <div className="space-y-3 mb-6">
                  {Object.entries(financialSummary?.expenseByCategory || {}).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                      <span className="text-slate-300 font-medium">{category}</span>
                      <span className="text-white font-bold">${amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-medium rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all"
                >
                  Cerrar
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Modal Top Productos */}
          {showProductsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowProductsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-gradient-to-br from-slate-900/95 to-slate-800/90 p-8 rounded-3xl border border-slate-600/30 backdrop-blur-xl shadow-2xl max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">🏆</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Productos Más Vendidos</h3>
                </div>
                <div className="space-y-3 mb-6">
                  {stats?.products?.topSellingProducts?.map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </span>
                        <span className="text-slate-300 font-medium">{product.productName}</span>
                      </div>
                      <span className="text-white font-bold">{product.totalQuantitySold} vendidos</span>
                    </div>
                  )) || <p className="text-slate-400 text-center py-4">No hay datos disponibles</p>}
                </div>
                <button
                  onClick={() => setShowProductsModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  Cerrar
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Modal Métodos de Pago */}
          {showPaymentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowPaymentModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-gradient-to-br from-slate-900/95 to-slate-800/90 p-8 rounded-3xl border border-slate-600/30 backdrop-blur-xl shadow-2xl max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">💳</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Análisis de Métodos de Pago</h3>
                </div>
                <div className="space-y-3 mb-6">
                  {stats?.sales?.salesByPaymentMethod?.map((method, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                      <span className="text-slate-300 font-medium capitalize">{method._id}</span>
                      <span className="text-white font-bold">${method.total.toLocaleString()}</span>
                    </div>
                  )) || <p className="text-slate-400 text-center py-4">No hay datos disponibles</p>}
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-medium rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all"
                >
                  Cerrar
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ErrorBoundary>
  );
};

export default StatsPage;