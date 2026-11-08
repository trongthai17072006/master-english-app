import { deepNormalizeText, normalizeVietnameseText } from './textNormalization';
import { dataRepository } from '../services/dataRepository';

export interface MistakeRecord {
  id: string;
  wordId?: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  sourceMode: string;
  timestamp: number;
}

export interface UserStats {
  quizzesTaken: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  bestStreak: number;
  currentStreak: number;
}

const STORAGE_KEYS = {
  MASTERED_WORDS: 'leximaster_mastered_words_v1',
  MISTAKES: 'leximaster_mistakes_v1',
  STATS: 'leximaster_stats_v1',
  CARD_STATUS: 'leximaster_card_status_v1',
};

const WORD_PROGRESS_STORAGE_KEY = 'master_english_word_progress_v2';

export function getMasteredWordIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MASTERED_WORDS);
    const parsed = raw ? JSON.parse(raw) : [];
    const legacyIds: string[] = Array.isArray(parsed) ? deepNormalizeText(parsed) : [];

    const progressRaw = localStorage.getItem(WORD_PROGRESS_STORAGE_KEY);
    const progressMap = progressRaw ? JSON.parse(progressRaw) : {};
    const progressMasteredIds =
      progressMap && typeof progressMap === 'object'
        ? Object.keys(progressMap).filter((k) => progressMap[k]?.status === 'mastered')
        : [];

    return Array.from(new Set([...legacyIds, ...progressMasteredIds]));
  } catch {
    return [];
  }
}

export function saveMasteredWordIds(ids: string[]): void {
  try {
    const uniqueIds = Array.from(new Set(deepNormalizeText(ids)));
    localStorage.setItem(STORAGE_KEYS.MASTERED_WORDS, JSON.stringify(uniqueIds));

    // Sync into master_english_word_progress_v2 as well
    const progressRaw = localStorage.getItem(WORD_PROGRESS_STORAGE_KEY);
    const progressMap = progressRaw ? JSON.parse(progressRaw) : {};
    if (progressMap && typeof progressMap === 'object') {
      const idSet = new Set(uniqueIds);
      const now = Date.now();
      for (const wordId of uniqueIds) {
        if (!progressMap[wordId]) {
          progressMap[wordId] = {
            wordId,
            word: wordId,
            status: 'mastered',
            timesReviewed: 1,
            firstMasteredAt: now,
            lastReviewedAt: now,
            history: [{ timestamp: now, action: 'mastered', mode: 'Sync' }]
          };
        } else if (progressMap[wordId].status !== 'mastered') {
          progressMap[wordId].status = 'mastered';
          progressMap[wordId].firstMasteredAt = progressMap[wordId].firstMasteredAt || now;
          progressMap[wordId].lastReviewedAt = now;
        }
      }
      for (const existingId of Object.keys(progressMap)) {
        if (progressMap[existingId]?.status === 'mastered' && !idSet.has(existingId)) {
          progressMap[existingId].status = 'unlearned';
          progressMap[existingId].firstMasteredAt = null;
        }
      }
      localStorage.setItem(WORD_PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('master-english-word-progress-changed'));
    }
    void dataRepository.syncMasteredWordsArray(uniqueIds);
  } catch {}
}

export function toggleMasteredWord(id: string): boolean {
  const normalizedId = normalizeVietnameseText(id);
  const current = getMasteredWordIds();
  let updated: string[];
  let isMasteredNow = false;
  if (current.includes(normalizedId)) {
    updated = current.filter(item => item !== normalizedId);
  } else {
    updated = [...current, normalizedId];
    isMasteredNow = true;
  }
  saveMasteredWordIds(updated);
  return isMasteredNow;
}

export function getMistakes(): MistakeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MISTAKES);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? deepNormalizeText(parsed) : [];
  } catch {
    return [];
  }
}

export function saveMistake(record: Omit<MistakeRecord, 'id' | 'timestamp'>): void {
  try {
    const normalizedRecord = deepNormalizeText(record);
    const current = getMistakes();
    // Avoid duplicate identical question mistake
    const exists = current.find(m => m.question === normalizedRecord.question);
    if (!exists) {
      const newRecord: MistakeRecord = {
        ...normalizedRecord,
        id: 'mistake_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify([newRecord, ...current].slice(0, 100)));
      void dataRepository.syncMistakeRecord(newRecord);
    }
  } catch {}
}

export function removeMistake(id: string): void {
  try {
    const current = getMistakes();
    const updated = current.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(updated));
    void dataRepository.deleteMistakeFromCloud(id);
  } catch {}
}

export function clearAllMistakes(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.MISTAKES);
    void dataRepository.clearAllMistakesFromCloud();
  } catch {}
}

export function getUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    return raw ? JSON.parse(raw) : {
      quizzesTaken: 0,
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      bestStreak: 0,
      currentStreak: 0,
    };
  } catch {
    return {
      quizzesTaken: 0,
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      bestStreak: 0,
      currentStreak: 0,
    };
  }
}

export const getStats = getUserStats;

export function recordQuizAnswer(isCorrect: boolean): UserStats {
  const stats = getUserStats();
  stats.totalQuestionsAnswered += 1;
  if (isCorrect) {
    stats.correctAnswers += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.bestStreak) {
      stats.bestStreak = stats.currentStreak;
    }
  } else {
    stats.currentStreak = 0;
  }
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    void dataRepository.syncUserStatsRecord(stats);
  } catch {}
  return stats;
}

export function incrementQuizCount(): void {
  const stats = getUserStats();
  stats.quizzesTaken += 1;
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    void dataRepository.syncUserStatsRecord(stats);
  } catch {}
}
