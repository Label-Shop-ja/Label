// E:\Proyectos\Label\backend\controllers\uploadController.js
const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinaryConfig');
const axios = require('axios');

const uploadImage = asyncHandler(async (req, res) => {
    let imageUrlToUpload;

    if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        imageUrlToUpload = `data:${req.file.mimetype};base64,${b64}`;
    } else if (req.body.imageUrl) {
        const externalUrl = req.body.imageUrl;
        if (externalUrl.startsWith('data:image/')) {
            imageUrlToUpload = externalUrl;
        } else {
            try {
                const response = await axios.get(externalUrl, { responseType: 'arraybuffer' });
                const mimeType = response.headers['content-type'];
                if (!mimeType || !mimeType.startsWith('image/')) {
                    res.status(400);
                    throw new Error('La URL proporcionada no apunta a un archivo de imagen válido. Tipo de contenido recibido: ' + mimeType);
                }
                const b64 = Buffer.from(response.data).toString('base64');
                imageUrlToUpload = `data:${mimeType};base64,${b64}`;
            } catch (error) {
                console.error("Error al descargar imagen desde URL externa:", error.message);
                res.status(400);
                throw new Error('No se pudo descargar la imagen de la URL proporcionada. Asegúrate de que sea una URL pública y válida a un archivo de imagen.');
            }
        }
    } else {
        res.status(400);
        throw new Error('No se proporcionó ningún archivo de imagen ni una URL de imagen para procesar.');
    }

    try {
        const result = await cloudinary.uploader.upload(imageUrlToUpload, {
            folder: "label_products",
            resource_type: "image",
            transformation: [
                { width: 800, height: 600, crop: "limit" },
                { quality: "auto:eco" }
            ]
        });

        const publicUrl = result.secure_url;
        res.status(200).json({
            message: 'Imagen subida y procesada exitosamente en Cloudinary.',
            imageUrl: publicUrl,
            publicId: result.public_id,
        });

    } catch (uploadError) {
        console.error("Error al subir imagen a Cloudinary:", uploadError.message);
        res.status(500);
        throw new Error('Error al subir la imagen al servicio de alojamiento: ' + uploadError.message);
    }
});

module.exports = {
    uploadImage, // <--- ¡Importante! Exportamos 'uploadImage' como una propiedad de un objeto
};
