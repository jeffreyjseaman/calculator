'use strict';

var jwt = require('jsonwebtoken');
var userStore = require('../services/userStore');

function jwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }

  return 'development-only-secret-change-me';
}

exports.secret = jwtSecret;

exports.required = function(req, res, next) {
  var authorization = req.get('authorization') || '';
  var match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    var payload = jwt.verify(match[1], jwtSecret(), {
      algorithms: ['HS256'],
      issuer: 'calculator-api',
      audience: 'calculator-client'
    });
    var user = userStore.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
