// C:\Proyectos\Label\backend\routes\clientRoutes.js
const express = require('express');
const router = express.Router();
const {
  getClients,
  createClient,
  getClientById,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');
// Importamos el middleware de protección. ¡Ahora lo importamos directamente!
const protect = require('../middleware/authMiddleware'); // <--- ¡CAMBIO AQUÍ!

// Rutas protegidas
router.route('/').get(protect, getClients).post(protect, createClient);
router.route('/:id').get(protect, getClientById).put(protect, updateClient).delete(protect, deleteClient);

module.exports = router;
