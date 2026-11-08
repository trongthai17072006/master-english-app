import { VocabItem, CollocationQuestion } from '../data/vocabularyData';
import { PdfKnowledgeRecord, StructureCategory, DifficultyBand } from '../data/expandedPdfLibraryData';
import { ChallengeDay, ChallengeVocabWord } from '../data/curriculum/types';
import { deepNormalizeText } from '../utils/textNormalization';
import { assertAdminWriteAccess } from '../utils/adminAuth';

export const CUSTOM_CONTENT_STORAGE_KEY = 'master_english_custom_content_v1';
export const CUSTOM_CONTENT_EVENT = 'master-english-custom-content-updated';

export interface CustomChallengeDayOverride {
  day: number;
  themeVi?: string;
  themeEn?: string;
  description?: string;
  extraVocab?: ChallengeVocabWord[];
  replaceVocab?: ChallengeVocabWord[];
  readingTitle?: string;
  readingParagraphs?: string[];
  readingTranslations?: string[];
  writingPrompt?: string;
  writingPromptVi?: string;
  writingOutline?: {
    introduction: string;
    bodyParagraph1: string;
    bodyParagraph2: string;
    conclusion: string;
  };
  writingBand80Paragraphs?: string[];
  writingBand80Translations?: string[];
  updatedAt: number;
}

export interface CustomContentStoreData {
  version: number;
  customVocab: VocabItem[];
  customStructures: PdfKnowledgeRecord[];
  customChallengeDays: Record<number, CustomChallengeDayOverride>;
  customCollocations: CollocationQuestion[];
  lastUpdated: number;
}

const DEFAULT_STORE: CustomContentStoreData = {
  version: 1,
  customVocab: [],
  customStructures: [],
  customChallengeDays: {},
  customCollocations: [],
  lastUpdated: 0
};

