describe('Authentication', function() {
  describe('Registration', function() {
    it('registers a new user and returns a token', function(done) {
      request.post('/auth/register')
        .send({ username: 'newuser', password: 'secret12' })
        .expect(201)
        .end(function(err, res) {
          expect(res.body).to.have.property('token');
          expect(res.body.username).to.eql('newuser');
          done();
        });
    });

    it('rejects registration without username', function(done) {
      request.post('/auth/register')
        .send({ password: 'secret12' })
        .expect(400)
        .end(function(err, res) {
          expect(res.body).to.eql({ error: 'Username is required' });
          done();
        });
    });

    it('rejects registration with short password', function(done) {
      request.post('/auth/register')
        .send({ username: 'shortpw', password: '12345' })
        .expect(400)
        .end(function(err, res) {
          expect(res.body).to.eql({ error: 'Password must be at least 6 characters' });
          done();
        });
    });

    it('rejects duplicate registration', function(done) {
      request.post('/auth/register')
        .send({ username: 'dupuser', password: 'secret12' })
        .expect(201)
        .end(function(err, res) {
          request.post('/auth/register')
            .send({ username: 'dupuser', password: 'secret12' })
            .expect(409)
            .end(function(err, res) {
              expect(res.body).to.eql({ error: 'User already exists' });
              done();
            });
        });
    });
  });

  describe('Login', function() {
    it('logs in with valid credentials', function(done) {
      request.post('/auth/login')
        .send({ username: 'admin', password: 'password123' })
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.have.property('token');
          expect(res.body.username).to.eql('admin');
          done();
        });
    });

    it('rejects login with invalid password', function(done) {
      request.post('/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' })
        .expect(401)
        .end(function(err, res) {
          expect(res.body).to.eql({ error: 'Invalid credentials' });
          done();
        });
    });

    it('rejects login with missing credentials', function(done) {
      request.post('/auth/login')
        .send({ username: 'admin' })
        .expect(400)
        .end(function(err, res) {
          expect(res.body).to.eql({ error: 'Username and password are required' });
          done();
        });
    });
  });

  describe('Protected routes', function() {
    it('rejects unauthenticated access to arithmetic', function(done) {
      request.get('/arithmetic?operation=add&operand1=1&operand2=2')
        .expect(401)
        .end(function(err, res) {
          expect(res.body).to.eql({ error: 'Authentication required' });
          done();
        });
    });

    it('rejects invalid token', function(done) {
      request.get('/arithmetic?operation=add&operand1=1&operand2=2')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
        .end(function(err, res) {
          expect(res.body).to.eql({ error: 'Invalid or expired token' });
          done();
        });
    });

    it('allows authenticated access to arithmetic', function(done) {
      getAuthToken(function(err, token) {
        if (err) {
          return done(err);
        }

        request.get('/arithmetic?operation=add&operand1=1&operand2=2')
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .end(function(err, res) {
            expect(res.body).to.eql({ result: 3 });
            done();
          });
      });
    });
  });
});
