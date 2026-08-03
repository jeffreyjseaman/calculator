const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const listUsers = asyncHandler(async (req, res) => {
  const users = User.all().map(User.toPublicJSON);
  res.status(200).json({ users });
});

module.exports = { listUsers };
