/* ================================================================
   Adventure Ledger — Render (shared)
   renderNav, setHeader, applyLanguage, taskRow, renderTaskList,
   sortByDue, tab renderers, renderView dispatcher, switchView.
   Also: date helpers (dateDiffIso, normalizeQbTimelineItem,
   dayNumberInRange, dateFromRangeDay) used by questbook view.
   Depends on: state.js, i18n.js, utils.js, api.js
   ================================================================ */

      function renderNav() {
        const counts = taskCounts();
        const nav = views.map((view) => `
          <button class="nav-button ${activeView === view.id ? 'active' : ''}" type="button" data-view="${view.id}" aria-label="${tr(view.labelKey)}">
            <span class="nav-icon">${icons[view.icon]}</span>
            <span class="nav-label serif">${tr(view.labelKey)}</span>
          </button>
        `).join('');
        $('#sideNav').innerHTML = nav;
        $('#bottomNav').innerHTML = nav;
      }

      function defaultTaskType() {
        if (activeView === 'daily') return 'daily';
        if (activeView === 'side') return 'side';
        return 'daily';
      }

      function updateTaskFormFields() {
        const type = $('#editType')?.value || 'daily';
        $('#modalTitle .text').textContent = tr('modal.title');
        $('#standardFields').classList.remove('task-field-hidden');
        const visibility = {
          line: false,
          recurrence: type === 'daily',
          time: type !== 'questbook',
          'questbook-subtasks': false,
        };
        document.querySelectorAll('[data-task-field]').forEach((field) => {
          const key = field.dataset.taskField;
          field.classList.toggle('task-field-hidden', !visibility[key]);
        });
      }
      function setHeader(title, eyebrow, subtitle) {
        $('#viewTitle').textContent = title;
        $('#viewEyebrow').textContent = eyebrow;
        $('#viewSubtitle').textContent = subtitle;
      }

      function applyLanguage() {
        document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
        document.querySelector('.brand h1').textContent = tr('brand.title');
        document.querySelector('.brand p').textContent = tr('brand.subtitle');
        $('#sidebarQuote').textContent = tr('quote');
        $('#settingsLabel').textContent = tr('settings');
        $('#settingsTitle .text').textContent = tr('settings.title');
        $('#languageLabel').textContent = tr('settings.language');
        $('#modalTitle .text').textContent = tr('modal.title');
        $('#noteModalTitle .text').textContent = tr('note.modal.title');
        document.querySelector('label[for="editTitle"]').textContent = tr('field.title');
        document.querySelector('label[for="editType"]').textContent = tr('field.type');
        document.querySelector('label[for="editPriority"]').textContent = tr('field.priority');
        const eStartLbl = document.querySelector('label[for="editStartDate"]'); if (eStartLbl) eStartLbl.textContent = tr('field.start');
        const eEndLbl = document.querySelector('label[for="editEndDate"]'); if (eEndLbl) eEndLbl.textContent = tr('field.end');
        document.querySelector('label[for="editLine"]').textContent = tr('field.line');
        document.querySelector('label[for="editRecurrence"]').textContent = tr('field.recurrence');
        
        const qbLinesBtn = $('#qbAddQuestLineBtn');
        if (qbLinesBtn) qbLinesBtn.textContent = tr('qb.addLine');
        const qbIndepBtn = $('#qbAddIndependentBtn');
        if (qbIndepBtn) qbIndepBtn.textContent = tr('qb.addIndependent');
        const saveQB = $('#saveQuestBook .chamfer-face');
        if (saveQB) saveQB.textContent = tr('qb.save');
        const qbNameLbl = document.querySelector('label[for="qbName"]');
        if (qbNameLbl) qbNameLbl.textContent = tr('qb.name');
        const qbStartLbl = document.querySelector('label[for="qbStart"]');
        if (qbStartLbl) qbStartLbl.textContent = tr('field.start');
        const qbEndLbl = document.querySelector('label[for="qbEnd"]');
        if (qbEndLbl) qbEndLbl.textContent = tr('field.end');
        document.querySelector('label[for="editDesc"]').textContent = tr('field.notes');
        $('#editTitle').placeholder = tr('placeholder.title');
        $('#editLine').placeholder = tr('placeholder.line');
        $('#editDesc').placeholder = tr('placeholder.notes');
        $('#saveTask .chamfer-face').textContent = tr('action.save');
        document.querySelector('label[for="noteTitle"]').textContent = tr('note.title');
        document.querySelector('label[for="noteBody"]').textContent = tr('note.body');
        $('#noteTitle').placeholder = tr('note.placeholder.title');
        $('#noteBody').placeholder = tr('note.placeholder.body');
        $('#saveNote .chamfer-face').textContent = tr('note.save');
        document.querySelectorAll('[data-language]').forEach((button) => {
          button.classList.toggle('active', button.dataset.language === currentLanguage);
        });
        const qType = $('#quickType'); if (qType) renderSelect(qType, typeOptions, qType.value || 'questbook');
        const qPri = $('#quickPriority'); if (qPri) renderSelect(qPri, priorityOptions, qPri.value || 'Med');
        renderSelect($('#editType'), typeOptions, $('#editType').value || 'questbook');
        renderSelect($('#editPriority'), priorityOptions, $('#editPriority').value || 'Med');
        renderSelect($('#editRecurrence'), [
          { value: 'Daily', labelKey: 'recurrence.Daily' },
          { value: 'Weekly', labelKey: 'recurrence.Weekly' },
          { value: 'Custom', labelKey: 'recurrence.Custom' },
        ], $('#editRecurrence').value || 'Daily');
        updateTaskFormFields();
      }

      function taskRow(task) {
        const isSelected = task.id === selectedTaskId;
        return `
          <article class="wire task-row ${task.completed ? 'completed shaded' : ''} ${isSelected ? 'selected' : ''}" data-select-task="${task.id}">
            <div class="wire-inner">
              <button class="check ${task.completed ? 'active' : ''}" type="button" data-action="toggle" data-id="${task.id}" aria-label="Toggle ${escapeHtml(task.title)}">
                <span class="check-box"><svg class="check-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg></span>
              </button>
              <div class="task-main">
                <div class="task-title-row">
                  <span class="task-title serif">${escapeHtml(task.title)}</span>
                  <span class="tag">${escapeHtml(typeLabel(task.type))}</span>
                  <span class="tag ${priorityTag(task.priority)}">${escapeHtml(priorityLabel(task.priority))}</span>
                  ${task.type === 'daily' ? `<span class="tag success">${escapeHtml(recurrenceLabel(task.recurrence || 'Daily'))}</span>` : ''}
                </div>
                <div class="task-meta">
                  <span>${escapeHtml(dueLabel(task))}</span>
                  <span>${escapeHtml(formatDate(task.due))}${task.end && task.end !== task.due ? ' → ' + escapeHtml(formatDate(task.end)) : ''}</span>
                  ${(task.start_time || task.end_time) ? `<span class="task-time">${escapeHtml(task.start_time || '--:--')} — ${escapeHtml(task.end_time || '--:--')}</span>` : ''}
                  ${task.type !== 'questbook' ? `<span>${escapeHtml(task.line || 'Independent')}</span>` : ''}
                  ${task.type === 'daily' ? `<span>${currentLanguage === 'zh' ? '连续' : 'Streak'} ${task.streak || 0}</span>` : ''}
                </div>
              </div>
              <div class="task-actions">
                <button class="plain-icon-button" type="button" data-action="edit" data-id="${task.id}" aria-label="Edit ${escapeHtml(task.title)}">${icons.edit}</button>
                <button class="plain-icon-button" type="button" data-action="delete" data-id="${task.id}" aria-label="Delete ${escapeHtml(task.title)}">${icons.trash}</button>
              </div>
            </div>
          </article>
        `;
      }

      function renderTaskList(list, emptyText = 'No quests found.') {
        if (!list.length) return `<div class="wire"><div class="wire-inner empty serif">${emptyText}</div></div>`;
        return `<div class="task-list">${list.map(taskRow).join('')}</div>`;
      }

      function sortByDue(list) {
        return [...list].sort((a, b) => a.due.localeCompare(b.due) || a.title.localeCompare(b.title));
      }
      function dateDiffIso(startDate, endDate) {
        return Math.round((isoDateMs(endDate) - isoDateMs(startDate)) / 86400000);
      }

      function normalizeQbTimelineItem(item) {
        const start = item.start || item.due || todayOffset(0);
        const end = item.end || item.due || start;
        return isoDateMs(end) < isoDateMs(start)
          ? { ...item, start: end, end: start }
          : { ...item, start, end };
      }

      function dayNumberInRange(dateString, range) {
        return Math.max(1, dateDiffIso(range.start, dateString) + 1);
      }

      function dateFromRangeDay(range, dayNumber) {
        return addDaysIso(range.start, dayNumber - 1);
      }
      function renderTodayTabs(counts) {
        const tabs = [
          { id: 'all', label: tr('tab.all'), count: counts.all },
          { id: 'questbook', label: tr('type.questbook'), count: counts.questbook },
          { id: 'daily', label: tr('type.daily'), count: counts.daily },
          { id: 'side', label: tr('type.side'), count: counts.side },
        ];
        return `
          <div class="index-tabs">
            <div class="today-tabs" role="tablist" aria-label="Today quest filters">
              ${tabs.map((tab) => `
                <button class="today-tab ${todayFilter === tab.id ? 'active' : ''}" type="button" data-today-filter="${tab.id}" role="tab" aria-selected="${todayFilter === tab.id}">
                  <span class="tab-frame"><span class="tab-mid"><span class="tab-line"><span class="tab-face serif">${tab.label} ${tab.count}</span></span></span></span>
                </button>
              `).join('')}
            </div>
            <div class="index-rail" aria-hidden="true"></div>
          </div>
        `;
      }

      function renderTimelineTabs(counts) {
        const tabs = [
          { id: 'all', label: tr('tab.all'), count: counts.all },
          { id: 'questbook', label: tr('type.questbook'), count: counts.questbook },
          { id: 'daily', label: tr('type.daily'), count: counts.daily },
          { id: 'side', label: tr('type.side'), count: counts.side },
        ];
        return `
          <div class="index-tabs">
            <div class="today-tabs" role="tablist" aria-label="Selected day quest filters">
              ${tabs.map((tab) => `
                <button class="today-tab ${timelineFilter === tab.id ? 'active' : ''}" type="button" data-timeline-filter="${tab.id}" role="tab" aria-selected="${timelineFilter === tab.id}">
                  <span class="tab-frame"><span class="tab-mid"><span class="tab-line"><span class="tab-face serif">${tab.label} ${tab.count}</span></span></span></span>
                </button>
              `).join('')}
            </div>
            <div class="index-rail" aria-hidden="true"></div>
          </div>
        `;
      }

      function renderTypeTabs(type, counts) {
        const tabs = [
          { id: 'all', label: tr('tab.all'), count: counts.all },
          { id: 'active', label: tr('tab.active'), count: counts.active },
          { id: 'archive', label: tr('tab.archive'), count: counts.archive },
        ];
        return `
          <div class="index-tabs">
            <div class="today-tabs" role="tablist" aria-label="${typeLabel(type)} filters">
              ${tabs.map((tab) => `
                <button class="today-tab ${typeFilters[type] === tab.id ? 'active' : ''}" type="button" data-type-filter="${tab.id}" data-type="${type}" role="tab" aria-selected="${typeFilters[type] === tab.id}">
                  <span class="tab-frame"><span class="tab-mid"><span class="tab-line"><span class="tab-face serif">${tab.label} ${tab.count}</span></span></span></span>
                </button>
              `).join('')}
            </div>
            <div class="index-rail" aria-hidden="true"></div>
          </div>
        `;
      }
      function todayFilteredTasks() {
        const qbFlat = flattenQuestBooks().filter((t) => dayDiff(t.due) === 0);
        const taskEntries = tasks.filter((task) => dayDiff(task.due) <= 7);
        const visible = [...taskEntries, ...qbFlat];
        if (todayFilter === 'questbook') return visible.filter((t) => t.type === 'questbook');
        if (todayFilter === 'daily') return visible.filter((t) => t.type === 'daily');
        if (todayFilter === 'side') return visible.filter((t) => t.type === 'side');
        return visible;
      }
      function todayStatusText(key) {
        const copy = {
          en: {
            statusTitle: 'System Status',
            total: 'Total Quests',
            active: 'Active',
            done: 'Done',
            completion: 'Completion',
            agentName: 'Travel Guide Anya',
            agentHint: 'Tap to plan today with Anya.',
          },
          zh: {
            statusTitle: '系统状态仪表',
            total: '任务总数',
            active: '待执行',
            done: '已完成',
            completion: 'COMPLETION',
            agentName: '旅行向导 安雅',
            agentHint: '点击与安雅对话，整理今天的路线。',
          },
        };
        if (Object.prototype.hasOwnProperty.call(copy[currentLanguage] || {}, key)) return copy[currentLanguage][key];
        if (Object.prototype.hasOwnProperty.call(copy.en, key)) return copy.en[key];
        return key;
      }
      function renderView() {
        renderNav();
        if (activeView === 'today') renderToday();
        if (activeView === 'questbook') renderQuestBookView();
        if (activeView === 'daily') renderTypedView('daily', tr('view.daily.title'), tr('view.daily.eyebrow'), '');
        if (activeView === 'side') renderTypedView('side', tr('view.side.title'), tr('view.side.eyebrow'), '');
        if (activeView === 'timeline') renderTimeline();
        if (activeView === 'notes') renderNotes();
      }

      function switchView(nextView) {
        if (!nextView || nextView === activeView) return;
        const shell = document.querySelector('.main-shell');
        clearTimeout(viewTransitionTimer);
        shell.classList.remove('page-turn-in');
        shell.classList.add('page-turn-out');
        viewTransitionTimer = window.setTimeout(() => {
          activeView = nextView;
          renderView();
          shell.classList.remove('page-turn-out');
          shell.classList.add('page-turn-in');
          viewTransitionTimer = window.setTimeout(() => {
            shell.classList.remove('page-turn-in');
          }, 580);
        }, 360);
      }
