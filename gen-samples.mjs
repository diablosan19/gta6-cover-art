// Vice Cover Studio — sample scene painter.
//
// The studio's sample tray holds four scenes that ship with the app. They
// are not photographs and not stock: each one is an SVG illustration
// written for this entry (below), and this script photographs them with
// a headless Chromium at 1080 x 810 to produce the JPEGs in app/samples/.
// Run it whenever the scenes change:  node gen-samples.mjs

import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(join(process.env.HOME, 'workspace', 'makefun', 'x.js'));
const { chromium } = require('playwright-core');

const CHROME = join(
  process.env.HOME,
  '.cache', 'ms-playwright', 'chromium_headless_shell-1200',
  'chrome-headless-shell-linux64', 'chrome-headless-shell',
);
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, 'app', 'samples');

// A palm tree, drawn once and reused at different scales and flips.
// Trunk base sits at (0,0); the crown is about 235 units up.
const PALM_DEF = `
<g id="palm">
  <path d="M0,0 C 5,-70 9,-130 16,-196" fill="none" stroke-width="11" stroke-linecap="round"/>
  <g fill="none" stroke-width="8" stroke-linecap="round">
    <path d="M16,-196 Q -42,-228 -104,-204"/>
    <path d="M16,-196 Q -28,-240 -82,-240"/>
    <path d="M16,-196 Q 22,-248 70,-246"/>
    <path d="M16,-196 Q 58,-236 118,-208"/>
    <path d="M16,-196 Q 2,-252 -18,-262"/>
    <path d="M16,-196 Q -58,-214 -108,-168"/>
    <path d="M16,-196 Q 66,-212 122,-172"/>
  </g>
  <circle cx="6" cy="-188" r="9" fill="inherit"/>
  <circle cx="26" cy="-184" r="7" fill="inherit"/>
</g>`;

