/**
 * Real Learning Analytics & Session Storage Service
 * Strict Principle: ZERO fake data, ZERO phantom timer increments, ZERO synthetic stats.
 * All metrics derived directly from verified user actions and completed sessions.
 */

import { deepNormalizeText, normalizeVietnameseText } from '../utils/textNormalization';
import { dataRepository } from './dataRepository';

let lastActiveSessionCloudSyncAt = 0;
let lastActiveSessionStatus: string | null = null;

export interface SessionRecord {
  id: string;
  startTime: number; // Unix timestamp ms
  endTime: number; // Unix timestamp ms
  durationSeconds: number; // Valid active learning duration in seconds (excluding pauses)
  targetMinutes?: number; // Target minutes configured for the session (e.g. 15, 25, 45, 60)
  dateString: string; // YYYY-MM-DD in local time
  topics: string[]; // Modes used: 'Speed Quiz', 'Flashcards', 'Collocations', etc.
  wordsMastered: string[]; // Unique word IDs mastered in this session
  wordsReviewed: string[]; // Word IDs reviewed in this session
  quizQuestionsAnswered: number;
  quizQuestionsCorrect: number;
  flashcardsFlipped: number;
  mistakesResolved: number;
  status: 'completed';
}

export interface ActiveSessionState {
  id: string;
  startTime: number;
  lastActiveTimestamp: number;
  accumulatedSeconds: number;
  targetMinutes?: number;
  status: 'active' | 'paused';
  pausedAt: number | null;
  topics: string[];
  wordsMastered: string[];
  wordsReviewed: string[];
  quizQuestionsAnswered: number;
  quizQuestionsCorrect: number;
  flashcardsFlipped: number;
  mistakesResolved: number;
}

export interface WordProgressRecord {
  wordId: string;
  word: string;
  ipa?: string;
  meaning?: string;
  level?: string;
  status: 'unlearned' | 'learning' | 'mastered' | 'reviewing';
  timesReviewed: number;
  firstMasteredAt: number | null;
  lastReviewedAt: number;
  nextReviewAt?: string;
  history: {
    timestamp: number;
    action: 'mastered' | 'unmastered' | 'reviewed' | 'quiz_correct' | 'quiz_wrong';
    mode: string;
  }[];
}

export const STORAGE_KEYS = {
  SESSIONS: 'master_english_sessions_v2',
  ACTIVE_SESSION: 'master_english_active_session_v2',
  WORD_PROGRESS: 'master_english_word_progress_v2',
  THEME: 'master_english_theme_v2',
  THEME_LEGACY: 'master_english_theme_preference_v2',
  USER_PROFILE: 'master_english_user_profile_v2'
};

// Helper: Format local date string as YYYY-MM-DD
export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ----------------------------------------------------
// 1. SESSIONS PERSISTENCE
// ----------------------------------------------------

export function getCompletedSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const valid = parsed.filter(
        s =>
          s &&
          typeof s.id === 'string' &&
          s.status === 'completed' &&
          typeof s.durationSeconds === 'number' &&
          s.durationSeconds >= 0
      );
      // Deduplicate by session id and startTime, sort newest first
      const seenIds = new Set<string>();
      const seenStartTimes = new Set<number>();
      const deduped: SessionRecord[] = [];
      for (const item of valid) {
        if (seenIds.has(item.id) || (item.startTime && seenStartTimes.has(item.startTime))) {
          continue;
        }
        seenIds.add(item.id);
        if (item.startTime) seenStartTimes.add(item.startTime);
        deduped.push(item);
      }
      deduped.sort((a, b) => (b.endTime || 0) - (a.endTime || 0));
      return deepNormalizeText(deduped);
    }
    return [];
  } catch (err) {
    console.error('Failed to load completed sessions', err);
    return [];
  }
}

