import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js'; // Asegúrate de que la ruta sea correcta

// @desc    Obtener el perfil del usuario
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // Gracias al middleware `protect`, ya tenemos `req.user` disponible aquí.
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Obtener todos los usuarios (Solo para Admin)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password'); // Obtenemos todos los usuarios sin su contraseña
  res.json(users);
});

export { getUserProfile, getAllUsers };