/* ================================================================
   Adventure Ledger — Render: Today + Typed Views
   renderToday, renderTodayDashboard, renderDayNote,
   renderTypedView (daily/side).
   Depends on: state.js, i18n.js, utils.js, api.js, render.js
   ================================================================ */

      function renderTodayDashboard(entries) {
        // Build task-dot map: which dates have tasks
        const allTasks = [...tasks, ...flattenQuestBooks()];
        const dotMap = {}; // { 'YYYY-MM-DD': count }
        allTasks.forEach((t) => {
          if (!t.due) return;
          dotMap[t.due] = (dotMap[t.due] || 0) + 1;
        });

        // Mini calendar
        const selected = new Date(todaySelectedDate + 'T00:00:00');
        const today = new Date(appToday + 'T00:00:00');
        const year = selected.getFullYear();
        const month = selected.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInPrev = new Date(year, month, 0).getDate();

        const weekDays = currentLanguage === 'zh'
          ? ['日','一','二','三','四','五','六']
          : ['Su','Mo','Tu','We','Th','Fr','Sa'];

        const days = [];
        for (let i = 0; i < firstDay; i++) {
          days.push({ day: daysInPrev - firstDay + i + 1, current: false, date: null });
        }
        for (let d = 1; d <= daysInMonth; d++) {
          const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          days.push({ day: d, current: true, date: iso, dots: dotMap[iso] || 0 });
        }
        const rem = (7 - (days.length % 7)) % 7;
        for (let i = 1; i <= rem; i++) {
          days.push({ day: i, current: false, date: null });
        }

        const monthName = new Date(year, month, 1).toLocaleDateString(
          currentLanguage === 'zh' ? 'zh-CN' : 'en-US', { year:'numeric', month:'long' }
        );

        const total = entries.length;
        const done = entries.filter((t) => t.completed).length;
        const active = total - done;
        const percent = total ? Math.round((done / total) * 100) : 0;

        const pad = (value) => String(value).padStart(2, '0');
        return `
          <div class="today-side-stack">
            <div class="mini-calendar wire">
              <div class="wire-inner" style="padding:10px;">
                <div class="mc-head">
                  <button class="mc-nav" type="button" data-mc-month="-1" aria-label="Prev">◀</button>
                  <span class="mc-month serif">${monthName}</span>
                  <button class="mc-nav" type="button" data-mc-month="1" aria-label="Next">▶</button>
                </div>
                <div class="mc-weekdays">${weekDays.map((w,i) => `<span class="mc-wd${i===0||i===6?' mc-wkend':''}">${w}</span>`).join('')}</div>
                <div class="mc-grid">
                  ${days.map((d) => {
                    return `<button class="mc-day${!d.current?' mc-muted':''}${d.date===appToday?' mc-today':''}${d.date===todaySelectedDate?' mc-selected':''}" type="button" data-mc-date="${d.date||''}" ${!d.date?'disabled':''}>
                      <span class="mc-day-num serif">${d.day}</span>
                      ${d.dots ? `<span class="mc-dot">${d.dots > 1 ? d.dots : '·'}</span>` : ''}
                    </button>`;
                  }).join('')}
                </div>
              </div>
            </div>
            <div class="wire system-dashboard">
              <div class="wire-inner">
                <div class="section-title compact serif"><span class="diamond"></span><span class="text">${todayStatusText('statusTitle')}</span><span class="diamond"></span></div>
                <div class="dashboard-row"><span class="dashboard-label">${todayStatusText('total')}</span><span class="dashboard-value">${pad(total)}</span></div>
                <div class="dashboard-row"><span class="dashboard-label">${todayStatusText('active')}</span><span class="dashboard-value">${pad(active)}</span></div>
                <div class="dashboard-row"><span class="dashboard-label">${todayStatusText('done')}</span><span class="dashboard-value">${pad(done)}</span></div>
                <div class="dashboard-progress" aria-label="${percent}% ${todayStatusText('completion')}"><div class="dashboard-progress-fill" style="width:${percent}%"></div></div>
                <div class="dashboard-percent">${percent}% ${todayStatusText('completion')}</div>
              </div>
            </div>
            <button class="agent-slot" type="button" id="openAnya" aria-label="${todayStatusText('agentName')}">
              <img class="agent-portrait" src="assets/anya-normal.png" alt="${todayStatusText('agentName')}" />
            </button>
            ${renderStickyNote()}
          </div>
        `;
      }

      function dayNoteLabel() {
        return currentLanguage === 'zh' ? '今日便签' : 'Day Note';
      }

      function dayNotePlaceholder() {
        return currentLanguage === 'zh'
          ? '写下今天要记住的事...'
          : 'Write what you want to remember today...';
      }

      function renderDayNote(dateIso, extraClass = '') {
        const value = dayNotes[dateIso] || '';
        return `
          <div class="day-note-card ${extraClass}">
            <div class="day-note-head">
              <h3 class="day-note-title serif">${dayNoteLabel()}</h3>
              <span class="day-note-date">${escapeHtml(formatDate(dateIso))}</span>
            </div>
            <textarea class="day-note-input" data-day-note="${dateIso}" placeholder="${dayNotePlaceholder()}">${escapeHtml(value)}</textarea>
          </div>
        `;
      }

      // Find a task by ID across all sources (tasks, questBooks subtask, questBooks independent)
      function findTaskById(id) {
        // Check flat tasks
        const flat = tasks.find((t) => t.id === id);
        if (flat) return flat;
        // Check quest book flattened items
        const qbFlat = flattenQuestBooks().find((t) => t.id === id);
        if (qbFlat) return qbFlat;
        return null;
      }

      function renderStickyNote() {
        if (selectedTaskId) {
          const task = findTaskById(selectedTaskId);
          if (!task) {
            // Task was deleted, reset
            selectedTaskId = null;
            return renderDayNote(todayOffset(0));
          }
          const taskWord = currentLanguage === 'zh' ? '任务备注' : 'Task Note';
          const desc = task.desc || (typeof task.desc === 'string' ? '' : '');
          return `
            <div class="day-note-card">
              <div class="day-note-head">
                <h3 class="day-note-title serif">${taskWord}</h3>
                <span class="day-note-date" style="display:inline-flex;align-items:center;gap:4px;">${task.type === 'questbook' ? icons.book : task.type === 'daily' ? icons.repeat : icons.spark} ${escapeHtml(tr('type.' + task.type) || task.type)}</span>
                <button class="task-note-deselect" type="button" data-deselect-task aria-label="Deselect">✕</button>
              </div>
              <div class="task-note-meta">
                <span class="tag">${escapeHtml(task.title || '')}</span>
                ${formatDate(task.due) !== '' ? '<span class="day-note-date" style="font-size:10px;">' + escapeHtml(formatDate(task.due)) + '</span>' : ''}
                ${(task.start_time || task.end_time) ? '<span class="day-note-date" style="font-size:10px;color:var(--brass);">' + escapeHtml(task.start_time || '') + (task.start_time && task.end_time ? ' — ' : '') + escapeHtml(task.end_time || '') + '</span>' : ''}
              </div>
              <textarea class="task-note-desc" data-task-desc="${task.id}" placeholder="${currentLanguage === 'zh' ? '写备注…' : 'Write a note…'}">${escapeHtml(desc)}</textarea>
            </div>
          `;
        }
        return renderDayNote(todayOffset(0));
      }

      function renderToday() {
        setHeader(tr('view.today.title'), tr('view.today.eyebrow'), '');
        const selDate = todaySelectedDate;
        const allEntries = todayWindowTasks();
        const counts = {
          all: allEntries.length,
          questbook: allEntries.filter((t) => t.type === 'questbook').length,
          daily: allEntries.filter((t) => t.type === 'daily').length,
          side: allEntries.filter((t) => t.type === 'side').length,
        };
        const scoped = sortByDue(todayFilteredTasks());
        const overdue = scoped.filter((task) => taskTodayBucket(task) === 'overdue');
        const today = scoped.filter((task) => taskTodayBucket(task) === 'today');

        const isToday = selDate === appToday;
        $('#viewContent').innerHTML = `
          <div class="today-dashboard-layout">
            ${renderTodayDashboard(allEntries)}
            <div class="today-folder">
              ${renderTodayTabs(counts)}
              <div class="today-folder-panel">
                <div class="today-folder-inner">
                  ${isToday ? `
                  <section class="list-section">
                    <div class="section-head"><h3 class="serif">${tr('section.progress')}</h3><span>${today.length} ${tr('unit.contracts')}</span></div>
                    ${renderSplitTaskList(today, tr('empty.today'))}
                  </section>` : `
                  <section class="list-section">
                    <div class="section-head"><h3 class="serif">${formatDate(selDate)}</h3><span>${today.length} ${tr('unit.contracts')}</span></div>
                    ${renderSplitTaskList(today, tr('empty.today'))}
                  </section>`}
                  ${overdue.length ? `
                  <section class="list-section">
                    <div class="section-head"><h3 class="serif">${tr('section.overdue')}</h3><span>${overdue.length} ${tr('unit.contracts')}</span></div>
                    ${renderOverdueTaskList(overdue, tr('empty.overdue'))}
                  </section>` : ''}
                </div>
              </div>
            </div>
          </div>
        `;
      }

      function renderTypedView(type, title, eyebrow, subtitle) {
        setHeader(title, eyebrow, subtitle);
        const list = sortByDue(tasks.filter((task) => task.type === type));
        const active = list.filter((task) => !task.completed);
        const done = list.filter((task) => task.completed);
        const counts = { all: list.length, active: active.length, archive: done.length };
        const activeFilter = typeFilters[type] || 'all';
        const visible = activeFilter === 'active' ? active : activeFilter === 'archive' ? done : list;
        const sectionTitle = activeFilter === 'active' ? tr('section.active') : activeFilter === 'archive' ? tr('section.archive') : tr('tab.all');
        $('#viewContent').innerHTML = `
          <div class="library-layout">
            <div class="list-section">
              <div class="small-stat-grid">
                <div class="small-stat"><strong>${list.length}</strong><span>${tr('stats.total')}</span></div>
                <div class="small-stat"><strong>${active.length}</strong><span>${tr('stats.active')}</span></div>
                <div class="small-stat"><strong>${done.length}</strong><span>${tr('stats.done')}</span></div>
              </div>
              <div class="today-folder">
                ${renderTypeTabs(type, counts)}
                <div class="today-folder-panel">
                  <div class="today-folder-inner">
                    <section class="list-section">
                      <div class="section-head"><h3 class="serif">${sectionTitle}</h3><span>${visible.length} ${tr('unit.quests')}</span></div>
                      ${renderSplitTaskList(visible, activeFilter === 'archive' ? tr('empty.archive') : tr('empty.active'))}
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }
