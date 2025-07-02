// C:\Proyectos\Label\backend\controllers\authController.js
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import ExchangeRate from '../models/ExchangeRate.js'; // Importamos el modelo de Tasa de Cambio
import { generateAccessToken, generateRefreshToken, } from '../utils/generateToken.js';

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

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
    // ¡IMPORTANTE! Crea una configuración de tasas por defecto para el nuevo usuario.
    // El modelo de producto depende de esto para calcular precios.
    await ExchangeRate.create({
      user: user._id,
      conversions: [
        { fromCurrency: 'USD', toCurrency: 'VES', rate: 40.0, lastUpdated: new Date() },
        { fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.1, lastUpdated: new Date() },
      ],
      defaultProfitPercentage: 20,
      personalRateThresholdPercentage: 5,
      personalRate: 40.0,
      officialRate: 40.0,
      lastOfficialUpdate: new Date(),
    });

    // Al registrarse, generamos ambos tokens para que el usuario inicie sesión automáticamente.
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Enviamos el refreshToken en una cookie segura y httpOnly
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // El frontend no puede acceder a esta cookie con JS
      secure: process.env.NODE_ENV !== 'development', // Solo se envía en HTTPS en producción
      sameSite: 'strict', // Mitiga ataques CSRF
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    });

    res.status(201).json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
      // Solo devolvemos el accessToken en el JSON
      accessToken, 
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos.');
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Usamos las funciones centralizadas de tu `generateToken.js`
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Enviamos el refreshToken en una cookie segura y httpOnly
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
      });

      // Devolvemos solo el accessToken y los datos del usuario en el JSON
      res.json({
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
        accessToken,
      });
    } else {
      res.status(401);
      throw new Error('Correo electrónico o contraseña inválidos.');
    }
  } catch (error) {
    // ¡AQUÍ ATRAPAMOS AL NINJA!
    next(error); // Pasamos el error al errorHandler para que el frontend reciba una respuesta
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // Ahora leemos el refreshToken desde la cookie que nos envía el navegador
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401);
    throw new Error('No se proporcionó un refresh token');
  }

  try {
    // Verificamos el refresh token con su secreto correspondiente
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Si es válido, generamos un NUEVO access token y lo devolvemos
    const newAccessToken = generateAccessToken(decoded.id);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    // Si la verificación falla (token inválido o expirado), se lanza un error
    res.status(401);
    throw new Error('Refresh token no es válido o ha expirado');
  }
});

// Controlador para cerrar sesión
const logoutUser = asyncHandler(async (req, res) => {
  // Limpiamos la cookie del refreshToken
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0), // La hacemos expirar inmediatamente
  });
  res.status(200).json({ message: 'Cierre de sesión exitoso' });
});


export { registerUser, loginUser, refreshAccessToken, logoutUser };