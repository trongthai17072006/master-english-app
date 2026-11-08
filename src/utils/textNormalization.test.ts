import assert from 'node:assert/strict';
import {
  normalizeVietnameseText,
  deepNormalizeText,
  hasUnnormalizedVietnameseMarks,
  parseAndNormalizeJSON
} from './textNormalization';
import {
  STORAGE_KEYS,
  getCompletedSessions,
  saveCompletedSession,
  getWordProgressMap,
  saveWordProgress,
  calculateRealStreak
} from '../services/learningStorage';
import {
  loadChallengeData,
  getChallengeOverallSummary,
  updateDayTaskStatus
} from './challengeStorage';

// Minimal in-memory localStorage mock for Node test environment
class LocalStorageMock {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

(globalThis as any).localStorage = new LocalStorageMock();

console.log('=== RUNNING MASTER ENGLISH DATA INTEGRITY & UNICODE TESTS ===');

// 1. Test NFC & NFD normalization + Spaced/Duplicate Combining Marks
{
  const nfdStrings = [
    { input: 'N\u006F\u0302\u0301i T\u01B0\u0300 T\u01B0\u01A1ng T\u0061\u0301c', expected: 'Nối Từ Tương Tác' },
    { input: '4 c\u0061\u0302\u0301p \u0111\u006F\u0302\u0323 c\u01B0\u01A1\u0300ng \u0111\u006F\u0302\u0323 th\u01B0\u0323c t\u0065\u0302\u0301', expected: '4 cấp độ cường độ thực tế' },
    { input: 'S\u0061\u0306\u0301c th\u0061\u0301i t\u01B0\u0300', expected: 'Sắc thái từ' },
    { input: 'L\u006F\u0302\u0323 tr\u0069\u0300nh h\u006F\u0323c t\u0061\u0302\u0323p', expected: 'Lộ trình học tập' },
    { input: 'Ng\u01B0\u0303 c\u0061\u0309nh IELTS', expected: 'Ngữ cảnh IELTS' },
    { input: 'T\u01B0\u0300 v\u01B0\u0323ng v\u0061\u0300 k\u0079\u0303 n\u0061\u0306ng vi\u0065\u0302\u0301t', expected: 'Từ vựng và kỹ năng viết' },
    { input: 'H\u006F\u0302\u0300 s\u01A1', expected: 'Hồ sơ' },
    { input: 'B\u0061\u0306\u0301t \u0111\u0061\u0302\u0300u h\u006F\u0323c', expected: 'Bắt đầu học' },
    // Spaced combining mark artifacts (e.g. "Nố ́ i", "cấ ́ p", "Tuầ ̀n", "Mố ́c")
    { input: 'Nố \u0301i Từ Tương Tác', expected: 'Nối Từ Tương Tác' },
    { input: '4 cấ \u0301p độ cường độ thực tế', expected: '4 cấp độ cường độ thực tế' },
    { input: 'Tuầ \u0300n Đầ \u0300u Tiên', expected: 'Tuần Đầu Tiên' },
    { input: 'Huy Hiệu & Cột Mố \u0301c Danh Dự', expected: 'Huy Hiệu & Cột Mốc Danh Dự' }
  ];

  for (const { input, expected } of nfdStrings) {
    assert.equal(hasUnnormalizedVietnameseMarks(input), true, `Should detect unnormalized marks in: ${input}`);
    const output = normalizeVietnameseText(input);
    assert.equal(output, expected, `Normalized output should strictly equal NFC "${expected}"`);
    assert.equal(output, output.normalize('NFC'), 'Output must be in canonical NFC form');
    assert.equal(hasUnnormalizedVietnameseMarks(output), false, 'Normalized output must have 0 dangling marks');
  }
  console.log('✓ Test 1 Passed: NFC/NFD & spaced/duplicate Vietnamese combining marks normalized accurately.');
}

// 2. Test Empty / Invalid Input & Non-Plain Object Type Preservation + Circular Reference Safety
{
  assert.equal(normalizeVietnameseText(''), '');
  assert.equal(normalizeVietnameseText(null), '');
  assert.equal(normalizeVietnameseText(undefined), '');
  assert.equal(normalizeVietnameseText(42 as any), '');

  const dateObj = new Date('2026-10-29T00:00:00.000Z');
  const regExpObj = /test-[a-z]+/gi;
  const mapObj = new Map([['k', 'v']]);
  const setObj = new Set(['a', 'b']);
  const fnObj = () => 'hello';

  const nested: any = {
    title: 'Ph\u0061\u0302n B\u006F\u0302\u0309 Ho\u0061\u0323t \u0110\u006F\u0302\u0323ng',
    count: 83,
    ratio: 0.835,
    isActive: false,
    emptyStr: '',
    nullable: null,
    undef: undefined,
    createdAt: dateObj,
    pattern: regExpObj,
    lookupMap: mapObj,
    uniqueSet: setObj,
    callback: fnObj,
    tags: ['T\u01B0\u0300 v\u01B0\u0323ng', 'Ng\u01B0\u0303 c\u0061\u0309nh IELTS', 100, true, null]
  };
  // Introduce circular reference
  nested.self = nested;

  const normalized = deepNormalizeText(nested);
  assert.equal(normalized.title, 'Phân Bổ Hoạt Động');
  assert.equal(normalized.count, 83);
  assert.equal(normalized.ratio, 0.835);
  assert.equal(normalized.isActive, false);
  assert.equal(normalized.emptyStr, '');
  assert.equal(normalized.nullable, null);
  assert.equal(normalized.undef, undefined);
  assert.equal(normalized.createdAt, dateObj);
  assert.equal(normalized.pattern, regExpObj);
  assert.equal(normalized.lookupMap, mapObj);
  assert.equal(normalized.uniqueSet, setObj);
  assert.equal(normalized.callback, fnObj);
  assert.deepEqual(normalized.tags, ['Từ vựng', 'Ngữ cảnh IELTS', 100, true, null]);
  assert.equal(normalized.self, normalized, 'Circular reference must be preserved without infinite recursion');

  const fallback = parseAndNormalizeJSON('{invalid json', { ok: false, label: 'M\u0061\u0306\u0323c \u0111\u0069\u0323nh' });
  assert.deepEqual(fallback, { ok: false, label: 'Mặc định' });
  console.log('✓ Test 2 Passed: Deep normalization preserves numbers, booleans, null/undefined, Date/Map/Set/RegExp, and handles circular references.');
}

// 3. Test Storage Read/Write Normalization & Exact STORAGE_KEYS Preservation
{
  assert.equal(STORAGE_KEYS.SESSIONS, 'master_english_sessions_v2');
  assert.equal(STORAGE_KEYS.ACTIVE_SESSION, 'master_english_active_session_v2');
  assert.equal(STORAGE_KEYS.WORD_PROGRESS, 'master_english_word_progress_v2');
  assert.equal(STORAGE_KEYS.THEME, 'master_english_theme_v2');

  globalThis.localStorage.clear();

  // New user state: 0 sessions, 0 streak
  assert.equal(getCompletedSessions().length, 0);
  assert.deepEqual(calculateRealStreak([]), { currentStreak: 0, bestStreak: 0 });

  // Save session with NFD Vietnamese strings and verify read-back is NFC
  saveCompletedSession({
    id: 'sess-1',
    startTime: 1730188800000,
    endTime: 1730189400000,
    durationSeconds: 600,
    dateString: '2026-10-29',
    wordsMastered: ['w1'],
    wordsReviewed: ['w1'],
    quizQuestionsAnswered: 10,
    quizQuestionsCorrect: 9,
    flashcardsFlipped: 3,
    mistakesResolved: 1,
    status: 'completed',
    topics: ['N\u006F\u0302\u0301i T\u01B0\u0300 T\u01B0\u01A1ng T\u0061\u0301c', 'Ng\u01B0\u0303 c\u0061\u0309nh IELTS']
  });

  const loadedSessions = getCompletedSessions();
  assert.equal(loadedSessions.length, 1);
  assert.deepEqual(loadedSessions[0].topics, ['Nối Từ Tương Tác', 'Ngữ cảnh IELTS']);

  saveWordProgress({
    wordId: 'w1',
    word: 'discrepancy',
    meaning: 'S\u01B0\u0323 kh\u0061\u0301c bi\u0065\u0302\u0323t, b\u0061\u0302\u0301t \u0111\u006F\u0302\u0300ng',
    status: 'mastered',
    timesReviewed: 2,
    lastReviewedAt: 1730189400000,
    firstMasteredAt: 1730189000000,
    history: []
  });

  const loadedProgress = getWordProgressMap();
  assert.equal(loadedProgress.w1.meaning, 'Sự khác biệt, bất đồng');
  console.log('✓ Test 3 Passed: Storage read/write boundaries normalize Vietnamese strings and preserve exact localStorage keys.');
}

// 4. Test 60-Day Challenge Progress & Eliminate Fake 83% Default
{
  globalThis.localStorage.clear();

  // Unstarted user must have 0% progress, 0 streak, and status = 'not_started'
  const initialChallenge = loadChallengeData();
  assert.equal(initialChallenge.streak, 0, 'Unstarted user must have streak = 0');
  const initialSummary = getChallengeOverallSummary();
  assert.equal(initialSummary.percentCompleted, 0, 'Unstarted user must have 0% progress (not 83%)');
  assert.equal(initialSummary.completedDays, 0);
  assert.equal(initialSummary.completedPrimaryTasks, 0);
  assert.equal(initialSummary.status, 'not_started');

  // Complete Day 1 Vocab only -> 1 / 120 primary tasks = 1%, status = 'in_progress'
  updateDayTaskStatus(1, 'vocab', true);
  const partialSummary = getChallengeOverallSummary();
  assert.equal(partialSummary.completedDays, 0);
  assert.equal(partialSummary.startedDays, 1);
  assert.equal(partialSummary.completedPrimaryTasks, 1);
  assert.equal(partialSummary.percentCompleted, 1);
  assert.equal(partialSummary.status, 'in_progress');

  // Complete Day 1 Writing -> Day 1 fully completed (2 / 120 primary tasks = 2%)
  updateDayTaskStatus(1, 'writing', true);
  const day1DoneSummary = getChallengeOverallSummary();
  assert.equal(day1DoneSummary.completedDays, 1);
  assert.equal(day1DoneSummary.completedPrimaryTasks, 2);
  assert.equal(day1DoneSummary.percentCompleted, 2);
  assert.equal(day1DoneSummary.status, 'in_progress');

  console.log('✓ Test 4 Passed: 60-Day Challenge progress accurately reflects 0% when not_started and real task completion when in_progress.');
}

console.log('=== ALL TESTS PASSED SUCCESSFULLY ===');
