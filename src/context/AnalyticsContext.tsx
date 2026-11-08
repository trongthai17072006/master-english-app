import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, Flame, Sparkles, ArrowRight, X } from 'lucide-react';
import {
  SessionRecord,
  ActiveSessionState,
  WordProgressRecord,
  getCompletedSessions,
  saveCompletedSession,
  getActiveSession,
  saveActiveSession,
  getWordProgressMap,
  recordWordInteraction,
  calculateRealStreak,
  getLocalDateString,
  getSavedThemePreference,
  saveThemePreference
} from '../services/learningStorage';
import {
  CORE_TASK_IDS,
  TaskItem,
  RoadmapDay,
  LearningUserState,
  PersistedMilestoneStore,
  loadMilestoneStore,
  saveMilestoneStore,
  createCleanMilestoneStore,
  applyDailyStreakUpdate,
  evaluateDayMilestoneLevelUp,
  createDefaultRoadmapDay
} from '../services/milestoneEngine';
import {
  triggerPostSessionAutoEmail,
  AutoEmailResult
} from '../services/gmailService';
import { VOCAB_DATABASE } from '../data/vocabularyData';
import { getMistakes } from '../utils/storage';
import {
  getChallengeOverallSummary,
  ChallengeOverallSummary,
  setActiveChallengeDay
} from '../utils/challengeStorage';
import { deepNormalizeText, normalizeVietnameseText } from '../utils/textNormalization';
import { dataRepository } from '../services/dataRepository';
import { playTier4Stamp, playTier5TimerBell } from '../utils/soundManager';
import {
  getActiveAuthUser,
  deriveCleanDisplayName,
  AUTH_USER_CHANGED_EVENT,
  OWNER_EMAIL,
  ActiveAuthUserIdentity
} from '../utils/userStorageScope';

export interface UserProfileData {
  name: string;
  email: string;
  gender: string;
  dob: string;
  location: string;
  studentCategory: string;
  currentLevel: string;
  examTarget: string;
  targetBand: string;
  wordsPerSessionGoal: number;
  dailyStudyMinutesGoal: number;
  avatarPose: string;
  customAvatarUrl?: string;
  membership: string;
}

export interface LevelUpCelebrationData {
  dayNumber: number;
  newLevel: number;
}

interface AnalyticsContextType {
  // Theme (Light default, Dark optional)
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Milestone & Centralized LearningState Store (Section IV)
  user: LearningUserState;
  userLevel: number;
  roadmapDays: Record<number, RoadmapDay>;
  currentDayNumber: number;
  setCurrentDayNumber: (dayNumber: number) => void;
  session: {
    isRunning: boolean;
    startTime: number | null;
    elapsedSeconds: number;
  };
  completeTask: (dayNumber: number, taskId: string) => void;
  toggleTask: (dayNumber: number, taskId: string) => void;
  cycleTaskStatus: (dayNumber: number, taskId: string) => void;
  updateTaskTitle: (dayNumber: number, taskId: string, newTitle: string) => void;
  addCustomTask: (dayNumber: number, title: string) => void;
  deleteTask: (dayNumber: number, taskId: string) => void;
  checkAndAwardLevel: (dayNumber: number) => boolean;
  levelUpModalData: LevelUpCelebrationData | null;
  closeLevelUpModal: () => void;

