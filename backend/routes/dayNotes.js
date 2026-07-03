const { Router } = require('express');
const db = require('../db');
const router = Router();

router.get('/', (req, res) => {
  try { res.json(db.getAllDayNotes()); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:date', (req, res) => {
  try { res.json({ date: req.params.date, content: db.getDayNote(req.params.date) }); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:date', (req, res) => {
  try { res.json(db.setDayNote(req.params.date, req.body.content)); } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
