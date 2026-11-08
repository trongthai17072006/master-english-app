import { getLocalDateString, getCompletedSessions } from './learningStorage';
import {
  loadChallengeData,
  getCanonicalActiveDay,
  CANONICAL_ACTIVE_DAY_KEY
} from '../utils/challengeStorage';
import { deepNormalizeText } from '../utils/textNormalization';
import { dataRepository } from './dataRepository';

export const CORE_TASK_IDS = {
  COLLOCATIONS: 'task_collocations',
  MISTAKES: 'task_mistakes',
  CHALLENGE_60: 'task_challenge_60',
  VOCAB_15: 'task_vocab_15'
} as const;

export type CoreTaskId = (typeof CORE_TASK_IDS)[keyof typeof CORE_TASK_IDS];

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  status?: 'done' | 'in_progress' | 'todo';
  isCore?: boolean;
}

export interface RoadmapDay {
  dayNumber: number; // 1 -> 60
  tasks: TaskItem[]; // 4 core tasks (+ any custom tasks)
  rewardClaimed: boolean; // Idempotency guard: prevents duplicate level up on the same dayNumber
  completedAt?: number;
}

export interface LearningUserState {
  name: string;
  level: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export interface LearningState {
  user: LearningUserState;
  roadmapDays: Record<number, RoadmapDay>;
  currentDayNumber: number;
  session: {
    isRunning: boolean;
    startTime: number | null;
    elapsedSeconds: number;
  };
  // Actions
  completeTask: (dayNumber: number, taskId: string) => void;
  checkAndAwardLevel: (dayNumber: number) => void;
  startSession: () => void;
  pauseSession: () => void;
  endSession: () => void;
}

export interface PersistedMilestoneStore {
  user: LearningUserState;
  roadmapDays: Record<number, RoadmapDay>;
  currentDayNumber: number;
}

export const MILESTONE_STORAGE_KEY = 'master_english_milestone_store_v1';

export function createDefaultTasksForDay(dayNumber: number): TaskItem[] {
  return [
    {
      id: CORE_TASK_IDS.COLLOCATIONS,
      title: 'Luyện Collocations & Giới từ cố định',
      completed: false,
      status: 'in_progress',
      isCore: true
    },
    {
      id: CORE_TASK_IDS.MISTAKES,
      title: 'Ôn tập các câu trong Ngân hàng lỗi sai',
      completed: false,
      status: 'todo',
      isCore: true
    },
    {
      id: CORE_TASK_IDS.CHALLENGE_60,
      title:
        dayNumber > 1
          ? `Hoàn thành bài tập Lộ trình 60 ngày (Ngày ${dayNumber})`
          : 'Hoàn thành bài tập Lộ trình 60 ngày',
      completed: false,
      status: 'todo',
      isCore: true
    },
    {
      id: CORE_TASK_IDS.VOCAB_15,
      title: 'Tra cứu và ghi nhớ 15 từ vựng học thuật',
      completed: false,
      status: 'todo',
      isCore: true
    }
  ];
}

export function createDefaultRoadmapDay(dayNumber: number): RoadmapDay {
  return {
    dayNumber,
    tasks: createDefaultTasksForDay(dayNumber),
    rewardClaimed: false
  };
}

function getYesterdayDateString(todayDate = new Date()): string {
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
}

/**
 * Computes whether a RoadmapDay has completed all 4 required milestone tasks.
 * Checks the 4 core tasks first; if user customized/deleted some core tasks,
 * requires at least 4 completed tasks or all 4 core tasks completed.
 */
export function isRoadmapDayFullyCompleted(day: RoadmapDay | undefined): boolean {
  if (!day || !Array.isArray(day.tasks) || day.tasks.length === 0) return false;

  const coreTasks = day.tasks.filter(t => t.isCore);
  if (coreTasks.length === 4) {
    return coreTasks.every(t => Boolean(t.completed));
  }

  const completedCount = day.tasks.filter(t => Boolean(t.completed)).length;
  return day.tasks.length >= 4 ? completedCount >= 4 : false;
}

export function getDayTaskProgress(day: RoadmapDay | undefined): {
  completedCount: number;
  totalCount: number;
  coreCompletedCount: number;
  coreTotalCount: number;
  isComplete: boolean;
} {
  if (!day || !Array.isArray(day.tasks)) {
    return {
      completedCount: 0,
      totalCount: 4,
      coreCompletedCount: 0,
      coreTotalCount: 4,
      isComplete: false
    };
  }
  const coreTasks = day.tasks.filter(t => t.isCore);
  const coreCompletedCount = coreTasks.filter(t => t.completed).length;
  const completedCount = day.tasks.filter(t => t.completed).length;
  const totalCount = day.tasks.length;
  return {
    completedCount,
    totalCount,
    coreCompletedCount,
    coreTotalCount: coreTasks.length || 4,
    isComplete: isRoadmapDayFullyCompleted(day)
  };
}

/**
 * Reconciles user level strictly from idempotent claimed day milestones:
 * Base Level = 1 + number of roadmap days with rewardClaimed === true.
 */
export function calculateVerifiedLevel(roadmapDays: Record<number, RoadmapDay>): number {
  let claimedCount = 0;
  for (let d = 1; d <= 60; d++) {
    if (roadmapDays[d]?.rewardClaimed === true) {
      claimedCount += 1;
    }
  }
  return 1 + claimedCount;
}

export function createCleanMilestoneStore(userName = ''): PersistedMilestoneStore {
  const roadmapDays: Record<number, RoadmapDay> = {};
  for (let d = 1; d <= 60; d++) {
    roadmapDays[d] = createDefaultRoadmapDay(d);
  }
  return {
    user: {
      name: userName,
      level: 1,
      streak: 0,
      lastActiveDate: ''
    },
    roadmapDays,
    currentDayNumber: 1
  };
}

/**
 * Loads the persisted Milestone Store from scoped localStorage, migrating any legacy todos
 * or challenge state on first initialization.
 */
export function loadMilestoneStore(defaultUserName = ''): PersistedMilestoneStore {
  const todayStr = getLocalDateString(new Date());
  const yesterdayStr = getYesterdayDateString(new Date());

  try {
    const raw = localStorage.getItem(MILESTONE_STORAGE_KEY);
    if (raw) {
      const parsed = deepNormalizeText(JSON.parse(raw)) as Partial<PersistedMilestoneStore>;
      const roadmapDays: Record<number, RoadmapDay> = {};

      for (let d = 1; d <= 60; d++) {
        const existingDay = parsed.roadmapDays?.[d];
        if (existingDay && Array.isArray(existingDay.tasks) && existingDay.tasks.length > 0) {
          roadmapDays[d] = {
            dayNumber: d,
            tasks: existingDay.tasks.map(t => ({
              id: String(t.id),
              title: String(t.title),
              completed: Boolean(t.completed),
              status: t.completed ? 'done' : t.status || 'todo',
              isCore: Boolean(t.isCore)
            })),
            rewardClaimed: Boolean(existingDay.rewardClaimed),
            completedAt: existingDay.completedAt
          };
        } else {
          roadmapDays[d] = createDefaultRoadmapDay(d);
        }
      }

      const verifiedLevel = Math.max(
        1,
        calculateVerifiedLevel(roadmapDays),
        typeof parsed.user?.level === 'number' ? parsed.user.level : 1
      );

      // Reconcile calendar streak: if lastActiveDate is older than yesterday, streak resets to 0 until next activity
      let savedStreak = typeof parsed.user?.streak === 'number' ? parsed.user.streak : 0;
      const savedLastActive = parsed.user?.lastActiveDate || '';
      if (!savedLastActive || (savedLastActive !== todayStr && savedLastActive !== yesterdayStr)) {
        savedStreak = 0;
      }

      const currentDayNumber = getCanonicalActiveDay(
        Math.max(1, Math.min(60, Number(parsed.currentDayNumber) || 1))
      );

      if (parsed.currentDayNumber !== currentDayNumber) {
        try {
          localStorage.setItem(
            MILESTONE_STORAGE_KEY,
            JSON.stringify({ ...parsed, currentDayNumber })
          );
        } catch {}
      }

      const savedName = parsed.user?.name || '';
      const resolvedName =
        defaultUserName ||
        (savedName === 'Đoàn Trọng Thái' || savedName === 'Nguyễn Trọng Thái' ? '' : savedName);

      return {
        user: {
          name: resolvedName,
          level: verifiedLevel,
          streak: savedStreak,
          lastActiveDate: savedLastActive
        },
        roadmapDays,
        currentDayNumber
      };
    }
  } catch (err) {
    console.error('Failed to load milestone store, initializing fresh store', err);
  }

  // First-time initialization: seed from existing challengeData & legacy workspace todos
  const challengeData = loadChallengeData();
  const initialDay = getCanonicalActiveDay(challengeData.activeDay || 1);
  const roadmapDays: Record<number, RoadmapDay> = {};

  for (let d = 1; d <= 60; d++) {
    const dayObj = createDefaultRoadmapDay(d);
    const chStatus = challengeData.dayStatuses?.[d];
    if (chStatus?.vocab && chStatus?.writing) {
      // Mark challenge 60 task & vocab task done if already completed in challenge storage
      dayObj.tasks = dayObj.tasks.map(t =>
        t.id === CORE_TASK_IDS.CHALLENGE_60 || t.id === CORE_TASK_IDS.VOCAB_15
          ? { ...t, completed: true, status: 'done' }
          : t
      );
    }
    roadmapDays[d] = dayObj;
  }

  // Migrate legacy workspace todos into Day 1 if present
  try {
    const legacyTodosRaw = localStorage.getItem('master_english_workspace_todos_v1');
    if (legacyTodosRaw) {
      const legacyTodos = JSON.parse(legacyTodosRaw);
      if (Array.isArray(legacyTodos) && legacyTodos.length > 0) {
        const day1Tasks = [...roadmapDays[initialDay].tasks];
        legacyTodos.forEach((lt: any, idx: number) => {
          const text = String(lt.text || '').trim();
          const done = Boolean(lt.done);
          if (idx < 4 && day1Tasks[idx]) {
            day1Tasks[idx] = {
              ...day1Tasks[idx],
              title: text || day1Tasks[idx].title,
              completed: done,
              status: done ? 'done' : lt.status || 'todo'
            };
          } else if (text) {
            day1Tasks.push({
              id: `custom_${lt.id || Date.now()}_${idx}`,
              title: text,
              completed: done,
              status: done ? 'done' : lt.status || 'todo',
              isCore: false
            });
          }
        });
        roadmapDays[initialDay].tasks = day1Tasks;
      }
    }
  } catch {}

  // Derive initial streak from completedSessions or challengeData
  const sessions = getCompletedSessions();
  let initialStreak = challengeData.streak || 0;
  let initialLastActiveDate = challengeData.lastActiveDate || '';

  if (sessions.length > 0) {
    const latestSessionDate = sessions[0].dateString;
    if (latestSessionDate === todayStr || latestSessionDate === yesterdayStr) {
      if (!initialLastActiveDate || latestSessionDate > initialLastActiveDate) {
        initialLastActiveDate = latestSessionDate;
      }
      if (initialStreak === 0) {
        initialStreak = 1;
      }
    }
  }

  if (
    initialLastActiveDate &&
    initialLastActiveDate !== todayStr &&
    initialLastActiveDate !== yesterdayStr
  ) {
    initialStreak = 0;
  }

  // Check if initialDay already has 4/4 completed without claiming reward yet
  let initialLevel = 1;
  for (let d = 1; d <= 60; d++) {
    if (isRoadmapDayFullyCompleted(roadmapDays[d])) {
      roadmapDays[d].rewardClaimed = true;
      roadmapDays[d].completedAt = Date.now();
      initialLevel += 1;
    }
  }

  const initialStore: PersistedMilestoneStore = {
    user: {
      name: defaultUserName,
      level: initialLevel,
      streak: initialStreak,
      lastActiveDate: initialLastActiveDate
    },
    roadmapDays,
    currentDayNumber: initialDay
  };

  saveMilestoneStore(initialStore);
  return initialStore;
}

export function saveMilestoneStore(store: PersistedMilestoneStore): void {
  try {
    const clampedDay = Math.max(1, Math.min(60, Number(store.currentDayNumber) || 1));
    const normalized = deepNormalizeText({
      ...store,
      currentDayNumber: clampedDay
    });
    localStorage.setItem(CANONICAL_ACTIVE_DAY_KEY, String(clampedDay));
    localStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify(normalized));

    // Also keep ielts_60_day_challenge_state_v1.activeDay strictly in sync
    const rawCh = localStorage.getItem('ielts_60_day_challenge_state_v1');
    if (rawCh) {
      try {
        const parsedCh = JSON.parse(rawCh);
        if (parsedCh && parsedCh.activeDay !== clampedDay) {
          parsedCh.activeDay = clampedDay;
          localStorage.setItem('ielts_60_day_challenge_state_v1', JSON.stringify(parsedCh));
        }
      } catch {}
    }

    // Also mirror currentDayNumber tasks to legacy key for backward compatibility with backup service
    const currentDay = normalized.roadmapDays[normalized.currentDayNumber];
    if (currentDay && Array.isArray(currentDay.tasks)) {
      const legacyFormat = currentDay.tasks.map((t, index) => ({
        id: index + 1,
        taskId: t.id,
        text: t.title,
        date: `Ngày ${normalized.currentDayNumber}`,
        done: t.completed,
        status: t.completed ? 'done' : t.status || 'todo',
        isCore: t.isCore
      }));
      localStorage.setItem('master_english_workspace_todos_v1', JSON.stringify(legacyFormat));
      void dataRepository.syncWorkspaceTodosList(legacyFormat);
    }
  } catch (err) {
    console.error('Failed to save milestone store', err);
  }
}

