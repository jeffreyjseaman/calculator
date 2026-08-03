'use strict';

var jwt = require('jsonwebtoken');
var config = require('../config');
var userModel = require('../models/userModel');

// Express middleware that requires a valid "Authorization: Bearer <token>"
// header. On success, attaches the authenticated user as req.user.
module.exports = function(req, res, next) {
  var header = req.headers.authorization || '';
  var parts = header.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  var payload;
  try {
    payload = jwt.verify(parts[1], config.jwtSecret);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  var user = userModel.findById(payload.sub);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = user;
  next();
};
