// C:\Proyectos\Label\backend\routes\exchangeRateRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); // Asegúrate que la ruta sea correcta
const {
  getExchangeRate,
  setExchangeRate,
} = require('../controllers/exchangeRateController'); // Asegúrate que la ruta sea correcta

router.route('/').get(protect, getExchangeRate).post(protect, setExchangeRate);

module.exports = router;