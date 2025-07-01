// E:\Proyectos\Label\backend\routes\uploadRoutes.js
import express from 'express';
const router = express.Router();
import { uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // Importa el middleware de Multer

router.post('/', protect, upload.single('image'), uploadImage);

export default router;
