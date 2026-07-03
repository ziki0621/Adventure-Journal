/* ================================================================
   Adventure Ledger — Render: Timeline
   Calendar grid with task pips, month navigation, selected-day
   task list, day notes.
   Depends on: state.js, i18n.js, utils.js, api.js, render.js,
               render-today.js (renderDayNote)
   ================================================================ */

      function renderTimeline() {
        setHeader(tr('view.timeline.title'), tr('view.timeline.eyebrow'), '');
        const base = new Date(`${selectedDate}T00:00:00`);
        const year = base.getFullYear();
        const month = base.getMonth();
        const first = new Date(year, month, 1);
        const start = new Date(first);
        start.setDate(1 - first.getDay());
        const days = [];
        for (let i = 0; i < 42; i += 1) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          days.push(d);
        }
        const qbFlat = flattenQuestBooks();
        const allEntries = [...tasks, ...qbFlat];
        const selectedTasks = sortByDue(allEntries.filter((task) => task.due === selectedDate));
        const selectedCounts = {
          all: selectedTasks.length,
          questbook: selectedTasks.filter((task) => task.type === 'questbook').length,
          daily: selectedTasks.filter((task) => task.type === 'daily').length,
          side: selectedTasks.filter((task) => task.type === 'side').length,
        };
        const visibleSelectedTasks = timelineFilter === 'all'
          ? selectedTasks
          : selectedTasks.filter((task) => task.type === timelineFilter);

        const weekdays = currentLanguage === 'zh'
          ? ['日', '一', '二', '三', '四', '五', '六']
          : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthName = new Date(year, month, 1).toLocaleDateString(
          currentLanguage === 'zh' ? 'zh-CN' : 'en-US',
          { year: 'numeric', month: 'long' }
        );
        const todayIso = todayOffset(0);

        const pipOrder = ['questbook', 'daily', 'side'];

        function dayPips(dateIso) {
          const dayTasks = allEntries.filter((t) => t.due === dateIso);
          if (!dayTasks.length) return '';
          const grouped = {};
          dayTasks.forEach((t) => { grouped[t.type] = (grouped[t.type] || 0) + 1; });
          const allPips = [];
          pipOrder.forEach((type) => {
            if (!grouped[type]) return;
            for (let i = 0; i < grouped[type]; i++) {
              allPips.push(`<span class="calendar-pip pip-${type}"></span>`);
            }
          });
          const total = allPips.length;
          if (total <= 3) return allPips.join('');
          // Show 2 pips + overflow
          return allPips.slice(0, 2).join('') + `<span class="calendar-pip-overflow">+${total - 2}</span>`;
        }

        $('#viewContent').innerHTML = `
          <div class="timeline-layout">
            <div class="wire">
              <div class="wire-inner" style="padding:14px;">
                <div class="calendar-head">
                  <button class="calendar-nav" type="button" data-month="-1" aria-label="Previous month">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <div class="calendar-month-title">
                    <span class="calendar-year">${year}</span>
                    <h3 class="serif calendar-month-name">${monthName}</h3>
                  </div>
                  <button class="calendar-nav" type="button" data-month="1" aria-label="Next month">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                  <button class="line-button calendar-today-btn" type="button" data-date="${todayIso}">${tr('action.today')}</button>
                </div>
                <div class="calendar-weekdays">
                  ${weekdays.map((d, i) => `<div class="calendar-weekday${i === 0 || i === 6 ? ' weekend' : ''}">${d}</div>`).join('')}
                </div>
                <div class="calendar-grid">
                  ${days.map((date) => {
                    const iso = date.toISOString().slice(0, 10);
                    const isMuted = date.getMonth() !== month;
                    const isToday = iso === todayIso;
                    const isSelected = iso === selectedDate;
                    return `
                      <button class="calendar-day${isMuted ? ' muted' : ''}${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}" type="button" data-date="${iso}">
                        <span class="calendar-day-num serif">${date.getDate()}</span>
                        <span class="calendar-pips">${dayPips(iso)}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
            ${renderDayNote(selectedDate, 'timeline-day-note')}
            <div class="today-folder">
              ${renderTimelineTabs(selectedCounts)}
              <div class="today-folder-panel">
                <div class="today-folder-inner">
                  <section class="list-section">
                    <div class="section-head"><h3 class="serif">${tr('section.selectedDay')}</h3><span>${visibleSelectedTasks.length} ${tr('unit.quests')}</span></div>
                    ${renderTaskList(visibleSelectedTasks, tr('empty.folder'))}
                  </section>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      function noteRow(note) {
        return `
          <div class="kb-card wire">
            <div class="wire-inner" data-note-action="edit" data-id="${note.id}">
              <div class="kb-card-header">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"></path></svg>
                <span class="kb-card-id">${escapeHtml(formatDate(note.date || todayOffset(0)))}</span>
              </div>
              <h3 class="kb-card-title serif">${escapeHtml(note.title)}</h3>
              <div class="task-actions" style="margin-top:6px;">
                <button class="plain-icon-button" type="button" data-note-action="edit" data-id="${note.id}" aria-label="Edit ${escapeHtml(note.title)}">${icons.edit}</button>
                <button class="plain-icon-button" type="button" data-note-action="delete" data-id="${note.id}" aria-label="Delete ${escapeHtml(note.title)}">${icons.trash}</button>
              </div>
            </div>
          </div>
        `;
      }
