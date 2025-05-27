// C:\Proyectos\Label\backend\controllers\productController.js
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Obtener todos los productos del usuario
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(products);
});

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
  // Asegúrate de incluir 'category' aquí
  const { name, description, category, price, stock } = req.body;

  // Validar campos requeridos
  if (!name || !category || !price || !stock) { // <--- ¡Category es ahora requerido!
    res.status(400);
    throw new Error('Por favor, ingresa todos los campos requeridos: nombre, categoría, precio, stock.');
  }

  // Validar que price y stock sean números válidos
  const parsedPrice = Number(price);
  const parsedStock = Number(stock);

  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    res.status(400);
    throw new Error('El precio debe ser un número positivo.');
  }
  if (isNaN(parsedStock) || parsedStock < 0) {
    res.status(400);
    throw new Error('El stock debe ser un número no negativo.');
  }

  // Crear el producto
  const product = await Product.create({
    user: req.user.id,
    name,
    description: description || '',
    category, // <--- ¡Añadimos category aquí!
    price: parsedPrice,
    stock: parsedStock,
  });

  res.status(201).json(product);
});

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('No autorizado para ver este producto');
  }

  res.status(200).json(product);
});

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
  // Asegúrate de incluir 'category' aquí también para la actualización
  const { name, description, category, price, stock } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('No autorizado para actualizar este producto');
  }

  const parsedPrice = Number(price);
  const parsedStock = Number(stock);

  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    res.status(400);
    throw new Error('El precio debe ser un número positivo.');
  }
  if (isNaN(parsedStock) || parsedStock < 0) {
    res.status(400);
    throw new Error('El stock debe ser un número no negativo.');
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      category: category || product.category, // <--- ¡Añadimos category aquí!
      price: parsedPrice,
      stock: parsedStock,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedProduct);
});

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('No autorizado para eliminar este producto');
  }

  await product.deleteOne();
  res.status(200).json({ message: 'Producto eliminado exitosamente', id: req.params.id });
});

module.exports = {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};