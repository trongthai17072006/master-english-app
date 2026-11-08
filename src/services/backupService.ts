import { STORAGE_KEYS as LEARNING_KEYS, SessionRecord, ActiveSessionState, WordProgressRecord } from './learningStorage';
import { MistakeRecord, UserStats } from '../utils/storage';
import { ChallengeProgressData, DayCompletionStatus, WritingSubmissionRecord } from '../utils/challengeStorage';
import { UserProfileData } from '../context/AnalyticsContext';
import { deepNormalizeText } from '../utils/textNormalization';

export const ALL_BACKUP_STORAGE_KEYS = {
  SESSIONS_V2: LEARNING_KEYS.SESSIONS, // 'master_english_sessions_v2'
  ACTIVE_SESSION_V2: LEARNING_KEYS.ACTIVE_SESSION, // 'master_english_active_session_v2'
  WORD_PROGRESS_V2: LEARNING_KEYS.WORD_PROGRESS, // 'master_english_word_progress_v2'
  THEME_V2: LEARNING_KEYS.THEME, // 'master_english_theme_v2'
  THEME_PREF_LEGACY: LEARNING_KEYS.THEME_LEGACY, // 'master_english_theme_preference_v2'
  USER_PROFILE_V2: LEARNING_KEYS.USER_PROFILE, // 'master_english_user_profile_v2'
  MASTERED_WORDS_V1: 'leximaster_mastered_words_v1',
  MISTAKES_V1: 'leximaster_mistakes_v1',
  STATS_V1: 'leximaster_stats_v1',
  CARD_STATUS_V1: 'leximaster_card_status_v1',
  CHALLENGE_60_V1: 'ielts_60_day_challenge_state_v1',
  WORKSPACE_TODOS_V1: 'master_english_workspace_todos_v1',
  REPORT_RECIPIENT_V1: 'master_english_report_recipient_v1',
  PDF_LIB_SAVED_V1: 'master_english_pdf_lib_saved_v1',
  PDF_LIB_LEARNED_V2: 'master_english_pdf_lib_learned_v2',
  PDF_LIB_ACTIVE_V2: 'master_english_pdf_lib_active_v2',
  PDF_LIB_NOTES_V1: 'master_english_pdf_lib_notes_v1',
  CUSTOM_CONTENT_V1: 'master_english_custom_content_v1',
  ACTIVE_CHALLENGE_DAY_V1: 'master_english_active_challenge_day_v1',
  USER_WRITING_LOGS_V1: 'user_writing_logs_v1',
  VSTEP_PDF_BANK_PROGRESS_V1: 'master_english_vstep_pdf_bank_progress_v1',
} as const;

export const BACKUP_META_STORAGE_KEY = 'master_english_last_backup_meta_v1';
export const PRE_RESTORE_SNAPSHOT_KEY = 'master_english_pre_restore_snapshot_v1';

export interface WorkspaceTodoItem {
  id: number;
  text: string;
  date: string;
  done: boolean;
}

export interface PdfCustomSentenceNote {
  id: string;
  structureId: string;
  sentence: string;
  createdAt: string;
}

export interface BackupDataSummary {
  completedSessionsCount: number;
  totalStudySeconds: number;
  totalStudyMinutes: number;
  hasActiveSession: boolean;
  wordProgressCount: number;
  masteredWordsCount: number;
  mistakesCount: number;
  quizzesTaken: number;
  challengeCompletedDaysCount: number;
  challengeWritingDraftsCount: number;
  challengeWritingSubmissionsCount: number;
  challengeMasteredVocabCount: number;
  workspaceTodosCount: number;
  pdfStructuresLearnedCount: number;
  pdfStructuresSavedCount: number;
  pdfStructuresNotesCount: number;
  pdfActiveStructureId: string;
  userEmail: string;
  userName: string;
  targetBand: string;
}

export interface MasterEnglishBackupPayload {
  app: 'MASTER_ENGLISH_IELTS';
  schemaVersion: '2.0.0';
  exportedAt: string;
  exportedAtLocal: string;
  checksum: string;
  summary: BackupDataSummary;
  storageKeysIncluded: string[];
  data: {
    master_english_sessions_v2: SessionRecord[];
    master_english_active_session_v2: ActiveSessionState | null;
    master_english_word_progress_v2: Record<string, WordProgressRecord>;
    master_english_theme_v2: string | null;
    master_english_theme_preference_v2: string | null;
    master_english_user_profile_v2: UserProfileData | null;
    leximaster_mastered_words_v1: string[];
    leximaster_mistakes_v1: MistakeRecord[];
    leximaster_stats_v1: UserStats | null;
    leximaster_card_status_v1: Record<string, any> | null;
    ielts_60_day_challenge_state_v1: ChallengeProgressData | null;
    master_english_workspace_todos_v1: WorkspaceTodoItem[];
    master_english_report_recipient_v1: string | null;
    master_english_pdf_lib_saved_v1?: string[];
    master_english_pdf_lib_learned_v2?: string[];
    master_english_pdf_lib_active_v2?: string | null;
    master_english_pdf_lib_notes_v1?: PdfCustomSentenceNote[];
    user_writing_logs_v1?: WritingSubmissionRecord[];
    master_english_vstep_pdf_bank_progress_v1?: Record<string, any> | null;
  };
  rawStorageSnapshot: Record<string, string | null>;
}

