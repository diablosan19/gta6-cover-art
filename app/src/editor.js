// Vice Cover Studio — editor wiring: the photo tray, panel selection,
// drag-to-reposition, zoom, cover words, and the PNG export. The renderer
// (render.js) is a pure function of state; everything here mutates state
// and asks for a redraw.

import { SAMPLES, SIZES, fitPanels, freshPlacement, freshState, panelRects } from './studio.js';
import { drawCover } from './render.js';

const $ = (id) => document.getElementById(id);

export function startStudio(opts = {}) {
  const preset = opts.preset || {};
  const canvas = $('cover');
  const ctx = canvas.getContext('2d');
  let state = freshState();
  const photos = []; // { img, name }

  const images = () => photos.map((p) => p.img);
  const redraw = () => drawCover(ctx, state, images(), opts.shotCover === true);

  // ---- photo tray -------------------------------------------------------

  const tray = $('tray');
  function renderTray() {
    tray.replaceChildren();
    photos.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.title = p.name;
      if (i === state.activePhoto) b.className = 'on';
      const im = document.createElement('img');
      im.src = p.img.src;
      im.alt = p.name;
      b.appendChild(im);
      b.addEventListener('click', () => {
        state.activePhoto = i;
        state.panels[state.selected].photo = i;
        renderTray();
        redraw();
      });
      tray.appendChild(b);
    });
  }

  function addPhoto(img, name) {
    photos.push({ img, name });
    return photos.length - 1;
  }

  function loadSample(sample) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(addPhoto(img, sample.name));
      img.onerror = () => resolve(-1);
      img.src = sample.src;
    });
  }

  // ---- segmented controls ------------------------------------------------

  function wireSeg(id, onPick) {
    const seg = $(id);
    seg.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button');
      if (!btn) return;
      seg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === btn));
      onPick(btn.dataset);
    });
    return (value) => {
      seg.querySelectorAll('button').forEach((b) => {
        b.classList.toggle('on', Object.values(b.dataset).includes(value));
      });
    };
  }

  const markLayout = wireSeg('layoutSeg', (d) => {
    state.layout = d.layout;
    fitPanels(state, panelRects(state.layout, SIZES[state.size].w, SIZES[state.size].h).length);
    syncZoom();
    redraw();
  });
  const markGrade = wireSeg('gradeSeg', (d) => {
    state.grade = d.grade;
    redraw();
  });
  const markSize = wireSeg('sizeSeg', (d) => {
    state.size = d.size;
    fitPanels(state, panelRects(state.layout, SIZES[state.size].w, SIZES[state.size].h).length);
    redraw();
  });

  // ---- cover words --------------------------------------------------------

  const bindText = (id, key) => {
    $(id).addEventListener('input', (ev) => {
      state[key] = ev.target.value;
      redraw();
    });
  };
  bindText('titleInput', 'title');
  bindText('subInput', 'sub');
  bindText('cityInput', 'city');

  // ---- selected panel: zoom + drag ---------------------------------------

  const zoomRange = $('zoomRange');
  function syncZoom() {
    const place = state.panels[state.selected];
    const v = Math.round((place ? place.zoom : 1) * 100);
    zoomRange.value = String(v);
    $('zoomVal').textContent = `${v}%`;
  }
  zoomRange.addEventListener('input', () => {
    const place = state.panels[state.selected];
    if (!place) return;
    place.zoom = Number(zoomRange.value) / 100;
    $('zoomVal').textContent = `${zoomRange.value}%`;
    redraw();
  });

  function canvasPoint(ev) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((ev.clientX - r.left) / r.width) * canvas.width,
      y: ((ev.clientY - r.top) / r.height) * canvas.height,
    };
  }

  let drag = null;
  canvas.addEventListener('pointerdown', (ev) => {
    const p = canvasPoint(ev);
    const { w, h } = SIZES[state.size];
    const rects = panelRects(state.layout, w, h);
    const hit = rects.findIndex(
      (r) => p.x >= r.x * w && p.x <= (r.x + r.w) * w && p.y >= r.y * h && p.y <= (r.y + r.h) * h,
    );
    if (hit >= 0) state.selected = hit;
    drag = { x: p.x, y: p.y, rect: rects[state.selected] };
    canvas.setPointerCapture(ev.pointerId);
    syncZoom();
    redraw();
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    const p = canvasPoint(ev);
    const place = state.panels[state.selected];
    if (!place) return;
    const { w, h } = SIZES[state.size];
    place.dx = Math.min(1, Math.max(0, place.dx - (p.x - drag.x) / (drag.rect.w * w) * 0.55));
    place.dy = Math.min(1, Math.max(0, place.dy - (p.y - drag.y) / (drag.rect.h * h) * 0.55));
    drag.x = p.x;
    drag.y = p.y;
    redraw();
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  // ---- uploads --------------------------------------------------------------

  const fileInput = $('fileInput');
  $('uploadBtn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    [...fileInput.files].forEach((file) => {
      const img = new Image();
      img.onload = () => {
        const idx = addPhoto(img, file.name);
        state.activePhoto = idx;
        state.panels[state.selected].photo = idx;
        renderTray();
        redraw();
      };
      img.src = URL.createObjectURL(file);
    });
    fileInput.value = '';
  });

  // ---- actions ---------------------------------------------------------------

  $('fillAllBtn').addEventListener('click', () => {
    state.panels.forEach((p) => { p.photo = state.activePhoto; });
    redraw();
  });
  $('shuffleBtn').addEventListener('click', () => {
    state.panels.forEach((p, i) => { p.photo = (i + 1 + Math.floor(Math.random() * 3)) % Math.min(photos.length, 4); });
    redraw();
  });
  $('resetBtn').addEventListener('click', () => {
    state = freshState();
    $('titleInput').value = state.title;
    $('subInput').value = state.sub;
    $('cityInput').value = state.city;
    markLayout(state.layout);
    markGrade(state.grade);
    markSize(state.size);
    syncZoom();
    renderTray();
    redraw();
  });

  function exportPng() {
    const off = document.createElement('canvas');
    drawCover(off.getContext('2d'), state, images(), true);
    off.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-cover-${state.size}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/png');
  }
  $('exportBtn').addEventListener('click', exportPng);
  $('exportTop').addEventListener('click', exportPng);

  // ---- boot --------------------------------------------------------------------

  (async () => {
    const loaded = [];
    for (const s of SAMPLES) loaded.push(await loadSample(s));
    // Default cover: hero takes the first scene, the rest follow in order.
    state.panels = state.panels.map((_, i) => freshPlacement(Math.max(0, loaded[i % loaded.length])));
    if (preset.photo) {
      const idx = SAMPLES.findIndex((s) => s.id === preset.photo);
      if (idx >= 0 && loaded[idx] >= 0) {
        state.panels[0].photo = loaded[idx];
        state.activePhoto = loaded[idx];
      }
    }
    if (preset.title) { state.title = preset.title; $('titleInput').value = preset.title; }
    if (preset.sub) { state.sub = preset.sub; $('subInput').value = preset.sub; }
    if (preset.city) { state.city = preset.city; $('cityInput').value = preset.city; }
    if (preset.layout) { state.layout = preset.layout; markLayout(preset.layout); }
    if (preset.grade) { state.grade = preset.grade; markGrade(preset.grade); }
    if (preset.size) { state.size = preset.size; markSize(preset.size); }
    fitPanels(state, panelRects(state.layout, SIZES[state.size].w, SIZES[state.size].h).length);
    syncZoom();
    renderTray();
    redraw();
    document.body.classList.add('ready');
  })();
}
