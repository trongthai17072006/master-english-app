import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read existing vocabularyData.ts to preserve existing 104 words
const vocabDataRaw = fs.readFileSync(path.resolve(__dirname, '../src/data/vocabularyData.ts'), 'utf-8');

// Simple regex parser to extract existing items from VOCAB_DATABASE
const existingItems = [];
const itemRegex = /{\s*id:\s*['"]([^'"]+)['"],\s*word:\s*['"]([^'"]+)['"],[\s\S]*?tags:\s*\[([\s\S]*?)\]\s*}/g;

// Let's use tsx or dynamic import to read the exact VOCAB_DATABASE
async function run() {
  const { VOCAB_DATABASE } = await import('../src/data/vocabularyData.ts');
  console.log('Found existing words:', VOCAB_DATABASE.length);

  const seenWords = new Map();
  let duplicateCount = 0;

  // Add existing words first
  for (const item of VOCAB_DATABASE) {
    const key = item.word.toLowerCase().trim();
    if (!seenWords.has(key)) {
      seenWords.set(key, { ...item });
    } else {
      duplicateCount++;
    }
  }

  console.log('Unique existing words preserved:', seenWords.size);
  return { seenWords, duplicateCount };
}

run();
