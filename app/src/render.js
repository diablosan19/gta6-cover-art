// Vice Cover Studio — the cover renderer. Draws the whole poster onto a
// 2D canvas: cream gutters, photo panels under a colour grade, a studio
// masthead, the big stacked title, and the studio's own age badge.
// Everything is drawn from state, so the on-screen preview and the PNG
// export are the same picture at different sizes.

import { GRADES, SIZES, panelRects } from './studio.js';

const PAPER = '#f6efdd';
const INK = '#17130e';
const PINK = '#ff2e88';
const CYAN = '#22d3ee';

function drawPhoto(ctx, img, rect, place, filter) {
  if (!img || !img.complete || img.naturalWidth === 0) {
    // Nothing loaded yet: a dusk gradient stands in for the photograph.
    const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    g.addColorStop(0, '#3b2d5c');
    g.addColorStop(0.55, '#b23a6d');
    g.addColorStop(1, '#ff9a3d');
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    return;
  }
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * place.zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const ox = rect.x + (rect.w - dw) * place.dx;
  const oy = rect.y + (rect.h - dh) * place.dy;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.filter = filter;
  ctx.drawImage(img, ox, oy, dw, dh);
  ctx.filter = 'none';
  ctx.restore();
}

function washPanels(ctx, w, h, kind) {
  ctx.save();
  if (kind === 'sunset') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(46, 0, 84, 0.20)');
    g.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    g.addColorStop(1, 'rgba(255, 94, 40, 0.22)');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else if (kind === 'neon') {
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 0, 128, 0.13)';
    ctx.fillRect(0, 0, w / 2, h);
    ctx.fillStyle = 'rgba(0, 229, 255, 0.13)';
    ctx.fillRect(w / 2, 0, w / 2, h);
  } else if (kind === 'noir') {
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(20, 20, 30, 0.35)';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

function vignette(ctx, w, h) {
  const r = Math.hypot(w, h) / 2;
  const g = ctx.createRadialGradient(w / 2, h / 2, r * 0.55, w / 2, h / 2, r);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(10,4,18,0.34)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function masthead(ctx, w, city) {
  const bandH = Math.max(44, w * 0.052);
  ctx.fillStyle = 'rgba(12, 8, 20, 0.82)';
  ctx.fillRect(0, 0, w, bandH);
  ctx.fillStyle = PINK;
  ctx.fillRect(0, bandH, w, Math.max(3, w * 0.004));
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${bandH * 0.42}px "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = 'left';
  try { ctx.letterSpacing = '3px'; } catch { /* older canvas: no spacing */ }
  ctx.fillText('VICE COVER STUDIO', w * 0.035, bandH / 2 + 1);
  ctx.textAlign = 'right';
  ctx.fillStyle = CYAN;
  ctx.fillText((city || 'SANDBOX CITY').toUpperCase(), w * 0.965, bandH / 2 + 1);
  ctx.textAlign = 'left';
  try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
}

function titleBlock(ctx, w, h, state) {
  const base = h - h * 0.035;
  // Scrim so the words sit on the art, not in it.
  const scrimH = h * 0.34;
  const g = ctx.createLinearGradient(0, h - scrimH, 0, h);
  g.addColorStop(0, 'rgba(8,4,14,0)');
  g.addColorStop(1, 'rgba(8,4,14,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, h - scrimH, w, scrimH);

  const title = (state.title || 'UNTITLED').toUpperCase();
  let size = w * 0.148;
  ctx.textBaseline = 'alphabetic';
  const setFont = (s) => {
    ctx.font = `italic 900 ${s}px "Arial Black", "Segoe UI", system-ui, sans-serif`;
  };
  setFont(size);
  while (ctx.measureText(title).width > w * 0.8 && size > 24) {
    size *= 0.92;
    setFont(size);
  }
  const x = w * 0.045;
  // Hot-pink offset shadow, then the paper-white face, then a hairline ink edge.
  ctx.fillStyle = PINK;
  ctx.fillText(title, x + size * 0.045, base - size * 0.52);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = INK;
  ctx.lineWidth = size * 0.035;
  ctx.fillText(title, x, base - size * 0.58);
  ctx.strokeText(title, x, base - size * 0.58);

  if (state.sub) {
    ctx.font = `700 ${w * 0.027}px "Segoe UI", system-ui, sans-serif`;
    try { ctx.letterSpacing = '2px'; } catch { /* ignore */ }
    ctx.fillStyle = '#ffe9a8';
    ctx.fillText(state.sub.toUpperCase(), x + 2, base - size * 0.58 + w * 0.052);
    try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
  }
}

function ageBadge(ctx, w, h) {
  const s = w * 0.105;
  const x = w - s - w * 0.04;
  const y = h - s - h * 0.032;
  ctx.save();
  ctx.fillStyle = '#8f1020';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = s * 0.045;
  ctx.beginPath();
  ctx.roundRect(x, y, s, s, s * 0.12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = `900 ${s * 0.44}px "Arial Black", system-ui, sans-serif`;
  ctx.fillText('18+', x + s / 2, y + s * 0.56);
  ctx.font = `700 ${s * 0.13}px "Segoe UI", system-ui, sans-serif`;
  ctx.fillText('ADULTS ONLY', x + s / 2, y + s * 0.8);
  ctx.restore();
  ctx.textAlign = 'left';
}

function selectionHalo(ctx, rect) {
  ctx.save();
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 5;
  ctx.shadowColor = CYAN;
  ctx.shadowBlur = 18;
  ctx.strokeRect(rect.x + 3, rect.y + 3, rect.w - 6, rect.h - 6);
  ctx.restore();
}

// Draw the cover described by state onto ctx at full export resolution.
// images is the tray's array of HTMLImageElement (or nulls). When
// forExport is false the selected panel gets its editing halo.
export function drawCover(ctx, state, images, forExport) {
  const { w, h } = SIZES[state.size];
  if (ctx.canvas.width !== w) ctx.canvas.width = w;
  if (ctx.canvas.height !== h) ctx.canvas.height = h;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);

  const rects = panelRects(state.layout, w, h);
  const gut = Math.max(10, w * 0.016);
  const grade = GRADES[state.grade] || GRADES.sunset;

  rects.forEach((frac, i) => {
    const rect = {
      x: frac.x * w + gut / 2,
      y: frac.y * h + gut / 2,
      w: frac.w * w - gut,
      h: frac.h * h - gut,
    };
    const place = state.panels[i] || { photo: 0, zoom: 1, dx: 0.5, dy: 0.5 };
    drawPhoto(ctx, images[place.photo], rect, place, grade.filter);
    ctx.strokeStyle = 'rgba(23, 19, 14, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    if (!forExport && i === state.selected) selectionHalo(ctx, rect);
  });

  washPanels(ctx, w, h, grade.wash);
  vignette(ctx, w, h);
  masthead(ctx, w, state.city);
  titleBlock(ctx, w, h, state);
  ageBadge(ctx, w, h);
  return rects;
}
