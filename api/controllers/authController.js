'use strict';

var jwt = require('jsonwebtoken');
var authenticate = require('../middleware/authenticate');
var userStore = require('../services/userStore');

var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCredentials(req, res) {
  var email = req.body && req.body.email;
  var password = req.body && req.body.password;

  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email) || email.length > 254) {
    res.status(400).json({ error: 'A valid email is required' });
    return null;
  }

  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    res.status(400).json({ error: 'Password must be between 8 and 72 characters' });
    return null;
  }

  return { email: email, password: password };
}

function issueToken(user) {
  return jwt.sign(
    { email: user.email },
    authenticate.secret(),
    {
      algorithm: 'HS256',
      subject: user.id,
      issuer: 'calculator-api',
      audience: 'calculator-client',
      expiresIn: '1h'
    }
  );
}

exports.register = async function(req, res, next) {
  try {
    var credentials = validateCredentials(req, res);
    if (!credentials) {
      return;
    }

    var user = await userStore.create(credentials.email, credentials.password);
    if (!user) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    return res.status(201).json({ user: user, token: issueToken(user) });
  } catch (err) {
    next(err);
  }
};

exports.login = async function(req, res, next) {
  try {
    var credentials = validateCredentials(req, res);
    if (!credentials) {
      return;
    }

    var user = await userStore.verify(credentials.email, credentials.password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.json({ user: user, token: issueToken(user) });
  } catch (err) {
    next(err);
  }
};
