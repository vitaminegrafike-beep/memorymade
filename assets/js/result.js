/* ═══════════════════════════════════════════════
   MEMORYMADE — Result Logic
   ═══════════════════════════════════════════════ */

(function () {
    'use strict';

    let result;
    try { result = JSON.parse(sessionStorage.getItem(CONFIG.sessionKey)); }
    catch (e) { result = null; }
    if (!result) { window.location.href = 'start.html'; return; }

    const { playerName, duration, attempts, matched, total, status } = result;
    const accuracy = total > 0 ? Math.round((matched / total) * 100) : 0;

    function fmtTime(secs) {
        const m = Math.floor(secs / 60), s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    /* Stars: 3 = all matched, 2 = ≥70%, 1 = ≥40%, 0 = <40% */
    function getStars() {
        if (status === 'completed') return 3;
        if (accuracy >= 70) return 2;
        if (accuracy >= 40) return 1;
        return 0;
    }

    function pickEmoji() {
        if (status === 'completed') {
            if (attempts <= total + 4)  return '🏆';
            if (attempts <= total * 2)  return '🌟';
            return '🎉';
        }
        if (accuracy >= 70) return '😊';
        if (accuracy >= 40) return '💪';
        return '😅';
    }

    function pickMessage() {
        if (status === 'completed') {
            if (attempts <= total + 4)  return `Memoria perfetta, ${playerName}! Hai trovato tutto con pochissimi errori. Sei imbattibile!`;
            if (attempts <= total * 2)  return `Ottimo lavoro, ${playerName}! Completato in ${fmtTime(duration)} con grande efficienza.`;
            return `Ce l'hai fatta, ${playerName}! Qualche tentativo in più, ma hai completato il gioco. Bis?`;
        }
        if (accuracy >= 70) return `Quasi, ${playerName}! Eri vicinissimo alla fine. Un altro giro?`;
        if (accuracy >= 40) return `Buona partita, ${playerName}. Allena la memoria e riprova!`;
        return `Non mollare, ${playerName}! La prossima volta andrà sicuramente meglio. 💪`;
    }

    function renderStars(n) {
        const wrap = document.getElementById('result-stars');
        wrap.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const s = document.createElement('span');
            s.className = 'result-star' + (i < n ? '' : ' empty');
            s.textContent = '⭐';
            wrap.appendChild(s);
        }
    }

    function render() {
        renderStars(getStars());
        document.getElementById('result-emoji').textContent   = pickEmoji();
        document.getElementById('result-score').textContent   = `${matched}/${total}`;
        document.getElementById('result-player').textContent  = playerName;
        document.getElementById('result-message').textContent = pickMessage();

        const badge = document.getElementById('status-badge');
        badge.textContent = status === 'completed' ? '✓ Completato' : '⏰ Tempo scaduto';
        badge.className   = `status-badge ${status}`;

        document.getElementById('stat-time').textContent     = fmtTime(duration);
        document.getElementById('stat-attempts').textContent = attempts;
        document.getElementById('stat-accuracy').textContent = accuracy + '%';
    }

    document.getElementById('btn-replay').addEventListener('click', () => {
        window.location.href = 'game.html';
    });

    document.getElementById('btn-classifica').addEventListener('click', () => {
        window.location.href = 'classifica.html';
    });

    document.getElementById('btn-change-player').addEventListener('click', () => {
        sessionStorage.removeItem(CONFIG.playerKey);
        sessionStorage.removeItem(CONFIG.sessionKey);
        window.location.href = 'start.html';
    });

    render();

})();
