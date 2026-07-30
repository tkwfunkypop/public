// storyboard.json + generated.json から src/cuts.json を再生成する。
// 絵コンテ側を更新したら `npm run data` で追従させる。
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const base = join(here, '..', '..');

const storyboard = JSON.parse(readFileSync(join(base, 'storyboard', 'storyboard.json'), 'utf8'));
const generated = JSON.parse(readFileSync(join(base, 'generated.json'), 'utf8'));

const urlByPanel = Object.fromEntries(
  generated.items
    .filter((i) => i.kind === 'storyboard_panel')
    .map((i) => [i.id, i.url])
);

const cuts = [];
for (const seq of storyboard.sequences) {
  for (const cut of seq.cuts) {
    const url = urlByPanel[cut.panel];
    if (!url) throw new Error(`panel not found in generated.json: ${cut.panel}`);
    cuts.push({
      no: cut.no,
      sec: cut.sec,
      seq: seq.seq,
      seqTitle: seq.title,
      size: cut.size,
      action: cut.action,
      dialogue: cut.dialogue,
      note: cut.note,
      panel: cut.panel,
      url,
    });
  }
}

const out = {
  title: storyboard.title,
  subtitle: storyboard.subtitle ?? '',
  fps: 30,
  totalSec: cuts.reduce((a, c) => a + c.sec, 0),
  cuts,
};

writeFileSync(join(here, '..', 'src', 'cuts.json'), JSON.stringify(out, null, 1), 'utf8');
console.log(`cuts.json: ${cuts.length} cuts / ${out.totalSec}s`);
