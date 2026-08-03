'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const store = require('../models/store');
const jwtSecret = require('../middleware/requireAuth').jwtSecret;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return { id: user.id, email: user.email };
}

function validateCredentials(body) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!EMAIL_PATTERN.test(email)) {
    return { error: 'A valid email is required' };
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  return { email: email, password: password };
}

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

exports.register = async function register(req, res, next) {
  try {
    const credentials = validateCredentials(req.body || {});
    if (credentials.error) {
      return res.status(400).json({ error: credentials.error });
    }
    if (store.users.some(function(user) { return user.email === credentials.email; })) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const user = {
      id: randomUUID(),
      email: credentials.email,
      passwordHash: await bcrypt.hash(credentials.password, 12)
    };
    store.users.push(user);

    return res.status(201).json({ user: publicUser(user), token: issueToken(user) });
  } catch (error) {
    return next(error);
  }
};

exports.login = async function login(req, res, next) {
  try {
    const credentials = validateCredentials(req.body || {});
    if (credentials.error) {
      return res.status(400).json({ error: credentials.error });
    }

    const user = store.users.find(function(candidate) {
      return candidate.email === credentials.email;
    });
    if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.json({ user: publicUser(user), token: issueToken(user) });
  } catch (error) {
    return next(error);
  }
};

exports.me = function me(req, res) {
  const user = store.users.find(function(candidate) {
    return candidate.id === req.user.sub;
  });

  if (!user) {
    return res.status(401).json({ error: 'User no longer exists' });
  }

  return res.json({ user: publicUser(user) });
};
