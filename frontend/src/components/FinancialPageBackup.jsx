import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import ErrorBoundary from "./Common/ErrorBoundary";

const FinancialPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/transactions');
        setTransactions(response.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar transacciones:', err);
        setError('Error al cargar transacciones');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <h1 className="text-4xl font-bold text-white mb-8">Centro Financiero</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        <div className="bg-slate-800/50 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Transacciones</h2>
          {transactions.length === 0 ? (
            <p className="text-slate-400">No hay transacciones</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="text-white font-semibold">{transaction.description}</h3>
                  <p className="text-slate-400">${transaction.amount}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default FinancialPage;