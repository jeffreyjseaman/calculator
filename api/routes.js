module.exports = function(app) {
  var arithmetic = require("./controllers/arithmeticController");
  var authController = require("./controllers/authController");
  var auth = require("./middleware/auth");

  app.route("/auth/register").post(authController.register);
  app.route("/auth/login").post(authController.login);
  app.route("/auth/me").get(auth.authenticate, authController.me);

  app.route("/arithmetic").get(auth.authenticate, arithmetic.calculate);
};
