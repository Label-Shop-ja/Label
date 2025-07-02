import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import ExchangeRate from '../models/ExchangeRate.js';

describe('Product API', () => {
  let token;
  let userId;

  // Antes de CADA prueba, crea un nuevo usuario y obtén su token.
  // Esto garantiza que cada prueba se ejecute de forma aislada con un usuario limpio.
  beforeEach(async () => {
    // Usamos el endpoint de registro para asegurar que el usuario se crea
    // con toda la configuración asociada (ej. tasas de cambio por defecto).
    const userEmail = `test-${Date.now()}@example.com`;
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
        unitOfMeasure: 'unidad',
        displayCurrency: 'USD',
        baseCurrency: 'USD',
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
        sku: 'TEST-SKU-GET',
        category: 'Test',
        stock: 10,
        costPrice: 5,
        profitPercentage: 20, // El hook pre-save necesita esto
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
        category: 'Single',
        costPrice: 1,
        profitPercentage: 50, // El hook pre-save necesita esto
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

  // --- Pruebas para actualizar un producto (PUT /api/products/:id) ---
  describe('PUT /api/products/:id', () => {
    it('should update a product successfully', async () => {
      // 1. Crear un producto para tener algo que actualizar
      const product = await Product.create({
        user: userId,
        name: 'Producto Original',
        sku: 'ORIGINAL-SKU',
        category: 'Original',
        costPrice: 50,
        profitPercentage: 50, // El precio de venta inicial será 75
        stock: 10,
        costCurrency: 'USD',
        saleCurrency: 'USD',
        unitOfMeasure: 'unidad',
        displayCurrency: 'USD',
        baseCurrency: 'USD',
      });

      const updatedData = {
        name: 'Producto Actualizado',
        costPrice: 60,
        profitPercentage: 100, // El nuevo precio de venta debería ser 120
      };

      // 2. Enviar la petición de actualización
      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      // 3. Verificar la respuesta
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('Producto Actualizado');
      expect(res.body.price).toBe(120); // 60 * (1 + 100/100)
    });
  });

  // --- Pruebas para eliminar un producto (DELETE /api/products/:id) ---
  describe('DELETE /api/products/:id', () => {
    it('should delete a product successfully', async () => {
      // 1. Crear un producto para eliminar
      const product = await Product.create({
        user: userId,
        name: 'Producto a Eliminar',
        sku: 'DELETE-SKU',
        category: 'Temporal',
        costPrice: 10,
        profitPercentage: 10,
        stock: 5,
        costCurrency: 'USD',
        saleCurrency: 'USD',
        unitOfMeasure: 'unidad',
        displayCurrency: 'USD',
        baseCurrency: 'USD',
      });

      // 2. Enviar la petición de eliminación
      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${token}`);

      // 3. Verificar la respuesta
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Producto eliminado exitosamente.');

      // 4. Verificar que el producto ya no existe en la BD
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });
  });

  // --- Pruebas para Alertas y Reportes ---
  describe('GET /api/products/alerts and reports', () => {
    it('should get low stock products', async () => {
      // Crear un producto con stock bajo
      await Product.create({
        user: userId,
        name: 'Producto con Stock Bajo',
        sku: 'LOW-STOCK-01',
        category: 'Alertas',
        stock: 5,
        reorderThreshold: 10, // Stock (5) es menor que el umbral (10)
        costPrice: 1,
        profitPercentage: 10,
        costCurrency: 'USD',
        saleCurrency: 'USD',
        unitOfMeasure: 'unidad',
        displayCurrency: 'USD',
        baseCurrency: 'USD',
      });

      const res = await request(app)
        .get('/api/products/alerts/low-stock')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Producto con Stock Bajo');
    });

    it('should get high stock products (perishables)', async () => {
      // Crear un producto perecedero con stock alto
      await Product.create({
        user: userId,
        name: 'Producto Perecedero con Stock Alto',
        sku: 'HIGH-STOCK-01',
        category: 'Alertas',
        isPerishable: true,
        stock: 100,
        optimalMaxStock: 50, // Stock (100) es mayor que el óptimo (50)
        costPrice: 1,
        profitPercentage: 10,
        costCurrency: 'USD',
        saleCurrency: 'USD',
        unitOfMeasure: 'unidad',
        displayCurrency: 'USD',
        baseCurrency: 'USD',
      });

      const res = await request(app)
        .get('/api/products/alerts/high-stock')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Producto Perecedero con Stock Alto');
    });

    it('should get the variant inventory report', async () => {
      // Crear un producto con variantes para el reporte
      await Product.create({
        user: userId,
        name: 'Producto con Variantes para Reporte',
        sku: 'REPORT-PROD-01',
        category: 'Reportes',
        variants: [
          { name: 'Rojo', sku: 'REP-01-R', costPrice: 10, stock: 5, profitPercentage: 50, unitOfMeasure: 'unidad', costCurrency: 'USD', saleCurrency: 'USD' },
          { name: 'Azul', sku: 'REP-01-A', costPrice: 12, stock: 8, profitPercentage: 50, unitOfMeasure: 'unidad', costCurrency: 'USD', saleCurrency: 'USD' },
        ]
      });

      const res = await request(app)
        .get('/api/products/reports/variants')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('totalCostValue', 50); // 10 * 5
      expect(res.body[1]).toHaveProperty('totalSaleValue', 144); // (12 * 1.5) * 8 = 144
    });
  });
});