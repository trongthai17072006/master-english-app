import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import {
  VOCAB_DATABASE,
  COLLOCATION_QUESTIONS,
  CONTEXT_QUESTIONS,
  GRAMMAR_TIPS,
  TRICKY_DISTINCTIONS
} from '../../../src/data/vocabularyData.ts';
import rawVocabJson from '../../../src/data/vocabDatabase.json';
import existingVocabJson from '../../../src/data/existingVocab.json';
import { EXPANDED_PDF_KNOWLEDGE_LIBRARY } from '../../../src/data/expandedPdfLibraryData.ts';
import {
  VSTEP_PDF_AS_KNOWLEDGE_RECORDS,
  VSTEP_PDF_STRUCTURE_BANK,
  VSTEP_PDF_GRAMMAR_BANK,
  VSTEP_PDF_VOCAB_BANK,
  VSTEP_PDF_WRITING_BANK,
  VSTEP_PDF_SPEAKING_PART1_BANK,
  VSTEP_PDF_SPEAKING_PART2_BANK,
  VSTEP_PDF_SPEAKING_PART3_BANK,
  VSTEP_PDF_LISTENING_BANK,
  VSTEP_PDF_STUDY_NOTES
} from '../../../src/data/vstepPdfKnowledgeBankData.ts';
import { CHALLENGE_60_DAYS } from '../../../src/data/challenge60Data.ts';
import { ALL_VSTEP_28_SEEDS } from '../../../src/data/curriculum/vstep28SpeakingBank.ts';

const OUT_DIR = path.resolve('_audit/08_SUPABASE_IMPORT');
const NEEDS_REVIEW_DIR = path.join(OUT_DIR, 'needs_review');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(NEEDS_REVIEW_DIR, { recursive: true });

// Fixed RFC 4122 DNS Namespace UUID for deterministic UUID v5 generation
const NAMESPACE_HEX = '6ba7b8109dad11d180b400c04fd430c8';
const FIXED_TIMESTAMP = '2026-11-05T00:00:00.000Z';

function uuidV5(name) {
  const nsBytes = Buffer.from(NAMESPACE_HEX, 'hex');
  const nameBytes = Buffer.from(String(name).normalize('NFC'), 'utf8');
  const hash = crypto.createHash('sha1').update(Buffer.concat([nsBytes, nameBytes])).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50; // version 5
  hash[8] = (hash[8] & 0x3f) | 0x80; // variant RFC 4122
  const hex = hash.subarray(0, 16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function sha256Json(obj) {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex');
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function cleanSingleLine(str) {
  if (str === null || str === undefined) return '';
  return String(str).normalize('NFC').replace(/\s+/g, ' ').trim();
}

function cleanMultiLine(str) {
  if (str === null || str === undefined) return '';
  return String(str).normalize('NFC').replace(/\r\n/g, '\n').trim();
}

function normalizePos(rawPos) {
  const p = cleanSingleLine(rawPos).toLowerCase().replace(/\.$/, '');
  if (['n', 'noun'].includes(p)) return 'noun';
  if (['v', 'verb'].includes(p)) return 'verb';
  if (['adj', 'adjective'].includes(p)) return 'adj';
  if (['adv', 'adverb'].includes(p)) return 'adv';
  if (['phr', 'phrase', 'collocation'].includes(p)) return 'phrase';
  if (['idiom'].includes(p)) return 'idiom';
  if (['grammar'].includes(p)) return 'grammar';
  return 'noun';
}

function normalizeCefr(rawLevel) {
  const l = cleanSingleLine(rawLevel).toUpperCase();
  if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(l)) return l;
  if (l.includes('C2') || l.includes('8.5') || l.includes('8.0')) return 'C2';
  if (l.includes('C1') || l.includes('7.5') || l.includes('7.0')) return 'C1';
  if (l.includes('B2') || l.includes('6.5') || l.includes('6.0')) return 'B2';
  if (l.includes('B1')) return 'B1';
  return 'B2';
}

function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function writeCsvAndJson(baseName, columns, rows) {
  const csvPath = path.join(OUT_DIR, `${baseName}.csv`);
  const jsonPath = path.join(OUT_DIR, `${baseName}.json`);
  const lines = [columns.join(',')];
  for (const row of rows) {
    lines.push(columns.map(c => csvEscape(row[c])).join(','));
  }
  fs.writeFileSync(csvPath, '\uFEFF' + lines.join('\n') + '\n', 'utf8');
  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2) + '\n', 'utf8');
  return { csvPath, jsonPath, count: rows.length };
}

function writeCsvOnly(targetPath, columns, rows) {
  const lines = [columns.join(',')];
  for (const row of rows) {
    lines.push(columns.map(c => csvEscape(row[c])).join(','));
  }
  fs.writeFileSync(targetPath, '\uFEFF' + lines.join('\n') + '\n', 'utf8');
}

// 1. IMPORT BATCHES (`01_import_batches`)
const BATCH_ID = uuidV5('import_batch:leximaster_baseline_v1_2026_11_05');
const importBatches = [
  {
    id: BATCH_ID,
    batch_code: 'LEXIMASTER_BASELINE_2026_11_05',
    description: 'Initial deterministic export of LexiMaster IELTS static learning banks (Vocab, Grammar, 60-Day Curriculum, Speaking 28 Seeds, Quizzes, PDF Knowledge Bank)',
    source_version: '1.0.0',
    total_tables: 9,
    imported_at: FIXED_TIMESTAMP,
    created_at: FIXED_TIMESTAMP
  }
];

// 2. VOCABULARY CATEGORIES (`02_vocabulary_categories`)
const rawBaseVocabSet = new Set(rawVocabJson.map(v => v.id));
const categorySlugSet = new Map();
for (const v of VOCAB_DATABASE) {
  const tags = Array.isArray(v.tags) && v.tags.length > 0 ? v.tags : ['general-academic'];
  const primarySlug = cleanSingleLine(tags[0]).toLowerCase().replace(/[^a-z0-9-]+/g, '-') || 'general-academic';
  if (!categorySlugSet.has(primarySlug)) {
    categorySlugSet.set(primarySlug, {
      slug: primarySlug,
      name: primarySlug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      item_count: 0
    });
  }
  categorySlugSet.get(primarySlug).item_count++;
}

const vocabularyCategories = Array.from(categorySlugSet.values())
  .sort((a, b) => a.slug.localeCompare(b.slug))
  .map((c, idx) => ({
    id: uuidV5(`vocabulary_category:${c.slug}`),
    legacy_id: `cat_${c.slug}`,
    slug: c.slug,
    name: c.name,
    display_order: idx + 1,
    vocab_count: c.item_count,
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP,
    updated_at: FIXED_TIMESTAMP
  }));

const categorySlugToUuid = new Map(vocabularyCategories.map(c => [c.slug, c.id]));

// 3. VOCABULARY (`03_vocabulary`) + ID MAP + NEEDS REVIEW
const vocabularyRows = [];
const vocabIdMap = [];
const vocabNeedsReview = [];
const wordLowerToUuid = new Map();

// Audit the 4 overlapping VSTEP words that vocabularyData.ts deduplicates at runtime
const rawWordsLower = new Map(rawVocabJson.map(v => [cleanSingleLine(v.word).toLowerCase(), v.id]));
for (const pv of VSTEP_PDF_VOCAB_BANK) {
  const lower = cleanSingleLine(pv.word).toLowerCase();
  if (rawWordsLower.has(lower)) {
    vocabNeedsReview.push({
      legacy_id: pv.id,
      word: cleanSingleLine(pv.word),
      ipa: cleanSingleLine(pv.ipa),
      pos: normalizePos(pv.pos),
      meaning_vi: cleanSingleLine(pv.meaningVi),
      issue_code: 'DUPLICATE_MERGED_AT_RUNTIME',
      issue_detail: `Overlaps with vocabDatabase.json id="${rawWordsLower.get(lower)}"; deduplicated in VOCAB_DATABASE runtime merge`,
      source_ref: 'src/data/vstepPdfKnowledgeBankData.ts'
    });
  }
}

for (const v of VOCAB_DATABASE) {
  const isFromBaseJson = rawBaseVocabSet.has(v.id);
  const sourceFile = isFromBaseJson
    ? 'src/data/vocabDatabase.json'
    : 'src/data/vstepPdfKnowledgeBankData.ts';
  const naturalKey = `vocabulary:${cleanSingleLine(v.id)}:${cleanSingleLine(v.word).toLowerCase()}`;
  const newUuid = uuidV5(naturalKey);
  const srcHash = sha256Json(v);

  const tags = Array.isArray(v.tags) && v.tags.length > 0 ? v.tags.map(cleanSingleLine) : ['general-academic'];
  const primarySlug = tags[0].toLowerCase().replace(/[^a-z0-9-]+/g, '-') || 'general-academic';
  const categoryId = categorySlugToUuid.get(primarySlug) || null;

  const cleanWord = cleanSingleLine(v.word);
  const cleanMeaning = cleanSingleLine(v.meaning);
  const hasQualityFlag = cleanWord.toLowerCase() === cleanMeaning.toLowerCase();

  if (hasQualityFlag) {
    vocabNeedsReview.push({
      legacy_id: v.id,
      word: cleanWord,
      ipa: cleanSingleLine(v.ipa),
      pos: normalizePos(v.type),
      meaning_vi: cleanMeaning,
      issue_code: 'MEANING_IDENTICAL_TO_WORD',
      issue_detail: `Vietnamese meaning "${cleanMeaning}" is identical to English headword "${cleanWord}" (loanword/untranslated)`,
      source_ref: `${sourceFile} (id=${v.id})`
    });
  }

  const row = {
    id: newUuid,
    legacy_id: cleanSingleLine(v.id),
    word: cleanWord,
    word_normalized: cleanWord.toLowerCase(),
    ipa: cleanSingleLine(v.ipa),
    pos: normalizePos(v.type),
    pos_raw: cleanSingleLine(v.type),
    cefr_level: normalizeCefr(v.level),
    meaning_vi: cleanMeaning,
    example_en: cleanSingleLine(v.exampleEn),
    example_vi: cleanSingleLine(v.exampleVi),
    synonyms: Array.isArray(v.synonyms) ? v.synonyms.map(cleanSingleLine) : [],
    antonyms: Array.isArray(v.antonyms) ? v.antonyms.map(cleanSingleLine) : [],
    collocations: Array.isArray(v.collocations) ? v.collocations.map(cleanSingleLine) : [],
    word_family: Array.isArray(v.wordFamily) ? v.wordFamily.map(cleanSingleLine) : [],
    detailed_note: cleanMultiLine(v.detailedNote || ''),
    tags,
    category_id: categoryId,
    needs_review: hasQualityFlag,
    source_file: sourceFile,
    source_hash: srcHash,
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP,
    updated_at: FIXED_TIMESTAMP
  };

  vocabularyRows.push(row);
  wordLowerToUuid.set(cleanWord.toLowerCase(), newUuid);
  vocabIdMap.push({
    legacy_id: row.legacy_id,
    new_uuid: newUuid,
    natural_key: naturalKey,
    source_file: sourceFile,
    source_hash: srcHash
  });
}

// 4. GRAMMAR STRUCTURES (`04_grammar_structures`)
const grammarRows = [];
const grammarIdMap = [];

for (const item of EXPANDED_PDF_KNOWLEDGE_LIBRARY) {
  const naturalKey = `grammar_structure:expanded_pdf:${item.id}`;
  const newUuid = uuidV5(naturalKey);
  const srcHash = sha256Json(item);
  grammarRows.push({
    id: newUuid,
    legacy_id: cleanSingleLine(item.id),
    item_number: Number(item.pdfItemNumber || 0),
    structure_name: cleanSingleLine(item.structureName),
    formula: cleanSingleLine(item.formula),
    meaning_vi: cleanSingleLine(item.meaningVi),
    when_to_use: cleanSingleLine(item.whenToUse),
    category_slug: cleanSingleLine(item.category),
    category_label: cleanSingleLine(item.categoryLabel),
    difficulty_band: cleanSingleLine(item.difficulty),
    example_en: cleanSingleLine(item.originalPdfExample),
    example_vi: cleanSingleLine(item.originalPdfExampleVi),
    how_it_works_vi: cleanMultiLine(item.howItWorksVi),
    syntactic_breakdown: item.syntacticBreakdown || [],
    expanded_examples: item.expandedExamples || [],
    sentence_transformations: item.sentenceTransformations || [],
    common_mistakes: item.commonMistakes || [],
    source_pdf_name: cleanSingleLine(item.pdfFileName),
    source_pdf_page: Number(item.pdfPage || 1),
    source_file: 'src/data/expandedPdfLibraryData.ts',
    source_hash: srcHash,
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP,
    updated_at: FIXED_TIMESTAMP
  });
  grammarIdMap.push({
    legacy_id: cleanSingleLine(item.id),
    new_uuid: newUuid,
    natural_key: naturalKey,
    source_file: 'src/data/expandedPdfLibraryData.ts',
    source_hash: srcHash
  });
}

for (const [idx, st] of VSTEP_PDF_STRUCTURE_BANK.entries()) {
  const naturalKey = `grammar_structure:vstep_pdf:${st.id}`;
  const newUuid = uuidV5(naturalKey);
  const srcHash = sha256Json(st);
  grammarRows.push({
    id: newUuid,
    legacy_id: cleanSingleLine(st.id),
    item_number: 100 + idx + 1,
    structure_name: cleanSingleLine(st.structure),
    formula: cleanSingleLine(st.formula),
    meaning_vi: cleanSingleLine(st.meaningVi),
    when_to_use: cleanSingleLine(st.usageNote),
    category_slug: 'ielts-vstep',
    category_label: cleanSingleLine(st.category || 'VSTEP Structure Bank'),
    difficulty_band: cleanSingleLine(st.level || 'B2–C1'),
    example_en: cleanSingleLine(st.exampleEn),
    example_vi: cleanSingleLine(st.exampleVi),
    how_it_works_vi: cleanMultiLine(st.usageNote),
    syntactic_breakdown: [],
    expanded_examples: [],
    sentence_transformations: [],
    common_mistakes: [],
    source_pdf_name: '_n_thi_vstep_11d6f8c6.pdf',
    source_pdf_page: Number(st.pdfPage || 1),
    source_file: 'src/data/vstepPdfKnowledgeBankData.ts',
    source_hash: srcHash,
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP,
    updated_at: FIXED_TIMESTAMP
  });
  grammarIdMap.push({
    legacy_id: cleanSingleLine(st.id),
    new_uuid: newUuid,
    natural_key: naturalKey,
    source_file: 'src/data/vstepPdfKnowledgeBankData.ts',
    source_hash: srcHash
  });
}

// 5. CURRICULUM DAYS (`05_curriculum_days`) & 6. DAY VOCAB (`06_curriculum_day_vocab`)
const curriculumDayRows = [];
const curriculumDayVocabRows = [];
const curriculumDayIdMap = [];

for (const d of CHALLENGE_60_DAYS) {
  const naturalKey = `curriculum_day:day_${d.day}`;
  const dayUuid = uuidV5(naturalKey);
  const srcHash = sha256Json(d);

  curriculumDayRows.push({
    id: dayUuid,
    legacy_id: `day_${d.day}`,
    day_number: Number(d.day),
    week_number: Number(d.week),
    topic_en: cleanSingleLine(d.topicEn),
    topic_vi: cleanSingleLine(d.topicVi),
    theme_tag: cleanSingleLine(d.themeTag),
    band_target: cleanSingleLine(d.bandTarget),
    reading_title: cleanSingleLine(d.reading?.passageTitle || d.reading?.title || ''),
    reading_source: cleanSingleLine(d.reading?.sourceType || ''),
    reading_paragraphs: d.reading?.paragraphs || [],
    reading_questions: d.reading?.comprehensionQuestions || d.reading?.questions || [],
    writing_prompt: cleanMultiLine(d.writing?.prompt || ''),
    writing_question_type: cleanSingleLine(d.writing?.questionType || ''),
    writing_outline: d.writing?.outline || [],
    writing_model_essay: cleanMultiLine(d.writing?.sampleEssay || d.writing?.modelEssay || ''),
    speaking_topic: cleanSingleLine(d.speaking?.part1Topic || d.speaking?.topic || ''),
    speaking_part1: d.speaking?.part1Questions || [],
    speaking_cue_card: d.speaking?.part2CueCard || {},
    speaking_part3: d.speaking?.part3Questions || [],
    source_file: d.day <= 15
      ? 'src/data/curriculum/days01To15.ts'
      : d.day <= 60
        ? 'src/data/curriculum/days16To60.ts'
        : 'src/data/challenge60Data.ts',
    source_hash: srcHash,
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP,
    updated_at: FIXED_TIMESTAMP
  });

  curriculumDayIdMap.push({
    legacy_id: `day_${d.day}`,
    new_uuid: dayUuid,
    natural_key: naturalKey,
    source_file: 'src/data/challenge60Data.ts',
    source_hash: srcHash
  });

  for (const [wIdx, w] of (d.vocab || d.vocabulary || []).entries()) {
    const cleanW = cleanSingleLine(w.word);
    const matchedVocabUuid = wordLowerToUuid.get(cleanW.toLowerCase()) || null;
    const legacyWId = cleanSingleLine(w.id || `d${d.day}_w${wIdx + 1}`);
    const itemNaturalKey = `curriculum_day_vocab:day_${d.day}:${legacyWId}:${wIdx + 1}`;
    curriculumDayVocabRows.push({
      id: uuidV5(itemNaturalKey),
      legacy_id: legacyWId,
      day_id: dayUuid,
      day_number: Number(d.day),
      display_order: wIdx + 1,
      vocab_id: matchedVocabUuid,
      word: cleanW,
      ipa: cleanSingleLine(w.ipa),
      pos: normalizePos(w.pos),
      meaning_vi: cleanSingleLine(w.meaning),
      collocations: Array.isArray(w.collocations) ? w.collocations.map(cleanSingleLine) : [],
      example_en: cleanSingleLine(w.exampleEn),
      example_vi: cleanSingleLine(w.exampleVi),
      detailed_note: cleanMultiLine(w.detailedNote || ''),
      source_file: 'src/data/challenge60Data.ts',
      source_hash: sha256Json(w),
      import_batch_id: BATCH_ID,
      created_at: FIXED_TIMESTAMP
    });
  }
}

