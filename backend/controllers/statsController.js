// C:\Proyectos\Label\backend\controllers\statsController.js
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Client = require('../models/Client');
const asyncHandler = require('express-async-handler');

// @desc    Obtener un resumen de ventas y productos
// @route   GET /api/stats/sales-products
// @access  Private
const getSalesAndProductStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // --- Estadísticas de Ventas ---
  const totalSalesCount = await Sale.countDocuments({ user: userId });
  
  // Usamos $match para filtrar por user y nos aseguramos de que totalAmount es un número
  const totalSalesAmountResult = await Sale.aggregate([
    { $match: { user: req.user._id } },
    { $project: { totalAmount: { $ifNull: [ "$totalAmount", 0 ] } } }, // Asegura que totalAmount no es null/undefined
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  const totalSales = totalSalesAmountResult.length > 0 ? totalSalesAmountResult[0].total : 0;

  // Ventas por método de pago
  const salesByPaymentMethod = await Sale.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: { $ifNull: [ "$totalAmount", 0 ] } } } },
  ]);

  // --- Estadísticas de Productos (Ej: Productos más vendidos) ---
  const topSellingProducts = await Sale.aggregate([
    { $match: { user: req.user._id } },
    { $unwind: '$productsSold' }, // Descompone el array productsSold
    {
      $group: {
        _id: '$productsSold.product', // Agrupar por ID de producto
        totalQuantitySold: { $sum: '$productsSold.quantity' },
        totalRevenue: { $sum: { $multiply: [ '$productsSold.quantity', { $ifNull: [ '$productsSold.priceAtSale', 0 ] } ] } },
        productName: { $first: '$productsSold.name' }, // Tomar el nombre del primer documento del grupo
      },
    },
    { $sort: { totalQuantitySold: -1 } }, // Ordenar por cantidad vendida (descendente)
    { $limit: 5 }, // Los 5 productos más vendidos
  ]);

  // --- Estadísticas de Inventario ---
  const totalProducts = await Product.countDocuments({ user: userId });
  const lowStockProducts = await Product.countDocuments({ user: userId, stock: { $lte: 10 } }); // Productos con stock bajo (ej. < 10)

  // --- Estadísticas de Clientes ---
  const totalClients = await Client.countDocuments({ user: userId });

  res.status(200).json({
    sales: {
      totalSalesCount,
      totalSalesAmount: totalSales,
      salesByPaymentMethod,
    },
    products: {
      totalProducts,
      lowStockProducts,
      topSellingProducts,
    },
    clients: {
      totalClients,
    },
  });
});

module.exports = {
  getSalesAndProductStats,
};