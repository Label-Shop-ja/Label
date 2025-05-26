// C:\Proyectos\Label\backend\middleware\errorMiddleware.js

// Middleware para manejar errores de rutas no encontradas
const notFound = (req, res, next) => {
  const error = new Error(`No Encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pasa el error al siguiente middleware (errorHandler)
};

// Middleware general para manejo de errores
const errorHandler = (err, req, res, next) => {
  // Si la respuesta ya tiene un status code, lo usa; si no, por defecto es 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message, // Mensaje de error
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Stack trace solo en desarrollo
  });
};

module.exports = { notFound, errorHandler };