'use strict';

const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'development-only-secret';

module.exports = function requireAuth(req, res, next) {
  const authorization = req.get('Authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authorization.slice('Bearer '.length);

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports.jwtSecret = jwtSecret;
