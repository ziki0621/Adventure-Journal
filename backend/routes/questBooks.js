const { Router } = require('express');
const db = require('../db');
const router = Router();

router.get('/', (req, res) => {
  try {
    res.json(db.getAllQuestBooks());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const book = db.getBookById(Number(req.params.id));
    if (!book) return res.status(404).json({ error: 'Quest book not found' });
    res.json(book);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      db.replaceAllQuestBooks(req.body);
      return res.json({ ok: true, count: req.body.length });
    }
    const book = db.createQuestBook(req.body);
    res.status(201).json(book);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const book = db.updateQuestBook(Number(req.params.id), req.body);
    if (!book) return res.status(404).json({ error: 'Quest book not found' });
    res.json(book);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.deleteQuestBook(Number(req.params.id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:bookId/subtasks/:subId/toggle', (req, res) => {
  try {
    const lineId = Number(req.query.lineId);
    const ok = db.toggleSubtask(Number(req.params.bookId), lineId, Number(req.params.subId));
    if (!ok) return res.status(404).json({ error: 'Subtask not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:bookId/subtasks/:subId', (req, res) => {
  try {
    const lineId = Number(req.query.lineId);
    const ok = db.deleteSubtask(Number(req.params.bookId), lineId, Number(req.params.subId));
    if (!ok) return res.status(404).json({ error: 'Subtask not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:bookId/independent/:iqId/toggle', (req, res) => {
  try {
    const ok = db.toggleIndependentQuest(Number(req.params.bookId), Number(req.params.iqId));
    if (!ok) return res.status(404).json({ error: 'Independent quest not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:bookId/independent/:iqId', (req, res) => {
  try {
    const ok = db.deleteIndependentQuest(Number(req.params.bookId), Number(req.params.iqId));
    if (!ok) return res.status(404).json({ error: 'Independent quest not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