  // Session Management (Active Session Engine & Unified Focus Timer)
  activeSession: ActiveSessionState | null;
  activeSessionSeconds: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  targetMinutes: number;
  setTargetMinutes: (mins: number) => void;
  isRunning: boolean;
  togglePause: (modeLabel?: string) => void;
  endAndSaveSession: () => SessionRecord | null;
  formattedActiveSessionTime: string;
  isSessionActive: boolean;
  isSessionPaused: boolean;
  startSession: (initialMode?: string, targetMinutes?: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => SessionRecord | null;

  // Historical Data (Strictly Real & Synchronized)
  completedSessions: SessionRecord[];
  wordProgressMap: Record<string, WordProgressRecord>;
  totalUniqueMasteredWords: number;
  totalUniqueWordsInDatabase: number;
  realStreak: number;
  bestStreak: number;
  totalValidStudySecondsAllTime: number;
  mistakesCount: number;
  challengeSummary: ChallengeOverallSummary;
  refreshStorageState: () => void;

  // Real-time Event Recorders
  recordLearningWord: (
    wordId: string,
    word: string,
    action: 'mastered' | 'unmastered' | 'reviewed',
    mode?: string,
    extra?: { ipa?: string; meaning?: string; level?: string }
  ) => void;
  recordQuizEvent: (
    wordId: string,
    word: string,
    isCorrect: boolean,
    mode: string,
    extra?: { ipa?: string; meaning?: string }
  ) => void;
  recordFlashcardFlip: (wordId: string, word: string) => void;
  recordMistakeCleared: (wordId: string) => void;

  // Post-Session Summary Modal & Auto-Email Report State
  lastCompletedSession: SessionRecord | null;
  isSummaryModalOpen: boolean;
  closeSummaryModal: () => void;
  lastEmailReportStatus: AutoEmailResult | null;
  isAutoSendingEmail: boolean;
  retryLastSessionEmail: () => Promise<AutoEmailResult | null>;

  // User Profile
  userProfile: UserProfileData;
  updateUserProfile: (data: Partial<UserProfileData>) => void;
  profileCompletionPercent: number;

  // Toast System
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const defaultProfile: UserProfileData = {
  name: '',
  email: '',
  gender: '',
  dob: '',
  location: '',
  studentCategory: '',
  currentLevel: 'Upper-Intermediate (Band 7.0)',
  examTarget: 'IELTS Academic',
  targetBand: 'BAND 7.0+',
  wordsPerSessionGoal: 15,
  dailyStudyMinutesGoal: 45,
  avatarPose: 'welcome-heart',
  customAvatarUrl: '',
  membership: 'MASTER English Lifetime Pro'
};

function sanitizeLegacyProfile(rawProfile: Partial<UserProfileData>): UserProfileData {
  const merged = deepNormalizeText({ ...defaultProfile, ...rawProfile });
  const activeUser = getActiveAuthUser();
  const isOwnerActive = activeUser?.email?.toLowerCase().trim() === OWNER_EMAIL;

  const isLegacyHardcoded =
    merged.email === OWNER_EMAIL ||
    merged.name === 'Đoàn Trọng Thái' ||
    merged.name === 'Nguyễn Trọng Thái' ||
    merged.name === 'Nguyễn Minh Anh';

  if (isLegacyHardcoded && !isOwnerActive) {
    merged.name = activeUser ? deriveCleanDisplayName(activeUser.email, activeUser.name) : '';
    merged.email = activeUser?.email || '';
    merged.gender = '';
    merged.dob = '';
    merged.location = '';
    merged.studentCategory = '';
  } else if (activeUser) {
    if (!merged.email || merged.email.toLowerCase().trim() !== activeUser.email.toLowerCase().trim()) {
      merged.email = activeUser.email;
    }
    if (!merged.name?.trim()) {
      merged.name = deriveCleanDisplayName(activeUser.email, activeUser.name);
    }
  }

  if (merged.targetBand && merged.targetBand.includes('8.5')) {
    merged.targetBand = merged.targetBand.replace('8.5+', '7.0+').replace('8.5', '7.0+');
  }
  return merged;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Theme State: Default to 'light'
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return getSavedThemePreference() === 'dark';
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      saveThemePreference(next ? 'dark' : 'light');
      return next;
    });
  };

  // Profile
  const [userProfile, setUserProfile] = useState<UserProfileData>(() => {
    const activeUser = getActiveAuthUser();
    try {
      const saved = localStorage.getItem('master_english_user_profile_v2');
      if (saved) {
        const cleaned = sanitizeLegacyProfile(JSON.parse(saved));
        localStorage.setItem('master_english_user_profile_v2', JSON.stringify(cleaned));
        return cleaned;
      }
    } catch {}
    if (activeUser) {
      const initialForUser = sanitizeLegacyProfile({
        name: deriveCleanDisplayName(activeUser.email, activeUser.name),
        email: activeUser.email
      });
      try {
        localStorage.setItem('master_english_user_profile_v2', JSON.stringify(initialForUser));
      } catch {}
      return initialForUser;
    }
    return deepNormalizeText(defaultProfile);
  });

  // 2. Centralized Milestone Store (Level, Calendar Streak, 60 Roadmap Days)
  const [milestoneStore, setMilestoneStore] = useState<PersistedMilestoneStore>(() =>
    loadMilestoneStore(userProfile.name)
  );
  const [levelUpModalData, setLevelUpModalData] = useState<LevelUpCelebrationData | null>(null);

  // 3. Real Stored Data States
  const [completedSessions, setCompletedSessions] = useState<SessionRecord[]>(() =>
    getCompletedSessions()
  );
  const [wordProgressMap, setWordProgressMap] = useState<Record<string, WordProgressRecord>>(() =>
    getWordProgressMap()
  );
  const [mistakesCount, setMistakesCount] = useState<number>(() => getMistakes().length);
  const [challengeSummary, setChallengeSummary] = useState<ChallengeOverallSummary>(() =>
    getChallengeOverallSummary()
  );

  // 4. Active Session State (Single Source of Truth for all clocks)
  const [activeSession, setActiveSession] = useState<ActiveSessionState | null>(() => {
    const existing = getActiveSession();
    if (existing) return existing;
    const now = Date.now();
    const initialGoal = userProfile.dailyStudyMinutesGoal || 45;
    const autoStarted: ActiveSessionState = {
      id: `session_${now}_${Math.random().toString(36).substring(2, 6)}`,
      startTime: now,
      lastActiveTimestamp: now,
      accumulatedSeconds: 0,
      targetMinutes: initialGoal,
      status: 'active',
      pausedAt: null,
      topics: ['Academic Focus'],
      wordsMastered: [],
      wordsReviewed: [],
      quizQuestionsAnswered: 0,
      quizQuestionsCorrect: 0,
      flashcardsFlipped: 0,
      mistakesResolved: 0
    };
    saveActiveSession(autoStarted);
    return autoStarted;
  });
  const [activeSessionSeconds, setActiveSessionSeconds] = useState<number>(() => {
    const saved = getActiveSession();
    return saved ? saved.accumulatedSeconds : 0;
  });
  const [targetMinutesState, setTargetMinutesState] = useState<number>(() => {
    const saved = getActiveSession();
    return saved?.targetMinutes || userProfile.dailyStudyMinutesGoal || 45;
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    const normalizedMsg = normalizeVietnameseText(msg);
    setToastMessage(normalizedMsg);
    setTimeout(() => {
      setToastMessage(prev => (prev === normalizedMsg ? null : prev));
    }, 4500);
  }, []);

  const triggerLevelUpCelebration = useCallback(
    (dayNumber: number, newLevel: number) => {
      setLevelUpModalData({ dayNumber, newLevel });
      showToast(
        `🎉 Chúc mừng! Bạn đã hoàn thành 4/4 nhiệm vụ Ngày ${dayNumber} và đạt Level ${newLevel}!`
      );
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    },
    [showToast]
  );

  // Milestone Store Actions (Idempotent Level Engine + Calendar Streak Engine)
  const setCurrentDayNumber = useCallback((dayNumber: number) => {
    const clamped = Math.max(1, Math.min(60, dayNumber));
    setActiveChallengeDay(clamped);
    setChallengeSummary(getChallengeOverallSummary());
    setMilestoneStore(prev => {
      const next: PersistedMilestoneStore = {
        ...prev,
        currentDayNumber: clamped,
        roadmapDays: {
          ...prev.roadmapDays,
          [clamped]: prev.roadmapDays[clamped] || createDefaultRoadmapDay(clamped)
        }
      };
      saveMilestoneStore(next);
      return next;
    });
  }, []);

  const checkAndAwardLevel = useCallback(
    (dayNumber: number): boolean => {
      let didLevelUp = false;
      let awardedLevel = 1;
      const clampedDay = Math.max(1, Math.min(60, dayNumber));

      setMilestoneStore(prev => {
        const result = evaluateDayMilestoneLevelUp(prev, clampedDay);
        if (result.leveledUp) {
          didLevelUp = true;
          awardedLevel = result.newLevel;
          saveMilestoneStore(result.updatedStore);
          return result.updatedStore;
        }
        return prev;
      });

      if (didLevelUp) {
        triggerLevelUpCelebration(clampedDay, awardedLevel);
      }
      return didLevelUp;
    },
    [triggerLevelUpCelebration]
  );

  const completeTask = useCallback(
    (dayNumber: number, taskId: string) => {
      const clampedDay = Math.max(1, Math.min(60, dayNumber));
      let didLevelUp = false;
      let awardedLevel = 1;
      let newlyCompletedTitle: string | null = null;

      setMilestoneStore(prev => {
        const dayObj = prev.roadmapDays[clampedDay] || createDefaultRoadmapDay(clampedDay);
        const existingTask = dayObj.tasks.find(t => t.id === taskId);
        if (existingTask && existingTask.completed) {
          // Already completed; still ensure level check is evaluated idempotently
          const evalRes = evaluateDayMilestoneLevelUp(prev, clampedDay);
          if (evalRes.leveledUp) {
            didLevelUp = true;
            awardedLevel = evalRes.newLevel;
            saveMilestoneStore(evalRes.updatedStore);
            return evalRes.updatedStore;
          }
          return prev;
        }

        const updatedTasks = dayObj.tasks.map(t => {
          if (t.id === taskId) {
            newlyCompletedTitle = t.title;
            return { ...t, completed: true, status: 'done' as const };
          }
          return t;
        });

        const { updatedUser } = applyDailyStreakUpdate(prev.user);

        const intermediateStore: PersistedMilestoneStore = {
          ...prev,
          user: updatedUser,
          roadmapDays: {
            ...prev.roadmapDays,
            [clampedDay]: {
              ...dayObj,
              tasks: updatedTasks
            }
          }
        };

        const evalRes = evaluateDayMilestoneLevelUp(intermediateStore, clampedDay);
        if (evalRes.leveledUp) {
          didLevelUp = true;
          awardedLevel = evalRes.newLevel;
        }
        saveMilestoneStore(evalRes.updatedStore);
        return evalRes.updatedStore;
      });

      if (didLevelUp) {
        playTier4Stamp();
        triggerLevelUpCelebration(clampedDay, awardedLevel);
      } else if (newlyCompletedTitle) {
        playTier4Stamp();
        showToast(`✅ Đã hoàn thành nhiệm vụ: "${newlyCompletedTitle}"`);
      }
    },
    [showToast, triggerLevelUpCelebration]
  );

  const toggleTask = useCallback(
    (dayNumber: number, taskId: string) => {
      const clampedDay = Math.max(1, Math.min(60, dayNumber));
      let didLevelUp = false;
      let awardedLevel = 1;

      setMilestoneStore(prev => {
        const dayObj = prev.roadmapDays[clampedDay] || createDefaultRoadmapDay(clampedDay);
        let becameCompleted = false;

        const updatedTasks = dayObj.tasks.map(t => {
          if (t.id !== taskId) return t;
          const nextCompleted = !t.completed;
          if (nextCompleted) becameCompleted = true;
          return {
            ...t,
            completed: nextCompleted,
            status: (nextCompleted ? 'done' : 'todo') as 'done' | 'todo'
          };
        });

        const nextUser = becameCompleted
          ? applyDailyStreakUpdate(prev.user).updatedUser
          : prev.user;

        const intermediateStore: PersistedMilestoneStore = {
          ...prev,
          user: nextUser,
          roadmapDays: {
            ...prev.roadmapDays,
            [clampedDay]: {
              ...dayObj,
              tasks: updatedTasks
              // Note: rewardClaimed is NEVER reset to false when unchecking (strict idempotency!)
            }
          }
        };

        const evalRes = evaluateDayMilestoneLevelUp(intermediateStore, clampedDay);
        if (evalRes.leveledUp) {
          didLevelUp = true;
          awardedLevel = evalRes.newLevel;
        }
        saveMilestoneStore(evalRes.updatedStore);
        return evalRes.updatedStore;
      });

      if (didLevelUp) {
        playTier4Stamp();
        triggerLevelUpCelebration(clampedDay, awardedLevel);
      } else {
        playTier4Stamp();
        showToast('Đã cập nhật trạng thái nhiệm vụ trong ngày!');
      }
    },
    [showToast, triggerLevelUpCelebration]
  );

  const cycleTaskStatus = useCallback(
    (dayNumber: number, taskId: string) => {
      const clampedDay = Math.max(1, Math.min(60, dayNumber));
      let didLevelUp = false;
      let awardedLevel = 1;

      setMilestoneStore(prev => {
        const dayObj = prev.roadmapDays[clampedDay] || createDefaultRoadmapDay(clampedDay);
        let becameCompleted = false;

        const updatedTasks = dayObj.tasks.map(t => {
          if (t.id !== taskId) return t;
          const currentSt = t.completed ? 'done' : t.status || 'todo';
          const nextSt: 'done' | 'in_progress' | 'todo' =
            currentSt === 'todo' ? 'in_progress' : currentSt === 'in_progress' ? 'done' : 'todo';
          const nextCompleted = nextSt === 'done';
          if (nextCompleted) becameCompleted = true;
          return {
            ...t,
            status: nextSt,
            completed: nextCompleted
          };
        });

        const nextUser = becameCompleted
          ? applyDailyStreakUpdate(prev.user).updatedUser
          : prev.user;

        const intermediateStore: PersistedMilestoneStore = {
          ...prev,
          user: nextUser,
          roadmapDays: {
            ...prev.roadmapDays,
            [clampedDay]: {
              ...dayObj,
              tasks: updatedTasks
            }
          }
        };

        const evalRes = evaluateDayMilestoneLevelUp(intermediateStore, clampedDay);
        if (evalRes.leveledUp) {
          didLevelUp = true;
          awardedLevel = evalRes.newLevel;
        }
        saveMilestoneStore(evalRes.updatedStore);
        return evalRes.updatedStore;
      });

      if (didLevelUp) {
        triggerLevelUpCelebration(clampedDay, awardedLevel);
      }
    },
    [triggerLevelUpCelebration]
  );

  const updateTaskTitle = useCallback(
    (dayNumber: number, taskId: string, newTitle: string) => {
      const trimmed = newTitle.trim();
      if (!trimmed) return;
      const clampedDay = Math.max(1, Math.min(60, dayNumber));

      setMilestoneStore(prev => {
        const dayObj = prev.roadmapDays[clampedDay] || createDefaultRoadmapDay(clampedDay);
        const updatedTasks = dayObj.tasks.map(t =>
          t.id === taskId ? { ...t, title: trimmed } : t
        );
        const nextStore: PersistedMilestoneStore = {
          ...prev,
          roadmapDays: {
            ...prev.roadmapDays,
            [clampedDay]: {
              ...dayObj,
              tasks: updatedTasks
            }
          }
        };
        saveMilestoneStore(nextStore);
        return nextStore;
      });
      showToast('Đã lưu nội dung nhiệm vụ!');
    },
    [showToast]
  );

  const addCustomTask = useCallback(
    (dayNumber: number, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const clampedDay = Math.max(1, Math.min(60, dayNumber));

      setMilestoneStore(prev => {
        const dayObj = prev.roadmapDays[clampedDay] || createDefaultRoadmapDay(clampedDay);
        const newTask: TaskItem = {
          id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          title: trimmed,
          completed: false,
          status: 'todo',
          isCore: dayObj.tasks.filter(t => t.isCore).length < 4
        };
        const nextStore: PersistedMilestoneStore = {
          ...prev,
          roadmapDays: {
            ...prev.roadmapDays,
            [clampedDay]: {
              ...dayObj,
              tasks: [...dayObj.tasks, newTask]
            }
          }
        };
        saveMilestoneStore(nextStore);
        return nextStore;
      });
      showToast(`Đã thêm nhiệm vụ: "${trimmed}"`);
    },
    [showToast]
  );

  const deleteTask = useCallback(
    (dayNumber: number, taskId: string) => {
      const clampedDay = Math.max(1, Math.min(60, dayNumber));
      setMilestoneStore(prev => {
        const dayObj = prev.roadmapDays[clampedDay] || createDefaultRoadmapDay(clampedDay);
        const nextStore: PersistedMilestoneStore = {
          ...prev,
          roadmapDays: {
            ...prev.roadmapDays,
            [clampedDay]: {
              ...dayObj,
              tasks: dayObj.tasks.filter(t => t.id !== taskId)
            }
          }
        };
        saveMilestoneStore(nextStore);
        return nextStore;
      });
      showToast('Đã xóa nhiệm vụ khỏi danh sách!');
    },
    [showToast]
  );

  const refreshStorageState = useCallback(() => {
    const activeUser = getActiveAuthUser();
    let resolvedProfile: UserProfileData = deepNormalizeText(defaultProfile);

    try {
      const savedProfile = localStorage.getItem('master_english_user_profile_v2');
      if (savedProfile) {
        resolvedProfile = sanitizeLegacyProfile(JSON.parse(savedProfile));
        localStorage.setItem('master_english_user_profile_v2', JSON.stringify(resolvedProfile));
      } else if (activeUser) {
        resolvedProfile = sanitizeLegacyProfile({
          name: deriveCleanDisplayName(activeUser.email, activeUser.name),
          email: activeUser.email
        });
        localStorage.setItem('master_english_user_profile_v2', JSON.stringify(resolvedProfile));
      }
    } catch {}

    setUserProfile(resolvedProfile);
    setCompletedSessions(getCompletedSessions());
    setWordProgressMap(getWordProgressMap());
    setMistakesCount(getMistakes().length);
    const updatedChallengeSummary = getChallengeOverallSummary();
    setChallengeSummary(updatedChallengeSummary);
    setIsDarkMode(getSavedThemePreference() === 'dark');
    setMilestoneStore(loadMilestoneStore(resolvedProfile.name));

    const savedActive = getActiveSession();
    if (savedActive) {
      setActiveSession(savedActive);
      setActiveSessionSeconds(savedActive.accumulatedSeconds || 0);
      if (savedActive.targetMinutes) {
        setTargetMinutesState(savedActive.targetMinutes);
      }
    } else if (activeUser) {
      const now = Date.now();
      const initialGoal = resolvedProfile.dailyStudyMinutesGoal || 45;
      const freshSession: ActiveSessionState = {
        id: `session_${now}_${Math.random().toString(36).substring(2, 6)}`,
        startTime: now,
        lastActiveTimestamp: now,
        accumulatedSeconds: 0,
        targetMinutes: initialGoal,
        status: 'active',
        pausedAt: null,
        topics: ['Academic Focus'],
        wordsMastered: [],
        wordsReviewed: [],
        quizQuestionsAnswered: 0,
        quizQuestionsCorrect: 0,
        flashcardsFlipped: 0,
        mistakesResolved: 0
      };
      saveActiveSession(freshSession);
      setActiveSession(freshSession);
      setActiveSessionSeconds(0);
      setTargetMinutesState(initialGoal);
    } else {
      setActiveSession(null);
      setActiveSessionSeconds(0);
    }
  }, []);

  // Listen to Cloud Sync, Auth User Switch, Session updates, Active Day sync & Cross-Tab Storage updates
  useEffect(() => {
    const handleCloudSynced = () => {
      refreshStorageState();
    };
    const handleAuthUserChanged = (e: Event) => {
      const customEv = e as CustomEvent<ActiveAuthUserIdentity | null>;
      const nextUser = customEv.detail;
      if (!nextUser) {
        // Complete Sign-Out memory flush: zero out all user states
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setUserProfile(deepNormalizeText(defaultProfile));
        setMilestoneStore(createCleanMilestoneStore(''));
        setCompletedSessions([]);
        setWordProgressMap({});
        setMistakesCount(0);
        setChallengeSummary(getChallengeOverallSummary());
        setActiveSession(null);
        setActiveSessionSeconds(0);
        setLastCompletedSession(null);
        setLastEmailReportStatus(null);
        setIsSummaryModalOpen(false);
        setLevelUpModalData(null);
        return;
      }
      refreshStorageState();
    };
    const handleSessionUpdated = () => {
      setCompletedSessions(getCompletedSessions());
    };
    const handleWordProgressChanged = () => {
      setWordProgressMap(getWordProgressMap());
    };
    const handleActiveDayChanged = (e: Event) => {
      const customEv = e as CustomEvent<{ day?: number }>;
      const nextDay = customEv.detail?.day;
      setChallengeSummary(getChallengeOverallSummary());
      if (typeof nextDay === 'number' && nextDay >= 1 && nextDay <= 60) {
        setMilestoneStore(prev => {
          if (prev.currentDayNumber === nextDay) return prev;
          const updated: PersistedMilestoneStore = {
            ...prev,
            currentDayNumber: nextDay,
            roadmapDays: {
              ...prev.roadmapDays,
              [nextDay]: prev.roadmapDays[nextDay] || createDefaultRoadmapDay(nextDay)
            }
          };
          saveMilestoneStore(updated);
          return updated;
        });
      }
    };
    const handleCrossTabStorage = (e: StorageEvent) => {
      if (
        e.key &&
        (e.key.startsWith('master_english_') ||
          e.key.startsWith('leximaster_') ||
          e.key.startsWith('ielts_60_'))
      ) {
        refreshStorageState();
      }
    };
    window.addEventListener('master-english-cloud-synced', handleCloudSynced);
    window.addEventListener(AUTH_USER_CHANGED_EVENT, handleAuthUserChanged);
    window.addEventListener('master-english-session-updated', handleSessionUpdated);
    window.addEventListener('master-english-word-progress-changed', handleWordProgressChanged);
    window.addEventListener('master-english-active-day-changed', handleActiveDayChanged);
    window.addEventListener('storage', handleCrossTabStorage);
    return () => {
      window.removeEventListener('master-english-cloud-synced', handleCloudSynced);
      window.removeEventListener(AUTH_USER_CHANGED_EVENT, handleAuthUserChanged);
      window.removeEventListener('master-english-session-updated', handleSessionUpdated);
      window.removeEventListener('master-english-word-progress-changed', handleWordProgressChanged);
      window.removeEventListener('master-english-active-day-changed', handleActiveDayChanged);
      window.removeEventListener('storage', handleCrossTabStorage);
    };
  }, [refreshStorageState]);

  // Modal summary state & Auto-email status
  const [lastCompletedSession, setLastCompletedSession] = useState<SessionRecord | null>(() => {
    const existing = getCompletedSessions();
    return existing.length > 0 ? existing[0] : null;
  });
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [lastEmailReportStatus, setLastEmailReportStatus] = useState<AutoEmailResult | null>(null);
  const [isAutoSendingEmail, setIsAutoSendingEmail] = useState<boolean>(false);

  // Guard ref to prevent duplicate session completion on rapid clicks
  const endingSessionIdRef = useRef<string | null>(null);

  // Timer Ref to tick every second when session is active
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickTimeRef = useRef<number>(Date.now());

  // 4. ACTIVE SESSION TIMER ENGINE (Zero phantom increments, accounts for actual elapsed time)
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    lastTickTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      if (document.visibilityState === 'hidden') {
        return;
      }

      const now = Date.now();
      const elapsed = Math.round((now - lastTickTimeRef.current) / 1000);
      const increment = elapsed >= 1 && elapsed <= 3 ? elapsed : 1;
      lastTickTimeRef.current = now;

      setActiveSessionSeconds(prevSec => {
        const nextSec = prevSec + increment;
        setActiveSession(curr => {
          if (!curr) return null;
          const updated: ActiveSessionState = {
            ...curr,
            accumulatedSeconds: nextSec,
            lastActiveTimestamp: now
          };
          saveActiveSession(updated);
          return updated;
        });
        return nextSec;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession?.status, activeSession?.id]);

  // Tab visibility listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      lastTickTimeRef.current = Date.now();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const formatSeconds = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}h ${String(remM).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
    }
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  const formattedActiveSessionTime = formatSeconds(activeSessionSeconds);

  const dispatchAutoEmailForSession = useCallback(
    async (
      completedSession: SessionRecord,
      updatedAllSessions: SessionRecord[],
      currentWordMap: Record<string, WordProgressRecord>,
      profile: UserProfileData,
      currentStreakVal: number,
      bestStreakVal: number
    ): Promise<AutoEmailResult> => {
      setIsAutoSendingEmail(true);
      try {
        const res = await triggerPostSessionAutoEmail({
          studentName: profile.name || 'Học viên MASTER English',
          targetBand: profile.targetBand || 'BAND 7.0+',
          recipientEmail: profile.email || '',
          latestSession: completedSession,
          allSessions: updatedAllSessions,
          wordProgressMap: currentWordMap,
          currentStreak: currentStreakVal,
          bestStreak: bestStreakVal,
          configuredSessionTargetMinutes:
            completedSession.targetMinutes || profile.dailyStudyMinutesGoal || 45
        });
        setLastEmailReportStatus(res);
        if (res.status === 'sent') {
          showToast('Đã lưu phiên học thành công! Báo cáo chi tiết đã được gửi về email của bạn.');
        }
        return res;
      } finally {
        setIsAutoSendingEmail(false);
      }
    },
    [showToast]
  );

  // 5. SESSION CONTROLLERS: Start, Pause, Resume, End
  const resumeSession = useCallback(() => {
    if (!activeSession || activeSession.status === 'active') return;

    lastTickTimeRef.current = Date.now();
    const updated: ActiveSessionState = {
      ...activeSession,
      status: 'active',
      pausedAt: null,
      lastActiveTimestamp: Date.now()
    };
    setActiveSession(updated);
    saveActiveSession(updated);
    showToast('▶ Tiếp tục phiên học.');
  }, [activeSession, showToast]);

  const startSession = useCallback(
    (initialMode = 'Speed Quiz', targetMinutes = 45) => {
      if (activeSession) {
        if (activeSession.status === 'paused') {
          resumeSession();
        }
        return;
      }

      const now = Date.now();
      const newSession: ActiveSessionState = {
        id: `session_${now}_${Math.random().toString(36).substring(2, 6)}`,
        startTime: now,
        lastActiveTimestamp: now,
        accumulatedSeconds: 0,
        targetMinutes,
        status: 'active',
        pausedAt: null,
        topics: [initialMode],
        wordsMastered: [],
        wordsReviewed: [],
        quizQuestionsAnswered: 0,
        quizQuestionsCorrect: 0,
        flashcardsFlipped: 0,
        mistakesResolved: 0
      };

      endingSessionIdRef.current = null;
      lastTickTimeRef.current = now;
      setTargetMinutesState(targetMinutes);
      setActiveSession(newSession);
      setActiveSessionSeconds(0);
      saveActiveSession(newSession);
      showToast('🚀 Đã bắt đầu phiên học mới! Bộ đếm thời gian bắt đầu từ 0s.');
    },
    [activeSession, resumeSession, showToast]
  );

  const setTargetMinutes = useCallback((mins: number) => {
    const safeMins = [15, 25, 45, 60].includes(mins) ? mins : 45;
    setTargetMinutesState(safeMins);
    setActiveSession(curr => {
      if (!curr) return null;
      const updated: ActiveSessionState = {
        ...curr,
        targetMinutes: safeMins
      };
      saveActiveSession(updated);
      return updated;
    });
    setUserProfile(prev => {
      const updated = { ...prev, dailyStudyMinutesGoal: safeMins };
      try {
        localStorage.setItem('master_english_user_profile_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const pauseSession = useCallback(() => {
    if (!activeSession || activeSession.status === 'paused') return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const exactFrozenSeconds = activeSessionSeconds;
    const updated: ActiveSessionState = {
      ...activeSession,
      accumulatedSeconds: exactFrozenSeconds,
      status: 'paused',
      pausedAt: Date.now()
    };
    setActiveSessionSeconds(exactFrozenSeconds);
    setActiveSession(updated);
    saveActiveSession(updated);
    showToast('⏸ Đã tạm dừng phiên học tại đúng thời điểm hiện tại.');
  }, [activeSession, activeSessionSeconds, showToast]);

  const endSession = useCallback((): SessionRecord | null => {
    if (!activeSession) {
      showToast('Không có phiên học nào đang diễn ra để kết thúc.');
      return null;
    }

    if (endingSessionIdRef.current === activeSession.id) {
      return null;
    }
    endingSessionIdRef.current = activeSession.id;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const endTime = Date.now();
    const rawActiveSeconds = activeSessionSeconds;
    const duration = Math.max(1, rawActiveSeconds);

    // Ensure reviewed words during session are also promoted to mastered/learned if user completed session
    const sessionMasteredIds = Array.from(
      new Set([...(activeSession.wordsMastered || []), ...(activeSession.wordsReviewed || [])])
    );

    if (sessionMasteredIds.length > 0) {
      for (const wId of sessionMasteredIds) {
        const vocabMatch = VOCAB_DATABASE.find(v => v.id === wId || v.word === wId);
        recordWordInteraction(
          wId,
          vocabMatch?.word || wId,
          'mastered',
          activeSession.topics[0] || 'Phiên học',
          vocabMatch
            ? { ipa: vocabMatch.ipa, meaning: vocabMatch.meaning, level: vocabMatch.level }
            : undefined
        );
      }
      setWordProgressMap(getWordProgressMap());
    }

    const completed: SessionRecord = {
      id: activeSession.id,
      startTime: activeSession.startTime,
      endTime,
      durationSeconds: duration,
      targetMinutes: activeSession.targetMinutes || userProfile.dailyStudyMinutesGoal || 45,
      dateString: getLocalDateString(new Date(activeSession.startTime)),
      topics: activeSession.topics.length > 0 ? activeSession.topics : ['Tự do'],
      wordsMastered: sessionMasteredIds,
      wordsReviewed: Array.from(new Set(activeSession.wordsReviewed || [])),
      quizQuestionsAnswered: activeSession.quizQuestionsAnswered || 0,
      quizQuestionsCorrect: activeSession.quizQuestionsCorrect || 0,
      flashcardsFlipped: activeSession.flashcardsFlipped || 0,
      mistakesResolved: activeSession.mistakesResolved || 0,
      status: 'completed'
    };

    try {
      saveCompletedSession(completed);
      const updatedAll = getCompletedSessions();
      setCompletedSessions(updatedAll);
      saveActiveSession(null);
      setActiveSession(null);
      setActiveSessionSeconds(0);
      setLastCompletedSession(completed);
      setLastEmailReportStatus(null);
      setIsSummaryModalOpen(true);

      // Award EXP & Level up immediately on session completion
      const targetDayNum = milestoneStore.currentDayNumber;
      let nextLevelVal = 1;

      setMilestoneStore(prev => {
        const dayObj = prev.roadmapDays[targetDayNum] || createDefaultRoadmapDay(targetDayNum);
        const updatedTasks = dayObj.tasks.map(t => {
          if (
            t.id === CORE_TASK_IDS.COLLOCATIONS &&
            completed.quizQuestionsAnswered > 0
          ) {
            return { ...t, completed: true, status: 'done' as const };
          }
          if (
            t.id === CORE_TASK_IDS.MISTAKES &&
            (completed.mistakesResolved > 0 ||
              completed.topics.includes('Ngân Hàng Lỗi Sai'))
          ) {
            return { ...t, completed: true, status: 'done' as const };
          }
          if (t.id === CORE_TASK_IDS.VOCAB_15 && completed.wordsMastered.length > 0) {
            return { ...t, completed: true, status: 'done' as const };
          }
          return t;
        });

        const { updatedUser } = applyDailyStreakUpdate(prev.user);
        nextLevelVal = Math.min(60, (updatedUser.level || 1) + 1);

        const nextStore: PersistedMilestoneStore = {
          ...prev,
          user: {
            ...updatedUser,
            level: nextLevelVal
          },
          roadmapDays: {
            ...prev.roadmapDays,
            [targetDayNum]: {
              ...dayObj,
              tasks: updatedTasks
            }
          }
        };

        saveMilestoneStore(nextStore);
        return nextStore;
      });

      showToast('Đã lưu phiên học thành công!');
      return completed;
    } catch (err: any) {
      endingSessionIdRef.current = null;
      showToast(err.message || 'Lỗi lưu phiên học.');
      return null;
    }
  }, [
    activeSession,
    activeSessionSeconds,
    userProfile.dailyStudyMinutesGoal,
    milestoneStore.currentDayNumber,
    showToast
  ]);

  const effectiveTargetMinutes =
    activeSession?.targetMinutes || targetMinutesState || userProfile.dailyStudyMinutesGoal || 45;
  const elapsedSeconds = activeSession ? activeSessionSeconds : 0;
  const remainingSeconds = Math.max(0, effectiveTargetMinutes * 60 - elapsedSeconds);
  const isRunning = Boolean(activeSession && activeSession.status === 'active');

  const prevRemainingTimerRef = useRef<number>(remainingSeconds);
  useEffect(() => {
    if (prevRemainingTimerRef.current > 0 && remainingSeconds === 0 && isRunning) {
      playTier5TimerBell();
    }
    prevRemainingTimerRef.current = remainingSeconds;
  }, [remainingSeconds, isRunning]);

  const togglePause = useCallback(
    (modeLabel = 'Academic Focus') => {
      if (!activeSession) {
        startSession(modeLabel, effectiveTargetMinutes);
      } else if (activeSession.status === 'active') {
        pauseSession();
      } else {
        resumeSession();
      }
    },
    [activeSession, effectiveTargetMinutes, pauseSession, resumeSession, startSession]
  );

  const endAndSaveSession = useCallback((): SessionRecord | null => {
    return endSession();
  }, [endSession]);

  const retryLastSessionEmail = useCallback(async (): Promise<AutoEmailResult | null> => {
    const targetSession = lastCompletedSession || completedSessions[0] || null;
    if (!targetSession) return null;
    const streakCalc = calculateRealStreak(completedSessions);
    const effectiveStreak = Math.max(milestoneStore.user.streak || 1, streakCalc.currentStreak);
    return dispatchAutoEmailForSession(
      targetSession,
      completedSessions,
      wordProgressMap,
      userProfile,
      effectiveStreak,
      Math.max(effectiveStreak, streakCalc.bestStreak)
    );
  }, [
    lastCompletedSession,
    completedSessions,
    wordProgressMap,
    userProfile,
    milestoneStore.user.streak,
    dispatchAutoEmailForSession
  ]);

  const closeSummaryModal = () => {
    setIsSummaryModalOpen(false);
  };

  const closeLevelUpModal = () => {
    setLevelUpModalData(null);
  };

  // 6. REAL INTERACTION EVENT LOGGERS (with Automatic Task Triggering per Section III.1)
  const recordLearningWord = useCallback(
    (
      wordId: string,
      word: string,
      action: 'mastered' | 'unmastered' | 'reviewed',
      mode = 'Tra cứu',
      extra?: { ipa?: string; meaning?: string; level?: string }
    ) => {
      const { isNewlyMastered } = recordWordInteraction(wordId, word, action, mode, extra);
      setWordProgressMap(getWordProgressMap());

      // Auto-complete "Tra cứu và ghi nhớ 15 từ vựng học thuật" when user masters/saves a word in Dictionary or Spotlight
      if (action === 'mastered') {
        completeTask(milestoneStore.currentDayNumber, CORE_TASK_IDS.VOCAB_15);
      }

      setActiveSession(curr => {
        if (!curr) return null;
        const newMastered =
          (action === 'mastered' || isNewlyMastered) && !curr.wordsMastered.includes(wordId)
            ? [...curr.wordsMastered, wordId]
            : action === 'unmastered'
              ? curr.wordsMastered.filter(id => id !== wordId)
              : curr.wordsMastered;
        const newReviewed = !curr.wordsReviewed.includes(wordId)
          ? [...curr.wordsReviewed, wordId]
          : curr.wordsReviewed;
        const newTopics = !curr.topics.includes(mode) ? [...curr.topics, mode] : curr.topics;

        const updated: ActiveSessionState = {
          ...curr,
          wordsMastered: newMastered,
          wordsReviewed: newReviewed,
          topics: newTopics
        };
        saveActiveSession(updated);
        return updated;
      });
    },
    [completeTask, milestoneStore.currentDayNumber]
  );

  const recordQuizEvent = useCallback(
    (
      wordId: string,
      word: string,
      isCorrect: boolean,
      mode: string,
      extra?: { ipa?: string; meaning?: string }
    ) => {
      recordWordInteraction(wordId, word, isCorrect ? 'quiz_correct' : 'quiz_wrong', mode, extra);
      setWordProgressMap(getWordProgressMap());
      setMistakesCount(getMistakes().length);

      // Update active session if running
      setActiveSession(curr => {
        const session = curr || {
          id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          startTime: Date.now(),
          lastActiveTimestamp: Date.now(),
          accumulatedSeconds: 0,
          status: 'active',
          pausedAt: null,
          topics: [mode],
          wordsMastered: [],
          wordsReviewed: [],
          quizQuestionsAnswered: 0,
          quizQuestionsCorrect: 0,
          flashcardsFlipped: 0,
          mistakesResolved: 0
        };

        const updated: ActiveSessionState = {
          ...session,
          quizQuestionsAnswered: session.quizQuestionsAnswered + 1,
          quizQuestionsCorrect: isCorrect
            ? session.quizQuestionsCorrect + 1
            : session.quizQuestionsCorrect,
          wordsReviewed: !session.wordsReviewed.includes(wordId)
            ? [...session.wordsReviewed, wordId]
            : session.wordsReviewed,
          topics: !session.topics.includes(mode) ? [...session.topics, mode] : session.topics
        };
        saveActiveSession(updated);
        return updated;
      });
    },
    []
  );

  const recordFlashcardFlip = useCallback((wordId: string, word: string) => {
    recordWordInteraction(wordId, word, 'reviewed', 'Flashcard 3D');
    setWordProgressMap(getWordProgressMap());

    setActiveSession(curr => {
      if (!curr) return null;
      const updated: ActiveSessionState = {
        ...curr,
        flashcardsFlipped: curr.flashcardsFlipped + 1,
        wordsReviewed: !curr.wordsReviewed.includes(wordId)
          ? [...curr.wordsReviewed, wordId]
          : curr.wordsReviewed,
        topics: !curr.topics.includes('Flashcard 3D')
          ? [...curr.topics, 'Flashcard 3D']
          : curr.topics
      };
      saveActiveSession(updated);
      return updated;
    });
  }, []);

  const recordMistakeCleared = useCallback(
    (_wordId: string) => {
      setMistakesCount(getMistakes().length);
      // Automatically complete "Ôn tập các câu trong Ngân hàng lỗi sai"
      completeTask(milestoneStore.currentDayNumber, CORE_TASK_IDS.MISTAKES);

      setActiveSession(curr => {
        if (!curr) return null;
        const updated: ActiveSessionState = {
          ...curr,
          mistakesResolved: curr.mistakesResolved + 1
        };
        saveActiveSession(updated);
        return updated;
      });
    },
    [completeTask, milestoneStore.currentDayNumber]
  );

  // 7. REAL TOTAL METRICS (Derived strictly from verified data & Milestone Engine)
  const totalUniqueMasteredWords = Object.keys(wordProgressMap).filter(
    id => wordProgressMap[id].status === 'mastered'
  ).length;

  const totalUniqueWordsInDatabase = VOCAB_DATABASE.length || 3666;

  const { currentStreak: sessionStreak, bestStreak: sessionBestStreak } =
    calculateRealStreak(completedSessions);

  // Unified Calendar Streak (Section II.2)
  const realStreak = Math.max(milestoneStore.user.streak || 0, sessionStreak);
  const bestStreak = Math.max(realStreak, sessionBestStreak);
  const userLevel = milestoneStore.user.level;

  const totalValidStudySecondsAllTime = completedSessions.reduce(
    (acc, s) => acc + (s.durationSeconds || 0),
    0
  );

  // 8. PROFILE UPDATE & COMPLETION (strictly calculated from user-entered personal fields)
  const profileCompletionPercent = (() => {
    const userEnteredFields = [
      userProfile.name?.trim(),
      userProfile.email?.trim(),
      userProfile.gender?.trim(),
      userProfile.dob?.trim(),
      userProfile.location?.trim(),
      userProfile.studentCategory?.trim()
    ];
    const filledCount = userEnteredFields.filter(Boolean).length;
    return Math.round((filledCount / userEnteredFields.length) * 100);
  })();

  const updateUserProfile = (data: Partial<UserProfileData>) => {
    setUserProfile(prev => {
      const updated = deepNormalizeText({ ...prev, ...data });
      try {
        localStorage.setItem('master_english_user_profile_v2', JSON.stringify(updated));
        void dataRepository.syncUserProfileData(updated, isDarkMode ? 'dark' : 'light');
      } catch (err) {
        console.error('Failed to save profile', err);
      }
      if (updated.name) {
        setMilestoneStore(curr => {
          const next = {
            ...curr,
            user: {
              ...curr.user,
              name: updated.name
            }
          };
          saveMilestoneStore(next);
          return next;
        });
      }
      return updated;
    });
    showToast('✨ Đã lưu thông tin hồ sơ học viên thành công!');
  };

  return (
    <AnalyticsContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        user: {
          ...milestoneStore.user,
          name: userProfile.name || milestoneStore.user.name,
          streak: realStreak
        },
        userLevel,
        roadmapDays: milestoneStore.roadmapDays,
        currentDayNumber: milestoneStore.currentDayNumber,
        setCurrentDayNumber,
        session: {
          isRunning: Boolean(activeSession && activeSession.status === 'active'),
          startTime: activeSession ? activeSession.startTime : null,
          elapsedSeconds: activeSessionSeconds
        },
        completeTask,
        toggleTask,
        cycleTaskStatus,
        updateTaskTitle,
        addCustomTask,
        deleteTask,
        checkAndAwardLevel,
        levelUpModalData,
        closeLevelUpModal,
        activeSession,
        activeSessionSeconds,
        elapsedSeconds,
        remainingSeconds,
        targetMinutes: effectiveTargetMinutes,
        setTargetMinutes,
        isRunning,
        togglePause,
        endAndSaveSession,
        formattedActiveSessionTime,
        isSessionActive: Boolean(activeSession && activeSession.status === 'active'),
        isSessionPaused: Boolean(activeSession && activeSession.status === 'paused'),
        startSession,
        pauseSession,
        resumeSession,
        endSession,
        completedSessions,
        wordProgressMap,
        totalUniqueMasteredWords,
        totalUniqueWordsInDatabase,
        realStreak,
        bestStreak,
        totalValidStudySecondsAllTime,
        mistakesCount,
        challengeSummary,
        refreshStorageState,
        recordLearningWord,
        recordQuizEvent,
        recordFlashcardFlip,
        recordMistakeCleared,
        lastCompletedSession,
        isSummaryModalOpen,
        closeSummaryModal,
        lastEmailReportStatus,
        isAutoSendingEmail,
        retryLastSessionEmail,
        userProfile,
        updateUserProfile,
        profileCompletionPercent,
        toastMessage,
        showToast
      }}
    >
      {children}

      {/* Milestone Level-Up Celebration Modal */}
      {levelUpModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-md rounded-3xl p-6 sm:p-7 border shadow-2xl text-center space-y-5 ${
              isDarkMode
                ? 'bg-[#171B2A] border-white/15 text-white'
                : 'bg-[#FFFDF9] border-[#F0DCD5] text-[#1F2937]'
            }`}
          >
            <button
              type="button"
              onClick={closeLevelUpModal}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#9CA3AF] hover:text-[#C81E1E] cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center shadow-lg shadow-red-600/30">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#C81E1E]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MILESTONE ACHIEVED • NGÀY {levelUpModalData.dayNumber}/60</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Chúc mừng lên Level {levelUpModalData.newLevel}!
              </h2>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-[#4B5563]'}`}>
                Bạn đã hoàn thành trọn vẹn <strong>4/4 nhiệm vụ cốt lõi</strong> của Ngày Lộ Trình{' '}
                <strong>#{levelUpModalData.dayNumber}</strong>. Mốc thưởng Level này đã được ghi nhận vĩnh viễn vào hồ sơ học tập của bạn!
              </p>
            </div>

            <div
              className={`rounded-2xl p-3.5 border flex items-center justify-around text-left ${
                isDarkMode
                  ? 'bg-white/5 border-white/10'
                  : 'bg-[#FFF8F6] border-[#F3D8CE]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
                <div>
                  <div className="text-[11px] text-[#6B7280] font-semibold">Tiến độ mốc ngày</div>
                  <div className="text-xs font-extrabold font-mono tabular-nums">4/4 Nhiệm vụ (100%)</div>
                </div>
              </div>
              <div className="h-8 w-px bg-[#E5DDD3] dark:bg-white/10" />
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#EA580C] fill-[#F97316] shrink-0" />
                <div>
                  <div className="text-[11px] text-[#6B7280] font-semibold">Chuỗi Streak</div>
                  <div className="text-xs font-extrabold font-mono tabular-nums">{realStreak} ngày</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              {levelUpModalData.dayNumber < 60 && (
                <button
                  type="button"
                  onClick={() => {
                    const nextDay = Math.min(60, levelUpModalData.dayNumber + 1);
                    setCurrentDayNumber(nextDay);
                    closeLevelUpModal();
                    showToast(`Đã chuyển sang Ngày Lộ Trình #${nextDay}/60!`);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-full bg-gradient-to-r from-[#C81E1E] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white text-xs font-bold shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Sang Ngày #{levelUpModalData.dayNumber + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={closeLevelUpModal}
                className={`py-2.5 px-5 rounded-full border text-xs font-bold cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/10 border-white/15 text-white hover:bg-white/15'
                    : 'bg-white border-[#E5DDD3] text-[#374151] hover:bg-[#FAF7F4]'
                }`}
              >
                Tiếp tục học
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Real Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#1A1A1A]/95 text-white border border-[#C81E1E]/40 shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#C81E1E] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const useFocusTimer = () => {
  const context = useAnalytics();
  return {
    elapsedSeconds: context.elapsedSeconds,
    remainingSeconds: context.remainingSeconds,
    targetMinutes: context.targetMinutes,
    setTargetMinutes: context.setTargetMinutes,
    isRunning: context.isRunning,
    isSessionActive: context.isSessionActive,
    isSessionPaused: context.isSessionPaused,
    activeSession: context.activeSession,
    togglePause: context.togglePause,
    startSession: context.startSession,
    pauseSession: context.pauseSession,
    resumeSession: context.resumeSession,
    endAndSaveSession: context.endAndSaveSession,
  };
};

