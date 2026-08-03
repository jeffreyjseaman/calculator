module.exports = function(app) {
  var arithmetic = require("./controllers/arithmeticController");
  var auth = require("./controllers/authController");
  var authenticate = require("./middleware/authenticate");

  app.route("/arithmetic").get(arithmetic.calculate);

  app.route("/auth/register").post(auth.register);
  app.route("/auth/login").post(auth.login);
  app.route("/auth/me").get(authenticate, auth.me);
};
