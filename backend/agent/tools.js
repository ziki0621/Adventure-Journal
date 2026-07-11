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
    description: 'Prepare a draft task for the user to review. The task will NOT be created until the user confirms. Returns a draft that will be shown in the editor.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title (required)' },
        type: { type: 'string', enum: ['daily', 'side'], description: 'daily=recurring, side=one-off. Default daily.' },
        due: { type: 'string', description: 'Due date YYYY-MM-DD. Default today.' },
        desc: { type: 'string', description: 'Optional notes/description.' },
        start_time: { type: 'string', description: 'Start time HH:MM, e.g. 09:00.' },
        end_time: { type: 'string', description: 'End time HH:MM, e.g. 10:30.' },
        recurrence: { type: 'string', enum: ['Daily', 'Weekly'], description: 'For daily tasks only. Default Daily.' },
      },
      required: ['title'],
    },
    handler: (p) => {
      // Return draft ONLY — no DB insert. The user must confirm in the editor.
      const draft = {
        type: p.type || 'daily',
        title: p.title.toUpperCase(),
        desc: p.desc || '',
        due: p.due || today(),
                recurrence: p.type === 'side' ? undefined : (p.recurrence || 'Daily'),
        line: p.type === 'side' ? 'Side' : (p.recurrence || 'Daily'),
        start: p.due || today(),
        end: '',
        start_time: p.start_time || '',
        end_time: p.end_time || '',
      };
      return { ok: true, draft };
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
        tasks: limited.map((t) => ({ id: t.id, title: t.title, type: t.type, due: t.due, completed: t.completed, desc: t.desc ? t.desc.slice(0, 100) : '' })),
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

const TOOL_MAP = new Map(TOOLS.map((tool) => [tool.name, tool]));

function validateAndCoerceParams(schema, input) {
  const params = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const properties = schema.properties || {};
  const required = schema.required || [];
  const output = {};
  const errors = [];

  required.forEach((key) => {
    if (params[key] === undefined || params[key] === null || params[key] === '') {
      errors.push(`Missing required parameter: ${key}`);
    }
  });

  Object.entries(properties).forEach(([key, spec]) => {
    if (params[key] === undefined || params[key] === null) return;
    let value = params[key];
    if (spec.type === 'number' && typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) value = parsed;
    }
    if (spec.type === 'string' && typeof value !== 'string') {
      value = String(value);
    }
    if (spec.type === 'number' && typeof value !== 'number') {
      errors.push(`Parameter ${key} must be a number`);
      return;
    }
    if (spec.type === 'string' && typeof value !== 'string') {
      errors.push(`Parameter ${key} must be a string`);
      return;
    }
    if (spec.enum && !spec.enum.includes(value)) {
      errors.push(`Parameter ${key} must be one of: ${spec.enum.join(', ')}`);
      return;
    }
    output[key] = value;
  });

  return { ok: errors.length === 0, params: output, errors };
}

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