export function loadCustomContentStore(): CustomContentStoreData {
  try {
    const raw = localStorage.getItem(CUSTOM_CONTENT_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = deepNormalizeText(JSON.parse(raw));
    return {
      version: 1,
      customVocab: Array.isArray(parsed.customVocab) ? parsed.customVocab : [],
      customStructures: Array.isArray(parsed.customStructures) ? parsed.customStructures : [],
      customChallengeDays:
        parsed.customChallengeDays && typeof parsed.customChallengeDays === 'object'
          ? parsed.customChallengeDays
          : {},
      customCollocations: Array.isArray(parsed.customCollocations) ? parsed.customCollocations : [],
      lastUpdated: typeof parsed.lastUpdated === 'number' ? parsed.lastUpdated : Date.now()
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveCustomContentStore(store: CustomContentStoreData): void {
  // Chặn mọi lệnh ghi đè vào LocalStorage nếu isAdminAuthenticated !== true
  assertAdminWriteAccess('Lưu kho dữ liệu mở rộng (saveCustomContentStore)');
  try {
    const normalized: CustomContentStoreData = deepNormalizeText({
      ...store,
      lastUpdated: Date.now()
    });
    localStorage.setItem(CUSTOM_CONTENT_STORAGE_KEY, JSON.stringify(normalized));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CUSTOM_CONTENT_EVENT, { detail: normalized }));
    }
  } catch (err) {
    console.error('Failed to save custom content store:', err);
    throw err;
  }
}

export function addCustomVocabItem(input: {
  word: string;
  ipa?: string;
  type?: string;
  level?: 'B1' | 'B2' | 'C1' | 'C2';
  meaning: string;
  exampleEn: string;
  exampleVi: string;
  collocations?: string[];
  synonyms?: string[];
  antonyms?: string[];
  topic?: string;
  targetDay?: number;
}): { vocabItem: VocabItem; addedToDay?: number } {
  assertAdminWriteAccess('Nạp từ vựng mới (addCustomVocabItem)');
  const store = loadCustomContentStore();
  const cleanWord = input.word.trim();
  const id = `custom_vocab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const rawType = (input.type || 'noun').toLowerCase();
  const mappedPos: VocabItem['pos'] = rawType.startsWith('v')
    ? 'verb'
    : rawType.startsWith('adj')
      ? 'adj'
      : rawType.startsWith('adv')
        ? 'adv'
        : rawType.startsWith('phr')
          ? 'phrase'
          : 'noun';

  const newVocab: VocabItem = {
    id,
    word: cleanWord,
    ipa: input.ipa?.trim() || `/ˈ${cleanWord.toLowerCase()}/`,
    pos: mappedPos,
    level: input.level || 'C1',
    meaning: input.meaning.trim(),
    exampleEn: input.exampleEn.trim(),
    exampleVi: input.exampleVi.trim(),
    collocations:
      input.collocations && input.collocations.length > 0
        ? input.collocations
        : [`${cleanWord.toLowerCase()} framework`, `promote ${cleanWord.toLowerCase()}`],
    detailedNote: `Từ vựng học thuật mở rộng do người dùng nạp (${input.topic || 'Academic Extension'}).`,
    tags: [input.topic?.toLowerCase() || 'academic', 'custom', (input.level || 'c1').toLowerCase()]
  };

  store.customVocab = [
    newVocab,
    ...store.customVocab.filter(v => v.word.toLowerCase() !== cleanWord.toLowerCase())
  ];

  let addedToDay: number | undefined;
  if (input.targetDay && input.targetDay >= 1 && input.targetDay <= 3650) {
    addedToDay = input.targetDay;
    const dayOverride = store.customChallengeDays[addedToDay] || {
      day: addedToDay,
      updatedAt: Date.now()
    };
    const posNormalized: ChallengeVocabWord['pos'] =
      mappedPos === 'verb'
        ? 'v.'
        : mappedPos === 'adj'
          ? 'adj.'
          : mappedPos === 'adv'
            ? 'adv.'
            : mappedPos === 'phrase'
              ? 'phr.'
              : 'n.';

    const challengeWord: ChallengeVocabWord = {
      id: `d${addedToDay}_custom_${Date.now()}`,
      word: newVocab.word,
      ipa: newVocab.ipa || `/ˈ${cleanWord.toLowerCase()}/`,
      pos: posNormalized,
      meaning: newVocab.meaning,
      collocations: newVocab.collocations || [`${cleanWord.toLowerCase()} framework`],
      exampleEn: newVocab.exampleEn || '',
      exampleVi: newVocab.exampleVi || '',
      detailedNote: `Từ vựng mở rộng do người dùng nạp vào Ngày ${addedToDay}.`
    };
    const existingExtra = dayOverride.extraVocab || [];
    dayOverride.extraVocab = [
      challengeWord,
      ...existingExtra.filter(w => w.word.toLowerCase() !== challengeWord.word.toLowerCase())
    ];
    dayOverride.updatedAt = Date.now();
    store.customChallengeDays[addedToDay] = dayOverride;
  }

  saveCustomContentStore(store);
  return { vocabItem: newVocab, addedToDay };
}

export function addCustomStructureItem(input: {
  structureName: string;
  formula: string;
  meaningVi: string;
  whenToUse: string;
  category?: StructureCategory;
  difficulty?: DifficultyBand;
  exampleEn: string;
  exampleVi: string;
  notes?: string;
}): PdfKnowledgeRecord {
  assertAdminWriteAccess('Nạp cấu trúc ngữ pháp mới (addCustomStructureItem)');
  const store = loadCustomContentStore();
  const nextNumber = 78 + store.customStructures.length;
  const id = `custom-struct-${nextNumber}-${Date.now()}`;
  const category = input.category || 'academic-structures';
  const categoryLabels: Record<StructureCategory, string> = {
    'grammar-formulas': 'Công thức Ngữ pháp & Mẫu câu',
    'academic-structures': 'Cấu trúc Câu Học thuật',
    'ielts-vstep': 'Mẫu câu IELTS Writing & VSTEP',
    'everyday-communication': 'Giao tiếp & Phản xạ Speaking',
    'advanced-variations': 'Biến thể Nâng cao (Đảo ngữ & Câu chẻ)',
    'mistakes-transformations': 'So sánh, Đối chiếu & Chuyển đổi câu'
  };

  const record: PdfKnowledgeRecord = {
    id,
    pdfItemNumber: nextNumber,
    pdfFileName: 'User_Custom_Extension.json',
    pdfPage: 25,
    structureName: input.structureName.trim(),
    formula: input.formula.trim(),
    meaningVi: input.meaningVi.trim(),
    whenToUse: input.whenToUse.trim() || 'Sử dụng trong IELTS Writing Task 2 và Speaking Part 3.',
    category,
    categoryLabel: categoryLabels[category],
    difficulty: input.difficulty || 'Band 7.0–7.5',
    originalPdfExample: input.exampleEn.trim(),
    originalPdfExampleVi: input.exampleVi.trim(),
    originalPdfNotes:
      input.notes?.trim() ||
      `Cấu trúc mở rộng #${nextNumber} do học viên bổ sung vào hệ thống học tập.`,
    howItWorksVi: `Áp dụng công thức "${input.formula.trim()}" để diễn đạt ý "${input.meaningVi.trim()}" chuẩn văn phong học thuật.`,
    syntacticBreakdown: input.formula
      .split('+')
      .map(s => s.trim())
      .filter(Boolean),
    logicalFunction: input.whenToUse.trim() || 'Liên kết và nhấn mạnh luận điểm học thuật',
    expandedExamples: [
      {
        id: `${id}-ex-1`,
        domain: 'IELTS Writing',
        english: input.exampleEn.trim(),
        vietnamese: input.exampleVi.trim(),
        highlightedPattern: input.formula.trim(),
        whyUseStructure: input.whenToUse.trim() || 'Nâng điểm Grammatical Range & Accuracy.'
      }
    ],
    usefulVariations: [input.formula.trim()],
    sentenceTransformations: [
      {
        id: `${id}-tr-1`,
        originalSentence: `Câu diễn đạt thông thường cho ý "${input.meaningVi.trim()}".`,
        transformedSentence: input.exampleEn.trim(),
        transformationType: `Áp dụng công thức mở rộng #${nextNumber}`,
        explanationVi: input.notes?.trim() || `Sử dụng cấu trúc ${input.formula.trim()}.`
      }
    ],
    commonMistakes: [
      {
        id: `${id}-err-1`,
        wrongExample: `Sai dạng động từ hoặc mệnh đề khi dùng "${input.structureName.trim()}".`,
        correctExample: input.exampleEn.trim(),
        errorReasonVi: 'Cần chia đúng dạng từ loại theo công thức.',
        grammarRuleVi: `Công thức chuẩn: ${input.formula.trim()}`
      }
    ],
    practiceExercises: [
      {
        id: `${id}-quiz-1`,
        type: 'multiple-choice',
        question: `Công thức chuẩn của cấu trúc "${input.structureName.trim()}" là gì?`,
        options: [
          `${input.formula.trim()} — (${input.meaningVi.trim()})`,
          'Chỉ dùng động từ nguyên mẫu không chia thì',
          'Chỉ dùng trong câu nghi vấn phủ định',
          'Không dùng chủ ngữ trong mệnh đề chính'
        ],
        correctAnswer: `${input.formula.trim()} — (${input.meaningVi.trim()})`,
        explanationVi: `Cấu trúc #${nextNumber}: ${input.formula.trim()} mang nghĩa "${input.meaningVi.trim()}".`
      }
    ]
  };

  store.customStructures = [...store.customStructures, record];
  saveCustomContentStore(store);
  return record;
}

