// E:\Proyectos\Label\backend\routes\uploadRoutes.js
import express from 'express';
const router = express.Router();
import { uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // Importa el middleware de Multer

// --- Diagnóstico: Verificar el tipo de 'upload' y 'uploadImage' ---
console.log('Tipo de upload en uploadRoutes:', typeof upload); // Debería ser 'function' o 'object' (instancia de Multer)
console.log('Tipo de upload.single("image") en uploadRoutes:', typeof upload.single('image')); // Debería ser 'function'
console.log('Tipo de uploadImage en uploadRoutes:', typeof uploadImage); // Debería ser 'function'
// ------------------------------------------------------------------

router.post('/', protect, upload.single('image'), uploadImage);

export default router;
