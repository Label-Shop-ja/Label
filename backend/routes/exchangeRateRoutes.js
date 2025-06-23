// C:\Proyectos\Label\backend\routes\exchangeRateRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); // Asegúrate que la ruta sea correcta
const {
  getExchangeRate,
  setExchangeRate,
  fetchOfficialRate, // <-- ¡Importamos la función para usarla!
} = require('../controllers/exchangeRateController'); // Asegúrate que la ruta sea correcta

// --- RUTA TEMPORAL PARA PROBAR LA FUNCIÓN fetchOfficialRate ---
// ¡ESTA RUTA DEBE SER REMOVIDA UNA VEZ TERMINES LA PRUEBA Y LA DEPURACIÓN!
// Simulamos un usuario en el `req` objeto para que `fetchOfficialRate` funcione
router.get('/trigger-fetch-rate-test', // `protect` está comentado para facilitar la prueba
  async (req, res) => {
    try {
        // SIMULA UN USUARIO: Reemplaza '6842359810a043e73240186f' con un ID REAL de tu base de datos.
        // Este ID debe ser de un usuario que exista en tu colección `users`.
        req.user = { id: '6842359810a043e73240186f' }; // ¡CRÍTICO!

        console.log('¡Coño! Disparando fetchOfficialRate desde la ruta de prueba...');
        
        // Llama directamente a la función fetchOfficialRate.
        // Dado que fetchOfficialRate ya es un controlador de Express (con asyncHandler),
        // maneja su propia respuesta (res.status().json()).
        // Por eso, la lógica `if (!res.headersSent)` es clave para no intentar enviar dos respuestas.
        await fetchOfficialRate(req, res); 
        
        // Si fetchOfficialRate ya envió una respuesta, este bloque no se ejecutará.
        // Esto es útil para ver si la función interna ya resolvió la petición.
        if (!res.headersSent) { 
            console.warn('fetchOfficialRate no envió una respuesta explícita. Revisa su implementación o los logs.');
            res.status(200).json({ message: 'Ruta de prueba ejecutada, verifica la consola del backend y la DB.' });
        }

    } catch (error) {
        console.error('¡Verga! Error en la ruta de prueba de fetchOfficialRate:', error.message);
        if (!res.headersSent) { // Si aún no se ha enviado una respuesta
            res.status(500).json({ message: 'Error en la ruta de prueba: ' + error.message });
        }
    }
});
// --- FIN DE LA RUTA TEMPORAL ---

// Rutas existentes para la gestión de tasas
router.route('/').get(protect, getExchangeRate).post(protect, setExchangeRate);

// ¡NUEVA RUTA PERMANENTE para disparar la actualización oficial de la tasa!
// Esta ruta es para que, si quieres, puedas disparar la actualización de la tasa
// desde el frontend (ej. un botón de "Actualizar Tasas") o un cron job externo.
// Requiere autenticación (`protect`).
router.route('/fetchOfficial').post(protect, fetchOfficialRate); 

module.exports = router;