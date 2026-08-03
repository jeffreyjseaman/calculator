'use strict';

// This store is intentionally in-memory to keep the API self-contained.
// Replace it with a database-backed repository before running multiple instances.
const users = [];
const notes = [];

module.exports = {
  users: users,
  notes: notes,
  reset: function reset() {
    users.length = 0;
    notes.length = 0;
  }
};
