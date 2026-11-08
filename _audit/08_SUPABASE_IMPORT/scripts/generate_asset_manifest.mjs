import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function walk(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '_audit', '.git', '.aistudio'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, list);
    else list.push(full);
  }
  return list;
}

function getImageDimensions(filePath, buf) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === '.png' && buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47) {
      return `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
    }
    if ((ext === '.jpg' || ext === '.jpeg') && buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      let offset = 2;
      while (offset < buf.length - 8) {
        if (buf[offset] !== 0xff) { offset++; continue; }
        const marker = buf[offset + 1];
        if (marker === 0xff) { offset++; continue; }
        if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
          offset += 2;
          continue;
        }
        const len = buf.readUInt16BE(offset + 2);
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          const h = buf.readUInt16BE(offset + 5);
          const w = buf.readUInt16BE(offset + 7);
          return `${w}x${h}`;
        }
        offset += 2 + len;
      }
    }
    if (ext === '.svg') {
      const txt = buf.toString('utf8');
      const vb = txt.match(/viewBox=["']([^"']+)["']/i);
      const w = txt.match(/\bwidth=["']([^"']+)["']/i);
      const h = txt.match(/\bheight=["']([^"']+)["']/i);
      if (vb) return `viewBox:${vb[1]}`;
      if (w && h) return `${w[1]}x${h[1]}`;
    }
  } catch {}
  return null;
}

const allFiles = walk('.');
const codeFiles = allFiles.filter(f =>
  /\.(ts|tsx|js|jsx|html|css|json|md)$/.test(f) &&
  f !== 'bun.lock' &&
  !f.endsWith('vocabDatabase.json') &&
  !f.endsWith('existingVocab.json')
);

const codeLinesMap = new Map();
for (const cf of codeFiles) {
  const txt = fs.readFileSync(cf, 'utf8');
  codeLinesMap.set(cf, txt.split('\n'));
}

const engravingPathToKeys = new Map();
if (fs.existsSync('src/constants/engravings.tsx')) {
  const engTxt = fs.readFileSync('src/constants/engravings.tsx', 'utf8');
  for (const m of engTxt.matchAll(/(\w+)\s*:\s*['"]([^'"]+)['"]/g)) {
    const key = m[1];
    const p = m[2];
    if (!engravingPathToKeys.has(p)) engravingPathToKeys.set(p, []);
    engravingPathToKeys.get(p).push(key);
  }
}

const assetFiles = allFiles.filter(f =>
  f.startsWith('public/') ||
  f.startsWith('src/assets/') ||
  f === 'src/data/rubyTypingAudioB64.ts'
);

const rawAssetItems = [];
for (const af of assetFiles) {
  const buf = fs.readFileSync(af);
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
  const ext = path.extname(af).toLowerCase().replace('.', '') || 'unknown';
  const dims = getImageDimensions(af, buf);
  const webPath = af.startsWith('public/') ? '/' + af.slice('public/'.length) : af;
  const engKeys = engravingPathToKeys.get(webPath) || [];

  const usedIn = [];
  for (const [cf, lines] of codeLinesMap.entries()) {
    if (cf === af) continue;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (webPath.length > 3 && line.includes(webPath)) {
        usedIn.push(`${cf}:${i + 1}`);
      } else if (af === 'src/data/rubyTypingAudioB64.ts' && line.includes('rubyTypingAudioB64')) {
        usedIn.push(`${cf}:${i + 1}`);
      } else if (engKeys.length > 0 && cf !== 'src/constants/engravings.tsx') {
        for (const k of engKeys) {
          if (line.includes(`.${k}`)) {
            usedIn.push(`${cf}:${i + 1} (via ENGRAVING_ASSETS.${k})`);
          }
        }
      }
    }
  }

  rawAssetItems.push({
    path: af,
    web_path: af.startsWith('public/') ? webPath : null,
    type: ext,
    dimensions: dims,
    size_bytes: buf.length,
    sha256,
    used_in: usedIn
  });
}

const hashToCanonical = new Map();
const sortedForCanonical = [...rawAssetItems].sort((a, b) => {
  const aTemp = a.path.includes('Paste_November_05') ? 1 : 0;
  const bTemp = b.path.includes('Paste_November_05') ? 1 : 0;
  if (aTemp !== bTemp) return aTemp - bTemp;
  if ((b.used_in.length > 0 ? 1 : 0) !== (a.used_in.length > 0 ? 1 : 0)) {
    return (b.used_in.length > 0 ? 1 : 0) - (a.used_in.length > 0 ? 1 : 0);
  }
  return a.path.localeCompare(b.path);
});

for (const item of sortedForCanonical) {
  if (!hashToCanonical.has(item.sha256)) {
    hashToCanonical.set(item.sha256, item.path);
  }
}

const assets = rawAssetItems.map(item => {
  const canonical = hashToCanonical.get(item.sha256);
  const isTemp = item.path.includes('Paste_November_05');
  let status = 'active';
  let notes = '';

  if (isTemp) {
    status = 'temporary';
    notes = 'AI Studio uploaded prompt attachment (preserved for session reference)';
  } else if (item.used_in.length > 0) {
    status = 'active';
    if (canonical && canonical !== item.path) {
      notes = `Active, shares identical SHA-256 hash with ${canonical}`;
    }
  } else if (canonical && canonical !== item.path) {
    status = `duplicate_of:${canonical}`;
    notes = `Unreferenced exact SHA-256 duplicate of ${canonical}`;
  } else {
    status = 'unused';
    notes = 'No reference found in codebase (unique SHA-256 — preserved per Section 9 for user decision)';
  }

  if (item.size_bytes > 500 * 1024 && ['jpg', 'jpeg', 'png'].includes(item.type)) {
    notes = (notes ? notes + '; ' : '') + `Large image (${(item.size_bytes / 1024).toFixed(1)} KB) — candidate for WebP/AVIF compression`;
  }

  return {
    ...item,
    status,
    notes: notes || null
  };
});

let cleanedDuplicates = [];
if (fs.existsSync('_audit/backup_2_pre_cleanup/DUPLICATE_ASSETS_REMOVED.json')) {
  cleanedDuplicates = JSON.parse(
    fs.readFileSync('_audit/backup_2_pre_cleanup/DUPLICATE_ASSETS_REMOVED.json', 'utf8')
  );
}

const brokenRefs = [];
for (const [cf, lines] of codeLinesMap.entries()) {
  if (!cf.startsWith('src/') && cf !== 'index.html') continue;
  for (let i = 0; i < lines.length; i++) {
    for (const m of lines[i].matchAll(/['"`](\/assets\/[^'"`\s]+)['"`]/g)) {
      const refPath = m[1];
      const diskPath = path.join('public', refPath.slice(1));
      if (!fs.existsSync(diskPath)) {
        brokenRefs.push({
          path: refPath,
          expected_disk_path: diskPath,
          used_in: [`${cf}:${i + 1}`],
          status: 'broken_ref',
          notes: 'Referenced path does not exist in public/assets/'
        });
      }
    }
  }
}

