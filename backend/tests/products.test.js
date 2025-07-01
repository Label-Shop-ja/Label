import request from 'supertest';
import app from '../app.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import ExchangeRate from '../models/ExchangeRate.js';

describe('Product API', () => {
  let token;
  let userId;

  // Antes de todas las pruebas de productos, creamos un usuario y nos logueamos
  // para tener un token de autenticación válido.
  beforeAll(async () => {
    const userResponse = await request(app).post('/api/auth/register').send({
      fullName: 'Product Test User',
      email: 'product.test@example.com',
      password: 'password123',
    });

    token = userResponse.body.accessToken;
    userId = userResponse.body.user._id;

    // ¡CRÍTICO! El controlador de productos necesita una configuración de tasas
    // para calcular los precios. La creamos aquí para nuestro usuario de prueba.
    await ExchangeRate.create({
      user: userId,
      conversions: [
        { fromCurrency: 'USD', toCurrency: 'VES', rate: 36.5 },
        { fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.92 },
        { fromCurrency: 'USD', toCurrency: 'USD', rate: 1 }, // ¡Añadir la conversión a sí mismo!
      ],
      defaultProfitPercentage: 20, // 20% de ganancia por defecto
    });
  });

  // Test para crear un producto (ruta protegida)
  it('should create a new product for an authenticated user', async () => {
    const newProduct = {
      name: 'Harina P.A.N.',
      sku: 'HARINA-PAN-1KG',
      category: 'Alimentos',
      costPrice: 1.0, // Costo de 1 USD
      costCurrency: 'USD',
      saleCurrency: 'USD',
      profitPercentage: 50, // Queremos un 50% de ganancia
      stock: 100,
      unitOfMeasure: 'unidad',
    };

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`) // ¡Enviamos el token!
      .send(newProduct);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'Harina P.A.N.');
    expect(res.body).toHaveProperty('sku', 'HARINA-PAN-1KG');
    // Verificamos que el precio de venta se calculó correctamente (1.0 * 1.50 = 1.50)
    expect(res.body).toHaveProperty('price', 1.5);
  });

  // Test para evitar crear un producto sin token
  it('should not create a product if not authenticated', async () => {
    const newProduct = {
      name: 'Producto Fantasma',
      sku: 'FANTASMA-01',
      category: 'Otros',
      costPrice: 10,
      stock: 10,
      unitOfMeasure: 'unidad',
    };

    const res = await request(app)
      .post('/api/products')
      // No enviamos el token a propósito
      .send(newProduct);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('No autorizado, no se encontró un token');
  });

  // Test para obtener los productos del usuario
  it('should get all products for the authenticated user', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('products');
    // Deberíamos tener solo 1 producto, el que creamos en el test anterior
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('Harina P.A.N.');
  });

  // Test para evitar que un usuario vea los productos de otro (aunque no tenemos otro usuario aquí, probamos el no estar logueado)
  it('should not get products if not authenticated', async () => {
    const res = await request(app).get('/api/products');

    expect(res.statusCode).toEqual(401);
  });
});