export interface LastBackupMeta {
  exportedAt: string;
  exportedAtLocal: string;
  fileName: string;
  checksum: string;
  summary: BackupDataSummary;
}

export interface BackupValidationResult {
  valid: boolean;
  error?: string;
  payload?: MasterEnglishBackupPayload;
  warnings?: string[];
}

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return deepNormalizeText(JSON.parse(raw)) as T;
  } catch {
    return fallback;
  }
}

/**
 * Deterministic FNV-1a 32-bit checksum for verifying JSON backup integrity
 */
export function computeChecksum(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return 'me-v2-' + (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Compute live summary counts from a data object (either current localStorage or an imported backup)
 */
export function computeSummaryFromData(data: MasterEnglishBackupPayload['data']): BackupDataSummary {
  const sessions = Array.isArray(data.master_english_sessions_v2) ? data.master_english_sessions_v2 : [];
  const totalStudySeconds = sessions.reduce((acc, s) => acc + (Number(s?.durationSeconds) || 0), 0);
  const totalStudyMinutes = Math.round((totalStudySeconds / 60) * 10) / 10;

  const wordProgressObj =
    data.master_english_word_progress_v2 && typeof data.master_english_word_progress_v2 === 'object'
      ? data.master_english_word_progress_v2
      : {};
  const wordProgressCount = Object.keys(wordProgressObj).length;

  const lexiMastered = Array.isArray(data.leximaster_mastered_words_v1)
    ? data.leximaster_mastered_words_v1
    : [];
  const srsMasteredCount = Object.values(wordProgressObj).filter((w) => w?.status === 'mastered').length;
  const masteredWordsCount = Math.max(lexiMastered.length, srsMasteredCount);

  const mistakes = Array.isArray(data.leximaster_mistakes_v1) ? data.leximaster_mistakes_v1 : [];
  const quizzesTaken = Number(data.leximaster_stats_v1?.quizzesTaken) || 0;

  const challenge = data.ielts_60_day_challenge_state_v1;
  const dayStatuses =
    challenge?.dayStatuses && typeof challenge.dayStatuses === 'object' ? challenge.dayStatuses : {};
  const challengeCompletedDaysCount = Object.values(dayStatuses).filter(
    (st: any) => st && (st === 'completed' || (st.vocab && st.writing && st.speaking) || Boolean(st.completedAt))
  ).length;

  const writingDrafts =
    challenge?.writingDrafts && typeof challenge.writingDrafts === 'object' ? challenge.writingDrafts : {};
  const challengeWritingDraftsCount = Object.values(writingDrafts).filter((item: any) => {
    if (typeof item === 'string') return item.trim().length > 0;
    if (item && typeof item.text === 'string') return item.text.trim().length > 0;
    return false;
  }).length;

  const writingHistory =
    challenge?.writingHistory && typeof challenge.writingHistory === 'object'
      ? challenge.writingHistory
      : {};
  const speakingHistory =
    challenge?.speakingHistory && typeof challenge.speakingHistory === 'object'
      ? challenge.speakingHistory
      : {};
  const flatLogs = Array.isArray(data.user_writing_logs_v1) ? data.user_writing_logs_v1 : [];
  const historySubmissionsCount =
    Object.values(writingHistory).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0) +
    Object.values(speakingHistory).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
  const challengeWritingSubmissionsCount = Math.max(historySubmissionsCount, flatLogs.length);

  const challengeMasteredVocabCount = Array.isArray(challenge?.masteredVocabIds)
    ? challenge!.masteredVocabIds.length
    : 0;

  const todos = Array.isArray(data.master_english_workspace_todos_v1)
    ? data.master_english_workspace_todos_v1
    : [];

  const pdfLearned = Array.isArray(data.master_english_pdf_lib_learned_v2)
    ? data.master_english_pdf_lib_learned_v2
    : [];
  const pdfSaved = Array.isArray(data.master_english_pdf_lib_saved_v1)
    ? data.master_english_pdf_lib_saved_v1
    : [];
  const pdfNotes = Array.isArray(data.master_english_pdf_lib_notes_v1)
    ? data.master_english_pdf_lib_notes_v1
    : [];
  const pdfActive = data.master_english_pdf_lib_active_v2 || 'pdf-item-1';

  return {
    completedSessionsCount: sessions.length,
    totalStudySeconds,
    totalStudyMinutes,
    hasActiveSession: Boolean(data.master_english_active_session_v2),
    wordProgressCount,
    masteredWordsCount,
    mistakesCount: mistakes.length,
    quizzesTaken,
    challengeCompletedDaysCount,
    challengeWritingDraftsCount,
    challengeWritingSubmissionsCount,
    challengeMasteredVocabCount,
    workspaceTodosCount: todos.length,
    pdfStructuresLearnedCount: pdfLearned.length,
    pdfStructuresSavedCount: pdfSaved.length,
    pdfStructuresNotesCount: pdfNotes.length,
    pdfActiveStructureId: pdfActive,
    userEmail: data.master_english_user_profile_v2?.email || '',
    userName: data.master_english_user_profile_v2?.name || 'Học viên IELTS',
    targetBand: data.master_english_user_profile_v2?.targetBand || 'BAND 7.0+',
  };
}

/**
 * Read all localStorage keys without modifying anything
 */
export function collectCurrentLocalData(): {
  data: MasterEnglishBackupPayload['data'];
  rawStorageSnapshot: Record<string, string | null>;
} {
  const rawStorageSnapshot: Record<string, string | null> = {};
  Object.values(ALL_BACKUP_STORAGE_KEYS).forEach((key) => {
    try {
      rawStorageSnapshot[key] = localStorage.getItem(key);
    } catch {
      rawStorageSnapshot[key] = null;
    }
  });

  const data: MasterEnglishBackupPayload['data'] = {
    master_english_sessions_v2: safeParseJson<SessionRecord[]>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.SESSIONS_V2],
      []
    ),
    master_english_active_session_v2: safeParseJson<ActiveSessionState | null>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.ACTIVE_SESSION_V2],
      null
    ),
    master_english_word_progress_v2: safeParseJson<Record<string, WordProgressRecord>>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.WORD_PROGRESS_V2],
      {}
    ),
    master_english_theme_v2: rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.THEME_V2],
    master_english_theme_preference_v2: rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.THEME_PREF_LEGACY],
    master_english_user_profile_v2: safeParseJson<UserProfileData | null>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.USER_PROFILE_V2],
      null
    ),
    leximaster_mastered_words_v1: safeParseJson<string[]>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.MASTERED_WORDS_V1],
      []
    ),
    leximaster_mistakes_v1: safeParseJson<MistakeRecord[]>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.MISTAKES_V1],
      []
    ),
    leximaster_stats_v1: safeParseJson<UserStats | null>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.STATS_V1],
      null
    ),
    leximaster_card_status_v1: safeParseJson<Record<string, any> | null>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.CARD_STATUS_V1],
      null
    ),
    ielts_60_day_challenge_state_v1: safeParseJson<ChallengeProgressData | null>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.CHALLENGE_60_V1],
      null
    ),
    master_english_workspace_todos_v1: safeParseJson<WorkspaceTodoItem[]>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.WORKSPACE_TODOS_V1],
      []
    ),
    master_english_report_recipient_v1: rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.REPORT_RECIPIENT_V1],
    master_english_pdf_lib_saved_v1: safeParseJson<string[]>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.PDF_LIB_SAVED_V1],
      []
    ),
    master_english_pdf_lib_learned_v2: safeParseJson<string[]>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.PDF_LIB_LEARNED_V2],
      []
    ),
    master_english_pdf_lib_active_v2:
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.PDF_LIB_ACTIVE_V2] || 'pdf-item-1',
    master_english_pdf_lib_notes_v1: safeParseJson<PdfCustomSentenceNote[]>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.PDF_LIB_NOTES_V1],
      []
    ),
    user_writing_logs_v1: safeParseJson<WritingSubmissionRecord[]>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.USER_WRITING_LOGS_V1],
      []
    ),
    master_english_vstep_pdf_bank_progress_v1: safeParseJson<Record<string, any> | null>(
      rawStorageSnapshot[ALL_BACKUP_STORAGE_KEYS.VSTEP_PDF_BANK_PROGRESS_V1],
      null
    ),
  };

  return { data, rawStorageSnapshot };
}

