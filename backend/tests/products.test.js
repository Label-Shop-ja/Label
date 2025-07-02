import request from 'supertest';
import app from '../app.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

describe('Product API', () => {
  let token;
  let userId;

  // Antes de CADA prueba, crea un nuevo usuario y obtén su token.
  // Esto garantiza que cada prueba se ejecute de forma aislada con un usuario limpio.
  beforeEach(async () => {
    // Usamos el endpoint de registro para asegurar que el usuario se crea
    // con toda la configuración asociada (ej. tasas de cambio por defecto).
    const userEmail = `test${Date.now()}@example.com`;
    const userPassword = 'password123';
    const res = await request(app)
      .post('/api/auth/register')
      .send({
      fullName: 'Test User',
      email: userEmail,
      password: userPassword,
      });
    
    token = res.body.accessToken;
    userId = res.body.user._id;
  });

  // --- Pruebas para la creación de productos (POST /api/products) ---
  describe('POST /api/products', () => {
    it('should create a new product for an authenticated user', async () => {
      const newProduct = {
        sku: 'CAM-TEST-001',
        name: 'Camiseta de Prueba',
        category: 'Ropa',
        stock: 100,
        costPrice: 10,
        profitPercentage: 50,
        costCurrency: 'USD',
        saleCurrency: 'USD',
        unitOfMeasure: 'unidad', // CORRECCIÓN: Añadir campo requerido
        displayCurrency: 'USD',  // CORRECCIÓN: Añadir campo requerido
        baseCurrency: 'USD',     // CORRECCIÓN: Añadir campo requerido
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(newProduct);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('name', 'Camiseta de Prueba');
      expect(res.body).toHaveProperty('price', 15); // 10 * (1 + 50/100)
    });

    it('should not create a product if not authenticated', async () => {
      const newProduct = { name: 'Producto no autorizado', category: 'Test' };

      const res = await request(app)
        .post('/api/products')
        .send(newProduct);

      expect(res.statusCode).toEqual(401);
    });
  });

  // --- Pruebas para obtener productos (GET /api/products) ---
  describe('GET /api/products', () => {
    it('should get all products for the authenticated user', async () => {
      // Crea un producto de ejemplo para este usuario específico
      await Product.create({
        user: userId,
        name: 'Producto de prueba para GET',
        sku: 'TEST-SKU-GET', // CORRECCIÓN: Añadir el SKU requerido
        price: 6, // CORRECCIÓN: Añadir precio calculado (5 * 1.2)
        category: 'Test',
        stock: 10,
        costPrice: 5,
        costCurrency: 'USD',
        saleCurrency: 'USD',
        unitOfMeasure: 'unidad',
        displayCurrency: 'USD',
        baseCurrency: 'USD',
      });

      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.products).toBeInstanceOf(Array);
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0].name).toBe('Producto de prueba para GET');
    });

    it('should not get products if not authenticated', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toEqual(401);
    });
  });

  // Puedes añadir más `describe` bloques para PUT, DELETE, etc.
  // Ejemplo para GET /api/products/:id
  describe('GET /api/products/:id', () => {
    it('should get a single product by its ID', async () => {
      const product = await Product.create({
        user: userId,
        name: 'Producto Individual',
        sku: 'TEST-SKU-SINGLE',
        price: 1.5, // CORRECCIÓN: Añadir precio
        category: 'Single',
        costPrice: 1,
        unitOfMeasure: 'unidad',
        displayCurrency: 'USD',
        baseCurrency: 'USD',
        saleCurrency: 'USD',
        stock: 1,
      });

      const res = await request(app)
        .get(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Producto Individual');
    });
  });
});