import React, { useState, useEffect } from 'react';

const FinancialPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Simulando carga de datos
    setTimeout(() => {
      setTransactions([
        { _id: '1', description: 'Venta de producto', amount: 100 },
        { _id: '2', description: 'Compra de material', amount: 50 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b, #334155)', padding: '24px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '32px' }}>
        Centro Financiero
      </h1>
      
      {error && (
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
          Transacciones
        </h2>
        {transactions.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No hay transacciones</p>
        ) : (
          <div>
            {transactions.map((transaction) => (
              <div key={transaction._id} style={{ backgroundColor: 'rgba(51, 65, 85, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <h3 style={{ color: 'white', fontWeight: '600' }}>{transaction.description}</h3>
                <p style={{ color: '#94a3b8' }}>${transaction.amount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialPage;