import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const { VOCAB_DATABASE } = await import('../src/data/vocabularyData.ts');

  // Map keyed by normalized lowercase trimmed word
  const vocabMap = new Map();
  let duplicateCount = 0;

  // 1. Add existing words
  for (const item of VOCAB_DATABASE) {
    const key = item.word.toLowerCase().trim();
    if (!vocabMap.has(key)) {
      vocabMap.set(key, { ...item });
    } else {
      duplicateCount++;
    }
  }

  console.log(`Initial words from VOCAB_DATABASE: ${vocabMap.size}`);

  // Load or generate comprehensive curated IELTS vocabulary sets
  const { VOCAB_EXPANSION_CHUNKS } = await import('./vocabChunks.js');

  for (const chunk of VOCAB_EXPANSION_CHUNKS) {
    for (const w of chunk) {
      const key = w.word.toLowerCase().trim();
      if (!vocabMap.has(key)) {
        vocabMap.set(key, {
          id: `lex_${vocabMap.size + 1}_${key.replace(/[^a-z0-9]/g, '_')}`,
          word: w.word.trim(),
          ipa: w.ipa || '',
          pos: w.pos || 'noun',
          level: w.level || 'B2',
          meaning: w.meaning || '',
          detailedNote: w.detailedNote || `Từ vựng hữu ích cho IELTS ${w.tags ? w.tags.join(', ') : 'Academic'}.`,
          collocations: w.collocations || [],
          exampleEn: w.exampleEn || '',
          exampleVi: w.exampleVi || '',
          synonyms: w.synonyms || [],
          antonyms: w.antonyms || [],
          tags: w.tags || ['general']
        });
      } else {
        duplicateCount++;
      }
    }
  }

  const finalVocabList = Array.from(vocabMap.values());
  console.log(`Total unique independent words: ${finalVocabList.length}`);
  console.log(`Duplicates avoided/filtered: ${duplicateCount}`);

  // Write out to src/data/vocabDatabase.json
  const outputPath = path.resolve(__dirname, '../src/data/vocabDatabase.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalVocabList, null, 2), 'utf-8');
  console.log(`Successfully written ${finalVocabList.length} items to ${outputPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
