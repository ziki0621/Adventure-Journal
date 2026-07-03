/* ================================================================
   Adventure Ledger — Agent Tool Registry
   Add a new tool: push one object to the TOOLS array.
   Each tool needs: name, description, parameters (JSON Schema), handler.
   ================================================================ */

const db = require('../db');

// ── Helpers ──
const today = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
const offset = (d) => { const dt = new Date(today()); dt.setDate(dt.getDate() + d); return dt.toISOString().slice(0, 10); };
const dayDiff = (ds) => Math.round((new Date(ds + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 86400000);

const TOOLS = [
  // ═══════════════════════════════════════════
  // Task CRUD
  // ═══════════════════════════════════════════
  {
    name: 'createTask',
    description: 'Create a new task. Type "daily" is for recurring habits, "side" is for one-off tasks. Returns the created task with its ID.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title (required)' },
        type: { type: 'string', enum: ['daily', 'side'], description: 'daily=recurring, side=one-off. Default daily.' },
        priority: { type: 'string', enum: ['High', 'Med', 'Low'], description: 'Default Med.' },
        due: { type: 'string', description: 'Due date YYYY-MM-DD. Default today.' },
        desc: { type: 'string', description: 'Optional notes/description.' },
        start_time: { type: 'string', description: 'Start time HH:MM, e.g. 09:00.' },
        end_time: { type: 'string', description: 'End time HH:MM, e.g. 10:30.' },
        recurrence: { type: 'string', enum: ['Daily', 'Weekly'], description: 'For daily tasks only. Default Daily.' },
      },
      required: ['title'],
    },
    handler: (p) => {
      const task = db.createTask({
        id: Date.now(),
        title: p.title.toUpperCase(),
        type: p.type || 'daily',
        desc: p.desc || '',
        due: p.due || today(),
        priority: p.priority || 'Med',
        line: p.type === 'side' ? 'Side' : (p.recurrence || 'Daily'),
        recurrence: p.type === 'side' ? undefined : (p.recurrence || 'Daily'),
        start: p.type === 'side' ? undefined : (p.due || today()),
        end: p.type === 'side' ? undefined : '',
        start_time: p.start_time || '',
        end_time: p.end_time || '',
        completed: false,
        streak: 0,
      });
      return { ok: true, task: { id: task.id, title: task.title, type: task.type, due: task.due, priority: task.priority, desc: task.desc || '', recurrence: task.recurrence, line: task.line, start: task.start, end: task.end, start_time: task.start_time || '', end_time: task.end_time || '' } };
    },
  },

  {
    name: 'updateTask',
    description: 'Update fields on an existing task. Only include fields you want to change.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Task ID (required)' },
        title: { type: 'string' },
        priority: { type: 'string', enum: ['High', 'Med', 'Low'] },
        due: { type: 'string', description: 'YYYY-MM-DD' },
        desc: { type: 'string' },
        recurrence: { type: 'string', enum: ['Daily', 'Weekly'] },
        start_time: { type: 'string', description: 'Start time HH:MM.' },
        end_time: { type: 'string', description: 'End time HH:MM.' },
      },
      required: ['id'],
    },
    handler: (p) => {
      const tasks = db.getAllTasks();
      const existing = tasks.find((t) => t.id === p.id);
      if (!existing) return { ok: false, error: 'Task not found' };
      const updates = {};
      if (p.title !== undefined) updates.title = p.title.toUpperCase();
      if (p.priority !== undefined) updates.priority = p.priority;
      if (p.due !== undefined) updates.due = p.due;
      if (p.desc !== undefined) updates.desc = p.desc;
      if (p.recurrence !== undefined) updates.recurrence = p.recurrence;
      if (p.start_time !== undefined) updates.start_time = p.start_time;
      if (p.end_time !== undefined) updates.end_time = p.end_time;
      const updated = db.updateTask(p.id, updates);
      return { ok: true, task: { id: updated.id, title: updated.title } };
    },
  },

  {
    name: 'deleteTask',
    description: 'Delete a task by its ID. Irreversible.',
    parameters: {
      type: 'object',
      properties: { id: { type: 'number', description: 'Task ID to delete' } },
      required: ['id'],
    },
    handler: (p) => {
      db.deleteTask(p.id);
      return { ok: true, deletedId: p.id };
    },
  },

  {
    name: 'toggleTask',
    description: 'Toggle a task between completed and not completed.',
    parameters: {
      type: 'object',
      properties: { id: { type: 'number', description: 'Task ID' } },
      required: ['id'],
    },
    handler: (p) => {
      const tasks = db.getAllTasks();
      const t = tasks.find((tk) => tk.id === p.id);
      if (!t) return { ok: false, error: 'Task not found' };
      db.updateTask(p.id, { completed: !t.completed });
      return { ok: true, completed: !t.completed };
    },
  },

  // ═══════════════════════════════════════════
  // Query
  // ═══════════════════════════════════════════
  {
    name: 'listTasks',
    description: 'List tasks. Use filters to narrow results.',
    parameters: {
      type: 'object',
      properties: {
        filter: { type: 'string', enum: ['overdue', 'today', 'upcoming', 'all'], description: 'Default all.' },
        type: { type: 'string', enum: ['daily', 'side'], description: 'Filter by task type.' },
        limit: { type: 'number', description: 'Max results. Default 20.' },
      },
      required: [],
    },
    handler: (p) => {
      let all = db.getAllTasks();
      if (p.type) all = all.filter((t) => t.type === p.type);
      if (p.filter === 'overdue') all = all.filter((t) => !t.completed && dayDiff(t.due) < 0);
      else if (p.filter === 'today') all = all.filter((t) => !t.completed && dayDiff(t.due) === 0);
      else if (p.filter === 'upcoming') all = all.filter((t) => !t.completed && dayDiff(t.due) > 0 && dayDiff(t.due) <= 7);
      all.sort((a, b) => a.due.localeCompare(b.due) || a.title.localeCompare(b.title));
      const limited = all.slice(0, p.limit || 20);
      return {
        ok: true,
        count: limited.length,
        total: all.length,
        tasks: limited.map((t) => ({ id: t.id, title: t.title, type: t.type, due: t.due, priority: t.priority, completed: t.completed, desc: t.desc ? t.desc.slice(0, 100) : '' })),
      };
    },
  },

  {
    name: 'getTaskStats',
    description: 'Get task statistics: how many total, active, done, overdue, due today.',
    parameters: { type: 'object', properties: {}, required: [] },
    handler: () => {
      const all = db.getAllTasks();
      const active = all.filter((t) => !t.completed);
      const done = all.filter((t) => t.completed);
      return {
        ok: true,
        stats: {
          total: all.length,
          active: active.length,
          done: done.length,
          overdue: active.filter((t) => dayDiff(t.due) < 0).length,
          today: active.filter((t) => dayDiff(t.due) === 0).length,
          highPriority: active.filter((t) => t.priority === 'High').length,
        },
      };
    },
  },

  {
    name: 'updateTaskDesc',
    description: 'Update just the description/notes field of a task.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Task ID' },
        desc: { type: 'string', description: 'New description text' },
      },
      required: ['id'],
    },
    handler: (p) => {
      const updated = db.updateTask(p.id, { desc: p.desc || '' });
      if (!updated) return { ok: false, error: 'Task not found' };
      return { ok: true, id: updated.id, desc: updated.desc };
    },
  },

  // ═══════════════════════════════════════════
  // Notes
  // ═══════════════════════════════════════════
  {
    name: 'createNote',
    description: 'Create a note / journal entry.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Note title (required)' },
        body: { type: 'string', description: 'Note content.' },
        date: { type: 'string', description: 'Date YYYY-MM-DD. Default today.' },
      },
      required: ['title'],
    },
    handler: (p) => {
      const note = db.createNote({ id: Date.now(), title: p.title, body: p.body || '', date: p.date || today() });
      return { ok: true, note: { id: note.id, title: note.title } };
    },
  },

  {
    name: 'searchNotes',
    description: 'Search notes by keyword in title and body.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keyword (required)' },
        limit: { type: 'number', description: 'Max results. Default 10.' },
      },
      required: ['query'],
    },
    handler: (p) => {
      const all = db.getAllNotes();
      const q = p.query.toLowerCase();
      const hits = all.filter((n) => n.title.toLowerCase().includes(q) || (n.body || '').toLowerCase().includes(q));
      const limited = hits.slice(0, p.limit || 10);
      return {
        ok: true,
        count: limited.length,
        notes: limited.map((n) => ({ id: n.id, title: n.title, date: n.date, snippet: (n.body || '').slice(0, 150) })),
      };
    },
  },

  // ═══════════════════════════════════════════
  // Quest Books
  // ═══════════════════════════════════════════
  {
    name: 'listQuestBooks',
    description: 'List all quest books with their quest lines and task counts.',
    parameters: { type: 'object', properties: {}, required: [] },
    handler: () => {
      const books = db.getAllQuestBooks();
      return {
        ok: true,
        count: books.length,
        books: books.map((b) => ({
          id: b.id,
          name: b.name,
          start: b.start,
          end: b.end,
          questLines: (b.questLines || []).map((l) => ({
            title: l.title,
            subtaskCount: (l.subtasks || []).length,
            doneCount: (l.subtasks || []).filter((s) => s.completed).length,
          })),
          independentCount: (b.independentQuests || []).length,
        })),
      };
    },
  },
];

