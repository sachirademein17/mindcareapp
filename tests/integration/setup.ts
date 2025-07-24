// Integration test setup file
import fetch from 'node-fetch';

// Make fetch available globally
(global as any).fetch = fetch;

// Mock environment variables for integration tests
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'mental_health_integration_test';
process.env.DB_USER = 'testuser';
process.env.DB_PASSWORD = 'testpassword';
process.env.JWT_SECRET = 'integration-test-jwt-secret';
process.env.MONGO_URI = 'mongodb://localhost:27017/mental_health_integration_test';

// Global test timeout
jest.setTimeout(30000);

beforeAll(async () => {
  // Global setup for integration tests
  console.log('Starting integration tests...');
});

afterAll(async () => {
  // Global cleanup for integration tests
  console.log('Integration tests completed.');
});

beforeEach(() => {
  // Clear all mocks before each integration test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each integration test
});
