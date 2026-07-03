const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.ADVENTURE_DATA_DIR || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'adventure.db');
let db = null, dbReady = false;

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function loadDb() {
  ensureDir();
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) { const buffer = fs.readFileSync(DB_PATH); return new SQL.Database(buffer); }
  return new SQL.Database();
}

function saveDb() { if (!db) return; fs.writeFileSync(DB_PATH, Buffer.from(db.export())); }

function syncQueryAll(sql, params = []) {
  if (!db) return [];
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) { const r = syncQueryAll(sql, params); return r.length ? r[0] : null; }
function run(sql, params = []) { db.run(sql, params); }

async function initDb() {
  dbReady = false; db = await loadDb(); db.run('PRAGMA foreign_keys = ON');
  migrate(); dbReady = true; return db;
}

function migrate() {
  const d = db; if (!d) return;
  d.run('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, type TEXT NOT NULL DEFAULT \'daily\', title TEXT NOT NULL, desc TEXT DEFAULT \'\', due TEXT NOT NULL, priority TEXT DEFAULT \'Med\', line TEXT DEFAULT \'Independent\', completed INTEGER DEFAULT 0, recurrence TEXT, start TEXT, end TEXT, streak INTEGER DEFAULT 0)');
  ensureColumn('tasks', 'start_time', 'TEXT');
  ensureColumn('tasks', 'end_time', 'TEXT');
  d.run('CREATE TABLE IF NOT EXISTS quest_books (id INTEGER PRIMARY KEY, name TEXT NOT NULL, created_at TEXT DEFAULT (datetime(\'now\')))');
  ensureColumn('quest_books', 'start', 'TEXT');
  ensureColumn('quest_books', 'end', 'TEXT');
  d.run('CREATE TABLE IF NOT EXISTS quest_lines (id INTEGER PRIMARY KEY, book_id INTEGER REFERENCES quest_books(id) ON DELETE CASCADE, title TEXT NOT NULL)');
  d.run('CREATE TABLE IF NOT EXISTS subtasks (id INTEGER PRIMARY KEY, line_id INTEGER REFERENCES quest_lines(id) ON DELETE CASCADE, title TEXT NOT NULL, due TEXT NOT NULL, completed INTEGER DEFAULT 0)');
  ensureColumn('subtasks', 'start', 'TEXT');
  ensureColumn('subtasks', 'end', 'TEXT');
  ensureColumn('subtasks', 'desc', "TEXT DEFAULT ''");
  ensureColumn('subtasks', 'start_time', 'TEXT');
  ensureColumn('subtasks', 'end_time', 'TEXT');
  d.run('CREATE TABLE IF NOT EXISTS independent_quests (id INTEGER PRIMARY KEY, book_id INTEGER REFERENCES quest_books(id) ON DELETE CASCADE, title TEXT NOT NULL, due TEXT NOT NULL, priority TEXT DEFAULT \'Med\', completed INTEGER DEFAULT 0, desc TEXT DEFAULT \'\')');
  ensureColumn('independent_quests', 'start', 'TEXT');
  ensureColumn('independent_quests', 'end', 'TEXT');
  ensureColumn('independent_quests', 'start_time', 'TEXT');
  ensureColumn('independent_quests', 'end_time', 'TEXT');
  d.run('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, title TEXT NOT NULL, body TEXT DEFAULT \'\', date TEXT NOT NULL, created_at TEXT DEFAULT (datetime(\'now\')))');
  d.run('CREATE TABLE IF NOT EXISTS day_notes (date TEXT PRIMARY KEY, content TEXT DEFAULT \'\')');
  d.run('CREATE TABLE IF NOT EXISTS agent_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL, text TEXT NOT NULL)');
  d.run('CREATE TABLE IF NOT EXISTS agent_config (id INTEGER PRIMARY KEY CHECK (id = 1), api_base TEXT DEFAULT \'\', api_key TEXT DEFAULT \'\', model TEXT DEFAULT \'\')');
  if (!queryOne('SELECT id FROM agent_config WHERE id = 1')) d.run('INSERT INTO agent_config (id, api_base, api_key, model) VALUES (1, \'\', \'\', \'\')');
  // Seed data is now managed by seed.js — no automatic inserts here.
  saveDb();
}

