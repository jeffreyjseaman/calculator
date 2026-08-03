'use strict';

var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var ISSUER = 'calculator';
var ALGORITHM = 'HS256';
var DEFAULT_TTL = 3600;

function resolveSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set when NODE_ENV is production');
  }

  // A generated secret changes on every restart, which invalidates tokens that
  // were already handed out and cannot be shared by a second instance.
  console.warn('JWT_SECRET is not set; signing tokens with a temporary secret');

  return crypto.randomBytes(32).toString('hex');
}

function resolveTtl() {
  var configured = parseInt(process.env.JWT_TTL, 10);

  return configured > 0 ? configured : DEFAULT_TTL;
}

var secret = resolveSecret();
var ttl = resolveTtl();

exports.ttl = ttl;

exports.sign = function(user) {
  return jwt.sign({}, secret, {
    algorithm: ALGORITHM,
    subject: String(user.id),
    issuer: ISSUER,
    expiresIn: ttl
  });
};

exports.verify = function(token, callback) {
  // Naming the algorithm keeps a caller from choosing a weaker one by editing
  // the "alg" header of the token they present.
  jwt.verify(token, secret, { algorithms: [ALGORITHM], issuer: ISSUER }, callback);
};