function openAiTools() {
  return TOOLS.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

function parseJsonObjectAt(text, startIndex) {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = startIndex; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (char === '\\') {
        escape = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
    } else if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        const raw = text.slice(startIndex, i + 1);
        return { value: JSON.parse(raw), endIndex: i + 1, raw };
      }
    }
  }
  return null;
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
      ? '1. 和用户自然对话，用「」包裹你的对话。问候简短。回复必须是纯文本，禁止使用 Markdown、表格、代码块、emoji 或任何格式化语法。'
      : '1. Speak naturally. Keep greetings brief. Replies must be plain text — no Markdown, tables, code blocks, emoji, or any formatting syntax.',
    zh
      ? '2. 当用户提到要做什么事时，你主动从话中推断任务要素并直接调用 createTask：'
      : '2. When the user mentions doing something, actively infer task elements from their words and call createTask directly:',
    zh ? '   - 标题：提取核心动作，精炼为4-10字的短句。如「明天去超市买牛奶和鸡蛋」→ 标题「去超市购物」，备注写「牛奶、鸡蛋」' : '   - Title: Extract the core action into a short phrase. Put details in desc.',
    zh ? '   - 类型：每天/习惯/坚持 → daily；心血来潮/临时/一次性 → side；长期/项目/计划 → questbook。没说默认 daily。' : '   - Type: habit/routine → daily; one-off → side; project → questbook. Default daily.',
    zh ? '   - 日期：「明天/后天/下周三/7月8号」→ 对应日期；没说 → 今天' : '   - Date: "tomorrow/Wednesday/July 8" → that date; not mentioned → today',
    zh ? '   - 时间：「早上/下午/晚上/8点到10点」→ start_time/end_time。没说的话不填。' : '   - Time: "morning/8am-10am" → start_time/end_time. Leave empty if not mentioned.',
    zh ? '   - 备注：用户提到的预算、地点、链接、原因、注意事项等额外细节，全部写进 desc。' : '   - Notes: Budget, location, links, reasons, caveats → put them all in desc.',
    zh ? '   - 优先级已在系统中移除，不要询问优先级。' : '   - Priority has been removed from the system. Do not ask about it.',
    '',
    zh ? '3. 只在真正缺信息时才追问。以下情况直接创建，不要多问：' : '3. Only ask when information is truly missing. Create directly in these cases:',
    zh ? '   - 「帮我记一下明天买牛奶」→ 信息完整，直接创建' : '   - "Remind me to buy milk tomorrow" → all info present, create directly',
    zh ? '   - 「我要开始健身」→ daily + 今天，直接创建' : '   - "I\'m going to start working out" → daily + today, create directly',
    zh ? '   - 「下周五提交报告」→ side + 下周五日期，直接创建' : '   - "Submit report next Friday" → side + next Friday, create directly',
    zh ? '   以下情况才追问：任务过于笼统无法确定具体事项、跨天项目没提时间范围、让你安排但没说任何具体内容。' : '   Only ask when: the task is too vague to determine specifics, a multi-day project has no timeframe, or you\'re asked to "arrange something" with no details.',
    '',
    zh ? '4. 每次最多追问 1 个问题。追问时给出你的猜测作为选项，而不只是抛回给用户。' : '4. Ask at most 1 question per turn. Offer your best guess as an option rather than just throwing it back.',
    '',
    zh ? '5. 每天日常任务(daily)在勾选后第二天会自动重置。支线任务(side)完成一次就永久完成。' : '5. Daily tasks reset each day after completion. Side quests are one-and-done.',
    zh ? '6. 永远不要编造任务的 ID。用 listTasks 查询真实 ID。' : '6. Never invent task IDs. Use listTasks to look up real IDs.',
    zh ? `7. 今天的日期是 ${todayStr}，当前时间是 ${new Date().toLocaleTimeString('zh-CN', {timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit'})}（北京时间）。计算截止日期和提醒时以此为基准。` : `7. Today is ${todayStr}, current time is ${new Date().toLocaleTimeString('en-US', {timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hour12:false})} (Beijing time). Use this as the reference for due dates and reminders.`,
    zh ? '8. 用 createTask 只会生成草稿，系统会弹出编辑框让用户确认后才真正创建。告诉用户这一点。' : '8. createTask only produces a draft — the system will show an editor for the user to confirm before the task is actually created. Tell the user this.',
    '',
    zh ? '=== 可用工具 ===' : '=== Available Tools ===',
    toolsToPromptText(),
    '',
    zh
      ? '如果当前模型不支持标准工具调用，才可以在回复末尾输出 fallback JSON：{"tool":"toolName","params":{...}}。'
      : 'Only if the current model does not support standard tool calls, output fallback JSON at the end: {"tool":"toolName","params":{...}}.',
  ];
  return lines.join('\n');
}

// ── Parse tool calls from LLM response ──
function parseToolCalls(text) {
  const calls = [];
  let index = 0;
  while (index < text.length) {
    const start = text.indexOf('{', index);
    if (start === -1) break;
    try {
      const parsed = parseJsonObjectAt(text, start);
      if (!parsed) break;
      if (parsed.value && typeof parsed.value.tool === 'string' && parsed.value.params && typeof parsed.value.params === 'object') {
        calls.push({ tool: parsed.value.tool, params: parsed.value.params, raw: parsed.raw });
      }
      index = parsed.endIndex;
    } catch (e) {
      index = start + 1;
    }
  }
  return calls;
}

// ── Execute a tool call ──
async function executeTool(name, params) {
  const tool = TOOL_MAP.get(name);
  if (!tool) return { ok: false, error: `Unknown tool: ${name}` };
  const validation = validateAndCoerceParams(tool.parameters || {}, params || {});
  if (!validation.ok) return { ok: false, error: 'Invalid tool parameters', details: validation.errors };
  try {
    const result = await tool.handler(validation.params);
    return result;
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── Strip tool call JSON from displayed text ──
function stripToolCalls(text) {
  let output = text;
  const calls = parseToolCalls(text);
  calls.forEach((call) => {
    if (call.raw) output = output.replace(call.raw, '');
  });
  return output.replace(/\n{3,}/g, '\n\n').trim();
}

module.exports = { TOOLS, buildSystemPrompt, openAiTools, parseToolCalls, executeTool, stripToolCalls };
