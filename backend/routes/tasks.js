const { Router } = require('express');
const db = require('../db');
const router = Router();

router.get('/', (req, res) => {
  try {
    const tasks = db.getAllTasks();
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
	try {
		if (Array.isArray(req.body)) {
			db.replaceAllTasks(req.body);
			return res.json({ ok: true, count: req.body.length });
		}
		const task = db.createTask(req.body);
		res.status(201).json(task);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

router.put('/:id', (req, res) => {
  try {
    const task = db.updateTask(Number(req.params.id), req.body);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const ok = db.deleteTask(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Task not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET time conflict check
router.get('/check-conflict', (req, res) => {
  try {
    const { due, start_time, end_time, excludeId } = req.query;
    const conflict = db.checkTimeConflict(due, start_time, end_time, excludeId ? Number(excludeId) : null);
    res.json(conflict || { conflict: false });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/toggle', (req, res) => {
  try {
    const tasks = db.getAllTasks();
    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) return res.status(404).json({ error: 'Task not found' });
    // streak: check → +1, uncheck → -1 (min 0), non-daily unchanged
    const newStreak = task.type === 'daily'
      ? (task.completed ? Math.max(0, (task.streak || 1) - 1) : (task.streak || 0) + 1)
      : task.streak;
    const updated = db.updateTask(task.id, { ...task, completed: !task.completed, streak: newStreak });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
