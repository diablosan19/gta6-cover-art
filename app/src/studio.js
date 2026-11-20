// Vice Cover Studio — shared state: export sizes, panel layouts, colour
// grades and the studio's own sample scenes. Pure data and small helpers;
// the drawing lives in render.js and the wiring in editor.js.

export const SIZES = {
  square: { w: 1080, h: 1080, label: '1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 × 1350' },
  wide: { w: 1920, h: 1080, label: '1920 × 1080' },
};

// The four scenes hanging in the studio's sample tray. They were drawn by
// the studio's generator (gen-samples.mjs at the repo root), so they are
// free for anyone to put on a cover.
export const SAMPLES = [
  { id: 'boulevard', name: 'Boulevard', src: 'samples/boulevard.jpg' },
  { id: 'pier', name: 'Pier at dusk', src: 'samples/pier.jpg' },
  { id: 'downtown', name: 'Downtown neon', src: 'samples/downtown.jpg' },
  { id: 'cruiser', name: 'Beach cruiser', src: 'samples/cruiser.jpg' },
];

// Colour grades: a canvas filter applied to each photo as it is drawn,
// plus a wash laid over the finished panels (see render.js).
export const GRADES = {
  sunset: { filter: 'saturate(1.35) contrast(1.07) sepia(0.28) hue-rotate(-10deg)', wash: 'sunset' },
  neon: { filter: 'saturate(1.65) contrast(1.16) hue-rotate(10deg)', wash: 'neon' },
  noir: { filter: 'grayscale(1) contrast(1.28) brightness(1.03)', wash: 'noir' },
  clean: { filter: 'saturate(1.08) contrast(1.02)', wash: 'none' },
};

// Panel rectangles as fractions of the cover, per layout and shape.
// 'poster' is one full-bleed photograph; 'collage' leads with a hero panel;
// 'strips' splits the cover into three vertical slices.
export function panelRects(layout, w, h) {
  const wide = w > h;
  if (layout === 'poster') {
    return [{ x: 0, y: 0, w: 1, h: 1 }];
  }
  if (layout === 'strips') {
    const third = 1 / 3;
    return [
      { x: 0, y: 0, w: third, h: 1 },
      { x: third, y: 0, w: third, h: 1 },
      { x: 2 * third, y: 0, w: third, h: 1 },
    ];
  }
  // collage
  if (wide) {
    return [
      { x: 0, y: 0, w: 0.62, h: 1 },
      { x: 0.62, y: 0, w: 0.38, h: 0.52 },
      { x: 0.62, y: 0.52, w: 0.38, h: 0.48 },
    ];
  }
  const heroH = h === w ? 0.56 : 0.52;
  const midH = 0.78 - heroH;
  return [
    { x: 0, y: 0, w: 1, h: heroH },
    { x: 0, y: heroH, w: 0.5, h: midH },
    { x: 0.5, y: heroH, w: 0.5, h: midH },
    { x: 0, y: 0.78, w: 1, h: 0.22 },
  ];
}

// One placement per panel: which photo, how far zoomed, and how far the
// photo is dragged inside its panel (fractions of the overflow).
export function freshPlacement(photoIndex) {
  return { photo: photoIndex, zoom: 1, dx: 0.5, dy: 0.5 };
}

export function freshState() {
  return {
    size: 'portrait',
    layout: 'collage',
    grade: 'sunset',
    title: 'VICE HEAT',
    sub: 'One city. One score. No brakes.',
    city: 'SANDBOX CITY',
    selected: 0,
    activePhoto: 0,
    panels: [freshPlacement(0), freshPlacement(1), freshPlacement(2), freshPlacement(3)],
  };
}

// Keep the placements array as long as the current layout needs, reusing
// the panels that already exist so switching layouts loses no work.
export function fitPanels(state, count) {
  while (state.panels.length < count) {
    state.panels.push(freshPlacement(state.panels.length % SAMPLES.length));
  }
  if (state.selected >= count) state.selected = count - 1;
}
