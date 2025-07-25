import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach } from '@jest/globals';

// Carga las variables de entorno del archivo .env para el ambiente de prueba
dotenv.config();

let mongoServer;

// Se ejecuta UNA VEZ antes de que comiencen todas las pruebas en esta suite.
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Se ejecuta UNA VEZ después de que todas las pruebas en esta suite han terminado.
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Se ejecuta ANTES de CADA prueba individual.
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({}); // Borra todos los documentos de la colección
  }
});