export default {
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'], // Preload environment variables
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 30000, // Aumentar el timeout por si la DB en memoria tarda en arrancar
};