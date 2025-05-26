// C:\Proyectos\Label\backend\controllers\userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Asegúrate de que User está importado

// @desc    Obtener todos los usuarios (solo para administradores, por ejemplo)
// @route   GET /api/users
// @access  Private/Admin (se necesitaría un middleware de rol)
const getMyProfile = asyncHandler(async (req, res) => {
  // El middleware 'protect' ya ha adjuntado el objeto 'user' completo a 'req'
  // por lo que simplemente podemos devolver los datos del usuario.
  // Ya vienen sin la contraseña gracias a .select('-password') en authMiddleware.
  res.status(200).json(req.user);
});

// @desc    Obtener todos los usuarios (Ejemplo, puede ser para administradores)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  // En una app real, esto estaría protegido por un middleware de rol (isAdmin)
  const users = await User.find({}).select('-password'); // Excluye contraseñas
  res.status(200).json(users);
});

// ... otras funciones de usuario como actualizar perfil, etc.

module.exports = {
  getMyProfile,
  getAllUsers,
};