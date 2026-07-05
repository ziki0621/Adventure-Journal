/* ================================================================
   Adventure Ledger — State
   App-wide constants, storage keys, and mutable global state.
   Depends on: nothing
   ================================================================ */

      const views = [
        { id: 'today', labelKey: 'nav.today', icon: 'sun' },
        { id: 'questbook', labelKey: 'nav.questbook', icon: 'book' },
        { id: 'daily', labelKey: 'nav.daily', icon: 'repeat' },
        { id: 'side', labelKey: 'nav.side', icon: 'spark' },
        { id: 'notes', labelKey: 'nav.notes', icon: 'note' },
      ];

      const typeOptions = [
        { value: 'questbook', labelKey: 'type.questbook' },
        { value: 'daily', labelKey: 'type.daily' },
        { value: 'side', labelKey: 'type.side' },
      ];

      const languageKey = 'adventure-ledger-language';
      const agentConfigKey = 'adventure-agent-config-v1';
      const appTimeZone = 'Asia/Shanghai';
      function currentDateInAppTimeZone() {
        return new Intl.DateTimeFormat('en-CA', {
          timeZone: appTimeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date());
      }
      let appToday = currentDateInAppTimeZone();
      setInterval(() => {
        const fresh = currentDateInAppTimeZone();
        if (fresh !== appToday) {
          appToday = fresh;
          diaryDate = fresh;
          todaySelectedDate = fresh;
          selectedDate = fresh;
          renderView();
        }
      }, 60000);
      let tasks = [];
      let questBooks = [];
      let notes = [];
      let dayNotes = {};
      let dailyChecks = {};    // { taskId: [{id,date,status,...}] }
      let activeView = 'today';
      let todayFilter = 'all';
      let timelineFilter = 'all';
      let typeFilters = { questbook: 'all', daily: 'all', side: 'all' };
      let diaryDate = '';          // initialized in utils.js after todayOffset is defined
      let todaySelectedDate = '';  // date picked in Today view mini-calendar
      let editingId = null;
      let editingNoteId = null;
      let selectedDate = '';       // initialized in utils.js after todayOffset is defined
      let viewTransitionTimer = null;
      let currentLanguage = localStorage.getItem(languageKey) || 'zh';
      let agentMessages = [];
      let agentSaveIndex = 0;      // tracks how many messages have been persisted
      let agentIsStreaming = false;
      let agentAbortController = null;
      let pendingAgentDraft = null;
      let agentConfig = { apiBase: '', apiKey: '', model: '', hasApiKey: false };
      let selectedTaskId = null;    // currently selected task for sticky note