// ── Generate the "available tools" section of the system prompt ──
function toolsToPromptText() {
  return TOOLS.map((t) => {
    const paramLines = Object.entries(t.parameters.properties || {}).map(([k, v]) => {
      const req = (t.parameters.required || []).includes(k) ? ' (required)' : '';
      return `    - ${k}: ${v.description}${req}`;
    }).join('\n');
    return `### ${t.name}\n${t.description}\nParameters:\n${paramLines || '  (none)'}`;
  }).join('\n\n');
}

// ── Build system prompt ──
function buildSystemPrompt(currentLanguage) {
  const zh = currentLanguage === 'zh';
  const todayStr = today();
  const lines = [
    zh
      ? '你是安雅，一位旅行向导。你可以通过调用工具来帮助用户管理任务和笔记。'
      : 'You are Anya, a travel guide. You can call tools to help the user manage tasks and notes.',
    '',
    zh ? '=== 规则 ===' : '=== Rules ===',
    zh
      ? '1. 和用户自然对话，用「」包裹你的对话。问候简短。'
      : '1. Speak naturally. Keep greetings brief.',
    zh
      ? '2. 当你需要执行操作时，在回复末尾输出工具调用。每个工具调用单独一行 JSON：'
      : '2. When you need to act, output tool calls at the end of your reply. One JSON per line:',
    '   {"tool":"toolName","params":{...}}',
    zh
      ? '3. 可以先问问题收集信息，确认后再调用工具。也可以直接调用工具（用户说"把XX删了"就直接删）。'
      : '3. You may ask clarifying questions first, or call tools directly when the user is explicit.',
    zh
      ? '4. 每天日常任务(daily)在勾选后第二天会自动重置。支线任务(side)完成一次就永远完成。'
      : '4. Daily tasks reset each day after completion. Side quests are one-and-done.',
    zh
      ? '5. 永远不要编造任务的 ID。用 listTasks 查询真实 ID。'
      : '5. Never invent task IDs. Use listTasks to look up real IDs.',
    zh
      ? `6. 今天的日期是 ${todayStr}。计算截止日期时以此为基准。`
      : `6. Today is ${todayStr}. Use this as the reference for due dates.`,
    '',
    zh ? '=== 可用工具 ===' : '=== Available Tools ===',
    toolsToPromptText(),
    '',
    zh
      ? '每次回复末尾可以输出零个或多个工具调用。需要多个操作时输出多行 JSON。'
      : 'You may output zero or more tool calls at the end of each reply. Use multiple JSON lines for multiple actions.',
  ];
  return lines.join('\n');
}

