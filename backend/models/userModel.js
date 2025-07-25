// C:\Proyectos\Label\backend\models\User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import ExchangeRate from './ExchangeRate.js';

const UserSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Mongoose convertirá automáticamente a minúsculas
    },
    password: {
      type: String,
      // No es 'required' para permitir el login con Google/OAuth
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'admin'],
      default: 'user',
    },
    googleId: {
      type: String,
    },
    // Nuevos campos para el reseteo de contraseña
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Encriptar la contraseña antes de guardar el usuario
UserSchema.pre('save', async function (next) {
  // Solo hashear la contraseña si ha sido modificada (o es nueva) y si existe
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // Si el usuario no tiene contraseña (login social), no puede coincidir.
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- MÉTODO ESTÁTICO ---
// Este es el método que centraliza la creación de usuarios
UserSchema.statics.createUserWithDefaults = async function (userData) {
  const user = await this.create(userData);

  if (user) {
    // Crea una configuración de tasas por defecto para el nuevo usuario.
    await ExchangeRate.create({
      user: user._id,
      conversions: [
        { fromCurrency: 'USD', toCurrency: 'VES', rate: 40.0, lastUpdated: new Date() },
        { fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.1, lastUpdated: new Date() },
      ],
      defaultProfitPercentage: 20,
    });
  }

  return user;
};


const User = mongoose.model('User', UserSchema);

export default User;