function ensureColumn(table, column, definition) {
  const columns = syncQueryAll(`PRAGMA table_info(${table})`).map((row) => row.name);
  if (!columns.includes(column)) db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

// ── Tasks ──
function getAllTasks() { return syncQueryAll('SELECT * FROM tasks ORDER BY id ASC').map(rowToTask); }
function createTask(data) {
  const id = data.id || Date.now();
  run('INSERT INTO tasks (id,type,title,desc,due,priority,line,completed,recurrence,start,end,streak,start_time,end_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,data.type,data.title,data.desc||'',data.due,data.priority||'Med',data.line||'Independent',data.completed?1:0,data.recurrence||null,data.start||null,data.end||null,data.streak||0,data.start_time||'',data.end_time||'']);
  saveDb(); return queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
}
function updateTask(id, data) {
  const e = queryOne('SELECT * FROM tasks WHERE id = ?', [id]); if (!e) return null;
  const m = { ...rowToTask(e), ...data };
  run('UPDATE tasks SET type=?,title=?,desc=?,due=?,priority=?,line=?,completed=?,recurrence=?,start=?,end=?,streak=?,start_time=?,end_time=? WHERE id=?',[m.type,m.title,m.desc||'',m.due,m.priority,m.line,m.completed?1:0,m.recurrence||null,m.start||null,m.end||null,m.streak||0,m.start_time||'',m.end_time||'',id]);
  saveDb(); return queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
}
function deleteTask(id) { run('DELETE FROM tasks WHERE id = ?', [id]); saveDb(); return true; }
function replaceAllTasks(arr) { run('BEGIN TRANSACTION'); try { run('DELETE FROM tasks'); arr.forEach((t) => run('INSERT INTO tasks (id,type,title,desc,due,priority,line,completed,recurrence,start,end,streak,start_time,end_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[t.id,t.type,t.title,t.desc||'',t.due,t.priority||'Med',t.line||'Independent',t.completed?1:0,t.recurrence||null,t.start||null,t.end||null,t.streak||0,t.start_time||'',t.end_time||''])); run('COMMIT'); saveDb(); } catch (e) { run('ROLLBACK'); throw e; } }

// ── Quest Books ──
function getAllQuestBooks() {
  return syncQueryAll('SELECT * FROM quest_books ORDER BY id ASC').map((b) => ({
    id: b.id, name: b.name, start: b.start || null, end: b.end || null,
    questLines: syncQueryAll('SELECT * FROM quest_lines WHERE book_id = ? ORDER BY id ASC', [b.id]).map((l) => ({ ...l, subtasks: syncQueryAll('SELECT * FROM subtasks WHERE line_id = ? ORDER BY id ASC', [l.id]) })),
    independentQuests: syncQueryAll('SELECT * FROM independent_quests WHERE book_id = ? ORDER BY id ASC', [b.id]),
  }));
}
function createQuestBook(data) {
  const bid = data.id || Date.now();
  run('INSERT INTO quest_books (id, name, start, end) VALUES (?, ?, ?, ?)', [bid, data.name, data.start || null, data.end || null]);
  (data.questLines || []).forEach((l, li) => {
    const lid = l.id || (bid + li + 1);
    run('INSERT INTO quest_lines (id, book_id, title) VALUES (?, ?, ?)', [lid, bid, l.title]);
    (l.subtasks || []).forEach((s, si) => { run('INSERT INTO subtasks (id, line_id, title, due, completed) VALUES (?, ?, ?, ?, ?)', [s.id || (bid + li * 100 + si + 10), lid, s.title, s.due, s.completed ? 1 : 0]); });
  });
  (data.independentQuests || []).forEach((iq, i) => { run('INSERT INTO independent_quests (id, book_id, title, due, priority, completed, desc) VALUES (?, ?, ?, ?, ?, ?, ?)', [iq.id || (bid + 1000 + i), bid, iq.title, iq.due, iq.priority || 'Med', iq.completed ? 1 : 0, iq.desc || '']); });
  saveDb(); return getBookById(bid);
}
function updateQuestBook(id, data) {
  run('DELETE FROM quest_lines WHERE book_id = ?', [id]); run('DELETE FROM independent_quests WHERE book_id = ?', [id]);
  run('UPDATE quest_books SET name = ?, start = ?, end = ? WHERE id = ?', [data.name, data.start || null, data.end || null, id]);
  (data.questLines || []).forEach((l, li) => {
    const lid = l.id || (id * 100 + li + 1);
    run('INSERT INTO quest_lines (id, book_id, title) VALUES (?, ?, ?)', [lid, id, l.title]);
    (l.subtasks || []).forEach((s, si) => { run('INSERT INTO subtasks (id, line_id, title, due, completed) VALUES (?, ?, ?, ?, ?)', [s.id || (id * 1000 + li * 100 + si + 10), lid, s.title, s.due, s.completed ? 1 : 0]); });
  });
  (data.independentQuests || []).forEach((iq, i) => { run('INSERT INTO independent_quests (id, book_id, title, due, priority, completed, desc) VALUES (?, ?, ?, ?, ?, ?, ?)', [iq.id || (id + 2000 + i), id, iq.title, iq.due, iq.priority || 'Med', iq.completed ? 1 : 0, iq.desc || '']); });
  saveDb(); return getBookById(id);
}
function deleteQuestBook(id) { run('DELETE FROM quest_books WHERE id = ?', [id]); saveDb(); }
function getBookById(id) {
  const b = queryOne('SELECT * FROM quest_books WHERE id = ?', [id]); if (!b) return null;
  return { id: b.id, name: b.name, start: b.start || null, end: b.end || null, questLines: syncQueryAll('SELECT * FROM quest_lines WHERE book_id = ? ORDER BY id ASC', [id]).map((l) => ({ ...l, subtasks: syncQueryAll('SELECT * FROM subtasks WHERE line_id = ? ORDER BY id ASC', [l.id]) })), independentQuests: syncQueryAll('SELECT * FROM independent_quests WHERE book_id = ? ORDER BY id ASC', [id]) };
}
function replaceAllQuestBooks(arr) { run('BEGIN TRANSACTION'); try { run('DELETE FROM quest_books'); arr.forEach((b) => createQuestBook(b)); run('COMMIT'); saveDb(); } catch (e) { run('ROLLBACK'); throw e; } }
function toggleSubtask(bookId, lineId, subId) { const s = queryOne('SELECT * FROM subtasks WHERE id = ? AND line_id = ?', [subId, lineId]); if (!s) return false; run('UPDATE subtasks SET completed = ? WHERE id = ?', [s.completed ? 0 : 1, subId]); saveDb(); return true; }
function deleteSubtask(bookId, lineId, subId) { run('DELETE FROM subtasks WHERE id = ? AND line_id = ?', [subId, lineId]); saveDb(); return true; }
function toggleIndependentQuest(bookId, iqId) { const iq = queryOne('SELECT * FROM independent_quests WHERE id = ? AND book_id = ?', [iqId, bookId]); if (!iq) return false; run('UPDATE independent_quests SET completed = ? WHERE id = ?', [iq.completed ? 0 : 1, iqId]); saveDb(); return true; }
function deleteIndependentQuest(bookId, iqId) { run('DELETE FROM independent_quests WHERE id = ? AND book_id = ?', [iqId, bookId]); saveDb(); return true; }

// ── Notes ──
function getAllNotes() { return syncQueryAll('SELECT * FROM notes ORDER BY id DESC'); }
function createNote(data) { const id = data.id || Date.now(); run('INSERT INTO notes (id, title, body, date) VALUES (?,?,?,?)', [id, data.title, data.body||'', data.date]); saveDb(); return queryOne('SELECT * FROM notes WHERE id = ?', [id]); }
function updateNote(id, data) { run('UPDATE notes SET title=?, body=?, date=? WHERE id=?', [data.title, data.body||'', data.date, id]); saveDb(); return queryOne('SELECT * FROM notes WHERE id = ?', [id]); }
function deleteNote(id) { run('DELETE FROM notes WHERE id = ?', [id]); saveDb(); return true; }
function replaceAllNotes(arr) { run('BEGIN TRANSACTION'); try { run('DELETE FROM notes'); arr.forEach((n) => createNote(n)); run('COMMIT'); saveDb(); } catch (e) { run('ROLLBACK'); throw e; } }

// ── Day Notes ──
function getDayNote(date) { const r = queryOne('SELECT * FROM day_notes WHERE date = ?', [date]); return r ? r.content : ''; }
function getAllDayNotes() { const rows = syncQueryAll('SELECT * FROM day_notes'); const obj = {}; rows.forEach((r) => { obj[r.date] = r.content; }); return obj; }
function setDayNote(date, content) { run('INSERT OR REPLACE INTO day_notes (date, content) VALUES (?,?)', [date, content||'']); saveDb(); return { date, content: content || '' }; }

// ── Agent ──
function getAgentMessages() { return syncQueryAll('SELECT * FROM agent_messages ORDER BY id ASC'); }
function addAgentMessage(role, text) { run('INSERT INTO agent_messages (role, text) VALUES (?,?)', [role, text]); saveDb(); return { id: syncQueryAll('SELECT last_insert_rowid() as id')[0].id, role, text }; }
function clearAgentMessages() { run('DELETE FROM agent_messages'); saveDb(); }
function getAgentConfig() { const r = queryOne('SELECT * FROM agent_config WHERE id = 1'); return r ? { apiBase: r.api_base, apiKey: r.api_key, model: r.model } : { apiBase: '', apiKey: '', model: '' }; }
function setAgentConfig(data) { run('INSERT OR REPLACE INTO agent_config (id, api_base, api_key, model) VALUES (1,?,?,?)', [data.apiBase||'', data.apiKey||'', data.model||'']); saveDb(); return data; }

// ── Helpers ──
function rowToTask(row) { return { id: row.id, type: row.type, title: row.title, desc: row.desc, due: row.due, priority: row.priority, line: row.line, completed: !!row.completed, recurrence: row.recurrence, start: row.start, end: row.end, streak: row.streak, start_time: row.start_time || '', end_time: row.end_time || '' }; }

// ── Time-slot conflict check ──
function checkTimeConflict(due, start_time, end_time, excludeId) {
  if (!start_time || !end_time) return null; // no time set = no conflict
  const all = getAllTasks();
  for (const t of all) {
    if (t.due !== due) continue;
    if (excludeId && t.id === excludeId) continue;
    if (!t.start_time || !t.end_time) continue;
    if (start_time < t.end_time && t.start_time < end_time) {
      return { conflict: true, taskId: t.id, title: t.title, time: t.start_time + ' - ' + t.end_time };
    }
  }
  return null;
}

module.exports = {
  initDb, getAllTasks, createTask, updateTask, deleteTask, replaceAllTasks,
  getAllQuestBooks, createQuestBook, updateQuestBook, deleteQuestBook, getBookById,
  toggleSubtask, deleteSubtask, toggleIndependentQuest, deleteIndependentQuest, replaceAllQuestBooks,
  getAllNotes, createNote, updateNote, deleteNote, replaceAllNotes,
  getDayNote, getAllDayNotes, setDayNote,
  getAgentMessages, addAgentMessage, clearAgentMessages,
  getAgentConfig, setAgentConfig,
  checkTimeConflict,
};
