/* ================================================================
   Adventure Ledger — API
   REST fetch calls for tasks, notes, quest books, and agent.
   Fire-and-forget persistence wrappers. flattenQuestBooks.
   Depends on: state.js
   ================================================================ */

      // ── Data Layer (SQLite via REST API) ──────
      const API = '/api';

      async function loadTasks() {
        try {
          const res = await fetch(API + '/tasks');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const data = await res.json();
          return Array.isArray(data) && data.length ? data : [];
        } catch (e) { console.warn('loadTasks fallback:', e.message); return []; }
      }

      async function apiCreateTask(task) {
        const res = await fetch(API + '/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task) });
        return res.json();
      }
      async function apiUpdateTask(id, data) {
        await fetch(API + '/tasks/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      }
      async function apiDeleteTask(id) {
        await fetch(API + '/tasks/' + id, { method: 'DELETE' });
      }
      async function apiArchiveTask(id) {
        await fetch(API + '/tasks/' + id + '/archive', { method: 'PATCH' });
      }
      async function apiUnarchiveTask(id) {
        await fetch(API + '/tasks/' + id + '/unarchive', { method: 'PATCH' });
      }
      async function apiToggleTask(id) {
        await fetch(API + '/tasks/' + id + '/toggle', { method: 'PATCH' });
      }

      async function loadNotes() {
        try {
          const res = await fetch(API + '/notes');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return await res.json();
        } catch (e) { console.warn('loadNotes fallback:', e.message); return []; }
      }
      async function apiCreateNote(note) {
        const res = await fetch(API + '/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(note) });
        return res.json();
      }
      async function apiUpdateNote(id, data) {
        await fetch(API + '/notes/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      }
      async function apiDeleteNote(id) {
        await fetch(API + '/notes/' + id, { method: 'DELETE' });
      }

      async function autoResetDailyTasks() {
        try { const res = await fetch(API + '/daily-checks/auto-reset', { method: 'POST' }); return await res.json(); } catch (e) { return {}; }
      }
      async function apiToggleDailyCheck(taskId, date) {
        const res = await fetch(API + '/daily-checks/' + taskId + '/' + date + '/toggle', { method: 'PATCH' }); return res.json();
      }
      async function loadDailyChecks(taskId) {
        try { const res = await fetch(API + '/daily-checks/' + taskId); return await res.json(); } catch (e) { return []; }
      }
      async function loadDayNotes() {
        try {
          // Load all day notes from server. The API doesn't have a GET-all,
          // so we load them on demand. For now, initialize empty and load
          // per-date as needed via setDayNoteAPI.
          const res = await fetch(API + '/day-notes');
          if (!res.ok) return {};
          const data = await res.json();
          return data || {};
        } catch (e) { return {}; }
      }
      async function setDayNoteAPI(date, content) {
        await fetch(API + '/day-notes/' + date, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
      }

      async function loadQuestBooks() {
        try {
          const res = await fetch(API + '/quest-books');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return await res.json();
        } catch (e) { console.warn('loadQuestBooks fallback:', e.message); return []; }
      }
      async function apiCreateQuestBook(book) {
        const res = await fetch(API + '/quest-books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
        return res.json();
      }
      async function apiUpdateQuestBook(id, book) {
        await fetch(API + '/quest-books/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
      }
      async function apiDeleteQuestBook(id) {
        await fetch(API + '/quest-books/' + id, { method: 'DELETE' });
      }
      async function apiToggleSubtask(bookId, lineId, subId) {
        await fetch(API + '/quest-books/' + bookId + '/subtasks/' + subId + '/toggle?lineId=' + lineId, { method: 'PATCH' });
      }
      async function apiDeleteSubtask(bookId, lineId, subId) {
        await fetch(API + '/quest-books/' + bookId + '/subtasks/' + subId + '?lineId=' + lineId, { method: 'DELETE' });
      }
      async function apiToggleIndependentQuest(bookId, iqId) {
        await fetch(API + '/quest-books/' + bookId + '/independent/' + iqId + '/toggle', { method: 'PATCH' });
      }
      async function apiDeleteIndependentQuest(bookId, iqId) {
        await fetch(API + '/quest-books/' + bookId + '/independent/' + iqId, { method: 'DELETE' });
      }

      async function loadAgentConfig() {
        try {
          const res = await fetch(API + '/agent/config');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return await res.json();
        } catch (e) { return { apiBase: '', apiKey: '', model: '', hasApiKey: false }; }
      }
      async function saveAgentConfig() {
        const apiKey = $('#agentApiKey')?.value.trim() || '';
        agentConfig = {
          apiBase: $('#agentApiBase')?.value.trim() || '',
          model: $('#agentModel')?.value.trim() || '',
          hasApiKey: agentConfig.hasApiKey || !!apiKey,
        };
        const payload = { apiBase: agentConfig.apiBase, model: agentConfig.model };
        if (apiKey) payload.apiKey = apiKey;
        const res = await fetch(API + '/agent/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) agentConfig = await res.json();
      }
      async function loadAgentMessages() {
        try {
          const res = await fetch(API + '/agent/messages');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return await res.json();
        } catch (e) { return []; }
      }
      async function saveAgentMessage(role, text) {
        await fetch(API + '/agent/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, text }) });
      }
      async function clearAgentMessagesAPI() {
        await fetch(API + '/agent/messages', { method: 'DELETE' });
      }

      // ── Fire-and-forget persistence wrappers ──
      const saveQueues = {
        tasks: Promise.resolve(),
        notes: Promise.resolve(),
        questBooks: Promise.resolve(),
      };
      const pendingSnapshots = {
        tasks: null,
        notes: null,
        questBooks: null,
      };
      function queueCollectionSave(name, url, data) {
        pendingSnapshots[name] = JSON.stringify(data);
        saveQueues[name] = saveQueues[name].then(async () => {
          const body = pendingSnapshots[name];
          pendingSnapshots[name] = null;
          if (!body) return;
          await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
        }).catch((error) => console.warn(name + ' save failed:', error.message));
      }
      function saveTasks() {
        queueCollectionSave('tasks', API + '/tasks', tasks);
      }
      function saveNotes() {
        queueCollectionSave('notes', API + '/notes', notes);
      }
      function saveQuestBooks() {
        queueCollectionSave('questBooks', API + '/quest-books', questBooks);
      }
      function saveDayNotes() {
        Object.entries(dayNotes).forEach(([date, content]) => {
          fetch(API + '/day-notes/' + date, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) }).catch(() => {});
        });
      }
            async function exportAllData() {
        const res = await fetch(API + '/tasks');
        const tasks = await res.json();
        const res2 = await fetch(API + '/quest-books');
        const questBooks = await res2.json();
        const res3 = await fetch(API + '/notes');
        const notes = await res3.json();
        const blob = new Blob([JSON.stringify({ tasks, questBooks, notes, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'adventure-journal-backup-' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
      }

      function saveAgentMessages() {
        const unsaved = agentMessages.slice(agentSaveIndex);
        if (!unsaved.length) return;
        unsaved.forEach((m) => {
          fetch(API + '/agent/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) }).catch(() => {});
        });
        agentSaveIndex = agentMessages.length;
      }
      // Notes uses individual apiCreateNote/UpdateNote calls, never saveNotes()

      // Flatten quest books into flat records for Today / Timeline views.
      // Returns objects that are references to the original nested data so
      // that mutations (like sticky note desc edits) write through to questBooks.
      function flattenQuestBooks() {
        const flat = [];
        questBooks.forEach((book) => {
          book.questLines.forEach((line) => {
            line.subtasks.forEach((sub) => {
              flat.push(Object.assign(sub, {
                type: 'questbook',
                line: line.title,
                bookName: book.name,
                bookId: book.id,
                questLineId: line.id,
                desc: sub.desc || '',
                _source: 'subtask',
              }));
            });
          });
          book.independentQuests.forEach((iq) => {
            flat.push(Object.assign(iq, {
              type: 'questbook',
              line: book.name,
              bookName: book.name,
              bookId: book.id,
              desc: iq.desc || '',
              _source: 'independent',
            }));
          });
        });
        return flat;
      }
