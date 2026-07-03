/* ================================================================
   Adventure Ledger — Render: Dialogue (Anya AI Agent)
   Intro sequence, SSE-streamed chat via backend /api/agent/chat.
   The backend handles the LLM + tool-calling loop.
   Depends on: state.js, i18n.js, utils.js, api.js, render.js
   ================================================================ */

      // ── Dialogue state ──
      let dialogueLineIdx = 0, dialogueCharIdx = 0;
      let dialogueShowOptions = false;
      let dialogueCustomReply = '';
      let dialogueTimer = null;
      let dialogueStreamTimer = null;
      let currentAnyaExpression = 'normal';    // current portrait expression

      // ── Anya expression engine ──
      function getAnyaExpression(text, isThinking, hasToolResult) {
        // Priority order: stream of consciousness cues
        const t = text || '';
        const zh = currentLanguage === 'zh';

        // Anger first — error, conflict, can't do
        if (/错误|失败|不能|冲突|无法|抱歉.{0,5}不能|出问题|不行|不可以/i.test(t) ||
            /error|failed|cannot|sorry.{0,10}can.t|conflict|unable|impossible/i.test(t)) {
          return 'angry';
        }

        // Confusion — don't understand, need clarification
        if (/\?{2,}|不懂|不明白|什么意思|不太清楚|不确定|没听懂|什么[？?]|咦|诶/i.test(t) ||
            /\?{2,}|don.t understand|not sure|what do you mean|confused|pardon/i.test(t)) {
          return 'confused';
        }

        // Lightbulb — created task, found solution, gave idea
        if (hasToolResult) return 'idea';
        if (/创建|登记|帮你|搞定|完成.{0,3}了|已经登记|已经创建|试试看|建议|可以这样|好主意|对了/i.test(t) ||
            /created|registered|done|try this|suggestion|good idea|how about|let.s |I.ve added/i.test(t)) {
          return 'idea';
        }

        // Happy — positive, warm, welcoming
        if (/太好|很棒|不错|欢迎|高兴|开心|哈哈|嘿嘿|没问题|当然|是的|可以|好的呀|来吧|加油|棒|赞/i.test(t) ||
            /great|welcome|happy|glad|sure|of course|no problem|awesome|wonderful|excellent/i.test(t)) {
          return Math.random() < 0.5 ? 'happy' : 'happy2';
        }

        // Thinking — asking questions, processing
        if (isThinking) return 'thinking';
        if (/你觉得|你认为|怎么样|要不要|需要.{0,4}[？?]|什么[？?]|哪个|还是|或者/i.test(t) ||
            /what|which|would you|how about|let me|hmm|think/i.test(t)) {
          return 'thinking';
        }

        // Default
        return 'normal';
      }

      function setAnyaPortrait(expression) {
        if (!expression || expression === currentAnyaExpression) return;
        currentAnyaExpression = expression;
        const portrait = document.querySelector('.dialogue-portrait');
        if (!portrait) return;
        const src = 'assets/anya-' + expression + '.png';
        if (portrait.src && portrait.src.endsWith(src)) return;
        // Fade out → swap → fade in
        portrait.style.transition = 'opacity 200ms ease';
        portrait.style.opacity = '0';
        setTimeout(() => {
          portrait.src = src;
          portrait.style.opacity = '1';
        }, 200);
      }

      function dialogueLines() {
        const zh = currentLanguage === 'zh';
        return zh
          ? ['「你好！我是你的终端操作向导，安雅。欢迎使用这台古老的任务管制终端。」',
             '「在这个终端里，你可以记录待办任务、查阅历史档案，或是执行系统备份。」',
             '「需要我为你导览一下系统的基础操作吗？」']
          : ['"Hello! I\'m Anya, your terminal guide. Welcome to this vintage quest-control terminal."',
             '"Here you can log quests, browse your archives, or run system backups."',
             '"Would you like a quick tour of the basics?"'];
      }

      function dialogueOptionLabels() {
        if (currentLanguage === 'zh') return ['需要导览', '我自己看看'];
        return ['Show me around', 'I\'ll explore'];
      }

      function updateDialogueStatus(state) {
        const pill = $('#dialogueStatusPill');
        if (!pill) return;
        pill.classList.remove('offline', 'thinking');
        if (state) pill.classList.add(state);
      }

      function dialogueStopTimer() {
        if (dialogueTimer) { clearInterval(dialogueTimer); dialogueTimer = null; }
        if (dialogueStreamTimer) { clearInterval(dialogueStreamTimer); dialogueStreamTimer = null; }
      }

      function renderDialogue() {
        const hasAPI = !!(agentConfig.apiBase || agentConfig.model);
        updateDialogueStatus(hasAPI ? null : 'offline');

        const lines = dialogueLines();
        const currentText = dialogueCustomReply || lines[dialogueLineIdx];
        const textEl = $('#dialogueText');
        const arrowEl = $('#dialogueArrow');
        const optionsEl = $('#dialogueOptions');
        const chatBar = $('#dialogueChatBar');

        if (chatBar) chatBar.style.display = dialogueCustomReply ? '' : 'none';

        dialogueStopTimer();
        if (dialogueCharIdx < currentText.length) {
          if (textEl) textEl.innerHTML = escapeHtml(currentText.substring(0, dialogueCharIdx)) + '<span class="cursor">_</span>';
          if (arrowEl) arrowEl.style.display = 'none';
          dialogueTimer = setInterval(() => { dialogueCharIdx++; renderDialogue(); }, 40);
          return;
        }

        // Fully typed
        if (textEl) textEl.innerHTML = escapeHtml(currentText);
        dialogueStopTimer();

        if (!dialogueCustomReply && arrowEl) {
          arrowEl.style.display = dialogueShowOptions ? 'none' : 'flex';
        } else if (arrowEl) {
          arrowEl.style.display = 'none';
        }

        if (dialogueCharIdx >= currentText.length && !dialogueCustomReply && dialogueLineIdx === lines.length - 1) {
          dialogueShowOptions = true;
        }

        if (optionsEl) {
          if (dialogueShowOptions && !dialogueCustomReply) {
            const [yesLabel, noLabel] = dialogueOptionLabels();
            optionsEl.innerHTML = [
              '<div class="dialogue-option-btn" id="dialogueOptionYes"><div class="chamfer shaded">',
              '<span class="chamfer-outer"><span class="chamfer-mid"><span class="chamfer-line"><span class="chamfer-face serif">' + escapeHtml(yesLabel) + '</span></span></span></span>',
              '</div></div>',
              '<div class="dialogue-option-btn" id="dialogueOptionNo"><div class="chamfer">',
              '<span class="chamfer-outer"><span class="chamfer-mid"><span class="chamfer-line"><span class="chamfer-face serif">' + escapeHtml(noLabel) + '</span></span></span></span>',
              '</div></div>',
            ].join('');
          } else {
            optionsEl.innerHTML = '';
          }
        }
      }

      function dialogueHandleNext() {
        if (dialogueShowOptions) return;
        const lines = dialogueLines();
        const currentText = dialogueCustomReply || lines[dialogueLineIdx];
        if (dialogueCharIdx < currentText.length) { dialogueCharIdx = currentText.length; renderDialogue(); return; }
        if (!dialogueCustomReply && dialogueLineIdx < lines.length - 1) { dialogueLineIdx++; dialogueCharIdx = 0; if (dialogueLineIdx === lines.length - 1) setAnyaPortrait('confused'); renderDialogue(); }
      }

      function dialogueHandleOption(type) {
        const zh = currentLanguage === 'zh';
        dialogueShowOptions = false;
        dialogueCharIdx = 0;
        if (type === 'yes') {
          dialogueCustomReply = zh
            ? '「太好了！你可以点击左上角的【菜单按钮】打开导航，或是直接在首页输入你的第一个任务。需要时点我的头像呼叫我。」'
            : '"Great! Tap the menu button to open navigation, or type your first quest on the home screen. Tap my portrait anytime you need me."';
        } else {
          dialogueCustomReply = zh
            ? '「没问题，你可以慢慢摸索。需要帮助时随时点击我的头像呼叫我喔！」'
            : '"No problem — take your time. Tap my portrait anytime to call me back!"';
        }
        setAnyaPortrait('happy');
        renderDialogue();
        const chatBar = $('#dialogueChatBar');
        if (chatBar) chatBar.style.display = '';
      }

      function openDialogue() {
        dialogueLineIdx = 0; dialogueCharIdx = 0;
        dialogueShowOptions = false; dialogueCustomReply = '';
        dialogueStopTimer();
        setAnyaPortrait('normal');
        $('#viewContent').classList.add('task-field-hidden');
        $('#dialogueView').classList.remove('task-field-hidden');
        const clearBtn = $('#dialogueClearBtn');
        if (clearBtn) clearBtn.style.display = agentMessages.length ? '' : 'none';
        updateDialogueStatus((agentConfig.apiBase || agentConfig.model) ? null : 'offline');
        renderDialogue();
        $('#dialogueInput').focus();
      }

      function closeDialogue() {
        dialogueStopTimer();
        if (agentAbortController) { agentAbortController.abort(); agentIsStreaming = false; }
        agentMessages = agentMessages.filter((m) => m.role !== 'typing');
        saveAgentMessages();
        $('#viewContent').classList.remove('task-field-hidden');
        $('#dialogueView').classList.add('task-field-hidden');
        renderView();
      }

      function clearDialogueHistory() {
        agentMessages = []; agentSaveIndex = 0;
        clearAgentMessagesAPI();
        dialogueCustomReply = ''; dialogueLineIdx = 0; dialogueCharIdx = 0; dialogueShowOptions = false;
        dialogueStopTimer();
        if (agentAbortController) { agentAbortController.abort(); agentIsStreaming = false; }
        const clearBtn = $('#dialogueClearBtn');
        if (clearBtn) clearBtn.style.display = 'none';
        renderDialogue();
        const chatBar = $('#dialogueChatBar');
        if (chatBar) chatBar.style.display = 'none';
      }

      // ── SSE event handler ──
      function handleAgentSSEEvent(evt) {
        try {
          const data = JSON.parse(evt.data);
          if (!data) return;

          if (data.type === 'delta') {
            dialogueCustomReply += data.content;
            dialogueCharIdx = dialogueCustomReply.length;
            const textEl = $('#dialogueText');
            if (textEl) textEl.innerHTML = escapeHtml(dialogueCustomReply) + '<span class="cursor">_</span>';
            $('#dialogueArrow').style.display = 'none';
            $('#dialogueOptions').innerHTML = '';
          }

          if (data.type === 'reply_start') {
            dialogueCustomReply = '';
            dialogueCharIdx = 0;
            dialogueStopTimer();
          }

          if (data.type === 'tool_results') {
            setAnyaPortrait('idea');
            // Check for draft tasks — open editor for user review (NOT yet created)
            let pendingDraft = null;
            (data.results || []).forEach((r) => {
              if (r.tool === 'createTask' && r.result && r.result.ok && r.result.draft) {
                pendingDraft = r.result.draft;
              }
            });
            // Reload data only if non-createTask tools ran (updateDesc, deleteTask, etc.)
            const hasWrite = (data.results || []).some((r) => r.tool !== 'createTask');
            (hasWrite ? Promise.all([
              loadTasks().then((d) => { if (d.length) tasks = d; }),
              loadQuestBooks().then((d) => { if (d.length) questBooks = d; }),
              loadNotes().then((d) => { if (d.length) notes = d; }),
            ]) : Promise.resolve()).then(() => {
              renderView();
              if (pendingDraft) {
                setTimeout(() => openEditorWithDraft(pendingDraft), 300);
              }
            });
          }

          if (data.error) {
            dialogueCustomReply = currentLanguage === 'zh'
              ? '「连接失败：' + (data.error || '') + '」'
              : '"Connection failed: ' + (data.error || '') + '"';
            dialogueCharIdx = dialogueCustomReply.length;
            renderDialogue();
          }
        } catch (e) { /* skip */ }
      }

      // ── Send message to backend agent ──
      async function dialogueSendMessage(text) {
        if (agentIsStreaming || !text) return;
        const hasAPI = !!(agentConfig.apiBase || agentConfig.model);
        agentMessages.push({ role: 'user', text });
        saveAgentMessages();
        dialogueCustomReply = ''; dialogueShowOptions = false;
        $('#dialogueOptions').innerHTML = '';
        $('#dialogueArrow').style.display = 'none';
        const textEl = $('#dialogueText');
        dialogueStopTimer();
        if (textEl) textEl.innerHTML = '「' + escapeHtml(text) + '」';
        const chatBar = $('#dialogueChatBar');
        if (chatBar) chatBar.style.display = '';
        const clearBtn = $('#dialogueClearBtn');
        if (clearBtn) clearBtn.style.display = agentMessages.length ? '' : 'none';

        if (!hasAPI) {
          const all = sortByDue(agentAllTasks());
          const today = all.filter((t) => !t.completed && dayDiff(t.due) === 0);
          dialogueCharIdx = 0;
          dialogueCustomReply = currentLanguage === 'zh'
            ? '「我现在没有连接到终端。目前你有 ' + today.length + ' 个今日任务。请先配置 API 再使用我的智能功能。」'
            : '"I\'m not connected right now. You have ' + today.length + ' tasks due today. Please configure an API to enable my smart features."';
          setAnyaPortrait(getAnyaExpression(dialogueCustomReply, false, false));
          renderDialogue();
          return;
        }

        // ── Call backend agent ──
        agentIsStreaming = true;
        updateDialogueStatus('thinking');
        setAnyaPortrait('thinking');
        dialogueCharIdx = 0;
        dialogueCustomReply = '';
        if (textEl) textEl.innerHTML = '<span class="cursor">_</span>';

        let hadError = false;
        try {
          agentAbortController = new AbortController();

          // Build messages: only send last 20 for context
          const apiMessages = [
            ...agentMessages.slice(-20).map((m) => ({ role: m.role === 'anya' ? 'assistant' : 'user', content: m.text })),
          ];

          const response = await fetch('/api/agent/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: apiMessages }),
            signal: agentAbortController.signal,
          });

          if (!response.ok) {
            const eb = await response.text().catch(() => '');
            throw new Error('HTTP ' + response.status + (eb ? ': ' + eb.slice(0, 200) : ''));
          }

          // Read SSE stream
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buf = '';
          let fullText = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const lines = buf.split('\n');
            buf = lines.pop() || '';
            for (const line of lines) {
              const t = line.trim();
              if (!t || !t.startsWith('data:')) continue;
              const d = t.slice(5).trim();
              if (d === '[DONE]') continue;
              try {
                const evt = { data: d };
                handleAgentSSEEvent(evt);
                // Track full reply text
                const parsed = JSON.parse(d);
                if (parsed.type === 'delta') fullText += parsed.content;
              } catch (e) { /* skip */ }
            }
          }

          // Evaluate expression from full reply
          if (fullText) {
            setAnyaPortrait(getAnyaExpression(fullText, false, false));
            agentMessages.push({ role: 'anya', text: fullText });
            saveAgentMessages();
          }
        } catch (err) {
          hadError = true;
          if (err.name !== 'AbortError') {
            dialogueCustomReply = currentLanguage === 'zh'
              ? '「连接失败：' + (err.message || '未知错误') + '」'
              : '"Connection failed: ' + (err.message || 'unknown error') + '"';
            renderDialogue();
          }
        }

        agentIsStreaming = false;
        agentAbortController = null;
        updateDialogueStatus(hasAPI ? null : 'offline');
      }

      // ── Helpers (kept for offline fallback and task summary) ──
      function agentAllTasks() {
        return [...tasks, ...flattenQuestBooks()];
      }
