// E:\Proyectos\Label\backend\middleware\uploadMiddleware.js
const multer = require('multer');

// Configuración de almacenamiento de Multer:
// Usamos 'memoryStorage()' para que Multer almacene el archivo en la memoria del servidor.
const storage = multer.memoryStorage();

// Filtro de archivo:
// Esta función verifica el tipo MIME del archivo para asegurarse de que solo se suban imágenes.
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Aceptar el archivo
    } else {
        cb(new Error('Solo se permiten archivos de imagen (jpg, jpeg, png, gif)'), false);
    }
};

// Configuración final de Multer:
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Límite de 5 MB por archivo
    }
});

module.exports = upload; // <--- ¡Importante! Exportamos la instancia 'upload' directamente
