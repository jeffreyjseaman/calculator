module.exports = function(app) {
  var arithmetic = require("./controllers/arithmeticController");
  var auth = require("./controllers/authController");
  var users = require("./controllers/userController");
  var requireAuth = require("./middleware/auth");

  app.route("/arithmetic").get(arithmetic.calculate);

  app.route("/auth/register").post(auth.register);
  app.route("/auth/login").post(auth.login);

  app.route("/users/me").get(requireAuth, users.me);
};
