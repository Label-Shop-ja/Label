// C:\Proyectos\Label\backend\utils\generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, // Por ejemplo, '1h' (1 hora)
  });
};

module.exports = generateToken;