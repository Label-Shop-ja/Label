import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

const FinancialPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
  });
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showModificationDetailsModal, setShowModificationDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedModification, setSelectedModification] = useState(null);
  const [transactionProducts, setTransactionProducts] = useState([]);
  const [modifiedProducts, setModifiedProducts] = useState({});
  const [modificationReason, setModificationReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [hasModifications, setHasModifications] = useState(false);
  const [modifiedTransactions, setModifiedTransactions] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/transactions');
        setTransactions(response.data);
        
        // Cargar transacciones modificadas
        try {
          const modifiedResponse = await axiosInstance.get('/transactions/modified');
          setModifiedTransactions(modifiedResponse.data);
        } catch (modErr) {
          console.log('Endpoint de transacciones modificadas no disponible, usando localStorage');
          
          // Cargar desde localStorage como fallback
          const localModifications = JSON.parse(localStorage.getItem('transactionModifications') || '[]');
          setModifiedTransactions(localModifications);
        }
        
        setError('');
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar transacciones');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Función para verificar si una transacción ha sido modificada
  const isTransactionModified = (transactionId) => {
    return modifiedTransactions.some(mod => mod.transactionId === transactionId);
  };

  // Función para obtener detalles de modificación
  const getModificationDetails = (transactionId) => {
    return modifiedTransactions.find(mod => mod.transactionId === transactionId);
  };

  // Función para recargar todos los datos
  const reloadAllData = async () => {
    try {
      const transactionsRes = await axiosInstance.get('/transactions');
      setTransactions(transactionsRes.data);
      
      // Intentar cargar modificaciones del backend, si no usar localStorage
      try {
        const modifiedRes = await axiosInstance.get('/transactions/modified');
        setModifiedTransactions(modifiedRes.data);
      } catch {
        const localModifications = JSON.parse(localStorage.getItem('transactionModifications') || '[]');
        setModifiedTransactions(localModifications);
      }
      
      console.log('Datos recargados:', {
        transacciones: transactionsRes.data.length,
        modificadas: modifiedTransactions.length
      });
    } catch (err) {
      console.error('Error al recargar datos:', err);
    }
  };

  // Opciones predefinidas para razones de modificación
  const modificationReasons = [
    'Producto defectuoso',
    'Cliente insatisfecho',
    'Error en la venta',
    'Devolución parcial',
    'Ajuste de inventario',
    'Otro'
  ];

  // Función para ajustar cantidad de producto
  const adjustProductQuantity = (productId, change) => {
    const product = transactionProducts.find(p => p._id === productId);
    if (!product) return;

    const currentModified = modifiedProducts[productId] ?? product.quantity;
    const originalQuantity = product.originalQuantity || product.quantity;
    const newQuantity = Math.max(0, Math.min(originalQuantity, currentModified + change));
    
    if (newQuantity !== originalQuantity) {
      setModifiedProducts(prev => ({ ...prev, [productId]: newQuantity }));
      setHasModifications(true);
    } else {
      setModifiedProducts(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
      setHasModifications(Object.keys(modifiedProducts).filter(id => id !== productId).length > 0);
    }
  };

  // Función para guardar modificaciones
  const saveProductModifications = async () => {
    if (!hasModifications || !modificationReason) {
      setError('Debe seleccionar una razón para las modificaciones');
      return;
    }

    if (modificationReason === 'Otro' && !customReason.trim()) {
      setError('Debe especificar la razón personalizada');
      return;
    }

    try {
      setIsUpdating(true);
      const finalReason = modificationReason === 'Otro' ? customReason : modificationReason;
      
      // Calcular productos modificados con detalles
      const modificationsDetail = Object.entries(modifiedProducts).map(([productId, newQuantity]) => {
        const product = transactionProducts.find(p => p._id === productId);
        return {
          productId,
          productName: product?.name || 'Producto',
          originalQuantity: product?.originalQuantity || product?.quantity || 0,
          newQuantity,
          quantityDifference: newQuantity - (product?.originalQuantity || product?.quantity || 0)
        };
      });
      
      // Guardar modificación en el backend
      const modificationData = {
        transactionId: selectedTransaction._id,
        originalTransaction: selectedTransaction,
        modifiedProducts: modificationsDetail,
        reason: finalReason,
        modifiedAt: new Date().toISOString(),
        modifiedBy: 'Usuario' // Aquí podrías usar el usuario actual
      };
      
      console.log('Enviando datos de modificación:', modificationData);
      
      try {
        await axiosInstance.post('/transactions/modify', modificationData);
        console.log('Modificación guardada exitosamente');
      } catch (backendError) {
        console.error('Error del backend:', backendError.response?.status, backendError.response?.data);
        
        // Si el endpoint no existe (404), usar solución temporal
        if (backendError.response?.status === 404) {
          console.log('Endpoint no existe, usando solución temporal...');
          
          // Guardar en localStorage como fallback temporal
          const existingModifications = JSON.parse(localStorage.getItem('transactionModifications') || '[]');
          const newModification = {
            ...modificationData,
            _id: Date.now().toString() // ID temporal
          };
          existingModifications.push(newModification);
          localStorage.setItem('transactionModifications', JSON.stringify(existingModifications));
          
          // Actualizar estado local
          setModifiedTransactions(prev => [...prev, newModification]);
          
          console.log('Modificación guardada temporalmente en localStorage');
        } else {
          throw backendError; // Re-lanzar otros errores
        }
      }
      
      // Recargar transacciones principales
      const transactionsRes = await axiosInstance.get('/transactions');
      setTransactions(transactionsRes.data);
      
      // Las modificaciones ya se actualizaron arriba, no necesitamos recargar
      
      // Resetear estados
      setModifiedProducts({});
      setModificationReason('');
      setCustomReason('');
      setHasModifications(false);
      setShowProductsModal(false);
      
      // Mostrar notificación de éxito
      setError('');
      
      // Crear mensaje detallado de éxito
      const modifiedCount = Object.keys(modifiedProducts).length;
      const successMsg = `✅ Transacción modificada exitosamente. ${modifiedCount} producto(s) actualizado(s).`;
      
      // Mostrar notificación temporal de éxito
      const tempDiv = document.createElement('div');
      tempDiv.className = 'fixed top-4 right-4 z-[100] bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl border border-green-500 animate-pulse';
      tempDiv.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-2xl">✅</span>
          <div>
            <p class="font-bold">Modificación Guardada</p>
            <p class="text-sm opacity-90">${modifiedCount} producto(s) actualizado(s)</p>
            <p class="text-xs opacity-75">Razón: ${finalReason}</p>
          </div>
        </div>
      `;
      document.body.appendChild(tempDiv);
      
      // Remover notificación después de 4 segundos
      setTimeout(() => {
        if (document.body.contains(tempDiv)) {
          tempDiv.remove();
        }
      }, 4000);
      
    } catch (err) {
      console.error('Error al guardar modificaciones:', err);
      setError(err.response?.data?.message || 'Error al guardar las modificaciones');
      
      // Mostrar notificación de error
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 z-[100] bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl border border-red-500';
      errorDiv.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-2xl">❌</span>
          <div>
            <p class="font-bold">Error al Guardar</p>
            <p class="text-sm opacity-90">No se pudieron guardar las modificaciones</p>
          </div>
        </div>
      `;
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          errorDiv.remove();
        }
      }, 4000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      // Modo calculadora para el monto
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue === '') {
        setNewTransaction(prev => ({ ...prev, amount: '' }));
        return;
      }
      
      const cents = parseInt(numericValue);
      const dollars = cents / 100;
      
      setNewTransaction(prev => ({
        ...prev,
        amount: dollars
      }));
    } else {
      setNewTransaction(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/transactions', newTransaction);
      setTransactions(prev => [response.data, ...prev]);
      setNewTransaction({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
      });
      setShowAddForm(false);
    } catch (err) {
      setError('Error al añadir transacción');
    }
  };

  // Ver detalles de transacción
  const handleViewTransactionDetails = async (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
    
    // Si es una venta, buscar la venta del POS correspondiente
    if (transaction.category === 'Ventas') {
      console.log('Buscando venta del POS para transacción:', transaction);
      
      try {
        // Buscar todas las ventas del POS
        const salesResponse = await axiosInstance.get('/sales');
        console.log('Todas las ventas del POS:', salesResponse.data);
        
        // Buscar la venta que coincida con esta transacción
        // Puede coincidir por fecha, monto, o referencia
        const matchingSale = salesResponse.data.find(sale => {
          const saleDate = new Date(sale.createdAt).toDateString();
          const transactionDate = new Date(transaction.createdAt).toDateString();
          const amountMatch = Math.abs(sale.totalAmount - transaction.amount) < 0.01;
          
          console.log('Comparando venta:', {
            saleId: sale._id,
            saleAmount: sale.totalAmount,
            saleDate,
            transactionAmount: transaction.amount,
            transactionDate,
            amountMatch
          });
          
          return amountMatch && saleDate === transactionDate;
        });
        
        if (matchingSale) {
          console.log('Venta del POS encontrada:', matchingSale);
          
          // Extraer productos con información completa
          const products = matchingSale.productsSold.map(item => ({
            _id: item.product._id || item.product,
            name: item.product.name || 'Producto',
            quantity: item.quantity,
            priceAtSale: item.priceAtSale || item.price || 0,
            variantId: item.variantId,
            originalQuantity: item.quantity // Para controlar límites
          }));
          
          console.log('Productos procesados:', products);
          setTransactionProducts(products);
        } else {
          console.warn('No se encontró venta del POS correspondiente');
          setTransactionProducts([]);
        }
        
      } catch (err) {
        console.error('Error al buscar ventas del POS:', err);
        setTransactionProducts([]);
        setError('Error al cargar los productos de la venta');
      }
    } else {
      setTransactionProducts([]);
    }
  };

  // Abrir modal de gestión de productos
  const handleManageProducts = async () => {
    console.log('Abriendo modal de gestión de productos');
    setShowProductsModal(true);
    
    // Si no hay productos cargados, recargar usando la misma lógica
    if (transactionProducts.length === 0 && selectedTransaction) {
      await handleViewTransactionDetails(selectedTransaction);
    }
  };

  // Ver detalles de modificación
  const handleViewModificationDetails = (modification) => {
    setSelectedModification(modification);
    setShowModificationDetailsModal(true);
  };

  // Navegar a modificación desde badge
  const handleNavigateToModification = (transactionId) => {
    const modification = modifiedTransactions.find(mod => mod.transactionId === transactionId);
    if (modification) {
      setShowTransactionModal(false);
      handleViewModificationDetails(modification);
    }
  };

  // Cerrar modales
  const closeModals = () => {
    setShowTransactionModal(false);
    setShowProductsModal(false);
    setShowModificationDetailsModal(false);
    setSelectedTransaction(null);
    setSelectedModification(null);
    setTransactionProducts([]);
    setModifiedProducts({});
    setModificationReason('');
    setCustomReason('');
    setHasModifications(false);
  };

  // Remover producto de la transacción
  const handleRemoveProduct = async (productId) => {
    try {
      await axiosInstance.delete(`/sales/product/${selectedTransaction._id}/${productId}`);
      setTransactionProducts(prev => prev.filter(p => p._id !== productId));
      
      // Recargar transacciones
      const transactionsRes = await axiosInstance.get('/transactions');
      setTransactions(transactionsRes.data);
    } catch (err) {
      console.error('Error al remover producto:', err);
      setError('Error al remover producto de la transacción');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl text-action-blue">Cargando...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-5xl font-extrabold bg-gradient-to-r from-copper-rose-accent to-rose-400 bg-clip-text text-transparent flex items-center gap-4">
          💰 Gestión Financiera
        </h2>
        <div className="text-right">
          <p className="text-neutral-gray-300 text-sm">Dashboard Financiero</p>
          <p className="text-action-blue font-semibold">{new Date().toLocaleDateString('es-ES')}</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="p-4 bg-gradient-to-r from-red-900/40 to-red-800/30 border border-red-500/50 text-red-300 rounded-xl backdrop-blur-sm shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-xl">⚠️</span>
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resumen Financiero Espectacular */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative overflow-hidden bg-gradient-to-br from-green-900/60 to-green-800/30 p-6 rounded-xl border border-green-500/40 backdrop-blur-sm shadow-2xl group"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">📈</span>
              <div className="text-green-400 text-sm font-bold bg-green-400/20 px-3 py-1 rounded-full">
                +{((totalIncome / (totalIncome + totalExpense)) * 100 || 0).toFixed(1)}%
              </div>
            </div>
            <p className="text-green-400 text-lg font-bold mb-1">Ingresos Totales</p>
            <p className="text-white text-3xl font-extrabold tracking-tight">
              ${totalIncome.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-3 h-1.5 bg-green-900/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.8, duration: 1 }}
                className="h-full bg-gradient-to-r from-green-400 to-green-300 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative overflow-hidden bg-gradient-to-br from-red-900/60 to-red-800/30 p-6 rounded-xl border border-red-500/40 backdrop-blur-sm shadow-2xl group"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-400/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">📉</span>
              <div className="text-red-400 text-sm font-bold bg-red-400/20 px-3 py-1 rounded-full">
                -{((totalExpense / (totalIncome + totalExpense)) * 100 || 0).toFixed(1)}%
              </div>
            </div>
            <p className="text-red-400 text-lg font-bold mb-1">Gastos Totales</p>
            <p className="text-white text-3xl font-extrabold tracking-tight">
              ${totalExpense.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-3 h-1.5 bg-red-900/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.9, duration: 1 }}
                className="h-full bg-gradient-to-r from-red-400 to-red-300 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className={`relative overflow-hidden bg-gradient-to-br ${netBalance >= 0 ? 'from-blue-900/60 to-blue-800/30 border-blue-500/40' : 'from-orange-900/60 to-orange-800/30 border-orange-500/40'} p-6 rounded-xl border backdrop-blur-sm shadow-2xl group`}
        >
          <div className={`absolute top-0 right-0 w-20 h-20 ${netBalance >= 0 ? 'bg-blue-400/10' : 'bg-orange-400/10'} rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500`} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{netBalance >= 0 ? '💎' : '⚖️'}</span>
              <div className={`text-sm font-bold px-3 py-1 rounded-full ${netBalance >= 0 ? 'text-blue-400 bg-blue-400/20' : 'text-orange-400 bg-orange-400/20'}`}>
                {netBalance >= 0 ? 'Positivo' : 'Negativo'}
              </div>
            </div>
            <p className={`text-lg font-bold mb-1 ${netBalance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>Balance Neto</p>
            <p className={`text-3xl font-extrabold tracking-tight ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${netBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.abs(netBalance) / Math.max(totalIncome, totalExpense, 1) * 100}%` }}
                transition={{ delay: 1, duration: 1 }}
                className={`h-full rounded-full ${netBalance >= 0 ? 'bg-gradient-to-r from-blue-400 to-green-400' : 'bg-gradient-to-r from-orange-400 to-red-400'}`}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Botón Agregar Transacción */}
      <motion.div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="relative overflow-hidden flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-500 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          <span className="relative text-sm">{showAddForm ? '✕' : '+'}</span>
          <span className="relative text-sm">{showAddForm ? 'Cancelar' : 'Nueva Transacción'}</span>
        </motion.button>
      </motion.div>

      {/* Formulario Espectacular */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-gradient-to-br from-deep-night-blue/80 to-deep-night-blue/60 p-8 rounded-2xl border border-neutral-gray-200/20 backdrop-blur-lg shadow-2xl"
          >
            <motion.h3 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white mb-8 flex items-center gap-3"
            >
              <span className="text-4xl">✨</span>
              Añadir Nueva Transacción
            </motion.h3>
            <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-neutral-light text-sm font-bold mb-2">📝 Descripción</label>
                <input
                  type="text"
                  name="description"
                  value={newTransaction.description}
                  onChange={handleInputChange}
                  placeholder="Ej: Venta de producto, Compra de materiales..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-neutral-light text-sm font-bold mb-2">💰 Monto</label>
                <div className="relative">
                  <input
                    type="text"
                    name="amount"
                    value={newTransaction.amount === '' ? '' : newTransaction.amount.toFixed(2)}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-right font-mono text-lg"
                    required
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm">
                    $
                  </div>
                  <div className="absolute right-3 bottom-1 text-xs text-slate-400 dark:text-slate-500">
                    Escribe sin punto decimal
                  </div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-neutral-light text-sm font-bold mb-2">🏷️ Tipo</label>
                <select
                  name="type"
                  value={newTransaction.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="expense">💸 Gasto</option>
                  <option value="income">💰 Ingreso</option>
                </select>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-neutral-light text-sm font-bold mb-2">📁 Categoría</label>
                <input
                  type="text"
                  name="category"
                  value={newTransaction.category}
                  onChange={handleInputChange}
                  placeholder="Ej: Ventas, Gastos operativos, Marketing..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="md:col-span-2 flex gap-4 justify-end"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-neutral-gray-200/20 hover:bg-neutral-gray-200/30 text-neutral-light font-semibold rounded-xl transition-all duration-300"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(220, 38, 127, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden px-8 py-3 bg-gradient-to-r from-copper-rose-accent to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center gap-2">
                    <span>✨</span>
                    Guardar Transacción
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historial de Transacciones */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-12"
      >
        {/* Transacciones Completadas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">💰</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Transacciones</h3>
                <p className="text-neutral-gray-400 text-xs">{transactions.length} registros</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-neutral-gray-300 text-xs">Historial Completo</p>
            </div>
          </div>
          
          {transactions.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/50 rounded-xl p-8 text-center backdrop-blur-sm">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-neutral-gray-400 text-sm font-medium">Sin transacciones registradas</p>
              <p className="text-neutral-gray-500 text-xs mt-1">Las transacciones aparecerán aquí</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm shadow-2xl">
              <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 px-4 py-3 border-b border-slate-600/30">
                <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                  <span>Descripción</span>
                  <span>Monto</span>
                </div>
              </div>
              <div className="divide-y divide-slate-700/20">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`group relative flex items-center justify-between py-3.5 px-4 hover:bg-slate-700/30 transition-all duration-200 cursor-pointer border-l-2 ${
                      transaction.type === 'income' 
                        ? 'border-l-green-400 hover:border-l-green-300' 
                        : 'border-l-red-400 hover:border-l-red-300'
                    } ${
                      index % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-900/10'
                    }`}
                    onClick={() => handleViewTransactionDetails(transaction)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="flex items-center gap-4 flex-1 relative z-10">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                        transaction.type === 'income' 
                          ? 'bg-gradient-to-br from-green-500 to-green-600' 
                          : 'bg-gradient-to-br from-red-500 to-red-600'
                      }`}>
                        <span className="text-white text-sm font-bold">
                          {transaction.type === 'income' ? '↗' : '↙'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-medium truncate">
                            {transaction.description}
                          </span>
                          {isTransactionModified(transaction._id) && (
                            <div className="w-2 h-2 bg-orange-400 rounded-full shadow-lg animate-pulse" />
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-neutral-gray-400 text-xs bg-slate-700/50 px-2 py-0.5 rounded-full">
                            {transaction.category}
                          </span>
                          <span className="text-neutral-gray-500 text-xs">
                            {new Date(transaction.createdAt).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right relative z-10">
                      <p className={`text-sm font-bold mb-1 ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-neutral-gray-500 text-xs">
                        {new Date(transaction.createdAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Transacciones Modificadas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">✏️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Modificaciones</h3>
                <p className="text-neutral-gray-400 text-xs">{modifiedTransactions.length} cambios</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isUpdating && (
                <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              )}
              <p className="text-neutral-gray-300 text-xs">Historial de Cambios</p>
            </div>
          </div>
          
          {modifiedTransactions.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/50 rounded-xl p-8 text-center backdrop-blur-sm">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-neutral-gray-400 text-sm font-medium">Sin modificaciones registradas</p>
              <p className="text-neutral-gray-500 text-xs mt-1">Los cambios aparecerán aquí</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm shadow-2xl">
              <div className="bg-gradient-to-r from-orange-700/30 to-orange-800/30 px-4 py-3 border-b border-orange-600/20">
                <div className="flex items-center justify-between text-xs font-medium text-orange-200">
                  <span>Transacción Modificada</span>
                  <span>Fecha</span>
                </div>
              </div>
              <div className="divide-y divide-slate-700/20">
                {modifiedTransactions.map((modification, index) => (
                  <motion.div
                    key={modification._id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`group relative flex items-center justify-between py-3.5 px-4 hover:bg-orange-700/20 transition-all duration-200 cursor-pointer border-l-2 border-l-orange-400 hover:border-l-orange-300 ${
                      index % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-900/10'
                    }`}
                    onClick={() => handleViewModificationDetails(modification)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="flex items-center gap-4 flex-1 relative z-10">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">⚡</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-medium truncate">
                            {modification.originalTransaction?.description || 'Transacción'}
                          </span>
                          <div className="w-2 h-2 bg-orange-400 rounded-full shadow-lg" />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-orange-400 text-xs bg-orange-900/30 px-2 py-0.5 rounded-full border border-orange-700/50">
                            {modification.reason}
                          </span>
                          <span className="text-neutral-gray-500 text-xs">
                            {modification.modifiedProducts?.length || 0} items
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right relative z-10">
                      <p className="text-white text-sm font-medium mb-1">
                        {new Date(modification.modifiedAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </p>
                      <p className="text-neutral-gray-500 text-xs">
                        {new Date(modification.modifiedAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal de Detalles de Transacción */}
      <AnimatePresence>
        {showTransactionModal && selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-700/50 max-w-lg w-full backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  selectedTransaction.type === 'income' 
                    ? 'bg-gradient-to-br from-green-500 to-green-600' 
                    : 'bg-gradient-to-br from-red-500 to-red-600'
                }`}>
                  <span className="text-white text-xl font-bold">
                    {selectedTransaction.type === 'income' ? '↗' : '↙'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-white">Detalles de Transacción</h3>
                    {isTransactionModified(selectedTransaction._id) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToModification(selectedTransaction._id);
                        }}
                        className="bg-orange-900/40 text-orange-400 text-sm px-3 py-1 rounded-full border border-orange-700/50 font-medium hover:bg-orange-900/60 transition-colors cursor-pointer"
                      >
                        ✏️ Ver Modificación
                      </button>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm">Información completa</p>
                  {isTransactionModified(selectedTransaction._id) && (
                    <p className="text-orange-400 text-xs mt-1">
                      Modificada el {new Date(getModificationDetails(selectedTransaction._id)?.modifiedAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="bg-slate-700/30 border border-slate-600/30 p-4 rounded-lg backdrop-blur-sm">
                  <p className="text-slate-400 text-sm font-medium mb-1">Descripción</p>
                  <p className="text-white font-semibold">{selectedTransaction.description}</p>
                </div>
                <div className="bg-slate-700/30 border border-slate-600/30 p-4 rounded-lg backdrop-blur-sm">
                  <p className="text-slate-400 text-sm font-medium mb-1">Monto</p>
                  <p className={`text-2xl font-bold ${
                    selectedTransaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedTransaction.type === 'expense' ? '-' : '+'}${selectedTransaction.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 border border-slate-600/30 p-4 rounded-lg backdrop-blur-sm">
                    <p className="text-slate-400 text-sm font-medium mb-1">Categoría</p>
                    <p className="text-white font-semibold">{selectedTransaction.category}</p>
                  </div>
                  <div className="bg-slate-700/30 border border-slate-600/30 p-4 rounded-lg backdrop-blur-sm">
                    <p className="text-slate-400 text-sm font-medium mb-1">Fecha</p>
                    <p className="text-white font-semibold text-sm">{new Date(selectedTransaction.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}</p>
                    <p className="text-slate-400 text-xs">{new Date(selectedTransaction.createdAt).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModals}
                  className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 font-medium rounded-lg transition-all duration-200"
                >
                  Cerrar
                </button>
                {selectedTransaction.category === 'Ventas' && (
                  <button
                    onClick={handleManageProducts}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Gestionar Artículos
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Gestión de Productos */}
      <AnimatePresence>
        {showProductsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={() => setShowProductsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-700/50 max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">📦</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Gestionar Artículos</h3>
                  <p className="text-slate-400 text-sm">Productos de la transacción</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {transactionProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📦</span>
                    </div>
                    <p className="text-slate-300 text-lg font-medium">No se encontraron productos</p>
                    <p className="text-slate-400 text-sm mt-1">Esta transacción no tiene productos asociados</p>
                    {selectedTransaction && (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs">
                          <p className="text-slate-400 mb-2">Debug - Estructura de transacción:</p>
                          <pre className="text-slate-300 overflow-auto max-h-32">
                            {JSON.stringify(selectedTransaction, null, 2)}
                          </pre>
                        </div>
                        <div className="p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg text-xs">
                          <p className="text-blue-400 mb-2">Debug - Productos cargados:</p>
                          <pre className="text-blue-300 overflow-auto max-h-32">
                            {JSON.stringify(transactionProducts, null, 2)}
                          </pre>
                        </div>
                        <button
                          onClick={async () => {
                            console.log('=== PRUEBA MANUAL DE CARGA ===');
                            console.log('Transacción seleccionada:', selectedTransaction);
                            try {
                              const testResponse = await axiosInstance.get('/sales');
                              console.log('Todas las ventas:', testResponse.data);
                              
                              const matchingSale = Array.isArray(testResponse.data) 
                                ? testResponse.data.find(sale => 
                                    sale.transactionId === selectedTransaction._id || 
                                    sale._id === selectedTransaction._id ||
                                    sale.transaction === selectedTransaction._id
                                  )
                                : null;
                              console.log('Venta coincidente encontrada:', matchingSale);
                            } catch (err) {
                              console.error('Error en prueba manual:', err);
                            }
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        >
                          Probar Carga Manual
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      {transactionProducts.map((product, index) => {
                        const currentQuantity = modifiedProducts[product._id] ?? product.quantity;
                        const originalQuantity = product.originalQuantity || product.quantity;
                        const isModified = modifiedProducts[product._id] !== undefined;
                        
                        return (
                          <motion.div
                            key={product._id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group flex items-center justify-between p-5 rounded-xl border transition-all duration-200 backdrop-blur-sm ${
                              isModified 
                                ? 'bg-orange-900/30 border-orange-700/50 shadow-md' 
                                : 'bg-slate-700/30 border-slate-600/30 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-white text-xl">📎</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-semibold text-lg">{product.name}</h4>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-slate-400 text-sm">
                                    Original: <span className="font-medium text-white">{originalQuantity}</span>
                                  </span>
                                  <span className="text-green-400 text-sm font-medium">
                                    ${product.priceAtSale?.toFixed(2) || '0.00'} c/u
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg border border-slate-600/50 p-1">
                                <button
                                  onClick={() => adjustProductQuantity(product._id, -1)}
                                  disabled={currentQuantity <= 0}
                                  className="w-8 h-8 flex items-center justify-center rounded-md bg-red-900/30 hover:bg-red-900/50 text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                  <span className="text-lg font-bold">−</span>
                                </button>
                                <span className={`min-w-[3rem] text-center font-bold ${
                                  isModified ? 'text-orange-400' : 'text-white'
                                }`}>
                                  {currentQuantity}
                                </span>
                                <button
                                  onClick={() => adjustProductQuantity(product._id, 1)}
                                  disabled={currentQuantity >= originalQuantity}
                                  className="w-8 h-8 flex items-center justify-center rounded-md bg-green-900/30 hover:bg-green-900/50 text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                  <span className="text-lg font-bold">+</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    {hasModifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-6 mb-6 backdrop-blur-sm"
                      >
                        <h4 className="text-yellow-200 font-semibold mb-4 flex items-center gap-2">
                          <span>⚠️</span>
                          Razón de la modificación
                        </h4>
                        
                        <div className="space-y-4">
                          <select
                            value={modificationReason}
                            onChange={(e) => setModificationReason(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            style={{
                              colorScheme: 'dark',
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: 'right 0.5rem center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: '1.5em 1.5em',
                              paddingRight: '2.5rem'
                            }}
                          >
                            <option value="" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>Seleccionar razón...</option>
                            {modificationReasons.map(reason => (
                              <option key={reason} value={reason} style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>{reason}</option>
                            ))}
                          </select>
                          
                          {modificationReason === 'Otro' && (
                            <textarea
                              value={customReason}
                              onChange={(e) => setCustomReason(e.target.value)}
                              placeholder="Especifique la razón personalizada..."
                              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              style={{ colorScheme: 'dark' }}
                              rows={3}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowProductsModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 font-medium rounded-lg transition-all duration-200"
                  >
                    Cerrar
                  </button>
                  {hasModifications && (
                    <button
                      onClick={saveProductModifications}
                      disabled={!modificationReason || (modificationReason === 'Otro' && !customReason.trim()) || isUpdating}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Guardando...
                        </>
                      ) : (
                        'Guardar Cambios'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalles de Modificación */}
      <AnimatePresence>
        {showModificationDetailsModal && selectedModification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-700/50 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">⚡</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white">Detalles de Modificación</h3>
                  <p className="text-slate-400 text-sm">Información completa de la transacción modificada</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6">
                {/* Información de la Transacción Original */}
                <div className="bg-slate-700/30 border border-slate-600/30 p-6 rounded-lg backdrop-blur-sm">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-400">📋</span>
                    Transacción Original
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm font-medium mb-1">Descripción</p>
                      <p className="text-white font-semibold">
                        {selectedModification.originalTransaction?.description || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm font-medium mb-1">Monto</p>
                      <p className="text-white font-semibold">
                        ${selectedModification.originalTransaction?.amount?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm font-medium mb-1">Categoría</p>
                      <p className="text-white font-semibold">
                        {selectedModification.originalTransaction?.category || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm font-medium mb-1">Fecha Original</p>
                      <p className="text-white font-semibold">
                        {selectedModification.originalTransaction?.createdAt 
                          ? new Date(selectedModification.originalTransaction.createdAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información de la Modificación */}
                <div className="bg-orange-900/30 border border-orange-700/50 p-6 rounded-lg backdrop-blur-sm">
                  <h4 className="text-lg font-semibold text-orange-200 mb-4 flex items-center gap-2">
                    <span className="text-orange-400">⚠️</span>
                    Detalles de la Modificación
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-orange-300 text-sm font-medium mb-1">Razón</p>
                      <p className="text-orange-100 font-semibold">
                        {selectedModification.reason}
                      </p>
                    </div>
                    <div>
                      <p className="text-orange-300 text-sm font-medium mb-1">Modificado por</p>
                      <p className="text-orange-100 font-semibold">
                        {selectedModification.modifiedBy || 'Usuario'}
                      </p>
                    </div>
                    <div>
                      <p className="text-orange-300 text-sm font-medium mb-1">Fecha de Modificación</p>
                      <p className="text-orange-100 font-semibold">
                        {new Date(selectedModification.modifiedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-orange-300 text-sm font-medium mb-1">ID de Modificación</p>
                      <p className="text-orange-100 font-mono text-sm">
                        {selectedModification._id || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Productos Modificados */}
                {selectedModification.modifiedProducts && selectedModification.modifiedProducts.length > 0 && (
                  <div className="bg-slate-700/30 border border-slate-600/30 p-6 rounded-lg backdrop-blur-sm">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-green-400">📦</span>
                      Productos Modificados ({selectedModification.modifiedProducts.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedModification.modifiedProducts.map((product, index) => (
                        <div key={index} className="bg-slate-800/50 border border-slate-600/50 p-4 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h5 className="text-white font-semibold">
                                {product.productName}
                              </h5>
                              <p className="text-slate-400 text-sm">
                                ID: {product.productId}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <p className="text-slate-400 text-xs font-medium">Original</p>
                                  <p className="text-white font-bold">
                                    {product.originalQuantity}
                                  </p>
                                </div>
                                <div className="text-2xl text-slate-400">→</div>
                                <div className="text-center">
                                  <p className="text-slate-400 text-xs font-medium">Nuevo</p>
                                  <p className="text-green-400 font-bold">
                                    {product.newQuantity}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-slate-400 text-xs font-medium">Diferencia</p>
                                  <p className={`font-bold ${
                                    product.quantityDifference >= 0 
                                      ? 'text-green-400' 
                                      : 'text-red-400'
                                  }`}>
                                    {product.quantityDifference >= 0 ? '+' : ''}{product.quantityDifference}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-700/50">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeModals}
                    className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 font-medium rounded-lg transition-all duration-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FinancialPage;