export function saveCustomChallengeDayOverride(override: CustomChallengeDayOverride): void {
  assertAdminWriteAccess('Cập nhật Lộ trình 60 Ngày (saveCustomChallengeDayOverride)');
  const store = loadCustomContentStore();
  const clampedDay = Math.max(1, Math.min(3650, override.day));
  store.customChallengeDays[clampedDay] = {
    ...store.customChallengeDays[clampedDay],
    ...override,
    day: clampedDay,
    updatedAt: Date.now()
  };
  saveCustomContentStore(store);
}

export function removeCustomStructureItem(id: string): void {
  assertAdminWriteAccess('Xóa cấu trúc mở rộng (removeCustomStructureItem)');
  const store = loadCustomContentStore();
  store.customStructures = store.customStructures.filter(item => item.id !== id);
  saveCustomContentStore(store);
}

export function removeCustomVocabItem(id: string): void {
  assertAdminWriteAccess('Xóa từ vựng mở rộng (removeCustomVocabItem)');
  const store = loadCustomContentStore();
  store.customVocab = store.customVocab.filter(item => item.id !== id);
  saveCustomContentStore(store);
}

export function importBulkContentFromText(
  mode: 'vocab' | 'structures' | 'challenge_day',
  rawText: string,
  targetDay = 1
): { importedCount: number; message: string } {
  assertAdminWriteAccess('Nạp dữ liệu hàng loạt JSON/CSV (importBulkContentFromText)');
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error('Dữ liệu đầu vào đang trống. Vui lòng dán nội dung JSON hoặc CSV.');
  }

  let parsedArray: any[] = [];

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const parsedJson = JSON.parse(trimmed);
    parsedArray = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
  } else {
    // Parse CSV / TSV lines
    const lines = trimmed
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      throw new Error('Không tìm thấy dòng dữ liệu hợp lệ.');
    }
    parsedArray = lines.map(line => {
      const delimiter = line.includes('\t') ? '\t' : line.includes('|') ? '|' : ',';
      const cols = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (mode === 'vocab') {
        return {
          word: cols[0] || '',
          pos: cols[1] || 'n.',
          ipa: cols[2] || '',
          meaning: cols[3] || cols[1] || '',
          collocation: cols[4] || '',
          exampleEn: cols[5] || '',
          exampleVi: cols[6] || ''
        };
      }
      return {
        structureName: cols[0] || '',
        formula: cols[1] || cols[0] || '',
        meaningVi: cols[2] || '',
        whenToUse: cols[3] || '',
        exampleEn: cols[4] || '',
        exampleVi: cols[5] || ''
      };
    });
  }

  let importedCount = 0;

  if (mode === 'vocab') {
    for (const item of parsedArray) {
      const word = String(item.word || item.term || '').trim();
      const meaning = String(item.meaning || item.meaningVi || '').trim();
      if (!word || !meaning || word.toLowerCase() === 'word') continue;
      addCustomVocabItem({
        word,
        ipa: item.ipa || `/ˈ${word.toLowerCase()}/`,
        type: item.pos || item.type || 'n.',
        level: item.level || 'C1',
        meaning,
        exampleEn:
          item.exampleEn ||
          item.example ||
          `Academic research highlights the significance of ${word} in modern policy.`,
        exampleVi:
          item.exampleVi ||
          item.exampleTranslation ||
          `Nghiên cứu học thuật làm nổi bật tầm quan trọng của ${meaning.toLowerCase()} trong chính sách hiện đại.`,
        collocations: Array.isArray(item.collocations)
          ? item.collocations
          : item.collocation
            ? [String(item.collocation)]
            : [`foster ${word.toLowerCase()}`, `${word.toLowerCase()} strategy`],
        targetDay: item.day ? Number(item.day) : targetDay
      });
      importedCount++;
    }
    return {
      importedCount,
      message: `Đã nạp thành công ${importedCount} từ vựng học thuật mới vào hệ thống (kèm đồng bộ Ngày ${targetDay}).`
    };
  }

  if (mode === 'structures') {
    for (const item of parsedArray) {
      const structureName = String(item.structureName || item.name || item.formula || '').trim();
      const formula = String(item.formula || item.structureName || '').trim();
      const meaningVi = String(item.meaningVi || item.meaning || '').trim();
      if (!structureName || !meaningVi || structureName.toLowerCase() === 'structurename') continue;
      addCustomStructureItem({
        structureName,
        formula,
        meaningVi,
        whenToUse:
          item.whenToUse ||
          item.when ||
          'Sử dụng trong IELTS Writing Task 2 và Speaking Part 3 để nâng band ngữ pháp.',
        category: item.category || 'academic-structures',
        difficulty: item.difficulty || 'Band 7.0–7.5',
        exampleEn:
          item.exampleEn ||
          item.originalPdfExample ||
          `Applying this structure effectively improves coherence in academic writing.`,
        exampleVi:
          item.exampleVi ||
          item.originalPdfExampleVi ||
          `Áp dụng cấu trúc này một cách hiệu quả giúp cải thiện tính mạch lạc trong văn viết học thuật.`,
        notes: item.notes || item.originalPdfNotes || ''
      });
      importedCount++;
    }
    return {
      importedCount,
      message: `Đã nạp thành công ${importedCount} cấu trúc câu học thuật mới vào Danh mục Công thức.`
    };
  }

  // mode === 'challenge_day'
  for (const item of parsedArray) {
    const dayNum = Number(item.day || targetDay);
    if (!dayNum || dayNum < 1 || dayNum > 3650) continue;
    saveCustomChallengeDayOverride({
      day: dayNum,
      themeVi: item.themeVi || item.title,
      themeEn: item.themeEn,
      description: item.description,
      readingTitle: item.readingTitle,
      readingParagraphs: Array.isArray(item.readingParagraphs) ? item.readingParagraphs : undefined,
      readingTranslations: Array.isArray(item.readingTranslations)
        ? item.readingTranslations
        : undefined,
      writingPrompt: item.writingPrompt,
      writingPromptVi: item.writingPromptVi,
      writingOutline: item.writingOutline,
      updatedAt: Date.now()
    });
    importedCount++;
  }

  return {
    importedCount,
    message: `Đã cập nhật thành công dữ liệu mở rộng cho ${importedCount} ngày trong Lộ trình học tập.`
  };
}
