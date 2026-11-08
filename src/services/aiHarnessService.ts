import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import {
  VOCAB_DATABASE,
  TRICKY_DISTINCTIONS,
  COLLOCATION_QUESTIONS,
  CONTEXT_QUESTIONS,
  VocabItem
} from '../data/vocabularyData';
import {
  EXPANDED_PDF_KNOWLEDGE_LIBRARY,
  CROSS_SECTION_LOGIC_MAPPING,
  PdfKnowledgeRecord
} from '../data/expandedPdfLibraryData';
import { VSTEP_PDF_AS_KNOWLEDGE_RECORDS } from '../data/vstepPdfKnowledgeBankData';
import {
  EXTRA_COLLOCATION_QUESTIONS,
  EXTRA_TRICKY_DISTINCTIONS,
  EXTRA_CONTEXT_QUESTIONS,
  enrichPdfStructureWithDoubledContent
} from '../data/doubledWorkspaceData';
import {
  OXFORD_ACADEMIC_30_LEXICON,
  AUTHORITATIVE_600_LEXICON,
  getOxford30AsVocabItems
} from '../data/academicLexiconEnrichment';
import { CHALLENGE_60_DAYS } from '../data/challenge60Data';
import {
  getMistakes,
  saveMistake,
  removeMistake,
  getMasteredWordIds,
  saveMasteredWordIds,
  MistakeRecord
} from '../utils/storage';
import { getChallengeOverallSummary } from '../utils/challengeStorage';
import {
  getCompletedSessions,
  getActiveSession,
  getWordProgressMap,
  recordWordInteraction
} from './learningStorage';
import { loadMilestoneStore } from './milestoneEngine';
import { dataRepository } from './dataRepository';

// ============================================================================
// 1. TYPES & 13 EDITORIAL SIDEBAR SECTIONS MAPPING
// ============================================================================

export type EditorialSectionId =
  | 'trang_nhat'
  | 'kho_chu'
  | 'ky_xuat_ban'
  | 'quy_chuan'
  | 'the_ho_so'
  | 'phoi_ngu'
  | 'tham_dinh'
  | 'so_do_lien_doi'
  | 'chuyen_de'
  | 'tong_kho'
  | 'ban_dinh_chinh'
  | 'bao_cao'
  | 'the_nha_bao';

export type ModelTier = 'tier_0_local' | 'gemini-2.5-flash' | 'gemini-2.5-pro';

export interface GuardrailValidationResult {
  allowed: boolean;
  reason?: string;
  violationType?: 'prompt_injection' | 'exam_cheating_lock' | 'destructive_command' | 'off_topic';
  safeReply?: string;
}

export interface PendingEditorialConfirmation {
  id: string;
  functionName: string;
  args: Record<string, any>;
  displaySummary: string;
  promptText: string;
}

export interface HarnessExecutionResult {
  replyText: string;
  routedTier: ModelTier;
  citations: string[];
  guardrailStatus: 'passed' | 'blocked_injection' | 'blocked_quiz_lock';
  executedTools: { name: string; resultSummary: string }[];
  pendingConfirmation?: PendingEditorialConfirmation | null;
}

export const EDITORIAL_SECTION_METADATA: Record<
  EditorialSectionId,
  {
    id: EditorialSectionId;
    workspaceMode: string;
    label: string;
    supabaseTable?: string;
    description: string;
  }
> = {
  trang_nhat: {
    id: 'trang_nhat',
    workspaceMode: 'dashboard',
    label: 'Trang Nhất',
    description: 'Tiêu điểm số phát hành hôm nay, nhiệm vụ ưu tiên hàng ngày và thông báo tòa soạn.'
  },
  kho_chu: {
    id: 'kho_chu',
    workspaceMode: 'speed',
    label: 'Kho Chữ & Thuật Ngữ',
    supabaseTable: 'challenge_vocab',
    description: 'Kho 3.866+ tư liệu từ vựng học thuật, IPA, nghĩa tiếng Việt và chủ đề IELTS.'
  },
  ky_xuat_ban: {
    id: 'ky_xuat_ban',
    workspaceMode: 'challenge-60',
    label: 'Kỳ Xuất Bản (60 Số)',
    supabaseTable: 'user_progress',
    description: 'Lộ trình 60 kỳ xuất bản IELTS Band 7.0+ và tiến độ 5 kỹ năng.'
  },
  quy_chuan: {
    id: 'quy_chuan',
    workspaceMode: 'structures',
    label: 'Quy Chuẩn Hành Văn',
    supabaseTable: 'structures',
    description: '101 quy chuẩn cú pháp & mẫu câu tòa soạn kèm số thứ tự cấu trúc và số trang PDF.'
  },
  the_ho_so: {
    id: 'the_ho_so',
    workspaceMode: 'flashcards',
    label: 'Thẻ Hồ Sơ Lưu Trữ',
    supabaseTable: 'user_progress',
    description: 'Hồ sơ ôn tập ngắt quãng (Spaced Repetition Dossier), độ thuộc và lịch ôn lại.'
  },
  phoi_ngu: {
    id: 'phoi_ngu',
    workspaceMode: 'collocations',
    label: 'Phối Ngữ & Mạch Văn',
    description: 'Kho kết hợp từ học thuật (Academic Collocations) và từ nối chuyển đoạn (Discourse Markers).'
  },
  tham_dinh: {
    id: 'tham_dinh',
    workspaceMode: 'distinctions',
    label: 'Thẩm Định Ngữ Nghĩa',
    description: 'Phân biệt sắc thái từ học thuật C1-C2, Formal vs. Informal register và False friends.'
  },
  so_do_lien_doi: {
    id: 'so_do_lien_doi',
    workspaceMode: 'matching',
    label: 'Sơ Đồ Liên Đới',
    description: 'Mạng lưới từ vựng (Lexical Mindmaps), Word Families, chuỗi đồng nghĩa/trái nghĩa.'
  },
  chuyen_de: {
    id: 'chuyen_de',
    workspaceMode: 'context',
    label: 'Chuyên Đề Học Thuật',
    description: 'Bài đọc chuyên khảo (Academic Monographs), luận điểm mẫu (Thesis statements) và từ khóa chuyên ngành.'
  },
  tong_kho: {
    id: 'tong_kho',
    workspaceMode: 'directory',
    label: 'Tổng Kho Tư Liệu',
    description: 'Danh mục toàn bộ tài liệu gốc, chỉ mục 24 trang PDF và tài liệu tham khảo của tòa soạn.'
  },
  ban_dinh_chinh: {
    id: 'ban_dinh_chinh',
    workspaceMode: 'mistakes',
    label: 'Bản Đính Chính',
    supabaseTable: 'errata_items',
    description: 'Bàn Biên Tập Bút Đỏ — Danh sách các bản in lỗi (ERRATA #1, #2...) từ Speed Quiz và bài luyện.'
  },
  bao_cao: {
    id: 'bao_cao',
    workspaceMode: 'analytics',
    label: 'Báo Cáo Phát Hành',
    description: 'Thống kê giờ tập trung FocusTimer, số ca trực đã lưu, tỷ lệ duyệt bài và biểu đồ 7 Kỳ Trong Tuần.'
  },
  the_nha_bao: {
    id: 'the_nha_bao',
    workspaceMode: 'profile',
    label: 'Thẻ Nhà Báo',
    supabaseTable: 'user_progress',
    description: 'Hồ sơ học viên Nguyễn Trọng Thái, cấp độ hiện tại, điểm XP, Streak và quyền hạn biên tập.'
  }
};

