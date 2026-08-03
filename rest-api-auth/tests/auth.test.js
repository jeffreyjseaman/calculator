const request = require('supertest');
const app = require('../src/app');
const userStore = require('../src/data/userStore');

describe('Auth API', () => {
  beforeEach(() => {
    userStore.reset();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user and returns a token', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'supersecret',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: 'user',
      });
      expect(res.body.user).not.toHaveProperty('passwordHash');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('rejects duplicate emails', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'supersecret',
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Ada Copycat',
        email: 'ada@example.com',
        password: 'anotherpassword',
      });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error');
    });

    it('validates input and rejects weak passwords / bad emails', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: '',
        email: 'not-an-email',
        password: 'short',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Grace Hopper',
        email: 'grace@example.com',
        password: 'supersecret',
      });
    });

    it('logs in with valid credentials and returns a token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'grace@example.com',
        password: 'supersecret',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('grace@example.com');
    });

    it('rejects invalid passwords', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'grace@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });

    it('rejects unknown emails', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'supersecret',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('rejects requests without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('rejects requests with an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not-a-real-token');
      expect(res.status).toBe(401);
    });

    it('returns the authenticated user profile for a valid token', async () => {
      const registerRes = await request(app).post('/api/auth/register').send({
        name: 'Margaret Hamilton',
        email: 'margaret@example.com',
        password: 'supersecret',
      });
      const { token } = registerRes.body;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('margaret@example.com');
    });
  });
});
