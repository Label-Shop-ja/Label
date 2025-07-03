/** @type {import('jest').Config} */
const config = {
  // Indica a Jest que use el entorno de Node.js para las pruebas
  testEnvironment: 'node',

  // Un array de rutas a módulos que se ejecutan antes de cada suite de pruebas.
  // Aquí usamos nuestro archivo de setup para cargar las variables de entorno (.env)
  // y para limpiar la BD antes de cada test.
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Limpia automáticamente los mocks entre cada prueba
  clearMocks: true,

  // Habilita la recolección de cobertura de código
  collectCoverage: true,

  // El directorio donde Jest guardará los reportes de cobertura
  coverageDirectory: 'coverage',

  // Aumenta el tiempo de espera por defecto para las pruebas a 30 segundos.
  // Esto es útil para operaciones asíncronas largas como la conexión a la BD.
  testTimeout: 30000,
};

export default config;