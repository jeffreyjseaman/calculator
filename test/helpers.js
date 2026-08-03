var supertest = require('supertest');
var chai = require('chai');
var app = require('../server');
var users = require('../api/models/users');

global.app = app;
global.expect = chai.expect;
global.request = supertest(app);
global.authToken = null;

global.resetUsers = function() {
  users.reset();
  global.authToken = null;
};

global.registerAndGetToken = function(username, password, done) {
  request.post('/auth/register')
    .send({ username: username, password: password })
    .expect(201)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      global.authToken = res.body.token;
      done(null, res.body);
    });
};

global.authenticatedGet = function(url) {
  return request.get(url).set('Authorization', 'Bearer ' + global.authToken);
};

before(function(done) {
  resetUsers();
  registerAndGetToken('testuser', 'password123', done);
});
