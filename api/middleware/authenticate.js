'use strict';

var tokens = require('../auth/tokens');
var users = require('../models/userModel');

var BEARER = /^Bearer +(\S+) *$/i;

function challenge(res, error, description) {
  var header = 'Bearer realm="api"';

  if (error) {
    header += ', error="' + error + '", error_description="' + description + '"';
  }

  res.set('WWW-Authenticate', header);
  res.status(401).json({ error: description });
}

// Guards a route: the request continues only when it carries a bearer token
// that this server signed and that still resolves to an account, which is then
// available to the handler as req.user.
module.exports = function(req, res, next) {
  var authorization = req.get('Authorization');

  if (!authorization) {
    return challenge(res, null, 'An access token is required');
  }

  var match = BEARER.exec(authorization);

  if (!match) {
    return challenge(res, 'invalid_request', 'The Authorization header must use the Bearer scheme');
  }

  tokens.verify(match[1], function(err, payload) {
    if (err) {
      var expired = err.name === 'TokenExpiredError';

      return challenge(res, 'invalid_token', expired ? 'The access token has expired' : 'The access token is not valid');
    }

    var user = users.findById(payload.sub);

    if (!user) {
      // Correctly signed, but the account it names is gone.
      return challenge(res, 'invalid_token', 'The access token is not valid');
    }

    req.user = user;

    next();
  });
};