// 7. IELTS & VSTEP SPEAKING TOPICS (`07_ielts_speaking_topics`)
const speakingRows = [];
const speakingIdMap = [];

for (const [idx, seed] of ALL_VSTEP_28_SEEDS.entries()) {
  const legacyId = `vstep28_seed_${idx + 1}`;
  const naturalKey = `speaking_topic:${legacyId}:${cleanSingleLine(seed.tEn).toLowerCase()}`;
  const newUuid = uuidV5(naturalKey);
  const srcHash = sha256Json(seed);
  speakingRows.push({
    id: newUuid,
    legacy_id: legacyId,
    topic_number: idx + 1,
    part_type: 'full_test_part_1_2_3',
    topic_en: cleanSingleLine(seed.tEn),
    topic_vi: cleanSingleLine(seed.tVi),
    theme_tag: cleanSingleLine(seed.tag),
    band_target: 'Band 7.0–8.0 / VSTEP B2–C1',
    part1_questions: seed.p1 || [],
    part2_cue_card: {
      prompt: cleanSingleLine(seed.p2Prompt),
      bullets: seed.p2Bullets || [],
      sample_answer: cleanMultiLine(seed.p2Sample)
    },
    part3_questions: seed.p3 || [],
    vocabulary_Executing: (seed.vocab || []).map(v => ({
      word: v[0],
      ipa: v[1],
      pos: v[2],
      meaning_vi: v[3],
      collocations: v[4],
      example_en: v[5],
      example_vi: v[6],
      note: v[7]
    })),
    source_file: 'src/data/curriculum/vstep28SpeakingBank.ts',
    source_hash: srcHash,
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP,
    updated_at: FIXED_TIMESTAMP
  });
  speakingIdMap.push({
    legacy_id: legacyId,
    new_uuid: newUuid,
    natural_key: naturalKey,
    source_file: 'src/data/curriculum/vstep28SpeakingBank.ts',
    source_hash: srcHash
  });
}

for (const p1 of VSTEP_PDF_SPEAKING_PART1_BANK) {
  const naturalKey = `speaking_topic:vstep_p1:${p1.id}`;
  const newUuid = uuidV5(naturalKey);
  const srcHash = sha256Json(p1);
  speakingRows.push({
    id: newUuid,
    legacy_id: p1.id,
    topic_number: 100 + speakingRows.length,
    part_type: 'speaking_part_1',
    topic_en: cleanSingleLine(p1.topic),
    topic_vi: cleanSingleLine(p1.topicVi),
    theme_tag: 'VSTEP Part 1 Social Interaction',
    band_target: 'VSTEP B1–C1',
    part1_questions: p1.questions || [],
    part2_cue_card: {},
    part3_questions: [],
    vocabulary_Executing: [],
    source_file: 'src/data/vstepPdfKnowledgeBankData.ts',
    source_hash: srcHash,
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP,
    updated_at: FIXED_TIMESTAMP
  });
  speakingIdMap.push({
    legacy_id: p1.id,
    new_uuid: newUuid,
    natural_key: naturalKey,
    source_file: 'src/data/vstepPdfKnowledgeBankData.ts',
    source_hash: srcHash
  });
}

for (const p2 of VSTEP_PDF_SPEAKING_PART2_BANK) {
  const naturalKey = `speaking_topic:vstep_p2:${p2.id}`;
  const newUuid = uuidV5(naturalKey);
  const srcHash = sha256Json(p2);
  speakingRows.push({
    id: newUuid,
    legacy_id: p2.id,
    topic_number: 100 + speakingRows.length,
    part_type: 'speaking_part_2',
    topic_en: cleanSingleLine(p2.title),
    topic_vi: cleanSingleLine(p2.titleVi),
    theme_tag: 'VSTEP Part 2 Solution Discussion',
    band_target: 'VSTEP B2–C1',
    part1_questions: [],
    part2_cue_card: {
      situation: p2.situation,
      options: p2.options,
      recommended_choice: p2.recommendedChoice,
      sample_response: p2.sampleResponseEn,
      sample_response_vi: p2.sampleResponseVi
    },
    part3_questions: [],
    vocabulary_Executing: p2.keyArguments || [],
    source_file: 'src/data/vstepPdfKnowledgeBankData.ts',
    source_hash: srcHash,
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP,
    updated_at: FIXED_TIMESTAMP
  });
  speakingIdMap.push({
    legacy_id: p2.id,
    new_uuid: newUuid,
    natural_key: naturalKey,
    source_file: 'src/data/vstepPdfKnowledgeBankData.ts',
    source_hash: srcHash
  });
}