/**
 * Get live summary of current browser localStorage
 */
export function getLocalDataSummary(): BackupDataSummary {
  const { data } = collectCurrentLocalData();
  return computeSummaryFromData(data);
}

/**
 * Build full backup payload without mutating any existing learning data
 */
export function createBackupPayload(): MasterEnglishBackupPayload {
  const now = new Date();
  const { data, rawStorageSnapshot } = collectCurrentLocalData();
  const summary = computeSummaryFromData(data);
  const serializedData = JSON.stringify(data);
  const checksum = computeChecksum(serializedData);

  return {
    app: 'MASTER_ENGLISH_IELTS',
    schemaVersion: '2.0.0',
    exportedAt: now.toISOString(),
    exportedAtLocal: now.toLocaleString('vi-VN', { hour12: false }),
    checksum,
    summary,
    storageKeysIncluded: Object.values(ALL_BACKUP_STORAGE_KEYS),
    data,
    rawStorageSnapshot,
  };
}

/**
 * Trigger browser file download of the full JSON backup and record last backup metadata
 */
export function downloadBackupJson(): { fileName: string; payload: MasterEnglishBackupPayload } {
  const payload = createBackupPayload();
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');

  const fileName = `master-english-backup-${yyyy}-${mm}-${dd}-${hh}${min}.json`;
  const jsonString = JSON.stringify(payload, null, 2);

  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);

  const meta: LastBackupMeta = {
    exportedAt: payload.exportedAt,
    exportedAtLocal: payload.exportedAtLocal,
    fileName,
    checksum: payload.checksum,
    summary: payload.summary,
  };
  try {
    localStorage.setItem(BACKUP_META_STORAGE_KEY, JSON.stringify(meta));
  } catch (e) {
    console.warn('Could not save backup metadata:', e);
  }

  return { fileName, payload };
}

/**
 * Retrieve metadata about the most recent backup export
 */
export function getLastBackupMeta(): LastBackupMeta | null {
  try {
    const raw = localStorage.getItem(BACKUP_META_STORAGE_KEY);
    return safeParseJson<LastBackupMeta | null>(raw, null);
  } catch {
    return null;
  }
}

/**
 * Validate and inspect an uploaded JSON backup file without modifying localStorage
 */
