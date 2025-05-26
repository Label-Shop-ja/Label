// C:\Proyectos\Label\backend\routes\authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController'); // <-- Importa desde el controlador
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;