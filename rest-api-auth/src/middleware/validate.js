const { validationResult } = require('express-validator');

/**
 * Runs after express-validator check(...) middlewares and short-circuits
 * the request with a 400 response if any validation errors were collected.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  return next();
}

module.exports = validate;
