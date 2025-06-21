// C:\Proyectos\Label\backend\routes\exchangeRateRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); // Asegúrate que la ruta sea correcta
const {
  getExchangeRate,
  setExchangeRate,
  fetchOfficialRate, // <-- ¡NUEVA LÍNEA!
} = require('../controllers/exchangeRateController'); // Asegúrate que la ruta sea correcta

router.route('/').get(protect, getExchangeRate).post(protect, setExchangeRate);
router.route('/fetchOfficial').post(protect, fetchOfficialRate); // <-- ¡NUEVA RUTA!

module.exports = router;