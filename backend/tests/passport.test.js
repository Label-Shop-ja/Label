import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import passport from 'passport';
import User from '../models/userModel.js';
import ExchangeRate from '../models/ExchangeRate.js';

// Importamos la configuración para que se ejecute y registre la estrategia
import '../config/passport-setup.js';

describe('Passport Google Strategy', () => {
  let googleStrategy;

  beforeEach(() => {
    // Obtenemos la estrategia de Google registrada por nuestro `passport-setup.js`
    // El nombre '_passport' es una propiedad interna de passport.
    googleStrategy = passport._strategies.google;
  });

  it('should find and return an existing user by googleId', async () => {
    const mockProfile = { id: '12345', displayName: 'Existing Google User', emails: [{ value: 'google@example.com' }] };
    await User.create({ googleId: '12345', fullName: 'Existing Google User', email: 'google@example.com' });

    const done = jest.fn();
    // Ejecutamos la lógica de verificación de la estrategia directamente
    await googleStrategy._verify(null, null, mockProfile, done);

    // Verificamos que 'done' fue llamado sin error y con el usuario encontrado
    expect(done).toHaveBeenCalledWith(null, expect.objectContaining({ email: 'google@example.com' }));
    expect(done.mock.calls[0][1].googleId).toBe('12345');
  });

  it('should link a googleId to an existing user with the same email', async () => {
    const mockProfile = { id: '67890', displayName: 'Manual User', emails: [{ value: 'manual@example.com' }] };
    // Creamos un usuario que se registró manualmente (sin googleId)
    await User.create({ fullName: 'Manual User', email: 'manual@example.com', password: 'somepassword' });

    const done = jest.fn();
    await googleStrategy._verify(null, null, mockProfile, done);

    // Verificamos que 'done' fue llamado con el usuario actualizado
    expect(done).toHaveBeenCalledWith(null, expect.objectContaining({ email: 'manual@example.com' }));
    
    // Verificamos que el googleId fue añadido a la base de datos
    const updatedUser = await User.findOne({ email: 'manual@example.com' });
    expect(updatedUser.googleId).toBe('67890');
  });

  it('should create a new user if they do not exist', async () => {
    const mockProfile = { id: '11223', displayName: 'New Google User', emails: [{ value: 'new@example.com' }] };

    const done = jest.fn();
    await googleStrategy._verify(null, null, mockProfile, done);

    // Verificamos que 'done' fue llamado con el nuevo usuario
    expect(done).toHaveBeenCalledWith(null, expect.objectContaining({ email: 'new@example.com' }));

    // Verificamos que el usuario fue creado en la BD
    const newUser = await User.findOne({ email: 'new@example.com' });
    expect(newUser).not.toBeNull();
    expect(newUser.googleId).toBe('11223');
  });

  it('should create default exchange rates for a new user created via Google', async () => {
    const mockProfile = { id: '33445', displayName: 'User With Rates', emails: [{ value: 'rates@example.com' }] };

    const done = jest.fn();
    await googleStrategy._verify(null, null, mockProfile, done);

    const newUser = await User.findOne({ email: 'rates@example.com' });
    const rates = await ExchangeRate.findOne({ user: newUser._id });

    expect(rates).not.toBeNull();
    expect(rates.defaultProfitPercentage).toBe(20);
  });

  it('should call done with an error if database operation fails', async () => {
    const mockProfile = { id: 'error-id', displayName: 'Error User', emails: [{ value: 'error@example.com' }] };
    
    // Forzamos un error en la operación de la base de datos
    const findOneSpy = jest.spyOn(User, 'findOne').mockImplementation(() => {
      throw new Error('DB connection lost');
    });

    const done = jest.fn();
    await googleStrategy._verify(null, null, mockProfile, done);

    // Verificamos que 'done' fue llamado con un objeto de error
    expect(done).toHaveBeenCalledWith(expect.any(Error), null);
    expect(done.mock.calls[0][0].message).toBe('DB connection lost');

    findOneSpy.mockRestore(); // Restauramos la función original
  });
});