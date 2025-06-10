// C:\Proyectos\Label\backend\controllers\saleController.js
const Sale = require('../models/Sale');
const Product = require('../models/Product'); // Necesario para actualizar stock
const Transaction = require('../models/Transaction'); // Necesario para crear ingresos
const asyncHandler = require('express-async-handler');

// @desc    Registrar una nueva venta
// @route   POST /api/sales
// @access  Private
const createSale = asyncHandler(async (req, res) => {
  const { productsSold, paymentMethod, customerName } = req.body; // productsSold será un array de { _id: productId, quantity: N }

  if (!productsSold || productsSold.length === 0) {
    res.status(400);
    throw new Error('No hay productos en la venta.');
  }
  if (!paymentMethod) {
    res.status(400);
    throw new Error('Por favor, especifica el método de pago.');
  }

  let totalAmount = 0;
  const productsForSale = []; // Para almacenar los detalles completos de los productos vendidos

  for (const item of productsSold) {
    const product = await Product.findById(item.product);

    if (!product) {
      res.status(404);
      throw new Error(`Producto con ID ${item.product} no encontrado.`);
    }

    if (product.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('No autorizado para vender uno de estos productos.');
    }

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Stock insuficiente para el producto: ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`);
    }

    // Actualizar stock del producto
    product.stock -= item.quantity;
    await product.save();

    // Calcular el monto total de la venta
    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;

    // Añadir detalles del producto a la lista de productos vendidos
    productsForSale.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      priceAtSale: product.price, // Guardamos el precio actual del producto en la venta
    });
  }

  // Crear la venta
  const sale = await Sale.create({
    user: req.user.id,
    productsSold: productsForSale,
    totalAmount,
    paymentMethod,
    customerName,
  });

  // Opcional: Crear una transacción financiera de ingreso
  const financialTransaction = await Transaction.create({
    user: req.user.id,
    description: `Venta #${sale._id.toString().substring(0, 8)} - ${customerName || 'Cliente General'}`,
    amount: totalAmount,
    type: 'income',
    category: 'Ventas',
  });

  // Vincular la transacción financiera con la venta (opcional)
  sale.financialTransaction = financialTransaction._id;
  await sale.save();


  res.status(201).json({
    sale,
    financialTransaction: financialTransaction, // Devolvemos también la transacción creada
  });
});

// @desc    Obtener todas las ventas del usuario
// @route   GET /api/sales
// @access  Private
const getSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find({ user: req.user.id })
    .populate('productsSold.product', 'name price') // Populate para obtener el nombre y precio del producto original
    .sort({ createdAt: -1 }); // Ordenar por fecha descendente
  res.status(200).json(sales);
});

// @desc    Obtener una venta por ID (opcional)
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate('productsSold.product', 'name price');

  if (!sale) {
    res.status(404);
    throw new Error('Venta no encontrada');
  }

  if (sale.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('No autorizado para ver esta venta');
  }

  res.status(200).json(sale);
});

module.exports = {
  createSale,
  getSales,
  getSaleById,
};
