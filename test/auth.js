var userModel = require('../api/models/userModel');

describe('Authentication', function() {
  beforeEach(function() {
    userModel.clear();
  });

  describe('Registration', function() {
    it('registers a new user and returns a token', function(done) {
      request.post('/auth/register')
          .send({ username: 'alice', password: 'correct horse battery staple' })
          .expect(201)
          .end(function(err, res) {
              expect(res.body.user.username).to.eql('alice');
              expect(res.body.user).to.not.have.property('passwordHash');
              expect(res.body.token).to.be.a('string');
              done();
          });
    });
    it('rejects a missing username', function(done) {
      request.post('/auth/register')
          .send({ password: 'correct horse battery staple' })
          .expect(400)
          .end(function(err, res) {
              expect(res.body).to.eql({ error: 'username is required' });
              done();
          });
    });
    it('rejects a short password', function(done) {
      request.post('/auth/register')
          .send({ username: 'alice', password: 'short' })
          .expect(400)
          .end(function(err, res) {
              expect(res.body).to.eql({ error: 'password is required and must be at least 8 characters' });
              done();
          });
    });
    it('rejects a duplicate username', function(done) {
      request.post('/auth/register')
          .send({ username: 'alice', password: 'correct horse battery staple' })
          .end(function() {
              request.post('/auth/register')
                  .send({ username: 'alice', password: 'another password entirely' })
                  .expect(409)
                  .end(function(err, res) {
                      expect(res.body).to.eql({ error: 'username is already taken' });
                      done();
                  });
          });
    });
  });

  describe('Login', function() {
    beforeEach(function(done) {
      request.post('/auth/register')
          .send({ username: 'alice', password: 'correct horse battery staple' })
          .end(function() { done(); });
    });

    it('logs in with valid credentials', function(done) {
      request.post('/auth/login')
          .send({ username: 'alice', password: 'correct horse battery staple' })
          .expect(200)
          .end(function(err, res) {
              expect(res.body.user.username).to.eql('alice');
              expect(res.body.token).to.be.a('string');
              done();
          });
    });
    it('rejects a wrong password', function(done) {
      request.post('/auth/login')
          .send({ username: 'alice', password: 'wrong password here' })
          .expect(401)
          .end(function(err, res) {
              expect(res.body).to.eql({ error: 'Invalid username or password' });
              done();
          });
    });
    it('rejects an unknown user', function(done) {
      request.post('/auth/login')
          .send({ username: 'mallory', password: 'correct horse battery staple' })
          .expect(401)
          .end(function(err, res) {
              expect(res.body).to.eql({ error: 'Invalid username or password' });
              done();
          });
    });
    it('rejects missing credentials', function(done) {
      request.post('/auth/login')
          .send({})
          .expect(400)
          .end(function(err, res) {
              expect(res.body).to.eql({ error: 'username and password are required' });
              done();
          });
    });
  });

  describe('Protected routes', function() {
    var token;

    beforeEach(function(done) {
      request.post('/auth/register')
          .send({ username: 'alice', password: 'correct horse battery staple' })
          .end(function(err, res) {
              token = res.body.token;
              done();
          });
    });

    it('returns the current user with a valid token', function(done) {
      request.get('/users/me')
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .end(function(err, res) {
              expect(res.body.user.username).to.eql('alice');
              expect(res.body.user).to.not.have.property('passwordHash');
              done();
          });
    });
    it('rejects a request without a token', function(done) {
      request.get('/users/me')
          .expect(401)
          .end(function(err, res) {
              expect(res.body).to.eql({ error: 'Missing or malformed Authorization header' });
              done();
          });
    });
    it('rejects a malformed Authorization header', function(done) {
      request.get('/users/me')
          .set('Authorization', 'Token ' + token)
          .expect(401)
          .end(function(err, res) {
              expect(res.body).to.eql({ error: 'Missing or malformed Authorization header' });
              done();
          });
    });
    it('rejects an invalid token', function(done) {
      request.get('/users/me')
          .set('Authorization', 'Bearer not-a-real-token')
          .expect(401)
          .end(function(err, res) {
              expect(res.body).to.eql({ error: 'Invalid or expired token' });
              done();
          });
    });
    it('rejects a token for a deleted user', function(done) {
      userModel.clear();
      request.get('/users/me')
          .set('Authorization', 'Bearer ' + token)
          .expect(401)
          .end(function(err, res) {
              expect(res.body).to.eql({ error: 'Invalid or expired token' });
              done();
          });
    });
  });
});
