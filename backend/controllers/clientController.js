// C:\Proyectos\Label\backend\controllers\clientController.js
import Client from '../models/Client.js';
import asyncHandler from 'express-async-handler';

// @desc    Obtener todos los clientes del usuario
// @route   GET /api/clients
// @access  Private
export const getClients = asyncHandler(async (req, res) => {
  // Obtener solo clientes asociados al usuario autenticado
  const clients = await Client.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(clients);
});

// @desc    Crear un nuevo cliente
// @route   POST /api/clients
// @access  Private
export const createClient = asyncHandler(async (req, res) => {
  const { name, email, phone, address } = req.body;

  // Validar campo requerido: nombre
  if (!name) {
    res.status(400);
    throw new Error('Por favor, añade el nombre del cliente.');
  }

  const client = await Client.create({
    user: req.user.id, // Asocia el cliente al usuario autenticado
    name,
    email,
    phone,
    address,
  });

  res.status(201).json(client);
});

// Opcional: Obtener un cliente por ID (para futuras actualizaciones/eliminaciones)
// @desc    Obtener un cliente por ID
// @route   GET /api/clients/:id
// @access  Private
export const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404);
    throw new Error('Cliente no encontrado');
  }

  // Asegurarse de que el cliente pertenece al usuario logueado
  if (client.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('No autorizado para ver este cliente');
  }

  res.status(200).json(client);
});

// Opcional: Actualizar un cliente
// @desc    Actualizar un cliente
// @route   PUT /api/clients/:id
// @access  Private
export const updateClient = asyncHandler(async (req, res) => {
  const { name, email, phone, address } = req.body;
  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404);
    throw new Error('Cliente no encontrado');
  }

  // Asegurarse de que el cliente pertenece al usuario logueado
  if (client.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('No autorizado para actualizar este cliente');
  }

  const updatedClient = await Client.findByIdAndUpdate(
    req.params.id,
    { name, email, phone, address }, // Solo actualiza los campos proporcionados
    { new: true, runValidators: true } // `new: true` devuelve el doc actualizado; `runValidators: true` ejecuta las validaciones del esquema
  );

  res.status(200).json(updatedClient);
});

// Opcional: Eliminar un cliente
// @desc    Eliminar un cliente
// @route   DELETE /api/clients/:id
// @access  Private
export const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404);
    throw new Error('Cliente no encontrado');
  }

  // Asegurarse de que el cliente pertenece al usuario logueado
  if (client.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('No autorizado para eliminar este cliente');
  }

  await client.deleteOne();
  res.status(200).json({ message: 'Cliente eliminado exitosamente', id: req.params.id });
});
