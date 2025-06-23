const express = require('express');
const router = express.Router();
const {
  createCustomRate,
  getCustomRates,
  updateCustomRate,
  deleteCustomRate,
} = require('../controllers/customExchangeRateController');
const protect = require('../middleware/authMiddleware'); // Corrige: sin destructuring

// Todas estas rutas necesitan que el pana esté logueado
router.use(protect);

router.route('/')
  .post(createCustomRate) // Crear una nueva tasa personalizada
  .get(getCustomRates);   // Obtener todas las tasas del pana

router.route('/:id')
  .put(updateCustomRate)    // Actualizar una tasa
  .delete(deleteCustomRate); // Borrar el guiso

module.exports = router;