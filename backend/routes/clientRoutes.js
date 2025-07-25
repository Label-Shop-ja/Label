// C:\Proyectos\Label\backend\routes\clientRoutes.js
import express from 'express';
const router = express.Router();
import {
  getClients,
  createClient,
  getClientById,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';
import { protect } from '../middleware/authMiddleware.js';

// Rutas protegidas
router.route('/').get(protect, getClients).post(protect, createClient);
router.route('/:id').get(protect, getClientById).put(protect, updateClient).delete(protect, deleteClient);

export default router;
