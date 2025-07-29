import request from 'supertest';
import app from '../app.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Sale from '../models/Sale.js';
import Transaction from '../models/Transaction.js';
import InventoryLog from '../models/InventoryLog.js';
import { setupTestDB, teardownTestDB } from './setup.js';
import mongoose from 'mongoose';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('POST /api/sales - Creación de Ventas', () => {
  let testUser, accessToken, product1, productWithVariants;

  beforeEach(async () => {
    // Limpiar colecciones
    await User.deleteMany({});
    await Product.deleteMany({});
    await Sale.deleteMany({});
    await Transaction.deleteMany({});
    await InventoryLog.deleteMany({});

    // Crear usuario de prueba
    testUser = await User.create({
      fullName: 'Vendedor de Prueba',
      email: 'vendedor@test.com',
      password: 'password123',
    });

    // Iniciar sesión para obtener token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'vendedor@test.com', password: 'password123' });
    accessToken = loginRes.body.accessToken;

    // Crear productos de prueba
    product1 = await Product.create({
      user: testUser._id,
      name: 'Producto Simple',
      sku: 'SIMPLE-001',
      stock: 20,
      costPrice: 10,
      price: 25,
      costCurrency: 'USD',
      saleCurrency: 'USD',
    });

    productWithVariants = await Product.create({
      user: testUser._id,
      name: 'Producto con Variantes',
      sku: 'VAR-PROD-001',
      stock: 0, // El stock principal es 0, se maneja en las variantes
      costPrice: 0,
      price: 0,
      variants: [
        { name: 'Rojo', sku: 'VAR-001-RED', stock: 15, costPrice: 12, price: 30, costCurrency: 'USD', saleCurrency: 'USD' },
        { name: 'Azul', sku: 'VAR-001-BLUE', stock: 10, costPrice: 12, price: 30, costCurrency: 'USD', saleCurrency: 'USD' },
      ],
    });
  });

  it('debería crear una venta exitosa y descontar el stock correctamente', async () => {
    const salePayload = {
      productsSold: [{ product: product1._id, quantity: 5 }],
      paymentMethod: 'cash',
      customerName: 'Cliente Contado',
    };

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(salePayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.sale).toBeDefined();
    expect(res.body.sale.totalAmount).toBe(125); // 5 * 25

    // Verificar que el stock se descontó
    const updatedProduct = await Product.findById(product1._id);
    expect(updatedProduct.stock).toBe(15);

    // Verificar que se creó la transacción y el log
    const transaction = await Transaction.findById(res.body.sale.financialTransaction);
    expect(transaction).toBeDefined();
    expect(transaction.amount).toBe(125);
    const log = await InventoryLog.findOne({ relatedSale: res.body.sale._id });
    expect(log).toBeDefined();
    expect(log.quantityChange).toBe(5);
    expect(log.finalStock).toBe(15);
  });

  it('debería crear una venta exitosa con una variante y descontar el stock de la variante', async () => {
    const variantToSell = productWithVariants.variants[0]; // Variante Roja
    const salePayload = {
      productsSold: [{ product: productWithVariants._id, variantId: variantToSell._id, quantity: 3 }],
      paymentMethod: 'card',
    };

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(salePayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.sale.totalAmount).toBe(90); // 3 * 30

    // Verificar que el stock de la variante se descontó
    const updatedProduct = await Product.findById(productWithVariants._id);
    expect(updatedProduct.variants.id(variantToSell._id).stock).toBe(12);
    expect(updatedProduct.variants[1].stock).toBe(10); // La otra variante no debe cambiar
  });

  it('debería fallar y revertir la transacción si el stock es insuficiente', async () => {
    const salePayload = {
      productsSold: [{ product: product1._id, quantity: 25 }], // Pide más de lo que hay
      paymentMethod: 'cash',
    };

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(salePayload);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Stock insuficiente');

    // Verificar que NADA cambió en la BD (rollback)
    const originalProduct = await Product.findById(product1._id);
    expect(originalProduct.stock).toBe(20); // El stock no debe haber cambiado

    const salesCount = await Sale.countDocuments();
    expect(salesCount).toBe(0);

    const transactionsCount = await Transaction.countDocuments();
    expect(transactionsCount).toBe(0);
  });

  it('debería fallar y revertir si un producto en la venta no existe', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const salePayload = {
      productsSold: [
        { product: product1._id, quantity: 2 }, // Producto válido
        { product: nonExistentId, quantity: 1 }, // Producto inválido
      ],
      paymentMethod: 'cash',
    };

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(salePayload);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toContain('no encontrado');

    // Verificar que el stock del producto VÁLIDO no cambió
    const originalProduct = await Product.findById(product1._id);
    expect(originalProduct.stock).toBe(20);

    const salesCount = await Sale.countDocuments();
    expect(salesCount).toBe(0);
  });
});

