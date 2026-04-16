/* ═══════════════════════════════════════════════
   MEMORYMADE — Classifica Logic
   Reads from localStorage, sorted by best time
   ═══════════════════════════════════════════════ */

(function () {
    'use strict';

    const MEDALS = ['🥇', '🥈', '🥉'];

    function loadBoard() {
        try { return JSON.parse(localStorage.getItem(CONFIG.leaderboardKey) || '[]'); }
        catch (e) { return []; }
    }

    function fmtTime(secs) {
        const m = Math.floor(secs / 60), s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /* Sort: completed first (fastest duration), then timeout (most matched) */
    function sortBoard(board) {
        return [...board].sort((a, b) => {
            if (a.status === b.status) {
                if (a.status === 'completed') return a.duration - b.duration;
                return b.matched - a.matched;
            }
            return a.status === 'completed' ? -1 : 1;
        });
    }

    function render() {
        const raw   = loadBoard();
        const board = sortBoard(raw);
        const list  = document.getElementById('classifica-list');

        /* Summary stats */
        document.getElementById('stat-partite').textContent  = board.length;
        const completed = board.filter(e => e.status === 'completed');
        document.getElementById('stat-record').textContent   =
            completed.length ? fmtTime(completed[0].duration) : '—';
        document.getElementById('stat-completati').textContent =
            completed.length;

        /* Empty state */
        if (!board.length) {
            list.innerHTML = `
                <li class="classifica-empty">
                    <span class="classifica-empty-icon">🎮</span>
                    <p class="classifica-empty-text">
                        Nessuna partita ancora.<br>
                        Gioca e torna qui per vedere la classifica!
                    </p>
                </li>`;
            return;
        }

        list.innerHTML = board.map((e, i) => {
            const rankClass = i < 3 ? `rank-${i + 1}` : '';
            const rankBadge = i < 3 ? MEDALS[i] : (i + 1);
            const timeLabel = e.status === 'completed'
                ? fmtTime(e.duration)
                : `${e.matched}/${e.total} ⚡`;

            return `
                <li class="classifica-item ${rankClass}" style="--i:${i}">
                    <span class="rank-badge">${rankBadge}</span>
                    <div class="item-info">
                        <div class="item-name">${escHtml(e.name)}</div>
                        <div class="item-date">${escHtml(e.date || '')}</div>
                    </div>
                    <span class="item-time">${timeLabel}</span>
                    <span class="item-badge ${e.status}">
                        ${e.status === 'completed' ? '✓ OK' : '⏰'}
                    </span>
                </li>`;
        }).join('');
    }

    /* Reset button */
    document.getElementById('btn-reset').addEventListener('click', () => {
        if (confirm('Sei sicuro di voler azzerare tutta la classifica? L\'operazione non è reversibile.')) {
            localStorage.removeItem(CONFIG.leaderboardKey);
            render();
        }
    });

    render();

})();
