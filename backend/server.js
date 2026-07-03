const express = require('express');
const cors = require('cors');
const path = require('path');

const tasksRouter = require('./routes/tasks');
const questBooksRouter = require('./routes/questBooks');
const notesRouter = require('./routes/notes');
const dayNotesRouter = require('./routes/dayNotes');
const agentRouter = require('./routes/agent');

const app = express();
const PORT = Number(process.env.PORT || 4173);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// API routes
app.use('/api/tasks', tasksRouter);
app.use('/api/quest-books', questBooksRouter);
app.use('/api/notes', notesRouter);
app.use('/api/day-notes', dayNotesRouter);
app.use('/api/agent', agentRouter);

// Static files — serve website/
const staticDir = path.join(__dirname, '..', 'website');
app.use(express.static(staticDir));

// SPA fallback — /index.html for all non-API GETs
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(staticDir, 'index.html'));
});

const { initDb } = require('./db');

async function start() {
  await initDb();
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Adventure Ledger running at http://127.0.0.1:${PORT}/`);
  });
}

start();
