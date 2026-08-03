'use strict';

var bcrypt = require('bcryptjs');
var config = require('../config');

// Simple in-memory user store. Swap this module for a database-backed
// implementation without touching controllers.
var users = [];
var nextId = 1;

exports.create = function(username, password) {
  var user = {
    id: nextId++,
    username: username,
    passwordHash: bcrypt.hashSync(password, config.bcryptRounds),
    createdAt: new Date().toISOString()
  };
  users.push(user);
  return user;
};

exports.findByUsername = function(username) {
  return users.find(function(user) {
    return user.username === username;
  });
};

exports.findById = function(id) {
  return users.find(function(user) {
    return user.id === id;
  });
};

exports.verifyPassword = function(user, password) {
  return bcrypt.compareSync(password, user.passwordHash);
};

// Public representation of a user (never expose the password hash).
exports.toJSON = function(user) {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt
  };
};

exports.clear = function() {
  users = [];
  nextId = 1;
};
