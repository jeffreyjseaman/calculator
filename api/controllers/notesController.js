'use strict';

const { randomUUID } = require('crypto');
const store = require('../models/store');

function findNote(id, userId) {
  return store.notes.find(function(note) {
    return note.id === id && note.userId === userId;
  });
}

function validateNote(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';

  if (!title || title.length > 120) {
    return 'Title is required and must be 120 characters or fewer';
  }
  if (content.length > 5000) {
    return 'Content must be 5,000 characters or fewer';
  }
  return null;
}

function publicNote(note) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  };
}

exports.list = function list(req, res) {
  const notes = store.notes
    .filter(function(note) { return note.userId === req.user.sub; })
    .map(publicNote);
  res.json({ notes: notes });
};

exports.create = function create(req, res) {
  const body = req.body || {};
  const validationError = validateNote(body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const now = new Date().toISOString();
  const note = {
    id: randomUUID(),
    userId: req.user.sub,
    title: body.title.trim(),
    content: body.content.trim(),
    createdAt: now,
    updatedAt: now
  };
  store.notes.push(note);
  return res.status(201).json({ note: publicNote(note) });
};

exports.getById = function getById(req, res) {
  const note = findNote(req.params.id, req.user.sub);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  return res.json({ note: publicNote(note) });
};

exports.update = function update(req, res) {
  const note = findNote(req.params.id, req.user.sub);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const body = req.body || {};
  const validationError = validateNote(body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  note.title = body.title.trim();
  note.content = body.content.trim();
  note.updatedAt = new Date().toISOString();
  return res.json({ note: publicNote(note) });
};

exports.remove = function remove(req, res) {
  const index = store.notes.findIndex(function(note) {
    return note.id === req.params.id && note.userId === req.user.sub;
  });
  if (index === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }

  store.notes.splice(index, 1);
  return res.status(204).send();
};
