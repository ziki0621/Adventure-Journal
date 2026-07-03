/* ================================================================
   Adventure Ledger — Render: Notes (Journal)
   Knowledge base grid, diary entries with date navigation,
   scratchpad, noteRow.
   Depends on: state.js, i18n.js, utils.js, render.js
   ================================================================ */

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

      function renderNotes() {
        setHeader(tr('view.notes.title'), tr('view.notes.eyebrow'), '');
        const sorted = [...notes].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || b.id - a.id);
        const diaryNote = notes.find((n) => n.date === diaryDate);
        const diaryEntries = sortByDue(notes.filter((n) => /日记|Diary/i.test(n.title))).reverse();
        const scratchText = localStorage.getItem('adventure-scratchpad-v1') || '';

        const title = currentLanguage === 'zh' ? '冒险笔记' : 'Adventure Notes';
        const subtitle = currentLanguage === 'zh' ? '随手记录与知识管理' : 'Jot & Knowledge Management';
        const diaryLabel = currentLanguage === 'zh' ? '冒险日记' : 'Diary';
        const kbLabel = currentLanguage === 'zh' ? '知识库' : 'Knowledge';
        const quickLabel = currentLanguage === 'zh' ? '快速记录' : 'Quick Note';
        const dailyLabel = currentLanguage === 'zh' ? '每日日记' : 'Daily Diary';
        const weatherLabel = currentLanguage === 'zh' ? '天气参数' : 'Weather';
        const weatherValue = currentLanguage === 'zh' ? '晴空' : 'Clear';
        const sysTimeLabel = currentLanguage === 'zh' ? '系统时间' : 'Sys Time';
        const writeLabel = currentLanguage === 'zh' ? '写入档案' : 'Save Entry';
        const scratchPlaceholder = currentLanguage === 'zh' ? '写下你的灵感...' : 'Write down fleeting ideas...';
        const diaryPlaceholder = currentLanguage === 'zh' ? '今天发生了什么特别的事？开始写入序列...' : 'What happened today? Start writing...';
        const kbSectionLabel = currentLanguage === 'zh' ? '知识库目录' : 'Knowledge Base';

        $('#viewContent').innerHTML = `
          <div style="text-align:center;margin-bottom:22px;">
            <h1 class="serif" style="font-size:18px;letter-spacing:0.4em;font-weight:700;margin:0 0 4px;">${title}</h1>
            <p style="font-size:11px;font-weight:700;letter-spacing:0.2em;opacity:0.7;margin:0;">${subtitle}</p>
          </div>

          <div class="today-folder">
            <div class="today-tabs" role="tablist" aria-label="Notes filters" style="padding-left:10px;">
              <button class="today-tab ${notesFilter === 'knowledge' ? 'active' : ''}" type="button" data-notes-filter="knowledge" role="tab" aria-selected="${notesFilter === 'knowledge'}" style="min-width:120px;">
                <span class="tab-frame"><span class="tab-mid"><span class="tab-line"><span class="tab-face serif">${kbLabel}</span></span></span></span>
              </button>
              <button class="today-tab ${notesFilter === 'diary' ? 'active' : ''}" type="button" data-notes-filter="diary" role="tab" aria-selected="${notesFilter === 'diary'}" style="min-width:130px;">
                <span class="tab-frame"><span class="tab-mid"><span class="tab-line"><span class="tab-face serif">${diaryLabel}</span></span></span></span>
              </button>
            </div>
            <div class="today-folder-panel">
              <div class="today-folder-inner">
                ${notesFilter === 'knowledge' ? `
                  <div class="section-title serif" style="margin:12px 0 18px;"><span class="diamond"></span><span class="text">${kbSectionLabel}</span><span class="diamond"></span></div>
                  <div style="display:flex;justify-content:flex-end;margin-bottom:14px;">
                    <button class="chamfer shaded" type="button" id="openNoteEditor" style="height:34px;width:130px;">
                      <span class="chamfer-outer"><span class="chamfer-mid"><span class="chamfer-line"><span class="chamfer-face serif">${currentLanguage === 'zh' ? '+ 新建笔记' : '+ New Note'}</span></span></span></span>
                    </button>
                  </div>
                  <div class="kb-grid">
                    ${sorted.length ? sorted.map(noteRow).join('') : `<div class="wire"><div class="wire-inner empty serif">${tr('empty.notes')}</div></div>`}
                  </div>
                ` : `
                  <div class="notes-layout">
                    <div class="day-note-card notes-sticky">
                      <div class="day-note-head">
                        <h3 class="day-note-title serif">${quickLabel}</h3>
                      </div>
                      <textarea data-scratchpad placeholder="${scratchPlaceholder}" style="min-height:260px;">${escapeHtml(scratchText)}</textarea>
                    </div>
                    <div>
                      <div class="section-title serif" style="margin-bottom:14px;"><span class="diamond"></span><span class="text">${dailyLabel}</span><span class="diamond"></span></div>
                      <div class="notes-diary-header">
                        <button class="calendar-nav" type="button" data-diary-date="-1" aria-label="Previous day"><svg class="icon" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>
                        <span>${sysTimeLabel}</span>
                        <span class="notes-date">${diaryDate}</span>
                        <span>${weatherLabel}</span>
                        <span>${weatherValue}</span>
                        <button class="calendar-nav" type="button" data-diary-date="1" aria-label="Next day"><svg class="icon" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button>
                      </div>
                      <div class="wire">
                        <div class="wire-inner">
                          <textarea class="notes-diary-input" data-diary-entry id="diaryTextarea" placeholder="${diaryPlaceholder}">${escapeHtml(diaryNote ? diaryNote.body : (localStorage.getItem('adventure-diary-draft') || ''))}</textarea>
                          <div class="notes-diary-footer">
                            <span class="notes-char-count">${(diaryNote ? diaryNote.body.length : (localStorage.getItem('adventure-diary-draft') || '').length)} CHARS</span>
                            <button class="chamfer shaded" type="button" id="saveDiaryEntry" style="height:34px;width:130px;">
                              <span class="chamfer-outer"><span class="chamfer-mid"><span class="chamfer-line"><span class="chamfer-face serif">${writeLabel}</span></span></span></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="wire" style="margin-top:16px;">
                      <div class="wire-inner" style="max-height:200px;overflow-y:auto;padding:10px 14px;">
                        <div class="section-head"><h3 class="serif" style="font-size:10px;letter-spacing:0.16em;">${currentLanguage === 'zh' ? '过往日记' : 'Past Entries'}</h3><span style="font-size:8px;">${diaryEntries.length} ${currentLanguage === 'zh' ? '篇' : 'entries'}</span></div>
                        ${diaryEntries.length ? diaryEntries.map((n) => `
                          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(74,59,44,0.06);cursor:pointer;" data-diary-entry-row data-diary-date="${n.date}">
                            <div style="min-width:0;">
                              <span class="serif" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;">${escapeHtml(n.title)}</span>
                              <span style="color:var(--muted);font-size:8px;font-weight:700;">${escapeHtml(formatDate(n.date))} · ${(n.body || '').length} ${currentLanguage === 'zh' ? '字' : 'chars'}</span>
                            </div>
                            <button class="plain-icon-button" type="button" data-note-action="edit" data-id="${n.id}" style="flex:0 0 auto;">${icons.edit}</button>
                          </div>
                        `).join('') : `<div class="empty" style="padding:16px 0;font-size:9px;">${currentLanguage === 'zh' ? '还没有日记，写一篇吧。' : 'No diary entries yet.'}</div>`}
                      </div>
                    </div>
                  </div>
                `}
              </div>
            </div>
          </div>
        `;
      }
