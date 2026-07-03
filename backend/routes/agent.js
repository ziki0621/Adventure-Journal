const { Router } = require('express');
const db = require('../db');
const { buildSystemPrompt, parseToolCalls, executeTool, stripToolCalls } = require('../agent/tools');
const router = Router();

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
  try { res.json(db.getAgentConfig()); } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/config', (req, res) => {
  try { res.json(db.setAgentConfig(req.body)); } catch (e) { res.status(500).json({ error: e.message }); }
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
    const bodyBase = { model: config.model || 'default' };

    // ── Phase 1: Tool execution loop (non-streaming) ──
    let allToolResults = [];
    const MAX_ITERATIONS = 5;

    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
      const response = await fetch(config.apiBase, {
        method: 'POST', headers,
        body: JSON.stringify({ ...bodyBase, messages: conversation, stream: false }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        res.write('data: ' + JSON.stringify({ error: 'HTTP ' + response.status + ': ' + errText.slice(0, 200) }) + '\n\n');
        res.end();
        return;
      }

      const data = await response.json();
      const replyText = data.choices?.[0]?.message?.content || '';

      // Parse tool calls from this reply
      const calls = parseToolCalls(replyText);
      if (calls.length === 0) {
        // No tool calls — LLM is done. Stream its reply.
        const clean = stripToolCalls(replyText);
        conversation.push({ role: 'assistant', content: replyText });

        // Stream the final reply character by character (simulated SSE streaming)
        res.write('data: ' + JSON.stringify({ type: 'reply_start' }) + '\n\n');
        for (const char of clean) {
          res.write('data: ' + JSON.stringify({ type: 'delta', content: char }) + '\n\n');
        }
        if (allToolResults.length > 0) {
          res.write('data: ' + JSON.stringify({ type: 'tool_results', results: allToolResults }) + '\n\n');
        }
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      // Execute tools
      const toolResults = [];
      for (const call of calls) {
        const result = await executeTool(call.tool, call.params);
        toolResults.push({ tool: call.tool, params: call.params, result });
      }

      allToolResults.push(...toolResults);

      // Send tool results as SSE event
      res.write('data: ' + JSON.stringify({ type: 'tool_results', results: toolResults }) + '\n\n');

      // Feed tool results back to conversation
      const toolMsg = {
        role: 'user',
        content: '[SYSTEM] Tool results:\n' + toolResults.map((tr) =>
          `${tr.tool}: ` + JSON.stringify(tr.result)
        ).join('\n') + '\n\n' + (lang === 'zh'
          ? '请根据这些结果继续帮助用户。如果需要更多信息，继续调用工具。如果任务已完成，请生成自然回复。'
          : 'Please continue based on these results. Call more tools if needed, or generate a natural reply if done.'),
      };

      conversation.push({ role: 'assistant', content: replyText });
      conversation.push(toolMsg);
    }

    // Max iterations reached — ask LLM for final reply
    const finalResponse = await fetch(config.apiBase, {
      method: 'POST', headers,
      body: JSON.stringify({ ...bodyBase, messages: conversation, stream: false }),
    });
    if (finalResponse.ok) {
      const fd = await finalResponse.json();
      const finalText = stripToolCalls(fd.choices?.[0]?.message?.content || '');
      conversation.push({ role: 'assistant', content: finalText });
      res.write('data: ' + JSON.stringify({ type: 'reply_start' }) + '\n\n');
      for (const char of finalText) {
        res.write('data: ' + JSON.stringify({ type: 'delta', content: char }) + '\n\n');
      }
    }
    if (allToolResults.length > 0) {
      res.write('data: ' + JSON.stringify({ type: 'tool_results', results: allToolResults }) + '\n\n');
    }
    res.write('data: [DONE]\n\n');
  } catch (err) {
    res.write('data: ' + JSON.stringify({ error: err.message }) + '\n\n');
  }
  res.end();
});

module.exports = router;
