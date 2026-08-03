/**
 * Minimal in-memory user store.
 *
 * This keeps the sample project free of external database dependencies so it
 * can be run and tested with nothing more than `npm install`. Swap this
 * module out for a real database (e.g. MongoDB, PostgreSQL) in production.
 */

let users = [];
let nextId = 1;

function reset() {
  users = [];
  nextId = 1;
}

function findByEmail(email) {
  const normalized = String(email).toLowerCase();
  return users.find((user) => user.email === normalized);
}

function findById(id) {
  return users.find((user) => user.id === Number(id));
}

function create({ name, email, passwordHash, role = 'user' }) {
  const user = {
    id: nextId++,
    name,
    email: String(email).toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

function all() {
  return users.slice();
}

module.exports = {
  reset,
  findByEmail,
  findById,
  create,
  all,
};
