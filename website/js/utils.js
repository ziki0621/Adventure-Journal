/* ================================================================
   Adventure Ledger — Utils
   DOM helpers ($), sidebar control, i18n (tr), date math,
   formatting, rendering selects, task counts.
   Depends on: state.js, i18n.js
   ================================================================ */

      const $ = (selector) => document.querySelector(selector);
      const sidebarQuery = window.matchMedia('(max-width: 760px)');
      function setSidebar(open) {
        const page = document.querySelector('.page');
        const menuToggle = $('#menuToggle');
        page.classList.toggle('sidebar-open', open);
        if (menuToggle) menuToggle.setAttribute('aria-expanded', String(open));
      }

      function isSidebarOpen() {
        return document.querySelector('.page').classList.contains('sidebar-open');
      }

      function toggleSidebar() {
        setSidebar(!isSidebarOpen());
      }

      function tr(key) {
        return messages[currentLanguage]?.[key] || messages.en[key] || key;
      }

      function priorityLabel(priority) {
        return tr(`priority.${priority}`);
      }

      function recurrenceLabel(value) {
        return tr(`recurrence.${value}`) || value;
      }

      function todayOffset(offset) {
        const [year, month, day] = appToday.split('-').map(Number);
        const date = new Date(year, month - 1, day + offset);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }

      // Initialize date-dependent globals now that todayOffset is available
      diaryDate = todayOffset(0);
      todaySelectedDate = todayOffset(0);
      selectedDate = todayOffset(0);
      function escapeHtml(value) {
        return String(value)
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#039;');
      }

      function formatDate(dateString) {
        const date = new Date(`${dateString}T00:00:00`);
        return date.toLocaleDateString(currentLanguage === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', weekday: 'short' });
      }

      function dayDiff(dateString) {
        const today = new Date(`${todayOffset(0)}T00:00:00`);
        const date = new Date(`${dateString}T00:00:00`);
        return Math.round((date - today) / 86400000);
      }

      function typeLabel(type) {
        return tr(`type.${type}`) || type;
      }

      function priorityTag(priority) {
        if (priority === 'High') return 'danger';
        if (priority === 'Low') return '';
        return 'brass';
      }

      function dueLabel(task) {
        const diff = dayDiff(task.due);
        if (diff < 0) return currentLanguage === 'zh' ? `${Math.abs(diff)}${tr('due.overdue')}` : `${Math.abs(diff)} ${tr('due.overdue')}`;
        if (diff === 0) return tr('due.today');
        if (diff === 1) return tr('due.tomorrow');
        return currentLanguage === 'zh' ? `${diff}${tr('due.days')}` : `${tr('due.in')} ${diff} ${tr('due.days')}`;
      }

      function taskCounts() {
        const qbFlat = flattenQuestBooks();
        return {
          today: [...tasks, ...qbFlat].filter((task) => !task.completed && dayDiff(task.due) <= 7).length,
          questbook: qbFlat.filter((task) => !task.completed).length,
          daily: tasks.filter((task) => task.type === 'daily' && !task.completed).length,
          side: tasks.filter((task) => task.type === 'side' && !task.completed).length,
          timeline: [...tasks, ...qbFlat].filter((task) => !task.completed).length,
          notes: notes.length,
        };
      }

      function renderSelect(select, options, value) {
        select.innerHTML = options.map((option) => {
          const val = typeof option === 'string' ? option : option.value;
          const label = typeof option === 'string' ? priorityLabel(option) : tr(option.labelKey);
          return `<option value="${val}">${label}</option>`;
        }).join('');
        select.value = value;
      }
      function renderSelectOptions(options, selected) {
        return options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? priorityLabel(opt) : tr(opt.labelKey);
          return `<option value="${val}"${val === selected ? ' selected' : ''}>${label}</option>`;
        }).join('');
      }
