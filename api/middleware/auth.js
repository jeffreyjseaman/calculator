'use strict';

var jwt = require('jsonwebtoken');

var JWT_SECRET = process.env.JWT_SECRET || 'calculator-dev-secret-change-in-production';
var TOKEN_EXPIRY = '24h';

function authenticate(req, res, next) {
  var authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  var token = authHeader.slice(7);

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

module.exports = {
  authenticate: authenticate,
  signToken: signToken,
  JWT_SECRET: JWT_SECRET
};
