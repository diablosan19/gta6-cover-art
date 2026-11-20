// Vice Cover Studio — the hand-in program for gta6-cover-art-01.
//
// The app itself is the static site under app/ (open app/index.html in a
// browser, no build step, no network). This program's whole job is to
// deliver it: copy app/ and screenshots/ into the output directory and
// write dossier.json there with the kit's vendored library, so the
// scorer reads exactly the bytes buildDossier produces from those files.
//
// In the grader the output directory is /output; anywhere else,
// MAKEFUN_OUTPUT_DIR names it instead:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The grader mounts the output directory as a volume, so the directory
// itself must never be deleted: removing a mount point fails with EBUSY
// and the hand-in would die before copying a single file. Create the
// directory if it is missing, then clear what is inside it entry by
// entry, so a stale file from an earlier run can never leak through.
mkdirSync(out, { recursive: true });
for (const name of readdirSync(out)) {
  rmSync(join(out, name), { recursive: true, force: true });
}

cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps mirror the scorer's own limits: at most 4 screenshots of
// 256 KiB each, at most 993 app files and 48 MiB of app in total, no app
// path over 1000 bytes, and the dossier's source text capped at 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

// A one-line receipt, so a hand-in never fails silently: walk what
// actually landed in the output directory and say how much of it there
// is. If a copy ever comes up short, the numbers here show it at once.
function receipt(dir) {
  let files = 0;
  let bytes = 0;
  const shots = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else {
        files += 1;
        bytes += statSync(p).size;
        if (relative(dir, p).startsWith('screenshots')) shots.push(name);
      }
    }
  };
  walk(dir);
  return { files, bytes, shots: shots.sort() };
}

const done = receipt(out);
console.log(
  `Vice Cover Studio handed in: ${done.files} files, ${done.bytes} bytes; ` +
  `screenshots: ${done.shots.join(', ') || 'none'}; dossier.json written.`,
);
