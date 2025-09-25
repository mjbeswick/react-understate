// Sync code examples from src/code-examples to public/code-examples
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src', 'code-examples');
const destDir = path.join(__dirname, '..', 'public', 'code-examples');
const extSrcDir = path.join(__dirname, '..', '..', 'devtools', 'dist');
const extDestDir = path.join(__dirname, '..', 'public', 'devtools');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

copyDir(srcDir, destDir);
globalThis.console.log('Synced code examples:', srcDir, '->', destDir);

// Also copy devtools extension to docs public folder for easy unpacked loading
copyDir(extSrcDir, extDestDir);
globalThis.console.log('Synced devtools extension:', extSrcDir, '->', extDestDir);
