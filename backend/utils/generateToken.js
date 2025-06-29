import jwt from 'jsonwebtoken';

// Genera un Access Token (corta duración)
export const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m', // Por ejemplo, 15 minutos
  });
};

// Genera un Refresh Token (larga duración)
export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d', // Por ejemplo, 7 días
  });
};