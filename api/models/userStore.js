'use strict';

var bcrypt = require('bcryptjs');

var users = new Map();

function createUser(username, password) {
  if (users.has(username)) {
    return Promise.reject(new Error('User already exists'));
  }

  return bcrypt.hash(password, 10).then(function(hashedPassword) {
    users.set(username, { username: username, password: hashedPassword });
    return { username: username };
  });
}

function findUser(username) {
  return users.get(username);
}

function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password);
}

function seedDefaultUser() {
  if (!users.has('admin')) {
    return createUser('admin', 'password123');
  }
  return Promise.resolve();
}

module.exports = {
  createUser: createUser,
  findUser: findUser,
  verifyPassword: verifyPassword,
  seedDefaultUser: seedDefaultUser
};
