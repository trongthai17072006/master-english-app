import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Flame,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  PenTool,
  Mic,
  Headphones,
  FileText,
  Target,
  Clock,
  ArrowRight,
  History,
  Volume2,
  Sparkles,
  Check,
  Plus
} from 'lucide-react';
import {
  CHALLENGE_60_DAYS,
  getMergedChallenge60Days,
  ChallengeDay
} from '../../data/challenge60Data';
import {
  loadChallengeData,
  setActiveChallengeDay,
  getChallengeOverallSummary,
  ChallengeOverallSummary,
  DayCompletionStatus,
  ACTIVE_DAY_CHANGED_EVENT
} from '../../utils/challengeStorage';
import { CUSTOM_CONTENT_EVENT } from '../../services/customContentStore';
import { renderTextWithHighlightedVocab } from '../../utils/highlightTargetWords';
import { ContentImporterModal } from '../ContentImporterModal';
import { AdminGuard } from '../AdminGuard';
import { ChallengeVocabularyTab } from './ChallengeVocabularyTab';
import { ChallengeWritingTab } from './ChallengeWritingTab';
import { ChallengeSpeakingTab } from './ChallengeSpeakingTab';
import { ChallengeRoadmapCalendar } from './ChallengeRoadmapCalendar';
import { VstepPdfUnlimitedBankTab } from './VstepPdfUnlimitedBankTab';
import { VSTEP_PDF_LISTENING_BANK } from '../../data/vstepPdfKnowledgeBankData';
import { useAnalytics } from '../../context/AnalyticsContext';
import { CORE_TASK_IDS } from '../../services/milestoneEngine';
import { speakWord } from '../../utils/soundAndSpeech';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from '../VintageNewspaperIllustrations';
import { ENGRAVING_ASSETS, HorizonEngravingHeader } from '../../constants/engravings';

interface IeltsChallengePageProps {
  onBackToMain?: () => void;
  onBackToWorkspace?: () => void;
  onOpenTutor?: (data?: any) => void;
}

type MainChallengeSection = 'vocab' | 'reading-listening' | 'writing' | 'speaking' | 'pdf-knowledge-bank';

const READING_LISTENING_STORAGE_KEY = 'ielts_challenge_60_reading_listening_v1';

interface ReadingListeningState {
  listeningDoneDays: number[];
  readingDoneDays: number[];
}

function loadReadingListeningState(): ReadingListeningState {
  try {
    const raw = localStorage.getItem(READING_LISTENING_STORAGE_KEY);
    if (!raw) return { listeningDoneDays: [], readingDoneDays: [] };
    const parsed = JSON.parse(raw);
    return {
      listeningDoneDays: Array.isArray(parsed.listeningDoneDays) ? parsed.listeningDoneDays : [],
      readingDoneDays: Array.isArray(parsed.readingDoneDays) ? parsed.readingDoneDays : []
    };
  } catch {
    return { listeningDoneDays: [], readingDoneDays: [] };
  }
}

