import { setupServer } from 'msw/node';
import { rest } from 'msw';
import fetch from 'node-fetch';

// Make fetch available globally for the test
(global as any).fetch = fetch;

// Integration test for user authentication flow
describe('Authentication Integration Tests', () => {
  const server = setupServer(
    rest.post('/api/auth/register', (req, res, ctx) => {
      return res(
        ctx.status(201),
        ctx.json({
          token: 'mock-jwt-token',
          user: {
            id: 1,
            email: 'test@example.com',
            role: 'patient'
          }
        })
      );
    }),
    
    rest.post('/api/auth/login', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'mock-jwt-token',
          user: {
            id: 1,
            email: 'test@example.com',
            role: 'patient'
          }
        })
      );
    }),

    rest.get('/api/user/profile', (req, res, ctx) => {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }));
      }
      
      return res(
        ctx.status(200),
        ctx.json({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'patient'
        })
      );
    })
  );

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('should complete full authentication flow', async () => {
    // Test user registration
    const registrationData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'patient'
    };

    // Mock the registration request
    const registerResponse = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });

    const registerResult = await registerResponse.json() as { token: string; message: string };
    expect(registerResponse.status).toBe(201);
    expect(registerResult.token).toBeDefined();

    // Test user login
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginResponse.json() as { token: string; message: string };
    expect(loginResponse.status).toBe(200);
    expect(loginResult.token).toBeDefined();

    // Test accessing protected route
    const profileResponse = await fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${loginResult.token}`
      }
    });

    const profileResult = await profileResponse.json() as { email: string; id: string };
    expect(profileResponse.status).toBe(200);
    expect(profileResult.email).toBe('test@example.com');
  });

  it('should handle authentication errors properly', async () => {
    // Test accessing protected route without token
    const profileResponse = await fetch('/api/user/profile');
    expect(profileResponse.status).toBe(401);
  });
});
