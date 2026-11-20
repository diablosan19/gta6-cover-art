// Vice Cover Studio — page bootstrap. Starts the editor, and reads the
// ?shot= setup the studio's screenshot runs use: ?shot=cover hides the
// chrome so only the finished cover is in frame, while photo, title, sub,
// city, layout, grade and size presets compose the scene in advance.

import { startStudio } from './editor.js';

const q = new URLSearchParams(location.search);
const preset = {};
for (const key of ['photo', 'title', 'sub', 'city', 'layout', 'grade', 'size']) {
  const v = q.get(key);
  if (v) preset[key] = v;
}

const shotCover = q.get('shot') === 'cover';
if (shotCover) document.body.classList.add('shot-cover');

startStudio({ preset, shotCover });
