/* ═══════════════════════════════════════════════
   MEMORYMADE — Classifica Logic
   Firebase real-time listener · localStorage fallback
   ═══════════════════════════════════════════════ */

(function () {
    'use strict';

    const MEDALS = ['🥇', '🥈', '🥉'];

    const list        = document.getElementById('classifica-list');
    const btnReset    = document.getElementById('btn-reset');
    const btnBadge    = document.getElementById('btn-badge');

    let currentBoard  = [];   // kept in sync on every render

    /* ── Helpers ── */
    function fmtTime(secs) {
        const m = Math.floor(secs / 60), s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /* Sort: completed first (fewest attempts, then fastest time),
       then timeout (most matched, then fastest time) */
    function sortBoard(board) {
        return [...board].sort((a, b) => {
            if (a.status !== b.status) return a.status === 'completed' ? -1 : 1;
            if (a.status === 'completed') {
                if (a.attempts !== b.attempts) return a.attempts - b.attempts;
                return a.duration - b.duration;
            }
            if (a.matched !== b.matched) return b.matched - a.matched;
            return a.duration - b.duration;
        });
    }

    /* ── Render ── */
    function renderBoard(entries) {
        const board = sortBoard(entries);
        currentBoard = board;   // keep reference for badge export

        /* Summary stats */
        document.getElementById('stat-partite').textContent = board.length;
        const completed = board.filter(e => e.status === 'completed');
        document.getElementById('stat-record').textContent =
            completed.length ? fmtTime(completed[0].duration) : '—';
        document.getElementById('stat-completati').textContent = completed.length;

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

    /* ════════════════════════════════════════════
       FIREBASE — real-time listener
       ════════════════════════════════════════════ */
    function initFirebase() {
        try {
            if (!firebase.apps.length) firebase.initializeApp(CONFIG.firebase);
            const db  = firebase.database();
            const ref = db.ref('leaderboard');

            /* Show live indicator */
            const liveBadge = document.getElementById('live-badge');
            if (liveBadge) liveBadge.style.display = 'inline';

            /* Real-time subscription — fires immediately + on every new entry */
            ref.on('value', snapshot => {
                const entries = [];
                snapshot.forEach(child => {
                    entries.push(child.val());
                });
                renderBoard(entries);
            }, err => {
                console.warn('Firebase read error, falling back:', err);
                renderFromLocalStorage();
            });

            /* Reset — clears Firebase + localStorage */
            btnReset.addEventListener('click', () => {
                if (!confirm('Sei sicuro di voler azzerare tutta la classifica?')) return;
                ref.remove();
                localStorage.removeItem(CONFIG.leaderboardKey);
            });

        } catch (e) {
            console.warn('Firebase init failed, falling back:', e);
            renderFromLocalStorage();
            bindResetLocalStorage();
        }
    }

    /* ════════════════════════════════════════════
       LOCALSTORAGE FALLBACK (useFirebase: false)
       ════════════════════════════════════════════ */
    function renderFromLocalStorage() {
        try {
            const entries = JSON.parse(localStorage.getItem(CONFIG.leaderboardKey) || '[]');
            renderBoard(entries);
        } catch (e) {
            renderBoard([]);
        }
    }

    function bindResetLocalStorage() {
        btnReset.addEventListener('click', () => {
            if (!confirm('Sei sicuro di voler azzerare tutta la classifica?')) return;
            localStorage.removeItem(CONFIG.leaderboardKey);
            renderFromLocalStorage();
        });
    }

    /* ── Badge button ── */
    if (btnBadge) {
        btnBadge.addEventListener('click', () => {
            if (!currentBoard.length) return;
            btnBadge.textContent = '⏳ Generando…';
            btnBadge.disabled = true;
            setTimeout(() => {
                Badge.downloadLeaderboard(currentBoard);
                btnBadge.textContent = '📸 Salva classifica come immagine';
                btnBadge.disabled = false;
            }, 80);
        });
    }

    /* ── Init ── */
    if (CONFIG.useFirebase) {
        initFirebase();
    } else {
        renderFromLocalStorage();
        bindResetLocalStorage();
    }

})();
