// C:\Proyectos\Label\backend\controllers\transactionController.js
const Transaction = require('../models/Transaction');
const asyncHandler = require('express-async-handler');

// @desc    Obtener todas las transacciones del usuario
// @route   GET /api/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(transactions);
});

// @desc    Crear una nueva transacción
// @route   POST /api/transactions
// @access  Private
const createTransaction = asyncHandler(async (req, res) => {
  const { description, amount, type, category } = req.body;

  if (!description || !amount || !type || !category) {
    res.status(400);
    throw new Error('Por favor, ingresa todos los campos requeridos: descripción, monto, tipo, categoría.');
  }

  if (isNaN(amount) || amount <= 0) { // Validar que el monto sea un número positivo
      res.status(400);
      throw new Error('El monto debe ser un número positivo.');
  }

  if (!['income', 'expense'].includes(type)) {
    res.status(400);
    throw new Error('El tipo de transacción debe ser "income" (ingreso) o "expense" (gasto).');
  }

  const transaction = await Transaction.create({
    user: req.user.id,
    description,
    amount: Number(amount), // Asegurarse de que se guarda como número
    type,
    category,
  });

  res.status(201).json(transaction);
});

// @desc    Obtener una transacción por ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error('Transacción no encontrada');
  }

  if (transaction.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('No autorizado para ver esta transacción');
  }

  res.status(200).json(transaction);
});

// @desc    Actualizar una transacción
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = asyncHandler(async (req, res) => {
  const { description, amount, type, category } = req.body;
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error('Transacción no encontrada');
  }

  if (transaction.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('No autorizado para actualizar esta transacción');
  }

  if (isNaN(amount) || amount <= 0) { // Validar que el monto sea un número positivo
      res.status(400);
      throw new Error('El monto debe ser un número positivo.');
  }

  const updatedTransaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    { description, amount: Number(amount), type, category }, // Asegurarse de que se guarda como número
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedTransaction);
});

// @desc    Eliminar una transacción
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error('Transacción no encontrada');
  }

  if (transaction.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('No autorizado para eliminar esta transacción');
  }

  await transaction.deleteOne();
  res.status(200).json({ message: 'Transacción eliminada exitosamente', id: req.params.id });
});

// @desc    Obtener resumen financiero (ingresos, gastos, balance)
// @route   GET /api/transactions/summary
// @access  Private
const getFinancialSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const incomeTransactions = await Transaction.find({ user: userId, type: 'income' });
  const expenseTransactions = await Transaction.find({ user: userId, type: 'expense' });

  // Aseguramos que 'amount' sea un número válido antes de sumar
  const totalIncome = incomeTransactions.reduce((acc, trans) => acc + (typeof trans.amount === 'number' ? trans.amount : 0), 0);
  const totalExpense = expenseTransactions.reduce((acc, trans) => acc + (typeof trans.amount === 'number' ? trans.amount : 0), 0);
  const netBalance = totalIncome - totalExpense;

  const incomeByCategory = incomeTransactions.reduce((acc, trans) => {
    const amount = typeof trans.amount === 'number' ? trans.amount : 0;
    acc[trans.category] = (acc[trans.category] || 0) + amount;
    return acc;
  }, {});

  const expenseByCategory = expenseTransactions.reduce((acc, trans) => {
    const amount = typeof trans.amount === 'number' ? trans.amount : 0;
    acc[trans.category] = (acc[trans.category] || 0) + amount;
    return acc;
  }, {});

  res.status(200).json({
    totalIncome,
    totalExpense,
    netBalance,
    incomeByCategory,
    expenseByCategory,
  });
});


module.exports = {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary,
};