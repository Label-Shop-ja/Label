// C:\Proyectos\Label\backend\controllers\authController.js
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken');

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body; // <-- SIN username

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('Por favor, completa todos los campos.');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Ya existe un usuario con este correo electrónico.');
  }

  const user = await User.create({
    fullName,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos.');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body; // <-- SIN username, solo email

  const user = await User.findOne({ email }); // <-- Buscar solo por email

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Correo electrónico o contraseña inválidos.');
  }
});

module.exports = {
  registerUser,
  loginUser,
};