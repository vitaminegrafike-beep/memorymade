/* ═══════════════════════════════════════════════
   MEMORYMADE — Badge Generator
   Pixel-accurate reproduction of Figma node 41:210
   Canvas size: 596 × 380 logical px (always 2× DPR output)
   ═══════════════════════════════════════════════ */

const Badge = (function () {
    'use strict';

    /* ── Fixed output dimensions ── */
    const W = 600, H = 369;

    /* ── Tokens ── */
    const GOLD  = '#F5C842';
    const WHITE = '#FFF7E6';

    function fmtTime(secs) {
        const m = Math.floor(secs / 60), s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    /* Always render at 2× for crisp PNG output */
    function makeCanvas() {
        const DPR = 2;
        const c   = document.createElement('canvas');
        c.width   = W * DPR;
        c.height  = H * DPR;
        const ctx = c.getContext('2d');
        ctx.scale(DPR, DPR);
        return { canvas: c, ctx };
    }

    /* Rounded rect path (manual — broad browser support) */
    function rrect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y,     x + w, y + r,     r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x,     y + h, x,       y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x,     y,     x + r,   y,         r);
        ctx.closePath();
    }

    /* Truncate text to fit maxWidth */
    function truncate(ctx, text, maxW) {
        if (ctx.measureText(text).width <= maxW) return text;
        while (text.length > 1 && ctx.measureText(text + '…').width > maxW) {
            text = text.slice(0, -1);
        }
        return text + '…';
    }

    /* ════════════════════════════════════════════
       DRAW BADGE
       Matches Figma node 41:210 exactly
       ════════════════════════════════════════════ */
    function drawBadge(entry) {
        const { canvas, ctx } = makeCanvas();

        /* ── 1. Background: vertical gradient #1e8ac6 → #130828 ── */
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#1e8ac6');
        bg.addColorStop(1, '#130828');

        rrect(ctx, 0, 0, W, H, 28);
        ctx.fillStyle = bg;
        ctx.fill();

        /* ── 2. Border: 2px #1f8cc9 ── */
        ctx.strokeStyle = '#1f8cc9';
        ctx.lineWidth = 2;
        ctx.stroke();

        /* ── 3. Inner highlight: inset 0 1px 0 rgba(255,255,255,.06) ── */
        rrect(ctx, 1, 1, W - 2, H - 2, 27);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();

        /* ── 4. Trophy emoji ──
           Container: left 36, top 48, width 516, flex-col gap-20 items-center
           Emoji font-size 48px → baseline ≈ top + lineHeight (57.6px) × 0.85 ≈ 97 */
        ctx.font      = '48px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏆', W / 2, 97);

        /* ── 5. "THE WINNER IS" ──
           After emoji (height ~57.6) + gap 20 → top ≈ 125.6
           Font 18px Poppins Black, white, tracking 0.896px, uppercase
           Baseline ≈ 125.6 + 18 × 0.82 ≈ 141 */
        ctx.font      = '900 18px Poppins, sans-serif';
        ctx.fillStyle = WHITE;
        ctx.textAlign = 'center';
        /* Simulate letter-spacing 0.896px by spacing manually */
        ctx.fillText('THE WINNER IS', W / 2, 141);

        /* ── 6. Player name ──
           Container: left 65, top 180, w 500, h 49
           p element: top-[-9px] → absolute top 171
           font-size 35.2px, gold, text-center
           Baseline ≈ 171 + 35.2 × 0.82 ≈ 200 */
        ctx.font      = '900 35.2px Poppins, sans-serif';
        ctx.fillStyle = GOLD;
        ctx.textAlign = 'center';
        const name    = truncate(ctx, entry.name || '—', 490);
        ctx.fillText(name, W / 2, 200);

        /* ── 7. Stat boxes ──
           Container: left 40, top 252, width 516, height 72
           Each box: width 165.328px, gap 10px
           Box positions: x = 40, 215.33, 390.66 */
        const boxW   = 165.328;
        const boxGap = 10;
        const boxTop = 252;
        const boxH   = 72;
        const boxX   = [40, 40 + boxW + boxGap, 40 + 2 * (boxW + boxGap)];

        const stats = [
            { val: fmtTime(entry.duration),              lbl: 'TEMPO'     },
            { val: String(entry.attempts),               lbl: 'TENTATIVI' },
            { val: `${entry.matched}/${entry.total}`,    lbl: 'COMPLETATE'},
        ];

        stats.forEach((s, i) => {
            const x = boxX[i];

            /* Box background + border */
            rrect(ctx, x, boxTop, boxW, boxH, 14);
            ctx.fillStyle   = 'rgba(255,255,255,0.1)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(201,168,76,0.18)';
            ctx.lineWidth   = 1;
            ctx.stroke();

            /* Value: pt-15px, font 24px Black, gold, centered
               Baseline ≈ boxTop + 15 + 24 × 0.82 ≈ boxTop + 35 */
            ctx.font      = '900 24px Poppins, sans-serif';
            ctx.fillStyle = GOLD;
            ctx.textAlign = 'center';
            ctx.fillText(s.val, x + boxW / 2, boxTop + 35);

            /* Label: font 9.6px Bold, white, uppercase, tracking 0.864px
               gap-[4px] after value div (h-24px) → label top ≈ boxTop + 15 + 24 + 4 = boxTop + 43
               Baseline ≈ boxTop + 43 + 9.6 × 0.82 ≈ boxTop + 51 */
            ctx.font      = '700 9.6px Poppins, sans-serif';
            ctx.fillStyle = WHITE;
            ctx.textAlign = 'center';
            ctx.fillText(s.lbl, x + boxW / 2, boxTop + 54);
        });

        return canvas;
    }

    /* ── Download as PNG ── */
    function download(canvas, filename) {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a   = document.createElement('a');
            a.href     = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }, 'image/png');
    }

    /* ── Public API ── */
    return {
        /* Individual result badge — uses the player's session data */
        downloadResult(entry) {
            document.fonts.ready.then(() => {
                const safe = (entry.name || 'badge').replace(/\s+/g, '-').toLowerCase();
                download(drawBadge(entry), `memorymade-${safe}.png`);
            });
        },

        /* Leaderboard badge — uses the #1 ranked player */
        downloadLeaderboard(board) {
            if (!board.length) return;
            document.fonts.ready.then(() => {
                download(drawBadge(board[0]), 'memorymade-winner.png');
            });
        },
    };

})();