export function saveCompletedSession(session: SessionRecord): void {
  try {
    const normalizedSession = deepNormalizeText(session);
    const sessions = getCompletedSessions();
    // Prevent duplicate saving of same session id or identical startTime
    const existingIndex = sessions.findIndex(
      s =>
        s.id === normalizedSession.id ||
        (normalizedSession.startTime && s.startTime === normalizedSession.startTime)
    );
    let updated: SessionRecord[];
    if (existingIndex >= 0) {
      updated = [...sessions];
      updated[existingIndex] = normalizedSession;
    } else {
      updated = [normalizedSession, ...sessions];
    }
    updated.sort((a, b) => (b.endTime || 0) - (a.endTime || 0));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('master-english-session-updated'));
    }
    void dataRepository.syncCompletedSession(normalizedSession);
  } catch (err) {
    console.error('Failed to save completed session', err);
    throw new Error(normalizeVietnameseText('Lưu phiên học thất bại do bộ nhớ trình duyệt đầy hoặc bị hạn chế.'));
  }
}

// ----------------------------------------------------
// 2. ACTIVE SESSION RECOVERY & LIFECYCLE
// ----------------------------------------------------

export function getActiveSession(): ActiveSessionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id && typeof parsed.accumulatedSeconds === 'number') {
      return deepNormalizeText(parsed);
    }
    return null;
  } catch {
    return null;
  }
}

export function saveActiveSession(state: ActiveSessionState | null): void {
  try {
    if (!state) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      lastActiveSessionStatus = null;
      lastActiveSessionCloudSyncAt = Date.now();
      void dataRepository.syncActiveSession(null);
    } else {
      const normalized = deepNormalizeText(state);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(normalized));
      const now = Date.now();
      const statusChanged = normalized.status !== lastActiveSessionStatus;
      if (statusChanged || now - lastActiveSessionCloudSyncAt >= 15_000) {
        lastActiveSessionStatus = normalized.status;
        lastActiveSessionCloudSyncAt = now;
        void dataRepository.syncActiveSession(normalized);
      }
    }
  } catch (err) {
    console.error('Failed to update active session state', err);
  }
}

// ----------------------------------------------------
// 3. WORD PROGRESS REPOSITORY
// ----------------------------------------------------

export function getWordProgressMap(): Record<string, WordProgressRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORD_PROGRESS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? deepNormalizeText(parsed) : {};
  } catch {
    return {};
  }
}

export function saveWordProgress(record: WordProgressRecord): void {
  try {
    const map = getWordProgressMap();
    const normalized = deepNormalizeText(record);
    map[record.wordId] = normalized;
    localStorage.setItem(STORAGE_KEYS.WORD_PROGRESS, JSON.stringify(map));
    const masteredIds = Object.keys(map).filter(id => map[id].status === 'mastered');
    localStorage.setItem('leximaster_mastered_words_v1', JSON.stringify(masteredIds));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('master-english-word-progress-changed'));
    }
    void dataRepository.syncWordProgressRecord(normalized);
  } catch (err) {
    console.error('Failed to save word progress', err);
  }
}

/**
 * Record a real user learning interaction on a word.
 * Strict rules:
 * - action 'mastered': marks word as completed, records timestamp.
 * - action 'unmastered': unmarks word.
 * - action 'reviewed' or 'quiz_correct': increments review count, updates lastReviewedAt.
 */
