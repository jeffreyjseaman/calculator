'use strict';

var bcrypt = require('bcryptjs');
var crypto = require('crypto');

var COST = 10;

// bcrypt reads at most 72 bytes of a password and silently ignores the rest,
// so callers are expected to reject anything longer instead of storing a hash
// that a shorter password would also satisfy.
exports.MAX_PASSWORD_BYTES = 72;

var users = [];
var nextId = 1;

// Hash of a value nobody can supply. Comparing against it when an email is
// unknown makes a failed lookup cost the same as a wrong password, so the
// response time does not reveal which accounts exist.
var ABSENT_USER_HASH = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), COST);

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

exports.normalizeEmail = normalizeEmail;

exports.findByEmail = function(email) {
  var normalized = normalizeEmail(email);

  return users.find(function(user) {
    return user.email === normalized;
  }) || null;
};

exports.findById = function(id) {
  var numericId = Number(id);

  return users.find(function(user) {
    return user.id === numericId;
  }) || null;
};

exports.create = function(attributes, callback) {
  bcrypt.hash(attributes.password, COST, function(err, passwordHash) {
    if (err) {
      return callback(err);
    }

    var user = {
      id: nextId++,
      email: normalizeEmail(attributes.email),
      name: attributes.name || null,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(user);

    callback(null, user);
  });
};

exports.verifyPassword = function(user, password, callback) {
  bcrypt.compare(password, user ? user.passwordHash : ABSENT_USER_HASH, function(err, matches) {
    if (err) {
      return callback(err);
    }

    callback(null, Boolean(user) && matches);
  });
};

// The representation that is safe to send to a client: everything except the
// password hash.
exports.publicAttributes = function(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt
  };
};

exports.reset = function() {
  users = [];
  nextId = 1;
};
