// C:\Proyectos\Label\backend\models\User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    required: [true, 'Por favor, ingresa una contraseña.'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres.'],
  },
}, {
  timestamps: true,
});

// Encriptar la contraseña antes de guardar el usuario
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);