'use strict';

const store = require('../api/models/store');

describe('Authenticated notes API', function() {
  beforeEach(function() {
    store.reset();
  });

  async function register(email, password) {
    const response = await request
      .post('/api/auth/register')
      .send({ email: email, password: password || 'correct-horse-battery-staple' })
      .expect(201);
    return response.body;
  }

  it('registers a user and returns a JWT', async function() {
    const response = await register('Ada@Example.com');

    expect(response.user).to.include({ email: 'ada@example.com' });
    expect(response.user).not.to.have.property('passwordHash');
    expect(response.token).to.be.a('string');
  });

  it('rejects duplicate email addresses', async function() {
    await register('ada@example.com');

    const response = await request
      .post('/api/auth/register')
      .send({ email: 'ADA@example.com', password: 'another-secure-password' })
      .expect(409);

    expect(response.body).to.eql({ error: 'Email is already registered' });
  });

  it('authenticates a registered user', async function() {
    await register('ada@example.com', 'correct-password');

    const response = await request
      .post('/api/auth/login')
      .send({ email: 'ada@example.com', password: 'correct-password' })
      .expect(200);

    expect(response.body.user).to.include({ email: 'ada@example.com' });
    expect(response.body.token).to.be.a('string');
  });

  it('requires a valid bearer token for protected routes', async function() {
    await request.get('/api/notes').expect(401);
    await request.get('/api/notes').set('Authorization', 'Bearer invalid').expect(401);
  });

  it('allows users to manage only their own notes', async function() {
    const firstUser = await register('ada@example.com');
    const secondUser = await register('grace@example.com');
    const firstAuth = { Authorization: 'Bearer ' + firstUser.token };
    const secondAuth = { Authorization: 'Bearer ' + secondUser.token };

    const created = await request
      .post('/api/notes')
      .set(firstAuth)
      .send({ title: 'API design', content: 'Use resource-oriented routes.' })
      .expect(201);

    expect(created.body.note).to.include({
      title: 'API design',
      content: 'Use resource-oriented routes.'
    });

    await request.get('/api/notes').set(secondAuth).expect(200).expect({ notes: [] });
    await request.get('/api/notes/' + created.body.note.id).set(secondAuth).expect(404);

    const updated = await request
      .put('/api/notes/' + created.body.note.id)
      .set(firstAuth)
      .send({ title: 'Updated design', content: 'Keep routes resource-oriented.' })
      .expect(200);

    expect(updated.body.note.title).to.equal('Updated design');
    await request.delete('/api/notes/' + created.body.note.id).set(firstAuth).expect(204);
  });
});
