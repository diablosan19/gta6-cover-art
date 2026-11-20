// Vice Cover Studio — screenshot runs.
//
// Serves app/ on a local port, opens it in headless Chromium with the
// presets from shots.json, and saves the four hand-in screenshots:
// cover shots frame only the canvas (the app's own drawing of the cover,
// scaled by the device pixel ratio so it fits the scorer's limits) and
// the editor shot shows the whole studio with a photo loaded.
//   node shoot.mjs

import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(join(process.env.HOME, 'workspace', 'makefun', 'x.js'));
const { chromium } = require('playwright-core');

const CHROME = join(
  process.env.HOME,
  '.cache', 'ms-playwright', 'chromium_headless_shell-1200',
  'chrome-headless-shell-linux64', 'chrome-headless-shell',
);
const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(join(here, 'app'));
const PORT = 8931;
const MAX_BYTES = 262144;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = resolve(join(appRoot, normalize(path)));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  try {
    const data = readFileSync(file);
    res.writeHead(200, {
      'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
      'content-length': data.length,
      'cache-control': 'no-store',
    });
    res.end(data);
  } catch {
    res.writeHead(404).end('not found');
  }
});

// Read a JPEG's pixel size from its start-of-frame marker.
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const marker = buf[i + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

const SHOTS = JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8'));

async function takeShot(browser, shot) {
  const isCover = shot.query.includes('shot=cover');
  // Scale the canvas so it lands on the manifest's frame: the app's native
  // cover widths are 1080 (square/portrait) and 1920 (wide).
  const nativeW = shot.query.includes('size=wide') ? 1920 : 1080;
  const dsf = isCover ? (shot.w - 2) / nativeW : 1;
  const context = await browser.newContext({
    viewport: isCover
      ? { width: shot.w + 40, height: shot.h + 40 }
      : { width: shot.w, height: shot.h },
    deviceScaleFactor: dsf,
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/${shot.query}`, { waitUntil: 'load' });
  await page.waitForSelector('body.ready', { timeout: 15000 });
  await page.waitForTimeout(450);
  let quality = 84;
  let buf;
  for (;;) {
    buf = isCover
      ? await page.locator('#cover').screenshot({ type: 'jpeg', quality })
      : await page.screenshot({ type: 'jpeg', quality });
    if (buf.length <= MAX_BYTES || quality <= 55) break;
    quality -= 12;
  }
  await context.close();
  const size = jpegSize(buf);
  writeFileSync(join(here, 'screenshots', shot.name), buf);
  console.log(shot.name, buf.length, 'bytes,', size ? `${size.w}x${size.h}` : 'size unknown', `(dsf ${dsf.toFixed(3)})`);
  if (buf.length > MAX_BYTES) throw new Error(`${shot.name} still over the 256 KiB cap`);
  if (size && (Math.max(size.w, size.h) > 1280 || Math.min(size.w, size.h) < 480)) {
    throw new Error(`${shot.name} breaks the screenshot dimension limits`);
  }
}

await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
try {
  for (const shot of SHOTS) await takeShot(browser, shot);
} finally {
  await browser.close();
  server.close();
}
console.log('screenshots done:', statSync(join(here, 'screenshots')).size >= 0 ? SHOTS.length : 0, 'files');
