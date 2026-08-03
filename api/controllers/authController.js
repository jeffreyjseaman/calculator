'use strict';

var userStore = require('../models/userStore');
var auth = require('../middleware/auth');

exports.register = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: 'Username is required' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  userStore.createUser(username.trim(), password)
    .then(function(user) {
      var token = auth.signToken({ username: user.username });
      res.status(201).json({ token: token, username: user.username });
    })
    .catch(function(err) {
      if (err.message === 'User already exists') {
        return res.status(409).json({ error: err.message });
      }
      res.status(500).json({ error: 'Registration failed' });
    });
};

exports.login = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  var user = userStore.findUser(username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  userStore.verifyPassword(user, password)
    .then(function(valid) {
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      var token = auth.signToken({ username: user.username });
      res.json({ token: token, username: user.username });
    });
};
