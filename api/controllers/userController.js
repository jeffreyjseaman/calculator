'use strict';

var userModel = require('../models/userModel');

exports.me = function(req, res) {
  res.json({ user: userModel.toJSON(req.user) });
};
