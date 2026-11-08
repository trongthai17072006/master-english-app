import { deepNormalizeText } from './textNormalization';
import { dataRepository } from '../services/dataRepository';

export interface DayCompletionStatus {
  vocab: boolean;
  writing: boolean;
  speaking: boolean;
  completedAt?: number;
}

export interface WritingSubmissionRecord {
  id: string;
  day: number;
  taskType?: 'writing_task2' | 'writing_task1_letter' | 'speaking_part1' | 'speaking_part2' | 'speaking_part3' | 'speaking_full';
  examType?: 'IELTS' | 'VSTEP' | 'IELTS & VSTEP';
  prompt?: string;
  text: string;
  wordCount: number;
  usedTargetVocab?: string[];
  submittedAt: number;
  feedback?: {
    estimatedBand: number;
    wordCountScore: string;
    taskResponse: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammaticalAccuracy: string;
    strengths: string[];
    actionableAdvice: string[];
    isAiGenerated?: boolean;
  };
}

export interface WritingDraftRecord {
  text: string;
  wordCount?: number;
  usedTargetVocab?: string[];
  lastSaved: number;
}

export interface SpeakingDraftRecord {
  part1Text?: string;
  part2Text?: string;
  part3Text?: string;
  selectedOption?: 'A' | 'B' | 'C';
  wordCount?: number;
  usedTargetVocab?: string[];
  lastSaved: number;
}

export interface ChallengeProgressData {
  activeDay: number;
  dayStatuses: Record<number, DayCompletionStatus>;
  writingDrafts: Record<number, WritingDraftRecord>;
  speakingDrafts?: Record<number, SpeakingDraftRecord>;
  writingHistory: Record<number, WritingSubmissionRecord[]>;
  speakingHistory?: Record<number, WritingSubmissionRecord[]>;
  masteredVocabIds: string[];
  streak: number;
  lastActiveDate: string;
}

const STORAGE_KEY = 'ielts_60_day_challenge_state_v1';
export const USER_WRITING_LOGS_STORAGE_KEY = 'user_writing_logs_v1';
export const CANONICAL_ACTIVE_DAY_KEY = 'master_english_active_challenge_day_v1';
export const ACTIVE_DAY_CHANGED_EVENT = 'master-english-active-day-changed';

/**
 * Hỗ trợ mở rộng lộ trình không giới hạn (Day 1 -> 60 và Day 61, 62, ... lên tới 3650 ngày)
 */
function clampDay(day: number): number {
  const n = Number(day);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(3650, Math.round(n));
}

export function getCanonicalActiveDay(fallback = 1): number {
  try {
    const rawCanonical = localStorage.getItem(CANONICAL_ACTIVE_DAY_KEY);
    if (rawCanonical) {
      const parsedNum = Number(rawCanonical);
      if (Number.isFinite(parsedNum) && parsedNum >= 1 && parsedNum <= 3650) {
        return Math.round(parsedNum);
      }
    }
    const rawChallenge = localStorage.getItem(STORAGE_KEY);
    if (rawChallenge) {
      const parsedCh = JSON.parse(rawChallenge);
      if (parsedCh && typeof parsedCh.activeDay === 'number' && parsedCh.activeDay >= 1 && parsedCh.activeDay <= 3650) {
        localStorage.setItem(CANONICAL_ACTIVE_DAY_KEY, String(Math.round(parsedCh.activeDay)));
        return Math.round(parsedCh.activeDay);
      }
    }
    const rawMilestone = localStorage.getItem('master_english_milestone_store_v1');
    if (rawMilestone) {
      const parsedMs = JSON.parse(rawMilestone);
      if (parsedMs && typeof parsedMs.currentDayNumber === 'number' && parsedMs.currentDayNumber >= 1 && parsedMs.currentDayNumber <= 3650) {
        localStorage.setItem(CANONICAL_ACTIVE_DAY_KEY, String(Math.round(parsedMs.currentDayNumber)));
        return Math.round(parsedMs.currentDayNumber);
      }
    }
  } catch {}
  return clampDay(fallback);
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function loadChallengeData(): ChallengeProgressData {
  const syncedActiveDay = getCanonicalActiveDay(1);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        activeDay: syncedActiveDay,
        dayStatuses: {},
        writingDrafts: {},
        speakingDrafts: {},
        writingHistory: {},
        speakingHistory: {},
        masteredVocabIds: [],
        streak: 0,
        lastActiveDate: ''
      };
    }
    const parsed = deepNormalizeText(JSON.parse(raw));
    const dayStatuses = parsed.dayStatuses || {};
    const hasAnyCompletedTask = Object.values(dayStatuses).some(
      (st: any) => st && (st.vocab || st.writing || st.speaking)
    );
    return {
      activeDay: syncedActiveDay,
      dayStatuses,
      writingDrafts: parsed.writingDrafts || {},
      speakingDrafts: parsed.speakingDrafts || {},
      writingHistory: parsed.writingHistory || {},
      speakingHistory: parsed.speakingHistory || {},
      masteredVocabIds: Array.isArray(parsed.masteredVocabIds) ? parsed.masteredVocabIds : [],
      streak: hasAnyCompletedTask ? (typeof parsed.streak === 'number' ? parsed.streak : 1) : 0,
      lastActiveDate: parsed.lastActiveDate || ''
    };
  } catch {
    return {
      activeDay: syncedActiveDay,
      dayStatuses: {},
      writingDrafts: {},
      speakingDrafts: {},
      writingHistory: {},
      speakingHistory: {},
      masteredVocabIds: [],
      streak: 0,
      lastActiveDate: ''
    };
  }
}

export function saveChallengeData(data: ChallengeProgressData): void {
  try {
    const clamped = clampDay(data.activeDay || 1);
    const normalized = deepNormalizeText({
      ...data,
      activeDay: clamped
    });
    localStorage.setItem(CANONICAL_ACTIVE_DAY_KEY, String(clamped));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));

    // Keep master_english_milestone_store_v1.currentDayNumber strictly in sync
    const rawMs = localStorage.getItem('master_english_milestone_store_v1');
    if (rawMs) {
      try {
        const parsedMs = JSON.parse(rawMs);
        if (parsedMs && parsedMs.currentDayNumber !== clamped) {
          parsedMs.currentDayNumber = clamped;
          localStorage.setItem('master_english_milestone_store_v1', JSON.stringify(parsedMs));
        }
      } catch {}
    }

    void dataRepository.syncChallenge60State(normalized);
  } catch {}
}

export function setActiveChallengeDay(day: number): void {
  const clamped = clampDay(day);
  localStorage.setItem(CANONICAL_ACTIVE_DAY_KEY, String(clamped));
  const data = loadChallengeData();
  data.activeDay = clamped;
  saveChallengeData(data);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ACTIVE_DAY_CHANGED_EVENT, { detail: { day: clamped } }));
  }
}

export function getDayStatus(day: number): DayCompletionStatus {
  const data = loadChallengeData();
  return data.dayStatuses[day] || { vocab: false, writing: false, speaking: false };
}

export function updateDayTaskStatus(
  day: number, 
  task: 'vocab' | 'writing' | 'speaking', 
  completed: boolean
): DayCompletionStatus {
  const data = loadChallengeData();
  const current = data.dayStatuses[day] || { vocab: false, writing: false, speaking: false };
  current[task] = completed;

  // Primary tasks are vocab and writing
  if (current.vocab && current.writing) {
    current.completedAt = current.completedAt || Date.now();
  } else {
    current.completedAt = undefined;
  }

  data.dayStatuses[day] = current;

  // Update streak only when a valid task completion occurs
  if (completed) {
    const today = getTodayDateString();
    if (data.lastActiveDate !== today) {
      data.streak = (data.streak || 0) + 1;
      data.lastActiveDate = today;
    } else if (!data.streak) {
      data.streak = 1;
    }
  }

  saveChallengeData(data);
  return current;
}

/**
 * Lưu nháp bài viết Writing Task 2 tức thời (kèm số lượng từ và danh sách Target Vocabulary đã dùng)
 */
export function saveWritingDraft(
  day: number,
  text: string,
  usedTargetVocab: string[] = []
): void {
  const data = loadChallengeData();
  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  data.writingDrafts[day] = {
    text,
    wordCount,
    usedTargetVocab,
    lastSaved: Date.now()
  };
  saveChallengeData(data);
}

export function getWritingDraft(day: number): string {
  const data = loadChallengeData();
  return data.writingDrafts[day]?.text || '';
}

export function getWritingDraftRecord(day: number): WritingDraftRecord | null {
  const data = loadChallengeData();
  return data.writingDrafts[day] || null;
}

/**
 * Lưu nháp kịch bản trả lời Speaking (Part 1, Part 2, Part 3) kèm số từ & Target Vocabulary đã dùng
 */
export function saveSpeakingDraft(
  day: number,
  draft: {
    part1Text?: string;
    part2Text?: string;
    part3Text?: string;
    selectedOption?: 'A' | 'B' | 'C';
    usedTargetVocab?: string[];
  }
): void {
  const data = loadChallengeData();
  const existing = data.speakingDrafts?.[day] || { lastSaved: 0 };
  const merged = {
    part1Text: draft.part1Text !== undefined ? draft.part1Text : existing.part1Text || '',
    part2Text: draft.part2Text !== undefined ? draft.part2Text : existing.part2Text || '',
    part3Text: draft.part3Text !== undefined ? draft.part3Text : existing.part3Text || '',
    selectedOption: draft.selectedOption || existing.selectedOption || 'A',
    usedTargetVocab: draft.usedTargetVocab || existing.usedTargetVocab || []
  };
  const combinedText = `${merged.part1Text} ${merged.part2Text} ${merged.part3Text}`.trim();
  const wordCount = combinedText ? combinedText.split(/\s+/).filter(Boolean).length : 0;

  if (!data.speakingDrafts) data.speakingDrafts = {};
  data.speakingDrafts[day] = {
    ...merged,
    wordCount,
    lastSaved: Date.now()
  };
  saveChallengeData(data);
}

export function getSpeakingDraft(day: number): SpeakingDraftRecord {
  const data = loadChallengeData();
  return (
    data.speakingDrafts?.[day] || {
      part1Text: '',
      part2Text: '',
      part3Text: '',
      selectedOption: 'A',
      wordCount: 0,
      usedTargetVocab: [],
      lastSaved: 0
    }
  );
}

/**
 * Đọc và ghi danh sách lịch sử bài viết tổng hợp (`user_writing_logs_v1`)
 */
export function getAllUserWritingLogs(): WritingSubmissionRecord[] {
  try {
    const raw = localStorage.getItem(USER_WRITING_LOGS_STORAGE_KEY);
    const flatLogs: WritingSubmissionRecord[] = raw ? deepNormalizeText(JSON.parse(raw)) : [];
    const data = loadChallengeData();
    const byId = new Map<string, WritingSubmissionRecord>();

    if (Array.isArray(flatLogs)) {
      for (const item of flatLogs) {
        if (item && item.id) byId.set(item.id, item);
      }
    }
    for (const list of Object.values(data.writingHistory || {})) {
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.id && !byId.has(item.id)) byId.set(item.id, item);
        }
      }
    }
    for (const list of Object.values(data.speakingHistory || {})) {
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.id && !byId.has(item.id)) byId.set(item.id, item);
        }
      }
    }

    return Array.from(byId.values()).sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
  } catch {
    return [];
  }
}

function appendToUserWritingLogs(record: WritingSubmissionRecord): void {
  try {
    const current = getAllUserWritingLogs();
    const filtered = current.filter(item => item.id !== record.id);
    const updated = [record, ...filtered].slice(0, 200);
    localStorage.setItem(USER_WRITING_LOGS_STORAGE_KEY, JSON.stringify(updated));
    void dataRepository.syncUserWritingLog(record);
  } catch {}
}

export function saveWritingSubmission(
  day: number,
  submission: Omit<WritingSubmissionRecord, 'id' | 'day' | 'submittedAt'>
): WritingSubmissionRecord {
  const data = loadChallengeData();
  const newRecord: WritingSubmissionRecord = deepNormalizeText({
    ...submission,
    taskType: submission.taskType || 'writing_task2',
    examType: submission.examType || 'IELTS & VSTEP',
    id: `sub_${day}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    day,
    submittedAt: Date.now()
  });

  const list = data.writingHistory[day] || [];
  data.writingHistory[day] = [newRecord, ...list].slice(0, 30);

  // Mark writing as completed
  const current = data.dayStatuses[day] || { vocab: false, writing: false, speaking: false };
  current.writing = true;
  if (current.vocab && current.writing) {
    current.completedAt = current.completedAt || Date.now();
  }
  data.dayStatuses[day] = current;

  const today = getTodayDateString();
  if (data.lastActiveDate !== today) {
    data.streak = (data.streak || 0) + 1;
    data.lastActiveDate = today;
  } else if (!data.streak) {
    data.streak = 1;
  }

  saveChallengeData(data);
  appendToUserWritingLogs(newRecord);
  return newRecord;
}

export function saveSpeakingSubmission(
  day: number,
  submission: Omit<WritingSubmissionRecord, 'id' | 'day' | 'submittedAt'>
): WritingSubmissionRecord {
  const data = loadChallengeData();
  const newRecord: WritingSubmissionRecord = deepNormalizeText({
    ...submission,
    taskType: submission.taskType || 'speaking_full',
    examType: submission.examType || 'IELTS & VSTEP',
    id: `spk_${day}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    day,
    submittedAt: Date.now()
  });

  if (!data.speakingHistory) data.speakingHistory = {};
  const list = data.speakingHistory[day] || [];
  data.speakingHistory[day] = [newRecord, ...list].slice(0, 30);

  // Mark speaking as completed
  const current = data.dayStatuses[day] || { vocab: false, writing: false, speaking: false };
  current.speaking = true;
  data.dayStatuses[day] = current;

  const today = getTodayDateString();
  if (data.lastActiveDate !== today) {
    data.streak = (data.streak || 0) + 1;
    data.lastActiveDate = today;
  } else if (!data.streak) {
    data.streak = 1;
  }

  saveChallengeData(data);
  appendToUserWritingLogs(newRecord);
  return newRecord;
}

