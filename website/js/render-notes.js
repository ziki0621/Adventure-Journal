/* ================================================================
   Adventure Ledger — Render: Notes
   Simple note editor + card grid. Write, save, edit, delete.
   Depends on: state.js, i18n.js, utils.js, render.js
   ================================================================ */

      function noteRow(note) {
        return `
          <div class="kb-card wire">
            <div class="wire-inner" data-note-action="edit" data-id="${note.id}">
              <div class="kb-card-header">
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

        const sectionLabel = currentLanguage === 'zh' ? '冒险笔记' : 'Adventure Notes';
        const newLabel = currentLanguage === 'zh' ? '+ 新建笔记' : '+ New Note';

        $('#viewContent').innerHTML = `
          <div class="section-title serif" style="margin:12px 0 18px;"><span class="diamond"></span><span class="text">${sectionLabel}</span><span class="diamond"></span></div>
          <div style="display:flex;justify-content:flex-end;margin-bottom:14px;">
            <button class="chamfer shaded" type="button" id="openNoteEditor" style="height:34px;width:130px;">
              <span class="chamfer-outer"><span class="chamfer-mid"><span class="chamfer-line"><span class="chamfer-face serif">${newLabel}</span></span></span></span>
            </button>
          </div>
          <div class="kb-grid">
            ${sorted.length ? sorted.map(noteRow).join('') : `<div class="wire"><div class="wire-inner empty serif">${tr('empty.notes')}</div></div>`}
          </div>
        `;
      }
