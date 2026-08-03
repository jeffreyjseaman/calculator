'use strict';

var tokens = require('../auth/tokens');
var users = require('../models/userModel');

var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var MAX_EMAIL_LENGTH = 254;
var MIN_PASSWORD_LENGTH = 8;
var MAX_NAME_LENGTH = 100;

function string(value) {
  return typeof value === 'string' ? value : '';
}

function fail(res, status, message) {
  res.status(status).json({ error: message });
}

exports.register = function(req, res) {
  var body = req.body || {};
  var email = string(body.email).trim();
  var password = string(body.password);
  var name = string(body.name).trim();

  if (!EMAIL.test(email) || email.length > MAX_EMAIL_LENGTH) {
    return fail(res, 400, 'A valid email is required');
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return fail(res, 400, 'Password must be at least ' + MIN_PASSWORD_LENGTH + ' characters');
  }

  if (Buffer.byteLength(password) > users.MAX_PASSWORD_BYTES) {
    return fail(res, 400, 'Password must be at most ' + users.MAX_PASSWORD_BYTES + ' bytes');
  }

  if (name.length > MAX_NAME_LENGTH) {
    return fail(res, 400, 'Name must be at most ' + MAX_NAME_LENGTH + ' characters');
  }

  if (users.findByEmail(email)) {
    return fail(res, 409, 'An account with that email already exists');
  }

  users.create({ email: email, password: password, name: name }, function(err, user) {
    if (err) {
      return fail(res, 500, 'The account could not be created');
    }

    res.status(201).json({ user: users.publicAttributes(user) });
  });
};

exports.login = function(req, res) {
  var body = req.body || {};
  var email = string(body.email);
  var password = string(body.password);

  if (!email || !password) {
    return fail(res, 400, 'Email and password are required');
  }

  var user = users.findByEmail(email);

  // The lookup result is deliberately not acted on until the password has been
  // checked, so that an unknown email and a wrong password are indistinguishable
  // in both timing and response.
  users.verifyPassword(user, password, function(err, matches) {
    if (err) {
      return fail(res, 500, 'The credentials could not be verified');
    }

    if (!matches) {
      return fail(res, 401, 'Invalid email or password');
    }

    res.json({
      tokenType: 'Bearer',
      accessToken: tokens.sign(user),
      expiresIn: tokens.ttl,
      user: users.publicAttributes(user)
    });
  });
};

exports.me = function(req, res) {
  res.json({ user: users.publicAttributes(req.user) });
};