const SCENES = {
  boulevard: `
  <svg viewBox="0 0 1080 810">
    <defs>
      <linearGradient id="bSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2a1a5e"/><stop offset="0.45" stop-color="#7b2d8b"/>
        <stop offset="0.72" stop-color="#e75480"/><stop offset="1" stop-color="#ffb347"/>
      </linearGradient>
      <radialGradient id="bSun"><stop offset="0" stop-color="#fff3b0"/><stop offset="1" stop-color="#ff9a3d"/></radialGradient>
    </defs>
    <rect width="1080" height="810" fill="url(#bSky)"/>
    <circle cx="540" cy="566" r="185" fill="#ff9a3d" opacity="0.30"/>
    <circle cx="540" cy="566" r="118" fill="url(#bSun)"/>
    <g fill="#3d1f5d" opacity="0.85">
      <rect x="0" y="430" width="90" height="150"/><rect x="120" y="470" width="70" height="110"/>
      <rect x="880" y="450" width="80" height="130"/><rect x="990" y="420" width="90" height="160"/>
    </g>
    <rect x="0" y="330" width="150" height="290" fill="#2a1445"/>
    <rect x="930" y="310" width="150" height="310" fill="#2a1445"/>
    <g>
      <rect x="34" y="356" width="118" height="60" rx="10" fill="none" stroke="#22d3ee" stroke-width="4"/>
      <text x="93" y="397" text-anchor="middle" font-family="Verdana, sans-serif" font-weight="bold" font-size="30" letter-spacing="3" fill="#aef4ff">PALMS</text>
      <rect x="946" y="346" width="118" height="60" rx="10" fill="none" stroke="#ff2e88" stroke-width="4"/>
      <text x="1005" y="387" text-anchor="middle" font-family="Verdana, sans-serif" font-weight="bold" font-size="28" letter-spacing="2" fill="#ffc2dd">MOTEL</text>
    </g>
    <polygon points="330,810 750,810 596,566 484,566" fill="#241631"/>
    <g stroke="#ffd76a" stroke-width="7" stroke-dasharray="34 30" opacity="0.9">
      <line x1="540" y1="590" x2="540" y2="810"/>
    </g>
    <polygon points="0,810 330,810 484,566 0,566" fill="#1d1030"/>
    <polygon points="1080,810 750,810 596,566 1080,566" fill="#1d1030"/>
    <g stroke="#170b28" fill="#170b28">
      <use href="#palm" transform="translate(120,690) scale(1.25)"/>
      <use href="#palm" transform="translate(972,672) scale(-1.15,1.15)"/>
      <use href="#palm" transform="translate(268,724) scale(0.8)"/>
      <use href="#palm" transform="translate(806,730) scale(-0.7,0.7)"/>
    </g>
    <g fill="none" stroke="#2a1445" stroke-width="4" stroke-linecap="round">
      <path d="M392,180 q10,-9 20,0 q10,-9 20,0"/>
      <path d="M660,140 q8,-7 16,0 q8,-7 16,0"/>
    </g>
  </svg>`,

  pier: `
  <svg viewBox="0 0 1080 810">
    <defs>
      <linearGradient id="pSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1f3a5f"/><stop offset="0.45" stop-color="#4a6fa5"/>
        <stop offset="0.78" stop-color="#e88ca0"/><stop offset="1" stop-color="#ffc98a"/>
      </linearGradient>
      <linearGradient id="pSea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2e5f7a"/><stop offset="1" stop-color="#122e40"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="480" fill="url(#pSky)"/>
    <circle cx="770" cy="468" r="72" fill="#ffe3ae"/>
    <rect y="470" width="1080" height="340" fill="url(#pSea)"/>
    <g fill="#ffd9a0">
      <rect x="716" y="492" width="108" height="6" rx="3" opacity="0.75"/>
      <rect x="700" y="522" width="140" height="6" rx="3" opacity="0.6"/>
      <rect x="724" y="556" width="92" height="6" rx="3" opacity="0.55"/>
      <rect x="690" y="596" width="160" height="7" rx="3" opacity="0.45"/>
      <rect x="716" y="644" width="108" height="7" rx="3" opacity="0.35"/>
      <rect x="700" y="700" width="140" height="8" rx="4" opacity="0.28"/>
    </g>
    <g stroke="#14263e" fill="none">
      <circle cx="212" cy="392" r="106" stroke-width="8"/>
      <g stroke-width="4">
        <line x1="212" y1="286" x2="212" y2="498"/><line x1="106" y1="392" x2="318" y2="392"/>
        <line x1="137" y1="317" x2="287" y2="467"/><line x1="287" y1="317" x2="137" y2="467"/>
      </g>
      <line x1="150" y1="480" x2="196" y2="392" stroke-width="7"/>
      <line x1="274" y1="480" x2="228" y2="392" stroke-width="7"/>
    </g>
    <g fill="#ffd76a" class="rim-lights"></g>
    <g fill="#12242f">
      <rect x="0" y="520" width="716" height="26"/>
      <rect x="30" y="546" width="13" height="130"/><rect x="150" y="546" width="13" height="130"/>
      <rect x="270" y="546" width="13" height="130"/><rect x="390" y="546" width="13" height="130"/>
      <rect x="510" y="546" width="13" height="130"/><rect x="630" y="546" width="13" height="130"/>
    </g>
    <g stroke="#12242f" stroke-width="7">
      <line x1="120" y1="520" x2="120" y2="436"/><line x1="330" y1="520" x2="330" y2="436"/><line x1="540" y1="520" x2="540" y2="436"/>
    </g>
    <g fill="#ffe9a8">
      <circle cx="120" cy="428" r="10"/><circle cx="330" cy="428" r="10"/><circle cx="540" cy="428" r="10"/>
    </g>
    <g fill="#ffe9a8" opacity="0.30">
      <circle cx="120" cy="428" r="24"/><circle cx="330" cy="428" r="24"/><circle cx="540" cy="428" r="24"/>
    </g>
    <path class="string-path" d="M120,436 Q 225,486 330,436 Q 435,486 540,436" fill="none" stroke="#0e1e2a" stroke-width="3"/>
    <g fill="#ffd76a" class="string-lights"></g>
    <rect y="742" width="1080" height="68" fill="#0b1a26"/>
    <g fill="#0b1a26">
      <rect x="40" y="700" width="10" height="46"/><rect x="140" y="700" width="10" height="46"/>
      <rect x="240" y="700" width="10" height="46"/><rect x="340" y="700" width="10" height="46"/>
      <rect x="440" y="700" width="10" height="46"/><rect x="540" y="700" width="10" height="46"/>
      <rect x="640" y="700" width="10" height="46"/><rect x="740" y="700" width="10" height="46"/>
      <rect x="840" y="700" width="10" height="46"/><rect x="940" y="700" width="10" height="46"/>
    </g>
    <rect y="694" width="1080" height="9" fill="#0b1a26"/>
  </svg>`,

  downtown: `
  <svg viewBox="0 0 1080 810">
    <defs>
      <linearGradient id="dSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#050914"/><stop offset="1" stop-color="#0d1b33"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="810" fill="url(#dSky)"/>
    <g class="stars" fill="#ffffff"></g>
    <circle cx="932" cy="108" r="37" fill="#f4f1de"/>
    <circle cx="918" cy="98" r="33" fill="#0a1424"/>
    <g fill="#0e1626">
      <rect x="0" y="300" width="130" height="410"/><rect x="150" y="240" width="110" height="470"/>
      <rect x="820" y="270" width="120" height="440"/><rect x="960" y="330" width="120" height="380"/>
    </g>
    <g class="buildings"></g>
    <g>
      <rect x="176" y="196" width="56" height="216" rx="8" fill="#12060f" stroke="#ff2e88" stroke-width="4"/>
      <text transform="translate(212,396) rotate(-90)" text-anchor="middle" font-family="Verdana, sans-serif" font-weight="bold" font-size="34" letter-spacing="8" fill="#ff9ecf">HOTEL</text>
      <rect x="596" y="300" width="150" height="52" rx="8" fill="#041014" stroke="#22d3ee" stroke-width="4"/>
      <text x="671" y="336" text-anchor="middle" font-family="Verdana, sans-serif" font-weight="bold" font-size="27" letter-spacing="3" fill="#a5f3ff">BAR · 24H</text>
    </g>
    <rect y="706" width="1080" height="104" fill="#070b14"/>
    <g opacity="0.5">
      <rect x="182" y="712" width="44" height="88" fill="#ff2e88" opacity="0.28"/>
      <rect x="610" y="712" width="120" height="60" fill="#22d3ee" opacity="0.20"/>
      <rect x="330" y="712" width="300" height="40" fill="#ffd76a" opacity="0.10"/>
    </g>
    <g>
      <path d="M742,724 L756,694 Q760,686 776,684 L838,682 Q862,682 876,694 L906,700 Q920,703 920,718 L920,730 Q920,736 912,736 L884,736 A20,20 0 0,0 844,736 L792,736 A20,20 0 0,0 752,736 L750,736 Q742,736 742,724 Z" fill="#05070c"/>
      <ellipse cx="742" cy="712" rx="30" ry="7" fill="#ffd76a" opacity="0.5"/>
      <circle cx="772" cy="736" r="15" fill="#05070c" stroke="#2b3a52" stroke-width="4"/>
      <circle cx="864" cy="736" r="15" fill="#05070c" stroke="#2b3a52" stroke-width="4"/>
    </g>
  </svg>`,

  cruiser: `
  <svg viewBox="0 0 1080 810">
    <defs>
      <linearGradient id="cSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#40205c"/><stop offset="0.55" stop-color="#c94f7c"/><stop offset="1" stop-color="#ff9e64"/>
      </linearGradient>
      <linearGradient id="cSea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7a3b69"/><stop offset="1" stop-color="#3c2a5e"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="810" fill="url(#cSky)"/>
    <circle cx="308" cy="436" r="86" fill="#ffcf8f"/>
    <rect y="428" width="1080" height="96" fill="url(#cSea)"/>
    <g fill="#ffe3ae">
      <rect x="252" y="446" width="112" height="5" rx="2" opacity="0.7"/>
      <rect x="232" y="472" width="152" height="5" rx="2" opacity="0.5"/>
      <rect x="262" y="498" width="92" height="5" rx="2" opacity="0.4"/>
    </g>
    <rect y="524" width="1080" height="286" fill="#2e1a33"/>
    <path d="M0,810 L1080,560 L1080,810 Z" fill="#38203f"/>
    <g stroke="#170b28" fill="#170b28">
      <use href="#palm" transform="translate(128,600) rotate(-11) scale(1.35)"/>
      <use href="#palm" transform="translate(1010,586) scale(-0.95,0.95)"/>
    </g>
    <g transform="translate(352,548)">
      <path d="M18,118 L34,74 Q40,60 66,56 L138,48 Q176,14 246,10 L352,10 Q414,12 442,50 L498,60 Q522,64 524,88 L524,112 Q524,124 510,124 L462,124 A46,46 0 0,0 370,124 L148,124 A46,46 0 0,0 56,124 L30,124 Q16,124 18,118 Z" fill="#1a0f2a"/>
      <path d="M66,56 L138,48 Q176,14 246,10 L352,10 Q414,12 442,50" fill="none" stroke="#ff9e64" stroke-width="4" opacity="0.85"/>
      <path d="M158,46 Q190,20 244,18 L268,18 L268,46 Z" fill="#ffd9a0" opacity="0.9"/>
      <path d="M282,18 L340,18 Q386,20 410,46 L282,46 Z" fill="#ffd9a0" opacity="0.75"/>
      <rect x="30" y="88" width="486" height="6" fill="#ffd9a0" opacity="0.35"/>
      <circle cx="102" cy="124" r="37" fill="#0d0716"/>
      <circle cx="102" cy="124" r="19" fill="#e8e2d2"/>
      <circle cx="102" cy="124" r="8" fill="#0d0716"/>
      <circle cx="416" cy="124" r="37" fill="#0d0716"/>
      <circle cx="416" cy="124" r="19" fill="#e8e2d2"/>
      <circle cx="416" cy="124" r="8" fill="#0d0716"/>
      <rect x="492" y="76" width="20" height="10" rx="4" fill="#ffe9a8"/>
    </g>
    <g stroke="#24102e" fill="none" stroke-width="6">
      <line x1="884" y1="668" x2="884" y2="576"/>
    </g>
    <path d="M796,576 L972,576 L884,532 Z" fill="#24102e"/>
    <g fill="none" stroke="#2a1445" stroke-width="4" stroke-linecap="round">
      <path d="M560,150 q10,-9 20,0 q10,-9 20,0"/>
      <path d="M640,196 q8,-7 16,0 q8,-7 16,0"/>
    </g>
  </svg>`,
};

