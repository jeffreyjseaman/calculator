var jwt = require('jsonwebtoken');
var users = require('../api/models/userModel');

var ACCOUNT = { email: 'ada@example.com', password: 'a-long-enough-password', name: 'Ada' };

function register(attributes, callback) {
  request.post('/auth/register').send(attributes).end(callback);
}

function login(attributes, callback) {
  request.post('/auth/login').send(attributes).end(callback);
}

// Registers the default account and hands its access token to the callback.
function authenticate(callback) {
  register(ACCOUNT, function(err) {
    if (err) {
      return callback(err);
    }

    login(ACCOUNT, function(err, res) {
      callback(err, res.body.accessToken);
    });
  });
}

function issueToken(claims, options) {
  return jwt.sign({}, process.env.JWT_SECRET, Object.assign({
    algorithm: 'HS256',
    issuer: 'calculator',
    expiresIn: 3600
  }, claims, options));
}

describe('Authentication', function() {
  beforeEach(function() {
    users.reset();
  });

  describe('Registration', function() {
    it('creates an account', function(done) {
      register(ACCOUNT, function(err, res) {
        expect(res.status).to.equal(201);
        expect(res.body.user.id).to.equal(1);
        expect(res.body.user.email).to.equal('ada@example.com');
        expect(res.body.user.name).to.equal('Ada');
        done();
      });
    });

    it('never returns the password or its hash', function(done) {
      register(ACCOUNT, function(err, res) {
        expect(Object.keys(res.body.user).sort()).to.eql(['createdAt', 'email', 'id', 'name']);
        expect(JSON.stringify(res.body)).to.not.contain(ACCOUNT.password);
        done();
      });
    });

    it('stores the password as a hash', function(done) {
      register(ACCOUNT, function() {
        var stored = users.findByEmail(ACCOUNT.email);
        expect(stored.passwordHash).to.not.equal(ACCOUNT.password);
        expect(stored.passwordHash).to.match(/^\$2[aby]\$/);
        done();
      });
    });

    it('lowercases the email', function(done) {
      register({ email: 'ADA@Example.COM', password: ACCOUNT.password }, function(err, res) {
        expect(res.status).to.equal(201);
        expect(res.body.user.email).to.equal('ada@example.com');
        done();
      });
    });

    it('rejects a missing email', function(done) {
      register({ password: ACCOUNT.password }, function(err, res) {
        expect(res.status).to.equal(400);
        expect(res.body).to.eql({ error: "A valid email is required" });
        done();
      });
    });

    it('rejects a malformed email', function(done) {
      register({ email: 'ada@', password: ACCOUNT.password }, function(err, res) {
        expect(res.status).to.equal(400);
        expect(res.body).to.eql({ error: "A valid email is required" });
        done();
      });
    });

    it('rejects a password shorter than eight characters', function(done) {
      register({ email: ACCOUNT.email, password: 'short' }, function(err, res) {
        expect(res.status).to.equal(400);
        expect(res.body).to.eql({ error: "Password must be at least 8 characters" });
        done();
      });
    });

    it('rejects a password longer than bcrypt can read', function(done) {
      register({ email: ACCOUNT.email, password: new Array(74).join('x') }, function(err, res) {
        expect(res.status).to.equal(400);
        expect(res.body).to.eql({ error: "Password must be at most 72 bytes" });
        done();
      });
    });

    it('rejects an overlong name', function(done) {
      register({ email: ACCOUNT.email, password: ACCOUNT.password, name: new Array(102).join('x') }, function(err, res) {
        expect(res.status).to.equal(400);
        expect(res.body).to.eql({ error: "Name must be at most 100 characters" });
        done();
      });
    });

    it('rejects a body larger than the parser accepts', function(done) {
      register({ email: ACCOUNT.email, password: ACCOUNT.password, name: new Array(11000).join('x') }, function(err, res) {
        expect(res.status).to.equal(413);
        expect(res.body).to.eql({ error: "Request body is too large" });
        done();
      });
    });

    it('rejects a duplicate email', function(done) {
      register(ACCOUNT, function() {
        register(ACCOUNT, function(err, res) {
          expect(res.status).to.equal(409);
          expect(res.body).to.eql({ error: "An account with that email already exists" });
          done();
        });
      });
    });

    it('rejects a duplicate email in a different case', function(done) {
      register(ACCOUNT, function() {
        register({ email: 'ADA@example.com', password: ACCOUNT.password }, function(err, res) {
          expect(res.status).to.equal(409);
          done();
        });
      });
    });

    it('rejects a body that is not valid JSON', function(done) {
      request.post('/auth/register')
          .set('Content-Type', 'application/json')
          .send('{"email":')
          .end(function(err, res) {
              expect(res.status).to.equal(400);
              expect(res.body).to.eql({ error: "Request body must be valid JSON" });
              done();
          });
    });
  });

  describe('Login', function() {
    it('returns an access token', function(done) {
      register(ACCOUNT, function() {
        login(ACCOUNT, function(err, res) {
          expect(res.status).to.equal(200);
          expect(res.body.tokenType).to.equal('Bearer');
          expect(res.body.expiresIn).to.equal(3600);
          expect(res.body.user.email).to.equal(ACCOUNT.email);

          var payload = jwt.verify(res.body.accessToken, process.env.JWT_SECRET);
          expect(payload.sub).to.equal('1');
          expect(payload.iss).to.equal('calculator');
          expect(payload.exp - payload.iat).to.equal(3600);
          done();
        });
      });
    });

    it('accepts an email in a different case', function(done) {
      register(ACCOUNT, function() {
        login({ email: 'ADA@Example.com', password: ACCOUNT.password }, function(err, res) {
          expect(res.status).to.equal(200);
          done();
        });
      });
    });

    it('rejects a wrong password', function(done) {
      register(ACCOUNT, function() {
        login({ email: ACCOUNT.email, password: 'not-the-password' }, function(err, res) {
          expect(res.status).to.equal(401);
          expect(res.body).to.eql({ error: "Invalid email or password" });
          done();
        });
      });
    });

    it('rejects an unknown email without revealing that it is unknown', function(done) {
      login({ email: 'nobody@example.com', password: ACCOUNT.password }, function(err, res) {
        expect(res.status).to.equal(401);
        expect(res.body).to.eql({ error: "Invalid email or password" });
        done();
      });
    });

    it('rejects missing credentials', function(done) {
      login({ email: ACCOUNT.email }, function(err, res) {
        expect(res.status).to.equal(400);
        expect(res.body).to.eql({ error: "Email and password are required" });
        done();
      });
    });
  });

  describe('Protected routes', function() {
    it('returns the authenticated account', function(done) {
      authenticate(function(err, token) {
        request.get('/auth/me')
            .set('Authorization', 'Bearer ' + token)
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                expect(res.body.user.email).to.equal(ACCOUNT.email);
                expect(res.body.user).to.not.have.property('passwordHash');
                done();
            });
      });
    });

    it('accepts the scheme in any case', function(done) {
      authenticate(function(err, token) {
        request.get('/auth/me')
            .set('Authorization', 'bearer ' + token)
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                done();
            });
      });
    });

    it('rejects a request with no token', function(done) {
      request.get('/auth/me').end(function(err, res) {
        expect(res.status).to.equal(401);
        expect(res.headers['www-authenticate']).to.equal('Bearer realm="api"');
        expect(res.body).to.eql({ error: "An access token is required" });
        done();
      });
    });

    it('rejects another authentication scheme', function(done) {
      request.get('/auth/me')
          .set('Authorization', 'Basic YWRhOnNlY3JldA==')
          .end(function(err, res) {
              expect(res.status).to.equal(401);
              expect(res.body).to.eql({ error: "The Authorization header must use the Bearer scheme" });
              done();
          });
    });

    it('rejects a token that is not a JWT', function(done) {
      request.get('/auth/me')
          .set('Authorization', 'Bearer not-a-token')
          .end(function(err, res) {
              expect(res.status).to.equal(401);
              expect(res.body).to.eql({ error: "The access token is not valid" });
              done();
          });
    });

    it('rejects a token signed with another secret', function(done) {
      var forged = jwt.sign({}, 'another-secret', { subject: '1', issuer: 'calculator', expiresIn: 3600 });

      register(ACCOUNT, function() {
        request.get('/auth/me')
            .set('Authorization', 'Bearer ' + forged)
            .end(function(err, res) {
                expect(res.status).to.equal(401);
                expect(res.body).to.eql({ error: "The access token is not valid" });
                done();
            });
      });
    });

    it('rejects an expired token', function(done) {
      var expired = issueToken({ subject: '1' }, { expiresIn: -10 });

      register(ACCOUNT, function() {
        request.get('/auth/me')
            .set('Authorization', 'Bearer ' + expired)
            .end(function(err, res) {
                expect(res.status).to.equal(401);
                expect(res.body).to.eql({ error: "The access token has expired" });
                done();
            });
      });
    });

    it('rejects a token for an account that no longer exists', function(done) {
      authenticate(function(err, token) {
        users.reset();

        request.get('/auth/me')
            .set('Authorization', 'Bearer ' + token)
            .end(function(err, res) {
                expect(res.status).to.equal(401);
                expect(res.body).to.eql({ error: "The access token is not valid" });
                done();
            });
      });
    });
  });

  describe('Signing secret', function() {
    var modulePath = require.resolve('../api/auth/tokens');

    // Loads a second copy of the token module under a modified environment,
    // then puts both the environment and the module cache back so that the
    // running app keeps the instance it started with.
    function reload(changes, body) {
      var cached = require.cache[modulePath];
      var original = {};

      Object.keys(changes).forEach(function(key) {
        original[key] = process.env[key];

        if (changes[key] === null) {
          delete process.env[key];
        } else {
          process.env[key] = changes[key];
        }
      });

      delete require.cache[modulePath];

      try {
        body();
      } finally {
        Object.keys(original).forEach(function(key) {
          if (original[key] === undefined) {
            delete process.env[key];
          } else {
            process.env[key] = original[key];
          }
        });

        require.cache[modulePath] = cached;
      }
    }

    it('refuses to start in production without a configured secret', function() {
      reload({ JWT_SECRET: null, NODE_ENV: 'production' }, function() {
        expect(function() {
          require('../api/auth/tokens');
        }).to.throw(/JWT_SECRET must be set/);
      });
    });

    it('warns and generates a secret outside production', function() {
      var warnings = [];
      var warn = console.warn;

      console.warn = function(message) {
        warnings.push(message);
      };

      try {
        reload({ JWT_SECRET: null, NODE_ENV: 'development' }, function() {
          expect(require('../api/auth/tokens').sign({ id: 1 })).to.be.a('string');
        });
      } finally {
        console.warn = warn;
      }

      expect(warnings.join(' ')).to.contain('temporary secret');
    });
  });
});
