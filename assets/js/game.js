/* ═══════════════════════════════════════════════
   MEMORYMADE — Game Logic
   18 random colleagues per game · image preloading · leaderboard save
   ═══════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── Guard ── */
    const playerName = sessionStorage.getItem(CONFIG.playerKey);
    if (!playerName) { window.location.href = 'start.html'; return; }

    /* ── State ── */
    const state = {
        deck:          [],
        flipped:       [],   // cards currently face-up (max 2 while checking)
        pending:       null, // { a, b, timer } — unmatched pair waiting to flip back
        matched:       0,
        attempts:      0,
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
       DECK — pick CONFIG.pairsPerGame random colleagues
       ════════════════════════════════════════════ */

    // Random subset picked fresh each game load
    const selected = shuffle([...COLLEAGUES]).slice(0, CONFIG.pairsPerGame);

    function buildDeck() {
        const cards = [];
        selected.forEach((c, pairId) => {
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
        const files = selected.map(c => c.file);
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
                        <img class="card-back-symbol" src="https://www.figma.com/api/mcp/asset/561cedff-b25a-49ac-8286-b4ac43495973" alt="">
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
       No global lock — only the two wrong cards are
       individually marked is-busy during flip-back.
       Clicking any other card while waiting is instant.
       Clicking a new card cancels the pending flip-back.
       ════════════════════════════════════════════ */

    /* Cancel a pending flip-back and snap cards face-down immediately */
    function cancelPending() {
        if (!state.pending) return;
        clearTimeout(state.pending.timer);
        const { a, b } = state.pending;
        a.classList.remove('is-flipped', 'is-wrong', 'is-flipping-back', 'is-busy');
        b.classList.remove('is-flipped', 'is-wrong', 'is-flipping-back', 'is-busy');
        state.pending = null;
        // state.flipped was already cleared when pending was created
    }

    function handleFlip(el, card) {
        if (!state.running)                            return;
        if (el.classList.contains('is-flipped'))      return;
        if (el.classList.contains('is-matched'))      return;
        if (el.classList.contains('is-busy'))         return;

        /* Clicking a new card while 2 unmatched cards are showing:
           snap them face-down immediately so the player can keep going */
        if (state.pending) cancelPending();

        /* Waiting for match-animation to settle (180ms) — don't allow a 3rd flip */
        if (state.flipped.length >= 2) return;

        el.classList.add('is-flipped');
        state.flipped.push({ el, card });

        if (state.flipped.length === 2) {
            state.attempts++;
            attemptsVal.textContent = state.attempts;
            checkMatch();
        }
    }

    function checkMatch() {
        const [a, b] = state.flipped;

        if (a.card.pairId === b.card.pairId) {
            /* ✓ Match — clear flipped immediately so next clicks work at once */
            playMatch();
            state.flipped = [];
            setTimeout(() => {
                a.el.classList.add('is-matched');
                b.el.classList.add('is-matched');
                a.el.classList.remove('is-flipped');
                b.el.classList.remove('is-flipped');
                state.matched++;
                matchedVal.textContent = `${state.matched}/${selected.length}`;
                if (state.matched === selected.length) endGame('completed');
            }, 180);

        } else {
            /* ✗ No match — schedule slow flip-back; board stays open for other cards */
            playWrong();
            a.el.classList.add('is-wrong');
            b.el.classList.add('is-wrong');

            const aEl = a.el, bEl = b.el;
            const timer = setTimeout(() => {
                /* 1. Apply slow transition, then force reflow, then remove is-flipped */
                aEl.classList.add('is-flipping-back', 'is-busy');
                bEl.classList.add('is-flipping-back', 'is-busy');
                aEl.classList.remove('is-wrong');
                bEl.classList.remove('is-wrong');
                void aEl.offsetHeight;           // force reflow → slow transition takes effect
                aEl.classList.remove('is-flipped');
                bEl.classList.remove('is-flipped');
                state.pending = null;

                /* 2. Remove helper classes after animation completes */
                setTimeout(() => {
                    aEl.classList.remove('is-flipping-back', 'is-busy');
                    bEl.classList.remove('is-flipping-back', 'is-busy');
                }, 700);
            }, CONFIG.flipBackDelay);

            /* Clear flipped immediately so new clicks on other cards go through */
            state.flipped  = [];
            state.pending  = { a: aEl, b: bEl, timer };
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
        if (state.pending) cancelPending();
        if (status === 'completed') playWin();

        const elapsed = CONFIG.gameDuration - state.timeLeft;
        const result  = {
            playerName,
            duration:  elapsed,
            timeLeft:  state.timeLeft,
            attempts:  state.attempts,
            matched:   state.matched,
            total:     selected.length,
            status,
            date: new Date().toLocaleDateString('it-IT'),
        };

        /* Save to session (for result.html) */
        sessionStorage.setItem(CONFIG.sessionKey, JSON.stringify(result));

        /* Save to persistent leaderboard (localStorage fallback) */
        saveToLeaderboard(result);

        /* Save to Firebase (real-time multi-device) */
        saveToFirebase(result);

        setTimeout(() => {
            window.location.href = 'result.html';
        }, status === 'completed' ? 800 : 500);
    }

    /* ════════════════════════════════════════════
       LEADERBOARD — localStorage persistence (fallback)
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
            if (board.length > CONFIG.maxLeaderboard) board.splice(0, board.length - CONFIG.maxLeaderboard);
            localStorage.setItem(CONFIG.leaderboardKey, JSON.stringify(board));
        } catch (e) { /* localStorage unavailable — silent fail */ }
    }

    /* ════════════════════════════════════════════
       FIREBASE — real-time multi-device leaderboard
       ════════════════════════════════════════════ */
    function saveToFirebase(result) {
        if (!CONFIG.useFirebase) return;
        try {
            if (!firebase.apps.length) firebase.initializeApp(CONFIG.firebase);
            firebase.database().ref('leaderboard').push({
                name:      result.playerName,
                duration:  result.duration,
                attempts:  result.attempts,
                matched:   result.matched,
                total:     result.total,
                status:    result.status,
                date:      result.date,
                timestamp: Date.now(),
            });
        } catch (e) { console.warn('Firebase write failed:', e); }
    }

    /* ════════════════════════════════════════════
       SOUNDS — MP3 files + Web Audio API (win)
       ════════════════════════════════════════════ */

    /* Preload MP3s so playback is instant on first trigger */
    const _sfx = {
        match: new Audio('assets/audio/positive.mp3'),
        wrong: new Audio('assets/audio/negative.mp3'),
    };
    _sfx.match.load();
    _sfx.wrong.load();

    function playSound(audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});   // ignore autoplay policy errors silently
    }

    function playMatch() { playSound(_sfx.match); }
    function playWrong()  { playSound(_sfx.wrong); }

    /* Win fanfare — kept as Web Audio (no file needed) */
    let audioCtx = null;
    function getCtx() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx;
    }
    function tone(freq, type, vol, start, dur) {
        const ctx  = getCtx();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.05);
    }
    function playWin() {
        [523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', 0.3, i * 0.08, 0.18));
        tone(1047, 'sine', 0.35, 0.38, 0.55);
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
        matchedVal.textContent = `0/${selected.length}`;

        setTimeout(() => {
            state.running = true;
            startTimer();
        }, 100);
    });

})();