export function getWritingHistory(day: number): WritingSubmissionRecord[] {
  const data = loadChallengeData();
  return data.writingHistory[day] || [];
}

export function getSpeakingHistory(day: number): WritingSubmissionRecord[] {
  const data = loadChallengeData();
  return data.speakingHistory?.[day] || [];
}

export function toggleChallengeVocabMastery(wordId: string): boolean {
  const data = loadChallengeData();
  const list = data.masteredVocabIds || [];
  let isNowMastered = false;
  if (list.includes(wordId)) {
    data.masteredVocabIds = list.filter(id => id !== wordId);
    isNowMastered = false;
  } else {
    data.masteredVocabIds = [...list, wordId];
    isNowMastered = true;
  }
  saveChallengeData(data);
  return isNowMastered;
}

export function isChallengeVocabMastered(wordId: string): boolean {
  const data = loadChallengeData();
  return data.masteredVocabIds.includes(wordId);
}

export interface ChallengeOverallSummary {
  activeDay: number;
  completedDays: number;
  extensionCompletedDays: number;
  startedDays: number;
  totalDays: number;
  completedPrimaryTasks: number;
  totalPrimaryTasks: number;
  percentCompleted: number;
  vocabDaysDone: number;
  writingDaysDone: number;
  speakingDaysDone: number;
  masteredWordsCount: number;
  streak: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export function getChallengeOverallSummary(): ChallengeOverallSummary {
  const data = loadChallengeData();
  let completedDays = 0;
  let extensionCompletedDays = 0;
  let startedDays = 0;
  let vocabDaysDone = 0;
  let writingDaysDone = 0;
  let speakingDaysDone = 0;

  // Quét cả 60 ngày cốt lõi và các ngày mở rộng (Day 61+)
  const allDayNumbers = new Set<number>();
  for (let d = 1; d <= 60; d++) allDayNumbers.add(d);
  Object.keys(data.dayStatuses || {}).forEach(k => allDayNumbers.add(Number(k)));
  Object.keys(data.writingDrafts || {}).forEach(k => allDayNumbers.add(Number(k)));
  Object.keys(data.speakingDrafts || {}).forEach(k => allDayNumbers.add(Number(k)));

  allDayNumbers.forEach(d => {
    if (!Number.isFinite(d) || d < 1) return;
    const st = data.dayStatuses[d];
    const hasWritingDraft = Boolean(data.writingDrafts[d]?.text?.trim());
    const spkDraft = data.speakingDrafts?.[d];
    const hasSpeakingDraft = Boolean(
      spkDraft?.part1Text?.trim() || spkDraft?.part2Text?.trim() || spkDraft?.part3Text?.trim()
    );
    const hasDraft = hasWritingDraft || hasSpeakingDraft;

    if (st) {
      if (st.vocab) vocabDaysDone++;
      if (st.writing) writingDaysDone++;
      if (st.speaking) speakingDaysDone++;
      if (st.vocab && st.writing) {
        if (d <= 60) {
          completedDays++;
        } else {
          extensionCompletedDays++;
        }
      }
      if (st.vocab || st.writing || st.speaking || hasDraft) {
        startedDays++;
      }
    } else if (hasDraft) {
      startedDays++;
    }
  });

  const completedPrimaryTasks = vocabDaysDone + writingDaysDone;
  const totalPrimaryTasks = 120; // 60 vocab days + 60 writing days (core track)
  const masteredWordsCount = data.masteredVocabIds.length;

  let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
  if (completedDays >= 60) {
    status = 'completed';
  } else if (
    completedDays > 0 ||
    extensionCompletedDays > 0 ||
    completedPrimaryTasks > 0 ||
    speakingDaysDone > 0 ||
    startedDays > 0 ||
    masteredWordsCount > 0
  ) {
    status = 'in_progress';
  }

  let percentCompleted = 0;
  if (status === 'completed') {
    percentCompleted = 100;
  } else if (completedDays > 0) {
    percentCompleted = Math.min(100, Math.round((completedDays / 60) * 100));
  } else if (completedPrimaryTasks > 0) {
    percentCompleted = Math.max(1, Math.round((completedPrimaryTasks / totalPrimaryTasks) * 100));
  }

  return {
    activeDay: data.activeDay || 1,
    completedDays,
    extensionCompletedDays,
    startedDays,
    totalDays: 60,
    completedPrimaryTasks,
    totalPrimaryTasks,
    percentCompleted,
    vocabDaysDone,
    writingDaysDone,
    speakingDaysDone,
    masteredWordsCount,
    streak: status === 'not_started' ? 0 : data.streak,
    status
  };
}