// Small living details the markup cannot say once: stars, lit windows,
// the ferris wheel's rim bulbs and the pier's string lights.
const PAINT_DETAILS = `
  var NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    parent.appendChild(n);
    return n;
  }
  var stars = document.querySelector('.stars');
  for (var i = 0; i < 110; i++) {
    el('circle', { cx: Math.random() * 1080, cy: Math.random() * 380, r: Math.random() * 1.7 + 0.4, opacity: (Math.random() * 0.7 + 0.25).toFixed(2) }, stars);
  }
  var fronts = [
    { x: 300, y: 330, w: 120, h: 380 }, { x: 440, y: 280, w: 100, h: 430 },
    { x: 560, y: 360, w: 130, h: 350 }, { x: 716, y: 310, w: 96, h: 400 },
  ];
  var wrap = document.querySelector('.buildings');
  var palette = ['#ffd76a', '#9be8ff', '#ff9ecf', '#fff3d6'];
  fronts.forEach(function (b) {
    el('rect', { x: b.x, y: b.y, width: b.w, height: b.h, fill: '#131f36' }, wrap);
    for (var cx = b.x + 12; cx < b.x + b.w - 10; cx += 22) {
      for (var cy = b.y + 14; cy < b.y + b.h - 12; cy += 26) {
        if (Math.random() < 0.46) {
          el('rect', { x: cx, y: cy, width: 11, height: 14, fill: palette[Math.floor(Math.random() * palette.length)], opacity: 0.92 }, wrap);
        }
      }
    }
  });
  var rim = document.querySelector('.rim-lights');
  for (var a = 0; a < 16; a++) {
    var t = (a / 16) * Math.PI * 2;
    el('circle', { cx: 212 + Math.cos(t) * 106, cy: 392 + Math.sin(t) * 106, r: 5.5 }, rim);
  }
  var path = document.querySelector('.string-path');
  var lights = document.querySelector('.string-lights');
  var len = path.getTotalLength();
  for (var s = 8; s < len; s += 26) {
    var p = path.getPointAtLength(s);
    el('circle', { cx: p.x, cy: p.y + 5, r: 4.2 }, lights);
  }
`;

const page = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { margin: 0; background: #111; }
  section { width: 1080px; height: 810px; }
  svg { display: block; width: 1080px; height: 810px; }
</style></head><body>
<svg width="0" height="0" style="position:absolute"><defs>${PALM_DEF}</defs></svg>
${Object.entries(SCENES).map(([id, svg]) => `<section id="scene-${id}">${svg}</section>`).join('\n')}
<script>${PAINT_DETAILS}<\/script>
</body></html>`;

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
try {
  const tab = await browser.newPage({ viewport: { width: 1120, height: 880 } });
  await tab.setContent(page, { waitUntil: 'load' });
  await tab.waitForTimeout(350);
  mkdirSync(outDir, { recursive: true });
  for (const id of Object.keys(SCENES)) {
    const shot = await tab.locator(`#scene-${id}`).screenshot({ type: 'jpeg', quality: 88 });
    writeFileSync(join(outDir, `${id}.jpg`), shot);
    console.log(`samples/${id}.jpg`, shot.length, 'bytes');
  }
} finally {
  await browser.close();
}