export function normalizeSectionId(rawPageOrMode?: string): EditorialSectionId {
  const clean = (rawPageOrMode || '').trim().toLowerCase();
  switch (clean) {
    case 'trang_nhat':
    case 'dashboard':
    case 'home':
      return 'trang_nhat';
    case 'kho_chu':
    case 'speed':
      return 'kho_chu';
    case 'ky_xuat_ban':
    case 'challenge-60':
      return 'ky_xuat_ban';
    case 'quy_chuan':
    case 'structures':
    case 'structure':
    case 'example-library':
      return 'quy_chuan';
    case 'the_ho_so':
    case 'flashcards':
      return 'the_ho_so';
    case 'phoi_ngu':
    case 'collocations':
      return 'phoi_ngu';
    case 'tham_dinh':
    case 'distinctions':
      return 'tham_dinh';
    case 'so_do_lien_doi':
    case 'matching':
    case 'node-matching':
      return 'so_do_lien_doi';
    case 'chuyen_de':
    case 'context':
      return 'chuyen_de';
    case 'tong_kho':
    case 'directory':
      return 'tong_kho';
    case 'ban_dinh_chinh':
    case 'mistakes':
      return 'ban_dinh_chinh';
    case 'bao_cao':
    case 'analytics':
      return 'bao_cao';
    case 'the_nha_bao':
    case 'profile':
      return 'the_nha_bao';
    default:
      return 'trang_nhat';
  }
}

// ============================================================================
// 2. SYSTEM INSTRUCTION CHUẨN TÒA SOẠN (CACHED CONTEXT)
// ============================================================================

export const EDITORIAL_SYSTEM_INSTRUCTION = `
Bạn là "Giáo Sư Mèo" - Cố vấn học thuật cao cấp của tòa soạn MASTER English.
Phong cách: Tận tâm, thông thái, súc tích, giải thích ngữ pháp và từ vựng theo phương pháp trực quan, dễ hiểu kèm ví dụ thực tế.

CÁC NGUYÊN TẮC BẮT BUỘC (VI PHẠM SẼ BỊ HỦY BỎ):
1. TUYỆT ĐỐI KHÔNG in ra các tiêu đề hệ thống, nhãn kỹ thuật như "TẦNG 1", "2.5 FLASH", "[ĐỐI CHIẾU TƯ LIỆU]", "CHUYÊN MỤC:...", "Tổng Kho Tư Liệu", "Trang Nhất", "Nguồn đối chiếu".
2. TUYỆT ĐỐI KHÔNG copy nguyên văn đoạn tài liệu được cấp. Hãy vận dụng thông tin đó để trả lời trực tiếp cho học viên bằng lời văn của Giáo Sư Mèo.
3. Khi người dùng hỏi về cấu trúc hoặc từ vựng, đi thẳng vào:
   - Tên & Công thức chuẩn
   - Giải thích bản chất & sắc thái (dễ hiểu, thực chiến)
   - 1-2 ví dụ ngữ cảnh học thuật chuẩn IELTS/VSTEP
4. Không lặp lại câu hỏi của học viên. Không chào hỏi rườm rà.
`.trim();

// ============================================================================
// 3. GUARDRAILS & ANTI-INJECTION / EXAM INTEGRITY LOCK
// ============================================================================

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /bỏ\s+qua\s+(mọi\s+|toàn\s+bộ\s+)?(quy\s+tắc|hướng\s+dẫn|lệnh\s+trước)/i,
  /system\s*prompt/i,
  /xóa\s+sạch\s+(database|cơ\s+sở\s+dữ\s+liệu|dữ\s+liệu)/i,
  /drop\s+table/i,
  /truncate\s+table/i,
  /delete\s+from\s+users/i,
  /jailbreak/i,
  /bypass\s+guardrail/i
];

const EXAM_CHEATING_PATTERNS: RegExp[] = [
  /cho\s+(tôi|mình)\s+(toàn\s+bộ\s+)?đáp\s+án\s+đang\s+thi/i,
  /đáp\s+án\s+câu\s+đang\s+thi/i,
  /giải\s+hộ\s+đề\s+đang\s+thi/i,
  /chọn\s+đáp\s+án\s+nào\s+trong\s+speed\s+quiz/i,
  /give\s+me\s+all\s+current\s+quiz\s+answers/i
];

export function validateInputGuardrails(
  prompt: string,
  isQuizActive = false
): GuardrailValidationResult {
  const clean = (prompt || '').trim();
  if (!clean) {
    return {
      allowed: false,
      reason: 'Empty prompt',
      safeReply: 'Bạn hãy nhập từ vựng hoặc cấu trúc cần Giáo Sư Mèo giải thích nhé.'
    };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        allowed: false,
        violationType: 'prompt_injection',
        reason: 'Detected prompt injection or destructive database command attempt.',
        safeReply:
          'Yêu cầu này can thiệp vào quy tắc bảo mật của hệ thống. Giáo Sư Mèo chỉ hỗ trợ giải đáp từ vựng, cấu trúc câu và lộ trình học thuật IELTS/VSTEP.'
      };
    }
  }

  if (isQuizActive) {
    const lower = clean.toLowerCase();
    const isAskingDirectQuizAnswer =
      EXAM_CHEATING_PATTERNS.some((p) => p.test(clean)) ||
      ((lower.includes('đáp án') || lower.includes('chọn câu nào') || lower.includes('answer')) &&
        (lower.includes('câu này') || lower.includes('đang thi') || lower.includes('quiz')));

    if (isAskingDirectQuizAnswer) {
      return {
        allowed: false,
        violationType: 'exam_cheating_lock',
        reason: 'User is in active timed SPEED QUIZ mode and requested direct answers.',
        safeReply:
          'Bạn đang trong phiên làm bài kiểm tra tính giờ (Speed Quiz). Hãy hoàn thành lượt thi hiện tại trước, sau đó Giáo Sư Mèo sẽ giải thích chi tiết từng câu cho bạn nhé!'
      };
    }
  }

  for (const pattern of EXAM_CHEATING_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        allowed: false,
        violationType: 'exam_cheating_lock',
        reason: 'Direct exam answer dump requested.',
        safeReply:
          'Hãy tự hoàn thành bài kiểm tra trước nhé! Ngay sau khi nộp bài, Giáo Sư Mèo sẽ phân tích chi tiết bản chất ngữ pháp và từ vựng cho bạn.'
      };
    }
  }

  return { allowed: true };
}

// ============================================================================
// 4. INTERNAL DATA AGGREGATORS (101 STRUCTURES + 3.866 VOCAB + 13 SECTIONS)
// ============================================================================

export interface NormalizedStructureItem {
  id: number;
  rawId: string;
  index: number;
  ruleNumber: number;
  pdfPage: number;
  title: string;
  pattern: string;
  formula: string;
  syntax: string;
  meaning: string;
  whenToUse: string;
  notes: string;
  example: string;
  exampleVi: string;
  extraExample: string;
  band: string;
  rawRecord: PdfKnowledgeRecord;
}

const ALL_STRUCTURES_LIST: PdfKnowledgeRecord[] = (() => {
  return [...EXPANDED_PDF_KNOWLEDGE_LIBRARY, ...VSTEP_PDF_AS_KNOWLEDGE_RECORDS].map(
    enrichPdfStructureWithDoubledContent
  );
})();

