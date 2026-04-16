/* ═══════════════════════════════════════════════
   MEMORYMADE — Badge Generator
   Pixel-accurate reproduction of Figma node 41:210
   Trophy rendered as embedded SVG (no CORS issues)
   Output: exactly 600 × 369 px  (DPR = 1)
   ═══════════════════════════════════════════════ */

const Badge = (function () {
    'use strict';

    /* ── Output size (fixed) ── */
    const W = 600, H = 369;

    /* ── Design tokens ── */
    const GOLD  = '#F5C842';
    const WHITE = '#FFF7E6';

    /* ── Trophy SVG — embedded, no external request, no CORS ──
       Matches the Figma image 6 (48 × 48 px gold trophy cup)    */
    const TROPHY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="tg" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%"   stop-color="#FFE566"/>
      <stop offset="55%"  stop-color="#F5C842"/>
      <stop offset="100%" stop-color="#C9840A"/>
    </linearGradient>
    <linearGradient id="ts" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#B87310"/>
      <stop offset="100%" stop-color="#D4960F"/>
    </linearGradient>
  </defs>
  <!-- Cup bowl -->
  <path d="M26 8 H74 V10 H26 Z" fill="url(#tg)"/>
  <path d="M28 10 C28 10 26 46 50 56 C74 46 72 10 72 10 Z" fill="url(#tg)"/>
  <!-- Left handle -->
  <path d="M28 12 C16 12 10 20 10 30 C10 40 18 46 28 48 L28 12 Z" fill="url(#ts)"/>
  <!-- Right handle -->
  <path d="M72 12 C84 12 90 20 90 30 C90 40 82 46 72 48 L72 12 Z" fill="url(#ts)"/>
  <!-- Stem -->
  <rect x="44" y="56" width="12" height="16" fill="url(#tg)"/>
  <!-- Platform top -->
  <rect x="30" y="72" width="40" height="8" rx="3" fill="url(#tg)"/>
  <!-- Platform base -->
  <rect x="24" y="80" width="52" height="9" rx="3" fill="url(#ts)"/>
  <!-- Shine -->
  <ellipse cx="38" cy="24" rx="5" ry="9" fill="rgba(255,255,255,0.22)" transform="rotate(-15 38 24)"/>
</svg>`;

    const TROPHY_URI = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(TROPHY_SVG);

    /* Preload trophy at module init — data URIs are synchronous */
    const _trophy = new Image();
    _trophy.src = TROPHY_URI;

    /* ── Helpers ── */
    function fmtTime(secs) {
        const m = Math.floor(secs / 60), s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function makeCanvas() {
        const DPR = 1;
        const c   = document.createElement('canvas');
        c.width   = W * DPR;
        c.height  = H * DPR;
        const ctx = c.getContext('2d');
        ctx.scale(DPR, DPR);
        return { canvas: c, ctx };
    }

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

    function truncate(ctx, text, maxW) {
        if (ctx.measureText(text).width <= maxW) return text;
        while (text.length > 1 && ctx.measureText(text + '…').width > maxW) {
            text = text.slice(0, -1);
        }
        return text + '…';
    }

    /* ════════════════════════════════════════════
       DRAW  —  Figma node 41:210, scaled to 600×369
       Figma source: 596 × 380  →  scale ≈ 1.006 h / 0.97 v
       We work directly in target coordinates.
       ════════════════════════════════════════════ */
    function drawBadge(entry) {
        const { canvas, ctx } = makeCanvas();

        /* 1 ── Background gradient (top → bottom: #1e8ac6 → #130828) */
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#1e8ac6');
        bg.addColorStop(1, '#130828');
        rrect(ctx, 0, 0, W, H, 28);
        ctx.fillStyle = bg;
        ctx.fill();

        /* 2 ── Border 2px #1f8cc9 */
        ctx.strokeStyle = '#1f8cc9';
        ctx.lineWidth   = 2;
        ctx.stroke();

        /* 3 ── Inner highlight */
        rrect(ctx, 1, 1, W - 2, H - 2, 27);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth   = 1;
        ctx.stroke();

        /* 4 ── Trophy image  (Figma: 48×48, centered in left-36 w-516 → cx=294)
                Scale x: 600/596 ≈ 1.007  →  cx ≈ 296  top ≈ 47 */
        const trophySize = 48;
        const trophyCX   = W / 2;   // centred horizontally
        const trophyTop  = 47;
        if (_trophy.complete && _trophy.naturalWidth > 0) {
            ctx.drawImage(
                _trophy,
                trophyCX - trophySize / 2, trophyTop,
                trophySize, trophySize
            );
        }

        /* 5 ── "THE WINNER IS"
                Figma: top of text block = trophyTop + 48 + gap-20 = 115
                font 18px Black, white, tracking ~0.05em  */
        ctx.font      = '900 18px Poppins, sans-serif';
        ctx.fillStyle = WHITE;
        ctx.textAlign = 'center';
        ctx.fillText('THE WINNER IS', trophyCX, trophyTop + 48 + 20 + 16);
        /* baseline ≈ 47 + 48 + 20 + 16 = 131 */

        /* 6 ── Player name
                Figma: container top 180, p offset top-[-9px] → abs top 171
                font 35.2px Black, gold
                Scale v: 369/380 ≈ 0.971  →  top ≈ 166  baseline ≈ 166 + 28 = 194 */
        ctx.font      = '900 35.2px Poppins, sans-serif';
        ctx.fillStyle = GOLD;
        ctx.textAlign = 'center';
        ctx.fillText(truncate(ctx, entry.name || '—', 490), W / 2, 194);

        /* 7 ── Stat boxes
                Figma: left 40, top 252, w 516, h 72, each box 165.33px, gap 10px
                Scale h: left → 40*(600/596)≈40  top → 252*(369/380)≈245
                Box height 72*(369/380)≈70 */
        const BX  = 40,  BY  = 245;
        const BW  = (W - BX * 2 - 20) / 3;   // ≈ 160px each
        const BH  = 70,  GAP = 10;

        const accuracy = entry.total > 0 ? Math.round(entry.matched / entry.total * 100) : 0;
        const stats = [
            { val: fmtTime(entry.duration),           lbl: 'TEMPO'      },
            { val: String(entry.attempts),             lbl: 'TENTATIVI'  },
            { val: `${entry.matched}/${entry.total}`,  lbl: 'COMPLETATE' },
        ];

        stats.forEach((s, i) => {
            const x = BX + i * (BW + GAP);

            /* Box */
            rrect(ctx, x, BY, BW, BH, 14);
            ctx.fillStyle   = 'rgba(255,255,255,0.1)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(201,168,76,0.18)';
            ctx.lineWidth   = 1;
            ctx.stroke();

            /* Value  —  pt-15 inside box, font 24px, baseline ≈ BY+34 */
            ctx.font      = '900 24px Poppins, sans-serif';
            ctx.fillStyle = GOLD;
            ctx.textAlign = 'center';
            ctx.fillText(s.val, x + BW / 2, BY + 34);

            /* Label  —  gap-4 below value div (h-24), font 9.6px, baseline ≈ BY+54 */
            ctx.font      = '700 9.6px Poppins, sans-serif';
            ctx.fillStyle = WHITE;
            ctx.textAlign = 'center';
            ctx.fillText(s.lbl, x + BW / 2, BY + 53);
        });

        return canvas;
    }

    /* ── Download ── */
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
        downloadResult(entry) {
            document.fonts.ready.then(() => {
                const safe = (entry.name || 'badge').replace(/\s+/g, '-').toLowerCase();
                download(drawBadge(entry), `memorymade-${safe}.png`);
            });
        },
        downloadLeaderboard(board) {
            if (!board.length) return;
            document.fonts.ready.then(() => {
                download(drawBadge(board[0]), 'memorymade-winner.png');
            });
        },
    };

})();
