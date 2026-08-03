const request = require('supertest');
const app = require('../src/app');
const userStore = require('../src/data/userStore');
const User = require('../src/models/User');
const { signToken } = require('../src/utils/jwt');

describe('Users API (role-based authorization)', () => {
  beforeEach(() => {
    userStore.reset();
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('rejects authenticated non-admin users', async () => {
    const user = await User.register({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'supersecret',
    });
    const token = signToken(user);

    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('allows authenticated admins to list users', async () => {
    const admin = await User.register({
      name: 'Site Admin',
      email: 'admin@example.com',
      password: 'supersecret',
      role: 'admin',
    });
    await User.register({
      name: 'Another User',
      email: 'someone@example.com',
      password: 'supersecret',
    });
    const token = signToken(admin);

    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(2);
    expect(res.body.users[0]).not.toHaveProperty('passwordHash');
  });
});