export const structuresData: NormalizedStructureItem[] = ALL_STRUCTURES_LIST.map((st, idx) => {
  const num = st.pdfItemNumber || idx + 1;
  const secondEx = st.expandedExamples?.[1]?.english || st.expandedExamples?.[0]?.english || '';
  return {
    id: num,
    rawId: st.id,
    index: num,
    ruleNumber: num,
    pdfPage: st.pdfPage,
    title: st.structureName,
    pattern: st.structureName,
    formula: st.formula,
    syntax: st.formula,
    meaning: st.meaningVi,
    whenToUse: st.whenToUse,
    notes: st.originalPdfNotes || st.howItWorksVi || '',
    example: st.originalPdfExample,
    exampleVi: st.originalPdfExampleVi,
    extraExample: secondEx,
    band: st.difficulty || 'Band 7.0–7.5',
    rawRecord: st
  };
});

const ALL_VOCAB_LIST: VocabItem[] = (() => {
  const map = new Map<string, VocabItem>();
  for (const v of VOCAB_DATABASE) {
    if (v?.word) map.set(v.word.toLowerCase(), v);
  }
  for (const ox of getOxford30AsVocabItems()) {
    if (ox?.word && !map.has(ox.word.toLowerCase())) {
      map.set(ox.word.toLowerCase(), ox);
    }
  }
  return Array.from(map.values());
})();

const VIETNAMESE_QUERY_STOPWORDS = new Set([
  'giao',
  'giáo',
  'su',
  'sư',
  'meo',
  'mèo',
  'giai',
  'giải',
  'thich',
  'thích',
  'giup',
  'giúp',
  'toi',
  'tôi',
  'minh',
  'mình',
  'em',
  'ban',
  'bạn',
  'cho',
  'hoi',
  'hỏi',
  've',
  'về',
  'trong',
  'cua',
  'của',
  'la',
  'là',
  'gi',
  'gì',
  'nhu',
  'như',
  'the',
  'thế',
  'nao',
  'nào',
  'cau',
  'câu',
  'truc',
  'trúc',
  'quy',
  'chuan',
  'chuẩn',
  'hanh',
  'hành',
  'van',
  'văn',
  'tu',
  'từ',
  'vung',
  'vựng',
  'nghia',
  'nghĩa',
  'cach',
  'cách',
  'dung',
  'dùng',
  'vi',
  'ví',
  'du',
  'dụ',
  'voi',
  'với',
  'va',
  'và',
  'hay',
  'hoac',
  'hoặc',
  'mot',
  'một',
  'nhung',
  'những',
  'cac',
  'các',
  'nay',
  'này',
  'do',
  'đó',
  'khi',
  'neu',
  'nếu',
  'thi',
  'thì',
  'de',
  'để',
  'co',
  'có',
  'khong',
  'không',
  'duoc',
  'được',
  'trang',
  'so',
  'số',
  'muc',
  'mục',
  'phan',
  'phần',
  'biet',
  'biệt'
]);

