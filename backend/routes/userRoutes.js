// C:\Proyectos\Label\backend\routes\userRoutes.js
const express = require('express');
const router = express.Router();
// Importamos el controlador de usuario que contendrá la lógica
const { getAllUsers, getMyProfile } = require('../controllers/userController'); // Aquí estamos asumiendo que ya tienes o vas a tener getMyProfile
const { protect } = require('../middleware/authMiddleware'); // El middleware de protección

// Ruta para obtener el perfil del usuario autenticado
// Esto es lo que reemplazará a /api/auth/me
router.get('/profile', protect, getMyProfile); // ¡NUEVA RUTA para el perfil del usuario!

// Ejemplo: Ruta para obtener todos los usuarios (requiere un middleware de rol en un caso real)
router.get('/', protect, getAllUsers);

module.exports = router;