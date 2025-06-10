// E:\Proyectos\Label\backend\middleware\authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => { // Envuelve la función en asyncHandler directamente
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                // Modificado para usar asyncHandler, lanzar error para que lo capture errorHandler
                res.status(401);
                throw new Error('No autorizado, usuario no encontrado.');
            }

            next();
        } catch (error) {
            console.error('Error en el middleware de autenticación:', error);
            if (error.name === 'JsonWebTokenError') {
                res.status(401);
                throw new Error('No autorizado, token inválido.');
            }
            if (error.name === 'TokenExpiredError') {
                res.status(401);
                throw new Error('No autorizado, token expirado.');
            }
            res.status(401); // Para cualquier otro error de JWT o inesperado
            throw new Error('No autorizado, token fallido.');
        }
    }

    if (!token) {
        res.status(401); // Establecer el status antes de lanzar el error
        throw new Error('No autorizado, no hay token.');
    }
});

module.exports = protect; // <-- ¡Cambiado! Exportamos la función 'protect' directamente
