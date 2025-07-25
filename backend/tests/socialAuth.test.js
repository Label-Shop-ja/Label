import request from 'supertest';
import app from '../app.js';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getAuthStatus } from '../controllers/authController.js';
import mongoose from 'mongoose';

describe('Social Authentication API', () => {
  // --- Prueba de Integración para la Redirección ---
  describe('GET /api/auth/google', () => {
    it('should redirect to the Google OAuth consent screen', async () => {
      const res = await request(app).get('/api/auth/google');

      // 1. Verificamos que la respuesta sea una redirección (código 302)
      expect(res.statusCode).toBe(302);

      // 2. Verificamos que la URL de redirección sea la de Google
      expect(res.headers.location).toContain('accounts.google.com/o/oauth2/v2/auth');
    });
  });

  // --- Pruebas Unitarias para el Controlador de Estado ---
  describe('getAuthStatus Controller', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;

    beforeEach(() => {
      // Creamos objetos mock para simular la petición y la respuesta de Express
      mockRequest = {};
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      };
      nextFunction = jest.fn();
    });

    it('should return user data and tokens if authenticated', async () => {
      // Simulamos un usuario autenticado por Passport
      mockRequest.isAuthenticated = jest.fn().mockReturnValue(true);
      mockRequest.user = {
        _id: new mongoose.Types.ObjectId(),
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      // Ejecutamos el controlador directamente
      await getAuthStatus(mockRequest, mockResponse, nextFunction);

      // 1. Verificamos que se estableció la cookie del refresh token
      expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', expect.any(String), expect.any(Object));

      // 2. Verificamos que la respuesta sea exitosa (código 200)
      expect(mockResponse.status).toHaveBeenCalledWith(200);

      // 3. Verificamos que la respuesta JSON contenga los datos esperados
      expect(mockResponse.json).toHaveBeenCalledWith({
        isAuthenticated: true,
        user: {
          _id: mockRequest.user._id,
          fullName: 'Test User',
          email: 'test@example.com',
          role: 'user',
        },
        accessToken: expect.any(String),
      });

      // 4. Verificamos que la función `next` no haya sido llamada con un error
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with an error if not authenticated', async () => {
      // Simulamos un usuario NO autenticado
      mockRequest.isAuthenticated = jest.fn().mockReturnValue(false);

      // Ejecutamos el controlador
      await getAuthStatus(mockRequest, mockResponse, nextFunction);

      // Verificamos que el middleware de error fue invocado con un objeto Error
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
      expect(nextFunction.mock.calls[0][0].message).toBe('Usuario no autenticado');
    });
  });
});