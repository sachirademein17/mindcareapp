// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'mental_health_test';
process.env.DB_USER = 'testuser';
process.env.DB_PASSWORD = 'testpassword';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGO_URI = 'mongodb://localhost:27017/mental_health_test';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
const mockConsole = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
global.console = mockConsole;

// Setup database connection mocks
jest.mock('../src/config/postgres.config', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
  }
}));

beforeAll(async () => {
  // Database setup before all tests
});

afterAll(async () => {
  // Cleanup after all tests
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});
