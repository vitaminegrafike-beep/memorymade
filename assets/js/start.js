/* ═══════════════════════════════════════════════
   MEMORYMADE — Start Page Logic
   ═══════════════════════════════════════════════ */

(function () {
    'use strict';

    const nameInput = document.getElementById('player-name');
    const btnStart  = document.getElementById('btn-start');

    /* Enable/disable Start button based on input */
    nameInput.addEventListener('input', () => {
        btnStart.disabled = nameInput.value.trim().length === 0;
    });

    /* Enter key shortcut */
    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !btnStart.disabled) startGame();
    });

    btnStart.addEventListener('click', startGame);

    function startGame() {
        const name = nameInput.value.trim();
        if (!name) return;

        /* Store player name for game.html and result.html */
        sessionStorage.setItem(CONFIG.playerKey, name);

        /* Subtle exit animation before redirect */
        document.querySelector('.start-card').style.transition = 'opacity .2s, transform .2s';
        document.querySelector('.start-card').style.opacity    = '0';
        document.querySelector('.start-card').style.transform  = 'scale(.97)';

        setTimeout(() => {
            window.location.href = 'game.html';
        }, 220);
    }

    /* Auto-focus the input */
    nameInput.focus();

})();
