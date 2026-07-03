/* ================================================================
   Adventure Ledger — Render: Quest Book View
   isoDateMs, addDaysIso, questBookRange, qbLayoutEngine,
   qbItemPosition, qbTimeline (animated), qbCard (v3),
   renderQuestBookView.
   Dead v1 code (qbCardSubRow, qbCardIQRow, qbTimelineItem v1,
   qbTimeline v1, qbCard v1) removed.
   Depends on: state.js, i18n.js, utils.js, render.js
   ================================================================ */

      function isoDateMs(dateString) {
        return new Date(`${dateString}T00:00:00`).getTime();
      }

      function addDaysIso(dateString, days) {
        const date = new Date(`${dateString}T00:00:00`);
        date.setDate(date.getDate() + days);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }

      function questBookRange(book, items) {
        const dates = items.flatMap((item) => [item.start, item.due, item.end]).filter(Boolean).sort();
        const start = book.start || dates[0] || todayOffset(0);
        const end = book.end || dates.slice(-1)[0] || addDaysIso(start, 7);
        return isoDateMs(end) < isoDateMs(start) ? { start: end, end: start } : { start, end };
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

      function qbLayoutEngine(range, items) {
        const dayWidth = 170;
        const skipWidth = 110;
        const totalDays = Math.max(1, dateDiffIso(range.start, range.end) + 1);
        const activeDays = new Set();
        items.map(normalizeQbTimelineItem).forEach((item) => {
          const start = Math.max(1, Math.min(totalDays, dayNumberInRange(item.start, range)));
          const end = Math.max(1, Math.min(totalDays, dayNumberInRange(item.end, range)));
          for (let day = start; day <= end; day += 1) activeDays.add(day);
        });

        const nodes = [];
        const dayXMap = {};
        const dayWidthMap = {};
        let currentX = 0;
        let day = 1;
        while (day <= totalDays) {
          if (activeDays.has(day)) {
            nodes.push({ type: 'day', day, x: currentX, width: dayWidth });
            dayXMap[day] = currentX;
            dayWidthMap[day] = dayWidth;
            currentX += dayWidth;
            day += 1;
            continue;
          }

          let gap = 0;
          while (day + gap <= totalDays && !activeDays.has(day + gap)) gap += 1;
          if (gap >= 2) {
            nodes.push({ type: 'skip', start: day, end: day + gap - 1, x: currentX, width: skipWidth });
            for (let i = 0; i < gap; i += 1) {
              dayXMap[day + i] = currentX + (skipWidth / 2);
              dayWidthMap[day + i] = 0;
            }
            currentX += skipWidth;
            day += gap;
          } else {
            nodes.push({ type: 'day', day, x: currentX, width: dayWidth });
            dayXMap[day] = currentX;
            dayWidthMap[day] = dayWidth;
            currentX += dayWidth;
            day += 1;
          }
        }

        return { nodes, dayXMap, dayWidthMap, width: Math.max(820, currentX + 48), dayWidth, skipWidth };
      }

      function qbItemPosition(item, range, layout) {
        const normalized = normalizeQbTimelineItem(item);
        const totalDays = Math.max(1, dateDiffIso(range.start, range.end) + 1);
        const startDay = Math.max(1, Math.min(totalDays, dayNumberInRange(normalized.start, range)));
        const endDay = Math.max(startDay, Math.min(totalDays, dayNumberInRange(normalized.end, range)));
        const startX = layout.dayXMap[startDay] || 0;
        const endX = layout.dayXMap[endDay] || startX;
        const endW = layout.dayWidthMap[endDay] || layout.dayWidth;
        const width = (endX + endW) - startX;
        const span = endDay - startDay + 1;
        return { left: startX, width, span };
      }

      function qbTimelineItem(item, code, range, layout, actionHtml) {
        const position = qbItemPosition(item, range, layout);
        const done = item.completed;
        const isSpan = position.span > 1;
        return `
          <div class="qb-node ${done ? 'done' : ''} ${isSpan ? 'span' : ''}" style="left:${position.left}px;width:${position.width}px;" title="${escapeHtml(item.title)}">
            ${actionHtml}
            <div class="qb-node-inner">
              <span class="qb-node-code">${escapeHtml(code)}</span>
              <span class="qb-node-title serif">${escapeHtml(item.title || tr('placeholder.title'))}</span>
              <span class="qb-node-due">${escapeHtml(formatDate(item.due))}${isSpan ? ' → ' + escapeHtml(formatDate(item.end || item.due)) : ''}${(item.start_time || item.end_time) ? ' · ' + escapeHtml(item.start_time || '--:--') + '–' + escapeHtml(item.end_time || '--:--') : ''}</span>
            </div>
          </div>
        `;
      }

      function qbTimeline(book) {
        const lines = book.questLines || [];
        const independents = book.independentQuests || [];
        const allItems = [
          ...lines.flatMap((line) => (line.subtasks || [])),
          ...independents,
        ];
        const range = questBookRange(book, allItems.map(normalizeQbTimelineItem));
        const layout = qbLayoutEngine(range, allItems);

        // ── Column backgrounds (alternating) ──
        const colBgs = layout.nodes.map((node, idx) => {
          if (node.type !== 'day') return '';
          return `<div class="qb-col-bg${idx % 2 === 0 ? ' even' : ' odd'}" style="left:${node.x}px;width:${node.width}px;"></div>`;
        }).join('');

        // ── Date axis (top) ──
        const axisHtml = layout.nodes.map((node) => {
          if (node.type === 'skip') {
            return `<div class="qb-axis-skip" style="left:${node.x}px;width:${node.width}px;"></div>`;
          }
          const date = dateFromRangeDay(range, node.day);
          const d = new Date(`${date}T00:00:00`);
          const dayNum = d.getDate();
          const mon = d.getMonth() + 1;
          return `
            <div class="qb-axis-tick" style="left:${node.x}px;width:${node.width}px;">
              <span class="qb-axis-dot"></span>
              <span class="qb-axis-label">${mon}/${dayNum}</span>
            </div>
          `;
        }).join('');

        // ── Grid lines ──
        const gridHtml = layout.nodes.map((node) => {
          if (node.type !== 'day') return '';
          return `<div class="qb-grid-line" style="left:${node.x}px;width:${node.width}px;"></div>`;
        }).join('');

        // ── Quest line lanes ──
        const lineLanes = lines.map((line, lineIndex) => {
          const sorted = sortByDue(line.subtasks || []);
          const itemsHtml = sorted.map((sub, subIndex) => {
            const action = `
              <button class="check ${sub.completed ? 'active' : ''}" type="button" data-qb-action="toggle-subtask" data-qb-book-id="${book.id}" data-qb-line-id="${line.id}" data-qb-sub-id="${sub.id}" aria-label="Toggle">
                <span class="check-box"><svg class="check-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg></span>
              </button>
            `;
            return qbTimelineItem(normalizeQbTimelineItem(sub), `S-${String(subIndex + 1).padStart(2, '0')}`, range, layout, action);
          }).join('');
          const subCount = sorted.length;
          return `
            <div class="qb-lane">
              <div class="qb-lane-head">
                <span class="qb-lane-diamond"></span>
                <span class="qb-lane-title serif">${escapeHtml(line.title || `${tr('field.line')} ${lineIndex + 1}`)}</span>
                <span class="qb-lane-count">${subCount} ${subCount === 1 ? 'task' : 'tasks'}</span>
              </div>
              <div class="qb-lane-track">${itemsHtml || `<span class="qb-lane-empty">—</span>`}</div>
            </div>
          `;
        }).join('');

        // ── Independent quests lane ──
        const iqHtml = independents.length ? `
          <div class="qb-lane qb-lane-iq">
            <div class="qb-lane-head">
              <span class="qb-lane-diamond"></span>
              <span class="qb-lane-title serif">${currentLanguage === 'zh' ? '独立任务' : 'Independent'}</span>
              <span class="qb-lane-count">${independents.length} ${independents.length === 1 ? 'quest' : 'quests'}</span>
            </div>
            <div class="qb-lane-track">
              ${sortByDue(independents).map((iq, index) => {
                const action = `
                  <button class="check ${iq.completed ? 'active' : ''}" type="button" data-qb-action="toggle-iq" data-qb-book-id="${book.id}" data-qb-iq-id="${iq.id}" aria-label="Toggle">
                    <span class="check-box"><svg class="check-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg></span>
                  </button>
                `;
                return qbTimelineItem(normalizeQbTimelineItem(iq), `I-${String(index + 1).padStart(2, '0')}`, range, layout, action);
              }).join('')}
            </div>
          </div>
        ` : '';

        return `
          <div class="qb-timeline-scroll">
            <div class="qb-timeline" style="width:${layout.width}px;min-width:${layout.width}px;">
              <div class="qb-axis-bar">
                <div class="qb-axis-ticks">
                  ${colBgs}
                  ${axisHtml}
                </div>
                <span class="qb-axis-range-end">${range.end.split('-')[1]}/${range.end.split('-')[2]}</span>
              </div>
              <div class="qb-track-area">
                ${colBgs}
                ${lineLanes || `<div class="qb-lane"><div class="qb-lane-head"><span class="qb-lane-title serif">—</span></div><div class="qb-lane-track"><span class="qb-lane-empty">${currentLanguage === 'zh' ? '暂无任务线' : 'No quest lines'}</span></div></div>`}
                ${iqHtml}
              </div>
            </div>
          </div>
        `;
      }

      function qbCard(book) {
        const allItems = [];
        (book.questLines || []).forEach((line) => {
          (line.subtasks || []).forEach((sub) => {
            allItems.push({ ...sub, _type: 'subtask', lineTitle: line.title, lineId: line.id });
          });
        });
        (book.independentQuests || []).forEach((iq) => {
          allItems.push({ ...iq, _type: 'iq' });
        });
        const activeCount = allItems.filter((it) => !it.completed).length;
        const doneCount = allItems.filter((it) => it.completed).length;
        const questWord = currentLanguage === 'zh' ? '任务书' : 'QUEST BOOK';

        return `
          <div class="qb-card wire open">
            <div class="wire-inner">
              <div class="qb-card-header" data-qb-toggle="${book.id}">
                <svg class="qb-card-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
                <span class="qb-card-code">${questWord}</span>
                <span class="qb-card-name serif">${escapeHtml(book.name)}</span>
                <div class="qb-card-meta">
                  <span class="qb-meta-pill active">${activeCount} ${currentLanguage === 'zh' ? '进行中' : 'active'}</span>
                  <span class="qb-meta-pill done">${doneCount} ${currentLanguage === 'zh' ? '已完成' : 'done'}</span>
                </div>
                <button class="qb-card-manage" type="button" data-qb-edit-book="${book.id}">${tr('questbook.manage')}</button>
              </div>
              <div class="qb-card-body">
                ${qbTimeline(book)}
              </div>
            </div>
          </div>
        `;
      }

      function renderQuestBookView() {
        setHeader(tr('view.questbook.title'), tr('view.questbook.eyebrow'), '');
        if (!questBooks.length) {
          $('#viewContent').innerHTML = `<div class="wire"><div class="wire-inner qb-empty">${tr('questbook.empty')}</div></div>`;
          return;
        }
        let totalQuests = 0, totalActive = 0, totalHigh = 0;
        questBooks.forEach((book) => {
          book.questLines.forEach((line) => {
            line.subtasks.forEach((sub) => { totalQuests++; if (!sub.completed) totalActive++; });
          });
          book.independentQuests.forEach((iq) => { totalQuests++; if (!iq.completed) totalActive++; if (iq.priority === 'High') totalHigh++; });
        });
        $('#viewContent').innerHTML = `
          <div class="library-layout">
            <div class="list-section">
              <div class="small-stat-grid">
                <div class="small-stat"><strong>${questBooks.length}</strong><span>${tr('questbook.totalBooks')}</span></div>
                <div class="small-stat"><strong>${totalQuests}</strong><span>${tr('questbook.totalQuests')}</span></div>
                <div class="small-stat"><strong>${totalActive}</strong><span>${tr('stats.active')}</span></div>
                <div class="small-stat"><strong>${totalHigh}</strong><span>${tr('stats.high')}</span></div>
              </div>
              ${questBooks.map((book) => qbCard(book)).join('')}
            </div>
          </div>
        `;
      }
