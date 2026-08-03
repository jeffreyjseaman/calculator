'use strict';

describe('Authentication API', function() {
  var email = 'user-' + Date.now() + '@example.com';
  var password = 'correct-horse-battery-staple';
  var token;

  it('registers a user and returns a token', function(done) {
    request
      .post('/api/auth/register')
      .send({ email: email, password: password })
      .expect(201)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.user.email).to.equal(email);
        expect(res.body.user).not.to.have.property('passwordHash');
        expect(res.body.token).to.be.a('string');
        token = res.body.token;
        done();
      });
  });

  it('rejects duplicate registration', function(done) {
    request
      .post('/api/auth/register')
      .send({ email: email.toUpperCase(), password: password })
      .expect(409, { error: 'An account with that email already exists' }, done);
  });

  it('validates registration input', function(done) {
    request
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'short' })
      .expect(400, { error: 'A valid email is required' }, done);
  });

  it('logs in with valid credentials', function(done) {
    request
      .post('/api/auth/login')
      .send({ email: email, password: password })
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.token).to.be.a('string');
        done();
      });
  });

  it('rejects invalid credentials', function(done) {
    request
      .post('/api/auth/login')
      .send({ email: email, password: 'incorrect-password' })
      .expect(401, { error: 'Invalid email or password' }, done);
  });

  it('requires authentication for protected endpoints', function(done) {
    request
      .get('/api/users/me')
      .expect(401, { error: 'Authentication required' }, done);
  });

  it('returns the current user for a valid token', function(done) {
    request
      .get('/api/users/me')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.user.email).to.equal(email);
        done();
      });
  });

  it('allows authenticated calculator requests', function(done) {
    request
      .get('/api/arithmetic?operation=add&operand1=20&operand2=22')
      .set('Authorization', 'Bearer ' + token)
      .expect(200, { result: 42 }, done);
  });

  it('rejects invalid tokens', function(done) {
    request
      .get('/api/arithmetic?operation=add&operand1=20&operand2=22')
      .set('Authorization', 'Bearer invalid')
      .expect(401, { error: 'Invalid or expired token' }, done);
  });
});
