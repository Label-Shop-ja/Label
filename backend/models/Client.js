// C:\Proyectos\Label\backend\models\Client.js
import mongoose from 'mongoose';

const clientSchema = mongoose.Schema(
  {
    user: { // Para vincular el cliente al usuario de la aplicación (el dueño del negocio)
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Por favor, añade el nombre completo del cliente'],
      trim: true,
    },
    email: {
      type: String,
      required: false, // El email podría ser opcional
      unique: false, // No es necesario que sea único globalmente, solo por usuario
      match: [/.+@.+\..+/, 'Por favor, usa un email válido'], // Validación básica de email
    },
    phone: {
      type: String,
      required: false, // El teléfono también puede ser opcional
      trim: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    // Puedes añadir más campos aquí, por ejemplo:
    // loyaltyPoints: { type: Number, default: 0 },
    // lastPurchaseDate: { type: Date },
  },
  {
    timestamps: true, // Añade `createdAt` y `updatedAt` automáticamente
  }
);

export default mongoose.model('Client', clientSchema);