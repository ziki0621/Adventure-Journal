/* ================================================================
   Adventure Ledger — Editor
   Modal editors for tasks, notes, and quest books.
   Quick-add and manager-add handlers.
   Depends on: state.js, i18n.js, utils.js, api.js, render.js
   ================================================================ */

      // ── Quest Book Editor ──────────────────────

      function qbSubtaskRow(sub) {
        const label = tr('placeholder.subtask');
        return `
          <div class="qb-subtask-card wire" data-sub-id="${sub.id || ''}" data-sub-title="${escapeHtml(sub.title || '')}" data-sub-due="${escapeHtml(sub.due || todayOffset(0))}" data-sub-completed="${sub.completed ? '1' : '0'}" data-sub-start="${escapeHtml(sub.start || '')}" data-sub-end="${escapeHtml(sub.end || '')}" data-sub-start-time="${escapeHtml(sub.start_time || '')}" data-sub-end-time="${escapeHtml(sub.end_time || '')}" data-sub-desc="${escapeHtml(sub.desc || '')}">
            <div class="wire-inner" style="padding:6px 10px;display:flex;align-items:center;gap:8px;cursor:pointer;" data-qb-edit-subtask>
              <span class="qb-subtask-drag">≡</span>
              <span class="qb-subtask-label serif" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;">${escapeHtml(sub.title || label)}</span>
              <span style="font-size:8px;opacity:0.5;white-space:nowrap;">${escapeHtml(formatDate(sub.due || todayOffset(0)))}</span>
              ${(sub.start_time || sub.end_time) ? '<span style="font-size:8px;color:var(--brass);white-space:nowrap;">' + escapeHtml(sub.start_time||'') + (sub.start_time&&sub.end_time?'—':'') + escapeHtml(sub.end_time||'') + '</span>' : ''}
              <button class="plain-icon-button" type="button" data-qb-remove-subtask aria-label="${tr('action.delete')}">${icons.trash}</button>
            </div>
          </div>
        `;
      }

      function renderQBQuestLineBlock(line, li) {
        const subsHtml = (line.subtasks || []).map((s, si) => qbSubtaskRow(s)).join('');
        const subCount = (line.subtasks || []).length;
        const title = line.title || '';
        return `
          <div class="qb-ql-accordion" data-qb-quest-line="${li}" data-qb-line-id="${line.id || ''}">
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
          const subtasks = Array.from(block.querySelectorAll('.qb-subtask-card')).map((row) => ({
            id: Number(row.dataset.subId) || undefined,
            title: row.dataset.subTitle || '',
            due: row.dataset.subDue || todayOffset(0),
            start: row.dataset.subStart || '',
            end: row.dataset.subEnd || '',
            start_time: row.dataset.subStartTime || '',
            end_time: row.dataset.subEndTime || '',
            desc: row.dataset.subDesc || '',
            completed: row.dataset.subCompleted === '1',
          })).filter((s) => s.title);
          return { id: Number(block.dataset.qbLineId) || undefined, title, subtasks };
        });
      }

      function qbIndependentRow(iq) {
        const label = tr('placeholder.title');
        return `
          <div class="qb-independent-row wire" data-qb-independent data-iq-id="${iq.id || ''}" data-iq-title="${escapeHtml(iq.title || '')}" data-iq-due="${escapeHtml(iq.due || todayOffset(0))}" data-iq-completed="${iq.completed ? '1' : '0'}" data-iq-desc="${escapeHtml(iq.desc || '')}" data-iq-start="${escapeHtml(iq.start || '')}" data-iq-end="${escapeHtml(iq.end || '')}" data-iq-start-time="${escapeHtml(iq.start_time || '')}" data-iq-end-time="${escapeHtml(iq.end_time || '')}">
            <div class="wire-inner" style="padding:6px 10px;display:flex;align-items:center;gap:8px;cursor:pointer;" data-qb-edit-independent>
              <span class="qb-subtask-drag">≡</span>
              <span class="qb-subtask-label serif" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;">${escapeHtml(iq.title || label)}</span>
              <span style="font-size:8px;opacity:0.5;white-space:nowrap;">${escapeHtml(formatDate(iq.due || todayOffset(0)))}</span>
              <button class="plain-icon-button" type="button" data-qb-remove-independent aria-label="${tr('action.delete')}">${icons.trash}</button>
            </div>
          </div>
        `;
      }

      function renderQBIndependentQuests(list) {
        $('#qbIndependentContainer').innerHTML = list.map((iq, i) => qbIndependentRow(iq)).join('');
      }

      function readQBIndependentQuests() {
        return Array.from(document.querySelectorAll('[data-qb-independent]')).map((row) => ({
          id: Number(row.dataset.iqId) || undefined,
          title: row.dataset.iqTitle || '',
          due: row.dataset.iqDue || todayOffset(0),
          start: row.dataset.iqStart || '',
          end: row.dataset.iqEnd || '',
          start_time: row.dataset.iqStartTime || '',
          end_time: row.dataset.iqEndTime || '',
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

      function openEditor(id = null) {
        editingId = id;
        const existing = id ? tasks.find((item) => item.id === id) : null;
        updateDeleteTaskButton();

        if (existing) {
          $('#editTitle').value = existing.title || '';
          $('#editDesc').value = existing.desc || '';
          const type = existing.type || 'daily';
          $('#editType').value = type;
          $('#editStartDate').value = existing.start || existing.due || todayOffset(0);
          $('#editEndDate').value = (existing.end && existing.end !== existing.due) ? existing.end : '';
          $('#editLine').value = existing.line || '';
          $('#editRecurrence').value = existing.recurrence || existing.line || 'Daily';
          $('#editStartTime').value = existing.start_time || '';
          $('#editEndTime').value = existing.end_time || '';
          updateTaskFormFields();
          updateDeleteTaskButton();
          $('#taskModal').classList.add('open');
          return;
        }

        $('#editTitle').value = '';
        $('#editDesc').value = '';
        const type = defaultTaskType();
        $('#editType').value = type;
        $('#editStartDate').value = todayOffset(0);
        $('#editEndDate').value = '';
        $('#editLine').value = '';
        $('#editRecurrence').value = 'Daily';
        $('#editStartTime').value = '';
        $('#editEndTime').value = '';
        updateTaskFormFields();
        updateDeleteTaskButton();
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
          updateDeleteTaskButton();
          $('#editTitle').value = draft.title;
          $('#editDesc').value = draft.desc || '';
          const type = draft.type || defaultTaskType();
          $('#editType').value = type;
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
        updateDeleteTaskButton();
        $('#taskModal').classList.remove('open');
      }

      function updateDeleteTaskButton() {
        const button = $('#deleteTaskFromEditor');
        if (!button) return;
        button.classList.toggle('task-field-hidden', !editingId);
      }

      function deleteTaskFromEditor() {
        if (!editingId) return;
        const task = tasks.find((item) => item.id === editingId);
        const label = task?.title || (currentLanguage === 'zh' ? '这个任务' : 'this quest');
        const message = currentLanguage === 'zh'
          ? `确定删除「${label}」吗？这个操作不能撤销。`
          : `Delete "${label}"? This cannot be undone.`;
        if (!confirm(message)) return;
        const id = editingId;
        tasks = tasks.filter((item) => item.id !== id);
        if (selectedTaskId === id) selectedTaskId = null;
        apiDeleteTask(id);
        closeEditor();
        renderView();
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
        const type = $('#editType').value || (editingId ? (tasks.find(t => t.id === editingId)?.type || 'daily') : defaultTaskType());
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

      // ── Single Quest Book Item Editor ──────────────────────
      let _editingQBItem = null; // { mode, bookId, type, lineId, itemId, rowSelector }

      function qbItemDraftFromRow(row, type) {
        if (!row) return null;
        if (type === 'subtask') {
          return {
            id: Number(row.dataset.subId) || undefined,
            title: row.dataset.subTitle || '',
            due: row.dataset.subDue || todayOffset(0),
            start: row.dataset.subStart || '',
            end: row.dataset.subEnd || '',
            start_time: row.dataset.subStartTime || '',
            end_time: row.dataset.subEndTime || '',
            desc: row.dataset.subDesc || '',
            completed: row.dataset.subCompleted === '1',
          };
        }
        return {
          id: Number(row.dataset.iqId) || undefined,
          title: row.dataset.iqTitle || '',
          due: row.dataset.iqDue || todayOffset(0),
          start: row.dataset.iqStart || '',
          end: row.dataset.iqEnd || '',
          start_time: row.dataset.iqStartTime || '',
          end_time: row.dataset.iqEndTime || '',
          desc: row.dataset.iqDesc || '',
          completed: row.dataset.iqCompleted === '1',
        };
      }

      function writeQBItemDraftToRow(row, type, updates) {
        if (!row) return;
        if (type === 'subtask') {
          row.dataset.subTitle = updates.title || '';
          row.dataset.subDue = updates.due || todayOffset(0);
          row.dataset.subStart = updates.start || '';
          row.dataset.subEnd = updates.end || '';
          row.dataset.subStartTime = updates.start_time || '';
          row.dataset.subEndTime = updates.end_time || '';
          row.dataset.subDesc = updates.desc || '';
          const id = Number(row.dataset.subId) || Date.now();
          const completed = row.dataset.subCompleted === '1';
          row.outerHTML = qbSubtaskRow({ id, completed, ...updates });
          return;
        }
        row.dataset.iqTitle = updates.title || '';
        row.dataset.iqDue = updates.due || todayOffset(0);
        row.dataset.iqStart = updates.start || '';
        row.dataset.iqEnd = updates.end || '';
        row.dataset.iqStartTime = updates.start_time || '';
        row.dataset.iqEndTime = updates.end_time || '';
        row.dataset.iqDesc = updates.desc || '';
        const id = Number(row.dataset.iqId) || Date.now();
        const completed = row.dataset.iqCompleted === '1';
        row.outerHTML = qbIndependentRow({ id, completed, ...updates });
      }

      function openQBItemEditorFromDom(type, row) {
        const item = qbItemDraftFromRow(row, type);
        if (!item) return;
        const id = item.id || Date.now();
        if (type === 'subtask' && !row.dataset.subId) row.dataset.subId = String(id);
        if (type === 'independent' && !row.dataset.iqId) row.dataset.iqId = String(id);
        _editingQBItem = {
          mode: 'dom',
          type,
          itemId: id,
          rowSelector: type === 'subtask' ? `.qb-subtask-card[data-sub-id="${id}"]` : `.qb-independent-row[data-iq-id="${id}"]`,
        };
        $('#qbItemTitle').value = item.title || '';
        $('#qbItemStart').value = item.start || item.due || todayOffset(0);
        $('#qbItemEnd').value = (item.end && item.end !== item.due) ? item.end : '';
        $('#qbItemStartTime').value = item.start_time || '';
        $('#qbItemEndTime').value = item.end_time || '';
        $('#qbItemDesc').value = item.desc || '';
        toggleQBItemTimeField();
        $('#qbItemModal').classList.add('open');
      }

      function openQBItemEditor(bookId, type, lineId, itemId) {
        const book = questBooks.find((b) => b.id === bookId);
        if (!book) return;
        let item = null;
        if (type === 'subtask') {
          const line = book.questLines.find((l) => l.id === lineId);
          if (line) item = (line.subtasks || []).find((s) => s.id === itemId);
        } else {
          item = (book.independentQuests || []).find((iq) => iq.id === itemId);
        }
        if (!item) return;
        _editingQBItem = { mode: 'book', bookId, type, lineId, itemId };
        $('#qbItemTitle').value = item.title || '';
        $('#qbItemStart').value = item.start || item.due || todayOffset(0);
        $('#qbItemEnd').value = (item.end && item.end !== item.due) ? item.end : '';
        $('#qbItemStartTime').value = item.start_time || '';
        $('#qbItemEndTime').value = item.end_time || '';
        $('#qbItemDesc').value = item.desc || '';
        toggleQBItemTimeField();
        $('#qbItemModal').classList.add('open');
      }

      function saveQBItemEditor() {
        if (!_editingQBItem) return;
        const { bookId, type, lineId, itemId } = _editingQBItem;
        const title = $('#qbItemTitle').value.trim();
        if (!title) return;
        const start = $('#qbItemStart').value || todayOffset(0);
        const end = $('#qbItemEnd').value || start;
        const updates = {
          title: title.toUpperCase(),
          due: start,
          start,
          end: end !== start ? end : undefined,
          start_time: (end === start) ? ($('#qbItemStartTime').value || '') : '',
          end_time: (end === start) ? ($('#qbItemEndTime').value || '') : '',
          desc: $('#qbItemDesc').value.trim(),
        };

        if (_editingQBItem.mode === 'dom') {
          const row = document.querySelector(_editingQBItem.rowSelector);
          writeQBItemDraftToRow(row, type, updates);
          closeQBItemEditor();
          return;
        }

        questBooks = questBooks.map((b) => {
          if (b.id !== bookId) return b;
          if (type === 'subtask') {
            b.questLines = b.questLines.map((l) => {
              if (l.id !== lineId) return l;
              l.subtasks = l.subtasks.map((s) => s.id === itemId ? { ...s, ...updates } : s);
              return l;
            });
          } else {
            b.independentQuests = b.independentQuests.map((iq) => iq.id === itemId ? { ...iq, ...updates } : iq);
          }
          return b;
        });
        saveQuestBooks();
        closeQBItemEditor();
        renderView();
      }

      function closeQBItemEditor() {
        _editingQBItem = null;
        $('#qbItemModal').classList.remove('open');
      }

      function toggleQBItemTimeField() {
        const start = $('#qbItemStart').value || todayOffset(0);
        const end = $('#qbItemEnd').value;
        const isSingleDay = !end || end === start;
        const tf = $('#qbItemTimeField');
        if (tf) tf.classList.toggle('task-field-hidden', !isSingleDay);
      }
