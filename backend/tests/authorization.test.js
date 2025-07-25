import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { authorize } from '../middleware/authMiddleware.js';

describe('Authorization Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {
      user: null, // Se simulará en cada test
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(), // Mockeamos status para capturar el código de error
    };
    nextFunction = jest.fn();
  });

  it('should call next() if user has an allowed role', () => {
    mockRequest.user = { role: 'admin' };
    const adminOnly = authorize('admin');

    adminOnly(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(); // Se llama sin argumentos de error
  });

  it('should call next() if user has one of the multiple allowed roles', () => {
    mockRequest.user = { role: 'user' };
    const userOrAdmin = authorize('user', 'admin');

    userOrAdmin(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('should throw a 403 error if user does not have an allowed role', () => {
    mockRequest.user = { role: 'user' };
    const adminOnly = authorize('admin');

    adminOnly(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    const error = nextFunction.mock.calls[0][0];
    expect(error.message).toContain('no tiene permiso para acceder a este recurso');
  });

  it('should throw a 403 error if req.user is not defined', () => {
    mockRequest.user = null; // Simulamos que el middleware 'protect' no encontró usuario
    const anyRole = authorize('user', 'admin');

    anyRole(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
  });
});