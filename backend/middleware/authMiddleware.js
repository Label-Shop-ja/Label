// C:\Proyectos\Label\backend\middleware\authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // Asegúrate de tenerlo instalado
const User = require('../models/User'); // Asegúrate de que el modelo User está correctamente importado

const protect = async (req, res, next) => {
  let token;

  // 1. Verificar si el token está en los headers de autorización
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraer el token del header "Bearer <TOKEN>"
      token = req.headers.authorization.split(' ')[1];

      // 2. Verificar el token
      // jwt.verify devuelve el payload decodificado del token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Buscar el usuario en la base de datos por el ID del token
      // Seleccionamos los campos que queremos adjuntar a req.user (excluyendo la contraseña)
      req.user = await User.findById(decoded.id).select('-password');

      // Si el usuario no existe (por si fue borrado o el ID es inválido)
      if (!req.user) {
        return res.status(401).json({ message: 'No autorizado, usuario no encontrado.' });
      }

      // 4. Pasar al siguiente middleware o a la función de la ruta
      next();
    } catch (error) {
      console.error('Error en el middleware de autenticación:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'No autorizado, token inválido.' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'No autorizado, token expirado.' });
      }
      // Para cualquier otro error de JWT o error inesperado
      res.status(401).json({ message: 'No autorizado, token fallido.' });
    }
  }

  // Si no se encuentra un token en los headers (o no comienza con 'Bearer')
  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token.' });
  }
};

module.exports = { protect };