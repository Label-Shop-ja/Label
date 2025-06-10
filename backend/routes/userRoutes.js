// C:\Proyectos\Label\backend\routes\userRoutes.js
const express = require('express');
const router = express.Router();
// Importamos el controlador de usuario que contendrá la lógica
const { getAllUsers, getMyProfile } = require('../controllers/userController');
// Importamos el middleware de protección. ¡Ahora lo importamos directamente!
const protect = require('../middleware/authMiddleware');

// Ruta para obtener el perfil del usuario autenticado
router.get('/profile', protect, getMyProfile); // RUTA para el perfil del usuario

// Ejemplo: Ruta para obtener todos los usuarios (requiere un middleware de rol en un caso real)
router.get('/', protect, getAllUsers);

module.exports = router;
