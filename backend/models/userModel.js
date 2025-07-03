// C:\Proyectos\Label\backend\models\User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Por favor, ingresa tu nombre completo.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Por favor, ingresa un correo electrónico.'],
    unique: true, // ¡Asegúrate que email es único, no username!
    trim: true,
    match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Por favor, ingresa un correo electrónico válido.'],
  },
  password: {
    type: String,
    // La contraseña no es requerida para permitir inicios de sesión sociales (Google, etc.)
    // La validación de que la contraseña existe se hará en el schema de Yup para el registro manual.
    required: false,
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres.'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Roles permitidos
    default: 'user', // Por defecto, todos son usuarios normales
    required: true,
  },
  refreshToken: {
    type: String,
    default: null
  },
  // Campos para autenticación social
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Permite múltiples documentos con valor null, pero solo uno con un valor específico.
  },
}, {
  timestamps: true,
});

// Encriptar la contraseña antes de guardar el usuario
UserSchema.pre('save', async function (next) {
  // Solo hashear la contraseña si ha sido modificada (o es nueva) Y si existe.
  if (!this.isModified('password') || !this.password) {
    next();
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // Si el usuario no tiene contraseña (ej. se registró con Google), la comparación siempre debe fallar.
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

export default User;
