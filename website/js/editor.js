/* ================================================================
   Adventure Ledger — Editor
   Modal editors for tasks, notes, and quest books.
   Quick-add and manager-add handlers.
   Depends on: state.js, i18n.js, utils.js, api.js, render.js
   ================================================================ */

      // ── Quest Book Editor ──────────────────────

      function qbSubtaskRow(sub) {
        return `
          <div class="qb-subtask-row" data-sub-id="${sub.id || ''}" data-sub-completed="${sub.completed ? '1' : '0'}">
            <span class="qb-subtask-drag">≡</span>
            <input class="qb-sub-title" placeholder="${escapeHtml(tr('placeholder.subtask'))}" value="${escapeHtml(sub.title || '')}" />
            <input class="qb-sub-due" type="date" value="${escapeHtml(sub.due || todayOffset(0))}" title="${currentLanguage === 'zh' ? '截止' : 'Due'}" />
            <button class="qb-sub-toggle-more" type="button" title="${currentLanguage === 'zh' ? '多天' : 'Multi-day'}">+</button>
            <div class="qb-sub-span hidden">
              <input class="qb-sub-start" type="date" value="${escapeHtml(sub.start || '')}" placeholder="${currentLanguage === 'zh' ? '开始' : 'Start'}" />
              <input class="qb-sub-end" type="date" value="${escapeHtml(sub.end || '')}" placeholder="${currentLanguage === 'zh' ? '结束' : 'End'}" />
              <input class="qb-sub-start-time" type="time" value="${escapeHtml(sub.start_time || '')}" title="${currentLanguage === 'zh' ? '开始时间' : 'Start time'}" />
              <input class="qb-sub-end-time" type="time" value="${escapeHtml(sub.end_time || '')}" title="${currentLanguage === 'zh' ? '结束时间' : 'End time'}" />
            </div>
            <button class="plain-icon-button" type="button" data-qb-remove-subtask aria-label="${tr('action.delete')}">${icons.trash}</button>
          </div>
        `;
      }

      function renderQBQuestLineBlock(line, li) {
        const subsHtml = (line.subtasks || []).map((s, si) => qbSubtaskRow(s)).join('');
        const subCount = (line.subtasks || []).length;
        const title = line.title || '';
        return `
          <div class="qb-ql-accordion" data-qb-quest-line="${li}">
            <div class="qb-ql-bar" data-qb-toggle-line="${li}">
              <svg class="qb-ql-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
              <span class="qb-ql-diamond"></span>
              <input class="qb-ql-title inline" placeholder="${escapeHtml(tr('placeholder.questLine'))}" value="${escapeHtml(title)}" />
              <span class="qb-ql-badge">${subCount}</span>
              <button class="plain-icon-button" type="button" data-qb-remove-quest-line="${li}" aria-label="${tr('action.delete')}">${icons.trash}</button>
            </div>
            <div class="qb-ql-body">
              <div class="qb-subtask-list" data-qb-subtasks="${li}">${subsHtml}</div>
              <button class="qb-editor-add-btn" type="button" data-qb-add-subtask="${li}">+ ${tr('action.addSubtask')}</button>
            </div>
          </div>
        `;
      }

      function renderQBQuestLines(lines) {
        $('#qbQuestLinesContainer').innerHTML = lines.map((l, i) => renderQBQuestLineBlock(l, i)).join('');
      }

      function readQBQuestLines() {
        return Array.from(document.querySelectorAll('.qb-ql-accordion')).map((block) => {
          const title = block.querySelector('.qb-ql-title')?.value.trim() || '';
          const subtasks = Array.from(block.querySelectorAll('.qb-subtask-row')).map((row) => ({
            id: Number(row.dataset.subId) || undefined,
            title: row.querySelector('.qb-sub-title')?.value.trim() || '',
            due: row.querySelector('.qb-sub-due')?.value || todayOffset(0),
            start: row.querySelector('.qb-sub-start')?.value || '',
            end: row.querySelector('.qb-sub-end')?.value || '',
            start_time: row.querySelector('.qb-sub-start-time')?.value || '',
            end_time: row.querySelector('.qb-sub-end-time')?.value || '',
            completed: row.dataset.subCompleted === '1',
          })).filter((s) => s.title);
          return { title, subtasks };
        });
      }

      function qbIndependentRow(iq) {
        return `
          <div class="qb-independent-row" data-qb-independent data-iq-id="${iq.id || ''}" data-iq-completed="${iq.completed ? '1' : '0'}" data-iq-desc="${escapeHtml(iq.desc || '')}">
            <input class="qb-iq-title" placeholder="${escapeHtml(tr('placeholder.title'))}" value="${escapeHtml(iq.title || '')}" />
            <input class="qb-iq-due" type="date" value="${escapeHtml(iq.due || todayOffset(0))}" />
            <select class="qb-iq-priority">${renderSelectOptions(priorityOptions, iq.priority || 'Med')}</select>
            <button class="plain-icon-button" type="button" data-qb-remove-independent aria-label="${tr('action.delete')}">${icons.trash}</button>
          </div>
        `;
      }

      function renderQBIndependentQuests(list) {
        $('#qbIndependentContainer').innerHTML = list.map((iq, i) => qbIndependentRow(iq)).join('');
      }

      function readQBIndependentQuests() {
        return Array.from(document.querySelectorAll('[data-qb-independent]')).map((row) => ({
          id: Number(row.dataset.iqId) || undefined,
          title: row.querySelector('.qb-iq-title')?.value.trim() || '',
          due: row.querySelector('.qb-iq-due')?.value || todayOffset(0),
          priority: row.querySelector('.qb-iq-priority')?.value || 'Med',
          completed: row.dataset.iqCompleted === '1',
          desc: row.dataset.iqDesc || '',
        })).filter((iq) => iq.title);
      }

      function renderSelectOptions(options, selected) {
        return options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? priorityLabel(opt) : tr(opt.labelKey);
          return `<option value="${val}"${val === selected ? ' selected' : ''}>${label}</option>`;
        }).join('');
      }
      function addTaskFromQuick() {
        const title = $('#quickTitle').value.trim();
        const type = $('#quickType').value;
        if (!title) return;
        if (type === 'questbook') return; // use the Quest Book editor instead
        const newTask = {
          id: Date.now(),
          title: title.toUpperCase(),
          desc: '',
          type,
          due: $('#quickDate').value || todayOffset(0),
          priority: $('#quickPriority').value,
          line: type === 'daily' ? 'Daily' : type === 'side' ? 'Side' : 'Independent',
          completed: false,
          recurrence: type === 'daily' ? 'Daily' : undefined,
          streak: type === 'daily' ? 0 : undefined,
          start_time: '',
          end_time: '',
        };
        tasks.unshift(newTask);
        apiCreateTask(newTask);
        $('#quickTitle').value = '';
        $('#quickDate').value = todayOffset(0);
        renderView();
      }

      function addTaskFromManager(control) {
        const manager = control.closest('[data-manager]');
        if (!manager) return;
        const type = manager.dataset.manager;
        if (type === 'questbook') return; // use the Quest Book editor instead
        const titleInput = manager.querySelector('.manager-title');
        const dateInput = manager.querySelector('.manager-date');
        const priorityInput = manager.querySelector('.manager-priority');
        const title = titleInput.value.trim();
        if (!title) return;
        const newTask = {
          id: Date.now(),
          title: title.toUpperCase(),
          desc: '',
          type,
          due: dateInput.value || todayOffset(0),
          priority: priorityInput.value,
          line: type === 'daily' ? 'Daily' : type === 'side' ? 'Side' : 'Independent',
          completed: false,
          recurrence: type === 'daily' ? 'Daily' : undefined,
          streak: type === 'daily' ? 0 : undefined,
        };
        tasks.unshift(newTask);
        apiCreateTask(newTask);
        renderView();
      }

      function openEditor(id = null) {
        editingId = id;
        const existing = id ? tasks.find((item) => item.id === id) : null;

        if (existing) {
          $('#editTitle').value = existing.title || '';
          $('#editDesc').value = existing.desc || '';
          $('#editType').value = existing.type || 'daily';
          $('#editPriority').value = existing.priority || 'Med';
          $('#editStartDate').value = existing.start || existing.due || todayOffset(0);
          $('#editEndDate').value = (existing.end && existing.end !== existing.due) ? existing.end : '';
          $('#editLine').value = existing.line || '';
          $('#editRecurrence').value = existing.recurrence || existing.line || 'Daily';
          $('#editStartTime').value = existing.start_time || '';
          $('#editEndTime').value = existing.end_time || '';
          updateTaskFormFields();
          $('#taskModal').classList.add('open');
          return;
        }

        $('#editTitle').value = '';
        $('#editDesc').value = '';
        $('#editType').value = defaultTaskType();
        $('#editPriority').value = 'Med';
        $('#editStartDate').value = todayOffset(0);
        $('#editEndDate').value = '';
        $('#editLine').value = '';
        $('#editRecurrence').value = 'Daily';
        $('#editStartTime').value = '';
        $('#editEndTime').value = '';
        updateTaskFormFields();
        $('#taskModal').classList.add('open');
      }

      function openEditorWithDraft(draft) {
        if (!draft) return;
        if (draft.type === 'questbook') {
          // Open quest book editor with the draft
          $('#qbName').value = draft.title;
          $('#qbStart').value = draft.start || draft.due || todayOffset(0);
          $('#qbEnd').value = draft.end || draft.due || todayOffset(7);
          renderQBQuestLines([]);
          renderQBIndependentQuests([{ title: draft.title, due: draft.due, priority: draft.priority }]);
          $('#qbModalTitle .text').textContent = tr('modal.newQuestbook');
          window._editingQBId = undefined;
          $('#questBookModal').classList.add('open');
        } else {
          // Open standard task editor pre-filled
          editingId = null;
          $('#editTitle').value = draft.title;
          $('#editDesc').value = draft.desc || '';
          $('#editType').value = draft.type;
          $('#editPriority').value = draft.priority;
          $('#editStartDate').value = draft.start || draft.due || todayOffset(0);
          $('#editEndDate').value = (draft.end && draft.end !== draft.due) ? draft.end : '';
          $('#editLine').value = draft.line || '';
          $('#editRecurrence').value = draft.recurrence || 'Daily';
          $('#editStartTime').value = draft.start_time || '';
          $('#editEndTime').value = draft.end_time || '';
          updateTaskFormFields();
          $('#taskModal').classList.add('open');
        }
      }

      function closeEditor() {
        editingId = null;
        $('#taskModal').classList.remove('open');
      }

      // ── Quest Book Editor ──────────────────────

      function openQuestBookEditor(bookId = null) {
        const book = bookId ? questBooks.find((b) => b.id === bookId) : null;
        window._editingQBId = bookId;
        $('#qbName').value = book ? book.name : '';
        const allDates = book ? [
          ...(book.questLines || []).flatMap((line) => (line.subtasks || []).map((sub) => sub.due)),
          ...(book.independentQuests || []).map((iq) => iq.due),
        ].filter(Boolean).sort() : [];
        $('#qbStart').value = book?.start || allDates[0] || todayOffset(0);
        $('#qbEnd').value = book?.end || allDates.slice(-1)[0] || todayOffset(7);
        renderQBQuestLines(book ? book.questLines : []);
        renderQBIndependentQuests(book ? book.independentQuests : []);
        $('#qbModalTitle .text').textContent = book ? tr('qb.edit') || (currentLanguage === 'zh' ? '编辑任务书' : 'Edit Quest Book') : tr('modal.newQuestbook');
        $('#questBookModal').classList.add('open');
      }

      function closeQuestBookEditor() {
        window._editingQBId = undefined;
        $('#questBookModal').classList.remove('open');
      }

      async function saveQuestBookEditor() {
        const name = $('#qbName').value.trim();
        if (!name) return;
        const start = $('#qbStart').value || todayOffset(0);
        const end = $('#qbEnd').value || addDaysIso(start, 7);

        const questLines = readQBQuestLines();
        const independentQuests = readQBIndependentQuests();
        const existingId = window._editingQBId;

        if (existingId) {
          let updatedBook = null;
          questBooks = questBooks.map((b) => b.id === existingId
            ? (updatedBook = { ...b, name, start, end, questLines: questLines.map((ql, i) => ({ ...ql, id: ql.id || Date.now() + i })), independentQuests: independentQuests.map((iq, i) => ({ ...iq, id: iq.id || Date.now() + 100 + i })) })
            : b);
          apiUpdateQuestBook(existingId, updatedBook);
        } else {
          const newId = Date.now();
          const newBook = {
            id: newId,
            name,
            start,
            end,
            questLines: questLines.map((ql, i) => ({ ...ql, id: newId + i + 1, subtasks: (ql.subtasks || []).map((s, si) => ({ ...s, id: newId + (i * 100) + si + 10 })) })),
            independentQuests: independentQuests.map((iq, i) => ({ ...iq, id: newId + 1000 + i })),
          };
          questBooks.push(newBook);
          apiCreateQuestBook(newBook);
        }

        closeQuestBookEditor();
        renderView();
      }

      function openNoteEditor(id = null) {
        editingNoteId = id;
        const note = notes.find((item) => item.id === id) || {
          title: '',
          body: '',
          date: todayOffset(0),
        };
        $('#noteTitle').value = note.title || '';
        $('#noteBody').value = note.body || '';
        $('#noteModal').classList.add('open');
      }

      function closeNoteEditor() {
        editingNoteId = null;
        $('#noteModal').classList.remove('open');
      }

      async function saveNoteEditor() {
        const title = $('#noteTitle').value.trim();
        const body = $('#noteBody').value.trim();
        if (!title && !body) return;
        const payload = {
          title: title || (currentLanguage === 'zh' ? '未命名笔记' : 'Untitled Note'),
          body,
          date: todayOffset(0),
        };
        if (editingNoteId) {
          notes = notes.map((note) => note.id === editingNoteId ? { ...note, ...payload } : note);
          apiUpdateNote(editingNoteId, payload);
        } else {
          const newNote = { id: Date.now(), ...payload };
          notes.unshift(newNote);
          apiCreateNote(newNote);
        }
        closeNoteEditor();
        renderView();
      }

      async function saveEditor() {
        const type = $('#editType').value;
        const title = $('#editTitle').value.trim();
        const recurrence = $('#editRecurrence').value || 'Daily';
        if (!title) return;

        const startDate = $('#editStartDate').value || todayOffset(0);
        const endDate = $('#editEndDate').value || startDate;
        const due = startDate;
        const startTime = $('#editStartTime').value || '';
        const endTime = $('#editEndTime').value || '';

        // Check time conflict before saving
        if (startTime && endTime) {
          const excludeId = editingId || undefined;
          const params = new URLSearchParams({ due, start_time: startTime, end_time: endTime });
          if (excludeId) params.set('excludeId', String(excludeId));
          try {
            const res = await fetch(API + '/tasks/check-conflict?' + params.toString());
            const data = await res.json();
            if (data.conflict) {
              const msg = currentLanguage === 'zh'
                ? '时间段冲突！「' + data.title + '」已经占用了 ' + data.time + '。请调整时间段。'
                : 'Time conflict! "' + data.title + '" is already scheduled at ' + data.time + '. Please adjust.';
              alert(msg);
              return;
            }
          } catch (e) { /* proceed on network error */ }
        }

        const basePayload = {
          title: title.toUpperCase(),
          desc: $('#editDesc').value.trim(),
          type,
          due,
          start_time: startTime,
          end_time: endTime,
          priority: $('#editPriority').value,
          line: type === 'daily' ? recurrence : type === 'side' ? 'Side' : ($('#editLine').value.trim() || 'Independent'),
          recurrence: type === 'daily' ? recurrence : undefined,
          start: startDate,
          end: endDate,
        };

        if (editingId) {
          let updatedTask = null;
          tasks = tasks.map((task) => task.id === editingId
            ? (updatedTask = { ...task, ...basePayload, streak: basePayload.type === 'daily' ? task.streak || 0 : undefined })
            : task);
          apiUpdateTask(editingId, updatedTask);
        } else {
          const newTask = { id: Date.now(), ...basePayload, completed: false, streak: basePayload.type === 'daily' ? 0 : undefined };
          tasks.unshift(newTask);
          apiCreateTask(newTask);
        }

        closeEditor();
        // If we came from the dialogue view, confirm in chat and update
        if (pendingAgentDraft) {
          const draft = pendingAgentDraft;
          pendingAgentDraft = null;
          dialogueCustomReply = '「' + (currentLanguage === 'zh' ? '已经登记：' : 'Registered: ') + escapeHtml(draft.title) + '｜' + escapeHtml(typeLabel(draft.type)) + '｜' + escapeHtml(formatDate(draft.due)) + '」';
          dialogueCharIdx = dialogueCustomReply.length;
          renderDialogue();
          saveAgentMessages();
        }
        renderView();
      }
