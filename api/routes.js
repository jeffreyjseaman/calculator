module.exports = function(app) {
  var arithmetic = require("./controllers/arithmeticController");
  var auth = require("./controllers/authController");
  var authenticate = require("./middleware/auth").authenticate;

  app.route("/auth/register").post(auth.register);
  app.route("/auth/login").post(auth.login);

  app.route("/arithmetic").get(authenticate, arithmetic.calculate);
};