const externalAssets = [];
for (const [cf, lines] of codeLinesMap.entries()) {
  if (!cf.startsWith('src/') && cf !== 'index.html' && cf !== 'server.ts') continue;
  for (let i = 0; i < lines.length; i++) {
    for (const m of lines[i].matchAll(/https?:\/\/[^\s'"`<>)]+/g)) {
      const url = m[0];
      if (url.includes('w3.org/2000/svg')) continue;
      externalAssets.push({ url, loc: `${cf}:${i + 1}` });
    }
  }
}

const summary = {
  generated_at: new Date().toISOString(),
  pre_cleanup_public_files: assets.filter(a => a.path.startsWith('public/')).length + cleanedDuplicates.length,
  post_cleanup_public_files: assets.filter(a => a.path.startsWith('public/')).length,
  total_scanned_files: assets.length,
  active_count: assets.filter(a => a.status === 'active').length,
  unused_unique_count: assets.filter(a => a.status === 'unused').length,
  remaining_duplicate_count: assets.filter(a => a.status.startsWith('duplicate_of:')).length,
  cleaned_duplicate_count: cleanedDuplicates.length,
  cleaned_duplicate_bytes: cleanedDuplicates.reduce((s, a) => s + a.size_bytes, 0),
  temporary_count: assets.filter(a => a.status === 'temporary').length,
  broken_reference_count: brokenRefs.length,
  total_size_bytes: assets.reduce((s, a) => s + a.size_bytes, 0),
  public_dir_size_bytes: assets.filter(a => a.path.startsWith('public/')).reduce((s, a) => s + a.size_bytes, 0)
};

fs.writeFileSync('_audit/03_ASSET_MANIFEST.json', JSON.stringify({
  summary,
  broken_references: brokenRefs,
  external_urls: externalAssets,
  assets,
  cleaned_duplicates: cleanedDuplicates
}, null, 2));

console.log('SUMMARY:', JSON.stringify(summary, null, 2));
