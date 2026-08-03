'use strict';

var jwt = require('jsonwebtoken');
var users = require('../models/users');

var JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
var JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function signToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function authenticate(req, res, next) {
  var header = req.headers.authorization || '';
  var match = header.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  try {
    var payload = jwt.verify(match[1], JWT_SECRET);
    var user = users.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = users.toPublic(user);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  JWT_SECRET: JWT_SECRET,
  signToken: signToken,
  authenticate: authenticate
};