export function validateBackupJson(rawText: string): BackupValidationResult {
  if (!rawText || !rawText.trim()) {
    return { valid: false, error: 'File rỗng hoặc không có nội dung.' };
  }

  let parsed: any;
  try {
    parsed = deepNormalizeText(JSON.parse(rawText));
  } catch {
    return { valid: false, error: 'File không đúng định dạng JSON hợp lệ.' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'Cấu trúc dữ liệu JSON không hợp lệ.' };
  }

  if (parsed.app !== 'MASTER_ENGLISH_IELTS' || !parsed.data || typeof parsed.data !== 'object') {
    return {
      valid: false,
      error: 'File JSON này không phải là bản sao lưu chuẩn của hệ thống MASTER English.',
    };
  }

  const warnings: string[] = [];
  const data = parsed.data as MasterEnglishBackupPayload['data'];

  if (!Array.isArray(data.master_english_sessions_v2)) {
    warnings.push('Danh sách phiên học (master_english_sessions_v2) trống hoặc sẽ được khởi tạo mặc định.');
  }
  if (!data.master_english_word_progress_v2 || typeof data.master_english_word_progress_v2 !== 'object') {
    warnings.push('Tiến độ từ vựng SRS (master_english_word_progress_v2) trống hoặc sẽ được khởi tạo mặc định.');
  }

  const normalizedData: MasterEnglishBackupPayload['data'] = {
    master_english_sessions_v2: Array.isArray(data.master_english_sessions_v2)
      ? data.master_english_sessions_v2
      : [],
    master_english_active_session_v2: data.master_english_active_session_v2 || null,
    master_english_word_progress_v2:
      data.master_english_word_progress_v2 && typeof data.master_english_word_progress_v2 === 'object'
        ? data.master_english_word_progress_v2
        : {},
    master_english_theme_v2: data.master_english_theme_v2 ?? null,
    master_english_theme_preference_v2: data.master_english_theme_preference_v2 ?? null,
    master_english_user_profile_v2: data.master_english_user_profile_v2 || null,
    leximaster_mastered_words_v1: Array.isArray(data.leximaster_mastered_words_v1)
      ? data.leximaster_mastered_words_v1
      : [],
    leximaster_mistakes_v1: Array.isArray(data.leximaster_mistakes_v1) ? data.leximaster_mistakes_v1 : [],
    leximaster_stats_v1: data.leximaster_stats_v1 || null,
    leximaster_card_status_v1: data.leximaster_card_status_v1 || null,
    ielts_60_day_challenge_state_v1: data.ielts_60_day_challenge_state_v1 || null,
    master_english_workspace_todos_v1: Array.isArray(data.master_english_workspace_todos_v1)
      ? data.master_english_workspace_todos_v1
      : [],
    master_english_report_recipient_v1: data.master_english_report_recipient_v1 ?? null,
    master_english_pdf_lib_saved_v1: Array.isArray(data.master_english_pdf_lib_saved_v1)
      ? data.master_english_pdf_lib_saved_v1
      : [],
    master_english_pdf_lib_learned_v2: Array.isArray(data.master_english_pdf_lib_learned_v2)
      ? data.master_english_pdf_lib_learned_v2
      : [],
    master_english_pdf_lib_active_v2: data.master_english_pdf_lib_active_v2 || 'pdf-item-1',
    master_english_pdf_lib_notes_v1: Array.isArray(data.master_english_pdf_lib_notes_v1)
      ? data.master_english_pdf_lib_notes_v1
      : [],
    user_writing_logs_v1: Array.isArray(data.user_writing_logs_v1)
      ? data.user_writing_logs_v1
      : [],
    master_english_vstep_pdf_bank_progress_v1: data.master_english_vstep_pdf_bank_progress_v1 || null,
  };

  const recomputedChecksum = computeChecksum(JSON.stringify(data));
  if (parsed.checksum && parsed.checksum !== recomputedChecksum) {
    warnings.push('Chữ ký checksum khác với bản gốc (có thể file đã được chỉnh sửa thủ công).');
  }

  const normalizedPayload: MasterEnglishBackupPayload = {
    app: 'MASTER_ENGLISH_IELTS',
    schemaVersion: parsed.schemaVersion || '2.0.0',
    exportedAt: parsed.exportedAt || new Date().toISOString(),
    exportedAtLocal: parsed.exportedAtLocal || 'Không rõ',
    checksum: parsed.checksum || recomputedChecksum,
    summary: computeSummaryFromData(normalizedData),
    storageKeysIncluded: Array.isArray(parsed.storageKeysIncluded)
      ? parsed.storageKeysIncluded
      : Object.values(ALL_BACKUP_STORAGE_KEYS),
    data: normalizedData,
    rawStorageSnapshot: parsed.rawStorageSnapshot || {},
  };

  return {
    valid: true,
    payload: normalizedPayload,
    warnings,
  };
}

/**
 * Restore backup payload into localStorage.
 * Always saves a pre-restore snapshot first so the user can undo if needed.
 * Supports:
 * - 'merge' (recommended): Safely merges sessions, word progress, mastered words, mistakes, 60-day challenge, and todos without losing newer local progress.
 * - 'overwrite': Exact replacement from backup file.
 */
