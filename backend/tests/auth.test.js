import request from 'supertest';
import app from '../app.js'; // Importamos la app de Express, no el server
import mongoose from 'mongoose';
import User from '../models/userModel.js';

describe('Auth API', () => {
  // Test para el registro de usuario
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
    expect(res.body).toHaveProperty('accessToken');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  // Test para evitar registro duplicado
  it('should not register a user with an existing email', async () => {
    // Primero, creamos un usuario
    await User.create({
      fullName: 'Existing User',
      email: 'existing@example.com',
      password: 'password123',
    });

    // Intentamos registrar con el mismo email
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Another User',
        email: 'existing@example.com',
        password: 'password456',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Ya existe un usuario con este correo electrónico.');
  });

  // Test para el login
  it('should login an existing user successfully', async () => {
    // Creamos un usuario para poder loguearnos
    await User.create({
      fullName: 'Login User',
      email: 'login@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'login@example.com');
    expect(res.body).toHaveProperty('accessToken');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  // Test para login con contraseña incorrecta
  it('should not login with incorrect password', async () => {
    await User.create({
      fullName: 'Login User',
      email: 'login@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('Correo electrónico o contraseña inválidos.');
  });
});