for (const p3 of VSTEP_PDF_SPEAKING_PART3_BANK) {
  const naturalKey = `speaking_topic:vstep_p3:${p3.id}`;
  const newUuid = uuidV5(naturalKey);
  const srcHash = sha256Json(p3);
  speakingRows.push({
    id: newUuid,
    legacy_id: p3.id,
    topic_number: 100 + speakingRows.length,
    part_type: 'speaking_part_3',
    topic_en: cleanSingleLine(p3.topicStatement),
    topic_vi: cleanSingleLine(p3.topicStatementVi),
    theme_tag: 'VSTEP Part 3 Topic Development',
    band_target: 'VSTEP B2–C1',
    part1_questions: [],
    part2_cue_card: {
      mind_map_nodes: p3.mindMapNodes,
      sample_speech_en: p3.sampleSpeechEn,
      sample_speech_vi: p3.sampleSpeechVi
    },
    part3_questions: p3.followUpQuestions || [],
    vocabulary_Executing: [],
    source_file: 'src/data/vstepPdfKnowledgeBankData.ts',
    source_hash: srcHash,
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP,
    updated_at: FIXED_TIMESTAMP
  });
  speakingIdMap.push({
    legacy_id: p3.id,
    new_uuid: newUuid,
    natural_key: naturalKey,
    source_file: 'src/data/vstepPdfKnowledgeBankData.ts',
    source_hash: srcHash
  });
}

// 8. QUIZ & ASSESSMENT QUESTIONS (`08_quiz_questions`)
const quizRows = [];
const quizIdMap = [];

for (const q of COLLOCATION_QUESTIONS) {
  const naturalKey = `quiz:collocation:${q.id}`;
  const newUuid = uuidV5(naturalKey);
  const srcHash = sha256Json(q);
  quizRows.push({
    id: newUuid,
    legacy_id: q.id,
    quiz_type: 'collocation_mcq',
    question_prompt: cleanSingleLine(q.sentence),
    options: q.options || [],
    correct_answer: cleanSingleLine(q.answer),
    explanation_vi: cleanMultiLine(q.explanation),
    meaning_hint_vi: cleanSingleLine(q.meaning),
    example_en: cleanSingleLine(q.example),
    metadata: {},
    source_file: 'src/data/vocabularyData.ts',
    source_hash: srcHash,
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP
  });
  quizIdMap.push({ legacy_id: q.id, new_uuid: newUuid, natural_key: naturalKey, source_file: 'src/data/vocabularyData.ts', source_hash: srcHash });
}

for (const q of CONTEXT_QUESTIONS) {
  const naturalKey = `quiz:context:${q.id}`;
  const newUuid = uuidV5(naturalKey);
  const srcHash = sha256Json(q);
  quizRows.push({
    id: newUuid,
    legacy_id: q.id,
    quiz_type: 'context_completion',
    question_prompt: cleanSingleLine(q.sentence),
    options: q.options || [],
    correct_answer: cleanSingleLine(q.answer),
    explanation_vi: cleanMultiLine(q.explanation),
    meaning_hint_vi: cleanSingleLine(q.hint),
    example_en: cleanSingleLine(q.sentence).replace('___', q.answer),
    metadata: {},
    source_file: 'src/data/vocabularyData.ts',
    source_hash: srcHash,
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP
  });
  quizIdMap.push({ legacy_id: q.id, new_uuid: newUuid, natural_key: naturalKey, source_file: 'src/data/vocabularyData.ts', source_hash: srcHash });
}

for (const td of TRICKY_DISTINCTIONS) {
  const naturalKey = `quiz:tricky_distinction:${td.id}`;
  const newUuid = uuidV5(naturalKey);
  const srcHash = sha256Json(td);
  quizRows.push({
    id: newUuid,
    legacy_id: td.id,
    quiz_type: 'tricky_distinction',
    question_prompt: cleanSingleLine(td.quizQuestion),
    options: td.options || [],
    correct_answer: cleanSingleLine(td.answer),
    explanation_vi: cleanMultiLine(td.explanation),
    meaning_hint_vi: cleanSingleLine(td.title),
    example_en: cleanSingleLine(td.word1?.example || ''),
    metadata: { word1: td.word1, word2: td.word2, word3: td.word3 || null },
    source_file: 'src/data/vocabularyData.ts',
    source_hash: srcHash,
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP
  });
  quizIdMap.push({ legacy_id: td.id, new_uuid: newUuid, natural_key: naturalKey, source_file: 'src/data/vocabularyData.ts', source_hash: srcHash });
}

for (const [idx, gt] of GRAMMAR_TIPS.entries()) {
  const legacyId = cleanSingleLine(gt.id || `gt_${idx + 1}`);
  const naturalKey = `quiz:grammar_tip:${legacyId}:${cleanSingleLine(gt.title).toLowerCase()}`;
  const newUuid = uuidV5(naturalKey);
  const srcHash = sha256Json(gt);
  quizRows.push({
    id: newUuid,
    legacy_id: legacyId,
    quiz_type: 'grammar_error_correction',
    question_prompt: cleanSingleLine(gt.incorrect || gt.commonMistake || gt.title),
    options: [cleanSingleLine(gt.correct || gt.example || ''), cleanSingleLine(gt.incorrect || gt.commonMistake || '')].filter(Boolean),
    correct_answer: cleanSingleLine(gt.correct || gt.example || ''),
    explanation_vi: cleanMultiLine(gt.explanation || gt.rule || ''),
    meaning_hint_vi: cleanSingleLine(gt.title),
    example_en: cleanSingleLine(gt.correct || gt.example || ''),
    metadata: { category: gt.category, rule: gt.rule },
    source_file: 'src/data/vocabularyData.ts',
    source_hash: srcHash,
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP
  });
  quizIdMap.push({ legacy_id: legacyId, new_uuid: newUuid, natural_key: naturalKey, source_file: 'src/data/vocabularyData.ts', source_hash: srcHash });
}

