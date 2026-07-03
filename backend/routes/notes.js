const { Router } = require('express');
const db = require('../db');
const router = Router();

router.get('/', (req, res) => {
  try { res.json(db.getAllNotes()); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      db.replaceAllNotes(req.body);
      return res.json({ ok: true, count: req.body.length });
    }
    res.status(201).json(db.createNote(req.body));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', (req, res) => {
  try {
    const note = db.updateNote(Number(req.params.id), req.body);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    const ok = db.deleteNote(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Note not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