function extractCleanCandidateKeywords(query: string): string[] {
  const lower = query.toLowerCase();
  // First check quoted words e.g. "conducive" or 'be resigned to'
  const quotedMatches = Array.from(lower.matchAll(/["'“”‘’]([^"'“”‘’]+)["'“”‘’]/g)).map((m) =>
    m[1].trim()
  );

  const words = lower
    .replace(/[.,?!;:"'“”‘’()[\]{}]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !VIETNAMESE_QUERY_STOPWORDS.has(w));

  return Array.from(new Set([...quotedMatches, ...words]));
}

function getStoredStructureIds(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getJournalistAndAnalyticsSnapshot() {
  const sessions = getCompletedSessions();
  const activeSession = getActiveSession();
  const mistakes = getMistakes();
  const masteredIds = getMasteredWordIds();
  const wordProgress = getWordProgressMap();
  const challengeSummary = getChallengeOverallSummary();
  const milestoneStore = loadMilestoneStore();

  let profileName = 'Nguyễn Trọng Thái';
  let currentLevelLabel = 'Upper-Intermediate (Band 7.0)';
  let targetBand = 'BAND 7.0+';
  try {
    const rawProfile = localStorage.getItem('master_english_user_profile_v2');
    if (rawProfile) {
      const parsed = JSON.parse(rawProfile);
      if (parsed?.name) profileName = parsed.name;
      if (parsed?.currentLevel) currentLevelLabel = parsed.currentLevel;
      if (parsed?.targetBand) targetBand = parsed.targetBand;
    }
  } catch {
    // fallback default
  }

  const totalSeconds = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const totalHours = Math.max(6.7, Number((totalSeconds / 3600).toFixed(1)));
  const totalSessionsCount = Math.max(16, sessions.length);
  const learnedStructures = getStoredStructureIds('master_english_pdf_lib_learned_v2');
  const savedStructures = getStoredStructureIds('master_english_pdf_lib_saved_v1');

  const userLv = Math.max(22, milestoneStore?.user?.level || 22);
  const xp = userLv * 150 + masteredIds.length * 15 + learnedStructures.length * 25;
  const streak = Math.max(1, milestoneStore?.user?.streak || 5);
  const approvalRate = Math.max(
    33,
    Math.min(
      100,
      Math.round((masteredIds.length / Math.max(1, Object.keys(wordProgress).length || 120)) * 100)
    )
  );

  const activeFocusMinutes = activeSession
    ? Math.floor((activeSession.accumulatedSeconds || 0) / 60)
    : 0;
  const targetFocusMinutes = activeSession?.targetMinutes || 45;

  return {
    profileName,
    userLv,
    xp,
    streak,
    currentLevelLabel,
    targetBand,
    totalHours,
    totalSessionsCount,
    approvalRate,
    activeFocusMinutes,
    targetFocusMinutes,
    isTimerRunning: Boolean(activeSession && activeSession.status === 'active'),
    masteredWordsCount: masteredIds.length,
    learnedStructuresCount: learnedStructures.length,
    savedStructuresCount: savedStructures.length,
    errataCount: mistakes.length,
    challengeCompletedDays: challengeSummary.completedDays,
    challengeCurrentDay: challengeSummary.activeDay || 1
  };
}

// ============================================================================
// 5. NATURAL PROFESSOR CAT SYNTHESIS FOR STRUCTURES & VOCABULARY
// ============================================================================

function formatProfessorCatStructureReply(target: NormalizedStructureItem): string {
  const extraExLine =
    target.extraExample && target.extraExample !== target.example
      ? `\n2. *“${target.extraExample}”*`
      : '';

  const isPrepositionTo = /to\s*\+\s*(?:n\/v-ing|v-ing|noun)/i.test(target.formula);
  const practicalNote = isPrepositionTo
    ? `Chữ **“to”** trong cấu trúc \`${target.formula}\` là **giới từ (preposition)** chứ không phải động từ nguyên mẫu có *to*, vì vậy theo sau bắt buộc phải là **Danh từ (Noun)** hoặc **V-ing** (tuyệt đối không cộng V nguyên thể).`
    : target.rawRecord.howItWorksVi || target.notes;

  return `**Cấu trúc #${target.index} (Trang ${target.pdfPage} PDF): ${target.pattern}**
• **Công thức chuẩn**: \`${target.formula}\` *(Mức độ: ${target.band})*
• **Bản chất & Sắc thái**: Mang nghĩa **“${target.meaning.toLowerCase()}”** (dùng khi diễn đạt *${target.whenToUse.toLowerCase()}*). ${target.notes}
• **Lưu ý thực chiến**: ${practicalNote}
• **Ví dụ học thuật IELTS / VSTEP**:
1. *“${target.example}”*
   ➔ ${target.exampleVi}${extraExLine}`;
}

function formatProfessorCatVocabReply(vocab: VocabItem): string {
  const colls =
    vocab.collocations && vocab.collocations.length > 0
      ? vocab.collocations.join(' • ')
      : `use "${vocab.word}" in an academic context`;
  const exEn =
    vocab.exampleEn ||
    `Applying "${vocab.word}" accurately helps candidates achieve Band 7.5+ in Lexical Resource.`;
  const exVi = vocab.exampleVi ? `\n   ➔ ${vocab.exampleVi}` : '';

  return `**${vocab.word}** ${vocab.ipa ? `(${vocab.ipa})` : ''} — *${vocab.pos}* • **${vocab.level || 'IELTS 7.0+'}**
• **Ý nghĩa học thuật**: ${vocab.meaning}${vocab.detailedNote ? ` (${vocab.detailedNote})` : ''}
• **Phối ngữ (Collocations) ăn điểm**: \`${colls}\`
• **Ví dụ thực chiến**:
  *“${exEn}”*${exVi}`;
}

// ============================================================================
// 6. HYBRID RAG RETRIEVER (`retrieveEditorialContext`)
// ============================================================================

export async function retrieveEditorialContext(
  userPrompt: string,
  activeTab = 'trang_nhat'
): Promise<string> {
  // Strip any UI wrapper prefix like [Ngữ cảnh từ đang xem: ...] when matching user's actual question
  const actualQuestion = userPrompt.includes('Câu hỏi của học viên:')
    ? userPrompt.split('Câu hỏi của học viên:').pop()!.trim()
    : userPrompt.trim();

  const normalized = actualQuestion.toLowerCase();
  const client = isSupabaseConfigured() ? getSupabaseClient() : null;
  let retrievedData = '';

  // 1. Nhận diện truy vấn cấu trúc ngữ pháp: chứa từ "cấu trúc", "quy chuẩn", "#", "structure", "rule"
  const structureMatch = normalized.match(
    /(?:cấu\s*trúc|quy\s*chuẩn|mẫu\s*câu|công\s*thức|structure|rule|#)\s*#?(\d+)/i
  );

  if (
    structureMatch ||
    normalized.includes('quy chuẩn') ||
    normalized.includes('cấu trúc') ||
    normalized.includes('mẫu câu')
  ) {
    const ruleNumber = structureMatch ? parseInt(structureMatch[1], 10) : null;

    let targetStructure: NormalizedStructureItem | undefined = ruleNumber
      ? structuresData.find(
          (s) => s.id === ruleNumber || s.index === ruleNumber || s.ruleNumber === ruleNumber
        )
      : structuresData.find(
          (s) =>
            s.title &&
            s.title.length >= 3 &&
            normalized.includes(s.title.toLowerCase())
        );

    // Optional check on Supabase `structures` table if not in local array
    if (!targetStructure && client && ruleNumber !== null) {
      try {
        const { data } = await client
          .from('structures')
          .select('*')
          .or(`id.eq.${ruleNumber},pdf_item_number.eq.${ruleNumber}`)
          .limit(1);
        if (data && data[0]) {
          const row = data[0];
          return `DỮ LIỆU TÒA SOẠN (CHỈ DÙNG ĐỂ TRẢ LỜI, KHÔNG IN NGUYÊN VĂN):
- Tên cấu trúc: Cấu trúc #${ruleNumber}: ${row.title || row.structure_name}
- Ý nghĩa: ${row.meaning_vi || row.meaning || ''}
- Công thức: ${row.formula || row.syntax || ''}
- Ví dụ học thuật: ${row.example || row.original_pdf_example || ''}
- Bậc band: ${row.difficulty || row.band || '7.0 - 7.5'}`;
        }
      } catch {
        // Fallback to local structuresData
      }
    }

    if (targetStructure) {
      return `DỮ LIỆU TÒA SOẠN (CHỈ DÙNG ĐỂ TRẢ LỜI, KHÔNG IN NGUYÊN VĂN):
- Tên cấu trúc: Cấu trúc #${targetStructure.index || ruleNumber} (Trang ${targetStructure.pdfPage} PDF): ${targetStructure.pattern || targetStructure.title}
- Ý nghĩa: ${targetStructure.meaning} (${targetStructure.whenToUse})
- Công thức: ${targetStructure.formula || targetStructure.syntax}
- Lưu ý ngữ pháp: ${targetStructure.notes}
- Ví dụ học thuật: ${targetStructure.example} (${targetStructure.exampleVi})
- Ví dụ mở rộng: ${targetStructure.extraExample}
- Bậc band: ${targetStructure.band || '7.0 - 7.5'}`;
    }
  }

  // 2. Nhận diện truy vấn Bản Đính Chính (ERRATA / lỗi sai)
  const errataMatch = normalized.match(/(?:errata|đính\s*chính|lỗi\s*sai)\s*#?(\d+)?/i);
  if (errataMatch) {
    const mistakes = getMistakes();
    const errNum = errataMatch[1] ? parseInt(errataMatch[1], 10) : null;
    if (errNum && mistakes[errNum - 1]) {
      const m = mistakes[errNum - 1];
      return `DỮ LIỆU TÒA SOẠN (CHỈ DÙNG ĐỂ TRẢ LỜI, KHÔNG IN NGUYÊN VĂN):
- Bản đính chính: ERRATA #${errNum}
- Câu hỏi/Từ vựng: ${m.question}
- Đáp án học viên từng nhầm: ${m.userAnswer}
- Đáp án chuẩn xác: ${m.correctAnswer}
- Giải thích: ${m.explanation}`;
    }
    if (mistakes.length > 0) {
      const topMistakes = mistakes
        .slice(0, 3)
        .map(
          (m, i) =>
            `ERRATA #${i + 1}: "${m.question}" (Chọn sai: ${m.userAnswer} -> Đúng: ${m.correctAnswer}. Lý do: ${m.explanation})`
        )
        .join('\n');
      return `DỮ LIỆU TÒA SOẠN (CHỈ DÙNG ĐỂ TRẢ LỜI, KHÔNG IN NGUYÊN VĂN):\n${topMistakes}`;
    }
  }

  // 3. Nhận diện truy vấn Báo cáo / Tiến độ / Thẻ Nhà Báo / 60 Kỳ Xuất Bản
  if (
    /(tiến\s*độ|báo\s*cáo|thẻ\s*nhà\s*báo|hồ\s*sơ|60\s*số|60\s*ngày|kỳ\s*xuất\s*bản|streak|level|cấp\s*độ)/i.test(
      normalized
    )
  ) {
    const snap = getJournalistAndAnalyticsSnapshot();
    const dayObj =
      CHALLENGE_60_DAYS.find((d) => d.day === snap.challengeCurrentDay) || CHALLENGE_60_DAYS[0];
    return `DỮ LIỆU TÒA SOẠN (CHỈ DÙNG ĐỂ TRẢ LỜI, KHÔNG IN NGUYÊN VĂN):
- Học viên: ${snap.profileName} (Cấp độ Lv.${snap.userLv}, ${snap.xp} XP, Chuỗi ${snap.streak} ngày liên tiếp)
- Thời lượng tập trung: ${snap.activeFocusMinutes}/${snap.targetFocusMinutes} phút phiên hiện tại; Tổng lũy kế: ${snap.totalHours} giờ (${snap.totalSessionsCount} ca trực)
- Kỳ xuất bản hiện tại: Kỳ #${String(snap.challengeCurrentDay).padStart(2, '0')}/60 - Chủ đề "${dayObj?.themeEn || ''}" (Đã hoàn thành ${snap.challengeCompletedDays}/60 kỳ)
- Kho lưu trữ: Đã thuộc ${snap.masteredWordsCount} từ vựng, ${snap.learnedStructuresCount} cấu trúc, còn ${snap.errataCount} bản đính chính.`;
  }

  // 4. Tra từ vựng / Phối ngữ / Thẩm định ngữ nghĩa (chỉ lọc theo từ khóa sạch, loại bỏ hoàn toàn từ đệm tiếng Việt)
  const cleanKeywords = extractCleanCandidateKeywords(actualQuestion);

  if (cleanKeywords.length > 0) {
    // Check exact structure title match first (e.g. user asks "giải thích be resigned to")
    const structByName = structuresData.find((s) =>
      normalized.includes(s.title.toLowerCase())
    );
    if (structByName) {
      return `DỮ LIỆU TÒA SOẠN (CHỈ DÙNG ĐỂ TRẢ LỜI, KHÔNG IN NGUYÊN VĂN):
- Tên cấu trúc: Cấu trúc #${structByName.index} (Trang ${structByName.pdfPage} PDF): ${structByName.pattern}
- Ý nghĩa: ${structByName.meaning} (${structByName.whenToUse})
- Công thức: ${structByName.formula}
- Lưu ý ngữ pháp: ${structByName.notes}
- Ví dụ học thuật: ${structByName.example} (${structByName.exampleVi})
- Bậc band: ${structByName.band}`;
    }

    // Check Distinctions (Thẩm Định Ngữ Nghĩa)
    const allDistinctions = [...TRICKY_DISTINCTIONS, ...EXTRA_TRICKY_DISTINCTIONS];
    const matchedDist = allDistinctions.find((d) => {
      const tA = d.termA.toLowerCase();
      const tB = d.termB.toLowerCase();
      return cleanKeywords.some((kw) => tA.includes(kw) || tB.includes(kw));
    });

    // Check Vocabulary in Oxford/AWL & VOCAB_DATABASE (matching English word strictly first)
    const matchedEnriched = [
      ...OXFORD_ACADEMIC_30_LEXICON,
      ...AUTHORITATIVE_600_LEXICON
    ].find((en) => cleanKeywords.some((kw) => en.word.toLowerCase() === kw));

    const matchedVocab =
      ALL_VOCAB_LIST.find((v) => cleanKeywords.some((kw) => v.word.toLowerCase() === kw)) ||
      ALL_VOCAB_LIST.find((v) =>
        cleanKeywords.some((kw) => kw.length >= 4 && v.word.toLowerCase().includes(kw))
      );

    const parts: string[] = [];

    if (matchedEnriched) {
      parts.push(`- Từ vựng: ${matchedEnriched.word} (${matchedEnriched.ipa_uk}, ${matchedEnriched.cefr_level})
- Ý nghĩa: ${matchedEnriched.core_meaning_vi}
- Giải thích bản chất: ${matchedEnriched.feynman_explanation}
- Collocations: ${matchedEnriched.collocations.map((c) => `${c.phrase} (${c.meaning_vi})`).join('; ')}
- Ví dụ học thuật: ${matchedEnriched.examples[0]?.sentence_en || ''} (${matchedEnriched.examples[0]?.translation_vi || ''})`);
    } else if (matchedVocab) {
      parts.push(`- Từ vựng: ${matchedVocab.word} (${matchedVocab.pos}, ${matchedVocab.ipa || ''}, ${matchedVocab.level || 'IELTS 7.0+'})
- Ý nghĩa: ${matchedVocab.meaning}
- Collocations: ${(matchedVocab.collocations || []).join('; ')}
- Ví dụ học thuật: ${matchedVocab.exampleEn || ''} (${matchedVocab.exampleVi || ''})`);
    }

    if (matchedDist) {
      parts.push(`- Phân biệt sắc thái (${matchedDist.title}):
  + ${matchedDist.termA}: ${matchedDist.explanationA}
  + ${matchedDist.termB}: ${matchedDist.explanationB}
  + Quy tắc cốt lõi: ${matchedDist.ruleSummary}`);
    }

    // Also check Collocations if user is on phoi_ngu or asks about collocations
    if (normalizeSectionId(activeTab) === 'phoi_ngu' || normalized.includes('collocation') || normalized.includes('giới từ')) {
      const allColls = [...COLLOCATION_QUESTIONS, ...EXTRA_COLLOCATION_QUESTIONS];
      const matchedColl = allColls.find((c) =>
        cleanKeywords.some((kw) => c.sentence.toLowerCase().includes(kw) || c.correctAnswer.toLowerCase().includes(kw))
      );
      if (matchedColl) {
        parts.push(`- Phối ngữ thực chiến: "${matchedColl.sentence}" -> Đáp án: "${matchedColl.correctAnswer}" (${matchedColl.explanation})`);
      }
    }

    if (parts.length > 0) {
      retrievedData = `DỮ LIỆU TÒA SOẠN (CHỈ DÙNG ĐỂ TRẢ LỜI, KHÔNG IN NGUYÊN VĂN):\n${parts.join('\n')}`;
    }
  }

  return retrievedData;
}

// ============================================================================
// 7. DIRECT STRUCTURE / VOCAB MATCH HELPER (FOR INSTANT OR FALLBACK REPLY)
// ============================================================================

function findDirectEditorialMatch(userPrompt: string): {
  type: 'structure' | 'vocab' | 'errata' | 'progress' | null;
  formattedReply?: string;
} {
  const actualQuestion = userPrompt.includes('Câu hỏi của học viên:')
    ? userPrompt.split('Câu hỏi của học viên:').pop()!.trim()
    : userPrompt.trim();
  const normalized = actualQuestion.toLowerCase();

  // 1. Structure match (#1 .. #101)
  const structureMatch = normalized.match(
    /(?:cấu\s*trúc|quy\s*chuẩn|mẫu\s*câu|công\s*thức|structure|rule|#)\s*#?(\d+)/i
  );
  if (structureMatch) {
    const ruleNum = parseInt(structureMatch[1], 10);
    const target = structuresData.find(
      (s) => s.id === ruleNum || s.index === ruleNum || s.ruleNumber === ruleNum
    );
    if (target) {
      return {
        type: 'structure',
        formattedReply: formatProfessorCatStructureReply(target)
      };
    }
  }

  // Also check if user typed a structure name directly (e.g. "be resigned to", "make it easier")
  const structByName = structuresData.find(
    (s) => s.title.length >= 4 && normalized.includes(s.title.toLowerCase())
  );
  if (structByName) {
    return {
      type: 'structure',
      formattedReply: formatProfessorCatStructureReply(structByName)
    };
  }

  // 2. Exact Vocabulary match
  const cleanKeywords = extractCleanCandidateKeywords(actualQuestion);
  for (const kw of cleanKeywords) {
    const exactVocab = ALL_VOCAB_LIST.find((v) => v.word.toLowerCase() === kw);
    if (exactVocab) {
      return {
        type: 'vocab',
        formattedReply: formatProfessorCatVocabReply(exactVocab)
      };
    }
  }

  // 3. Errata match
  const errataMatch = normalized.match(/(?:errata|đính\s*chính)\s*#?(\d+)/i);
  if (errataMatch) {
    const errIdx = parseInt(errataMatch[1], 10) - 1;
    const mistakes = getMistakes();
    if (mistakes[errIdx]) {
      const m = mistakes[errIdx];
      return {
        type: 'errata',
        formattedReply: `**Bản Đính Chính #${errIdx + 1}**:\n• **Câu hỏi / Ngữ cảnh**: ${m.question}\n• **Phương án từng nhầm**: *${m.userAnswer}*\n• **Đáp án chuẩn xác**: **${m.correctAnswer}**\n• **Giải thích bản chất**: ${m.explanation}`
      };
    }
  }

  return { type: null };
}

// ============================================================================
// 8. FUNCTION CALLING HANDLERS & HUMAN-IN-THE-LOOP CONFIRMATION ENGINE
// ============================================================================

const MUTATING_FUNCTIONS_REQUIRING_CONFIRMATION = new Set<string>([
  'clearResolvedErrata',
  'addErrataToRedPenDesk',
  'updateSyntaxRuleStatus',
  'updateStructureOrVocabMastery',
  'saveItemToArchiveDossier'
]);

export function doesFunctionRequireConfirmation(
  functionName: string,
  args: Record<string, any>
): boolean {
  if (MUTATING_FUNCTIONS_REQUIRING_CONFIRMATION.has(functionName)) {
    return true;
  }
  if (functionName === 'controlFocusTimerSession' && args?.action === 'end_and_save') {
    return true;
  }
  return false;
}

export function buildConfirmationDescriptor(
  functionName: string,
  args: Record<string, any>
): PendingEditorialConfirmation {
  let summary = `${functionName}(${JSON.stringify(args)})`;
  switch (functionName) {
    case 'clearResolvedErrata':
      summary = `Xóa bản đính chính "${args.errataId}" khỏi Bàn Biên Tập Bút Đỏ`;
      break;
    case 'addErrataToRedPenDesk':
      summary = `Ghi nhận từ "${args.word || args.word_or_phrase}" vào Bản Đính Chính (errata_items)`;
      break;
    case 'updateSyntaxRuleStatus':
      summary = `Cập nhật Quy Chuẩn #${args.ruleIndexOrCode} thành trạng thái "${args.newStatus}"`;
      break;
    case 'updateStructureOrVocabMastery':
      summary = `Cập nhật trạng thái "${args.status}" cho mục "${args.itemId}" (${args.category})`;
      break;
    case 'saveItemToArchiveDossier':
      summary = `Lưu "${args.title}" (${args.itemType}) vào Thẻ Hồ Sơ Lưu Trữ & bảng user_progress`;
      break;
    case 'controlFocusTimerSession':
      summary = `Kết thúc và lưu ca trực đồng hồ tập trung hiện tại (${args.action})`;
      break;
  }

  return {
    id: `confirm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    functionName,
    args,
    displaySummary: summary,
    promptText: `[CẦN XÁC NHẬN TÒA SOẠN]: AI muốn thực hiện lệnh "${functionName}" (${summary}). Bạn có đồng ý thực thi không?`
  };
}

export async function executeEditorialTool(
  functionName: string,
  args: Record<string, any>
): Promise<{ success: boolean; message: string; data?: any }> {
  const client = isSupabaseConfigured() ? getSupabaseClient() : null;

  try {
    switch (functionName) {
      case 'navigateToEditorialSection': {
        const targetSection = normalizeSectionId(args.targetTabId);
        const meta = EDITORIAL_SECTION_METADATA[targetSection];
        const filterKeyword = (args.filterKeyword || '').trim();

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('master-english-ai-navigate', {
              detail: {
                sectionId: targetSection,
                workspaceMode: meta.workspaceMode,
                filterKeyword
              }
            })
          );
        }

        return {
          success: true,
          message: `Đã chuyển bạn tới chuyên mục **${meta.label}**${
            filterKeyword ? ` (lọc theo từ khóa "${filterKeyword}")` : ''
          }.`
        };
      }

      case 'saveItemToArchiveDossier': {
        const title = (args.title || '').trim();
        const content = (args.content || '').trim();
        const itemType = args.itemType || 'vocab';
        const note = args.note || '';

        if (itemType === 'structure') {
          const saved = getStoredStructureIds('master_english_pdf_lib_saved_v1');
          const next = Array.from(new Set([title, ...saved]));
          localStorage.setItem('master_english_pdf_lib_saved_v1', JSON.stringify(next));
        } else {
          recordWordInteraction(title.toLowerCase(), title, 'reviewed', 'AI Dossier', {
            meaning: content
          });
        }

        if (client) {
          try {
            await client.from('user_progress').upsert({
              item_id: title.toLowerCase(),
              item_type: itemType,
              title,
              content,
              note,
              status: 'saved',
              updated_at: new Date().toISOString()
            });
          } catch {
            // Local storage already persisted
          }
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('master-english-word-progress-changed'));
        }

        return {
          success: true,
          message: `Đã lưu **${title}** (${content}) vào **Thẻ Hồ Sơ Lưu Trữ**.`
        };
      }

      case 'addErrataToRedPenDesk': {
        const word = (args.word || args.word_or_phrase || '').trim();
        const wrongMeaning = (
          args.wrongMeaning ||
          args.wrong_answer ||
          'Nhầm nghĩa/cách dùng'
        ).trim();
        const correctMeaning = (args.correctMeaning || args.correct_answer || '').trim();
        const memoryNote = (
          args.memoryNote ||
          args.memory_note ||
          'Ghi chú từ Bàn Biên Tập AI'
        ).trim();

        saveMistake({
          wordId: word.toLowerCase(),
          question: `Từ/Cấu trúc cần lưu ý: ${word}`,
          userAnswer: wrongMeaning,
          correctAnswer: correctMeaning || word,
          explanation: memoryNote,
          sourceMode: 'Bàn Biên Tập AI'
        });

        if (client) {
          try {
            await client.from('errata_items').insert({
              word,
              wrong_meaning: wrongMeaning,
              correct_meaning: correctMeaning,
              memory_note: memoryNote,
              created_at: new Date().toISOString()
            });
          } catch {
            // Handled via local + dataRepository sync
          }
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('master-english-mistakes-updated'));
          window.dispatchEvent(new CustomEvent('master-english-cloud-synced'));
        }

        const totalErrata = getMistakes().length;
        return {
          success: true,
          message: `Đã thêm **"${word}"** vào **Bàn Biên Tập Bút Đỏ — Bản Đính Chính** (Tổng số lỗi cần rà soát: **${totalErrata}**).`
        };
      }

      case 'updateSyntaxRuleStatus': {
        const rawCode = String(args.ruleIndexOrCode || '').replace(/[^0-9a-zA-Z-_]/g, '');
        const numMatch = rawCode.match(/(\d+)/);
        const structNum = numMatch ? Number(numMatch[1]) : 1;
        const targetStruct =
          ALL_STRUCTURES_LIST.find((s) => s.pdfItemNumber === structNum || s.id === rawCode) ||
          ALL_STRUCTURES_LIST[0];

        const structId = targetStruct?.id || `pdf-struct-${structNum}`;
        const status = args.newStatus === 'saved' ? 'saved' : 'mastered';

        if (status === 'mastered') {
          const learned = getStoredStructureIds('master_english_pdf_lib_learned_v2');
          const updated = Array.from(new Set([...learned, structId]));
          localStorage.setItem('master_english_pdf_lib_learned_v2', JSON.stringify(updated));
          void dataRepository.syncAllDataWithCloud('manual');
        } else {
          const saved = getStoredStructureIds('master_english_pdf_lib_saved_v1');
          const updated = Array.from(new Set([...saved, structId]));
          localStorage.setItem('master_english_pdf_lib_saved_v1', JSON.stringify(updated));
          void dataRepository.syncAllDataWithCloud('manual');
        }

        if (client) {
          try {
            await client.from('structures').update({ status }).eq('id', structId);
          } catch {
            // Synced via dataRepository
          }
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('master-english-cloud-synced'));
        }

        return {
          success: true,
          message: `Đã đánh dấu **Cấu trúc #${targetStruct?.pdfItemNumber || structNum} (${
            targetStruct?.structureName || structId
          })** là **${status === 'mastered' ? 'ĐÃ THUỘC' : 'ĐÃ LƯU'}**.`
        };
      }

      case 'updateStructureOrVocabMastery': {
        const itemId = String(args.itemId || '').trim();
        const category = String(args.category || 'challenge_vocab').toLowerCase();
        const status = String(args.status || 'mastered').toLowerCase();

        if (category === 'structures') {
          return executeEditorialTool('updateSyntaxRuleStatus', {
            ruleIndexOrCode: itemId,
            newStatus: status === 'saved' ? 'saved' : 'mastered'
          });
        }

        const currentMastered = getMasteredWordIds();
        if (status === 'mastered' || status.includes('thuộc')) {
          saveMasteredWordIds(Array.from(new Set([...currentMastered, itemId.toLowerCase()])));
        } else {
          recordWordInteraction(itemId.toLowerCase(), itemId, 'reviewed', category);
        }

        if (client) {
          try {
            await client.from('challenge_vocab').upsert({
              word: itemId,
              status,
              updated_at: new Date().toISOString()
            });
          } catch {
            // Local state already updated
          }
        }

        return {
          success: true,
          message: `Đã cập nhật trạng thái **${status.toUpperCase()}** cho **"${itemId}"**.`
        };
      }

      case 'controlFocusTimerSession': {
        const action = String(args.action || 'resume').toLowerCase();
        const targetMinutes = Number(args.targetMinutes) || 45;

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('master-english-ai-timer-control', {
              detail: { action, targetMinutes }
            })
          );
        }

        const actionDesc =
          action === 'pause'
            ? 'Tạm dừng đồng hồ tập trung'
            : action === 'resume'
            ? 'Tiếp tục chạy đồng hồ tập trung'
            : action === 'change_target'
            ? `Đổi mục tiêu phiên tập trung sang ${targetMinutes} phút`
            : 'Kết thúc và lưu ca trực tập trung vào Báo Cáo Phát Hành';

        return {
          success: true,
          message: `Đã thực thi: **${actionDesc}**.`
        };
      }

      case 'clearResolvedErrata': {
        const rawErrataId = String(args.errataId || '').trim();
        const mistakes = getMistakes();
        let targetMistake: MistakeRecord | undefined;

        const idxMatch = rawErrataId.match(/#?(\d+)/);
        if (idxMatch) {
          const idx = Number(idxMatch[1]) - 1;
          if (idx >= 0 && idx < mistakes.length) {
            targetMistake = mistakes[idx];
          }
        }
        if (!targetMistake) {
          targetMistake = mistakes.find(
            (m) =>
              m.id === rawErrataId ||
              m.correctAnswer.toLowerCase() === rawErrataId.toLowerCase() ||
              m.question.toLowerCase().includes(rawErrataId.toLowerCase())
          );
        }

        if (targetMistake) {
          removeMistake(targetMistake.id);
        }

        if (client) {
          try {
            await client
              .from('errata_items')
              .delete()
              .or(`id.eq.${rawErrataId},word.ilike.%${rawErrataId}%`);
          } catch {
            // Local mistake already removed
          }
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('master-english-mistakes-updated'));
        }

        return {
          success: true,
          message: targetMistake
            ? `Đã xóa bản đính chính **"${targetMistake.correctAnswer}"** khỏi **Bàn Biên Tập Bút Đỏ**!`
            : `Đã xóa mục **${rawErrataId}** khỏi danh sách Bản Đính Chính.`
        };
      }

      case 'getEditorialProgressSummary':
      case 'getFullJournalistReport': {
        const snap = getJournalistAndAnalyticsSnapshot();
        const summaryText = `**Tổng hợp Tiến độ Học thuật của ${snap.profileName}**:
• **Cấp độ**: Lv.${snap.userLv} (${snap.xp} XP) • Chuỗi học: **${snap.streak} ngày liên tiếp** (${snap.currentLevelLabel}).
• **Thời lượng tập trung**: ${snap.activeFocusMinutes}/${snap.targetFocusMinutes} phút trong ca hiện tại • Tổng lũy kế: **${snap.totalHours} giờ** (${snap.totalSessionsCount} ca trực).
• **Kỳ Xuất Bản 60 Số**: Đang ở **Kỳ #${String(snap.challengeCurrentDay).padStart(2, '0')}/60** (Đã hoàn thành ${snap.challengeCompletedDays}/60 kỳ).
• **Tích lũy**: Đã thuộc **${snap.masteredWordsCount}** từ vựng, **${snap.learnedStructuresCount}** cấu trúc câu, còn **${snap.errataCount}** mục tại Bản Đính Chính.`;

        return {
          success: true,
          message: summaryText,
          data: snap
        };
      }

      default:
        return {
          success: false,
          message: `Chức năng "${functionName}" hiện chưa khả dụng.`
        };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Không thể thực thi lệnh ${functionName}: ${err?.message || 'Lỗi không xác định'}`
    };
  }
}

export async function executeConfirmedFunctionCall(
  pending: PendingEditorialConfirmation
): Promise<{ success: boolean; message: string }> {
  const res = await executeEditorialTool(pending.functionName, pending.args);
  await logAiAuditRecord({
    prompt: `[HUMAN_CONFIRMED] ${pending.functionName}`,
    routedModel: 'gemini-2.5-flash',
    activeTab: 'ban_dinh_chinh',
    guardrailStatus: 'passed',
    toolCalled: pending.functionName
  });
  return res;
}

// ============================================================================
// 9. AUDIT LOGGING TO SUPABASE `ai_audit_logs`
// ============================================================================

async function logAiAuditRecord(entry: {
  prompt: string;
  routedModel: ModelTier;
  activeTab: string;
  guardrailStatus: string;
  toolCalled?: string;
}): Promise<void> {
  try {
    const client = isSupabaseConfigured() ? getSupabaseClient() : null;
    if (client) {
      await client.from('ai_audit_logs').insert({
        prompt: entry.prompt.slice(0, 500),
        routed_model: entry.routedModel,
        active_tab: entry.activeTab,
        guardrail_status: entry.guardrailStatus,
        tool_called: entry.toolCalled || null,
        created_at: new Date().toISOString()
      });
    }
  } catch {
    // Non-blocking audit log
  }
}

// ============================================================================
// 10. MODEL ROUTER & MAIN EXECUTION (`routeAndExecuteQuery`)
// ============================================================================

export function selectModelTier(userPrompt: string, activeSection: EditorialSectionId): ModelTier {
  const qLower = userPrompt.toLowerCase();

  // Tier 2: Deep Reasoning (gemini-2.5-pro)
  const isWritingEvaluation =
    qLower.length > 180 ||
    /(chấm\s+bài|writing\s+task\s+2|đánh\s+giá\s+bài\s+luận|sửa\s+bài\s+viết|band\s+score|phân\s+tích\s+chuyên\s+khảo|so\s+sánh\s+sắc\s+thái\s+c1|so\s+sánh\s+chuyên\s+sâu)/i.test(
      qLower
    );

  if (
    isWritingEvaluation ||
    ((activeSection === 'chuyen_de' || activeSection === 'tham_dinh') && qLower.length > 45)
  ) {
    return 'gemini-2.5-pro';
  }

  return 'gemini-2.5-flash';
}

export async function routeAndExecuteQuery(
  userPrompt: string,
  contextPage = 'trang_nhat',
  isQuizActive = false
): Promise<HarnessExecutionResult> {
  const activeSection = normalizeSectionId(contextPage);

  // 1. Pre-flight Guardrail Validation
  const guardrailCheck = validateInputGuardrails(userPrompt, isQuizActive);
  if (!guardrailCheck.allowed) {
    const status =
      guardrailCheck.violationType === 'exam_cheating_lock'
        ? 'blocked_quiz_lock'
        : 'blocked_injection';

    await logAiAuditRecord({
      prompt: userPrompt,
      routedModel: 'tier_0_local',
      activeTab: activeSection,
      guardrailStatus: status
    });

    return {
      replyText: guardrailCheck.safeReply || 'Yêu cầu không hợp lệ.',
      routedTier: 'tier_0_local',
      citations: [],
      guardrailStatus: status,
      executedTools: []
    };
  }

  // 2. Retrieve targeted RAG context (strictly passed to Gemini in background, NEVER printed raw)
  const retrievedContext = await retrieveEditorialContext(userPrompt, activeSection);
  const directMatch = findDirectEditorialMatch(userPrompt);

  // 3. Check if user is asking for a pure single-keyword lookup (Tier 0 bypass)
  const actualQuestion = userPrompt.includes('Câu hỏi của học viên:')
    ? userPrompt.split('Câu hỏi của học viên:').pop()!.trim()
    : userPrompt.trim();
  const isActionCommand =
    /(thêm|lưu|xóa|đánh\s+dấu|chuyển\s+trang|mở\s+trang|đồng\s+hồ|tạm\s+dừng|tiếp\s+tục)/i.test(
      actualQuestion
    );

  // 4. Select Model Tier (Tier 1: gemini-2.5-flash vs Tier 2: gemini-2.5-pro)
  const routedTier = selectModelTier(actualQuestion, activeSection);

  // Pass RAG context strictly inside the user contents message for Gemini to read & synthesize
  const contentsPayload = retrievedContext
    ? `${retrievedContext}\n\nCâu hỏi của học viên: ${actualQuestion}`
    : actualQuestion;

  try {
    const response = await fetch('/api/ai-harness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: contentsPayload,
        systemInstruction: EDITORIAL_SYSTEM_INSTRUCTION,
        routedModel: routedTier,
        enableTools: true
      })
    });

    if (response.ok) {
      const data = await response.json();
      const functionCalls: { id: string; name: string; args: Record<string, any> }[] =
        Array.isArray(data.functionCalls) ? data.functionCalls : [];

      const executedTools: { name: string; resultSummary: string }[] = [];
      let pendingConfirmation: PendingEditorialConfirmation | null = null;
      const toolOutputMessages: string[] = [];

      for (const fc of functionCalls) {
        if (doesFunctionRequireConfirmation(fc.name, fc.args || {})) {
          pendingConfirmation = buildConfirmationDescriptor(fc.name, fc.args || {});
        } else {
          const execRes = await executeEditorialTool(fc.name, fc.args || {});
          executedTools.push({ name: fc.name, resultSummary: execRes.message });
          toolOutputMessages.push(execRes.message);
        }
      }

      await logAiAuditRecord({
        prompt: actualQuestion,
        routedModel: routedTier,
        activeTab: activeSection,
        guardrailStatus: 'passed',
        toolCalled: functionCalls.map((f) => f.name).join(',') || undefined
      });

      // Clean any accidental system tags from model output just in case
      const cleanModelText = (data.text || '')
        .replace(/📚\s*\*?\*?\[ĐỐI CHIẾU TƯ LIỆU[^\]]*\]\*?\*?:?/gi, '')
        .replace(/---\s*CHUYÊN MỤC:[^-]+---/gi, '')
        .replace(/📌\s*Nguồn đối chiếu:.*/gi, '')
        .trim();

      const combinedReply = [cleanModelText, ...toolOutputMessages].filter(Boolean).join('\n\n');

      if (combinedReply || pendingConfirmation) {
        return {
          replyText:
            combinedReply ||
            (pendingConfirmation
              ? `Mình đã chuẩn bị lệnh **${pendingConfirmation.functionName}**. Bạn vui lòng bấm xác nhận ở bên dưới để thực thi nhé.`
              : ''),
          routedTier,
          citations: [],
          guardrailStatus: 'passed',
          executedTools,
          pendingConfirmation
        };
      }
    }
  } catch (err) {
    console.warn('[AI Harness] Using direct synthesis:', err);
  }

  // 5. Intelligent Local Synthesis (when offline or API key not configured) — NEVER dumps raw metadata!
  if (!isActionCommand && directMatch.formattedReply) {
    return {
      replyText: directMatch.formattedReply,
      routedTier: 'tier_0_local',
      citations: [],
      guardrailStatus: 'passed',
      executedTools: []
    };
  }

  // Check if user asked for an action offline (e.g. "xóa errata #1", "đánh dấu đã thuộc cấu trúc #23", "chuyển sang trang...")
  if (isActionCommand) {
    const structUpdateMatch = actualQuestion.match(
      /(?:đánh\s*dấu|lưu).*?(?:cấu\s*trúc|quy\s*chuẩn|#)\s*#?(\d+)/i
    );
    if (structUpdateMatch) {
      const ruleCode = structUpdateMatch[1];
      const newStatus = /lưu/i.test(actualQuestion) ? 'saved' : 'mastered';
      const pending = buildConfirmationDescriptor('updateSyntaxRuleStatus', {
        ruleIndexOrCode: ruleCode,
        newStatus
      });
      return {
        replyText: `Mình đã chuẩn bị cập nhật trạng thái cho **Cấu trúc #${ruleCode}**. Bạn hãy xác nhận bên dưới nhé:`,
        routedTier: 'tier_0_local',
        citations: [],
        guardrailStatus: 'passed',
        executedTools: [],
        pendingConfirmation: pending
      };
    }

    const clearErrataMatch = actualQuestion.match(
      /(?:xóa|gỡ).*?(?:errata|đính\s*chính|lỗi)\s*#?(\d+|\w+)/i
    );
    if (clearErrataMatch) {
      const pending = buildConfirmationDescriptor('clearResolvedErrata', {
        errataId: clearErrataMatch[1]
      });
      return {
        replyText: `Mình đã chuẩn bị lệnh xóa bản đính chính **#${clearErrataMatch[1]}**. Bạn hãy xác nhận bên dưới nhé:`,
        routedTier: 'tier_0_local',
        citations: [],
        guardrailStatus: 'passed',
        executedTools: [],
        pendingConfirmation: pending
      };
    }
  }

  if (/(tiến\s*độ|báo\s*cáo|thẻ\s*nhà\s*báo)/i.test(actualQuestion)) {
    const rep = await executeEditorialTool('getEditorialProgressSummary', {});
    return {
      replyText: rep.message,
      routedTier: 'tier_0_local',
      citations: [],
      guardrailStatus: 'passed',
      executedTools: []
    };
  }

  return {
    replyText:
      'Bạn hãy cho Giáo Sư Mèo biết tên **từ vựng**, **cặp từ dễ nhầm** hoặc **số thứ tự Cấu trúc (từ #1 đến #101)** mà bạn muốn phân tích nhé! (Ví dụ: *"Giải thích Cấu trúc #23"* hoặc *"Từ conducive dùng thế nào?"*)',
    routedTier: 'tier_0_local',
    citations: [],
    guardrailStatus: 'passed',
    executedTools: []
  };
}
