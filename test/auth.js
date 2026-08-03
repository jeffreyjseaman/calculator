describe('Authentication', function() {
  beforeEach(function() {
    resetUsers();
  });

  after(function(done) {
    resetUsers();
    registerAndGetToken('testuser', 'password123', done);
  });

  describe('POST /auth/register', function() {
    it('registers a new user and returns a token', function(done) {
      request.post('/auth/register')
        .send({ username: 'alice', password: 'secret12' })
        .expect(201)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          expect(res.body.user).to.include({ id: 1, username: 'alice' });
          expect(res.body.user).to.have.property('createdAt');
          expect(res.body.user).to.not.have.property('passwordHash');
          expect(res.body.token).to.be.a('string').that.is.not.empty;
          done();
        });
    });

    it('rejects a duplicate username', function(done) {
      request.post('/auth/register')
        .send({ username: 'alice', password: 'secret12' })
        .expect(201)
        .end(function(err) {
          if (err) {
            return done(err);
          }

          request.post('/auth/register')
            .send({ username: 'alice', password: 'another1' })
            .expect(409)
            .end(function(err, res) {
              expect(res.body).to.eql({ error: 'Username already taken' });
              done();
            });
        });
    });

    it('rejects a short password', function(done) {
      request.post('/auth/register')
        .send({ username: 'alice', password: '123' })
        .expect(400)
        .end(function(err, res) {
          expect(res.body).to.eql({ error: 'Password must be at least 6 characters' });
          done();
        });
    });

    it('rejects an invalid username', function(done) {
      request.post('/auth/register')
        .send({ username: 'a', password: 'secret12' })
        .expect(400)
        .end(function(err, res) {
          expect(res.body.error).to.match(/Username must be/);
          done();
        });
    });
  });

  describe('POST /auth/login', function() {
    beforeEach(function(done) {
      request.post('/auth/register')
        .send({ username: 'bob', password: 'secret12' })
        .expect(201)
        .end(done);
    });

    it('logs in with valid credentials', function(done) {
      request.post('/auth/login')
        .send({ username: 'bob', password: 'secret12' })
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          expect(res.body.user).to.include({ username: 'bob' });
          expect(res.body.token).to.be.a('string').that.is.not.empty;
          done();
        });
    });

    it('rejects invalid credentials', function(done) {
      request.post('/auth/login')
        .send({ username: 'bob', password: 'wrongpass' })
        .expect(401)
        .end(function(err, res) {
          expect(res.body).to.eql({ error: 'Invalid username or password' });
          done();
        });
    });

    it('rejects missing credentials', function(done) {
      request.post('/auth/login')
        .send({ username: 'bob' })
        .expect(400)
        .end(function(err, res) {
          expect(res.body).to.eql({ error: 'Username and password are required' });
          done();
        });
    });
  });

  describe('GET /auth/me', function() {
    it('returns the current user when authenticated', function(done) {
      request.post('/auth/register')
        .send({ username: 'carol', password: 'secret12' })
        .expect(201)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          request.get('/auth/me')
            .set('Authorization', 'Bearer ' + res.body.token)
            .expect(200)
            .end(function(err, meRes) {
              expect(meRes.body.user).to.include({ username: 'carol' });
              done();
            });
        });
    });

    it('rejects requests without a token', function(done) {
      request.get('/auth/me')
        .expect(401)
        .end(function(err, res) {
          expect(res.body).to.eql({ error: 'Missing or invalid Authorization header' });
          done();
        });
    });
  });

  describe('Protected /arithmetic', function() {
    it('rejects unauthenticated arithmetic requests', function(done) {
      request.get('/arithmetic?operation=add&operand1=1&operand2=2')
        .expect(401)
        .end(function(err, res) {
          expect(res.body).to.eql({ error: 'Missing or invalid Authorization header' });
          done();
        });
    });

    it('allows authenticated arithmetic requests', function(done) {
      request.post('/auth/register')
        .send({ username: 'dave', password: 'secret12' })
        .expect(201)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          request.get('/arithmetic?operation=add&operand1=21&operand2=21')
            .set('Authorization', 'Bearer ' + res.body.token)
            .expect(200)
            .end(function(err, calcRes) {
              expect(calcRes.body).to.eql({ result: 42 });
              done();
            });
        });
    });
  });
});
