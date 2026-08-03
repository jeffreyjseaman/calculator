const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const routes = require('./api/routes');
routes(app);

app.use(function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
});

app.use(function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message
  });
});

if (!module.parent) {
  app.listen(port);
}

module.exports = app;

console.log('Server running on port ' + port);
