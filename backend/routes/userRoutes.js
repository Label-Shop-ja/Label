// C:\Proyectos\Label\backend\routes\userRoutes.js
import express from 'express';
// Importamos los controladores necesarios desde su archivo
import { getUserProfile, getAllUsers } from '../controllers/userController.js';
// Importamos los middlewares de una sola vez
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para obtener el perfil del usuario autenticado
router.route('/profile').get(protect, getUserProfile);

// ¡RUTA DE ADMIN! Esta ruta requiere que el usuario esté autenticado Y que tenga el rol 'admin'.
router.route('/').get(protect, authorize('admin'), getAllUsers);

export default router;