/**
 * Updates Calendar Streak when the user completes at least 1 task or 1 study session today.
 * Rules:
 * - If lastActiveDate === today: keep current streak (minimum 1).
 * - If lastActiveDate === yesterday: streak += 1, lastActiveDate = today.
 * - If missed >= 1 calendar day (or never active): streak = 1, lastActiveDate = today.
 */
export function applyDailyStreakUpdate(user: LearningUserState): {
  updatedUser: LearningUserState;
  streakIncremented: boolean;
} {
  const todayStr = getLocalDateString(new Date());
  const yesterdayStr = getYesterdayDateString(new Date());

  if (user.lastActiveDate === todayStr) {
    const ensuredStreak = Math.max(1, user.streak || 1);
    return {
      updatedUser: {
        ...user,
        streak: ensuredStreak,
        lastActiveDate: todayStr
      },
      streakIncremented: ensuredStreak !== user.streak
    };
  }

  if (user.lastActiveDate === yesterdayStr) {
    return {
      updatedUser: {
        ...user,
        streak: Math.max(1, (user.streak || 0) + 1),
        lastActiveDate: todayStr
      },
      streakIncremented: true
    };
  }

  // Missed at least one day or first time studying
  return {
    updatedUser: {
      ...user,
      streak: 1,
      lastActiveDate: todayStr
    },
    streakIncremented: true
  };
}

