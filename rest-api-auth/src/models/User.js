const bcrypt = require('bcryptjs');
const config = require('../config/env');
const userStore = require('../data/userStore');

const VALID_ROLES = ['user', 'admin'];

async function register({ name, email, password, role = 'user' }) {
  if (userStore.findByEmail(email)) {
    const error = new Error('A user with that email already exists');
    error.statusCode = 409;
    throw error;
  }

  const safeRole = VALID_ROLES.includes(role) ? role : 'user';
  const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
  return userStore.create({ name, email, passwordHash, role: safeRole });
}

async function verifyCredentials(email, password) {
  const user = userStore.findByEmail(email);
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  return isMatch ? user : null;
}

function toPublicJSON(user) {
  const { id, name, email, role, createdAt } = user;
  return { id, name, email, role, createdAt };
}

module.exports = {
  register,
  verifyCredentials,
  toPublicJSON,
  findById: userStore.findById,
  all: userStore.all,
};
