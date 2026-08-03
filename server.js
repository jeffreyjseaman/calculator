var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json({ limit: '10kb' }));

// Sits between the body parser and the routes so that it reports unparseable
// bodies without taking over the error handling the routes below do themselves.
app.use(function(err, req, res, next) {
  if (err.type === 'entity.too.large') {
    res.status(413).json({ error: "Request body is too large" });
  } else if (err.type === 'entity.parse.failed') {
    res.status(400).json({ error: "Request body must be valid JSON" });
  } else {
    next(err);
  }
});

var routes = require("./api/routes");
routes(app);

if (! module.parent) {
  app.listen(port);
}

module.exports = app

console.log("Server running on port " + port);
