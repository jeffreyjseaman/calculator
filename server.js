var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.use(express.static('public'));

var routes = require("./api/routes");
routes(app);

app.use(function(req, res) {
  res.status(404).json({ error: "Not found" });
});

app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  var status = err.status || 500;
  var message = status >= 500 ? "Internal server error" : err.message;
  res.status(status).json({ error: message });
});

if (!module.parent) {
  app.listen(port, function() {
    console.log("Server running on port " + port);
  });
}

module.exports = app;
