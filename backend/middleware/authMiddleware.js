import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js'; // Asegúrate de que la ruta a tu modelo de usuario sea correcta

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // El token se envía en el encabezado 'Authorization' con el formato 'Bearer <token>'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 1. Extraemos el token del encabezado
    token = req.headers.authorization.split(' ')[1];

    try {
      // 2. Verificamos el token usando el secreto del ACCESS token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // 3. Buscamos al usuario en la BD por el ID que está en el token
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Este catch solo se activará si jwt.verify falla (token malformado, expirado, etc.)
      res.status(401);
      throw new Error('No autorizado, el token falló');
    }

    // 4. Verificamos si el usuario obtenido del token todavía existe en la base de datos.
    // Hacemos esta verificación FUERA del try...catch para un manejo de errores más limpio.
    if (!req.user) {
      res.status(401);
      throw new Error('No autorizado, el usuario de este token ya no existe.');
    }

    next(); // Si todo es correcto, pasamos al siguiente controlador.
  }

  if (!token) {
    res.status(401);
    throw new Error('No autorizado, no se encontró un token');
  }
});

/**
 * Middleware para autorizar roles de usuario.
 * @param {...string} roles - Lista de roles permitidos para acceder a la ruta.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Asume que el middleware `protect` ya se ejecutó y adjuntó `req.user`.
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403); // 403 Forbidden es más apropiado que 401 Unauthorized aquí.
      throw new Error(`El rol de usuario '${req.user?.role}' no tiene permiso para acceder a este recurso.`);
    }
    next();
  };
};

export { protect, authorize };