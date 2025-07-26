// Enhanced Jest Configuration for Backend Testing
// Mental Health Platform - Healthcare-Focused Testing

module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',
  
  // Node.js environment for backend testing
  testEnvironment: 'node',
  
  // Test file locations
  roots: [
    '<rootDir>/src',
    '<rootDir>/tests'
  ],
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  
  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: false
    }]
  },
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts'
  ],
  
  // Module name mapping for imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/app.ts',
    '!src/config/**',
    '!src/migrations/**',
    '!src/seeders/**',
    '!**/node_modules/**'
  ],
  
  // Coverage thresholds - Healthcare requires high coverage
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    // Critical components require higher coverage
    './src/controllers/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/models/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  
  // Coverage output directory
  coverageDirectory: '<rootDir>/coverage',
  
  // Global test timeout (increased for healthcare complexity)
  testTimeout: 30000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Reset modules between tests
  resetModules: true,
  
  // Test environment options
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // Module file extensions
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$'
  ],
  
  // Verbose output for healthcare compliance
  verbose: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Maximum number of concurrent tests
  maxConcurrency: 5,
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Error on deprecated features
  errorOnDeprecated: true
};