/**
 * Idempotent Milestone Level Evaluation for a given dayNumber (1 -> 60).
 * - Only awards +1 Level if dayNumber has 100% (4/4 core tasks) completed AND rewardClaimed === false.
 * - Sets rewardClaimed = true permanently so unchecking/rechecking can NEVER grant duplicate levels.
 */
export function evaluateDayMilestoneLevelUp(
  store: PersistedMilestoneStore,
  dayNumber: number
): {
  updatedStore: PersistedMilestoneStore;
  leveledUp: boolean;
  newLevel: number;
  claimedDayNumber: number | null;
} {
  const clampedDay = Math.max(1, Math.min(60, dayNumber));
  const targetDay = store.roadmapDays[clampedDay] || createDefaultRoadmapDay(clampedDay);

  if (targetDay.rewardClaimed) {
    // Already claimed — strictly idempotent, never award again
    return {
      updatedStore: store,
      leveledUp: false,
      newLevel: store.user.level,
      claimedDayNumber: null
    };
  }

  if (!isRoadmapDayFullyCompleted(targetDay)) {
    // Less than 100% (< 4/4 tasks) — strictly do not increase level
    return {
      updatedStore: store,
      leveledUp: false,
      newLevel: store.user.level,
      claimedDayNumber: null
    };
  }

  // 4/4 tasks completed AND rewardClaimed === false -> Award +1 Level!
  const updatedDay: RoadmapDay = {
    ...targetDay,
    rewardClaimed: true,
    completedAt: Date.now()
  };

  const nextRoadmapDays: Record<number, RoadmapDay> = {
    ...store.roadmapDays,
    [clampedDay]: updatedDay
  };

  const nextLevel = Math.max(store.user.level + 1, calculateVerifiedLevel(nextRoadmapDays));

  const updatedStore: PersistedMilestoneStore = {
    ...store,
    user: {
      ...store.user,
      level: nextLevel
    },
    roadmapDays: nextRoadmapDays
  };

  return {
    updatedStore,
    leveledUp: true,
    newLevel: nextLevel,
    claimedDayNumber: clampedDay
  };
}
