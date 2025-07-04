// C:\Proyectos\Label\backend\controllers\authController.js
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { generateAccessToken, generateRefreshToken, } from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

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

  const user = await User.createUserWithDefaults({
    fullName,
    email,
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

// @desc    Manejar la solicitud de "Olvidé mi contraseña"
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  // 1. Obtener el usuario basado en el correo electrónico proporcionado
  const user = await User.findOne({ email: req.body.email });

  // Si no se encuentra el usuario, enviamos una respuesta genérica para no revelar
  // si un correo electrónico está registrado o no (previene la enumeración de usuarios).
  if (!user) {
    return res.status(200).json({ message: 'Si existe una cuenta con ese correo, se ha enviado un enlace de recuperación.' });
  }

  // 2. Generar un token de reseteo aleatorio y seguro
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 3. Hashear el token y guardarlo en la base de datos junto con su fecha de expiración
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // El token expira en 10 minutos
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; 

  await user.save({ validateBeforeSave: false }); // Guardamos sin validar otros campos

  // 4. Crear la URL de reseteo que apuntará al frontend
  // El frontend recibirá este token y lo usará para llamar a otra ruta del backend.
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `¿Olvidaste tu contraseña? Haz clic en el siguiente enlace para restablecerla: \n\n ${resetURL} \n\nSi no solicitaste esto, por favor ignora este correo. El enlace es válido por 10 minutos.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Restablecimiento de Contraseña para tu Cuenta de Label',
      message,
    });

    res.status(200).json({ message: 'Se ha enviado un enlace de recuperación a tu correo.' });

  } catch (err) {
    // Si el envío del correo falla, limpiamos el token de la base de datos para evitar problemas.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('ERROR AL ENVIAR CORREO:', err);
    res.status(500).json({ message: 'Hubo un error al enviar el correo. Por favor, inténtalo de nuevo más tarde.' });
  }
});

// @desc    Restablecer la contraseña
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // 1. Obtener el usuario basado en el token de la URL
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Buscamos un usuario que tenga este token y que no haya expirado
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. Si no se encuentra un usuario, el token es inválido o ha expirado
  if (!user) {
    res.status(400);
    throw new Error('El token es inválido o ha expirado.');
  }

  // 3. Establecer la nueva contraseña
  if (req.body.password !== req.body.confirmPassword) {
    res.status(400);
    throw new Error('Las contraseñas no coinciden.');
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // El hook 'pre-save' en el modelo se encargará de hashear la contraseña

  res.status(200).json({ message: 'La contraseña ha sido restablecida con éxito.' });
});

export { registerUser, loginUser, getAuthStatus, logoutUser, refreshAccessToken, forgotPassword, resetPassword };