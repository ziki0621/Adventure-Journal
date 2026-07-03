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
        if (action === 'add-type') {
          addTaskFromManager(control);
          return;
        }
        const id = Number(control.dataset.id);
        if (action === 'toggle') {
          // Optimistic update: mutate local array, then fire per-item API
          tasks = tasks.map((task) => {
            if (task.id !== id) return task;
            // streak: checking → +1, unchecking → −1 (min 0), non-daily unchanged
            const newStreak = task.type === 'daily'
              ? (task.completed ? Math.max(0, (task.streak || 1) - 1) : (task.streak || 0) + 1)
              : task.streak;
            return { ...task, completed: !task.completed, streak: newStreak };
          });
          apiToggleTask(id);  // per-item PATCH (was: full saveTasks())
        }
        if (action === 'delete') {
          tasks = tasks.filter((task) => task.id !== id);
          if (selectedTaskId === id) selectedTaskId = null;
          apiDeleteTask(id);  // per-item DELETE (was: full saveTasks())
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
            line.subtasks = line.subtasks.filter((s) => s.id !== subId);
            apiDeleteSubtask(bookId, lineId, subId);
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
            book.independentQuests = book.independentQuests.filter((iq) => iq.id !== iqId);
            apiDeleteIndependentQuest(bookId, iqId);
          }
          renderView();
          return true;
        }
        return false;
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
          notes = notes.filter((note) => note.id !== id);
          apiDeleteNote(id);
          renderView();
          return true;
        }
        return false;
      }

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
        const qPri = $('#quickPriority'); if (qPri) renderSelect(qPri, priorityOptions, 'Med');
        renderSelect($('#editType'), typeOptions, 'questbook');
        renderSelect($('#editPriority'), priorityOptions, 'Med');
        const qDate = $('#quickDate'); if (qDate) qDate.value = todayOffset(0);

        document.addEventListener('click', (event) => {
          const nav = event.target.closest('[data-view]');
          if (nav) {
            dialogueStopTimer();
            switchView(nav.dataset.view);
            setSidebar(false);
            return;
          }
          const notesFilterTab = event.target.closest('[data-notes-filter]');
          if (notesFilterTab) {
            notesFilter = notesFilterTab.dataset.notesFilter;
            renderNotes();
            return;
          }
          const diaryDateNav = event.target.closest('[data-diary-date]');
          if (diaryDateNav) {
            const delta = Number(diaryDateNav.dataset.diaryDate);
            diaryDate = todayOffset(dayDiff(diaryDate) + delta);
            notesFilter = 'diary';
            renderNotes();
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
          // Quest book editor: toggle line accordion
          const qbToggleLine = event.target.closest('[data-qb-toggle-line]');
          if (qbToggleLine && !event.target.closest('input') && !event.target.closest('button')) {
            qbToggleLine.closest('.qb-ql-accordion')?.classList.toggle('open');
            return;
          }
          // Quest book editor: toggle multi-day fields
          const qbToggleSpan = event.target.closest('.qb-sub-toggle-more');
          if (qbToggleSpan) {
            const row = qbToggleSpan.closest('.qb-subtask-row');
            const spanDiv = row?.querySelector('.qb-sub-span');
            if (spanDiv) {
              spanDiv.classList.toggle('hidden');
              qbToggleSpan.textContent = spanDiv.classList.contains('hidden') ? '+' : '−';
            }
            return;
          }
          // Quest book editor: remove subtask
          const qbRemoveSubtask = event.target.closest('[data-qb-remove-subtask]');
          if (qbRemoveSubtask) { qbRemoveSubtask.closest('.qb-subtask-row')?.remove(); return; }
          // Quest book editor: add subtask
          const qbAddSub = event.target.closest('[data-qb-add-subtask]');
          if (qbAddSub) {
            const li = qbAddSub.dataset.qbAddSubtask;
            const container = document.querySelector(`[data-qb-subtasks="${li}"]`);
            if (container) {
              const div = document.createElement('div');
              div.innerHTML = qbSubtaskRow({ title: '', due: todayOffset(0) });
              container.appendChild(div.firstElementChild);
            }
            return;
          }
          // Quest book editor: remove quest line
          const qbRemoveQL = event.target.closest('[data-qb-remove-quest-line]');
          if (qbRemoveQL) { qbRemoveQL.closest('.qb-ql-accordion')?.remove(); return; }
          // Quest book editor: remove independent
          const qbRemoveIQ = event.target.closest('[data-qb-remove-independent]');
          if (qbRemoveIQ) { qbRemoveIQ.closest('.qb-independent-row')?.remove(); return; }

          // Task selection: click row to pin its notes to the sticky area
          const selectRow = event.target.closest('[data-select-task]');
          if (selectRow && !event.target.closest('button') && !event.target.closest('.check')) {
            const id = Number(selectRow.dataset.selectTask);
            selectedTaskId = selectedTaskId === id ? null : id;
            if (activeView === 'today') renderToday();
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

          // Quest book view: in-card actions (toggle/delete subtask/iq)
          if (handleQuestBookAction(event)) return;

          if (handleNoteAction(event)) return;
          handleTaskAction(event);
        });

        $('#viewContent').addEventListener('input', (event) => {
          const input = event.target.closest('[data-day-note]');
          if (input) {
            const dateIso = input.dataset.dayNote;
            dayNotes[dateIso] = input.value;
            if (!dayNotes[dateIso].trim()) delete dayNotes[dateIso];
            setDayNoteAPI(dateIso, input.value);
            return;
          }
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
          const scratch = event.target.closest('[data-scratchpad]');
          if (scratch) {
            localStorage.setItem('adventure-scratchpad-v1', scratch.value);
            return;
          }
          // Auto-save diary as draft so tab switching doesn't lose content
          const diary = event.target.closest('[data-diary-entry]');
          if (diary) {
            const countEl = diary.closest('.wire-inner')?.querySelector('.notes-char-count');
            if (countEl) countEl.textContent = diary.value.length + ' CHARS';
            localStorage.setItem('adventure-diary-draft', diary.value);
            return;
          }
        });

        $('#viewContent').addEventListener('click', (event) => {
          const diaryRow = event.target.closest('[data-diary-entry-row]');
          if (diaryRow && !event.target.closest('button')) {
            diaryDate = diaryRow.dataset.diaryDate;
            notesFilter = 'diary';
            renderNotes();
            return;
          }
          const saveDiary = event.target.closest('#saveDiaryEntry');
          if (saveDiary) {
            const textarea = document.getElementById('diaryTextarea');
            if (!textarea) return;
            const body = textarea.value.trim();
            if (!body) return;
            localStorage.removeItem('adventure-diary-draft');
            const title = diaryDate + ' ' + (currentLanguage === 'zh' ? '日记' : 'Diary');
            const existing = notes.find((n) => n.date === diaryDate);
            if (existing) {
              notes = notes.map((n) => n.id === existing.id ? { ...n, title, body } : n);
              apiUpdateNote(existing.id, { title, body, date: diaryDate });
            } else {
              const newNote = { id: Date.now(), title, body, date: diaryDate };
              notes.unshift(newNote);
              apiCreateNote(newNote);
            }
            renderNotes();
            return;
          }
        });

        const qAdd = $('#quickAdd'); if (qAdd) qAdd.addEventListener('click', addTaskFromQuick);
        const qTitle = $('#quickTitle'); if (qTitle) qTitle.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') addTaskFromQuick();
        });
        document.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter') return;
          const input = event.target.closest('.manager-title');
          if (!input) return;
          const manager = input.closest('[data-manager]');
          const control = manager?.querySelector('[data-action="add-type"]');
          if (control) addTaskFromManager(control);
        });
        $('#openAdd').addEventListener('click', () => {
          if (activeView === 'notes') openNoteEditor(null);
          else if (activeView === 'questbook') openQuestBookEditor(null);
          else openEditor(null);
        });
        $('#menuToggle').addEventListener('click', toggleSidebar);
        $('#sidebarScrim').addEventListener('click', () => setSidebar(false));
        sidebarQuery.addEventListener('change', (event) => setSidebar(false));
        $('#editType').addEventListener('change', updateTaskFormFields);

        // Quest book editor listeners
        $('#qbAddQuestLineBtn').addEventListener('click', () => {
          const lines = readQBQuestLines();
          lines.push({ title: '', subtasks: [] });
          renderQBQuestLines(lines);
        });
        $('#qbAddIndependentBtn').addEventListener('click', () => {
          const list = readQBIndependentQuests();
          list.push({ title: '', due: todayOffset(0), priority: 'Med' });
          renderQBIndependentQuests(list);
        });
        $('#closeQBModal').addEventListener('click', closeQuestBookEditor);
        $('#saveQuestBook').addEventListener('click', saveQuestBookEditor);

        $('#closeModal').addEventListener('click', closeEditor);
        $('#saveTask').addEventListener('click', saveEditor);
        $('#closeNoteModal').addEventListener('click', closeNoteEditor);
        $('#saveNote').addEventListener('click', saveNoteEditor);
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
          const optYes = event.target.closest('#dialogueOptionYes');
          if (optYes) { dialogueHandleOption('yes'); return; }
          const optNo = event.target.closest('#dialogueOptionNo');
          if (optNo) { dialogueHandleOption('no'); return; }
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
            closeNoteEditor();
            closeDialogue();
            $('#settingsModal').classList.remove('open');
          }
        });

        applyLanguage();
        setSidebar(false);

        // ── Load all data from API ──
        Promise.all([
          loadTasks().then((data) => { if (data.length) tasks = data; }),
          loadQuestBooks().then((data) => { if (data.length) questBooks = data; }),
          loadNotes().then((data) => { if (data.length) notes = data; }),
          loadDayNotes().then((data) => { if (Object.keys(data).length) dayNotes = data; }),
          loadAgentMessages().then((data) => { if (data.length) { agentMessages = data; agentSaveIndex = data.length; } }),
          loadAgentConfig().then((data) => { if (data.apiBase) agentConfig = data; }),
        ]).then(() => {
          renderView();
        });
      }

      init();