function saveReadingListeningState(state: ReadingListeningState): void {
  try {
    localStorage.setItem(READING_LISTENING_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export const IeltsChallengePage: React.FC<IeltsChallengePageProps> = ({
  onBackToMain,
  onBackToWorkspace
}) => {
  const handleBack = onBackToMain || onBackToWorkspace;
  const {
    realStreak: contextStreak,
    userProfile,
    refreshStorageState,
    completeTask,
    currentDayNumber,
    setCurrentDayNumber
  } = useAnalytics();
  const practiceWorkspaceRef = useRef<HTMLDivElement | null>(null);

  const [allChallengeDays, setAllChallengeDays] = useState<ChallengeDay[]>(() =>
    getMergedChallenge60Days()
  );
  const [isImporterOpen, setIsImporterOpen] = useState<boolean>(false);
  const maxAvailableDay = allChallengeDays.length;

  const [activeDayNumber, setActiveDayNumber] = useState<number>(() => {
    const data = loadChallengeData();
    return currentDayNumber || data.activeDay || 1;
  });

  // Keep activeDayNumber strictly synchronized when currentDayNumber changes in AnalyticsContext or via localStorage
  useEffect(() => {
    if (currentDayNumber && currentDayNumber !== activeDayNumber) {
      setActiveDayNumber(currentDayNumber);
    }
  }, [currentDayNumber]);

  useEffect(() => {
    const onActiveDayEvent = (e: Event) => {
      const ev = e as CustomEvent<{ day?: number }>;
      if (ev.detail?.day && ev.detail.day !== activeDayNumber) {
        setActiveDayNumber(ev.detail.day);
      }
    };
    const onCustomContentUpdated = () => {
      setAllChallengeDays(getMergedChallenge60Days());
    };
    window.addEventListener(ACTIVE_DAY_CHANGED_EVENT, onActiveDayEvent);
    window.addEventListener(CUSTOM_CONTENT_EVENT, onCustomContentUpdated);
    return () => {
      window.removeEventListener(ACTIVE_DAY_CHANGED_EVENT, onActiveDayEvent);
      window.removeEventListener(CUSTOM_CONTENT_EVENT, onCustomContentUpdated);
    };
  }, [activeDayNumber]);

  const [activeSection, setActiveSection] = useState<MainChallengeSection>('writing');
  const [isWritingFocusMode, setIsWritingFocusMode] = useState<boolean>(false);
  const savedScrollYRef = useRef<number>(0);

  const handleToggleWritingFocusMode = (next: boolean) => {
    if (next) {
      savedScrollYRef.current = window.scrollY;
      setIsWritingFocusMode(true);
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    } else {
      setIsWritingFocusMode(false);
      const restoreY = savedScrollYRef.current;
      requestAnimationFrame(() => {
        window.scrollTo({ top: restoreY, behavior: 'smooth' });
      });
    }
  };

  const isFocusModeActive = isWritingFocusMode && activeSection === 'writing';

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('master-english-focus-mode', {
        detail: { active: isFocusModeActive }
      })
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent('master-english-focus-mode', {
          detail: { active: false }
        })
      );
    };
  }, [isFocusModeActive]);

  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [summary, setSummary] = useState<ChallengeOverallSummary>(() => getChallengeOverallSummary());
  const [dayStatuses, setDayStatuses] = useState<Record<number, DayCompletionStatus>>(() => {
    const data = loadChallengeData();
    return data.dayStatuses || {};
  });
  const [rlState, setRlState] = useState<ReadingListeningState>(() => loadReadingListeningState());
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, string>>({});

  const refreshState = () => {
    const data = loadChallengeData();
    setSummary(getChallengeOverallSummary());
    const statuses = data.dayStatuses || {};
    setDayStatuses(statuses);
    setRlState(loadReadingListeningState());

    const activeDaySt = statuses[activeDayNumber];
    if (activeDaySt?.vocab) {
      completeTask(activeDayNumber, CORE_TASK_IDS.VOCAB_15);
    }
    if (activeDaySt?.writing || activeDaySt?.speaking || activeDaySt?.vocab) {
      completeTask(activeDayNumber, CORE_TASK_IDS.CHALLENGE_60);
    }
    refreshStorageState();
  };

  useEffect(() => {
    refreshState();
    setSelectedQuizAnswers({});
  }, [activeDayNumber]);

  const handleSelectDay = (day: number) => {
    const clamped = Math.max(1, Math.min(maxAvailableDay, day));
    setActiveDayNumber(clamped);
    setActiveChallengeDay(clamped);
    setCurrentDayNumber(clamped);
  };

  const toggleListeningDay = (day: number) => {
    const current = loadReadingListeningState();
    const exists = current.listeningDoneDays.includes(day);
    const nextListening = exists
      ? current.listeningDoneDays.filter(d => d !== day)
      : [...current.listeningDoneDays, day];
    const nextState = { ...current, listeningDoneDays: nextListening };
    saveReadingListeningState(nextState);
    setRlState(nextState);
    if (!exists) {
      completeTask(day, CORE_TASK_IDS.CHALLENGE_60);
    }
  };

  const toggleReadingDay = (day: number) => {
    const current = loadReadingListeningState();
    const exists = current.readingDoneDays.includes(day);
    const nextReading = exists
      ? current.readingDoneDays.filter(d => d !== day)
      : [...current.readingDoneDays, day];
    const nextState = { ...current, readingDoneDays: nextReading };
    saveReadingListeningState(nextState);
    setRlState(nextState);
    if (!exists) {
      completeTask(day, CORE_TASK_IDS.CHALLENGE_60);
    }
  };

  const currentDayData: ChallengeDay =
    allChallengeDays.find(d => d.day === activeDayNumber) || allChallengeDays[0];
  const currentDayStatus = dayStatuses[activeDayNumber] || {
    vocab: false,
    writing: false,
    speaking: false
  };

  const isListeningDoneToday =
    rlState.listeningDoneDays.includes(activeDayNumber) || currentDayStatus.vocab;
  const isReadingDoneToday =
    rlState.readingDoneDays.includes(activeDayNumber) || currentDayStatus.vocab;
  const isDayFullyDone = currentDayStatus.vocab && currentDayStatus.writing;

  // Compute 5-skill progress counts across 60 days
  const vocabDaysDone = summary.vocabDaysDone;
  const listeningDaysDone = useMemo(() => {
    const combined = new Set<number>([...rlState.listeningDoneDays]);
    Object.entries(dayStatuses).forEach(([d, st]) => {
      if (st?.vocab) combined.add(Number(d));
    });
    return Math.min(60, combined.size);
  }, [rlState.listeningDoneDays, dayStatuses]);

  const readingDaysDone = useMemo(() => {
    const combined = new Set<number>([...rlState.readingDoneDays]);
    Object.entries(dayStatuses).forEach(([d, st]) => {
      if (st?.vocab || st?.writing) combined.add(Number(d));
    });
    return Math.min(60, combined.size);
  }, [rlState.readingDoneDays, dayStatuses]);

  const writingDaysDone = summary.writingDaysDone;
  const speakingDaysDone = summary.speakingDaysDone;

  const fiveSkillProgress = [
    {
      id: 'vocab',
      label: 'Academic Vocab (Từ vựng)',
      done: vocabDaysDone,
      total: 60,
      unit: `${vocabDaysDone * 15}/900 từ`,
      percent: Math.round((vocabDaysDone / 60) * 100),
      icon: <BookOpen className="w-4 h-4 text-[#C81E1E]" />,
      section: 'vocab' as MainChallengeSection
    },
    {
      id: 'listening',
      label: 'Listening (Nghe Phiên Âm & Ngữ Cảnh)',
      done: listeningDaysDone,
      total: 60,
      unit: `${listeningDaysDone}/60 bài nghe`,
      percent: Math.round((listeningDaysDone / 60) * 100),
      icon: <Headphones className="w-4 h-4 text-[#D97706]" />,
      section: 'reading-listening' as MainChallengeSection
    },
    {
      id: 'reading',
      label: 'Reading (Đọc Hiểu Học Thuật)',
      done: readingDaysDone,
      total: 60,
      unit: `${readingDaysDone}/60 bài đọc`,
      percent: Math.round((readingDaysDone / 60) * 100),
      icon: <FileText className="w-4 h-4 text-[#059669]" />,
      section: 'reading-listening' as MainChallengeSection
    },
    {
      id: 'writing',
      label: 'Writing (IELTS Task 2)',
      done: writingDaysDone,
      total: 60,
      unit: `${writingDaysDone}/60 bài luận`,
      percent: Math.round((writingDaysDone / 60) * 100),
      icon: <PenTool className="w-4 h-4 text-[#C81E1E]" />,
      section: 'writing' as MainChallengeSection
    },
    {
      id: 'speaking',
      label: 'Speaking (Phản Xạ Chủ Đề)',
      done: speakingDaysDone,
      total: 60,
      unit: `${speakingDaysDone}/60 buổi nói`,
      percent: Math.round((speakingDaysDone / 60) * 100),
      icon: <Mic className="w-4 h-4 text-[#E11D48]" />,
      section: 'speaking' as MainChallengeSection
    }
  ];

  // Current 7-day window in the roadmap for quick horizontal strip
  const currentWeekDays = useMemo(() => {
    const weekIndex = Math.floor((activeDayNumber - 1) / 7);
    const startDay = weekIndex * 7 + 1;
    const endDay = Math.min(maxAvailableDay, startDay + 6);
    const list: ChallengeDay[] = [];
    for (let d = startDay; d <= endDay; d++) {
      const found = allChallengeDays.find(item => item.day === d);
      if (found) list.push(found);
    }
    return list;
  }, [activeDayNumber, allChallengeDays, maxAvailableDay]);

  // Task completion history across all 60 days
  const completionHistory = useMemo(() => {
    const challengeState = loadChallengeData();
    const masteredSet = new Set<string>(challengeState.masteredVocabIds || []);
    const items: {
      day: number;
      themeVi: string;
      themeEn: string;
      vocabDone: boolean;
      writingDone: boolean;
      speakingDone: boolean;
      listeningDone: boolean;
      readingDone: boolean;
      checkedWordsCount: number;
      isFullyDone: boolean;
    }[] = [];

    for (let d = 1; d <= 60; d++) {
      const st = dayStatuses[d];
      const dayInfo = CHALLENGE_60_DAYS.find(item => item.day === d);
      const checkedCount = dayInfo
        ? dayInfo.vocab.filter(v => masteredSet.has(v.id)).length
        : 0;
      const lDone = rlState.listeningDoneDays.includes(d) || Boolean(st?.vocab);
      const rDone = rlState.readingDoneDays.includes(d) || Boolean(st?.vocab);
      if (st?.vocab || st?.writing || st?.speaking || checkedCount > 0 || lDone || rDone || d === activeDayNumber) {
        if (dayInfo) {
          items.push({
            day: d,
            themeVi: dayInfo.themeVi,
            themeEn: dayInfo.themeEn,
            vocabDone: Boolean(st?.vocab),
            writingDone: Boolean(st?.writing),
            speakingDone: Boolean(st?.speaking),
            listeningDone: lDone,
            readingDone: rDone,
            checkedWordsCount: checkedCount,
            isFullyDone: Boolean(st?.vocab && st?.writing)
          });
        }
      }
    }

    return items.sort((a, b) => b.day - a.day);
  }, [dayStatuses, rlState, activeDayNumber]);

  // Continue challenge CTA handler
  const handleContinueChallenge = () => {
    if (!currentDayStatus.vocab) {
      setActiveSection('vocab');
    } else if (!isReadingDoneToday || !isListeningDoneToday) {
      setActiveSection('reading-listening');
    } else if (!currentDayStatus.writing) {
      setActiveSection('writing');
    } else if (!currentDayStatus.speaking) {
      setActiveSection('speaking');
    } else if (activeDayNumber < 60) {
      handleSelectDay(activeDayNumber + 1);
      setActiveSection('vocab');
    }
    setTimeout(() => {
      practiceWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  // Ring geometry for overall 60-day progress
  const ringRadius = 42;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashoffset =
    ringCircumference - (Math.min(100, summary.percentCompleted) / 100) * ringCircumference;

  const realStreak = Math.max(0, contextStreak || 0);
  const dailyGoalMinutes = userProfile.dailyStudyMinutesGoal || 45;

  return (
    <div className="ielts-60-challenge-container w-full min-w-0 text-[#181614] space-y-5 pb-16">
      {/* 0. ARCHETYPE A MASTHEAD: KỲ XUẤT BẢN (60 SỐ) + ROMAN COLOSSEUM 19TH-CENTURY ENGRAVING */}
      {!isFocusModeActive && (
        <>
          <HorizonEngravingHeader
            engravingSrc={ENGRAVING_ASSETS.architecture.colosseumRome}
            engravingAlt="Roman Colosseum 19th-Century Copperplate Engraving"
            figLabel="FIG. II — AMPHITHEATRUM FLAVIUM"
            className="min-h-[380px] sm:min-h-[420px] flex flex-col justify-center"
            imagePositionClass="right-0 top-0 bottom-0"
            imageWidthClass="w-[62%] sm:w-[58%] lg:w-[54%] max-w-none"
            imageFitClass="h-full w-auto object-contain object-right-bottom"
            imageStyle={{ height: '100%', width: 'auto', objectFit: 'contain', objectPosition: 'right bottom' }}
            timerPageId="ky_xuat_ban"
          >
            <div className="space-y-1.5">
              {handleBack && (
                <div className="flex items-center gap-2 mb-1">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-2.5 py-1 rounded-[2px] bg-[#E9DCC2] hover:bg-[#C92532] border border-[#181614] text-[11px] font-bold text-[#181614] hover:text-[#F1E7D3] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Trang Nhất</span>
                  </button>
                  <AdminGuard>
                    <button
                      type="button"
                      onClick={() => setIsImporterOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[2px] text-[11px] font-bold bg-[#E9DCC2] hover:bg-[#DCC9A8] border border-[#181614] text-[#C92532] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Nạp tư liệu kỳ báo</span>
                    </button>
                  </AdminGuard>
                </div>
              )}

              <div className="font-headline uppercase text-[#181614] leading-[0.94] tracking-[-0.01em]">
                <div className="text-3xl sm:text-4xl lg:text-[44px]">LỊCH TRÌNH XUẤT BẢN —</div>
                <div className="text-3xl sm:text-4xl lg:text-[42px] text-[#C92532] mt-0.5">60 SỐ ĐẶC BIỆT</div>
              </div>
              <p className="font-serif italic font-bold text-sm sm:text-base text-[#51483D] pt-1">
                "Kế hoạch phát hành và rà soát chuyên đề xuyên suốt 60 kỳ liên tiếp."
              </p>
            </div>
          </HorizonEngravingHeader>
        </>
      )}

      {/* 1. HERO BANNER: TIẾN ĐỘ TỔNG THỂ 60 NGÀY + MỤC TIÊU HẰNG NGÀY + NÚT TIẾP TỤC THỬ THÁCH */}
      <section
        className={`newspaper-card rounded-[10px] p-5 sm:p-6 relative overflow-hidden ${
          isFocusModeActive ? 'hidden' : ''
        }`}
      >
        <div className="flex flex-col xl:flex-row items-center justify-between gap-5 relative z-10">
          {/* Left + Center: Circular Ring & Challenge Title + 3 Metric Boxes */}
          <div className="flex flex-col sm:flex-row items-center gap-5 flex-1 min-w-0 w-full">
            {/* Circular Progress Ring */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  fill="none"
                  stroke="#C9B38E"
                  strokeWidth="9"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  fill="none"
                  stroke="#C92532"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringDashoffset}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono tabular-nums text-2xl font-black text-[#181614] leading-none">
                  {summary.percentCompleted}%
                </span>
                <span className="text-[11px] font-bold text-[#51483D] mt-1">độ hoàn thành</span>
              </div>
            </div>

            {/* Heading & 3 Metric Boxes */}
            <div className="space-y-2.5 min-w-0 flex-1 w-full">
              <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-[#181614] tracking-tight">
                Lịch Trình Xuất Bản 60 Số — Mục Tiêu {userProfile.targetBand || 'BAND 7.0+'}
              </h1>
              <p className="text-sm sm:text-base font-bold text-[#181614]">
                <span className="text-[#C92532] font-extrabold font-mono">
                  KỲ #{String(currentDayData.day).padStart(2, '0')}/60:
                </span>{' '}
                {currentDayData.themeEn} ({currentDayData.title || currentDayData.themeVi})
              </p>

              {/* 3 Vintage Aged-Paper Metric Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="px-3.5 py-2.5 rounded-[8px] bg-[#E9DCC2] border border-[#493B2D]/60 flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-[#C92532] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-[#51483D] block">
                      Mục tiêu hàng ngày:
                    </span>
                    <strong className="text-sm font-extrabold text-[#181614]">
                      {dailyGoalMinutes} phút
                    </strong>
                  </div>
                </div>

                <div className="px-3.5 py-2.5 rounded-[8px] bg-[#E9DCC2] border border-[#493B2D]/60 flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-[#2E5A36] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-[#51483D] block">
                      Đã hoàn thành:
                    </span>
                    <strong className="text-sm font-extrabold text-[#181614] tabular-nums">
                      {summary.completedDays}/60 ngày
                    </strong>
                  </div>
                </div>

                <div className="px-3.5 py-2.5 rounded-[8px] bg-[#E9DCC2] border border-[#493B2D]/60 flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-[#C92532] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-[#51483D] block">
                      Đã tích lũy:
                    </span>
                    <strong className="text-sm font-extrabold text-[#181614] tabular-nums">
                      {vocabDaysDone * 15} / 900 từ học thuật
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Distressed Red Ink Stamp Block + Continue Challenge Button */}
          <div className="flex flex-col items-center sm:items-end justify-between gap-3 shrink-0 w-full xl:w-[195px]">
            {/* Distressed Red Ink Stamp */}
            <div
              onClick={() => setShowCalendar(prev => !prev)}
              title="Nhấn để ẩn/hiện Bản đồ 60 ngày"
              className="w-36 h-20 rounded-[6px] newspaper-red-grunge border border-[#181614] shadow-xs relative overflow-hidden cursor-pointer flex flex-col items-center justify-center p-2 select-none"
            >
              <div className="absolute inset-1 border border-dashed border-[#F1E7D3]/45 pointer-events-none" />
              <span className="font-oswald text-[10px] uppercase tracking-widest text-[#F1E7D3]/90 font-bold">
                STREAK • {realStreak} NGÀY
              </span>
              <span className="font-headline text-lg uppercase tracking-wider text-[#F1E7D3] leading-tight">
                {showCalendar ? 'ẨN BẢN ĐỒ' : 'BẢN ĐỒ 60 NGÀY'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleContinueChallenge}
              className="w-full py-2.5 px-4 rounded-[8px] bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] border border-[#181614] text-xs sm:text-sm font-extrabold shadow-[2px_2px_0px_#181614] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-0.5"
            >
              <span>Tiếp tục thử thách</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. THANH TIẾN ĐỘ 5 KỸ NĂNG IELTS TOÀN DIỆN */}
      <section
        className={`space-y-3 ${
          isFocusModeActive ? 'hidden' : ''
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#181614] flex items-center gap-2">
              <span className="text-[#C92532] text-lg">⚡</span>
              <span>Thanh Tiến Độ 5 Kỹ Năng IELTS Toàn Diện</span>
            </h2>
            <p className="text-xs text-[#51483D]">
              Theo dõi sát sao mức độ hoàn thành của cả 5 kỹ năng xuyên suốt 60 ngày thử thách!
            </p>
          </div>
          <span className="text-xs font-bold text-[#C92532] bg-[#F1E7D3] border border-[#C92532]/60 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
            Đồng bộ dữ liệu thời gian thực
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {fiveSkillProgress.map(skill => (
            <button
              key={skill.id}
              type="button"
              onClick={() => {
                setActiveSection(skill.section);
                practiceWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="newspaper-card text-left p-4 rounded-[10px] hover:border-[#C92532] transition-all cursor-pointer group space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="w-8 h-8 rounded-[6px] bg-[#E9DCC2] border border-[#493B2D]/60 flex items-center justify-center shrink-0">
                  {skill.icon}
                </div>
                <span className="font-mono tabular-nums text-xs font-extrabold text-[#181614] bg-[#DCC9A8] border border-[#493B2D]/40 px-2.5 py-0.5 rounded-full">
                  {skill.percent}%
                </span>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-[#181614] group-hover:text-[#C92532] transition-colors line-clamp-2 leading-snug">
                  {skill.label}
                </h3>
                <p className="font-mono tabular-nums text-xs font-bold text-[#51483D] mt-1">
                  {skill.unit}
                </p>
              </div>

              <div className="w-full h-1.5 bg-[#DCC9A8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C92532] rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(4, skill.percent)}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. LỊCH TRÌNH 60 NGÀY (DẢI TUẦN HIỆN TẠI + BẢN ĐỒ 60 NGÀY MỞ RỘNG) */}
      <section
        className={`space-y-3 ${
          isFocusModeActive ? 'hidden' : ''
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#181614] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C92532]" />
              <span>
                Lịch Trình Xuất Bản — Tuần {currentDayData.week} (KỲ #{String(currentWeekDays[0]?.day || 1).padStart(2, '0')} - KỲ #
                {String(currentWeekDays[currentWeekDays.length - 1]?.day || 7).padStart(2, '0')})
              </span>
            </h2>
            <p className="text-xs text-[#51483D]">
              Nhấn vào bất kỳ kỳ xuất bản nào để chuyển nhanh chuyên đề hoặc mở toàn bộ lịch trình 60 số!
            </p>
          </div>

          {/* Day Switcher Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <select
              value={activeDayNumber}
              onChange={e => handleSelectDay(Number(e.target.value))}
              aria-label="Chọn kỳ trong lịch trình xuất bản"
              className="bg-[#F1E7D3] border border-[#493B2D] focus:border-[#C92532] rounded-[8px] px-3.5 py-2 text-xs font-extrabold text-[#181614] outline-hidden cursor-pointer shadow-2xs"
            >
              {allChallengeDays.map(d => {
                const done = dayStatuses[d.day]?.vocab && dayStatuses[d.day]?.writing;
                const label =
                  d.displayLabel ||
                  (d.day <= 60
                    ? `KỲ #${String(d.day).padStart(2, '0')}/60: ${d.themeEn} (${d.title || d.themeVi})`
                    : `KỲ #${String(d.day).padStart(2, '0')} (PDF): ${d.themeVi}`);
                return (
                  <option key={d.day} value={d.day}>
                    {label} {done ? '✓' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Horizontal Roadmap Strip with Left/Right Arrows matching Reference Image 3 */}
        <div className="flex items-stretch gap-2">
          <button
            type="button"
            disabled={activeDayNumber <= 1}
            onClick={() => handleSelectDay(activeDayNumber - 1)}
            className="px-2 rounded-[8px] bg-[#F1E7D3] hover:bg-[#DCC9A8] border border-[#493B2D] text-[#181614] disabled:opacity-40 cursor-pointer flex items-center justify-center shrink-0"
            title="Ngày trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-2.5">
            {currentWeekDays.map(d => {
              const st = dayStatuses[d.day];
              const isDone = Boolean(st?.vocab && st?.writing);
              const isPartial = Boolean(st?.vocab || st?.writing || st?.speaking);
              const isSelected = d.day === activeDayNumber;

              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => handleSelectDay(d.day)}
                  className={`p-3 rounded-[10px] border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] shadow-[2px_2px_0px_#181614]'
                      : 'newspaper-card text-[#181614] hover:border-[#C92532]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-mono font-extrabold ${
                        isSelected ? 'text-[#F1E7D3]' : 'text-[#C92532]'
                      }`}
                    >
                      KỲ #{String(d.day).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[5px] ${
                        isSelected
                          ? 'bg-[#F1E7D3]/20 text-[#F1E7D3]'
                          : isDone
                            ? 'bg-[#2E5A36] text-[#F1E7D3]'
                            : isPartial
                              ? 'bg-[#991D27] text-[#F1E7D3]'
                              : 'bg-[#E9DCC2] text-[#51483D] border border-[#493B2D]/40'
                      }`}
                    >
                      {isDone ? 'Xong' : isPartial ? 'Đang học' : 'Mở'}
                    </span>
                  </div>
                  <p
                    className={`text-xs font-bold line-clamp-2 min-h-[2.4rem] leading-snug ${
                      isSelected ? 'text-[#F1E7D3]' : 'text-[#181614]'
                    }`}
                  >
                    {d.themeEn} ({d.title || d.themeVi})
                  </p>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={activeDayNumber >= maxAvailableDay}
            onClick={() => handleSelectDay(activeDayNumber + 1)}
            className="px-2 rounded-[8px] bg-[#F1E7D3] hover:bg-[#DCC9A8] border border-[#493B2D] text-[#181614] disabled:opacity-40 cursor-pointer flex items-center justify-center shrink-0"
            title="Ngày tiếp theo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Expandable Full Roadmap Modal/Panel */}
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pt-2"
            >
              <ChallengeRoadmapCalendar
                activeDay={activeDayNumber}
                dayStatuses={dayStatuses}
                onSelectDay={day => {
                  handleSelectDay(day);
                  setShowCalendar(false);
                }}
                onClose={() => setShowCalendar(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 4. CÁC NHIỆM VỤ THEO NGÀY (ACTIVE DAY WORKSPACE FOR ALL 5 SKILLS + KHO KIẾN THỨC PDF MỞ RỘNG) */}
      <div
        ref={practiceWorkspaceRef}
        className={`newspaper-card rounded-[10px] p-5 sm:p-6 space-y-4 ${
          isFocusModeActive ? 'hidden' : ''
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-oswald text-xs font-bold uppercase text-[#C92532] bg-[#E9DCC2] px-3 py-1 rounded-full border border-[#C92532]/50">
                TUẦN {currentDayData.week} -{' '}
                {currentDayData.day <= 60
                  ? `KỲ #${String(currentDayData.day).padStart(2, '0')} / 60`
                  : `KỲ #${String(currentDayData.day).padStart(2, '0')} (PDF)`}
              </span>
              {currentDayData.speaking?.sourceType === 'vstep_28_bank' && (
                <span className="text-[11px] font-bold text-[#181614] bg-[#E9DCC2] px-3 py-1 rounded-full border border-[#493B2D]/60">
                  🎙️ Kèm Đề Thi VSTEP (Đề {currentDayData.speaking.originalTestId})
                </span>
              )}
              {isDayFullyDone && (
                <span className="text-xs font-bold text-[#2E5A36] bg-[#E9DCC2] px-3 py-1 rounded-full border border-[#2E5A36] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E5A36]" />
                  <span>Đã xuất bản KỲ #{String(currentDayData.day).padStart(2, '0')}</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#181614] tracking-tight">
              KỲ #{String(currentDayData.day).padStart(2, '0')}: {currentDayData.themeEn} (
              {currentDayData.title || currentDayData.themeVi})
            </h2>
            <p className="text-xs sm:text-sm text-[#51483D]">{currentDayData.description}</p>
          </div>
        </div>

        {/* 5 Skill & Knowledge Bank Section Tabs matching Reference Image 3 */}
        <div className="pt-3 border-t border-[#493B2D]/35 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSection('vocab')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
              activeSection === 'vocab'
                ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] shadow-xs'
                : 'bg-[#E9DCC2] text-[#181614] hover:border-[#C92532] border-[#493B2D]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Từ Vựng Học Thuật (15 Từ)</span>
            {currentDayStatus.vocab && <span className="text-[10px] font-bold">✓</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('reading-listening')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
              activeSection === 'reading-listening'
                ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] shadow-xs'
                : 'bg-[#E9DCC2] text-[#181614] hover:border-[#C92532] border-[#493B2D]'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>2. Reading &amp; Listening Ngữ Cảnh</span>
            {isListeningDoneToday && isReadingDoneToday && (
              <span className="text-[10px] font-bold">✓</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('writing');
              requestAnimationFrame(() => {
                (window as unknown as { refreshWritingStudioLayout?: () => void }).refreshWritingStudioLayout?.();
              });
            }}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
              activeSection === 'writing'
                ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] shadow-xs'
                : 'bg-[#E9DCC2] text-[#181614] hover:border-[#C92532] border-[#493B2D]'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>3. Writing (IELTS Task 2)</span>
            {currentDayStatus.writing && <span className="text-[10px] font-bold">✓</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('speaking')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
              activeSection === 'speaking'
                ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] shadow-xs'
                : 'bg-[#E9DCC2] text-[#181614] hover:border-[#C92532] border-[#493B2D]'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>4. Speaking (Part 1, 2 &amp; 3)</span>
            {currentDayStatus.speaking && <span className="text-[10px] font-bold">✓</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('pdf-knowledge-bank')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
              activeSection === 'pdf-knowledge-bank'
                ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] shadow-xs'
                : 'bg-[#F1E7D3] text-[#C92532] hover:bg-[#E9DCC2] border-[#C92532]/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>5. Ngân Hàng Kiến Thức PDF (83 Trang)</span>
          </button>
        </div>
      </div>

      {/* 5. KHU VỰC BÀI TẬP THỰC HÀNH CHI TIẾT CỦA NGÀY ĐANG CHỌN */}
      <div className="w-full min-w-0">
        {activeSection === 'vocab' && (
          <ChallengeVocabularyTab
            day={currentDayData.day}
            vocabList={currentDayData.vocab}
            isCompleted={currentDayStatus.vocab}
            onStatusChange={refreshState}
          />
        )}

        {activeSection === 'reading-listening' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reading Academic Context Card */}
              <div className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-6 space-y-4">
                <div className="flex items-center justify-between gap-3 border-b-2 border-[#493B2D]/40 pb-3">
                  <div className="flex items-center gap-3">
                    <VintageEngravingFrame
                      src={VINTAGE_EDITORIAL_ASSETS.architecture.onePillarPagoda}
                      alt="IELTS Reading Archive"
                      className="w-12 h-12 hidden sm:block shrink-0"
                      aspectClass="aspect-square"
                    />
                    <div>
                      <h3 className="text-base font-serif font-extrabold text-[#181614]">
                        {currentDayData.readingPassage?.title || `IELTS Reading — Ngữ Cảnh Học Thuật Ngày ${currentDayData.day}`}
                      </h3>
                      <p className="text-xs text-[#51483D]">
                        Bài đọc học thuật 3 đoạn văn song ngữ chủ đề {currentDayData.themeEn}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleReadingDay(currentDayData.day)}
                    className={`px-3.5 py-2 rounded-[2px] border text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${
                      isReadingDoneToday
                        ? 'bg-[#2E5A36] text-[#F1E7D3] border-[#181614]'
                        : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] hover:text-[#C92532] border-[#493B2D]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isReadingDoneToday ? 'Đã hoàn thành Reading' : 'Đánh dấu đã đọc'}</span>
                  </button>
                </div>

                {/* 3-Paragraph Academic Reading Passage with Highlighted 15 Target Words & Bilingual Support */}
                <div className="p-4 sm:p-5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-4 text-sm leading-relaxed text-[#181614]">
                  {(currentDayData.readingPassage?.paragraphs || []).map((para, pIdx) => {
                    const viPara = currentDayData.readingPassage?.translationParagraphs?.[pIdx];
                    return (
                      <div key={pIdx} className="space-y-1.5 pb-3 border-b border-[#493B2D]/40 last:border-b-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-serif text-[14.5px] leading-relaxed text-[#181614]">
                            <span className="font-mono font-extrabold text-xs text-[#C92532] mr-1.5">
                              [Đoạn {pIdx + 1}]
                            </span>
                            {renderTextWithHighlightedVocab(para, currentDayData.vocab, 'crimson')}
                          </p>
                          <button
                            type="button"
                            onClick={() => speakWord(para)}
                            className="p-1.5 rounded-[2px] bg-[#F1E7D3] hover:bg-[#C92532] text-[#C92532] hover:text-[#F1E7D3] border border-[#493B2D] shrink-0 cursor-pointer transition-colors"
                            title="Nghe đoạn văn này"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {viPara && (
                          <p className="text-xs text-[#51483D] italic bg-[#F1E7D3] p-2.5 rounded-[2px] border border-[#493B2D]/50">
                            🇻🇳 <strong>Dịch nghĩa:</strong> {viPara}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {/* Full 15 Target Vocabulary Strip in Reading */}
                  <div className="pt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#51483D]">
                      Từ vựng mục tiêu trong bài đọc ({currentDayData.vocab.length} từ):
                    </span>
                    {currentDayData.vocab.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => speakWord(v.word)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[2px] bg-[#F1E7D3] border border-[#991D27] text-[#C92532] font-mono text-xs font-bold cursor-pointer hover:bg-[#C92532] hover:text-[#F1E7D3] transition-colors"
                        title={`${v.word} (${v.pos}): ${v.meaning}`}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{v.word}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reading Comprehension Questions */}
                <div className="space-y-2.5 pt-1">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#C92532]">
                    Bài Tập Đọc Hiểu &amp; Kiểm Tra Từ Vựng Ngữ Cảnh (Reading Comprehension):
                  </h4>
                  {(currentDayData.readingPassage?.questions || []).map((q, qIdx) => {
                    const selected = selectedQuizAnswers[qIdx];
                    return (
                      <div
                        key={q.id || qIdx}
                        className="p-3.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-2"
                      >
                        <div className="text-xs font-serif font-extrabold text-[#181614]">
                          Câu {qIdx + 1}: {q.questionText}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = opt === q.correctMeaning;
                            const isPicked = selected === opt;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() =>
                                  setSelectedQuizAnswers(prev => ({ ...prev, [qIdx]: opt }))
                                }
                                className={`p-2.5 rounded-[2px] text-left text-xs font-semibold border transition-all cursor-pointer ${
                                  isPicked
                                    ? isCorrect
                                      ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#2E5A36] font-bold'
                                      : 'bg-[#E8B7AC]/50 border-[#991D27] text-[#991D27] font-bold'
                                    : 'bg-[#F1E7D3] border-[#493B2D] text-[#181614] hover:border-[#C92532]'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {selected && q.explanationVi && (
                          <div className="text-[11.5px] text-[#2E5A36] bg-[#DCE6D5] px-3 py-2 rounded-[2px] border border-[#2E5A36]">
                            💡 <strong>Giải thích:</strong> {q.explanationVi}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Listening Dictation & Academic Lecture Lab Card */}
              <div className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-6 space-y-4">
                <div className="flex items-center justify-between gap-3 border-b-2 border-[#493B2D]/40 pb-3">
                  <div className="flex items-center gap-3">
                    <VintageEngravingFrame
                      src={VINTAGE_EDITORIAL_ASSETS.architecture.saigonNotreDame}
                      alt="IELTS Listening Archive"
                      className="w-12 h-12 hidden sm:block shrink-0"
                      aspectClass="aspect-square"
                    />
                    <div>
                      <h3 className="text-base font-serif font-extrabold text-[#181614]">
                        IELTS Listening — Bài Giảng &amp; 15 Câu Học Thuật Ngày {currentDayData.day}
                      </h3>
                      <p className="text-xs text-[#51483D]">
                        Tích hợp trực tiếp &amp; làm nổi bật (highlight) đủ 15 từ vựng mục tiêu chủ đề {currentDayData.themeEn}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleListeningDay(currentDayData.day)}
                    className={`px-3.5 py-2 rounded-[2px] border text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      isListeningDoneToday
                        ? 'bg-[#2E5A36] text-[#F1E7D3] border-[#181614]'
                        : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] hover:text-[#C92532] border-[#493B2D]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isListeningDoneToday ? 'Đã hoàn thành Listening' : 'Đánh dấu đã nghe'}</span>
                  </button>
                </div>

                {/* Cohesive Academic Mini-Lecture Transcript Highlighting Day's 15 Target Words */}
                {(() => {
                  const v = currentDayData.vocab;
                  const lectureTextEn = `Welcome to today's academic lecture on ${currentDayData.themeEn}. First, researchers emphasize ${v[0]?.word || ''} and ${v[1]?.word || ''} when examining modern developments; specifically, ${v[2]?.exampleEn || ''} Second, empirical studies show that ${v[3]?.word || ''}, ${v[4]?.word || ''}, and ${v[5]?.word || ''} directly influence long-term outcomes. ${v[6]?.exampleEn || ''} Moreover, institutions must address ${v[7]?.word || ''}, ${v[8]?.word || ''}, and ${v[9]?.word || ''} while fostering ${v[10]?.word || ''} and ${v[11]?.word || ''}. Finally, integrating ${v[12]?.word || ''}, ${v[13]?.word || ''}, and ${v[14]?.word || ''} guarantees sustainable progress.`;
                  const lectureTextVi = `Chào mừng bạn đến với bài giảng học thuật hôm nay về chủ đề ${currentDayData.themeVi}. Trước hết, các nhà nghiên cứu nhấn mạnh "${v[0]?.meaning || ''}" (${v[0]?.word || ''}) và "${v[1]?.meaning || ''}" (${v[1]?.word || ''}) khi phân tích xu hướng hiện đại; cụ thể, ${v[2]?.exampleVi || ''} Thứ hai, nghiên cứu thực nghiệm chỉ ra rằng "${v[3]?.meaning || ''}", "${v[4]?.meaning || ''}" và "${v[5]?.meaning || ''}" tác động trực tiếp đến kết quả lâu dài. Cuối cùng, việc kết hợp đồng bộ các từ vựng mục tiêu giúp củng cố phản xạ Nghe - Nói học thuật.`;
                  return (
                    <div className="p-4 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#991D27] flex items-center gap-1.5">
                          <Headphones className="w-3.5 h-3.5" />
                          <span>Transcript Bài Giảng Nghe Học Thuật (Highlight 15 Từ Trong Ngày)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => speakWord(lectureTextEn)}
                          className="px-3 py-1 rounded-[2px] bg-[#C92532] hover:bg-[#991D27] border border-[#181614] text-[#F1E7D3] text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Nghe Bài Giảng</span>
                        </button>
                      </div>
                      <p className="text-xs sm:text-[13.5px] leading-relaxed text-[#181614] font-serif">
                        {renderTextWithHighlightedVocab(lectureTextEn, currentDayData.vocab, 'amber')}
                      </p>
                      <p className="text-[11.5px] text-[#51483D] italic bg-[#F1E7D3] p-2.5 rounded-[2px] border border-[#493B2D]/50">
                        🇻🇳 <strong>Tóm tắt dịch nghĩa:</strong> {lectureTextVi}
                      </p>
                    </div>
                  );
                })()}

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {currentDayData.vocab.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] hover:border-[#C92532] transition-all flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-extrabold text-[#C92532]">
                            #{idx + 1} {item.word}
                          </span>
                          <span className="font-mono text-[11px] text-[#51483D] bg-[#F1E7D3] px-2 py-0.5 rounded-[2px] border border-[#493B2D]">
                            {item.ipa}
                          </span>
                          <span className="text-xs font-bold text-[#181614]">
                            — {item.meaning}
                          </span>
                        </div>
                        <p className="text-xs italic font-serif text-[#181614]">
                          "{renderTextWithHighlightedVocab(item.exampleEn, currentDayData.vocab, 'crimson')}"
                        </p>
                        {item.exampleVi && (
                          <p className="text-[11px] text-[#51483D]">🇻🇳 {item.exampleVi}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => speakWord(item.word)}
                          className="px-2.5 py-1.5 rounded-[2px] bg-[#F1E7D3] hover:bg-[#C92532] text-[#C92532] hover:text-[#F1E7D3] border border-[#493B2D] text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Nghe từ vựng"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Từ</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => speakWord(item.exampleEn)}
                          className="px-2.5 py-1.5 rounded-[2px] bg-[#C92532] hover:bg-[#991D27] border border-[#181614] text-[#F1E7D3] text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Nghe toàn bộ câu ví dụ"
                        >
                          <Headphones className="w-3.5 h-3.5" />
                          <span>Câu</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PDF Short Conversation Listening Practice & 3-Step Listening Strategy */}
            <div className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-[#493B2D]/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[2px] bg-[#E8B7AC]/50 border border-[#991D27] text-[#C92532] flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-extrabold text-[#181614]">
                      Bài Tập Listening Thực Chiến &amp; Chiến Lược Nghe Chuyên Sâu (Trích Từ "Ôn thi vstep.pdf" Trang 11 &amp; 81–83)
                    </h3>
                    <p className="text-xs text-[#51483D]">
                      Luyện nghe hội thoại ngắn (Short Conversations) kèm Transcript, Đáp án giải thích và Quy trình 3 bước cải thiện Listening 20 phút/ngày
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {VSTEP_PDF_LISTENING_BANK.map((ls, lIdx) => {
                  const quizKey = 1000 + lIdx;
                  const picked = selectedQuizAnswers[quizKey];
                  return (
                    <div
                      key={ls.id}
                      className="p-4 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-3 text-xs flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-extrabold text-[#181614]">{ls.title}</span>
                          <span className="px-2 py-0.5 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D] text-[10px] font-mono font-bold text-[#C92532]">
                            PDF Trang {ls.pdfPage}
                          </span>
                        </div>
                        <div className="p-3 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <strong className="text-[#C92532] font-mono uppercase">Transcript:</strong>
                            <button
                              type="button"
                              onClick={() => speakWord(ls.transcriptEn)}
                              className="px-2 py-0.5 rounded-[2px] bg-[#E8B7AC]/50 border border-[#991D27] text-[#C92532] font-mono font-bold text-[10.5px] cursor-pointer"
                            >
                              🔊 Nghe
                            </button>
                          </div>
                          <p className="font-serif text-[#181614] whitespace-pre-line">{ls.transcriptEn}</p>
                        </div>

                        <div className="space-y-1.5">
                          <div className="font-serif font-extrabold text-[#181614]">❓ {ls.questionEn}</div>
                          {ls.options && ls.options.length > 0 && (
                            <div className="space-y-1.5">
                              {ls.options.map((opt, oIdx) => {
                                const isSelected = picked === opt;
                                const isRight = opt === ls.correctOption;
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() =>
                                      setSelectedQuizAnswers(prev => ({ ...prev, [quizKey]: opt }))
                                    }
                                    className={`w-full p-2 rounded-[2px] border text-left font-semibold cursor-pointer ${
                                      isSelected
                                        ? isRight
                                          ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#2E5A36] font-bold'
                                          : 'bg-[#E8B7AC]/50 border-[#991D27] text-[#991D27] font-bold'
                                        : 'bg-[#F1E7D3] border-[#493B2D] text-[#181614] hover:border-[#C92532]'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          {(picked || !ls.options?.length) && (
                            <div className="p-2.5 rounded-[2px] bg-[#DCE6D5] border border-[#2E5A36] text-[#2E5A36]">
                              💡 {ls.keyEvidenceExplanation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'writing' && (
          <ChallengeWritingTab
            day={currentDayData.day}
            writingTask={currentDayData.writing}
            dayVocabList={currentDayData.vocab}
            isCompleted={currentDayStatus.writing}
            onStatusChange={refreshState}
            isFocusMode={isWritingFocusMode}
            onToggleFocusMode={handleToggleWritingFocusMode}
          />
        )}

        {activeSection === 'speaking' && (
          <ChallengeSpeakingTab
            day={currentDayData.day}
            speakingTask={currentDayData.speaking}
            dayVocabList={currentDayData.vocab}
            isCompleted={currentDayStatus.speaking}
            onStatusChange={refreshState}
          />
        )}

        {activeSection === 'pdf-knowledge-bank' && (
          <VstepPdfUnlimitedBankTab
            onSelectDay={day => {
              handleSelectDay(day);
              setActiveSection('vocab');
              practiceWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
        )}
      </div>

      {/* 6. LỊCH SỬ HOÀN THÀNH NHIỆM VỤ (TASK COMPLETION HISTORY) */}
      <section
        className={`newspaper-card bg-[#F1E7D3] border-2 border-[#493B2D] rounded-[2px] p-5 sm:p-6 space-y-4 ${
          isFocusModeActive ? 'hidden' : ''
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#493B2D]/40 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[2px] bg-[#E8B7AC]/50 border border-[#991D27] text-[#C92532] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-extrabold text-[#181614]">
                Lịch Sử Hoàn Thành Nhiệm Vụ 60 Ngày
              </h2>
              <p className="text-xs text-[#51483D]">
                Lưu vết tự động tiến độ học tập của từng ngày — Nhấp vào ngày bất kỳ để ôn tập lại
              </p>
            </div>
          </div>

          <span className="font-mono tabular-nums text-xs font-extrabold text-[#2E5A36] bg-[#DCE6D5] border border-[#2E5A36] px-3 py-1 rounded-[2px] self-start sm:self-auto">
            Đã hoàn thành trọn vẹn: {summary.completedDays}/60 ngày
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {completionHistory.slice(0, 9).map(item => (
            <button
              key={item.day}
              type="button"
              onClick={() => {
                handleSelectDay(item.day);
                practiceWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`p-4 rounded-[2px] border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                item.day === activeDayNumber
                  ? 'bg-[#DCC9A8] border-2 border-[#C92532]'
                  : item.isFullyDone
                    ? 'bg-[#DCE6D5]/70 border-[#2E5A36] hover:border-[#181614]'
                    : 'bg-[#E9DCC2] border-[#493B2D] hover:bg-[#DCC9A8] hover:border-[#C92532]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono tabular-nums text-xs font-extrabold text-[#C92532]">
                    Ngày #{String(item.day).padStart(2, '0')}
                  </span>
                  <h3 className="text-sm font-serif font-extrabold text-[#181614] line-clamp-1 mt-0.5">
                    {item.themeVi.replace(/^Ngày \d+:\s*/i, '')}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-[2px] border border-[#181614] shrink-0 ${
                    item.isFullyDone
                      ? 'bg-[#2E5A36] text-[#F1E7D3]'
                      : item.day === activeDayNumber
                        ? 'bg-[#C92532] text-[#F1E7D3]'
                        : 'bg-[#493B2D] text-[#F1E7D3]'
                  }`}
                >
                  {item.isFullyDone
                    ? 'Hoàn thành'
                    : item.day === activeDayNumber
                      ? 'Đang mở'
                      : 'Đang học'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono font-bold">
                <span
                  className={`px-2 py-0.5 rounded-[2px] border ${
                    item.vocabDone
                      ? 'bg-[#DCE6D5] text-[#2E5A36] border-[#2E5A36]'
                      : 'bg-[#F1E7D3] text-[#51483D] border-[#493B2D]'
                  }`}
                >
                  Từ vựng ({item.vocabDone ? '15/15' : `${item.checkedWordsCount}/15`})
                </span>
                <span
                  className={`px-2 py-0.5 rounded-[2px] border ${
                    item.readingDone && item.listeningDone
                      ? 'bg-[#DCE6D5] text-[#2E5A36] border-[#2E5A36]'
                      : 'bg-[#F1E7D3] text-[#51483D] border-[#493B2D]'
                  }`}
                >
                  R&amp;L {item.readingDone && item.listeningDone ? '✓' : '○'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-[2px] border ${
                    item.writingDone
                      ? 'bg-[#DCE6D5] text-[#2E5A36] border-[#2E5A36]'
                      : 'bg-[#F1E7D3] text-[#51483D] border-[#493B2D]'
                  }`}
                >
                  Writing {item.writingDone ? '✓' : '○'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-[2px] border ${
                    item.speakingDone
                      ? 'bg-[#DCE6D5] text-[#2E5A36] border-[#2E5A36]'
                      : 'bg-[#F1E7D3] text-[#51483D] border-[#493B2D]'
                  }`}
                >
                  Speaking {item.speakingDone ? '✓' : '○'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <ContentImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        defaultTab="challenge_day"
        defaultDay={activeDayNumber}
      />
    </div>
  );
};
