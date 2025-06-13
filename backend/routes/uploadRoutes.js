// E:\Proyectos\Label\backend\routes\uploadRoutes.js
const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Importa el middleware de Multer

// --- Diagnóstico: Verificar el tipo de 'upload' y 'uploadImage' ---
console.log('Tipo de upload en uploadRoutes:', typeof upload); // Debería ser 'function' o 'object' (instancia de Multer)
console.log('Tipo de upload.single("image") en uploadRoutes:', typeof upload.single('image')); // Debería ser 'function'
console.log('Tipo de uploadImage en uploadRoutes:', typeof uploadImage); // Debería ser 'function'
// ------------------------------------------------------------------

router.post('/', protect, upload.single('image'), uploadImage);

module.exports = router;
