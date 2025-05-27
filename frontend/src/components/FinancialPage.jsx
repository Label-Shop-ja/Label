// C:\Proyectos\Label\frontend\src\components\FinancialPage.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // Asegúrate de importar tu instancia de Axios

const FinancialPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false); // Estado para mostrar/ocultar el formulario
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense', // Por defecto, el formulario será para un gasto
    category: '',
  });

  // --- Cargar transacciones al montar el componente ---
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/transactions'); // Asume que tu backend tiene /api/transactions
        setTransactions(response.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar transacciones:', err);
        const errorMessage = err.response?.data?.message || 'Error al cargar transacciones';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []); // Se ejecuta solo una vez al montar

  // --- Calcular totales de ingresos y gastos ---
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // --- Manejar cambios en el formulario de nueva transacción ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  // --- Manejar el envío del formulario de nueva transacción ---
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Validar campos requeridos antes de enviar
      if (!newTransaction.description || !newTransaction.amount || !newTransaction.type || !newTransaction.category) {
        setError('Por favor, completa todos los campos requeridos (descripción, monto, tipo, categoría).');
        return;
      }

      const response = await axiosInstance.post('/transactions', newTransaction);
      setTransactions((prev) => [response.data, ...prev]); // Añadir la nueva transacción al principio de la lista
      setNewTransaction({ // Limpiar el formulario y resetear a gasto por defecto
        description: '',
        amount: '',
        type: 'expense',
        category: '',
      });
      setShowAddForm(false); // Ocultar el formulario después de agregar
      setError(''); // Limpiar cualquier error previo
    } catch (err) {
      console.error('Error al añadir transacción:', err);
      const errorMessage = err.response?.data?.message || 'Error al añadir transacción';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl text-action-blue">Cargando transacciones...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-dark-slate-gray rounded-lg shadow-xl min-h-screen">
      <h2 className="text-4xl font-extrabold text-copper-rose-accent mb-8 border-b-2 border-action-blue pb-4">Gestión Financiera</h2>

      {error && (
        <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">¡Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner border border-green-500">
          <p className="text-green-400 text-2xl font-bold">Ingresos Totales</p>
          <p className="text-neutral-light text-3xl font-extrabold mt-2">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner border border-red-500">
          <p className="text-red-400 text-2xl font-bold">Gastos Totales</p>
          <p className="text-neutral-light text-3xl font-extrabold mt-2">${totalExpense.toFixed(2)}</p>
        </div>
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner border border-action-blue-light">
          <p className="text-action-blue-light text-2xl font-bold">Balance Neto</p>
          <p className={`text-3xl font-extrabold mt-2 ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${netBalance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-action-blue hover:bg-blue-700 text-neutral-light font-bold py-3 px-6 rounded-lg text-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {showAddForm ? 'Ocultar Formulario' : 'Añadir Nueva Transacción'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8">
          <h3 className="text-2xl font-semibold text-neutral-light mb-4">Añadir Nueva Transacción</h3>
          <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="description" className="block text-neutral-light text-sm font-bold mb-2">Descripción:</label>
              <input
                type="text"
                id="description"
                name="description"
                value={newTransaction.description}
                onChange={handleInputChange}
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                required
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-neutral-light text-sm font-bold mb-2">Monto:</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={newTransaction.amount}
                onChange={handleInputChange}
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                required
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-neutral-light text-sm font-bold mb-2">Tipo:</label>
              <select
                id="type"
                name="type"
                value={newTransaction.type}
                onChange={handleInputChange}
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                required
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-neutral-light text-sm font-bold mb-2">Categoría:</label>
              <input
                type="text"
                id="category"
                name="category"
                value={newTransaction.category}
                onChange={handleInputChange}
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                required
              />
            </div>
            <div className="md:col-span-2 text-right">
              <button
                type="submit"
                className="bg-copper-rose-accent hover:bg-rose-700 text-neutral-light font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
              >
                Guardar Transacción
              </button>
            </div>
          </form>
        </div>
      )}

      <h3 className="text-3xl font-semibold text-neutral-light mb-6 border-b border-neutral-gray-200 pb-3">Historial de Transacciones</h3>

      {transactions.length === 0 ? (
        <p className="text-neutral-gray-300 text-lg">No hay transacciones registradas. ¡Añade una!</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction._id}
              className={`p-4 rounded-lg shadow-md flex items-center justify-between ${
                transaction.type === 'income' ? 'bg-green-800 bg-opacity-40 border border-green-600' : 'bg-red-800 bg-opacity-40 border border-red-600'
              }`}
            >
              <div>
                <p className="text-xl font-bold text-neutral-light">{transaction.description}</p>
                <p className="text-sm text-neutral-gray-300">{transaction.category} - {new Date(transaction.createdAt).toLocaleDateString()}</p>
              </div>
              <div className={`text-xl font-extrabold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {transaction.type === 'expense' && '-'}${transaction.amount.toFixed(2)}
              </div>
              {/* Botones de Editar y Eliminar (funcionalidad futura) */}
              {/*
              <div className="flex gap-2">
                <button className="bg-neutral-gray-200 text-dark-charcoal px-3 py-1 rounded-lg text-sm font-medium hover:bg-neutral-gray-300 transition duration-200 opacity-50 cursor-not-allowed">
                  Editar
                </button>
                <button className="bg-red-600 text-neutral-light px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-700 transition duration-200 opacity-50 cursor-not-allowed">
                  Eliminar
                </button>
              </div>
              */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinancialPage;