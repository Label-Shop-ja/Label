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
const { protect } = require('../middleware/authMiddleware'); // Importa el middleware de protección

// Rutas protegidas
router.route('/').get(protect, getClients).post(protect, createClient);
router.route('/:id').get(protect, getClientById).put(protect, updateClient).delete(protect, deleteClient);

module.exports = router;