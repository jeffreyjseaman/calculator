var supertest = require('supertest');
var chai = require('chai');
var app = require('../server');

global.app = app;
global.expect = chai.expect;
global.request = supertest(app);

global.getAuthToken = function(done) {
  request.post('/auth/login')
    .send({ username: 'admin', password: 'password123' })
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      done(null, res.body.token);
    });
};
