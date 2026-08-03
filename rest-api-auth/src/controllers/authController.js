const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.register({ name, email, password });
  const token = signToken(user);

  res.status(201).json({ token, user: User.toPublicJSON(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.verifyCredentials(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken(user);
  return res.status(200).json({ token, user: User.toPublicJSON(user) });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ user: User.toPublicJSON(req.user) });
});

module.exports = { register, login, me };
