/* ═══════════════════════════════════════════════
   MEMORYMADE — Game Logic
   All 23 colleagues · image preloading · leaderboard save
   ═══════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── Guard ── */
    const playerName = sessionStorage.getItem(CONFIG.playerKey);
    if (!playerName) { window.location.href = 'start.html'; return; }

    /* ── State ── */
    const state = {
        deck:          [],
        flipped:       [],   // max 2 — [{ el, pairId }]
        matched:       0,
        attempts:      0,
        locked:        false,
        timeLeft:      CONFIG.gameDuration,
        timerInterval: null,
        running:       false,
    };

    /* ── DOM refs ── */
    const grid          = document.getElementById('game-grid');
    const timerVal      = document.getElementById('timer-val');
    const timerChip     = document.getElementById('timer-chip');
    const attemptsVal   = document.getElementById('attempts-val');
    const matchedVal    = document.getElementById('matched-val');
    const timerBarFill  = document.getElementById('timer-bar-fill');
    const loadOverlay   = document.getElementById('loading-overlay');
    const loadBarFill   = document.getElementById('load-bar-fill');
    const loadText      = document.getElementById('load-text');

    /* ════════════════════════════════════════════
       DECK — use ALL 23 colleagues
       ════════════════════════════════════════════ */
    function buildDeck() {
        const cards = [];
        COLLEAGUES.forEach((c, pairId) => {
            cards.push({ ...c, pairId });
            cards.push({ ...c, pairId });
        });
        return shuffle(cards);
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /* ════════════════════════════════════════════
       IMAGE PRELOADING
       Preloads all 23 unique images before starting
       to eliminate the flip-lag caused by lazy loading
       ════════════════════════════════════════════ */
    function preloadImages(onComplete) {
        const files = COLLEAGUES.map(c => c.file);
        let loaded = 0;
        const total = files.length;

        updateLoadUI(0, total);

        files.forEach(file => {
            const img = new Image();
            img.onload = img.onerror = () => {
                loaded++;
                updateLoadUI(loaded, total);
                if (loaded === total) onComplete();
            };
            /* Cache-busting not needed — just reference the path */
            img.src = `assets/images/${file}`;
        });
    }

    function updateLoadUI(loaded, total) {
        const pct = Math.round((loaded / total) * 100);
        loadBarFill.style.width = pct + '%';
        loadText.textContent    = `Caricamento ${loaded} / ${total}`;
    }

    /* ════════════════════════════════════════════
       RENDER GRID
       ════════════════════════════════════════════ */
    function renderGrid() {
        grid.innerHTML = '';
        state.deck.forEach((card, i) => {
            const el = document.createElement('div');
            el.className = 'memory-card';
            el.style.setProperty('--i', i);

            el.innerHTML = `
                <div class="card-inner">
                    <div class="card-back">
                        <span class="card-back-monogram">MM</span>
                    </div>
                    <div class="card-front">
                        <img
                            src="assets/images/${card.file}"
                            alt="${escHtml(card.name)}"
                            draggable="false"
                        >
                        <span class="card-name-label">${escHtml(card.name)}</span>
                    </div>
                </div>`;

            el.addEventListener('click', () => handleFlip(el, card));
            grid.appendChild(el);
        });
    }

    /* ════════════════════════════════════════════
       FLIP LOGIC
       ════════════════════════════════════════════ */
    function handleFlip(el, card) {
        if (state.locked)                              return;
        if (!state.running)                            return;
        if (el.classList.contains('is-flipped'))      return;
        if (el.classList.contains('is-matched'))      return;

        el.classList.add('is-flipped');
        state.flipped.push({ el, card });

        if (state.flipped.length === 2) {
            state.attempts++;
            attemptsVal.textContent = state.attempts;
            state.locked = true;
            checkMatch();
        }
    }

    function checkMatch() {
        const [a, b] = state.flipped;

        if (a.card.pairId === b.card.pairId) {
            /* ✓ Match — quick confirm then unlock */
            setTimeout(() => {
                a.el.classList.add('is-matched');
                b.el.classList.add('is-matched');
                a.el.classList.remove('is-flipped');
                b.el.classList.remove('is-flipped');
                state.matched++;
                matchedVal.textContent = `${state.matched}/${COLLEAGUES.length}`;
                state.flipped = [];
                state.locked  = false;
                if (state.matched === COLLEAGUES.length) endGame('completed');
            }, 180);

        } else {
            /* ✗ No match — show wrong immediately, flip back quickly */
            a.el.classList.add('is-wrong');
            b.el.classList.add('is-wrong');

            setTimeout(() => {
                a.el.classList.remove('is-flipped', 'is-wrong');
                b.el.classList.remove('is-flipped', 'is-wrong');
                state.flipped = [];
                state.locked  = false;
            }, CONFIG.flipBackDelay);
        }
    }

    /* ════════════════════════════════════════════
       TIMER
       ════════════════════════════════════════════ */
    function startTimer() {
        updateTimerUI();
        updateTimerBar();
        state.timerInterval = setInterval(() => {
            state.timeLeft--;
            updateTimerUI();
            updateTimerBar();
            if (state.timeLeft <= 0) endGame('timeout');
        }, 1000);
    }

    function updateTimerUI() {
        const m = Math.floor(state.timeLeft / 60);
        const s = state.timeLeft % 60;
        timerVal.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        timerChip.classList.remove('timer-warn', 'timer-danger');
        if      (state.timeLeft <= CONFIG.dangerAt) timerChip.classList.add('timer-danger');
        else if (state.timeLeft <= CONFIG.warnAt)   timerChip.classList.add('timer-warn');
    }

    function updateTimerBar() {
        const pct = (state.timeLeft / CONFIG.gameDuration) * 100;
        timerBarFill.style.width = pct + '%';
        timerBarFill.classList.remove('warn', 'danger');
        if      (state.timeLeft <= CONFIG.dangerAt) timerBarFill.classList.add('danger');
        else if (state.timeLeft <= CONFIG.warnAt)   timerBarFill.classList.add('warn');
    }

    /* ════════════════════════════════════════════
       END GAME
       ════════════════════════════════════════════ */
    function endGame(status) {
        clearInterval(state.timerInterval);
        state.running = false;
        state.locked  = true;

        const elapsed = CONFIG.gameDuration - state.timeLeft;
        const result  = {
            playerName,
            duration:  elapsed,
            timeLeft:  state.timeLeft,
            attempts:  state.attempts,
            matched:   state.matched,
            total:     COLLEAGUES.length,
            status,
            date: new Date().toLocaleDateString('it-IT'),
        };

        /* Save to session (for result.html) */
        sessionStorage.setItem(CONFIG.sessionKey, JSON.stringify(result));

        /* Save to persistent leaderboard */
        saveToLeaderboard(result);

        setTimeout(() => {
            window.location.href = 'result.html';
        }, status === 'completed' ? 800 : 500);
    }

    /* ════════════════════════════════════════════
       LEADERBOARD — localStorage persistence
       ════════════════════════════════════════════ */
    function saveToLeaderboard(result) {
        try {
            const board = JSON.parse(localStorage.getItem(CONFIG.leaderboardKey) || '[]');
            board.push({
                name:     result.playerName,
                duration: result.duration,
                attempts: result.attempts,
                matched:  result.matched,
                total:    result.total,
                status:   result.status,
                date:     result.date,
            });
            /* Keep only the latest maxLeaderboard entries */
            if (board.length > CONFIG.maxLeaderboard) board.splice(0, board.length - CONFIG.maxLeaderboard);
            localStorage.setItem(CONFIG.leaderboardKey, JSON.stringify(board));
        } catch (e) { /* localStorage unavailable — silent fail */ }
    }

    /* ════════════════════════════════════════════
       UTILITY
       ════════════════════════════════════════════ */
    function escHtml(str) {
        return String(str)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /* ════════════════════════════════════════════
       INIT — preload then start
       ════════════════════════════════════════════ */
    state.deck = buildDeck();

    preloadImages(() => {
        /* Hide loading overlay */
        loadOverlay.classList.add('hidden');
        setTimeout(() => {
            loadOverlay.style.display = 'none';
        }, 450);

        /* Render and start */
        renderGrid();
        matchedVal.textContent = `0/${COLLEAGUES.length}`;

        setTimeout(() => {
            state.running = true;
            startTimer();
        }, 100);
    });

})();
