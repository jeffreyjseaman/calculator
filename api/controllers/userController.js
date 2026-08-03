'use strict';

exports.me = function(req, res) {
  res.json({ user: req.user });
};