for (const [idx, item] of EXPANDED_PDF_KNOWLEDGE_LIBRARY.entries()) {
  for (const [exIdx, ex] of (item.practiceExercises || []).entries()) {
    const legacyId = `${item.id}_${ex.id || `ex_${exIdx + 1}`}`;
    const naturalKey = `quiz:expanded_pdf:${legacyId}:${cleanSingleLine(ex.question).toLowerCase()}`;
    const newUuid = uuidV5(naturalKey);
    const srcHash = sha256Json(ex);
    quizRows.push({
      id: newUuid,
      legacy_id: legacyId,
      quiz_type: `structure_${ex.type}`,
      question_prompt: cleanSingleLine(ex.question),
      options: ex.options || [],
      correct_answer: cleanSingleLine(ex.correctAnswer),
      explanation_vi: cleanMultiLine(ex.explanationVi),
      meaning_hint_vi: cleanSingleLine(item.structureName),
      example_en: cleanSingleLine(item.originalPdfExample),
      metadata: { structure_legacy_id: item.id, pdf_item_number: item.pdfItemNumber },
      source_file: 'src/data/expandedPdfLibraryData.ts',
      source_hash: srcHash,
      import_batch_id: BATCH_ID,
      created_at: FIXED_TIMESTAMP
    });
    quizIdMap.push({ legacy_id: legacyId, new_uuid: newUuid, natural_key: naturalKey, source_file: 'src/data/expandedPdfLibraryData.ts', source_hash: srcHash });
  }
}

for (const vg of VSTEP_PDF_GRAMMAR_BANK) {
  const naturalKey = `quiz:vstep_grammar:${vg.id}`;
  const newUuid = uuidV5(naturalKey);
  const srcHash = sha256Json(vg);
  quizRows.push({
    id: newUuid,
    legacy_id: vg.id,
    quiz_type: 'vstep_grammar_rule',
    question_prompt: cleanSingleLine(vg.commonMistake || vg.title),
    options: [cleanSingleLine(vg.exampleEn)],
    correct_answer: cleanSingleLine(vg.exampleEn),
    explanation_vi: cleanMultiLine(vg.ruleSummaryVi),
    meaning_hint_vi: cleanSingleLine(vg.title),
    example_en: cleanSingleLine(vg.exampleEn),
    metadata: { formula_or_markers: vg.formulaOrMarkers, example_vi: vg.exampleVi, pdf_page: vg.pdfPage },
    source_file: 'src/data/vstepPdfKnowledgeBankData.ts',
    source_hash: srcHash,
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP
  });
  quizIdMap.push({ legacy_id: vg.id, new_uuid: newUuid, natural_key: naturalKey, source_file: 'src/data/vstepPdfKnowledgeBankData.ts', source_hash: srcHash });
}

// 9. PDF KNOWLEDGE LIBRARY (`09_pdf_library`)
const pdfLibraryRows = [];
for (const item of VSTEP_PDF_AS_KNOWLEDGE_RECORDS) {
  const naturalKey = `pdf_library:unified:${item.id}`;
  pdfLibraryRows.push({
    id: uuidV5(naturalKey),
    legacy_id: item.id,
    record_type: 'vstep_knowledge_item',
    title: cleanSingleLine(item.structureName),
    subtitle: cleanSingleLine(item.formula),
    category: cleanSingleLine(item.category),
    difficulty: cleanSingleLine(item.difficulty),
    summary_vi: cleanMultiLine(item.meaningVi),
    content_json: item,
    pdf_file_name: cleanSingleLine(item.pdfFileName),
    pdf_page: Number(item.pdfPage || 1),
    source_file: 'src/data/vstepPdfKnowledgeBankData.ts',
    source_hash: sha256Json(item),
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP
  });
}

for (const w of VSTEP_PDF_WRITING_BANK) {
  const naturalKey = `pdf_library:writing:${w.id}`;
  pdfLibraryRows.push({
    id: uuidV5(naturalKey),
    legacy_id: w.id,
    record_type: `vstep_writing_${w.taskType}`,
    title: cleanSingleLine(w.title),
    subtitle: cleanSingleLine(w.subType),
    category: 'writing_template',
    difficulty: 'VSTEP B1–C1',
    summary_vi: cleanMultiLine(w.promptSummaryVi),
    content_json: w,
    pdf_file_name: '_n_thi_vstep_11d6f8c6.pdf',
    pdf_page: Number(w.pdfPage || 1),
    source_file: 'src/data/vstepPdfKnowledgeBankData.ts',
    source_hash: sha256Json(w),
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP
  });
}

for (const l of VSTEP_PDF_LISTENING_BANK) {
  const naturalKey = `pdf_library:listening:${l.id}`;
  pdfLibraryRows.push({
    id: uuidV5(naturalKey),
    legacy_id: l.id,
    record_type: 'vstep_listening_strategy',
    title: cleanSingleLine(l.partTitle),
    subtitle: cleanSingleLine(l.part),
    category: 'listening_strategy',
    difficulty: 'VSTEP B1–C1',
    summary_vi: cleanMultiLine(l.formatSummaryVi),
    content_json: l,
    pdf_file_name: '_n_thi_vstep_11d6f8c6.pdf',
    pdf_page: Number(l.pdfPage || 1),
    source_file: 'src/data/vstepPdfKnowledgeBankData.ts',
    source_hash: sha256Json(l),
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP
  });
}