export function restoreFromBackupPayload(
  payload: MasterEnglishBackupPayload,
  mode: 'merge' | 'overwrite' = 'merge'
): { success: boolean; message: string; updatedSummary: BackupDataSummary } {
  try {
    // 1. Save pre-restore safety snapshot
    const currentSnapshot = createBackupPayload();
    localStorage.setItem(PRE_RESTORE_SNAPSHOT_KEY, JSON.stringify(currentSnapshot));

    const current = currentSnapshot.data;
    const incoming = payload.data;

    if (mode === 'overwrite') {
      localStorage.setItem(
        ALL_BACKUP_STORAGE_KEYS.SESSIONS_V2,
        JSON.stringify(incoming.master_english_sessions_v2 || [])
      );
      if (incoming.master_english_active_session_v2) {
        localStorage.setItem(
          ALL_BACKUP_STORAGE_KEYS.ACTIVE_SESSION_V2,
          JSON.stringify(incoming.master_english_active_session_v2)
        );
      } else {
        localStorage.removeItem(ALL_BACKUP_STORAGE_KEYS.ACTIVE_SESSION_V2);
      }
      localStorage.setItem(
        ALL_BACKUP_STORAGE_KEYS.WORD_PROGRESS_V2,
        JSON.stringify(incoming.master_english_word_progress_v2 || {})
      );
      if (incoming.master_english_theme_v2) {
        localStorage.setItem(ALL_BACKUP_STORAGE_KEYS.THEME_V2, incoming.master_english_theme_v2);
      }
      if (incoming.master_english_theme_preference_v2) {
        localStorage.setItem(
          ALL_BACKUP_STORAGE_KEYS.THEME_PREF_LEGACY,
          incoming.master_english_theme_preference_v2
        );
      }
      if (incoming.master_english_user_profile_v2) {
        localStorage.setItem(
          ALL_BACKUP_STORAGE_KEYS.USER_PROFILE_V2,
          JSON.stringify(incoming.master_english_user_profile_v2)
        );
      }
      localStorage.setItem(
        ALL_BACKUP_STORAGE_KEYS.MASTERED_WORDS_V1,
        JSON.stringify(incoming.leximaster_mastered_words_v1 || [])
      );
      localStorage.setItem(
        ALL_BACKUP_STORAGE_KEYS.MISTAKES_V1,
        JSON.stringify(incoming.leximaster_mistakes_v1 || [])
      );
      if (incoming.leximaster_stats_v1) {
        localStorage.setItem(
          ALL_BACKUP_STORAGE_KEYS.STATS_V1,
          JSON.stringify(incoming.leximaster_stats_v1)
        );
      }
      if (incoming.leximaster_card_status_v1) {
        localStorage.setItem(
          ALL_BACKUP_STORAGE_KEYS.CARD_STATUS_V1,
          JSON.stringify(incoming.leximaster_card_status_v1)
        );
      }
      if (incoming.ielts_60_day_challenge_state_v1) {
        localStorage.setItem(
          ALL_BACKUP_STORAGE_KEYS.CHALLENGE_60_V1,
          JSON.stringify(incoming.ielts_60_day_challenge_state_v1)
        );
      }
      localStorage.setItem(
        ALL_BACKUP_STORAGE_KEYS.WORKSPACE_TODOS_V1,
        JSON.stringify(incoming.master_english_workspace_todos_v1 || [])
      );
      if (incoming.master_english_report_recipient_v1) {
        localStorage.setItem(
          ALL_BACKUP_STORAGE_KEYS.REPORT_RECIPIENT_V1,
          incoming.master_english_report_recipient_v1
        );
      }
      localStorage.setItem(
        ALL_BACKUP_STORAGE_KEYS.PDF_LIB_SAVED_V1,
        JSON.stringify(incoming.master_english_pdf_lib_saved_v1 || [])
      );
      localStorage.setItem(
        ALL_BACKUP_STORAGE_KEYS.PDF_LIB_LEARNED_V2,
        JSON.stringify(incoming.master_english_pdf_lib_learned_v2 || [])
      );
      localStorage.setItem(
        ALL_BACKUP_STORAGE_KEYS.PDF_LIB_ACTIVE_V2,
        incoming.master_english_pdf_lib_active_v2 || 'pdf-item-1'
      );
      localStorage.setItem(
        ALL_BACKUP_STORAGE_KEYS.PDF_LIB_NOTES_V1,
        JSON.stringify(incoming.master_english_pdf_lib_notes_v1 || [])
      );
      if (incoming.user_writing_logs_v1) {
        localStorage.setItem(
          ALL_BACKUP_STORAGE_KEYS.USER_WRITING_LOGS_V1,
          JSON.stringify(incoming.user_writing_logs_v1)
        );
      }
      if (incoming.master_english_vstep_pdf_bank_progress_v1) {
        localStorage.setItem(
          ALL_BACKUP_STORAGE_KEYS.VSTEP_PDF_BANK_PROGRESS_V1,
          JSON.stringify(incoming.master_english_vstep_pdf_bank_progress_v1)
        );
      }
    } else {
      // SAFE MERGE MODE
      // 1. Merge Sessions by ID
      const sessionMap = new Map<string, SessionRecord>();
      (current.master_english_sessions_v2 || []).forEach((s) => {
        if (s && s.id) sessionMap.set(s.id, s);
      });
      (incoming.master_english_sessions_v2 || []).forEach((s) => {
        if (s && s.id) {
          const existing = sessionMap.get(s.id);
          if (!existing || (s.durationSeconds || 0) >= (existing.durationSeconds || 0)) {
            sessionMap.set(s.id, s);
          }
        }
      });
      const mergedSessions = Array.from(sessionMap.values()).sort(
        (a, b) => (a.startTime || 0) - (b.startTime || 0)
      );
      localStorage.setItem(ALL_BACKUP_STORAGE_KEYS.SESSIONS_V2, JSON.stringify(mergedSessions));

      // 2. Active Session: keep current if active, otherwise use incoming
      if (!current.master_english_active_session_v2 && incoming.master_english_active_session_v2) {
        localStorage.setItem(
          ALL_BACKUP_STORAGE_KEYS.ACTIVE_SESSION_V2,
          JSON.stringify(incoming.master_english_active_session_v2)
        );
      }

      // 3. Merge Word Progress by wordId (prefer higher timesReviewed or mastered status)
      const mergedWords: Record<string, WordProgressRecord> = {
        ...(incoming.master_english_word_progress_v2 || {}),
      };
      Object.entries(current.master_english_word_progress_v2 || {}).forEach(([wordId, curRec]) => {
        const incRec = mergedWords[wordId];
        if (!incRec) {
          mergedWords[wordId] = curRec;
        } else {
          const curTime = curRec.lastReviewedAt || 0;
          const incTime = incRec.lastReviewedAt || 0;
          const historyMap = new Map<string, any>();
          (incRec.history || []).forEach((h) => historyMap.set(`${h.timestamp}_${h.action}`, h));
          (curRec.history || []).forEach((h) => historyMap.set(`${h.timestamp}_${h.action}`, h));

          mergedWords[wordId] = {
            ...(curTime >= incTime ? curRec : incRec),
            status:
              curRec.status === 'mastered' || incRec.status === 'mastered'
                ? 'mastered'
                : curTime >= incTime
                ? curRec.status
                : incRec.status,
            timesReviewed: Math.max(curRec.timesReviewed || 0, incRec.timesReviewed || 0),
            firstMasteredAt:
              curRec.firstMasteredAt && incRec.firstMasteredAt
                ? Math.min(curRec.firstMasteredAt, incRec.firstMasteredAt)
                : curRec.firstMasteredAt || incRec.firstMasteredAt || null,
            lastReviewedAt: Math.max(curTime, incTime),
            history: Array.from(historyMap.values()).sort((a, b) => a.timestamp - b.timestamp),
          };
        }
      });
      localStorage.setItem(ALL_BACKUP_STORAGE_KEYS.WORD_PROGRESS_V2, JSON.stringify(mergedWords));

      // 4. Theme & User Profile
      const mergedTheme = current.master_english_theme_v2 || incoming.master_english_theme_v2;
      if (mergedTheme) {
        localStorage.setItem(ALL_BACKUP_STORAGE_KEYS.THEME_V2, mergedTheme);
        localStorage.setItem(ALL_BACKUP_STORAGE_KEYS.THEME_PREF_LEGACY, mergedTheme);
      }
      const mergedProfile = incoming.master_english_user_profile_v2 || current.master_english_user_profile_v2;
      if (mergedProfile) {
        localStorage.setItem(ALL_BACKUP_STORAGE_KEYS.USER_PROFILE_V2, JSON.stringify(mergedProfile));
      }

      // 5. Mastered Words array union
      const masteredSet = new Set<string>([
        ...(current.leximaster_mastered_words_v1 || []),
        ...(incoming.leximaster_mastered_words_v1 || []),
      ]);
      localStorage.setItem(
        ALL_BACKUP_STORAGE_KEYS.MASTERED_WORDS_V1,
        JSON.stringify(Array.from(masteredSet))
      );

      // 6. Mistakes union by id / question
      const mistakeMap = new Map<string, MistakeRecord>();
      (incoming.leximaster_mistakes_v1 || []).forEach((m) => {
        if (m) mistakeMap.set(m.id || m.question, m);
      });
      (current.leximaster_mistakes_v1 || []).forEach((m) => {
        if (m) mistakeMap.set(m.id || m.question, m);
      });
      localStorage.setItem(
        ALL_BACKUP_STORAGE_KEYS.MISTAKES_V1,
        JSON.stringify(Array.from(mistakeMap.values()))
      );

      // 7. Stats max merge
      if (current.leximaster_stats_v1 || incoming.leximaster_stats_v1) {
        const cStats = current.leximaster_stats_v1;
        const iStats = incoming.leximaster_stats_v1;
        const mergedStats: UserStats = {
          quizzesTaken: Math.max(cStats?.quizzesTaken || 0, iStats?.quizzesTaken || 0),
          totalQuestionsAnswered: Math.max(
            cStats?.totalQuestionsAnswered || 0,
            iStats?.totalQuestionsAnswered || 0
          ),
          correctAnswers: Math.max(cStats?.correctAnswers || 0, iStats?.correctAnswers || 0),
          bestStreak: Math.max(cStats?.bestStreak || 0, iStats?.bestStreak || 0),
          currentStreak: Math.max(cStats?.currentStreak || 0, iStats?.currentStreak || 0),
        };
        localStorage.setItem(ALL_BACKUP_STORAGE_KEYS.STATS_V1, JSON.stringify(mergedStats));
      }

      // 7b. Card status merge
      if (current.leximaster_card_status_v1 || incoming.leximaster_card_status_v1) {
        const mergedCardStatus = {
          ...(incoming.leximaster_card_status_v1 || {}),
          ...(current.leximaster_card_status_v1 || {}),
        };
        localStorage.setItem(ALL_BACKUP_STORAGE_KEYS.CARD_STATUS_V1, JSON.stringify(mergedCardStatus));
      }

      // 8. 60-Day Challenge deep merge
      if (current.ielts_60_day_challenge_state_v1 || incoming.ielts_60_day_challenge_state_v1) {
        const cChal = current.ielts_60_day_challenge_state_v1;
        const iChal = incoming.ielts_60_day_challenge_state_v1;

        const mergedDayStatuses: Record<number, DayCompletionStatus> = {
          ...(iChal?.dayStatuses || {}),
        };
        Object.entries(cChal?.dayStatuses || {}).forEach(([dayStr, curStatus]) => {
          const d = Number(dayStr);
          const incStatus = mergedDayStatuses[d];
          if (!incStatus) {
            mergedDayStatuses[d] = curStatus;
          } else {
            mergedDayStatuses[d] = {
              vocab: Boolean(curStatus?.vocab || incStatus?.vocab),
              writing: Boolean(curStatus?.writing || incStatus?.writing),
              speaking: Boolean(curStatus?.speaking || incStatus?.speaking),
              completedAt: curStatus?.completedAt || incStatus?.completedAt,
            };
          }
        });

        const mergedDrafts: Record<number, any> = {
          ...(iChal?.writingDrafts || {}),
        };
        Object.entries(cChal?.writingDrafts || {}).forEach(([dayStr, draft]) => {
          const d = Number(dayStr);
          const existingDraft = mergedDrafts[d];
          if (!existingDraft || (draft?.text?.length || 0) >= (existingDraft?.text?.length || 0)) {
            mergedDrafts[d] = draft;
          }
        });

        const mergedSpeakingDrafts: Record<number, any> = {
          ...(iChal?.speakingDrafts || {}),
        };
        Object.entries(cChal?.speakingDrafts || {}).forEach(([dayStr, draft]) => {
          const d = Number(dayStr);
          const existingDraft = mergedSpeakingDrafts[d];
          if (!existingDraft || (draft?.lastSaved || 0) >= (existingDraft?.lastSaved || 0)) {
            mergedSpeakingDrafts[d] = draft;
          }
        });

        const mergedWritingHistory: Record<number, WritingSubmissionRecord[]> = {
          ...(iChal?.writingHistory || {}),
        };
        Object.entries(cChal?.writingHistory || {}).forEach(([dayStr, subs]) => {
          const d = Number(dayStr);
          const existingSubs = mergedWritingHistory[d] || [];
          const subMap = new Map<string, WritingSubmissionRecord>();
          existingSubs.forEach((s) => subMap.set(s.id, s));
          (subs || []).forEach((s) => subMap.set(s.id, s));
          mergedWritingHistory[d] = Array.from(subMap.values()).sort(
            (a, b) => b.submittedAt - a.submittedAt
          );
        });

        const mergedSpeakingHistory: Record<number, WritingSubmissionRecord[]> = {
          ...(iChal?.speakingHistory || {}),
        };
        Object.entries(cChal?.speakingHistory || {}).forEach(([dayStr, subs]) => {
          const d = Number(dayStr);
          const existingSubs = mergedSpeakingHistory[d] || [];
          const subMap = new Map<string, WritingSubmissionRecord>();
          existingSubs.forEach((s) => subMap.set(s.id, s));
          (subs || []).forEach((s) => subMap.set(s.id, s));
          mergedSpeakingHistory[d] = Array.from(subMap.values()).sort(
            (a, b) => b.submittedAt - a.submittedAt
          );
        });

        const mergedChalVocab = Array.from(
          new Set([...(iChal?.masteredVocabIds || []), ...(cChal?.masteredVocabIds || [])])
        );

        const mergedChallenge: ChallengeProgressData = {
          activeDay: Math.max(cChal?.activeDay || 1, iChal?.activeDay || 1),
          streak: Math.max(cChal?.streak || 0, iChal?.streak || 0),
          lastActiveDate:
            (cChal?.lastActiveDate || '') >= (iChal?.lastActiveDate || '')
              ? cChal?.lastActiveDate || ''
              : iChal?.lastActiveDate || '',
          dayStatuses: mergedDayStatuses,
          masteredVocabIds: mergedChalVocab,
          writingDrafts: mergedDrafts,
          speakingDrafts: mergedSpeakingDrafts,
          writingHistory: mergedWritingHistory,
          speakingHistory: mergedSpeakingHistory,
        };
        localStorage.setItem(ALL_BACKUP_STORAGE_KEYS.CHALLENGE_60_V1, JSON.stringify(mergedChallenge));
      }

      // 8b. Merge user_writing_logs_v1 & vstep_pdf_bank_progress_v1
      const writingLogsMap = new Map<string, WritingSubmissionRecord>();
      (incoming.user_writing_logs_v1 || []).forEach((log) => {
        if (log && log.id) writingLogsMap.set(log.id, log);
      });
      (current.user_writing_logs_v1 || []).forEach((log) => {
        if (log && log.id) writingLogsMap.set(log.id, log);
      });
      localStorage.setItem(
        ALL_BACKUP_STORAGE_KEYS.USER_WRITING_LOGS_V1,
        JSON.stringify(
          Array.from(writingLogsMap.values()).sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0))
        )
      );

      if (current.master_english_vstep_pdf_bank_progress_v1 || incoming.master_english_vstep_pdf_bank_progress_v1) {
        const mergedPdfBankProgress = {
          ...(incoming.master_english_vstep_pdf_bank_progress_v1 || {}),
          ...(current.master_english_vstep_pdf_bank_progress_v1 || {}),
        };
        localStorage.setItem(
          ALL_BACKUP_STORAGE_KEYS.VSTEP_PDF_BANK_PROGRESS_V1,
          JSON.stringify(mergedPdfBankProgress)
        );
      }

      // 9. Workspace Todos union by id
      const todoMap = new Map<number, WorkspaceTodoItem>();
      (incoming.master_english_workspace_todos_v1 || []).forEach((t) => {
        if (t && typeof t.id === 'number') todoMap.set(t.id, t);
      });
      (current.master_english_workspace_todos_v1 || []).forEach((t) => {
        if (t && typeof t.id === 'number') todoMap.set(t.id, t);
      });
      localStorage.setItem(
        ALL_BACKUP_STORAGE_KEYS.WORKSPACE_TODOS_V1,
        JSON.stringify(Array.from(todoMap.values()))
      );

      // 10. Report recipient
      const recipient =
        current.master_english_report_recipient_v1 || incoming.master_english_report_recipient_v1;
      if (recipient) {
        localStorage.setItem(ALL_BACKUP_STORAGE_KEYS.REPORT_RECIPIENT_V1, recipient);
      }

      // 11. 77 Grammar Structures (Learned, Saved, Active Position, and Custom Sentence Notes)
      const mergedPdfSaved = Array.from(
        new Set([
          ...(current.master_english_pdf_lib_saved_v1 || []),
          ...(incoming.master_english_pdf_lib_saved_v1 || []),
        ])
      );
      localStorage.setItem(ALL_BACKUP_STORAGE_KEYS.PDF_LIB_SAVED_V1, JSON.stringify(mergedPdfSaved));

      const mergedPdfLearned = Array.from(
        new Set([
          ...(current.master_english_pdf_lib_learned_v2 || []),
          ...(incoming.master_english_pdf_lib_learned_v2 || []),
        ])
      );
      localStorage.setItem(ALL_BACKUP_STORAGE_KEYS.PDF_LIB_LEARNED_V2, JSON.stringify(mergedPdfLearned));

      const mergedPdfActive =
        incoming.master_english_pdf_lib_active_v2 &&
        incoming.master_english_pdf_lib_active_v2 !== 'pdf-item-1'
          ? incoming.master_english_pdf_lib_active_v2
          : current.master_english_pdf_lib_active_v2 ||
            incoming.master_english_pdf_lib_active_v2 ||
            'pdf-item-1';
      localStorage.setItem(ALL_BACKUP_STORAGE_KEYS.PDF_LIB_ACTIVE_V2, mergedPdfActive);

      const noteMap = new Map<string, PdfCustomSentenceNote>();
      (incoming.master_english_pdf_lib_notes_v1 || []).forEach((n) => {
        if (n && n.id) noteMap.set(n.id, n);
      });
      (current.master_english_pdf_lib_notes_v1 || []).forEach((n) => {
        if (n && n.id) noteMap.set(n.id, n);
      });
      localStorage.setItem(
        ALL_BACKUP_STORAGE_KEYS.PDF_LIB_NOTES_V1,
        JSON.stringify(Array.from(noteMap.values()))
      );
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('master-english-cloud-synced'));
    }

    const updatedSummary = getLocalDataSummary();
    return {
      success: true,
      message:
        mode === 'merge'
          ? `Đã hợp nhất dữ liệu thành công (bao gồm ${updatedSummary.pdfStructuresLearnedCount}/77 cấu trúc ngữ pháp và ${updatedSummary.wordProgressCount} từ SRS).`
          : `Đã khôi phục nguyên trạng dữ liệu từ file Backup thành công (${updatedSummary.pdfStructuresLearnedCount}/77 cấu trúc ngữ pháp).`,
      updatedSummary,
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Lỗi khi khôi phục dữ liệu: ${e?.message || 'Không xác định'}`,
      updatedSummary: getLocalDataSummary(),
    };
  }
}

/**
 * Check if a pre-restore safety snapshot exists
 */
export function hasPreRestoreSnapshot(): boolean {
  try {
    return Boolean(localStorage.getItem(PRE_RESTORE_SNAPSHOT_KEY));
  } catch {
    return false;
  }
}

/**
 * Rollback to the pre-restore safety snapshot
 */
export function rollbackPreRestoreSnapshot(): { success: boolean; message: string } {
  try {
    const raw = localStorage.getItem(PRE_RESTORE_SNAPSHOT_KEY);
    if (!raw) {
      return { success: false, message: 'Không tìm thấy bản chụp an toàn trước khi khôi phục.' };
    }
    const validation = validateBackupJson(raw);
    if (!validation.valid || !validation.payload) {
      return { success: false, message: 'Bản chụp an toàn không hợp lệ.' };
    }
    restoreFromBackupPayload(validation.payload, 'overwrite');
    return { success: true, message: 'Đã hoàn tác về trạng thái dữ liệu trước khi khôi phục.' };
  } catch (e: any) {
    return { success: false, message: `Lỗi hoàn tác: ${e?.message || 'Không xác định'}` };
  }
}
