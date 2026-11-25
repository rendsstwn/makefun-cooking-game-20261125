// Ladle & Ember — the hand-in program (Node 22, standard library only).
// It lays the entry out under the output folder the grader reads: the whole
// game/ tree, the screenshots/ the maker took, and the dossier.json the
// vendored make.fun library writes from them. Run it anywhere with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader MAKEFUN_OUTPUT_DIR is unset, so /output is used.

import * as nodeFs from 'node:fs';
import * as nodePath from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('./', import.meta.url));
const targetDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const gameSource = nodePath.join(repoRoot, 'game');
const shotsSource = nodePath.join(repoRoot, 'screenshots');

nodeFs.mkdirSync(targetDir, { recursive: true });
nodeFs.cpSync(gameSource, nodePath.join(targetDir, 'game'), { recursive: true });
if (!nodeFs.existsSync(nodePath.join(targetDir, 'game', 'index.html'))) {
  throw new Error('game/index.html is missing from the entry');
}
nodeFs.mkdirSync(nodePath.join(targetDir, 'screenshots'), { recursive: true });
if (nodeFs.existsSync(shotsSource)) {
  nodeFs.cpSync(shotsSource, nodePath.join(targetDir, 'screenshots'), { recursive: true });
}

// The caps mirror the scorer's own: at most 4 screenshots, each within
// 256 KiB; game/ within 993 files and 48 MiB, every path within 1000 bytes.
const dossierText = buildDossier(targetDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
nodeFs.writeFileSync(nodePath.join(targetDir, 'dossier.json'), dossierText);
