'use strict';

var users = [];
var nextId = 1;

function reset() {
  users = [];
  nextId = 1;
}

function findByUsername(username) {
  return users.find(function(user) {
    return user.username.toLowerCase() === String(username).toLowerCase();
  });
}

function findById(id) {
  return users.find(function(user) {
    return user.id === id;
  });
}

function create(username, passwordHash) {
  var user = {
    id: nextId++,
    username: username,
    passwordHash: passwordHash,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  return user;
}

function toPublic(user) {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt
  };
}

module.exports = {
  reset: reset,
  findByUsername: findByUsername,
  findById: findById,
  create: create,
  toPublic: toPublic
};
