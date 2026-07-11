const { Router } = require('express');
const db = require('../db');
const { buildSystemPrompt, openAiTools, parseToolCalls, executeTool, stripToolCalls } = require('../agent/tools');
const router = Router();

function publicAgentConfig(config) {
  return {
    apiBase: config.apiBase || '',
    model: config.model || '',
    hasApiKey: !!config.apiKey,
  };
}

function normalizeModelMessage(message) {
  if (!message) return { role: 'assistant', content: '' };
  return {
    role: message.role || 'assistant',
    content: message.content ?? '',
    ...(message.tool_calls ? { tool_calls: message.tool_calls } : {}),
  };
}

function parseToolCallArguments(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

async function executeStructuredToolCalls(toolCalls) {
  const results = [];
  const toolMessages = [];
  for (const call of toolCalls) {
    const fn = call.function || {};
    const name = fn.name || call.name;
    const params = parseToolCallArguments(fn.arguments || call.arguments);
    const result = await executeTool(name, params);
    results.push({ id: call.id, tool: name, params, result });
    toolMessages.push({
      role: 'tool',
      tool_call_id: call.id,
      name,
      content: JSON.stringify(result),
    });
  }
  return { results, toolMessages };
}

function legacyToolResultMessage(toolResults, lang) {
  return {
    role: 'user',
    content: '[SYSTEM] Tool results:\n' + toolResults.map((tr) =>
      `${tr.tool}: ` + JSON.stringify(tr.result)
    ).join('\n') + '\n\n' + (lang === 'zh'
      ? '请根据这些结果继续帮助用户。如果需要更多信息，继续调用工具。如果任务已完成，请生成自然回复。'
      : 'Please continue based on these results. Call more tools if needed, or generate a natural reply if done.'),
  };
}

function isUnsupportedToolsError(status, text) {
  if (status < 400 || status >= 500) return false;
  return /tools?|tool_choice|function.?call|tool_calls/i.test(text || '');
}

async function callModel(config, headers, bodyBase, conversation, options = {}) {
  const body = {
    model: bodyBase.model,
    messages: conversation,
    stream: false,
  };
  if (options.withTools) {
    body.tools = bodyBase.tools;
    body.tool_choice = bodyBase.tool_choice;
  }
  const response = await fetch(config.apiBase, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error('HTTP ' + response.status + ': ' + text.slice(0, 200));
    error.status = response.status;
    error.responseText = text;
    throw error;
  }
  return JSON.parse(text || '{}');
}

async function callModelWithToolFallback(config, headers, bodyBase, conversation, state) {
  if (state.toolsUnsupported) {
    return callModel(config, headers, bodyBase, conversation, { withTools: false });
  }
  try {
    return await callModel(config, headers, bodyBase, conversation, { withTools: true });
  } catch (error) {
    if (isUnsupportedToolsError(error.status, error.responseText)) {
      state.toolsUnsupported = true;
      return callModel(config, headers, bodyBase, conversation, { withTools: false });
    }
    throw error;
  }
}

// GET messages
router.get('/messages', (req, res) => {
  try { res.json(db.getAgentMessages()); } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST message
router.post('/messages', (req, res) => {
  try { res.json(db.addAgentMessage(req.body.role, req.body.text)); } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE all messages
router.delete('/messages', (req, res) => {
  try { db.clearAgentMessages(); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET/PUT config
router.get('/config', (req, res) => {
  try { res.json(publicAgentConfig(db.getAgentConfig())); } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/config', (req, res) => {
  try { res.json(publicAgentConfig(db.setAgentConfig(req.body))); } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /chat — Agent execution loop with tool calling ──
router.post('/chat', async (req, res) => {
  const config = db.getAgentConfig();
  if (!config.apiBase) {
    res.status(400).json({ error: 'API not configured' });
    return;
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'messages array required' });
    return;
  }

  // Detect language from last user message
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const hasChinese = lastUser && /[一-鿿]/.test(lastUser.content);
  const lang = hasChinese ? 'zh' : 'en';

  // Build conversation
  const systemMsg = { role: 'system', content: buildSystemPrompt(lang) };
  const conversation = [systemMsg, ...messages];

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (config.apiKey) headers['Authorization'] = 'Bearer ' + config.apiKey;
    const bodyBase = {
      model: config.model || 'default',
      tools: openAiTools(),
      tool_choice: 'auto',
    };

    // ── Phase 1: Tool execution loop (non-streaming) ──
    let allToolResults = [];
    const providerState = { toolsUnsupported: false };
    const MAX_ITERATIONS = 5;

    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
      const data = await callModelWithToolFallback(config, headers, bodyBase, conversation, providerState);
      const modelMessage = normalizeModelMessage(data.choices?.[0]?.message);
      const replyText = modelMessage.content || '';
      const structuredCalls = Array.isArray(modelMessage.tool_calls) ? modelMessage.tool_calls : [];

      if (structuredCalls.length > 0) {
        const { results: toolResults, toolMessages } = await executeStructuredToolCalls(structuredCalls);
        allToolResults.push(...toolResults);
        res.write('data: ' + JSON.stringify({ type: 'tool_results', results: toolResults }) + '\n\n');
        conversation.push(modelMessage);
        conversation.push(...toolMessages);
        continue;
      }

      // Fallback for models/providers that ignore `tools` and emit JSON in text.
      const legacyCalls = parseToolCalls(replyText);
      if (legacyCalls.length === 0) {
        // No tool calls — LLM is done. Stream its reply.
        const clean = stripToolCalls(replyText);
        conversation.push({ role: 'assistant', content: replyText });

        // Stream the final reply in batches (50ms intervals)
        res.write('data: ' + JSON.stringify({ type: 'reply_start' }) + '\n\n');
        const chars = [...clean];
        let batchIdx = 0;
        const batchSize = 8;
        const batchInterval = setInterval(() => {
          if (batchIdx >= chars.length) { clearInterval(batchInterval); return; }
          const batch = chars.slice(batchIdx, batchIdx + batchSize).join('');
          res.write('data: ' + JSON.stringify({ type: 'delta', content: batch }) + '\n\n');
          batchIdx += batchSize;
        }, 50);
        // Wait for batching to finish, then send DONE
        const doneCheck = setInterval(() => {
          if (batchIdx >= chars.length) {
            clearInterval(doneCheck);
            if (allToolResults.length > 0) {
              res.write('data: ' + JSON.stringify({ type: 'tool_summary', count: allToolResults.length }) + '\n\n');
            }
            res.write('data: [DONE]\n\n');
            res.end();
          }
        }, 60);
        return;

      }

      const toolResults = [];
      for (const call of legacyCalls) {
        const result = await executeTool(call.tool, call.params);
        toolResults.push({ tool: call.tool, params: call.params, result });
      }

      allToolResults.push(...toolResults);

      // Send tool results as SSE event
      res.write('data: ' + JSON.stringify({ type: 'tool_results', results: toolResults }) + '\n\n');

      conversation.push({ role: 'assistant', content: replyText });
      conversation.push(legacyToolResultMessage(toolResults, lang));
    }

    // Max iterations reached — ask LLM for final reply
    const finalConversation = [
      ...conversation,
      {
        role: 'user',
        content: lang === 'zh'
          ? '[SYSTEM] 工具调用轮次已达到上限。请不要再调用工具，直接用自然语言总结当前结果。'
          : '[SYSTEM] Tool-call iteration limit reached. Do not call more tools; summarize the current result in natural language.',
      },
    ];
    try {
      const fd = await callModel(config, headers, bodyBase, finalConversation, { withTools: false });
      const finalMessage = normalizeModelMessage(fd.choices?.[0]?.message);
      const finalText = stripToolCalls(finalMessage.content || '');
      conversation.push({ role: 'assistant', content: finalText });
      res.write('data: ' + JSON.stringify({ type: 'reply_start' }) + '\n\n');
      for (const char of finalText) {
        res.write('data: ' + JSON.stringify({ type: 'delta', content: char }) + '\n\n');
      }
    } catch (error) {
      res.write('data: ' + JSON.stringify({ error: error.message }) + '\n\n');
    }
    if (allToolResults.length > 0) {
      res.write('data: ' + JSON.stringify({ type: 'tool_summary', count: allToolResults.length }) + '\n\n');
    }
    res.write('data: [DONE]\n\n');
  } catch (err) {
    res.write('data: ' + JSON.stringify({ error: err.message }) + '\n\n');
  }
  res.end();
});

module.exports = router;
