module.exports = function(app) {
  const arithmetic = require('./controllers/arithmeticController');
  const auth = require('./controllers/authController');
  const notes = require('./controllers/notesController');
  const requireAuth = require('./middleware/requireAuth');

  // Existing calculator endpoint remains available for backwards compatibility.
  app.route('/arithmetic').get(arithmetic.calculate);

  app.post('/api/auth/register', auth.register);
  app.post('/api/auth/login', auth.login);
  app.get('/api/auth/me', requireAuth, auth.me);

  app.route('/api/notes')
    .get(requireAuth, notes.list)
    .post(requireAuth, notes.create);
  app.route('/api/notes/:id')
    .get(requireAuth, notes.getById)
    .put(requireAuth, notes.update)
    .delete(requireAuth, notes.remove);
};