// ── Parse tool calls from LLM response ──
function parseToolCalls(text) {
  const calls = [];
  const re = /\{\s*"tool"\s*:\s*"(\w+)"\s*,\s*"params"\s*:\s*(\{[^}]+\})\s*\}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    try {
      calls.push({ tool: m[1], params: JSON.parse(m[2]) });
    } catch (e) { /* skip malformed */ }
  }
  // Also try: {"tool": "x", "params": {...}} (with spaces)
  if (calls.length === 0) {
    const re2 = /\{\s*"tool"\s*:\s*"(\w+)"\s*,\s*"params"\s*:\s*(\{[^}]+\})\s*\}/g;
    while ((m = re2.exec(text)) !== null) {
      try { calls.push({ tool: m[1], params: JSON.parse(m[2]) }); } catch (e) {}
    }
  }
  return calls;
}

// ── Execute a tool call ──
async function executeTool(name, params) {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) return { ok: false, error: `Unknown tool: ${name}` };
  try {
    const result = await tool.handler(params);
    return result;
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── Strip tool call JSON from displayed text ──
function stripToolCalls(text) {
  return text.replace(/\{\s*"tool"\s*:\s*"\w+"\s*,\s*"params"\s*:\s*\{[^}]+\}\s*\}/g, '')
    .replace(/\n{3,}/g, '\n\n').trim();
}

module.exports = { TOOLS, buildSystemPrompt, parseToolCalls, executeTool, stripToolCalls };