export function recordWordInteraction(
  wordId: string,
  word: string,
  action: 'mastered' | 'unmastered' | 'reviewed' | 'quiz_correct' | 'quiz_wrong',
  mode: string,
  extra?: { ipa?: string; meaning?: string; level?: string }
): { isNewlyMastered: boolean; totalMasteredCount: number } {
  const normalizedWordId = normalizeVietnameseText(wordId);
  const normalizedWord = normalizeVietnameseText(word);
  const normalizedMode = normalizeVietnameseText(mode);
  const normalizedExtra = extra ? deepNormalizeText(extra) : undefined;

  const map = getWordProgressMap();
  const existing = map[normalizedWordId] || {
    wordId: normalizedWordId,
    word: normalizedWord,
    ipa: normalizedExtra?.ipa,
    meaning: normalizedExtra?.meaning,
    level: normalizedExtra?.level,
    status: 'unlearned',
    timesReviewed: 0,
    firstMasteredAt: null,
    lastReviewedAt: Date.now(),
    history: []
  };

  let isNewlyMastered = false;

  if (action === 'mastered') {
    if (existing.status !== 'mastered') {
      existing.status = 'mastered';
      if (!existing.firstMasteredAt) {
        existing.firstMasteredAt = Date.now();
      }
      isNewlyMastered = true;
    }
    existing.timesReviewed += 1;
  } else if (action === 'unmastered') {
    existing.status = 'unlearned';
    existing.firstMasteredAt = null;
  } else if (action === 'reviewed' || action === 'quiz_correct') {
    existing.timesReviewed += 1;
    if (existing.status === 'unlearned') {
      existing.status = 'learning';
    }
  } else if (action === 'quiz_wrong') {
    existing.timesReviewed += 1;
    if (existing.status === 'mastered') {
      existing.status = 'reviewing';
    } else if (existing.status === 'unlearned') {
      existing.status = 'learning';
    }
  }

  existing.lastReviewedAt = Date.now();
  existing.history.push({
    timestamp: Date.now(),
    action,
    mode: normalizedMode
  });

  map[normalizedWordId] = deepNormalizeText(existing);
  try {
    localStorage.setItem(STORAGE_KEYS.WORD_PROGRESS, JSON.stringify(map));
  } catch (err) {
    console.error('Error saving word progress map', err);
  }

  // Also synchronize with legacy master word IDs for compatibility
  const masteredIds = Object.keys(map).filter(id => map[id].status === 'mastered');
  try {
    localStorage.setItem('leximaster_mastered_words_v1', JSON.stringify(masteredIds));
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('master-english-word-progress-changed'));
  }

  void dataRepository.syncWordProgressRecord(map[normalizedWordId], masteredIds);

  return {
    isNewlyMastered,
    totalMasteredCount: masteredIds.length
  };
}

// ----------------------------------------------------
// 4. REAL STREAK CALCULATION (ZERO FAKE STREAKS)
// ----------------------------------------------------

/**
 * Calculates current streak based strictly on consecutive calendar days
 * that have at least one completed session with valid duration > 0.
 */
export function calculateRealStreak(sessions: SessionRecord[]): { currentStreak: number; bestStreak: number } {
  if (!sessions || sessions.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Group unique study dates (YYYY-MM-DD)
  const studyDatesSet = new Set(
    sessions
      .filter(s => s.durationSeconds >= 30) // Only count sessions >= 30 seconds
      .map(s => s.dateString)
  );

  const studyDates = Array.from(studyDatesSet).sort().reverse();
  if (studyDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  // If user hasn't studied today and hasn't studied yesterday, streak is broken = 0
  const hasStudiedToday = studyDatesSet.has(todayStr);
  const hasStudiedYesterday = studyDatesSet.has(yesterdayStr);

  if (!hasStudiedToday && !hasStudiedYesterday) {
    return { currentStreak: 0, bestStreak: calculateMaxConsecutiveDays(Array.from(studyDatesSet)) };
  }

  // Count backwards consecutive days
  let streak = 0;
  let checkDate = hasStudiedToday ? new Date() : yesterday;

  while (true) {
    const checkStr = getLocalDateString(checkDate);
    if (studyDatesSet.has(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const bestStreak = Math.max(streak, calculateMaxConsecutiveDays(Array.from(studyDatesSet)));
  return { currentStreak: streak, bestStreak };
}

function calculateMaxConsecutiveDays(dateStrings: string[]): number {
  if (dateStrings.length === 0) return 0;
  const timestamps = dateStrings
    .map(d => new Date(d).getTime())
    .sort((a, b) => a - b);

  let maxStreak = 1;
  let current = 1;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  for (let i = 1; i < timestamps.length; i++) {
    const diff = Math.round((timestamps[i] - timestamps[i - 1]) / ONE_DAY_MS);
    if (diff === 1) {
      current++;
      if (current > maxStreak) maxStreak = current;
    } else if (diff > 1) {
      current = 1;
    }
  }
  return maxStreak;
}

// ----------------------------------------------------
// 5. THEME PREFERENCE (LIGHT DEFAULT)
// ----------------------------------------------------

export function getSavedThemePreference(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) || localStorage.getItem(STORAGE_KEYS.THEME_LEGACY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Strict requirement: Default MUST be 'light'
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveThemePreference(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    localStorage.setItem(STORAGE_KEYS.THEME_LEGACY, theme);
    const savedProfileRaw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    const parsedProfile = savedProfileRaw ? JSON.parse(savedProfileRaw) : {};
    void dataRepository.syncUserProfileData(parsedProfile, theme);
  } catch {}
}
