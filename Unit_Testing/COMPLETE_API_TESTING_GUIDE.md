# 🧪 Complete API Testing Guide - Mental Health Platform

## 📋 Table of Contents
1. [API Testing Strategy](#api-testing-strategy)
2. [Testing Tools & Setup](#testing-tools--setup)
3. [Authentication Testing](#authentication-testing)
4. [Healthcare-Specific API Testing](#healthcare-specific-api-testing)
5. [End-to-End API Testing](#end-to-end-api-testing)
6. [Security Testing](#security-testing)
7. [Performance Testing](#performance-testing)
8. [Best Practices](#best-practices)

---

## 🎯 API Testing Strategy

### Your Mental Health Platform API Structure
Based on your codebase, here are the main API endpoints to test:

```
📱 Authentication APIs:
├── POST /auth/patient/signup
├── POST /auth/patient/login
├── POST /auth/doctor/signup
├── POST /auth/doctor/login
└── POST /auth/admin/login

🏥 Patient APIs:
├── GET /patient/enrollments
├── POST /patient/enroll/:doctorId
├── GET /patient/prescriptions
├── DELETE /patient/enrollment/:enrollmentId
└── POST /patient/security-violation

👩‍⚕️ Doctor APIs:
├── GET /doctor/enrollments
├── GET /doctor/pending-enrollments
├── POST /doctor/prescription
├── PATCH /doctor/enrollment/:id/approve
└── PATCH /doctor/enrollment/:id/reject

👑 Admin APIs:
├── GET /admin/users
├── PUT /admin/approve-doctor/:id
└── DELETE /admin/user/:id

💬 Chat APIs:
├── POST /api/chat/send/:userId
├── GET /api/chat/messages/:userId
├── GET /api/chat/list
└── PUT /api/chat/read/:userId

👤 User APIs:
├── GET /user/profile
├── PUT /user/profile
├── PUT /user/change-password
└── DELETE /user/account
```

---

## 🔧 Testing Tools & Setup

### 1. **Supertest + Jest (Recommended for Unit/Integration)**

```javascript
// backend/tests/api/patient.api.test.ts
import request from 'supertest';
import express from 'express';
import { app } from '../../src/app';

describe('Patient API Tests', () => {
  let authToken: string;
  let patientId: number;

  beforeAll(async () => {
    // Setup test database
    await setupTestDB();
    
    // Create test patient and get token
    const response = await request(app)
      .post('/auth/patient/signup')
      .send({
        name: 'Test Patient',
        email: 'patient@test.com',
        password: 'TestPass123!',
        nic: '123456789V',
        gender: 'female',
        dob: '1990-01-01',
        phone: '+94771234567'
      });
    
    authToken = response.body.token;
    patientId = response.body.user.id;
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  describe('GET /patient/enrollments', () => {
    it('should return patient enrollments', async () => {
      const response = await request(app)
        .get('/patient/enrollments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/patient/enrollments')
        .expect(401);
    });
  });
});
```

### 2. **Playwright for E2E API Testing**

```typescript
// tests/api/auth.api.test.ts
import { test, expect, APIRequestContext } from '@playwright/test';

let apiContext: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: 'http://localhost:5000'
  });
});

test.describe('Authentication API Flow', () => {
  test('Complete patient registration and login flow', async () => {
    // 1. Register patient
    const signupResponse = await apiContext.post('/auth/patient/signup', {
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        nic: '987654321V',
        gender: 'male',
        dob: '1985-06-15',
        phone: '+94777123456'
      }
    });

    expect(signupResponse.ok()).toBeTruthy();
    const signupData = await signupResponse.json();
    expect(signupData.token).toBeDefined();

    // 2. Login with same credentials
    const loginResponse = await apiContext.post('/auth/patient/login', {
      data: {
        email: 'john.doe@example.com',
        password: 'SecurePass123!'
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData.token).toBeDefined();

    // 3. Access protected route
    const profileResponse = await apiContext.get('/user/profile', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    expect(profileResponse.ok()).toBeTruthy();
    const profileData = await profileResponse.json();
    expect(profileData.email).toBe('john.doe@example.com');
  });
});
```

### 3. **Postman/Newman for Manual & CI Testing**

```json
{
  "info": {
    "name": "Mental Health Platform API",
    "description": "Complete API test collection"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{auth_token}}",
        "type": "string"
      }
    ]
  },
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "exec": [
          "// Auto-login before protected requests",
          "if (!pm.collectionVariables.get('auth_token')) {",
          "    pm.sendRequest({",
          "        url: pm.environment.get('base_url') + '/auth/patient/login',",
          "        method: 'POST',",
          "        header: {'Content-Type': 'application/json'},",
          "        body: {",
          "            mode: 'raw',",
          "            raw: JSON.stringify({",
          "                email: pm.environment.get('test_email'),",
          "                password: pm.environment.get('test_password')",
          "            })",
          "        }",
          "    }, (err, res) => {",
          "        if (!err) {",
          "            const token = res.json().token;",
          "            pm.collectionVariables.set('auth_token', token);",
          "        }",
          "    });",
          "}"
        ]
      }
    }
  ]
}
```

---

## 🔐 Authentication Testing

### Testing JWT Authentication Flow

```typescript
// tests/api/auth.security.test.ts
describe('Authentication Security Tests', () => {
  describe('JWT Token Validation', () => {
    it('should reject expired tokens', async () => {
      // Create expired token
      const expiredToken = jwt.sign(
        { id: 1, role: 'patient' }, 
        process.env.JWT_SECRET!, 
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/user/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);

      expect(response.body.error).toContain('token');
    });

    it('should reject malformed tokens', async () => {
      const response = await request(app)
        .get('/user/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });

    it('should require proper role for protected routes', async () => {
      // Patient trying to access doctor route
      const patientToken = await getValidToken('patient');
      
      const response = await request(app)
        .get('/doctor/pending-enrollments')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(403);

      expect(response.body.error).toContain('Access denied');
    });
  });

  describe('Password Security', () => {
    it('should enforce strong passwords', async () => {
      const weakPasswords = [
        '123456',
        'password',
        'admin',
        'test',
        '12345678'
      ];

      for (const weakPassword of weakPasswords) {
        const response = await request(app)
          .post('/auth/patient/signup')
          .send({
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: weakPassword,
            nic: '123456789V',
            gender: 'other',
            dob: '1990-01-01',
            phone: '+94771234567'
          });

        // Should reject weak passwords
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('password');
      }
    });
  });
});
```

### Sri Lankan Healthcare-Specific Testing

```typescript
// tests/api/srilanka.validation.test.ts
describe('Sri Lankan Healthcare Validations', () => {
  describe('NIC Validation', () => {
    it('should validate old NIC format (123456789V)', async () => {
      const response = await request(app)
        .post('/auth/patient/signup')
        .send({
          name: 'Test Patient',
          email: 'test@example.com',
          password: 'SecurePass123!',
          nic: '901234567V', // Valid old format
          gender: 'female',
          dob: '1990-05-15',
          phone: '+94771234567'
        });

      expect(response.status).toBe(201);
    });

    it('should validate new NIC format (200012345678)', async () => {
      const response = await request(app)
        .post('/auth/patient/signup')
        .send({
          name: 'Test Patient',
          email: 'test2@example.com',
          password: 'SecurePass123!',
          nic: '200012345678', // Valid new format
          gender: 'male',
          dob: '2000-05-15',
          phone: '+94771234567'
        });

      expect(response.status).toBe(201);
    });

    it('should reject invalid NIC formats', async () => {
      const invalidNICs = [
        '12345',           // Too short
        '123456789X',      // Invalid letter
        '20001234567890',  // Too long
        'ABCD12345V'       // Invalid characters
      ];

      for (const invalidNIC of invalidNICs) {
        const response = await request(app)
          .post('/auth/patient/signup')
          .send({
            name: 'Test Patient',
            email: `test${Date.now()}@example.com`,
            password: 'SecurePass123!',
            nic: invalidNIC,
            gender: 'other',
            dob: '1990-01-01',
            phone: '+94771234567'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('NIC');
      }
    });
  });

  describe('Phone Number Validation', () => {
    it('should validate Sri Lankan mobile numbers', async () => {
      const validNumbers = [
        '+94771234567',
        '+94701234567',
        '+94751234567',
        '0771234567',
        '94771234567'
      ];

      for (const phone of validNumbers) {
        const response = await request(app)
          .post('/auth/patient/signup')
          .send({
            name: 'Test Patient',
            email: `test${Date.now()}@example.com`,
            password: 'SecurePass123!',
            nic: `${Math.random().toString(36).substring(7)}V`,
            gender: 'other',
            dob: '1990-01-01',
            phone: phone
          });

        expect(response.status).toBe(201);
      }
    });
  });
});
```

---

## 🏥 Healthcare-Specific API Testing

### HIPAA Compliance Testing

```typescript
// tests/api/hipaa.compliance.test.ts
describe('HIPAA Compliance API Tests', () => {
  describe('Data Access Logging', () => {
    it('should log all patient data access', async () => {
      const patientToken = await getValidToken('patient');
      const logSpy = jest.spyOn(console, 'log');

      await request(app)
        .get('/patient/prescriptions')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Patient data accessed')
      );
    });

    it('should log security violations', async () => {
      const patientToken = await getValidToken('patient');

      const response = await request(app)
        .post('/patient/security-violation')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          violationType: 'unauthorized_access_attempt',
          timestamp: new Date().toISOString(),
          userAgent: 'Test Browser'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('logged');
    });
  });

  describe('Data Minimization', () => {
    it('should not return sensitive data in user lists', async () => {
      const adminToken = await getValidToken('admin');

      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      
      // Check that passwords are not included
      response.body.forEach((user: any) => {
        expect(user.password).toBeUndefined();
        expect(user).not.toHaveProperty('password');
      });
    });
  });

  describe('Prescription Security', () => {
    it('should only allow doctors to issue prescriptions', async () => {
      const patientToken = await getValidToken('patient');

      const response = await request(app)
        .post('/doctor/prescription')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          enrollmentId: 1,
          notes: 'Test prescription'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Access denied');
    });

    it('should validate prescription data', async () => {
      const doctorToken = await getValidToken('doctor');

      const response = await request(app)
        .post('/doctor/prescription')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          // Missing enrollmentId
          notes: 'Test prescription'
        });

      expect(response.status).toBe(400);
    });
  });
});
```

### Doctor-Patient Enrollment Testing

```typescript
// tests/api/enrollment.test.ts
describe('Doctor-Patient Enrollment API', () => {
  let patientToken: string;
  let doctorToken: string;
  let doctorId: number;

  beforeAll(async () => {
    // Setup test users
    patientToken = await getValidToken('patient');
    doctorToken = await getValidToken('doctor');
    doctorId = await getDoctorId();
  });

  describe('Enrollment Process', () => {
    it('should allow patient to enroll with approved doctor', async () => {
      const response = await request(app)
        .post(`/patient/enroll/${doctorId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(201);

      expect(response.body.message).toContain('enrolled');
      expect(response.body.enrollment).toBeDefined();
    });

    it('should show pending enrollment to doctor', async () => {
      const response = await request(app)
        .get('/doctor/pending-enrollments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should allow doctor to approve enrollment', async () => {
      // Get pending enrollment
      const pendingResponse = await request(app)
        .get('/doctor/pending-enrollments')
        .set('Authorization', `Bearer ${doctorToken}`);

      const enrollmentId = pendingResponse.body[0].id;

      const response = await request(app)
        .patch(`/doctor/enrollment/${enrollmentId}/approve`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.message).toContain('approved');
    });
  });

  describe('Enrollment Security', () => {
    it('should prevent duplicate enrollments', async () => {
      // Try to enroll again with same doctor
      const response = await request(app)
        .post(`/patient/enroll/${doctorId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(400);

      expect(response.body.error).toContain('already enrolled');
    });

    it('should prevent enrollment with unapproved doctor', async () => {
      const unapprovedDoctorId = await createUnapprovedDoctor();

      const response = await request(app)
        .post(`/patient/enroll/${unapprovedDoctorId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });
});
```

---

## 🔒 Security Testing

### Input Validation & Sanitization

```typescript
// tests/api/security.validation.test.ts
describe('API Security Validation Tests', () => {
  describe('XSS Protection', () => {
    it('should sanitize user input to prevent XSS', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/auth/patient/signup')
        .send({
          name: maliciousInput,
          email: 'test@example.com',
          password: 'SecurePass123!',
          nic: '123456789V',
          gender: 'other',
          dob: '1990-01-01',
          phone: '+94771234567'
        });

      if (response.status === 201) {
        // If registration succeeds, check that script tags are sanitized
        expect(response.body.user.name).not.toContain('<script>');
        expect(response.body.user.name).not.toContain('alert');
      } else {
        // Or registration should be rejected
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid');
      }
    });
  });

  describe('SQL Injection Protection', () => {
    it('should prevent SQL injection in login', async () => {
      const sqlInjection = "admin@test.com'; DROP TABLE users; --";

      const response = await request(app)
        .post('/auth/patient/login')
        .send({
          email: sqlInjection,
          password: 'anything'
        });

      // Should not crash the server
      expect(response.status).toBeOneOf([400, 401]);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Make multiple failed login attempts
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .post('/auth/patient/login')
          .send(loginData)
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
```

### File Upload Security

```typescript
// tests/api/upload.security.test.ts
describe('File Upload Security', () => {
  describe('Doctor CV Upload', () => {
    it('should only accept PDF files for CV', async () => {
      const maliciousFile = Buffer.from('<?php echo "malicious code"; ?>');

      const response = await request(app)
        .post('/auth/doctor/signup')
        .field('fullName', 'Dr. Test')
        .field('email', 'doctor@test.com')
        .field('password', 'SecurePass123!')
        .field('nic', '123456789V')
        .field('specialization', 'General Medicine')
        .field('gender', 'male')
        .field('location', 'Colombo')
        .field('languages', 'English, Sinhala')
        .attach('cv', maliciousFile, 'malicious.php');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('file');
    });

    it('should limit file size', async () => {
      // Create a large file buffer (> 5MB)
      const largeFile = Buffer.alloc(6 * 1024 * 1024, 'a');

      const response = await request(app)
        .post('/auth/doctor/signup')
        .field('fullName', 'Dr. Test')
        .field('email', 'doctor@test.com')
        .field('password', 'SecurePass123!')
        .field('nic', '123456789V')
        .field('specialization', 'General Medicine')
        .field('gender', 'male')
        .field('location', 'Colombo')
        .field('languages', 'English, Sinhala')
        .attach('cv', largeFile, 'large.pdf');

      expect(response.status).toBe(413); // Payload too large
    });
  });
});
```

---

## ⚡ Performance Testing

### Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "Patient Login Flow"
    weight: 70
    flow:
      - post:
          url: "/auth/patient/login"
          json:
            email: "patient{{ $randomNumber() }}@test.com"
            password: "TestPass123!"
          capture:
            - json: "$.token"
              as: "authToken"
      - get:
          url: "/patient/enrollments"
          headers:
            Authorization: "Bearer {{ authToken }}"

  - name: "Doctor Dashboard"
    weight: 30
    flow:
      - post:
          url: "/auth/doctor/login"
          json:
            email: "doctor{{ $randomNumber() }}@test.com"
            password: "TestPass123!"
          capture:
            - json: "$.token"
              as: "authToken"
      - get:
          url: "/doctor/pending-enrollments"
          headers:
            Authorization: "Bearer {{ authToken }}"
```

### Response Time Testing

```typescript
// tests/performance/response-time.test.ts
describe('API Response Time Tests', () => {
  const MAX_RESPONSE_TIME = 2000; // 2 seconds

  it('should respond to authentication requests quickly', async () => {
    const startTime = Date.now();

    await request(app)
      .post('/auth/patient/login')
      .send({
        email: 'test@example.com',
        password: 'TestPass123!'
      });

    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);
  });

  it('should handle database queries efficiently', async () => {
    const token = await getValidToken('patient');
    const startTime = Date.now();

    await request(app)
      .get('/patient/enrollments')
      .set('Authorization', `Bearer ${token}`);

    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);
  });
});
```

---

## 🎯 Best Practices

### 1. **Test Data Management**

```typescript
// tests/utils/test-data.ts
export class TestDataManager {
  private static users: Map<string, any> = new Map();

  static async createTestPatient(overrides: Partial<any> = {}) {
    const defaultData = {
      name: 'Test Patient',
      email: `patient${Date.now()}@test.com`,
      password: 'SecurePass123!',
      nic: `${Math.random().toString(36).substring(7)}V`,
      gender: 'other',
      dob: '1990-01-01',
      phone: '+94771234567',
      ...overrides
    };

    const response = await request(app)
      .post('/auth/patient/signup')
      .send(defaultData);

    const userData = {
      ...defaultData,
      id: response.body.user.id,
      token: response.body.token
    };

    this.users.set(userData.email, userData);
    return userData;
  }

  static async createTestDoctor(overrides: Partial<any> = {}) {
    // Implementation for creating test doctor
  }

  static async cleanup() {
    // Clean up all test data
    for (const [email, user] of this.users) {
      await User.destroy({ where: { email } });
    }
    this.users.clear();
  }
}
```

### 2. **Environment-Specific Testing**

```typescript
// tests/config/test-config.ts
export const getTestConfig = () => {
  const env = process.env.NODE_ENV || 'test';
  
  const configs = {
    test: {
      apiUrl: 'http://localhost:5000',
      database: 'test_db',
      timeout: 5000
    },
    staging: {
      apiUrl: 'https://staging-api.mentalhealth.lk',
      database: 'staging_db',
      timeout: 10000
    },
    production: {
      apiUrl: 'https://api.mentalhealth.lk',
      database: 'prod_db',
      timeout: 15000
    }
  };

  return configs[env as keyof typeof configs] || configs.test;
};
```

### 3. **Comprehensive Error Testing**

```typescript
// tests/api/error-handling.test.ts
describe('API Error Handling', () => {
  it('should return consistent error format', async () => {
    const response = await request(app)
      .post('/auth/patient/login')
      .send({
        email: 'invalid-email',
        password: 'wrong'
      });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toHaveProperty('error');
    expect(typeof response.body.error).toBe('string');
  });

  it('should handle database connection errors gracefully', async () => {
    // Mock database error
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('DB Connection lost'));

    const response = await request(app)
      .post('/auth/patient/login')
      .send({
        email: 'test@example.com',
        password: 'TestPass123!'
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toContain('server error');
  });
});
```

### 4. **API Documentation Testing**

```typescript
// tests/api/schema-validation.test.ts
import Ajv from 'ajv';
import patientSchema from '../schemas/patient.schema.json';

describe('API Schema Validation', () => {
  const ajv = new Ajv();

  it('should match patient signup response schema', async () => {
    const response = await request(app)
      .post('/auth/patient/signup')
      .send(validPatientData);

    const validate = ajv.compile(patientSchema);
    const isValid = validate(response.body);

    expect(isValid).toBe(true);
    if (!isValid) {
      console.log('Schema validation errors:', validate.errors);
    }
  });
});
```

---

## 🏃‍♀️ Quick Start Commands

### Running Different Types of API Tests

```bash
# Run all API tests
npm run test:api

# Run authentication tests only
npm test -- --testPathPattern=auth

# Run security tests
npm test -- --testPathPattern=security

# Run with coverage
npm run test:api:coverage

# Run performance tests
npm run test:performance

# Run tests against staging
NODE_ENV=staging npm run test:api
```

### CI/CD Integration

```yaml
# .github/workflows/api-tests.yml
name: API Tests
on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci

      - name: Run API tests
        run: npm run test:api
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test_db
          JWT_SECRET: test-secret-key
          NODE_ENV: test

      - name: Run security tests
        run: npm run test:security

      - name: Generate API test report
        run: npm run test:api:report
```

---

## 📊 Recommended Testing Pyramid

```
                🔺
               /   \
              /  E2E \     <- 10% (Full user journeys)
             /   API   \
            /___________ \  <- 30% (API integration tests)
           /             \
          /   UNIT TESTS   \ <- 60% (Controller & service tests)
         /_________________\
```

**For your Mental Health Platform:**
- **60% Unit Tests**: Test individual controllers, services, validators
- **30% API Integration Tests**: Test complete API endpoints with real database
- **10% E2E Tests**: Test complete user flows through UI + API

This approach gives you the best coverage with optimal test execution speed!

Would you like me to help you implement any specific type of API testing for your platform?
