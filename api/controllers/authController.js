'use strict';

var jwt = require('jsonwebtoken');
var config = require('../config');
var userModel = require('../models/userModel');

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

exports.register = function(req, res) {
  var username = req.body && req.body.username;
  var password = req.body && req.body.password;

  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: 'username is required' });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'password is required and must be at least 8 characters' });
  }

  username = username.trim();

  if (userModel.findByUsername(username)) {
    return res.status(409).json({ error: 'username is already taken' });
  }

  var user = userModel.create(username, password);

  res.status(201).json({
    user: userModel.toJSON(user),
    token: issueToken(user)
  });
};

exports.login = function(req, res) {
  var username = req.body && req.body.username;
  var password = req.body && req.body.password;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  var user = userModel.findByUsername(String(username).trim());

  // Same response for unknown user and wrong password, so attackers
  // cannot probe which usernames exist.
  if (!user || !userModel.verifyPassword(user, String(password))) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({
    user: userModel.toJSON(user),
    token: issueToken(user)
  });
};
