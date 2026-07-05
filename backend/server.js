const express = require('express');
const path = require('path');

const tasksRouter = require('./routes/tasks');
const questBooksRouter = require('./routes/questBooks');
const notesRouter = require('./routes/notes');
const dayNotesRouter = require('./routes/dayNotes');
const agentRouter = require('./routes/agent');
const dailyChecksRouter = require('./routes/dailyChecks');

const app = express();
const PORT = Number(process.env.PORT || 4173);

app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (!origin) return next();
  try {
    const { hostname } = new URL(origin);
    if (hostname === '127.0.0.1' || hostname === 'localhost') {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      if (req.method === 'OPTIONS') return res.sendStatus(204);
      return next();
    }
  } catch (e) {
    // Fall through to deny malformed origins.
  }
  return res.status(403).json({ error: 'Forbidden origin' });
});
app.use(express.json({ limit: '1mb' }));

// API routes
app.use('/api/tasks', tasksRouter);
app.use('/api/quest-books', questBooksRouter);
app.use('/api/notes', notesRouter);
app.use('/api/day-notes', dayNotesRouter);
app.use('/api/agent', agentRouter);
app.use('/api/daily-checks', dailyChecksRouter);

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
