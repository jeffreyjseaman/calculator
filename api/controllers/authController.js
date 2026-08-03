'use strict';

var bcrypt = require('bcryptjs');
var users = require('../models/users');
var auth = require('../middleware/auth');

var USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,32}$/;

function validateCredentials(username, password) {
  if (!username || typeof username !== 'string' || !USERNAME_PATTERN.test(username)) {
    return 'Username must be 3-32 characters and contain only letters, numbers, or underscores';
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return null;
}

exports.register = function(req, res) {
  var username = req.body && req.body.username;
  var password = req.body && req.body.password;
  var validationError = validateCredentials(username, password);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  if (users.findByUsername(username)) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  var passwordHash = bcrypt.hashSync(password, 10);
  var user = users.create(username, passwordHash);
  var token = auth.signToken(user);

  return res.status(201).json({
    user: users.toPublic(user),
    token: token
  });
};

exports.login = function(req, res) {
  var username = req.body && req.body.username;
  var password = req.body && req.body.password;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  var user = users.findByUsername(username);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  return res.status(200).json({
    user: users.toPublic(user),
    token: auth.signToken(user)
  });
};

exports.me = function(req, res) {
  return res.status(200).json({ user: req.user });
};
