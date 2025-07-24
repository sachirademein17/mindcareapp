import request from 'supertest';
import express from 'express';
import { patientSignup, patientLogin } from '../../src/controllers/auth.controller';

// Mock the dependencies
jest.mock('../../src/models/User', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

const app = express();
app.use(express.json());

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'patient',
      };

      // Mock implementations
      const bcrypt = require('bcrypt');
      const jwt = require('jsonwebtoken');
      const { User } = require('../../src/models/User');

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mockToken');

      app.post('/register', patientSignup);

      const response = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          nic: '123456789V',
          gender: 'other',
          dob: '1990-01-01',
          phone: '1234567890',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return error for existing user', async () => {
      const { User } = require('../../src/models/User');
      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      app.post('/register-existing', patientSignup);

      const response = await request(app)
        .post('/register-existing')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          nic: '123456789V',
          gender: 'other',
          dob: '1990-01-01',
          phone: '1234567890',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'patient',
      };

      const bcrypt = require('bcrypt');
      const jwt = require('jsonwebtoken');
      const { User } = require('../../src/models/User');

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      app.post('/login', patientLogin);

      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should return error for invalid credentials', async () => {
      const { User } = require('../../src/models/User');
      User.findOne.mockResolvedValue(null);

      app.post('/login-invalid', patientLogin);

      const response = await request(app)
        .post('/login-invalid')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });
  });
});
