const { Router } = require('express');
const db = require('../db');
const router = Router();

// POST /api/daily-checks/auto-reset — call once on app open
router.post('/auto-reset', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    db.autoResetDailyTasks(today);
    const checks = db.getTodayDailyChecks(today);
    res.json({ ok: true, today, checks });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/daily-checks/:taskId/:date/toggle
router.patch('/:taskId/:date/toggle', (req, res) => {
  try {
    const result = db.toggleDailyCheck(Number(req.params.taskId), req.params.date);
    const streak = db.getDailyStreak(Number(req.params.taskId));
    res.json({ ...result, streak });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/daily-checks/:taskId
router.get('/:taskId', (req, res) => {
  try {
    const checks = db.getDailyChecks(Number(req.params.taskId));
    res.json(checks);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
