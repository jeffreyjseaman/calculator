'use strict';

var bcrypt = require('bcryptjs');
var crypto = require('crypto');

var usersByEmail = new Map();
var usersById = new Map();

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt
  };
}

exports.create = async function(email, password) {
  var normalizedEmail = email.trim().toLowerCase();

  if (usersByEmail.has(normalizedEmail)) {
    return null;
  }

  var user = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
    createdAt: new Date().toISOString()
  };

  usersByEmail.set(normalizedEmail, user);
  usersById.set(user.id, user);
  return publicUser(user);
};

exports.verify = async function(email, password) {
  var user = usersByEmail.get(email.trim().toLowerCase());

  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return null;
  }

  return publicUser(user);
};

exports.findById = function(id) {
  var user = usersById.get(id);
  return user ? publicUser(user) : null;
};