for (const n of VSTEP_PDF_STUDY_NOTES) {
  const naturalKey = `pdf_library:study_note:${n.id}`;
  pdfLibraryRows.push({
    id: uuidV5(naturalKey),
    legacy_id: n.id,
    record_type: 'vstep_study_note',
    title: cleanSingleLine(n.title),
    subtitle: cleanSingleLine(n.targetBand),
    category: 'study_roadmap',
    difficulty: cleanSingleLine(n.targetBand),
    summary_vi: (n.checklist || []).join(' | '),
    content_json: n,
    pdf_file_name: '_n_thi_vstep_11d6f8c6.pdf',
    pdf_page: Number(n.pdfPage || 1),
    source_file: 'src/data/vstepPdfKnowledgeBankData.ts',
    source_hash: sha256Json(n),
    import_batch_id: BATCH_ID,
    created_at: FIXED_TIMESTAMP
  });
}

// Write all 9 main tables (CSV + JSON)
const tableFiles = [
  {
    table: 'import_batches',
    base: '01_import_batches',
    cols: ['id', 'batch_code', 'description', 'source_version', 'total_tables', 'imported_at', 'created_at'],
    rows: importBatches
  },
  {
    table: 'vocabulary_categories',
    base: '02_vocabulary_categories',
    cols: ['id', 'legacy_id', 'slug', 'name', 'display_order', 'vocab_count', 'import_batch_id', 'created_at', 'updated_at'],
    rows: vocabularyCategories
  },
  {
    table: 'vocabulary',
    base: '03_vocabulary',
    cols: [
      'id', 'legacy_id', 'word', 'word_normalized', 'ipa', 'pos', 'pos_raw', 'cefr_level',
      'meaning_vi', 'example_en', 'example_vi', 'synonyms', 'antonyms', 'collocations',
      'word_family', 'detailed_note', 'tags', 'category_id', 'needs_review',
      'source_file', 'source_hash', 'import_batch_id', 'created_at', 'updated_at'
    ],
    rows: vocabularyRows
  },
  {
    table: 'grammar_structures',
    base: '04_grammar_structures',
    cols: [
      'id', 'legacy_id', 'item_number', 'structure_name', 'formula', 'meaning_vi',
      'when_to_use', 'category_slug', 'category_label', 'difficulty_band',
      'example_en', 'example_vi', 'how_it_works_vi', 'syntactic_breakdown',
      'expanded_examples', 'sentence_transformations', 'common_mistakes',
      'source_pdf_name', 'source_pdf_page', 'source_file', 'source_hash',
      'import_batch_id', 'created_at', 'updated_at'
    ],
    rows: grammarRows
  },
  {
    table: 'curriculum_days',
    base: '05_curriculum_days',
    cols: [
      'id', 'legacy_id', 'day_number', 'week_number', 'topic_en', 'topic_vi',
      'theme_tag', 'band_target', 'reading_title', 'reading_source',
      'reading_paragraphs', 'reading_questions', 'writing_prompt',
      'writing_question_type', 'writing_outline', 'writing_model_essay',
      'speaking_topic', 'speaking_part1', 'speaking_cue_card', 'speaking_part3',
      'source_file', 'source_hash', 'import_batch_id', 'created_at', 'updated_at'
    ],
    rows: curriculumDayRows
  },
  {
    table: 'curriculum_day_vocab',
    base: '06_curriculum_day_vocab',
    cols: [
      'id', 'legacy_id', 'day_id', 'day_number', 'display_order', 'vocab_id',
      'word', 'ipa', 'pos', 'meaning_vi', 'collocations', 'example_en',
      'example_vi', 'detailed_note', 'source_file', 'source_hash',
      'import_batch_id', 'created_at'
    ],
    rows: curriculumDayVocabRows
  },
  {
    table: 'ielts_speaking_topics',
    base: '07_ielts_speaking_topics',
    cols: [
      'id', 'legacy_id', 'topic_number', 'part_type', 'topic_en', 'topic_vi',
      'theme_tag', 'band_target', 'part1_questions', 'part2_cue_card',
      'part3_questions', 'vocabulary_Executing', 'source_file', 'source_hash',
      'import_batch_id', 'created_at', 'updated_at'
    ],
    rows: speakingRows
  },
  {
    table: 'quiz_questions',
    base: '08_quiz_questions',
    cols: [
      'id', 'legacy_id', 'quiz_type', 'question_prompt', 'options',
      'correct_answer', 'explanation_vi', 'meaning_hint_vi', 'example_en',
      'metadata', 'source_file', 'source_hash', 'import_batch_id', 'created_at'
    ],
    rows: quizRows
  },
  {
    table: 'pdf_library',
    base: '09_pdf_library',
    cols: [
      'id', 'legacy_id', 'record_type', 'title', 'subtitle', 'category',
      'difficulty', 'summary_vi', 'content_json', 'pdf_file_name', 'pdf_page',
      'source_file', 'source_hash', 'import_batch_id', 'created_at'
    ],
    rows: pdfLibraryRows
  }
];

const exportedManifestEntries = [];
for (const tf of tableFiles) {
  const { csvPath, jsonPath, count } = writeCsvAndJson(tf.base, tf.cols, tf.rows);
  exportedManifestEntries.push({
    table: tf.table,
    csv_file: `${tf.base}.csv`,
    json_file: `${tf.base}.json`,
    row_count: count,
    csv_sha256: sha256File(csvPath),
    json_sha256: sha256File(jsonPath)
  });
}

// Write ID maps
const idMapCols = ['legacy_id', 'new_uuid', 'natural_key', 'source_file', 'source_hash'];
writeCsvOnly(path.join(OUT_DIR, 'id_map_vocabulary.csv'), idMapCols, vocabIdMap);
writeCsvOnly(path.join(OUT_DIR, 'id_map_grammar_structures.csv'), idMapCols, grammarIdMap);
writeCsvOnly(path.join(OUT_DIR, 'id_map_curriculum_days.csv'), idMapCols, curriculumDayIdMap);
writeCsvOnly(path.join(OUT_DIR, 'id_map_speaking_topics.csv'), idMapCols, speakingIdMap);
writeCsvOnly(path.join(OUT_DIR, 'id_map_quiz_questions.csv'), idMapCols, quizIdMap);

