// Set before the app is loaded, since the signing secret is resolved once at
// startup and would otherwise be a random value the tests cannot predict.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret-used-only-by-the-test-suite';

var supertest = require('supertest');
var chai = require('chai');
var app = require('../server');

global.app = app;
global.expect = chai.expect;
global.request = supertest(app);
