/** @type {import('jest').Config} */
const config = {
  // Indica a Jest que use el entorno de Node.js para las pruebas
  testEnvironment: 'node',

  // Un array de rutas a módulos que se ejecutan antes de cada suite de pruebas
  // Aquí usamos nuestro archivo de setup para limpiar la BD
  setupFilesAfterEnv: ['./tests/setup.js'],

  // Limpia automáticamente los mocks entre cada prueba
  clearMocks: true,

  // Habilita la recolección de cobertura de código
  collectCoverage: true,

  // El directorio donde Jest guardará los reportes de cobertura
  coverageDirectory: 'coverage',

  // El proveedor de instrumentación de código a usar para la cobertura
  coverageProvider: 'v8',
};

export default config;
