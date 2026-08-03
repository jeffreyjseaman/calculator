module.exports = function(app) {
  var arithmetic = require("./controllers/arithmeticController");
  var auth = require("./controllers/authController");
  var authenticate = require("./middleware/authenticate");
  var users = require("./controllers/userController");

  app.route("/api/auth/register").post(auth.register);
  app.route("/api/auth/login").post(auth.login);
  app.route("/api/users/me").get(authenticate.required, users.me);
  app.route("/api/arithmetic").get(authenticate.required, arithmetic.calculate);

  // Kept public for compatibility with the original calculator sample.
  app.route("/arithmetic").get(arithmetic.calculate);
};
