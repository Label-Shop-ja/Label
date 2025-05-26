// C:\Proyectos\Label\backend\controllers\productController.js
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler'); // Para manejar excepciones en funciones asíncronas

// @desc    Obtener todos los productos del usuario autenticado
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  // Solo busca productos que pertenezcan al usuario logueado (req.user.id viene del middleware protect)
  const products = await Product.find({ user: req.user.id });
  res.status(200).json(products);
});

// @desc    Obtener un solo producto por ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  // Asegurarse de que el producto pertenezca al usuario logueado
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('No autorizado para ver este producto');
  }

  res.status(200).json(product);
});

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, sku, category, price, cost, quantityInStock, reorderPoint, imageUrl, supplier } = req.body;

  // Validar campos obligatorios
  if (!name || !sku || price === undefined || quantityInStock === undefined) {
    res.status(400);
    throw new Error('Por favor, ingresa todos los campos obligatorios: nombre, SKU, precio y cantidad en stock.');
  }

  // Verificar si el SKU ya existe para este usuario (o globalmente, dependiendo de la necesidad)
  // Por ahora, verificamos si el SKU es único globalmente, pero podrías querer que sea único por usuario.
  const productExists = await Product.findOne({ sku });
  if (productExists) {
    res.status(400);
    throw new Error('Ya existe un producto con este SKU.');
  }

  const product = await Product.create({
    user: req.user.id, // Asigna el producto al usuario logueado
    name,
    description,
    sku,
    category,
    price,
    cost,
    quantityInStock,
    reorderPoint,
    imageUrl,
    supplier,
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error('Datos de producto inválidos.');
  }
});

// @desc    Actualizar un producto existente
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, sku, category, price, cost, quantityInStock, reorderPoint, imageUrl, supplier } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado.');
  }

  // Asegurarse de que el producto pertenezca al usuario logueado
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('No autorizado para actualizar este producto.');
  }

  // Si se intenta cambiar el SKU, verificar que el nuevo SKU no exista ya
  if (sku && sku !== product.sku) {
    const existingProductWithNewSku = await Product.findOne({ sku });
    if (existingProductWithNewSku && existingProductWithNewSku._id.toString() !== product._id.toString()) {
      res.status(400);
      throw new Error('Ya existe otro producto con este SKU.');
    }
  }

  // Actualizar los campos del producto
  product.name = name || product.name;
  product.description = description || product.description;
  product.sku = sku || product.sku;
  product.category = category || product.category;
  product.price = price !== undefined ? price : product.price; // Permitir 0
  product.cost = cost !== undefined ? cost : product.cost;
  product.quantityInStock = quantityInStock !== undefined ? quantityInStock : product.quantityInStock;
  product.reorderPoint = reorderPoint !== undefined ? reorderPoint : product.reorderPoint;
  product.imageUrl = imageUrl || product.imageUrl;
  product.supplier = supplier || product.supplier;

  const updatedProduct = await product.save(); // Guarda el producto actualizado

  res.status(200).json(updatedProduct);
});

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado.');
  }

  // Asegurarse de que el producto pertenezca al usuario logueado
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('No autorizado para eliminar este producto.');
  }

  await Product.deleteOne({ _id: req.params.id }); // Usa deleteOne para eliminar por ID

  res.status(200).json({ message: 'Producto eliminado con éxito.' });
});


module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};