// Write needs_review CSVs
writeCsvOnly(
  path.join(NEEDS_REVIEW_DIR, 'vocabulary_needs_review.csv'),
  ['legacy_id', 'word', 'ipa', 'pos', 'meaning_vi', 'issue_code', 'issue_detail', 'source_ref'],
  vocabNeedsReview
);

const pdfRefsNeedsReview = [
  {
    source_file: 'src/data/expandedPdfLibraryData.ts:85',
    referenced_path: '/assets/aistudio/Untitled_document_bb0198f5.pdf',
    issue_code: 'MISSING_BINARY_PDF_IN_PUBLIC',
    issue_detail: 'Structured content (77 structures, 232 examples) is 100% extracted in expandedPdfLibraryData.ts, but original raw PDF binary is not present in public/assets/aistudio/'
  },
  {
    source_file: 'src/data/vstepPdfKnowledgeBankData.ts:203',
    referenced_path: '/assets/aistudio/_n_thi_vstep_11d6f8c6.pdf',
    issue_code: 'MISSING_BINARY_PDF_IN_PUBLIC',
    issue_detail: 'Structured content (24 unified records, 20 vocab, 5 writing, 17 speaking, 3 listening) is 100% extracted in vstepPdfKnowledgeBankData.ts, but original raw PDF binary is not present in public/assets/aistudio/'
  }
];
writeCsvOnly(
  path.join(NEEDS_REVIEW_DIR, 'pdf_references_needs_review.csv'),
  ['source_file', 'referenced_path', 'issue_code', 'issue_detail'],
  pdfRefsNeedsReview
);

// Write storage_manifest.csv from _audit/03_ASSET_MANIFEST.json
const assetManifest = JSON.parse(fs.readFileSync('_audit/03_ASSET_MANIFEST.json', 'utf8'));
const storageRows = assetManifest.assets
  .filter(a => a.path.startsWith('public/') && a.status !== 'temporary')
  .map(a => {
    const ext = a.type.toLowerCase();
    const mime =
      ext === 'jpg' || ext === 'jpeg'
        ? 'image/jpeg'
        : ext === 'png'
          ? 'image/png'
          : ext === 'svg'
            ? 'image/svg+xml'
            : ext === 'pdf'
              ? 'application/pdf'
              : 'application/octet-stream';
    const relStoragePath = a.path.replace(/^public\/assets\//, '');
    return {
      local_path: a.path,
      web_path: a.web_path,
      bucket: ext === 'pdf' ? 'course-pdfs' : 'public-editorial-assets',
      storage_path: relStoragePath,
      mime_type: mime,
      dimensions: a.dimensions || '',
      size_bytes: a.size_bytes,
      sha256: a.sha256,
      cache_control: 'public, max-age=31536000, immutable',
      status: a.status
    };
  });

writeCsvOnly(
  path.join(OUT_DIR, 'storage_manifest.csv'),
  ['local_path', 'web_path', 'bucket', 'storage_path', 'mime_type', 'dimensions', 'size_bytes', 'sha256', 'cache_control', 'status'],
  storageRows
);

// Write manifest.json and checksums.sha256
const manifestObj = {
  generated_by: 'export_supabase_data.mjs',
  deterministic_namespace_uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  import_batch_id: BATCH_ID,
  fixed_timestamp: FIXED_TIMESTAMP,
  source_datasets: {
    vocabDatabase_json_count: rawVocabJson.length,
    existingVocab_json_count: existingVocabJson.length,
    vstep_pdf_vocab_bank_count: VSTEP_PDF_VOCAB_BANK.length,
    merged_runtime_vocab_count: VOCAB_DATABASE.length,
    expanded_pdf_structures_count: EXPANDED_PDF_KNOWLEDGE_LIBRARY.length,
    vstep_pdf_structures_count: VSTEP_PDF_STRUCTURE_BANK.length,
    challenge_days_count: CHALLENGE_60_DAYS.length,
    challenge_day_vocab_count: curriculumDayVocabRows.length,
    vstep_28_speaking_seeds_count: ALL_VSTEP_28_SEEDS.length,
    total_quiz_questions_count: quizRows.length,
    total_pdf_library_records_count: pdfLibraryRows.length
  },
  tables: exportedManifestEntries,
  needs_review_counts: {
    vocabulary_needs_review: vocabNeedsReview.length,
    pdf_references_needs_review: pdfRefsNeedsReview.length
  },
  storage_assets_count: storageRows.length
};

fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifestObj, null, 2) + '\n', 'utf8');

// Compute checksums.sha256 for all exported files in _audit/08_SUPABASE_IMPORT
const checksumLines = [];
const filesToHash = fs.readdirSync(OUT_DIR).filter(f => /\.(csv|json)$/.test(f)).sort();
for (const f of filesToHash) {
  const full = path.join(OUT_DIR, f);
  checksumLines.push(`${sha256File(full)}  ${f}`);
}
for (const f of fs.readdirSync(NEEDS_REVIEW_DIR).filter(f => f.endsWith('.csv')).sort()) {
  const full = path.join(NEEDS_REVIEW_DIR, f);
  checksumLines.push(`${sha256File(full)}  needs_review/${f}`);
}
fs.writeFileSync(path.join(OUT_DIR, 'checksums.sha256'), checksumLines.join('\n') + '\n', 'utf8');

console.log('EXPORT COMPLETE:', JSON.stringify(manifestObj, null, 2));
