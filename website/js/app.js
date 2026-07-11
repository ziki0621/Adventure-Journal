/* ================================================================
   Adventure Ledger — App
   init(), event delegation (click/keydown/Escape handlers),
   action dispatchers (handleTaskAction, handleQuestBookAction,
   handleNoteAction), auto-save timers, data bootstrap.
   Depends on: all preceding JS files
   ================================================================ */

      function handleTaskAction(event) {
        const control = event.target.closest('[data-action]');
        if (!control) return;
        const action = control.dataset.action;
        const id = Number(control.dataset.id);

        // Check if this is a quest book item (flattened into Today view)
        const qbFlat = flattenQuestBooks();
        const qbItem = qbFlat.find((t) => t.id === id);

        // Archive/unarchive
        if (action === 'archive') {
          if (qbItem) {
            // Quest book item: set archived flag directly on the item
            const book = questBooks.find((b) => b.id === qbItem.bookId);
            if (book) {
              if (qbItem._source === 'subtask') {
                const line = book.questLines.find((l) => l.id === qbItem.questLineId);
                if (line) line.subtasks = line.subtasks.map((s) => s.id === id ? { ...s, archived: true } : s);
              } else {
                book.independentQuests = book.independentQuests.map((iq) => iq.id === id ? { ...iq, archived: true } : iq);
              }
              saveQuestBooks();
            }
          } else {
            const task = tasks.find((t) => t.id === id);
            if (task && !confirm((currentLanguage === 'zh' ? '确定归档「' : 'Archive \"') + task.title + '\"?')) return;
            tasks = tasks.map((task) => task.id === id ? { ...task, archived: true } : task);
            apiArchiveTask(id);
            if (selectedTaskId === id) selectedTaskId = null;
          }
          renderView();
          return;
        }
        if (action === 'unarchive') {
          if (qbItem) {
            const book = questBooks.find((b) => b.id === qbItem.bookId);
            if (book) {
              if (qbItem._source === 'subtask') {
                const line = book.questLines.find((l) => l.id === qbItem.questLineId);
                if (line) line.subtasks = line.subtasks.map((s) => s.id === id ? { ...s, archived: false } : s);
              } else {
                book.independentQuests = book.independentQuests.map((iq) => iq.id === id ? { ...iq, archived: false } : iq);
              }
              saveQuestBooks();
            }
          } else {
            tasks = tasks.map((task) => task.id === id ? { ...task, archived: false } : task);
            apiUnarchiveTask(id);
          }
          renderView();
          return;
        }

        if (qbItem) {
          const book = questBooks.find((b) => b.id === qbItem.bookId);
          if (!book) return;
          if (action === 'toggle') {
            if (qbItem._source === 'subtask') {
              const line = book.questLines.find((l) => l.id === qbItem.questLineId);
              if (line) line.subtasks = line.subtasks.map((s) => s.id === id ? { ...s, completed: !s.completed } : s);
              apiToggleSubtask(qbItem.bookId, qbItem.questLineId, id);
            } else {
              book.independentQuests = book.independentQuests.map((iq) => iq.id === id ? { ...iq, completed: !iq.completed } : iq);
              apiToggleIndependentQuest(qbItem.bookId, id);
            }
          }
          if (action === 'delete') {
            if (!confirm((currentLanguage === 'zh' ? '确定删除此项？' : 'Delete this item?'))) return;
            if (qbItem._source === 'subtask') {
              const line = book.questLines.find((l) => l.id === qbItem.questLineId);
              if (line) line.subtasks = line.subtasks.filter((s) => s.id !== id);
              apiDeleteSubtask(qbItem.bookId, qbItem.questLineId, id);
            } else {
              book.independentQuests = book.independentQuests.filter((iq) => iq.id !== id);
              apiDeleteIndependentQuest(qbItem.bookId, id);
            }
            if (selectedTaskId === id) selectedTaskId = null;
          }
          saveQuestBooks();
          renderView();
          return;
        }

        if (action === 'toggle') {
          const task = tasks.find((t) => t.id === id);
          if (task && task.type === 'daily') {
            const today = todayOffset(0);
            // Toggle via daily_checks
            apiToggleDailyCheck(id, today).then((r) => {
              if (!dailyChecks[id]) dailyChecks[id] = [];
              const idx = dailyChecks[id].findIndex((c) => c.date === today);
              if (idx >= 0) dailyChecks[id][idx].status = r.status;
              else dailyChecks[id].push({ task_id: id, date: today, status: r.status });
              if (r.streak !== undefined) {
                tasks = tasks.map((t) => t.id === id ? { ...t, completed: r.status === 'done', streak: r.streak } : t);
              }
              renderView();
            });
            return;
          }
          tasks = tasks.map((task) => {
            if (task.id !== id) return task;
            const newStreak = task.type === 'daily'
              ? (task.completed ? Math.max(0, (task.streak || 1) - 1) : (task.streak || 0) + 1)
              : task.streak;
            return { ...task, completed: !task.completed, streak: newStreak };
          });
          apiToggleTask(id);
        }
        if (action === 'delete') {
          const task = tasks.find((t) => t.id === id);
          if (task && !confirm((currentLanguage === 'zh' ? '确定删除「' : 'Delete "') + task.title + '"?')) return;
          tasks = tasks.filter((task) => task.id !== id);
          if (selectedTaskId === id) selectedTaskId = null;
          apiDeleteTask(id);
        }
        if (action === 'edit') {
          openEditor(id);
          return;
        }
        renderView();
      }

      function handleQuestBookAction(event) {
        const ctrl = event.target.closest('[data-qb-action]');
        if (!ctrl) return false;
        const action = ctrl.dataset.qbAction;
        const bookId = Number(ctrl.dataset.qbBookId);
        const book = questBooks.find((b) => b.id === bookId);
        if (!book) return false;

        if (action === 'toggle-subtask' || action === 'delete-subtask') {
          const lineId = Number(ctrl.dataset.qbLineId);
          const subId = Number(ctrl.dataset.qbSubId);
          const line = book.questLines.find((l) => l.id === lineId);
          if (!line) return false;
          if (action === 'toggle-subtask') {
            line.subtasks = line.subtasks.map((s) => s.id === subId ? { ...s, completed: !s.completed } : s);
            apiToggleSubtask(bookId, lineId, subId);
          } else {
            if (confirm((currentLanguage === 'zh' ? '确定删除此子任务？' : 'Delete this subtask?'))) {
            line.subtasks = line.subtasks.filter((s) => s.id !== subId);
            apiDeleteSubtask(bookId, lineId, subId);
            } else { return false; }
          }
          renderView();
          return true;
        }
        if (action === 'toggle-iq' || action === 'delete-iq') {
          const iqId = Number(ctrl.dataset.qbIqId);
          if (action === 'toggle-iq') {
            book.independentQuests = book.independentQuests.map((iq) => iq.id === iqId ? { ...iq, completed: !iq.completed } : iq);
            apiToggleIndependentQuest(bookId, iqId);
          } else {
            if (confirm((currentLanguage === 'zh' ? '确定删除此独立任务？' : 'Delete this independent quest?'))) {
            book.independentQuests = book.independentQuests.filter((iq) => iq.id !== iqId);
            apiDeleteIndependentQuest(bookId, iqId);
            } else { return false; }
          }
          renderView();
          return true;
        }
        return false;
      }


      let _dayNoteEditingDate = '';

      function updateDayNoteCharCount() {
        const ed = $('#dayNoteEditor');
        const cnt = $('#dayNoteCharCount');
        if (ed && cnt) cnt.textContent = ed.textContent.length + ' CHARS';
      }

      function openDayNoteEditor(dateIso) {
        _dayNoteEditingDate = dateIso;
        const raw = dayNotes[dateIso] || '';
        const hasHtml = /<[a-zA-Z][^>]*>/.test(raw);
        const html = hasHtml ? raw : (raw ? '<p>' + raw.replace(/\n/g, '<br>') + '</p>' : '');
        const editor = $('#dayNoteEditor');
        if (editor) editor.innerHTML = html;
        const dateEl = $('#dayNoteModalDate');
        if (dateEl) dateEl.textContent = formatDate(dateIso);
        $('#dayNoteModal').classList.add('open');
        updateDayNoteCharCount();
      }

      function saveDayNoteEditor() {
        const editor = $('#dayNoteEditor');
        if (!editor) return;
        const html = editor.innerHTML.trim();
        dayNotes[_dayNoteEditingDate] = html;
        setDayNoteAPI(_dayNoteEditingDate, html);
        $('#dayNoteModal').classList.remove('open');
        if (activeView === 'today') renderToday();
        else if (activeView === 'timeline') renderTimeline();
      }

      function closeDayNoteEditor() {
        _dayNoteEditingDate = '';
        $('#dayNoteModal').classList.remove('open');
      }

      function handleNoteAction(event) {
        const control = event.target.closest('[data-note-action]');
        if (!control) return false;
        const id = Number(control.dataset.id);
        const action = control.dataset.noteAction;
        if (action === 'edit') {
          openNoteEditor(id);
          return true;
        }
        if (action === 'delete') {
          const note = notes.find((n) => n.id === id);
          if (note && !confirm((currentLanguage === 'zh' ? '确定删除「' : 'Delete "') + note.title + '"?')) return;
          notes = notes.filter((note) => note.id !== id);
          apiDeleteNote(id);
          renderView();
          return true;
        }
        return false;
      }

      let _dayNoteDebounceTimer = null;
      function tickSidebarClock() {
        const el = $('#sidebarClock');
        if (!el) return;
        const now = new Date();
        el.textContent = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }

      function init() {
        tickSidebarClock();
        setInterval(tickSidebarClock, 1000);
        const qType = $('#quickType'); if (qType) renderSelect(qType, typeOptions, 'questbook');
        const qDate = $('#quickDate'); if (qDate) qDate.value = todayOffset(0);

        document.addEventListener('click', (event) => {
          const nav = event.target.closest('[data-view]');
          if (nav) {
            dialogueStopTimer();
            switchView(nav.dataset.view);
            setSidebar(false);
            return;
          }
          // Mini-calendar: month navigation
          const mcMonth = event.target.closest('[data-mc-month]');
          if (mcMonth) {
            const delta = Number(mcMonth.dataset.mcMonth);
            const parts = todaySelectedDate.split('-').map(Number);
            const d = new Date(parts[0], parts[1] - 1 + delta, 1);
            const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            const day = Math.min(parts[2], lastDay);
            todaySelectedDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            renderToday();
            return;
          }
          // Mini-calendar: date selection
          const mcDate = event.target.closest('[data-mc-date]');
          if (mcDate && mcDate.dataset.mcDate) {
            todaySelectedDate = mcDate.dataset.mcDate;
            if (activeView === 'today') renderToday();
            else switchView('today');
            return;
          }
          const todayTab = event.target.closest('[data-today-filter]');
          if (todayTab) {
            todayFilter = todayTab.dataset.todayFilter;
            renderToday();
            return;
          }
          const timelineTab = event.target.closest('[data-timeline-filter]');
          if (timelineTab) {
            timelineFilter = timelineTab.dataset.timelineFilter;
            renderTimeline();
            return;
          }
          const typeTab = event.target.closest('[data-type-filter]');
          if (typeTab) {
            typeFilters[typeTab.dataset.type] = typeTab.dataset.typeFilter;
            renderView();
            return;
          }
          const monthNav = event.target.closest('[data-month]');
          if (monthNav) {
            const delta = Number(monthNav.dataset.month);
            const parts = selectedDate.split('-').map(Number);
            const targetMonth = parts[1] - 1 + delta;
            const d = new Date(parts[0], targetMonth, 1);
            const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            d.setDate(Math.min(parts[2], lastDay));
            selectedDate = d.toISOString().slice(0, 10);
            renderTimeline();
            return;
          }
          const date = event.target.closest('[data-date]');
          if (date) {
            selectedDate = date.dataset.date;
            timelineFilter = 'all';
            renderTimeline();
            return;
          }
          const themeBtn = event.target.closest('[data-theme]');
          if (themeBtn) { applyTheme(themeBtn.dataset.theme); return; }
          const language = event.target.closest('[data-language]');
          if (language) {
            currentLanguage = language.dataset.language;
            localStorage.setItem(languageKey, currentLanguage);
            applyLanguage();
            renderView();
            return;
          }
          const openAnya = event.target.closest('#openAnya');
          if (openAnya) {
            openDialogue();
            return;
          }
          // Knowledge Base "new note" button (dynamically rendered in renderNotes)
          if (event.target.closest('#openNoteEditor')) {
            openNoteEditor(null);
            return;
          }
          // Quest book editor: toggle line accordion
          const qbToggleLine = event.target.closest('[data-qb-toggle-line]');
          if (qbToggleLine && !event.target.closest('input') && !event.target.closest('button')) {
            qbToggleLine.closest('.qb-ql-accordion')?.classList.toggle('open');
            return;
          }
          // Quest book editor: remove subtask
          const qbRemoveSubtask = event.target.closest('[data-qb-remove-subtask]');
          if (qbRemoveSubtask) { qbRemoveSubtask.closest('.qb-subtask-card')?.remove(); return; }

          // Quest book editor: edit sub-task card
          const qbEditSub = event.target.closest('[data-qb-edit-subtask]');
          if (qbEditSub && !event.target.closest('button')) {
            const card = qbEditSub.closest('.qb-subtask-card');
            const accordion = qbEditSub.closest('.qb-ql-accordion');
            const bookId = window._editingQBId;
            const subId = Number(card.dataset.subId) || 0;
            const lineId = Number(accordion?.dataset.qbLineId) || 0;
            if (bookId && subId && lineId) openQBItemEditor(bookId, 'subtask', lineId, subId);
            else openQBItemEditorFromDom('subtask', card);
            return;
          }

          // Quest book editor: edit independent card
          const qbEditIndep = event.target.closest('[data-qb-edit-independent]');
          if (qbEditIndep && !event.target.closest('button')) {
            const card = qbEditIndep.closest('.qb-independent-row');
            const bookId = window._editingQBId;
            const iqId = Number(card.dataset.iqId) || 0;
            if (bookId && iqId) openQBItemEditor(bookId, 'independent', null, iqId);
            else openQBItemEditorFromDom('independent', card);
            return;
          }
          // Quest book editor: add subtask
          const qbAddSub = event.target.closest('[data-qb-add-subtask]');
          if (qbAddSub) {
            const lineIdx = Number(qbAddSub.dataset.qbAddSubtask);
            const accordion = qbAddSub.closest('.qb-ql-accordion');
            let lineId = Number(accordion?.dataset.qbLineId) || 0;
            const bookId = window._editingQBId;
            const tempId = Date.now();
            const lines = readQBQuestLines();
            if (!lines[lineIdx]) { lines[lineIdx] = { title: '', subtasks: [] }; }
            if (!lines[lineIdx].id) {
              lines[lineIdx].id = lineId || tempId + 1;
              lineId = lines[lineIdx].id;
            }
            lines[lineIdx].subtasks = lines[lineIdx].subtasks || [];
            lines[lineIdx].subtasks.push({ id: tempId, title: '', due: todayOffset(0), completed: false });
            renderQBQuestLines(lines);
            if (bookId) {
              questBooks = questBooks.map((b) => b.id === bookId ? { ...b, questLines: lines, independentQuests: readQBIndependentQuests() } : b);
              setTimeout(() => openQBItemEditor(bookId, 'subtask', lineId, tempId), 0);
            } else {
              const card = document.querySelector(`.qb-subtask-card[data-sub-id="${tempId}"]`);
              setTimeout(() => openQBItemEditorFromDom('subtask', card), 0);
            }
            return;
          }
          // Quest book editor: remove quest line
          const qbRemoveQL = event.target.closest('[data-qb-remove-quest-line]');
          if (qbRemoveQL) { qbRemoveQL.closest('.qb-ql-accordion')?.remove(); return; }
          // Quest book editor: remove independent
          const qbRemoveIQ = event.target.closest('[data-qb-remove-independent]');
          if (qbRemoveIQ) { qbRemoveIQ.closest('.qb-independent-row')?.remove(); return; }

          // Task selection: single click = pin notes. Double click is handled below.
          const selectRow = event.target.closest('[data-select-task]');
          if (selectRow && !event.target.closest('button') && !event.target.closest('.check')) {
            const id = Number(selectRow.dataset.selectTask);
            clearTimeout(selectRow._clickTimeout);
            selectRow._clickTimeout = setTimeout(() => {
              selectedTaskId = selectedTaskId === id ? null : id;
              if (activeView === 'today') renderToday();
            }, 200);
            return;
          }
          // Deselect task note
          const deselect = event.target.closest('[data-deselect-task]');
          if (deselect) {
            selectedTaskId = null;
            if (activeView === 'today') renderToday();
            return;
          }

          // Quest book view: toggle card
          const qbToggleV = event.target.closest('[data-qb-toggle]');
          if (qbToggleV && !event.target.closest('button')) {
            qbToggleV.closest('.qb-card')?.classList.toggle('open');
            return;
          }
          // Quest book view: edit book
          const qbEdit = event.target.closest('[data-qb-edit-book]');
          if (qbEdit) { openQuestBookEditor(Number(qbEdit.dataset.qbEditBook)); return; }

          // Quest book timeline item click → single-item editor
          const qbNode = event.target.closest('[data-qb-item-id]');
          if (qbNode && !event.target.closest('button') && !event.target.closest('.check')) {
            openQBItemEditor(
              Number(qbNode.dataset.qbItemBook),
              qbNode.dataset.qbItemType,
              qbNode.dataset.qbItemLineId ? Number(qbNode.dataset.qbItemLineId) : null,
              Number(qbNode.dataset.qbItemId)
            );
            return;
          }

          // Quest book view: in-card actions (toggle/delete subtask/iq)
          if (handleQuestBookAction(event)) return;

          if (handleNoteAction(event)) return;
          handleTaskAction(event);
        });

        $('#viewContent').addEventListener('input', (event) => {
          // Auto-save task desc when editing in sticky note
          const taskDesc = event.target.closest('[data-task-desc]');
          if (taskDesc) {
            const id = Number(taskDesc.dataset.taskDesc);
            const task = findTaskById(id);
            if (task) {
              task.desc = taskDesc.value;
              // For questbook subtasks/independent quests, save via saveQuestBooks
              if (task._source) {
                saveQuestBooks();
              } else {
                saveTasks();
              }
            }
            return;
          }
        });

        $('#viewContent').addEventListener('dblclick', (event) => {
          const taskRow = event.target.closest('[data-task-id]');
          if (taskRow && !event.target.closest('button') && !event.target.closest('.check')) {
            clearTimeout(taskRow._clickTimeout);
            const id = Number(taskRow.dataset.taskId);
            // Quest book items (subtasks / independent quests) aren't in tasks[].
            // They need the Quest Book editor, not the standard task editor.
            if (tasks.some((t) => t.id === id)) {
              openEditor(id);
            } else {
              const flat = flattenQuestBooks();
              const qbItem = flat.find((t) => t.id === id);
              if (qbItem && qbItem.bookId) {
                openQBItemEditor(qbItem.bookId, qbItem._source, qbItem.questLineId || null, id);
              }
            }
            return;
          }
        });

        const qAdd = $('#quickAdd'); if (qAdd) qAdd.addEventListener('click', addTaskFromQuick);
        const qTitle = $('#quickTitle'); if (qTitle) qTitle.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') addTaskFromQuick();
        });
        $('#menuToggle').addEventListener('click', toggleSidebar);
        $('#sidebarScrim').addEventListener('click', () => setSidebar(false));
        sidebarQuery.addEventListener('change', (event) => setSidebar(false));
        const et = $('#editType'); if (et) et.addEventListener('change', updateTaskFormFields);

        // Quest book editor listeners
        $('#qbAddQuestLineBtn').addEventListener('click', () => {
          const lines = readQBQuestLines();
          lines.push({ title: '', subtasks: [] });
          renderQBQuestLines(lines);
        });
        $('#qbAddIndependentBtn').addEventListener('click', () => {
          const list = readQBIndependentQuests();
          const tempId = Date.now();
          list.push({ id: tempId, title: '', due: todayOffset(0), completed: false });
          renderQBIndependentQuests(list);
          if (window._editingQBId) {
            questBooks = questBooks.map((b) => b.id === window._editingQBId ? { ...b, questLines: readQBQuestLines(), independentQuests: list } : b);
            setTimeout(() => openQBItemEditor(window._editingQBId, 'independent', null, tempId), 0);
          } else {
            const row = document.querySelector(`.qb-independent-row[data-iq-id="${tempId}"]`);
            setTimeout(() => openQBItemEditorFromDom('independent', row), 0);
          }
        });
        $('#closeQBModal').addEventListener('click', closeQuestBookEditor);
        $('#saveQuestBook').addEventListener('click', saveQuestBookEditor);
        $('#closeQBItemModal').addEventListener('click', closeQBItemEditor);
        $('#saveQBItem').addEventListener('click', saveQBItemEditor);
        $('#qbItemStart').addEventListener('change', toggleQBItemTimeField);
        $('#qbItemEnd').addEventListener('change', toggleQBItemTimeField);
        $('#qbItemModal').addEventListener('click', (event) => {
          if (event.target.id === 'qbItemModal') closeQBItemEditor();
        });

        $('#closeModal').addEventListener('click', closeEditor);
        $('#saveTask').addEventListener('click', saveEditor);
        $('#deleteTaskFromEditor').addEventListener('click', deleteTaskFromEditor);

        // ── Day Note Rich Editor ──
        const dnm = $('#dayNoteModal');
        if (dnm) {
          dnm.addEventListener('click', (e) => { if (e.target.id === 'dayNoteModal') closeDayNoteEditor(); });
        }
        $('#closeDayNoteModal').addEventListener('click', closeDayNoteEditor);
        $('#saveDayNoteEditor').addEventListener('click', saveDayNoteEditor);

        // Toolbar command buttons
        document.querySelectorAll('.dn-toolbar button[data-cmd]').forEach(btn => {
          btn.addEventListener('click', () => {
            const cmd = btn.dataset.cmd;
            if (cmd === 'insertCheckbox') {
              document.execCommand('insertHTML', false, '<span contenteditable="false" data-checkbox data-checked="false" style="display:inline-block;width:16px;height:16px;border:2px solid var(--ink);margin-right:6px;vertical-align:-4px;font-size:11px;font-weight:700;text-align:center;line-height:14px;cursor:pointer;">&nbsp;</span>');
            } else {
              document.execCommand(cmd, false, null);
            }
            updateDayNoteCharCount();
            $('#dayNoteEditor')?.focus();
          });
        });

        // Handle checkbox toggle in the editor
        $('#dayNoteEditor')?.addEventListener('click', (e) => {
          const cb = e.target.closest('[data-checkbox]');
          if (cb) {
            const checked = cb.dataset.checked === 'true';
            cb.dataset.checked = checked ? 'false' : 'true';
            cb.textContent = checked ? ' ' : '✓';
            updateDayNoteCharCount();
          }
        });

        // Char count + toolbar active state
        $('#dayNoteEditor')?.addEventListener('input', updateDayNoteCharCount);

        // Double-click day note render → open editor
        $('#viewContent').addEventListener('dblclick', (e) => {
          const render = e.target.closest('[data-day-note-render]');
          if (render) {
            const dateIso = render.dataset.dayNoteRender;
            openDayNoteEditor(dateIso);
            return;
          }
        });

        // ── Keyboard shortcuts ──
        document.addEventListener('keydown', (event) => {
          if (event.target.closest('input') || event.target.closest('textarea') || event.target.closest('select')) return;
          if (event.key === 'Escape') {
            closeEditor(); closeQuestBookEditor(); closeQBItemEditor(); closeNoteEditor();
            $('#settingsModal').classList.remove('open');
            return;
          }
          if (event.key === 'n' || event.key === 'N') {
            if (activeView === 'notes') openNoteEditor(null);
            else if (activeView === 'questbook') openQuestBookEditor(null);
            else openEditor(null);
            return;
          }
          const viewKeys = { '1': 'today', '2': 'questbook', '3': 'daily', '4': 'side', '5': 'notes' };
          if (viewKeys[event.key]) { switchView(viewKeys[event.key]); return; }
        });

        $('#closeNoteModal').addEventListener('click', closeNoteEditor);
        $('#saveNote').addEventListener('click', saveNoteEditor);
        const exportBtn = $('#exportDataBtn'); if (exportBtn) exportBtn.addEventListener('click', exportAllData);
        $('#openSettings').addEventListener('click', () => {
          $('#agentApiBase').value = agentConfig.apiBase || '';
          $('#agentApiKey').value = '';
          $('#agentApiKey').placeholder = agentConfig.hasApiKey ? 'API Key saved; leave blank to keep it' : 'API Key...';
          $('#agentModel').value = agentConfig.model || '';
          $('#settingsModal').classList.add('open');
        });
        $('#closeSettings').addEventListener('click', () => $('#settingsModal').classList.remove('open'));
        $('#saveAgentSettings').addEventListener('click', () => {
          saveAgentConfig();
          const hasAPI = !!(agentConfig.apiBase || agentConfig.model);
          updateDialogueStatus(hasAPI ? null : 'offline');
          $('#saveAgentSettings').textContent = currentLanguage === 'zh' ? '已保存' : 'Saved';
          window.setTimeout(() => { $('#saveAgentSettings').textContent = 'Save Agent API'; }, 900);
        });
        // Dialogue view listeners
        $('#dialogueSpeech').addEventListener('click', dialogueHandleNext);
        $('#dialogueClose').addEventListener('click', closeDialogue);
        $('#dialogueClearBtn').addEventListener('click', clearDialogueHistory);
        $('#dialogueHistoryBtn').addEventListener('click', toggleDialogueHistory);
        $('#dialogueSend').addEventListener('click', () => {
          const text = $('#dialogueInput').value.trim();
          if (!text) return;
          $('#dialogueInput').value = '';
          dialogueSendMessage(text);
        });
        $('#dialogueInput').addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            const text = $('#dialogueInput').value.trim();
            if (!text) return;
            $('#dialogueInput').value = '';
            dialogueSendMessage(text);
          }
        });
        // Delegated clicks for dynamic dialogue elements
        document.addEventListener('click', (event) => {
          // Quick action buttons
          const quickBtn = event.target.closest('[data-quick-action]');
          if (quickBtn) { dialogueHandleQuickAction(quickBtn.dataset.quickAction); return; }
        });
        $('#taskModal').addEventListener('click', (event) => {
          if (event.target.id === 'taskModal') closeEditor();
        });
        $('#questBookModal').addEventListener('click', (event) => {
          if (event.target.id === 'questBookModal') closeQuestBookEditor();
        });
        $('#noteModal').addEventListener('click', (event) => {
          if (event.target.id === 'noteModal') closeNoteEditor();
        });
        $('#settingsModal').addEventListener('click', (event) => {
          if (event.target.id === 'settingsModal') $('#settingsModal').classList.remove('open');
        });
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            closeEditor();
            closeQuestBookEditor();
            closeQBItemEditor();
            closeNoteEditor();
            closeDialogue();
            $('#settingsModal').classList.remove('open');
          }
        });

        applyLanguage();
        applyTheme(currentTheme);
        setSidebar(false);

        // ── Load all data from API ──
        Promise.all([
          loadTasks().then((data) => { if (data.length) tasks = data; }),
          loadQuestBooks().then((data) => { if (data.length) questBooks = data; }),
          loadNotes().then((data) => { if (data.length) notes = data; }),
          loadDayNotes().then((data) => { if (Object.keys(data).length) dayNotes = data; }),
          autoResetDailyTasks().then((data) => { if (data.checks) dailyChecks = {}; (data.checks||[]).forEach(c => { if(!dailyChecks[c.task_id])dailyChecks[c.task_id]=[]; dailyChecks[c.task_id].push(c); }); }),
          loadAgentMessages().then((data) => { if (data.length) { agentMessages = data; agentSaveIndex = data.length; } }),
          loadAgentConfig().then((data) => { if (data.apiBase) agentConfig = data; }),
        ]).then(() => {
          renderView();
        });
      }

      init();
