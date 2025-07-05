// C:\Proyectos\Label\backend\controllers\authController.js
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { generateAccessToken, generateRefreshToken, } from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import { getPasswordResetHTML } from '../utils/emailTemplates.js';

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('Por favor, completa todos los campos.');
  }

  const lowerCaseEmail = email.toLowerCase();

  const userExists = await User.findOne({ email: lowerCaseEmail });

  if (userExists) {
    res.status(400);
    throw new Error('Ya existe un usuario con este correo electrónico.');
  }

  const user = await User.createUserWithDefaults({
    fullName,
    email: lowerCaseEmail,
    password,
  });

  if (user) {
    // En lugar de iniciar sesión, devolvemos un mensaje de éxito.
    // El usuario deberá iniciar sesión manualmente.
    res.status(201).json({
      message: '¡Registro exitoso! Por favor, inicia sesión para continuar.',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos.');
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const lowerCaseEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowerCaseEmail });

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

// Controlador para que el frontend verifique el estado de la autenticación post-OAuth
const getAuthStatus = asyncHandler(async (req, res) => {
  if (req.isAuthenticated()) { // req.isAuthenticated() es una función de Passport
    const user = req.user; // El usuario completo está disponible aquí

    // Generamos los tokens como en el login normal
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Establecemos la cookie del refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    });

    // Devolvemos los datos del usuario y el accessToken
    res.status(200).json({
      isAuthenticated: true,
      user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      accessToken,
    });
  } else {
    res.status(401);
    throw new Error('Usuario no autenticado');
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

// Controlador para refrescar el token de acceso
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Leemos el refreshToken desde la cookie que nos envía el navegador
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

// @desc    Manejar la solicitud de "Olvidé mi contraseña" (Enviar código)
// @desc    Restablecer la contraseña
// @route   POST /api/auth/reset-password/:token
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const lowerCaseEmail = email.toLowerCase();
  const user = await User.findOne({ email: lowerCaseEmail });

  if (!user) {
    // Respuesta genérica para no revelar si un correo existe
    return res.status(200).json({ message: 'Si tu correo está registrado, recibirás un código de recuperación.' });
  }

  // 1. Generar un código de 6 dígitos
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 2. Hashear el código y guardarlo en la BD
  user.passwordResetToken = crypto.createHash('sha256').update(resetCode).digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutos de validez

  await user.save({ validateBeforeSave: false });

  // 3. Enviar el correo HTML
  try {
    const htmlMessage = getPasswordResetHTML(resetCode);
    await sendEmail({
      email: user.email,
      subject: 'Tu Código de Recuperación de Contraseña de Label',
      message: `Tu código de recuperación es: ${resetCode}`, // Fallback de texto plano
      html: htmlMessage,
    });

    res.status(200).json({ message: 'Se ha enviado un código de recuperación a tu correo.' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('ERROR AL ENVIAR CORREO:', err);
    res.status(500).json({ message: 'Hubo un error al enviar el correo. Por favor, inténtalo de nuevo más tarde.' });
  }
});

// @desc    Verificar el código de reseteo
// @route   POST /api/auth/verify-reset-code
// @access  Public
const verifyResetCode = asyncHandler(async (req, res) => {
  const { code } = req.body;

  // Medida de seguridad: Asegurarse de que el código es una cadena antes de limpiarlo.
  if (!code || typeof code !== 'string') {
    res.status(400);
    throw new Error('El formato del código es inválido.');
  }

  // Hashear el código que envía el usuario para compararlo con el de la BD
  const hashedCode = crypto.createHash('sha256').update(code.trim()).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('El código es inválido o ha expirado.');
  }

  // Si el código es correcto, limpiamos los campos para que no se pueda reutilizar
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Generamos un token de acceso temporal que autoriza el cambio de contraseña
  const resetAuthToken = generateAccessToken(user._id);

  res.status(200).json({ message: 'Código verificado con éxito.', resetToken: resetAuthToken });
});

// @desc    Restablecer la contraseña final (requiere token de autorización)
// @route   POST /api/auth/reset-password
// @access  Private (usando el token temporal)
const resetPassword = asyncHandler(async (req, res) => {
  // El usuario es identificado por el middleware 'protect' usando el token temporal
  const user = await User.findById(req.user.id);

  if (req.body.password !== req.body.confirmPassword) {
    res.status(400);
    throw new Error('Las contraseñas no coinciden.');
  }
  user.password = req.body.password;
  await user.save();

  res.status(200).json({ message: 'La contraseña ha sido restablecida con éxito.' });
});

export { registerUser, loginUser, getAuthStatus, logoutUser, refreshAccessToken, forgotPassword, verifyResetCode, resetPassword };