import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser); // ¡NUEVA RUTA! Para cerrar la sesión
router.post('/refresh', refreshAccessToken); // ¡NUEVA RUTA!

export default router;