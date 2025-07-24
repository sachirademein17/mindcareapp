// Jest Test Setup File
// This file runs before all tests

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test configuration
jest.setTimeout(30000);

// Mock fetch for Node.js environment - skip for now
// global.fetch will be available in Node 18+

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.API_URL = 'http://localhost:5000';
process.env.FRONTEND_URL = 'http://localhost:5173';

// Global test utilities
global.testUtils = {
  // Helper for generating test user data
  createTestUser: () => ({
    email: `test${Date.now()}@example.com`,
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'User'
  }),
  
  // Helper for generating test mood data
  createTestMood: () => ({
    rating: Math.floor(Math.random() * 10) + 1,
    notes: 'Test mood entry',
    date: new Date().toISOString()
  }),
  
  // Helper for waiting
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper for generating random strings
  randomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  }
};
