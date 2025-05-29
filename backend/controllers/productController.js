// C:\Proyectos\Label\backend\controllers\productController.js
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Obtener todos los productos del usuario con búsqueda, filtro y paginación
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  // 1. Inicializar el objeto de consulta para Mongoose
  const query = { user: req.user.id };

  // 2. Implementar búsqueda por nombre (name)
  if (req.query.name) {
    // Usar una expresión regular para búsqueda parcial e insensible a mayúsculas/minúsculas
    query.name = { $regex: req.query.name, $options: 'i' };
  }

  // 3. Implementar filtrado por categoría (category)
  if (req.query.category && req.query.category !== 'All') { // 'All' para mostrar todas las categorías
    query.category = req.query.category;
  }

  // 4. Paginación
  const page = parseInt(req.query.page, 10) || 1; // Página actual, por defecto 1
  const limit = parseInt(req.query.limit, 10) || 10; // Cantidad de productos por página, por defecto 10
  const skip = (page - 1) * limit; // Cuántos documentos saltar

  // 5. Contar el total de productos que coinciden con la consulta (sin paginación)
  const totalProducts = await Product.countDocuments(query);

  // 6. Obtener los productos con paginación y ordenamiento
  const products = await Product.find(query)
    .sort({ createdAt: -1 }) // Ordenar por fecha de creación descendente
    .skip(skip)
    .limit(limit);

  // 7. Calcular información de paginación
  const totalPages = Math.ceil(totalProducts / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // 8. Enviar la respuesta con los productos y la información de paginación
  res.status(200).json({
    products,
    pagination: {
      totalProducts,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage,
      hasPrevPage,
    },
  });
});

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, price, stock } = req.body;

  if (!name || !category || !price || !stock) {
    res.status(400);
    throw new Error('Por favor, ingresa todos los campos requeridos: nombre, categoría, precio, stock.');
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

  const product = await Product.create({
    user: req.user.id,
    name,
    description: description || '',
    category,
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
      category: category || product.category,
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