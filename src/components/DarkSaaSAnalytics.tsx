import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList
} from 'recharts';
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Layers,
  Activity,
  Target,
  BarChart3,
  ArrowUpRight,
  Zap,
  Maximize2,
  X,
  Mail,
  LineChart as LineChartIcon,
  Trophy,
  BookOpen,
  Calendar,
  TrendingUp,
  Info,
  Download,
  Feather,
  Flame,
  Award,
  Crown,
  Lock,
  Shield,
  Compass,
  ScrollText
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';
import { SessionRecord, getLocalDateString } from '../services/learningStorage';
import { downloadBackupJson } from '../services/backupService';
import { RealtimeFocusClock } from './analytics/RealtimeFocusClock';
import { AnalyticsDetailDrawer, DrawerDetailData } from './analytics/AnalyticsDetailDrawer';
import { GmailWorkspaceModal } from './analytics/GmailWorkspaceModal';
import { MascotDisplay } from './MascotDisplay';
import {
  VintageScholarCatIllustration,
  VintageTowerBridgeEngraving,
  VintageInkwellQuillEngraving,
  VINTAGE_EDITORIAL_ASSETS,
  VintageEngravingFrame
} from './VintageNewspaperIllustrations';
import { VOCAB_DATABASE } from '../data/vocabularyData';
import { loadChallengeData } from '../utils/challengeStorage';

interface DarkSaaSAnalyticsProps {
  onOpenProfile?: () => void;
  onGoToQuiz?: (mode: string) => void;
  onStartPractice?: () => void;
}

type ReportTab =
  | 'today'
  | '7days'
  | 'month'
  | 'all'
  | 'session'
  | '3months'
  | 'memory'
  | 'achievements';

type ChartViewMode = 'bar' | 'line';

// Smooth CountUp Animation component (respects prefers-reduced-motion & guarantees exact final value)
const CountUpNumber: React.FC<{
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  triggerKey?: string | number;
}> = ({ value, decimals = 0, prefix = '', suffix = '', triggerKey }) => {
  const [displayVal, setDisplayVal] = useState<number>(value);
  const prevValRef = useRef<number>(value);
  const prevTriggerRef = useRef<string | number | undefined>(triggerKey);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayVal(value);
      prevValRef.current = value;
      prevTriggerRef.current = triggerKey;
      return;
    }

    const isFilterChange = prevTriggerRef.current !== triggerKey;
    prevTriggerRef.current = triggerKey;

    const startVal = isFilterChange ? 0 : prevValRef.current;
    const endVal = value;
    prevValRef.current = value;

    if (startVal === endVal) {
      setDisplayVal(endVal);
      return;
    }

    const duration = isFilterChange ? 520 : 220;
    const startTime = performance.now();

    let rafId: number;
    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;
      if (progress < 1) {
        setDisplayVal(current);
        rafId = requestAnimationFrame(step);
      } else {
        setDisplayVal(endVal);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, triggerKey]);

  return (
    <span className="tabular-nums">
      {prefix}
      {displayVal.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// Reusable Top-Right Card View Switcher: [ Dạng Cột ] ⇄ [ Dạng Đường ] ⇄ [ Phóng to Modal ]
const BentoCardToolbar: React.FC<{
  mode: ChartViewMode;
  onChangeMode: (m: ChartViewMode) => void;
  onExpandModal: () => void;
}> = ({ mode, onChangeMode, onExpandModal }) => (
  <div className="flex items-center gap-1 bg-[#E9DCC2] p-1 rounded-[6px] border border-[#493B2D] shrink-0">
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChangeMode('bar');
      }}
      className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
        mode === 'bar'
          ? 'bg-[#C92532] text-[#F1E7D3] border border-[#181614]'
          : 'text-[#51483D] hover:text-[#181614]'
      }`}
      title="Chế độ Dạng Cột (Bar)"
    >
      <BarChart3 className="w-3 h-3" />
      <span>Dạng Cột</span>
    </button>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChangeMode('line');
      }}
      className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
        mode === 'line'
          ? 'bg-[#C92532] text-[#F1E7D3] border border-[#181614]'
          : 'text-[#51483D] hover:text-[#181614]'
      }`}
      title="Chế độ Dạng Đường (Line)"
    >
      <LineChartIcon className="w-3 h-3" />
      <span>Dạng Đường</span>
    </button>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onExpandModal();
      }}
      className="px-2.5 py-1 rounded-[4px] text-[11px] font-bold text-[#51483D] hover:bg-[#F1E7D3] hover:text-[#C92532] flex items-center gap-1 transition-all cursor-pointer"
      title="Phóng to Modal"
    >
      <Maximize2 className="w-3 h-3" />
      <span>Phóng to Modal</span>
    </button>
  </div>
);

// 4-Level Intensity Color Calculator for Charts (Vintage Newspaper Palette)
function getFourTierIntensityColor(
  value: number,
  maxValue: number,
  isSinglePeak?: boolean
): string {
  if (maxValue <= 0 || value <= 0) return '#DCC9A8'; // Level 1: Aged paper
  const isPeak = isSinglePeak !== undefined ? isSinglePeak : value === maxValue;
  if (isPeak) return '#C92532'; // Level 4: Peak MAX Editorial Red
  const ratio = value / maxValue;
  if (ratio >= 0.65) return '#991D27'; // Level 3: Dark Editorial Red
  if (ratio >= 0.30) return '#796B59'; // Level 2: Muted warm ink
  return '#DCC9A8'; // Level 1: Aged paper
}

// Custom ★ MAX Badge rendered strictly above the single highest bar when value > 0
const MaxPeakLabel = (props: any) => {
  const { x, y, width, value, viewBox } = props;
  const numVal =
    typeof value === 'number'
      ? value
      : Array.isArray(value)
        ? Number(value[value.length - 1])
        : Number(value);

  if (!numVal || numVal <= 0 || Number.isNaN(numVal)) return null;

  const barX = typeof viewBox?.x === 'number' ? viewBox.x : typeof x === 'number' ? x : 0;
  const barY = typeof viewBox?.y === 'number' ? viewBox.y : typeof y === 'number' ? y : 0;
  const barWidth =
    typeof viewBox?.width === 'number' ? viewBox.width : typeof width === 'number' ? width : 0;

  const badgeWidth = 52;
  const badgeHeight = 20;
  const centerX = barX + barWidth / 2;
  const badgeX = centerX - badgeWidth / 2;
  const badgeY = Math.max(2, barY - badgeHeight - 6);

  return (
    <g className="pointer-events-none select-none">
      <rect
        x={badgeX}
        y={badgeY}
        width={badgeWidth}
        height={badgeHeight}
        rx={4}
        ry={4}
        fill="#181614"
      />
      <text
        x={centerX}
        y={badgeY + 13.5}
        textAnchor="middle"
        fill="#F1E7D3"
        fontSize={10}
        fontFamily="'JetBrains Mono', monospace"
        fontWeight="700"
        letterSpacing="0.03em"
      >
        ★ MAX
      </text>
    </g>
  );
};

// Glassmorphism Tooltip with Chibi Cat Assistant advice for Hourly Chart (0h - 23h)
const HourlyGlassTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const row = payload[0]?.payload || { minutes: 0, words: 0, sessions: 0, isMax: false };

    let catAdvice =
      'Khung giờ này chưa ghi nhận phiên học nào. Nhấn "Bắt Đầu Phiên Học Mới" khi bạn sẵn sàng tập trung.';
    if (row.minutes > 0) {
      if (row.words > 0) {
        catAdvice = `Ghi nhận ${row.minutes} phút học thực tế và +${row.words} từ vựng mới hoàn thành trong khung ${label}.`;
      } else {
        catAdvice = `Ghi nhận ${row.minutes} phút học thực tế (${row.sessions} phiên) trong khung ${label}.`;
      }
    }

    return (
      <div className="bg-[#F1E7D3] p-3.5 rounded-[2px] border border-[#181614] shadow-[3px_3px_0px_#181614] text-xs space-y-2 text-[#181614] max-w-xs z-50">
        <div className="flex items-center justify-between border-b border-[#493B2D]/40 pb-1.5 gap-3">
          <span className="font-serif font-bold text-sm text-[#C92532] flex items-center gap-1.5">
            <span>Khung giờ {label}</span>
            {row.isMax && (
              <span className="font-mono text-[9px] bg-[#181614] text-[#F1E7D3] px-1.5 py-0.5 rounded-[2px]">
                ★ MAX
              </span>
            )}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D]/40 text-[#51483D]">
            {row.sessions || 0} phiên
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 py-0.5">
          <div className="p-2 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D]/60">
            <span className="text-[10px] text-[#51483D] block">Số phút học:</span>
            <span className="font-mono font-bold text-sm text-[#C92532]">
              {row.minutes} phút
            </span>
          </div>
          <div className="p-2 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D]/60">
            <span className="text-[10px] text-[#51483D] block">Từ mới đã thuộc:</span>
            <span className="font-mono font-bold text-sm text-[#2E5A36]">
              +{row.words || 0} từ
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 pt-1.5 border-t border-[#493B2D]/40">
          <div className="w-10 h-10 border border-[#181614] bg-[#E9DCC2] overflow-hidden shrink-0">
            <img
              src={VINTAGE_EDITORIAL_ASSETS.mascot.compass}
              alt="Scholar Cat"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover scale-[1.12] object-center block"
            />
          </div>
          <p className="text-xs text-[#2C2520] leading-snug italic font-serif">
            "{catAdvice}"
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Vintage Newspaper Chart Tooltip
const RealChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const row = payload[0]?.payload;
    return (
      <div className="bg-[#F1E7D3] p-3.5 rounded-[2px] border border-[#181614] shadow-[3px_3px_0px_#181614] text-xs space-y-1.5 text-[#181614] z-50">
        <div className="font-serif font-bold text-[#C92532] border-b border-[#493B2D]/40 pb-1 flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span>{row?.fullLabel || label}</span>
            {row?.isMax && (
              <span className="font-mono text-[9px] bg-[#181614] text-[#F1E7D3] px-1.5 py-0.5 rounded-[2px]">
                ★ MAX
              </span>
            )}
          </span>
          <span className="text-[10px] text-[#51483D] font-sans">Nhấp xem chi tiết</span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`entry-${index}`} className="flex items-center justify-between gap-4">
            <span className="font-medium text-[#51483D]">{entry.name}:</span>
            <span className="font-mono font-bold text-[#C92532]">
              {entry.value} {entry.unit || 'phút'}
            </span>
          </div>
        ))}
        {typeof row?.wordsMastered === 'number' && (
          <div className="flex items-center justify-between gap-4 pt-0.5 border-t border-[#493B2D]/40">
            <span className="text-[#51483D]">Từ mới đã thuộc:</span>
            <span className="font-mono font-bold text-[#2E5A36]">+{row.wordsMastered} từ</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const DarkSaaSAnalytics: React.FC<DarkSaaSAnalyticsProps> = () => {
  const {
    completedSessions,
    wordProgressMap,
    totalUniqueMasteredWords,
    totalUniqueWordsInDatabase,
    realStreak,
    bestStreak,
    totalValidStudySecondsAllTime,
    activeSession,
    activeSessionSeconds,
    lastCompletedSession,
    userProfile
  } = useAnalytics();

  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('7days');
  const [isDeepDiveMode, setIsDeepDiveMode] = useState<boolean>(false);

  // Per-card chart view toggles: [ Dạng Cột / Bar ] ⇄ [ Dạng Đường / Line ] ⇄ [ Phóng to Modal ]
  const [hourlyChartMode, setHourlyChartMode] = useState<ChartViewMode>('bar');
  const [periodChartMode, setPeriodChartMode] = useState<ChartViewMode>('bar');
  const [vocabTrendMode, setVocabTrendMode] = useState<ChartViewMode>('bar');
  const [expandedModalChart, setExpandedModalChart] = useState<
    null | 'hourly' | '7days' | 'month' | 'vocab-trend'
  >(null);

  // Slide-over detail drawer & Gmail modal
  const [selectedDrawerData, setSelectedDrawerData] = useState<DrawerDetailData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isGmailModalOpen, setIsGmailModalOpen] = useState<boolean>(false);
  const [backupToastText, setBackupToastText] = useState<string | null>(null);

  const handleQuickExportBackup = () => {
    try {
      const { fileName, payload } = downloadBackupJson();
      setBackupToastText(
        `Đã tải "${fileName}" (${payload.summary.completedSessionsCount} phiên, ${payload.summary.masteredWordsCount} từ đã thuộc). Dữ liệu trình duyệt được giữ nguyên 100%!`
      );
      setTimeout(() => setBackupToastText(null), 6000);
    } catch (e) {
      setBackupToastText('Không thể tải file sao lưu.');
      setTimeout(() => setBackupToastText(null), 4000);
    }
  };

  // Close expanded modal on Escape
  useEffect(() => {
    if (!expandedModalChart) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedModalChart(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expandedModalChart]);

  const todayStr = getLocalDateString(new Date());

  // Live active seconds added in real-time to Today & All-time readouts
  const liveActiveSec = activeSession ? activeSessionSeconds : 0;
  const liveActiveWordsCount = activeSession ? activeSession.wordsMastered.length : 0;
  const liveActiveQuizAnswered = activeSession ? activeSession.quizQuestionsAnswered : 0;
  const liveActiveQuizCorrect = activeSession ? activeSession.quizQuestionsCorrect : 0;

  const formatDuration = (totalSeconds: number): string => {
    if (totalSeconds <= 0) return '0 phút';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h} giờ ${remM} phút`;
    }
    return `${m} phút ${s > 0 ? `${s}s` : ''}`.trim();
  };

  // ----------------------------------------------------------------------
  // 1. CALCULATE BÁO CÁO 1 NGÀY (HÔM NAY) + LIVE SECOND-BY-SECOND SYNC
  // ----------------------------------------------------------------------
  const todaySessions = useMemo(() => {
    return completedSessions.filter(s => s.dateString === todayStr);
  }, [completedSessions, todayStr]);

  const todayStats = useMemo(() => {
    const savedSec = todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const totalSec = savedSec + liveActiveSec;
    const sessionCount = todaySessions.length;

    const wordsMasteredSet = new Set<string>();
    todaySessions.forEach(s => s.wordsMastered.forEach(w => wordsMasteredSet.add(w)));
    if (activeSession) {
      activeSession.wordsMastered.forEach(w => wordsMasteredSet.add(w));
    }

    const wordsReviewedSet = new Set<string>();
    todaySessions.forEach(s => s.wordsReviewed.forEach(w => wordsReviewedSet.add(w)));
    if (activeSession) {
      activeSession.wordsReviewed.forEach(w => wordsReviewedSet.add(w));
    }

    const quizzesAnswered =
      todaySessions.reduce((acc, s) => acc + s.quizQuestionsAnswered, 0) + liveActiveQuizAnswered;
    const quizzesCorrect =
      todaySessions.reduce((acc, s) => acc + s.quizQuestionsCorrect, 0) + liveActiveQuizCorrect;
    const accuracy = quizzesAnswered > 0 ? Math.round((quizzesCorrect / quizzesAnswered) * 100) : 0;

    const targetMinutes = userProfile.dailyStudyMinutesGoal || 45;
    const exactMinutesFloat = totalSec / 60;
    const currentMinutes = Math.floor(totalSec / 60);
    const currentRemainderSec = totalSec % 60;

    const efficiencyNum =
      exactMinutesFloat > 0 ? wordsMasteredSet.size / exactMinutesFloat : 0;

    return {
      totalSec,
      currentMinutes,
      currentRemainderSec,
      sessionCount,
      wordsMasteredCount: wordsMasteredSet.size,
      wordsReviewedCount: wordsReviewedSet.size,
      quizzesAnswered,
      quizzesCorrect,
      accuracy,
      targetMinutes,
      efficiencyNum,
      efficiencyFormatted: efficiencyNum.toFixed(2)
    };
  }, [
    todaySessions,
    liveActiveSec,
    activeSession,
    liveActiveQuizAnswered,
    liveActiveQuizCorrect,
    userProfile.dailyStudyMinutesGoal
  ]);

  // Full 0h - 23h Hourly Distribution with 4-tier color classification & strictly 1 ★ MAX badge (PHẦN 5)
  const todayHourlyChartBundle = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}h`,
      hourIndex: i,
      minutes: 0,
      rawSeconds: 0,
      words: 0,
      sessions: 0,
      color: '#E5E0D5',
      isMax: false
    }));

    todaySessions.forEach(s => {
      const d = new Date(s.startTime);
      const h = d.getHours();
      if (h >= 0 && h < 24) {
        hours[h].minutes += Math.max(1, Math.round(s.durationSeconds / 60));
        hours[h].rawSeconds += s.durationSeconds;
        hours[h].words += s.wordsMastered.length;
        hours[h].sessions += 1;
      }
    });

    if (activeSession && liveActiveSec > 0) {
      const currentH = new Date().getHours();
      hours[currentH].minutes += Math.max(1, Math.round(liveActiveSec / 60));
      hours[currentH].rawSeconds += liveActiveSec;
      hours[currentH].words += liveActiveWordsCount;
      hours[currentH].sessions += 1;
    }

    // Keep hours 0h and 6h..23h (plus any early hour 1h..5h that has real data)
    const visibleHours = hours.filter(
      (item, idx) => idx === 0 || idx === 3 || idx >= 6 || item.minutes > 0
    );

    const maxMinutes = Math.max(...visibleHours.map(h => h.minutes), 0);

    // Find strictly 1 peak hour slot across the day (0h - 23h)
    let peakHourIndex = -1;
    if (maxMinutes > 0) {
      let bestItem = visibleHours[0];
      for (const item of visibleHours) {
        if (item.minutes > bestItem.minutes) {
          bestItem = item;
        } else if (item.minutes === bestItem.minutes && item.minutes > 0) {
          if (item.rawSeconds > bestItem.rawSeconds) {
            bestItem = item;
          } else if (
            item.rawSeconds === bestItem.rawSeconds &&
            item.words > bestItem.words
          ) {
            bestItem = item;
          } else if (
            item.rawSeconds === bestItem.rawSeconds &&
            item.words === bestItem.words &&
            item.sessions > bestItem.sessions
          ) {
            bestItem = item;
          }
        }
      }
      if (bestItem && bestItem.minutes > 0) {
        peakHourIndex = bestItem.hourIndex;
      }
    }

    const enriched = visibleHours.map(item => {
      const isMax = maxMinutes > 0 && item.hourIndex === peakHourIndex;
      const color = getFourTierIntensityColor(item.minutes, maxMinutes, isMax);
      return {
        ...item,
        color,
        isMax
      };
    });

    const peakHourItem = maxMinutes > 0 ? enriched.find(h => h.isMax) || null : null;

    return {
      data: enriched,
      maxMinutes,
      peakHourItem
    };
  }, [todaySessions, activeSession, liveActiveSec, liveActiveWordsCount]);

  // ----------------------------------------------------------------------
  // 2. CALCULATE BÁO CÁO 7 NGÀY QUA & BIỂU ĐỒ THỨ 2 — CHỦ NHẬT (PHẦN 6)
  // ----------------------------------------------------------------------
  const sevenDayStats = useMemo(() => {
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const fullDayNames = [
      'Chủ Nhật',
      'Thứ 2',
      'Thứ 3',
      'Thứ 4',
      'Thứ 5',
      'Thứ 6',
      'Thứ 7'
    ];

    const days: {
      dateStr: string;
      shortDay: string;
      fullDayName: string;
      label: string;
      tickLabel: string;
      fullLabel: string;
      minutes: number;
      sessionCount: number;
      wordsMastered: number;
      isMax: boolean;
      color: string;
    }[] = [];

    let totalSec = liveActiveSec;
    let totalSessions = 0;
    let activeDaysCount = 0;
    const allMasteredSet = new Set<string>();
    let totalReviews = 0;
    let totalQuizAns = liveActiveQuizAnswered;
    let totalQuizCorr = liveActiveQuizCorrect;

    // Build Monday (T2) -> Sunday (CN) of the current week OR rolling 7 days ordered T2 -> CN
    // Let's compute the current week's Monday..Sunday AND rolling 7 days so all 7 days T2..CN are shown accurately
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is CN, 1 is T2 ... 6 is T7
    const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const mondayDate = new Date(now);
    mondayDate.setDate(now.getDate() + diffToMonday);

    // Also check if there are sessions in the rolling 7 days vs current calendar week;
    // To ensure T2 -> CN order matching "Nhịp Độ Học Tập 7 Ngày (Thứ 2 — Chủ Nhật)",
    // we map the 7 days of the week (T2, T3, T4, T5, T6, T7, CN):
    const rawDays: {
      dateStr: string;
      shortDay: string;
      fullDayName: string;
      dateNumLabel: string;
      minutes: number;
      rawSeconds: number;
      sessionCount: number;
      wordsMastered: number;
      isFutureDay: boolean;
    }[] = [];

    for (let offset = 0; offset < 7; offset++) {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + offset);
      const dStr = getLocalDateString(d);
      const isToday = dStr === todayStr;
      const isFutureDay = d.getTime() > now.getTime() && !isToday;

      const matching = completedSessions.filter(s => s.dateString === dStr);
      const daySec =
        matching.reduce((acc, s) => acc + s.durationSeconds, 0) + (isToday ? liveActiveSec : 0);
      const dayMin = daySec > 0 ? Math.max(1, Math.round(daySec / 60)) : 0;

      totalSec += matching.reduce((acc, s) => acc + s.durationSeconds, 0);
      totalSessions += matching.length;
      if (matching.length > 0 || (isToday && liveActiveSec > 0)) {
        activeDaysCount++;
      }

      let dayMastered = isToday ? liveActiveWordsCount : 0;
      matching.forEach(s => {
        s.wordsMastered.forEach(w => {
          allMasteredSet.add(w);
          dayMastered++;
        });
        totalReviews += s.wordsReviewed.length;
        totalQuizAns += s.quizQuestionsAnswered;
        totalQuizCorr += s.quizQuestionsCorrect;
      });

      const dow = d.getDay();
      rawDays.push({
        dateStr: dStr,
        shortDay: dayNames[dow],
        fullDayName: fullDayNames[dow],
        dateNumLabel: `${d.getDate()}/${d.getMonth() + 1}`,
        minutes: dayMin,
        rawSeconds: daySec,
        sessionCount: matching.length,
        wordsMastered: dayMastered,
        isFutureDay
      });
    }

    const maxWeekMin = Math.max(...rawDays.map(r => r.minutes), 0);

    // Find strictly 1 peak day in the week when maxWeekMin > 0
    let peakDayIdx = -1;
    if (maxWeekMin > 0) {
      peakDayIdx = 0;
      for (let i = 1; i < rawDays.length; i++) {
        const curr = rawDays[i];
        const best = rawDays[peakDayIdx];
        if (curr.minutes > best.minutes) {
          peakDayIdx = i;
        } else if (curr.minutes === best.minutes && curr.minutes > 0) {
          if (curr.rawSeconds > best.rawSeconds) {
            peakDayIdx = i;
          } else if (
            curr.rawSeconds === best.rawSeconds &&
            curr.wordsMastered > best.wordsMastered
          ) {
            peakDayIdx = i;
          }
        }
      }
    }

    rawDays.forEach((r, idx) => {
      const isMax = maxWeekMin > 0 && idx === peakDayIdx;
      const tickLabel =
        r.minutes > 0 || r.sessionCount > 0
          ? `${r.shortDay} (${r.minutes}m)`
          : r.isFutureDay
            ? `${r.shortDay} (--)`
            : `${r.shortDay} (0m)`;

      days.push({
        dateStr: r.dateStr,
        shortDay: r.shortDay,
        fullDayName: r.fullDayName,
        label: `${r.shortDay} (${r.dateNumLabel})`,
        tickLabel,
        fullLabel: `${r.fullDayName}, ${r.dateNumLabel} (${
          r.isFutureDay ? 'Chưa diễn ra' : `${r.minutes} phút`
        })`,
        minutes: r.minutes,
        sessionCount: r.sessionCount,
        wordsMastered: r.wordsMastered,
        isMax,
        color: getFourTierIntensityColor(r.minutes, maxWeekMin, isMax)
      });
    });

    const totalWeekMinutes = days.reduce((acc, d) => acc + d.minutes, 0);
    // Average across all 7 days of the week (including 0-minute days)
    const avgMinutesPerDay = totalWeekMinutes / 7;

    // Best word learning day in the week
    const bestWordDay = days.reduce(
      (best, curr) => (curr.wordsMastered > best.wordsMastered ? curr : best),
      days[0]
    );

    const avgDurationPerSession = totalSessions > 0 ? Math.round(totalSec / totalSessions) : 0;
    const accuracy = totalQuizAns > 0 ? Math.round((totalQuizCorr / totalQuizAns) * 100) : 0;
    const efficiencyNum = totalSec > 0 ? allMasteredSet.size / (totalSec / 60) : 0;

    return {
      days,
      maxWeekMin,
      avgMinutesPerDay,
      bestWordDay: bestWordDay && bestWordDay.wordsMastered > 0 ? bestWordDay : null,
      totalSec,
      totalSessions,
      avgDurationPerSession,
      activeDaysCount,
      newWordsCount: allMasteredSet.size + liveActiveWordsCount,
      totalReviews,
      quizzesAnswered: totalQuizAns,
      quizzesCorrect: totalQuizCorr,
      accuracy,
      efficiencyNum
    };
  }, [
    completedSessions,
    todayStr,
    liveActiveSec,
    liveActiveWordsCount,
    liveActiveQuizAnswered,
    liveActiveQuizCorrect
  ]);

  // ----------------------------------------------------------------------
  // 3. CALCULATE BÁO CÁO 30 NGÀY QUA
  // ----------------------------------------------------------------------
  const monthStats = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filterSessions = completedSessions.filter(s => s.startTime >= thirtyDaysAgo.getTime());

    const totalSec =
      filterSessions.reduce((acc, s) => acc + s.durationSeconds, 0) + liveActiveSec;
    const sessionCount = filterSessions.length;
    const avgSec = sessionCount > 0 ? Math.round(totalSec / sessionCount) : 0;

    const uniqueDays = new Set(filterSessions.map(s => s.dateString));
    const uniqueMastered = new Set<string>();
    let totalReviews = 0;
    let totalQuizAns = liveActiveQuizAnswered;
    let totalQuizCorr = liveActiveQuizCorrect;

    filterSessions.forEach(s => {
      s.wordsMastered.forEach(w => uniqueMastered.add(w));
      totalReviews += s.wordsReviewed.length;
      totalQuizAns += s.quizQuestionsAnswered;
      totalQuizCorr += s.quizQuestionsCorrect;
    });

    const weeks: { weekLabel: string; minutes: number; words: number; color: string; isMax: boolean }[] = [];
    const rawWeeks: { weekLabel: string; minutes: number; words: number }[] = [];

    for (let w = 4; w >= 1; w--) {
      const startDay = (w - 1) * 7;
      const endDay = w * 7;
      let wSec = 0;
      let wWords = 0;

      for (let i = endDay; i > startDay; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = getLocalDateString(d);
        const daySessions = filterSessions.filter(s => s.dateString === dStr);
        wSec += daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
        daySessions.forEach(s => (wWords += s.wordsMastered.length));
      }

      rawWeeks.push({
        weekLabel: `Tuần ${5 - w}`,
        minutes: Math.round(wSec / 60),
        words: wWords
      });
    }

    const maxWeekM = Math.max(...rawWeeks.map(w => w.minutes), 0);
    const peakWeekIdx = maxWeekM > 0 ? rawWeeks.findIndex(w => w.minutes === maxWeekM) : -1;
    rawWeeks.forEach((rw, idx) => {
      const isMax = maxWeekM > 0 && idx === peakWeekIdx;
      weeks.push({
        ...rw,
        isMax,
        color: getFourTierIntensityColor(rw.minutes, maxWeekM, isMax)
      });
    });

    const accuracy = totalQuizAns > 0 ? Math.round((totalQuizCorr / totalQuizAns) * 100) : 0;
    const efficiencyNum = totalSec > 0 ? uniqueMastered.size / (totalSec / 60) : 0;

    return {
      totalSec,
      sessionCount,
      avgSec,
      activeDaysCount: uniqueDays.size,
      wordsMasteredCount: uniqueMastered.size + liveActiveWordsCount,
      totalReviews,
      quizzesAnswered: totalQuizAns,
      quizzesCorrect: totalQuizCorr,
      accuracy,
      efficiencyNum,
      weeks,
      maxWeekM
    };
  }, [
    completedSessions,
    liveActiveSec,
    liveActiveWordsCount,
    liveActiveQuizAnswered,
    liveActiveQuizCorrect
  ]);

  // ----------------------------------------------------------------------
  // 4. CALCULATE TOÀN BỘ (ALL-TIME) & VOCABULARY TAXONOMY SEPARATION (PHẦN 7)
  // ----------------------------------------------------------------------
  const allTimeStats = useMemo(() => {
    const totalSec = totalValidStudySecondsAllTime + liveActiveSec;
    const sessionCount = completedSessions.length;
    let totalReviews = 0;
    let totalQuizAns = liveActiveQuizAnswered;
    let totalQuizCorr = liveActiveQuizCorrect;

    completedSessions.forEach(s => {
      totalReviews += s.wordsReviewed.length;
      totalQuizAns += s.quizQuestionsAnswered;
      totalQuizCorr += s.quizQuestionsCorrect;
    });

    const accuracy = totalQuizAns > 0 ? Math.round((totalQuizCorr / totalQuizAns) * 100) : 0;
    const efficiencyNum =
      totalSec > 0 ? (totalUniqueMasteredWords + liveActiveWordsCount) / (totalSec / 60) : 0;

    // Distinct Vocabulary Counts (PHẦN 7: Không đánh đồng Tổng từ điển / Từ đã xem / Từ mới đã học / Từ đang ôn)
    const allWordRecords = Object.values(wordProgressMap);
    const interactedWordsCount = allWordRecords.filter(
      r => r.timesReviewed > 0 || (r.history && r.history.length > 0)
    ).length;
    const masteredWordsCount = allWordRecords.filter(r => r.status === 'mastered').length;
    const learningOrReviewingCount = allWordRecords.filter(
      r => r.status === 'learning' || r.status === 'reviewing'
    ).length;

    // Session duration distribution
    const shortSessions = completedSessions.filter(s => s.durationSeconds < 15 * 60).length;
    const mediumSessions = completedSessions.filter(
      s => s.durationSeconds >= 15 * 60 && s.durationSeconds < 30 * 60
    ).length;
    const standardSessions = completedSessions.filter(
      s => s.durationSeconds >= 30 * 60 && s.durationSeconds < 45 * 60
    ).length;
    const deepSessions = completedSessions.filter(s => s.durationSeconds >= 45 * 60).length;

    return {
      totalSec,
      sessionCount,
      avgSessionSec: sessionCount > 0 ? Math.round(totalSec / sessionCount) : 0,
      wordsMasteredCount: totalUniqueMasteredWords + liveActiveWordsCount,
      interactedWordsCount,
      masteredWordsStrict: masteredWordsCount,
      learningOrReviewingCount,
      totalReviews,
      quizzesAnswered: totalQuizAns,
      quizzesCorrect: totalQuizCorr,
      accuracy,
      efficiencyNum,
      durationDistribution: {
        shortSessions,
        mediumSessions,
        standardSessions,
        deepSessions
      }
    };
  }, [
    totalValidStudySecondsAllTime,
    liveActiveSec,
    completedSessions,
    totalUniqueMasteredWords,
    wordProgressMap,
    liveActiveWordsCount,
    liveActiveQuizAnswered,
    liveActiveQuizCorrect
  ]);

  // Period-over-Period Comparison (PHẦN 7)
  const periodComparison = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);
    const yesterdaySec = completedSessions
      .filter(s => s.dateString === yesterdayStr)
      .reduce((acc, s) => acc + s.durationSeconds, 0);

    let prev7DaySec = 0;
    for (let i = 13; i >= 7; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateString(d);
      prev7DaySec += completedSessions
        .filter(s => s.dateString === dStr)
        .reduce((acc, s) => acc + s.durationSeconds, 0);
    }

    if (activeReportTab === 'today') {
      if (yesterdaySec === 0) {
        return 'Hôm qua: 0 phút (Chưa đủ dữ liệu kỳ trước để tính % thay đổi)';
      }
      const diffPct = Math.round(((todayStats.totalSec - yesterdaySec) / yesterdaySec) * 100);
      return `${diffPct >= 0 ? `+${diffPct}%` : `${diffPct}%`} so với hôm qua (${Math.round(
        yesterdaySec / 60
      )} phút)`;
    }

    if (activeReportTab === '7days') {
      if (prev7DaySec === 0) {
        return '7 ngày liền trước: 0 phút (Chưa đủ dữ liệu kỳ trước để tính % thay đổi)';
      }
      const diffPct = Math.round(((sevenDayStats.totalSec - prev7DaySec) / prev7DaySec) * 100);
      return `${diffPct >= 0 ? `+${diffPct}%` : `${diffPct}%`} so với 7 ngày tuần trước`;
    }

    return `Trung bình: ${formatDuration(allTimeStats.avgSessionSec)} / phiên (${completedSessions.length} phiên hoàn tất)`;
  }, [activeReportTab, completedSessions, todayStats.totalSec, sevenDayStats.totalSec, allTimeStats.avgSessionSec]);

  const activeFilterKPI = useMemo(() => {
    if (activeReportTab === '7days') {
      return {
        periodLabel: '7 Ngày Qua',
        totalSec: sevenDayStats.totalSec,
        sessionsCount: sevenDayStats.totalSessions,
        wordsCount: sevenDayStats.newWordsCount,
        reviewsCount: sevenDayStats.totalReviews,
        quizAns: sevenDayStats.quizzesAnswered,
        quizCorr: sevenDayStats.quizzesCorrect,
        accuracy: sevenDayStats.accuracy,
        efficiency: sevenDayStats.efficiencyNum
      };
    }
    if (activeReportTab === 'month') {
      return {
        periodLabel: '30 Ngày Qua',
        totalSec: monthStats.totalSec,
        sessionsCount: monthStats.sessionCount,
        wordsCount: monthStats.wordsMasteredCount,
        reviewsCount: monthStats.totalReviews,
        quizAns: monthStats.quizzesAnswered,
        quizCorr: monthStats.quizzesCorrect,
        accuracy: monthStats.accuracy,
        efficiency: monthStats.efficiencyNum
      };
    }
    if (activeReportTab === 'all' || activeReportTab === 'achievements') {
      return {
        periodLabel: 'Toàn Bộ',
        totalSec: allTimeStats.totalSec,
        sessionsCount: allTimeStats.sessionCount,
        wordsCount: allTimeStats.wordsMasteredCount,
        reviewsCount: allTimeStats.totalReviews,
        quizAns: allTimeStats.quizzesAnswered,
        quizCorr: allTimeStats.quizzesCorrect,
        accuracy: allTimeStats.accuracy,
        efficiency: allTimeStats.efficiencyNum
      };
    }
    return {
      periodLabel: 'Hôm Nay',
      totalSec: todayStats.totalSec,
      sessionsCount: todayStats.sessionCount,
      wordsCount: todayStats.wordsMasteredCount,
      reviewsCount: todayStats.wordsReviewedCount,
      quizAns: todayStats.quizzesAnswered,
      quizCorr: todayStats.quizzesCorrect,
      accuracy: todayStats.accuracy,
      efficiency: todayStats.efficiencyNum
    };
  }, [activeReportTab, todayStats, sevenDayStats, monthStats, allTimeStats]);

  // ----------------------------------------------------------------------
  // 5. 90-DAY HEATMAP & MEMORY SRS
  // ----------------------------------------------------------------------
  const ninetyDayHeatmap = useMemo(() => {
    const cells: { dateStr: string; minutes: number; sessionsCount: number; level: number }[] = [];
    const dateMap = new Map<string, { minutes: number; count: number }>();

    completedSessions.forEach(s => {
      const existing = dateMap.get(s.dateString) || { minutes: 0, count: 0 };
      existing.minutes += Math.round(s.durationSeconds / 60);
      existing.count += 1;
      dateMap.set(s.dateString, existing);
    });

    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateString(d);
      const data = dateMap.get(dStr) || { minutes: 0, count: 0 };

      let level = 0;
      if (data.minutes > 0 && data.minutes < 15) level = 1;
      else if (data.minutes >= 15 && data.minutes < 30) level = 2;
      else if (data.minutes >= 30 && data.minutes < 60) level = 3;
      else if (data.minutes >= 60) level = 4;

      cells.push({
        dateStr: dStr,
        minutes: data.minutes,
        sessionsCount: data.count,
        level
      });
    }

    return cells;
  }, [completedSessions]);

  const memoryStats = useMemo(() => {
    const progressList = Object.values(wordProgressMap);
    const masteredList = progressList.filter(p => p.status === 'mastered');
    const now = Date.now();
    let dueCount = 0;
    let overdueCount = 0;
    let freshLearned = 0;

    masteredList.forEach(item => {
      const intervalDays =
        item.timesReviewed === 0 ? 1 : item.timesReviewed === 1 ? 3 : item.timesReviewed === 2 ? 7 : 14;
      const nextDue = (item.lastReviewedAt || now) + intervalDays * 86400000;
      if (now > nextDue + 86400000) overdueCount++;
      else if (now >= nextDue) dueCount++;
      else freshLearned++;
    });

    const topicMap: Record<string, number> = {};
    VOCAB_DATABASE.forEach(item => {
      const topic = (item.tags && item.tags[0]) || 'General Academic';
      topicMap[topic] = (topicMap[topic] || 0) + 1;
    });

    const topicCoverage = Object.entries(topicMap).map(([topic, total]) => {
      const masteredInTopic = masteredList.filter(p => {
        const vocab = VOCAB_DATABASE.find(v => v.id === p.wordId);
        return vocab && ((vocab.tags && vocab.tags[0]) || 'General Academic') === topic;
      }).length;

      return {
        topic,
        mastered: masteredInTopic,
        total,
        percent: Math.round((masteredInTopic / total) * 100)
      };
    });

    return {
      totalMastered: masteredList.length,
      dueCount,
      overdueCount,
      freshLearned,
      topicCoverage
    };
  }, [wordProgressMap]);

  // ----------------------------------------------------------------------
  // 6. HALL OF FAME — THÀNH TÍCH & KỶ LỤC (PHẦN 8 - 100% REAL DATA)
  // ----------------------------------------------------------------------
  const hallOfFameData = useMemo(() => {
    const validSessions = completedSessions.filter(s => s.durationSeconds >= 30);
    const sortedSessionsAsc = [...completedSessions].sort((a, b) => a.startTime - b.startTime);

    // Helper: Format timestamp as DD/MM/YYYY
    const fmtDate = (ts: number) => {
      const d = new Date(ts);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}/${d.getFullYear()}`;
    };

    const fmtShortDate = (ts: number) => {
      const d = new Date(ts);
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return `${dayNames[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(
        d.getMonth() + 1
      ).padStart(2, '0')}`;
    };

    // Find consecutive day streaks and their unlock dates
    const uniqueValidDateStrings = Array.from(
      new Set(validSessions.map(s => s.dateString))
    ).sort();

    let streak7UnlockDate: string | null = null;
    let streak30UnlockDate: string | null = null;
    if (uniqueValidDateStrings.length > 0) {
      let run = 1;
      for (let i = 1; i < uniqueValidDateStrings.length; i++) {
        const prevT = new Date(uniqueValidDateStrings[i - 1]).getTime();
        const currT = new Date(uniqueValidDateStrings[i]).getTime();
        const diffDays = Math.round((currT - prevT) / 86400000);
        if (diffDays === 1) {
          run++;
          if (run >= 7 && !streak7UnlockDate) {
            streak7UnlockDate = uniqueValidDateStrings[i].split('-').reverse().join('/');
          }
          if (run >= 30 && !streak30UnlockDate) {
            streak30UnlockDate = uniqueValidDateStrings[i].split('-').reverse().join('/');
          }
        } else if (diffDays > 1) {
          run = 1;
        }
      }
    }

    // Mastered words sorted by firstMasteredAt
    const masteredRecords = Object.values(wordProgressMap)
      .filter(w => w.status === 'mastered')
      .sort((a, b) => (a.firstMasteredAt || a.lastReviewedAt) - (b.firstMasteredAt || b.lastReviewedAt));

    const word100UnlockDate =
      masteredRecords.length >= 100
        ? fmtDate(masteredRecords[99].firstMasteredAt || masteredRecords[99].lastReviewedAt)
        : null;
    const word300UnlockDate =
      masteredRecords.length >= 300
        ? fmtDate(masteredRecords[299].firstMasteredAt || masteredRecords[299].lastReviewedAt)
        : null;

    // Quiz Sniper 90% (Sessions with >= 5 quiz questions and accuracy >= 90%)
    const highAccuracyQuizSessions = sortedSessionsAsc.filter(
      s => s.quizQuestionsAnswered >= 5 && s.quizQuestionsCorrect / s.quizQuestionsAnswered >= 0.9
    );
    const quiz90UnlockDate =
      highAccuracyQuizSessions.length >= 3
        ? fmtDate(highAccuracyQuizSessions[2].endTime)
        : null;

    // Night Owl (Valid session >= 30s starting or ending between 21:00 and 03:59)
    const nightOwlSessions = sortedSessionsAsc.filter(s => {
      if (s.durationSeconds < 30) return false;
      const startH = new Date(s.startTime).getHours();
      const endH = new Date(s.endTime).getHours();
      return startH >= 21 || startH < 4 || endH >= 21 || endH < 4;
    });
    const nightOwlUnlockDate =
      nightOwlSessions.length >= 1 ? fmtDate(nightOwlSessions[0].endTime) : null;

    const maxStreakAchieved = Math.max(realStreak, bestStreak);

    // 6 Milestones (Grid 3x2 — Synchronized Lucide Editorial Icons & Newsroom Terminology)
    const milestones = [
      {
        id: 'first-week',
        iconName: 'feather' as const,
        title: 'Tập Sự Tòa Soạn (7 Kỳ)',
        unlocked: maxStreakAchieved >= 7,
        unlockDate: streak7UnlockDate,
        progressText: `Tiến độ: ${Math.min(7, maxStreakAchieved)}/7 kỳ`,
        conditionDesc: '7 kỳ xuất bản liên tiếp không gián đoạn (≥30s/kỳ)'
      },
      {
        id: 'vocab-100',
        iconName: 'book' as const,
        title: 'Biên Tập Viên 100 Tư Liệu',
        unlocked: totalUniqueMasteredWords >= 100,
        unlockDate: word100UnlockDate,
        progressText: `Tiến độ: ${Math.min(100, totalUniqueMasteredWords)}/100 tư liệu`,
        conditionDesc: 'Xuất bản và lưu trữ thành công 100 mục từ học thuật'
      },
      {
        id: 'quiz-sniper',
        iconName: 'target' as const,
        title: 'Thẩm Định Viên Chuẩn Xác (90%)',
        unlocked: highAccuracyQuizSessions.length >= 3,
        unlockDate: quiz90UnlockDate,
        progressText: `Tiến độ: ${Math.min(3, highAccuracyQuizSessions.length)}/3 phiên`,
        conditionDesc: '3 phiên duyệt bản thảo đạt độ chính xác ≥90% (tối thiểu 5 câu/phiên)'
      },
      {
        id: 'night-owl',
        iconName: 'clock' as const,
        title: 'Ca Trực Đêm Tòa Soạn',
        unlocked: nightOwlSessions.length >= 1,
        unlockDate: nightOwlUnlockDate,
        progressText: `Tiến độ: ${nightOwlSessions.length >= 1 ? 1 : 0}/1 ca trực`,
        conditionDesc: 'Hoàn tất phiên biên tập hợp lệ tại tòa soạn sau 21h00 tối'
      },
      {
        id: 'master-300',
        iconName: 'crown' as const,
        title: 'Chủ Bút 300 Tư Liệu',
        unlocked: totalUniqueMasteredWords >= 300,
        unlockDate: word300UnlockDate,
        progressText: `Tiến độ: ${Math.min(300, totalUniqueMasteredWords)}/300 tư liệu`,
        conditionDesc:
          totalUniqueMasteredWords >= 300
            ? 'Đã chinh phục mốc 300 tư liệu học thuật xuất bản chính thức'
            : `Còn ${Math.max(0, 300 - totalUniqueMasteredWords)} tư liệu nữa để nhận ấn chương Chủ Bút`
      },
      {
        id: 'warrior-30',
        iconName: 'award' as const,
        title: 'Tổng Biên Tập 30 Kỳ',
        unlocked: maxStreakAchieved >= 30,
        unlockDate: streak30UnlockDate,
        progressText: `Tiến độ: ${Math.min(30, maxStreakAchieved)}/30 kỳ`,
        conditionDesc: 'Duy trì kỷ luật xuất bản 30 kỳ báo liên tiếp không ngắt quãng'
      }
    ];

    // Personal Bests (Strictly from real records)
    const longestSession =
      completedSessions.length > 0
        ? completedSessions.reduce((max, curr) =>
            curr.durationSeconds > max.durationSeconds ? curr : max
          )
        : null;

    const longestSessionLabel = longestSession
      ? `${formatDuration(longestSession.durationSeconds)} (${fmtShortDate(longestSession.startTime)})`
      : 'Chưa ghi nhận ca trực';

    // Most new words in a single day
    const wordsByDate = new Map<string, Set<string>>();
    completedSessions.forEach(s => {
      const set = wordsByDate.get(s.dateString) || new Set<string>();
      s.wordsMastered.forEach(w => set.add(w));
      wordsByDate.set(s.dateString, set);
    });
    let bestDayWordsCount = 0;
    let bestDayDateStr = '';
    wordsByDate.forEach((set, dateStr) => {
      if (set.size > bestDayWordsCount) {
        bestDayWordsCount = set.size;
        bestDayDateStr = dateStr;
      }
    });
    const bestDayWordsLabel =
      bestDayWordsCount > 0
        ? `${bestDayWordsCount} tư liệu (${bestDayDateStr.split('-').reverse().slice(0, 2).join('/')})`
        : 'Chưa ghi nhận tư liệu';

    // Best Quiz Reflex Speed (Only when session has >= 5 quiz questions and valid duration)
    const quizSessionsWithSpeed = completedSessions.filter(
      s => s.quizQuestionsAnswered >= 5 && s.durationSeconds > 0
    );
    let bestReflexLabel = 'Chưa thẩm định';
    if (quizSessionsWithSpeed.length > 0) {
      const fastest = quizSessionsWithSpeed.reduce((best, curr) => {
        const currRate = curr.durationSeconds / curr.quizQuestionsAnswered;
        const bestRate = best.durationSeconds / best.quizQuestionsAnswered;
        return currRate < bestRate ? curr : best;
      });
      const secPerQ = (fastest.durationSeconds / fastest.quizQuestionsAnswered).toFixed(2);
      bestReflexLabel = `${secPerQ} giây / bản thảo`;
    }

    // Chronicle Events (Synthesized strictly from verified events)
    const chronicleEvents: { dateStr: string; timestamp: number; title: string; detail: string }[] = [];

    if (sortedSessionsAsc.length > 0) {
      const firstS = sortedSessionsAsc[0];
      chronicleEvents.push({
        dateStr: fmtDate(firstS.startTime),
        timestamp: firstS.startTime,
        title: 'Khởi tạo ca trực biên tập đầu tiên tại tòa soạn',
        detail: `Thời lượng ${formatDuration(firstS.durationSeconds)} (${firstS.topics.join(', ')})`
      });
    }

    if (longestSession && sortedSessionsAsc.length > 1) {
      chronicleEvents.push({
        dateStr: fmtDate(longestSession.endTime),
        timestamp: longestSession.endTime,
        title: `Kỷ lục ca trực dài nhất: ${formatDuration(longestSession.durationSeconds)}`,
        detail:
          longestSession.quizQuestionsAnswered > 0
            ? `Duyệt chuẩn ${longestSession.quizQuestionsCorrect}/${longestSession.quizQuestionsAnswered} bản thảo`
            : `Xuất bản mới +${longestSession.wordsMastered.length} tư liệu`
      });
    }

    if (totalUniqueMasteredWords > 0 && masteredRecords.length > 0) {
      const latestMastered = masteredRecords[masteredRecords.length - 1];
      const ts = latestMastered.firstMasteredAt || latestMastered.lastReviewedAt;
      chronicleEvents.push({
        dateStr: fmtDate(ts),
        timestamp: ts,
        title: `Chạm mốc ${totalUniqueMasteredWords} tư liệu xuất bản chính thức (SRS)`,
        detail: `Mục từ gần nhất: "${latestMastered.word}"`
      });
    }

    // Check Challenge 60 real completion events if any day has completedAt
    try {
      const challengeData = loadChallengeData();
      Object.entries(challengeData.dayStatuses || {}).forEach(([dayNum, status]) => {
        if (status && status.completedAt) {
          chronicleEvents.push({
            dateStr: fmtDate(status.completedAt),
            timestamp: status.completedAt,
            title: `Hoàn tất Kỳ #${String(dayNum).padStart(2, '0')} — Lịch Trình 60 Số`,
            detail: `Đã duyệt xong chuyên đề Từ vựng & Bài viết học thuật IELTS`
          });
        }
      });
    } catch {}

    chronicleEvents.sort((a, b) => b.timestamp - a.timestamp);

    return {
      milestones,
      longestSessionLabel,
      bestDayWordsLabel,
      bestReflexLabel,
      chronicleEvents: chronicleEvents.slice(0, 6)
    };
  }, [completedSessions, wordProgressMap, totalUniqueMasteredWords, realStreak, bestStreak]);

  const handleOpenDayDrawer = (dateStr: string) => {
    const matchingSessions = completedSessions.filter(s => s.dateString === dateStr);
    const wordsMastered: string[] = [];
    const wordsReviewed: string[] = [];
    matchingSessions.forEach(s => {
      wordsMastered.push(...s.wordsMastered);
      wordsReviewed.push(...s.wordsReviewed);
    });

    setSelectedDrawerData({
      type: 'day',
      title: `Biên Bản Xuất Bản Ngày ${dateStr}`,
      subtitle: `${matchingSessions.length} ca trực · ${formatDuration(
        matchingSessions.reduce((acc, s) => acc + s.durationSeconds, 0)
      )}`,
      dateStr,
      sessions: matchingSessions,
      wordsMasteredIds: Array.from(new Set(wordsMastered)),
      wordsReviewedIds: Array.from(new Set(wordsReviewed))
    });
    setIsDrawerOpen(true);
  };

  const handleOpenSessionDrawer = (session: SessionRecord) => {
    setSelectedDrawerData({
      type: 'session',
      title: `Biên Bản Ca Trực: ${session.topics.join(', ') || 'Academic Editorial'}`,
      subtitle: `${new Date(session.startTime).toLocaleString('vi-VN')} · ${formatDuration(
        session.durationSeconds
      )}`,
      dateStr: session.dateString,
      sessions: [session],
      wordsMasteredIds: session.wordsMastered,
      wordsReviewedIds: session.wordsReviewed
    });
    setIsDrawerOpen(true);
  };

  const studySecForCard =
    activeReportTab === 'today' || activeReportTab === '7days'
      ? sevenDayStats.totalSec
      : activeFilterKPI.totalSec;
  const kpiMinutes = Math.floor(studySecForCard / 60);
  const kpiHours =
    kpiMinutes > 0
      ? Math.max(0.1, Math.floor((kpiMinutes / 60) * 10) / 10)
      : Number((studySecForCard / 3600).toFixed(1));
  const kpiSessionsForCard =
    activeReportTab === 'today' || activeReportTab === '7days'
      ? sevenDayStats.totalSessions
      : activeFilterKPI.sessionsCount;

  const renderMilestoneIcon = (
    iconName: 'feather' | 'book' | 'target' | 'clock' | 'crown' | 'award',
    unlocked: boolean
  ) => {
    if (!unlocked) {
      return <Lock className="w-5 h-5 text-[#51483D]" />;
    }
    switch (iconName) {
      case 'feather':
        return <Feather className="w-5 h-5 text-[#C92532]" />;
      case 'book':
        return <BookOpen className="w-5 h-5 text-[#C92532]" />;
      case 'target':
        return <Target className="w-5 h-5 text-[#C92532]" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-[#C92532]" />;
      case 'crown':
        return <Crown className="w-5 h-5 text-[#C92532]" />;
      case 'award':
        return <Award className="w-5 h-5 text-[#C92532]" />;
    }
  };

  return (
    <div className="min-h-screen py-3 sm:py-5 px-3 sm:px-6 lg:px-8 text-[#181614] transition-colors">
      {/* ====================================================================
          VINTAGE NEWSPAPER MASTHEAD + FILTER TOOLBAR (SEAMLESS PRINT INTEGRATION)
          ==================================================================== */}
      <div className="max-w-7xl mx-auto mb-5 space-y-3.5">
        {/* Top Publication Issue Strip */}
        <div className="border-y-2 border-[#181614] py-1.5 px-3 flex items-center justify-between text-xs font-oswald uppercase tracking-[0.18em] text-[#2C2520] bg-[#E9DCC2]/90">
          <span className="hidden sm:inline font-bold">VOL. IV • ISSUE NO. 60</span>
          <span className="mx-auto font-bold text-[#181614] tracking-[0.16em]">
            TÒA SOẠN HỌC THUẬT &nbsp;|&nbsp; NGÔN TỪ - TRI THỨC - BẢN LĨNH
          </span>
          <span className="hidden sm:inline font-bold text-[#C92532]">MASTER ENGLISH PRESS</span>
        </div>

        {/* Main 3-Column Editorial Masthead Banner (Seamless Engravings on Aged Paper) */}
        <div className="relative border-b-2 border-[#181614] pb-4 grid grid-cols-1 lg:grid-cols-12 items-center gap-4 overflow-hidden">
          {/* Subtle Atmospheric Himalaya Watermark in Masthead Center */}
          <div
            className="pointer-events-none select-none absolute inset-x-1/4 inset-y-0 opacity-[0.07]"
            aria-hidden="true"
          >
            <img
              src={VINTAGE_EDITORIAL_ASSETS.architecture.himalayaMonasteryPilgrimage}
              alt=""
              className="w-full h-full object-cover vintage-print-seamless mask-radial-soft"
            />
          </div>

          {/* Left: Seamless Woodcut Scholar Cat Wearing Academic Mortarboard Cap & Glasses Reading Book */}
          <div className="lg:col-span-3 flex items-center justify-center lg:justify-start relative z-10">
            <div className="w-48 h-32 sm:w-56 sm:h-36 -my-2 select-none pointer-events-none">
              <img
                src={VINTAGE_EDITORIAL_ASSETS.mascot.glassesBook}
                alt="Scholar Cat Wearing Mortarboard Cap Reading Book"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover scale-[1.15] object-center vintage-print-seamless mask-radial-soft block"
              />
            </div>
          </div>

          {/* Center: Editorial Circulation Report Masthead + Red Brushstroke Underline */}
          <div className="lg:col-span-5 text-center space-y-1.5 relative z-10">
            <div className="inline-block relative">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#C92532] mb-1">
                CIRCULATION &amp; NEWSROOM METRICS
              </div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-[34px] uppercase tracking-tight text-[#181614] leading-tight">
                BÁO CÁO PHÁT HÀNH &amp; SỐ LIỆU TÒA SOẠN
              </h1>
              {/* Bold Red Brushstroke Underline */}
              <svg
                viewBox="0 0 320 14"
                className="w-full h-3 mt-1 overflow-visible"
                preserveAspectRatio="none"
              >
                <path
                  d="M4 8 Q160 2 316 7 L312 12 Q160 7 8 12 Z"
                  fill="#C92532"
                />
              </svg>
            </div>
            <p className="font-serif italic font-bold text-xs sm:text-sm text-[#2C2520]">
              “Thống kê thời lượng làm việc tại tòa soạn, năng suất biên tập và chỉ số lưu giữ tư liệu.”
            </p>
          </div>

          {/* Right: "Data speaks. We listen." + Red Postal Stamp + Seamless Big Ben Woodcut Engraving */}
          <div className="lg:col-span-4 flex items-center justify-center lg:justify-end gap-2 relative z-10">
            <div className="text-right space-y-2 relative z-10">
              <p className="font-serif italic font-bold text-lg sm:text-xl text-[#181614] leading-tight">
                Data speaks.
                <br />
                We listen.
              </p>
              {/* Circular Red Vintage Postal Stamp */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-[#C92532] text-[#C92532] p-1 -rotate-12 select-none bg-[#F1E7D3] shadow-[2px_2px_0px_#181614]">
                <div className="w-full h-full rounded-full border border-[#C92532] flex flex-col items-center justify-center text-[8px] font-oswald font-bold uppercase leading-tight text-center">
                  <span>★ TÒA SOẠN ★</span>
                  <span className="text-[9.5px] font-black">KIỂM ĐỊNH</span>
                  <span>VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Seamless Big Ben Architectural Woodcut Engraving */}
            <div className="w-40 h-32 sm:w-44 sm:h-36 -my-2 select-none pointer-events-none">
              <img
                src={VINTAGE_EDITORIAL_ASSETS.architecture.bigBen}
                alt="Big Ben Clock Tower Engraving"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover scale-[1.15] object-center vintage-print-seamless mask-radial-soft block"
              />
            </div>
          </div>
        </div>

        {backupToastText && (
          <div className="p-3 rounded-[2px] bg-[#F1E7D3] border-2 border-[#2E5A36] text-[#2E5A36] text-xs sm:text-sm font-bold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E5A36] shrink-0" />
              <span>{backupToastText}</span>
            </div>
            <button
              type="button"
              onClick={() => setBackupToastText(null)}
              className="text-[#2E5A36] hover:text-[#181614] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Unified Vintage Newspaper Filter Bar with Synchronized Lucide Editorial Icons */}
        <div className="newspaper-card rounded-[2px] p-3 space-y-2.5 border-2 border-[#181614] shadow-[3px_3px_0px_#181614]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Left Primary Time Filters (100% Synchronized Icons & Newsroom Labels) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'today', label: 'Hôm Nay', icon: Calendar },
                { id: '7days', label: '7 Ngày Qua', icon: BarChart3 },
                { id: 'month', label: '30 Ngày Qua', icon: TrendingUp },
                { id: 'all', label: 'Toàn Bộ', icon: BookOpen },
                { id: 'achievements', label: 'Thành Tích', icon: Trophy }
              ].map(tab => {
                const isActive = activeReportTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveReportTab(tab.id as ReportTab)}
                    className={`px-3.5 py-1.5 rounded-[2px] text-xs font-extrabold transition-all cursor-pointer border-[1.5px] inline-flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] shadow-[2px_2px_0px_#181614]'
                        : 'bg-[#E9DCC2] text-[#181614] border-[#181614] hover:bg-[#DCC9A8] hover:border-[#C92532]'
                    }`}
                  >
                    <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F1E7D3]' : 'text-[#C92532]'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Quick Actions: Sao Lưu Hồ Sơ, Gửi Bản Tin Gmail & Hồ Sơ Chuyên Sâu */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleQuickExportBackup}
                className="px-3 py-1.5 rounded-[2px] border-[1.5px] border-[#181614] bg-[#E9DCC2] hover:bg-[#DCC9A8] text-xs font-bold text-[#181614] transition-all flex items-center gap-1.5 cursor-pointer"
                title="Tải toàn bộ hồ sơ tòa soạn về máy dưới dạng file .JSON"
              >
                <Download className="w-3.5 h-3.5 text-[#2E5A36]" />
                <span>Sao Lưu Hồ Sơ (.JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGmailModalOpen(true)}
                className={`px-3 py-1.5 rounded-[2px] border-[1.5px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isGmailModalOpen
                    ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                    : 'bg-[#E9DCC2] text-[#181614] border-[#181614] hover:border-[#C92532]'
                }`}
              >
                <Mail className={`w-3.5 h-3.5 ${isGmailModalOpen ? 'text-[#F1E7D3]' : 'text-[#C92532]'}`} />
                <span>Gửi Báo Cáo Gmail</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDeepDiveMode(prev => !prev);
                  setActiveReportTab(prev => (prev === 'all' ? '7days' : 'all'));
                }}
                className={`px-3 py-1.5 rounded-[2px] border-[1.5px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isDeepDiveMode || activeReportTab === 'all'
                    ? 'bg-[#181614] text-[#F1E7D3] border-[#181614] shadow-[2px_2px_0px_#C92532]'
                    : 'bg-[#F1E7D3] text-[#181614] border-[#181614] hover:border-[#C92532]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C92532]" />
                <span>Thẩm Định Chuyên Sâu</span>
              </button>
            </div>
          </div>

          {/* Secondary specialized inspection links aligned right */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1.5 border-t border-[#493B2D]/35">
            <span className="font-mono text-[11px] font-semibold text-[#51483D]">
              {periodComparison}
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { id: 'session', label: 'Biên Bản Ca Trực', icon: <Clock className="w-3.5 h-3.5" /> },
                { id: '3months', label: 'Ma Trận 90 Kỳ', icon: <Layers className="w-3.5 h-3.5" /> },
                { id: 'memory', label: 'Độ Phủ Tư Liệu & SRS', icon: <RotateCcw className="w-3.5 h-3.5" /> }
              ].map(tab => {
                const isActive = activeReportTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveReportTab(tab.id as ReportTab)}
                    className={`px-2.5 py-1 rounded-[2px] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-[#C92532] text-[#F1E7D3] border border-[#181614]'
                        : 'text-[#2C2520] hover:text-[#C92532]'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          TWO-ZONE BENTO GRID LAYOUT (NEWSROOM EDITORIAL METRICS)
          ==================================================================== */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-5">
        {/* CỘT TRÁI: REAL-TIME FOCUS CLOCK & TỔNG LŨY KẾ TÒA SOẠN */}
        <aside className="w-full lg:w-80 shrink-0 space-y-4">
          {/* 1. Real-time Focus Clock */}
          <RealtimeFocusClock onSessionEnded={() => setActiveReportTab('session')} />

          {/* 2. TỔNG LŨY KẾ TÒA SOẠN with Seamless Feather Quill & Inkwell Engraving */}
          <div className="newspaper-card rounded-[2px] p-4 sm:p-5 text-[#181614] relative overflow-hidden border-2 border-[#181614] shadow-[3px_3px_0px_#181614]">
            <h3 className="text-sm font-oswald font-bold uppercase tracking-wider text-[#181614] mb-3 pb-2 border-b border-[#493B2D]/40 flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-[#C92532] shrink-0" />
              <span>TỔNG LŨY KẾ TÒA SOẠN</span>
            </h3>

            <div className="space-y-2 text-xs relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[#51483D] font-medium">Giờ Làm Việc Tại Tòa Soạn:</span>
                <span className="font-mono font-extrabold text-[#181614]">
                  {formatDuration(totalValidStudySecondsAllTime + liveActiveSec)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#51483D] font-medium">Tổng Phiên Biên Tập:</span>
                <span className="font-mono font-extrabold text-[#181614]">
                  <CountUpNumber
                    value={completedSessions.length}
                    suffix=" phiên"
                    triggerKey={activeReportTab}
                  />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#51483D] font-medium">Thời Lượng TB / Phiên:</span>
                <span className="font-mono font-extrabold text-[#181614]">
                  {formatDuration(allTimeStats.avgSessionSec)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#51483D] font-medium">Chuỗi Kỳ Xuất Bản Liên Tiếp:</span>
                <span className="font-mono font-extrabold text-[#C92532]">
                  {realStreak} kỳ
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#51483D] font-medium">Kỷ Lục Xuất Bản Liên Tiếp:</span>
                <span className="font-mono font-extrabold text-[#991D27]">
                  <CountUpNumber
                    value={Math.max(bestStreak, realStreak)}
                    suffix=" kỳ liên tiếp"
                    triggerKey={activeReportTab}
                  />
                </span>
              </div>

              {/* Distinct Vocabulary Breakdown + Seamless Vintage Inkwell & Quill Cat Engraving */}
              <div className="pt-2.5 mt-2.5 border-t border-dashed border-[#493B2D]/50 flex items-end justify-between gap-2">
                <div className="space-y-1.5 flex-1">
                  <div className="font-oswald text-[10px] font-bold uppercase tracking-wider text-[#51483D]">
                    PHÂN TÁCH HỒ SƠ TƯ LIỆU THỰC TẾ:
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#51483D]">Tư Liệu Đã Xuất Bản:</span>
                    <span className="font-mono font-extrabold text-[#2E5A36]">
                      {allTimeStats.masteredWordsStrict} từ
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#51483D]">Bản Thảo Đang Hiệu Đính:</span>
                    <span className="font-mono font-extrabold text-[#C92532]">
                      {allTimeStats.learningOrReviewingCount} từ
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#51483D]">Tổng Tư Liệu Đã Tra Cứu:</span>
                    <span className="font-mono font-extrabold text-[#181614]">
                      {allTimeStats.interactedWordsCount} / {totalUniqueWordsInDatabase}
                    </span>
                  </div>
                </div>

                {/* Seamless Woodcut Scholar Cat Writing with Quill at Desk (No rectangular border box) */}
                <div className="w-24 h-24 -mr-2 -mb-2 shrink-0 select-none pointer-events-none">
                  <img
                    src={VINTAGE_EDITORIAL_ASSETS.editorial.quillCatDesk}
                    alt="Quill & Inkwell Ledger Engraving"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover scale-[1.15] object-center vintage-print-seamless mask-radial-soft block"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* CỘT PHẢI: MAIN ANALYTICS BENTO GRID */}
        <main className="flex-1 min-w-0 w-full space-y-4">
          {/* ==============================================================
              4 VINTAGE NEWSPAPER KPI CARDS ROW WITH SEAMLESS WOODCUTS
              ============================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {/* Card 1: GIỜ LÀM VIỆC TẠI TÒA SOẠN + Seamless Woodcut Books Stack */}
            <div
              onClick={() => handleOpenDayDrawer(todayStr)}
              className="newspaper-card p-4 rounded-[2px] border-2 border-[#181614] shadow-[3px_3px_0px_#181614] hover:border-[#C92532] transition-all cursor-pointer flex items-center justify-between gap-2 relative overflow-hidden"
            >
              <div className="min-w-0 z-10">
                <span className="font-oswald text-xs uppercase font-bold text-[#2C2520] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#C92532] shrink-0" />
                  <span className="truncate">GIỜ LÀM VIỆC TẠI TÒA SOẠN</span>
                </span>
                <div className="font-mono text-2xl font-black mt-1.5 text-[#C92532]">
                  <CountUpNumber
                    value={kpiHours}
                    decimals={1}
                    suffix=" giờ"
                    triggerKey={activeReportTab}
                  />
                </div>
                <div className="text-xs font-semibold text-[#2C2520] mt-0.5">
                  <CountUpNumber
                    value={kpiSessionsForCard}
                    suffix=" ca trực đã lưu"
                    triggerKey={activeReportTab}
                  />
                </div>
              </div>

              <div className="w-20 h-20 -mr-2 -my-2 shrink-0 select-none pointer-events-none">
                <img
                  src={VINTAGE_EDITORIAL_ASSETS.mascot.nearBooks}
                  alt="Study Time Books Engraving"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover scale-[1.15] object-center vintage-print-seamless mask-radial-soft block"
                />
              </div>
            </div>

            {/* Card 2: TƯ LIỆU ĐÃ XUẤT BẢN + Seamless Woodcut Dictionary Cat */}
            <div
              onClick={() => handleOpenDayDrawer(todayStr)}
              className="newspaper-card p-4 rounded-[2px] border-2 border-[#181614] shadow-[3px_3px_0px_#181614] hover:border-[#C92532] transition-all cursor-pointer flex items-center justify-between gap-2 relative overflow-hidden"
            >
              <div className="min-w-0 z-10">
                <span className="font-oswald text-xs uppercase font-bold text-[#2C2520] flex items-center gap-1">
                  <Feather className="w-3.5 h-3.5 text-[#2E5A36] shrink-0" />
                  <span className="truncate">TƯ LIỆU ĐÃ XUẤT BẢN</span>
                </span>
                <div className="font-mono text-2xl font-black mt-1.5 text-[#2E5A36]">
                  <CountUpNumber
                    value={activeFilterKPI.wordsCount}
                    prefix="+"
                    triggerKey={activeReportTab}
                  />{' '}
                  <span className="text-sm font-bold text-[#181614]">tư liệu</span>
                </div>
                <div className="text-xs font-semibold text-[#2C2520] mt-0.5">
                  <CountUpNumber
                    value={activeFilterKPI.reviewsCount}
                    suffix=" lượt hiệu đính"
                    triggerKey={activeReportTab}
                  />
                </div>
              </div>

              <div className="w-20 h-20 -mr-2 -my-2 shrink-0 select-none pointer-events-none">
                <img
                  src={VINTAGE_EDITORIAL_ASSETS.mascot.dictionaryArmchair}
                  alt="Dictionary Armchair Cat Engraving"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover scale-[1.15] object-center vintage-print-seamless mask-radial-soft block"
                />
              </div>
            </div>

            {/* Card 3: TỶ LỆ DUYỆT BẢN THẢO + Seamless Woodcut Compass Cat */}
            <div className="newspaper-card p-4 rounded-[2px] border-2 border-[#181614] shadow-[3px_3px_0px_#181614] flex items-center justify-between gap-2 relative overflow-hidden">
              <div className="min-w-0 z-10">
                <span className="font-oswald text-xs uppercase font-bold text-[#2C2520] flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-[#C92532] shrink-0" />
                  <span className="truncate">TỶ LỆ DUYỆT BẢN THẢO</span>
                </span>
                <div className="font-serif font-extrabold text-xl sm:text-2xl mt-1.5 text-[#C92532]">
                  {activeFilterKPI.quizAns > 0 ? (
                    <span className="font-mono font-black">
                      <CountUpNumber
                        value={activeFilterKPI.accuracy}
                        suffix="%"
                        triggerKey={activeReportTab}
                      />
                    </span>
                  ) : (
                    'Chưa duyệt'
                  )}
                </div>
                <div className="text-xs font-semibold text-[#2C2520] mt-0.5">
                  {activeFilterKPI.quizCorr}/{activeFilterKPI.quizAns} bản thảo chuẩn
                </div>
              </div>

              <div className="w-20 h-20 -mr-2 -my-2 shrink-0 select-none pointer-events-none">
                <img
                  src={VINTAGE_EDITORIAL_ASSETS.mascot.compass}
                  alt="Quiz Precision Compass Cat Engraving"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover scale-[1.15] object-center vintage-print-seamless mask-radial-soft block"
                />
              </div>
            </div>

            {/* Card 4: NĂNG SUẤT BIÊN TẬP + Seamless Woodcut Red Hourglass / Quill Cat */}
            <div className="newspaper-card p-4 rounded-[2px] border-2 border-[#181614] shadow-[3px_3px_0px_#181614] flex items-center justify-between gap-2 relative overflow-hidden">
              <div className="min-w-0 z-10">
                <span className="font-oswald text-xs uppercase font-bold text-[#2C2520] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#C92532] shrink-0" />
                  <span className="truncate">NĂNG SUẤT BIÊN TẬP</span>
                </span>
                <div className="font-mono text-2xl font-black mt-1.5 text-[#C92532]">
                  <CountUpNumber
                    value={activeFilterKPI.efficiency}
                    decimals={2}
                    triggerKey={activeReportTab}
                  />{' '}
                  <span className="text-xs font-bold text-[#181614]">từ/phút</span>
                </div>
                <div className="text-xs font-semibold text-[#2C2520] mt-0.5">
                  Tư liệu xuất bản / phút
                </div>
              </div>

              <div className="w-20 h-20 -mr-2 -my-2 shrink-0 select-none pointer-events-none">
                <img
                  src={VINTAGE_EDITORIAL_ASSETS.mascot.redHourglass}
                  alt="Editorial Speed Hourglass Cat Engraving"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover scale-[1.15] object-center vintage-print-seamless mask-radial-soft block"
                />
              </div>
            </div>
          </div>

          {/* ==============================================================
              PHẦN 8: TAB THÀNH TÍCH & KỶ LỤC (ẤN CHƯƠNG & DANH DỰ TÒA SOẠN)
              ============================================================== */}
          {activeReportTab === 'achievements' && (
            <div className="space-y-5">
              {/* KHỐI 1 — CHUỖI KỲ XUẤT BẢN LIÊN TIẾP (NO EMOJIS — LUCIDE FLAME + SEAMLESS WATERMARK) */}
              <div className="p-6 sm:p-8 rounded-[2px] newspaper-card border-2 border-[#181614] shadow-[3px_3px_0px_#181614] text-center space-y-2.5 relative overflow-hidden">
                {/* Seamless Himalaya Pilgrimage Watermark in Background */}
                <div
                  className="pointer-events-none select-none absolute inset-0 opacity-[0.11]"
                  aria-hidden="true"
                >
                  <img
                    src={VINTAGE_EDITORIAL_ASSETS.architecture.himalayaMonasteryPilgrimage}
                    alt=""
                    className="w-full h-full object-cover vintage-print-seamless mask-radial-soft"
                  />
                </div>

                <div className="relative z-10 inline-flex items-center gap-2 px-3 py-0.5 bg-[#181614] text-[#F1E7D3] font-oswald text-xs font-bold uppercase tracking-widest">
                  <Flame className="w-3.5 h-3.5 text-[#C92532] fill-[#C92532]" />
                  <span>CHUỖI KỲ XUẤT BẢN LIÊN TIẾP (EDITORIAL STREAK)</span>
                </div>

                <div className="relative z-10 flex items-center justify-center gap-3.5 py-2">
                  <div className="w-14 h-14 rounded-full bg-[#E9DCC2] border-2 border-[#181614] shadow-[2px_2px_0px_#181614] flex items-center justify-center">
                    <Flame className="w-8 h-8 text-[#C92532] fill-[#C92532]/25" />
                  </div>
                  <span className="font-serif font-black text-5xl sm:text-6xl text-[#C92532] tabular-nums">
                    {realStreak}
                  </span>
                  <span className="text-2xl sm:text-3xl text-[#2C2520] font-serif italic font-bold">
                    kỳ liên tiếp
                  </span>
                </div>

                <p className="relative z-10 text-xs sm:text-sm text-[#2C2520] font-serif italic max-w-xl mx-auto">
                  {realStreak > 0
                    ? `“Tòa soạn ghi nhận bạn đã duy trì xuất bản liên tục ${realStreak} kỳ báo (Kỷ lục xuất bản cao nhất: ${Math.max(
                        bestStreak,
                        realStreak
                      )} kỳ liên tiếp).”`
                    : `“Chưa ghi nhận chuỗi kỳ xuất bản liên tục. Hãy hoàn tất ít nhất 1 ca trực hợp lệ (≥30 giây) hôm nay để khai mở chuỗi ấn phẩm!”`}
                </p>
              </div>

              {/* KHỐI 2 — ẤN CHƯƠNG & CỘT MỐC DANH DỰ TÒA SOẠN (6 MILESTONES — SYNCHRONIZED LUCIDE ICONS) */}
              <div className="p-5 sm:p-6 rounded-[2px] newspaper-card border-2 border-[#181614] shadow-[3px_3px_0px_#181614] space-y-4">
                <div className="flex items-center justify-between border-b border-[#493B2D]/40 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#C92532]" />
                    <h2 className="text-base sm:text-lg font-serif font-black uppercase tracking-tight text-[#181614]">
                      Ấn Chương &amp; Cột Mốc Danh Dự Tòa Soạn (6 Ấn Chương)
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-[#51483D]">
                    Đã cấp ấn chương:{' '}
                    <strong className="text-[#C92532]">
                      {hallOfFameData.milestones.filter(m => m.unlocked).length}/6
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hallOfFameData.milestones.map(m => (
                    <div
                      key={m.id}
                      className={`p-5 rounded-[2px] text-center transition-all flex flex-col items-center justify-center space-y-2 ${
                        m.unlocked
                          ? 'bg-[#E9DCC2] border-2 border-[#C92532] shadow-[2px_2px_0px_#181614]'
                          : 'bg-[#E9DCC2]/65 border border-dashed border-[#493B2D]'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center border-[1.5px] ${
                          m.unlocked
                            ? 'bg-[#F1E7D3] border-[#C92532] shadow-[2px_2px_0px_#181614]'
                            : 'bg-[#F1E7D3]/70 border-[#493B2D]/60'
                        }`}
                      >
                        {renderMilestoneIcon(m.iconName, m.unlocked)}
                      </div>

                      <h3
                        className={`font-serif font-black text-base ${
                          m.unlocked ? 'text-[#181614]' : 'text-[#51483D]'
                        }`}
                      >
                        {m.title}
                      </h3>

                      {m.unlocked ? (
                        <div className="font-mono text-xs font-bold text-[#2E5A36] px-2 py-0.5 bg-[#DCE6D5] border border-[#2E5A36]">
                          ★ Cấp ngày {m.unlockDate || 'Thực tế'}
                        </div>
                      ) : (
                        <div className="font-mono text-xs font-semibold text-[#51483D] px-2 py-0.5 bg-[#F1E7D3] border border-[#493B2D]/40">
                          {m.progressText}
                        </div>
                      )}

                      <p className="text-xs text-[#2C2520] leading-snug">
                        {m.conditionDesc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* KHỐI 3 — KỶ LỤC TÒA SOẠN VÀ BIÊN NIÊN SỬ XUẤT BẢN (2 CỘT 50/50) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Cột trái: Kỷ Lục Tòa Soạn — Newsroom Records */}
                <div className="p-5 sm:p-6 rounded-[2px] newspaper-card border-2 border-[#181614] shadow-[3px_3px_0px_#181614] space-y-4">
                  <h3 className="text-base font-serif font-black uppercase tracking-tight text-[#181614] flex items-center gap-2 border-b border-[#493B2D]/40 pb-2">
                    <Trophy className="w-4 h-4 text-[#C92532]" />
                    <span>Kỷ Lục Bút Lực Tòa Soạn (Newsroom Records)</span>
                  </h3>

                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center justify-between pb-2.5 border-b border-dashed border-[#493B2D]/40">
                      <span className="text-[#51483D] font-medium">Ca trực biên tập dài nhất:</span>
                      <span className="font-mono font-bold text-[#C92532]">
                        {hallOfFameData.longestSessionLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2.5 border-b border-dashed border-[#493B2D]/40">
                      <span className="text-[#51483D] font-medium">Số tư liệu xuất bản kỷ lục / ngày:</span>
                      <span className="font-mono font-bold text-[#181614]">
                        {hallOfFameData.bestDayWordsLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2.5 border-b border-dashed border-[#493B2D]/40">
                      <span className="text-[#51483D] font-medium">Tốc độ duyệt bản thảo nhanh nhất:</span>
                      <span className="font-mono font-bold text-[#2E5A36]">
                        {hallOfFameData.bestReflexLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[#51483D] font-medium">Tổng kho tư liệu đã xuất bản:</span>
                      <span className="font-mono font-bold text-[#181614]">
                        {totalUniqueMasteredWords} / {totalUniqueWordsInDatabase} tư liệu
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cột phải: Biên Niên Sử Tòa Soạn — Editorial Chronicle */}
                <div className="p-5 sm:p-6 rounded-[2px] newspaper-card border-2 border-[#181614] shadow-[3px_3px_0px_#181614] space-y-4">
                  <h3 className="text-base font-serif font-black uppercase tracking-tight text-[#181614] flex items-center gap-2 border-b border-[#493B2D]/40 pb-2">
                    <Calendar className="w-4 h-4 text-[#C92532]" />
                    <span>Biên Niên Sử Xuất Bản (Editorial Chronicle)</span>
                  </h3>

                  {hallOfFameData.chronicleEvents.length === 0 ? (
                    <div className="p-5 rounded-[2px] bg-[#E9DCC2] border border-dashed border-[#493B2D] text-xs text-[#51483D] text-center font-serif italic">
                      Chưa có sự kiện biên niên sử nào được lưu trữ. Hãy hoàn tất ca trực hoặc xuất bản tư liệu đầu tiên để hệ thống khắc dấu cột mốc thực tế!
                    </div>
                  ) : (
                    <div className="border-l-2 border-[#C92532] pl-4 space-y-3.5">
                      {hallOfFameData.chronicleEvents.map((ev, idx) => (
                        <div key={`${ev.timestamp}-${idx}`} className="text-xs space-y-0.5">
                          <div className="flex flex-wrap items-baseline gap-1.5">
                            <span className="font-mono font-bold text-[#C92532]">
                              {ev.dateStr}:
                            </span>
                            <span className="font-bold text-[#181614]">{ev.title}</span>
                          </div>
                          <p className="text-[#51483D] text-[11px]">{ev.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              PHẦN 5: BIỂU ĐỒ HÔM NAY (NHẬT KÝ CA TRỰC NGÀY HÔM NAY)
              ============================================================== */}
          {(activeReportTab === 'today' || activeReportTab === 'all') && (
            <div className="p-5 sm:p-6 rounded-[2px] newspaper-card border-2 border-[#181614] shadow-[3px_3px_0px_#181614] space-y-4 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#493B2D]/40 pb-3">
                <div>
                  <div className="inline-block px-2 py-0.5 bg-[#181614] text-[#F1E7D3] font-mono text-[10px] font-bold uppercase tracking-widest mb-1">
                    NHẬT KÝ CA TRỰC NGÀY HÔM NAY
                  </div>
                  <h3 className="font-serif font-black text-base sm:text-lg text-[#181614] flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#C92532]" />
                    <span>Biên Bản Hoạt Động Theo Khung Giờ Tại Tòa Soạn (0h – 23h)</span>
                  </h3>
                  <p className="text-xs text-[#51483D]">
                    Cường độ biên tập và thẩm định ngôn từ thực tế ghi nhận theo từng múi giờ xuất bản trong ngày.
                  </p>
                </div>

                <BentoCardToolbar
                  mode={hourlyChartMode}
                  onChangeMode={setHourlyChartMode}
                  onExpandModal={() => setExpandedModalChart('hourly')}
                />
              </div>

              {/* 4-Tier Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#51483D] bg-[#E9DCC2] px-3.5 py-2 rounded-[2px] border border-[#493B2D]/60">
                <span className="font-bold text-[#181614]">4 cấp độ nhịp độ tòa soạn:</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-[2px] bg-[#DCC9A8] inline-block border border-[#493B2D]" />
                  <span>Tĩnh lặng / Nghỉ ngơi</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-[2px] bg-[#796B59] inline-block" />
                  <span>Biên tập thường nhật</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-[2px] bg-[#991D27] inline-block" />
                  <span>Trực chiến cao điểm</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-[2px] bg-[#C92532] inline-block" />
                  <span className="font-bold text-[#C92532]">★ MAX (Đỉnh điểm xuất bản)</span>
                </span>
              </div>

              {/* Chart Canvas */}
              <div className="relative h-64 w-full pt-2">
                {todayStats.totalSec === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pb-4">
                    <div className="w-28 h-24 select-none pointer-events-none">
                      <img
                        src={VINTAGE_EDITORIAL_ASSETS.mascot.sleepingBook}
                        alt="Sleeping Scholar Cat"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover scale-[1.15] object-center vintage-print-seamless mask-radial-soft block"
                      />
                    </div>
                    <p className="text-xs sm:text-sm font-serif font-bold text-[#181614] mt-1">
                      Tòa soạn chưa ghi nhận ca trực biên tập nào trong ngày hôm nay.
                    </p>
                  </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                  {hourlyChartMode === 'bar' ? (
                    <BarChart
                      data={todayHourlyChartBundle.data}
                      margin={{ top: 30, right: 8, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#C9B38E"
                      />
                      <XAxis
                        dataKey="hour"
                        stroke="#51483D"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#493B2D' }}
                        tick={(props: any) => {
                          const { x, y, payload } = props;
                          const item = todayHourlyChartBundle.data.find(
                            d => d.hour === payload.value
                          );
                          const isPeak = Boolean(item?.isMax);
                          const hasActivity = Boolean(item && item.minutes > 0);
                          return (
                            <text
                              x={x}
                              y={y + 12}
                              textAnchor="middle"
                              fontSize={11}
                              fontFamily="'JetBrains Mono', monospace"
                              fontWeight={isPeak || hasActivity ? 700 : 400}
                              fill={isPeak ? '#C92532' : hasActivity ? '#181614' : '#51483D'}
                            >
                              {payload.value}
                            </text>
                          );
                        }}
                      />
                      <YAxis
                        stroke="#51483D"
                        fontSize={11}
                        unit="m"
                        tickLine={false}
                        axisLine={false}
                        domain={[0, (dataMax: number) => Math.max(4, Math.ceil(dataMax * 1.15))]}
                      />
                      <Tooltip
                        content={<HourlyGlassTooltip />}
                        allowEscapeViewBox={{ x: false, y: true }}
                        wrapperStyle={{ zIndex: 50 }}
                      />
                      <Bar
                        dataKey="minutes"
                        name="Số phút trực"
                        radius={[2, 2, 0, 0]}
                        isAnimationActive={false}
                      >
                        {todayHourlyChartBundle.data.map((entry, idx) => (
                          <Cell key={`hour-cell-${idx}`} fill={entry.color} />
                        ))}
                        <LabelList
                          dataKey={(row: any) => (row?.isMax ? row.minutes : null)}
                          content={(props: any) => <MaxPeakLabel {...props} />}
                        />
                      </Bar>
                    </BarChart>
                  ) : (
                    <LineChart
                      data={todayHourlyChartBundle.data}
                      margin={{ top: 20, right: 12, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#C9B38E"
                      />
                      <XAxis
                        dataKey="hour"
                        stroke="#51483D"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#493B2D' }}
                      />
                      <YAxis
                        stroke="#51483D"
                        fontSize={11}
                        unit="m"
                        tickLine={false}
                        axisLine={false}
                        domain={[0, (dataMax: number) => Math.max(4, Math.ceil(dataMax * 1.15))]}
                      />
                      <Tooltip
                        content={<HourlyGlassTooltip />}
                        allowEscapeViewBox={{ x: false, y: true }}
                        wrapperStyle={{ zIndex: 50 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="minutes"
                        name="Số phút trực"
                        stroke="#C92532"
                        strokeWidth={2.5}
                        dot={(dotProps: any) => {
                          const { cx, cy, payload } = dotProps;
                          return (
                            <circle
                              key={`dot-${payload.hour}`}
                              cx={cx}
                              cy={cy}
                              r={payload.isMax ? 5 : 3.5}
                              fill={payload.minutes > 0 ? payload.color : '#DCC9A8'}
                              stroke="#181614"
                              strokeWidth={1.2}
                            />
                          );
                        }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ==============================================================
              PHẦN 6: BIỂU ĐỒ 7 NGÀY QUA (CHUYÊN ĐỀ TUẦN LỄ + ĐƯỜNG XU HƯỚNG)
              ============================================================== */}
          {activeReportTab === '7days' && (
            <div className="space-y-4">
              {/* Primary Upgraded 7-Day Feature Spread Chart */}
              <div className="newspaper-card p-5 sm:p-6 rounded-[2px] border-2 border-[#181614] shadow-[3px_3px_0px_#181614] space-y-4 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#493B2D]/40 pb-3">
                  <div>
                    <div className="inline-block px-2.5 py-0.5 bg-[#C92532] text-[#F1E7D3] font-oswald text-[10px] font-bold uppercase tracking-widest border border-[#181614]">
                      BÁO CÁO TUẦN LỄ PHÁT HÀNH
                    </div>
                    <h3 className="font-serif font-extrabold text-lg sm:text-xl text-[#181614] mt-1">
                      Tiến Độ Xuất Bản 7 Kỳ Trong Tuần (Thứ 2 — Chủ Nhật)
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#51483D]">
                      Đơn vị: Phút
                    </span>
                    <BentoCardToolbar
                      mode={periodChartMode}
                      onChangeMode={setPeriodChartMode}
                      onExpandModal={() => setExpandedModalChart('7days')}
                    />
                  </div>
                </div>

                {/* Split Layout: Left 7-Day Bar/Line Chart + Right Seamless Vintage Architectural Engraving */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-center">
                  <div className="xl:col-span-8 h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      {periodChartMode === 'bar' ? (
                        <BarChart
                          data={sevenDayStats.days}
                          margin={{ top: 30, right: 8, left: 0, bottom: 6 }}
                          onClick={(e: any) => {
                            if (e?.activePayload?.[0]) {
                              handleOpenDayDrawer(e.activePayload[0].payload.dateStr);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#C9B38E"
                          />
                          <XAxis
                            dataKey="tickLabel"
                            stroke="#51483D"
                            fontSize={11}
                            tickLine={false}
                            axisLine={{ stroke: '#493B2D' }}
                            tick={(props: any) => {
                              const { x, y, payload, index } = props;
                              const dayItem = sevenDayStats.days[index];
                              const isPeak = Boolean(dayItem?.isMax);
                              return (
                                <text
                                  x={x}
                                  y={y + 13}
                                  textAnchor="middle"
                                  fontSize={11}
                                  fontFamily="'JetBrains Mono', monospace"
                                  fontWeight={isPeak ? 800 : 600}
                                  fill={isPeak ? '#C92532' : '#181614'}
                                >
                                  {payload.value}
                                </text>
                              );
                            }}
                          />
                          <YAxis
                            stroke="#51483D"
                            fontSize={11}
                            unit="m"
                            tickLine={false}
                            axisLine={false}
                            domain={[0, (dataMax: number) => Math.max(15, Math.ceil(dataMax * 1.2))]}
                          />
                          <Tooltip
                            content={<RealChartTooltip />}
                            allowEscapeViewBox={{ x: false, y: true }}
                            wrapperStyle={{ zIndex: 50 }}
                          />
                          <Bar
                            dataKey="minutes"
                            name="Thời lượng ca trực"
                            radius={[2, 2, 0, 0]}
                            isAnimationActive={false}
                          >
                            {sevenDayStats.days.map((entry, index) => (
                              <Cell key={`week-cell-${index}`} fill={entry.color} />
                            ))}
                            <LabelList
                              dataKey={(row: any) => (row?.isMax ? row.minutes : null)}
                              content={(props: any) => <MaxPeakLabel {...props} />}
                            />
                          </Bar>
                        </BarChart>
                      ) : (
                        <LineChart
                          data={sevenDayStats.days}
                          margin={{ top: 20, right: 12, left: 0, bottom: 6 }}
                          onClick={(e: any) => {
                            if (e?.activePayload?.[0]) {
                              handleOpenDayDrawer(e.activePayload[0].payload.dateStr);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#C9B38E"
                          />
                          <XAxis
                            dataKey="tickLabel"
                            stroke="#51483D"
                            fontSize={11}
                            tickLine={false}
                            axisLine={{ stroke: '#493B2D' }}
                          />
                          <YAxis
                            stroke="#51483D"
                            fontSize={11}
                            unit="m"
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            content={<RealChartTooltip />}
                            allowEscapeViewBox={{ x: false, y: true }}
                            wrapperStyle={{ zIndex: 50 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="minutes"
                            name="Thời lượng ca trực"
                            stroke="#C92532"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: '#C92532' }}
                          />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  {/* Right Seamless Architectural Engraving (Sydney Opera House / Landmark — No Pasted Box) */}
                  <div className="xl:col-span-4 flex flex-col items-center justify-center relative">
                    <div className="w-full max-w-[300px] h-52 select-none pointer-events-none relative">
                      <img
                        src={VINTAGE_EDITORIAL_ASSETS.architecture.sydneyOperaHouse}
                        alt="Architectural Landmark Engraving"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover scale-[1.15] object-center vintage-print-seamless mask-radial-soft block"
                      />
                    </div>
                    <span className="mt-1 px-2.5 py-0.5 bg-[#E9DCC2] border border-[#493B2D]/60 font-mono text-[10px] font-bold uppercase text-[#181614]">
                      FIG. VII — NHỊP ĐỘ TUẦN LỄ
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-[#493B2D]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-[#181614]">
                    Trung bình: <strong>{sevenDayStats.avgMinutesPerDay.toFixed(1)} phút/kỳ</strong> (tính trên 7 kỳ trong tuần, kỳ chưa trực tính 0m)
                  </span>
                  {sevenDayStats.bestWordDay ? (
                    <span className="text-[#C92532] font-extrabold">
                      {sevenDayStats.bestWordDay.fullDayName} là kỳ bứt phá xuất bản nhiều tư liệu nhất (+
                      {sevenDayStats.bestWordDay.wordsMastered} tư liệu)
                    </span>
                  ) : (
                    <span className="text-[#51483D]">
                      Chưa ghi nhận tư liệu mới xuất bản trong tuần lễ này
                    </span>
                  )}
                </div>
              </div>

              {/* Continuous Line Chart for 7-Day Trend + "Study Smarter Live Better" Red Ribbon */}
              <div className="newspaper-card p-5 sm:p-6 rounded-[2px] border-2 border-[#181614] shadow-[3px_3px_0px_#181614] space-y-3 relative overflow-hidden">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-center">
                  <div className="xl:col-span-8 space-y-3">
                    <div>
                      <h4 className="font-serif font-extrabold text-base sm:text-lg text-[#181614]">
                        Biểu Đồ Đối Chiếu Thời Lượng &amp; Tư Liệu Xuất Bản 7 Kỳ
                      </h4>
                      <p className="text-xs text-[#51483D]">
                        Nhấp vào điểm kỳ báo bất kỳ trên biểu đồ để mở Hồ Sơ Chi Tiết xem danh mục từ vựng và ca trực.
                      </p>
                    </div>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={sevenDayStats.days}
                          onClick={(e: any) => {
                            if (e?.activePayload?.[0]) {
                              handleOpenDayDrawer(e.activePayload[0].payload.dateStr);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#C9B38E" />
                          <XAxis dataKey="label" stroke="#51483D" fontSize={11} />
                          <YAxis stroke="#51483D" fontSize={11} unit="m" />
                          <Tooltip content={<RealChartTooltip />} />
                          <Line
                            type="monotone"
                            dataKey="minutes"
                            name="Thời lượng ca trực"
                            stroke="#C92532"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: '#C92532', stroke: '#181614', strokeWidth: 1 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right Vintage Books & "Study Smarter Live Better" Crimson Banner */}
                  <div className="xl:col-span-4 flex flex-col items-center justify-center relative py-2 select-none">
                    <svg viewBox="0 0 220 130" className="w-52 h-32">
                      {/* Engraved Stack of Antique Books */}
                      <g stroke="#181614" strokeWidth="1.5" fill="#DCC9A8">
                        <rect x="36" y="88" width="145" height="22" rx="3" fill="#51483D" />
                        <rect x="40" y="92" width="136" height="14" fill="#F1E7D3" />
                        <rect x="46" y="66" width="130" height="22" rx="3" fill="#181614" />
                        <rect x="50" y="70" width="120" height="14" fill="#E9DCC2" />
                        <rect x="54" y="44" width="115" height="22" rx="3" fill="#C92532" />
                        <rect x="58" y="48" width="106" height="14" fill="#F1E7D3" />
                      </g>
                      {/* Crimson Red Tilted Ribbon */}
                      <g transform="rotate(-8 110 55)">
                        <rect
                          x="18"
                          y="18"
                          width="184"
                          height="44"
                          rx="4"
                          fill="#C92532"
                          stroke="#181614"
                          strokeWidth="1.8"
                        />
                        <text
                          x="110"
                          y="37"
                          textAnchor="middle"
                          fill="#F1E7D3"
                          fontFamily="'Playfair Display', Georgia, serif"
                          fontStyle="italic"
                          fontWeight="700"
                          fontSize="16"
                        >
                          Study Smarter
                        </text>
                        <text
                          x="110"
                          y="54"
                          textAnchor="middle"
                          fill="#F1E7D3"
                          fontFamily="'Playfair Display', Georgia, serif"
                          fontStyle="italic"
                          fontWeight="700"
                          fontSize="15"
                        >
                          Live Better
                        </text>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              30 NGÀY QUA (BIÊN NIÊN SỬ 30 KỲ — 4 TUẦN LỄ)
              ============================================================== */}
          {activeReportTab === 'month' && (
            <div className="p-5 sm:p-6 rounded-[2px] newspaper-card border-2 border-[#181614] shadow-[3px_3px_0px_#181614] space-y-4 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#493B2D]/40 pb-3">
                <div>
                  <div className="inline-block px-2.5 py-0.5 bg-[#181614] text-[#F1E7D3] font-mono text-[10px] font-bold uppercase tracking-widest mb-1">
                    BIÊN NIÊN SỬ 30 KỲ XUẤT BẢN
                  </div>
                  <h3 className="font-serif font-black text-base sm:text-lg text-[#181614] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#C92532]" />
                    <span>Báo Cáo Lưu Hành &amp; Năng Suất 30 Kỳ Qua (4 Tuần Lễ)</span>
                  </h3>
                  <p className="text-xs text-[#51483D]">
                    Tổng hợp thời lượng làm việc tại tòa soạn và tư liệu xuất bản qua 4 tuần lễ gần nhất.
                  </p>
                </div>

                <BentoCardToolbar
                  mode={periodChartMode}
                  onChangeMode={setPeriodChartMode}
                  onExpandModal={() => setExpandedModalChart('month')}
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-center">
                <div className="xl:col-span-8 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {periodChartMode === 'bar' ? (
                      <BarChart data={monthStats.weeks} margin={{ top: 30, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#C9B38E" />
                        <XAxis dataKey="weekLabel" stroke="#51483D" fontSize={12} />
                        <YAxis stroke="#51483D" fontSize={11} unit="m" />
                        <Tooltip content={<RealChartTooltip />} />
                        <Bar dataKey="minutes" name="Số phút trực" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                          {monthStats.weeks.map((entry, idx) => (
                            <Cell key={`m-cell-${idx}`} fill={entry.color} />
                          ))}
                          <LabelList
                            dataKey={(row: any) => (row?.isMax ? row.minutes : null)}
                            content={(props: any) => <MaxPeakLabel {...props} />}
                          />
                        </Bar>
                      </BarChart>
                    ) : (
                      <AreaChart data={monthStats.weeks}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#C9B38E" />
                        <XAxis dataKey="weekLabel" stroke="#51483D" fontSize={12} />
                        <YAxis stroke="#51483D" fontSize={11} unit="m" />
                        <Tooltip content={<RealChartTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="minutes"
                          name="Số phút trực"
                          stroke="#C92532"
                          fill="#C92532"
                          fillOpacity={0.18}
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Right Seamless Fansipan Mountain Pagoda Engraving */}
                <div className="xl:col-span-4 flex flex-col items-center justify-center">
                  <div className="w-full max-w-[280px] h-48 select-none pointer-events-none">
                    <img
                      src={VINTAGE_EDITORIAL_ASSETS.architecture.fansipanMountainPagoda}
                      alt="Fansipan Mountain Pagoda Engraving"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover scale-[1.15] object-center vintage-print-seamless mask-radial-soft block"
                    />
                  </div>
                  <span className="mt-1 px-2.5 py-0.5 bg-[#E9DCC2] border border-[#493B2D]/60 font-mono text-[10px] font-bold uppercase text-[#181614]">
                    FIG. XXX — HÀNH TRÌNH 30 KỲ
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#493B2D]/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-[#E9DCC2] border border-[#493B2D]/50 flex items-center justify-between">
                  <span className="text-[#51483D]">Tổng thời lượng 30 kỳ:</span>
                  <strong className="text-[#C92532]">{formatDuration(monthStats.totalSec)}</strong>
                </div>
                <div className="p-2.5 bg-[#E9DCC2] border border-[#493B2D]/50 flex items-center justify-between">
                  <span className="text-[#51483D]">Số kỳ có ca trực:</span>
                  <strong className="text-[#181614]">{monthStats.activeDaysCount} / 30 kỳ</strong>
                </div>
                <div className="p-2.5 bg-[#E9DCC2] border border-[#493B2D]/50 flex items-center justify-between">
                  <span className="text-[#51483D]">Tư liệu xuất bản:</span>
                  <strong className="text-[#2E5A36]">+{monthStats.wordsMasteredCount} tư liệu</strong>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              TOÀN BỘ LƯU TRỮ (ALL-TIME NEWSROOM ARCHIVE DOSSIER)
              ============================================================== */}
          {activeReportTab === 'all' && (
            <div className="p-5 sm:p-6 rounded-[2px] newspaper-card border-2 border-[#181614] shadow-[3px_3px_0px_#181614] space-y-4 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#493B2D]/40 pb-3">
                <div>
                  <div className="inline-block px-2.5 py-0.5 bg-[#C92532] text-[#F1E7D3] font-oswald text-[10px] font-bold uppercase tracking-widest border border-[#181614] mb-1">
                    HỒ SƠ LƯU TRỮ TOÀN KỲ
                  </div>
                  <h3 className="font-serif font-black text-base sm:text-lg text-[#181614] flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#C92532]" />
                    <span>Tổng Hợp Cơ Cấu Ca Trực &amp; Kho Tư Liệu Toàn Hệ Thống</span>
                  </h3>
                  <p className="text-xs text-[#51483D]">
                    Phân loại chiều sâu các phiên biên tập và tiến độ tích lũy học thuật từ ngày khởi tạo tòa soạn.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-1">
                    <span className="font-oswald text-[11px] uppercase font-bold text-[#51483D] block">
                      Ca Trực Ngắn (&lt;15m)
                    </span>
                    <span className="font-mono text-xl font-black text-[#181614] block">
                      {allTimeStats.durationDistribution.shortSessions} ca
                    </span>
                    <span className="text-[11px] text-[#51483D] block">Khởi động &amp; tra cứu nhanh</span>
                  </div>

                  <div className="p-3.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-1">
                    <span className="font-oswald text-[11px] uppercase font-bold text-[#51483D] block">
                      Ca Tiêu Chuẩn (15-30m)
                    </span>
                    <span className="font-mono text-xl font-black text-[#181614] block">
                      {allTimeStats.durationDistribution.mediumSessions} ca
                    </span>
                    <span className="text-[11px] text-[#51483D] block">Biên tập từ vựng định kỳ</span>
                  </div>

                  <div className="p-3.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-1">
                    <span className="font-oswald text-[11px] uppercase font-bold text-[#991D27] block">
                      Ca Chuyên Sâu (30-45m)
                    </span>
                    <span className="font-mono text-xl font-black text-[#991D27] block">
                      {allTimeStats.durationDistribution.standardSessions} ca
                    </span>
                    <span className="text-[11px] text-[#51483D] block">Thẩm định &amp; phân tích sâu</span>
                  </div>

                  <div className="p-3.5 rounded-[2px] bg-[#E9DCC2] border-2 border-[#C92532] space-y-1">
                    <span className="font-oswald text-[11px] uppercase font-bold text-[#C92532] block">
                      Ca Trọng Điểm (≥45m)
                    </span>
                    <span className="font-mono text-xl font-black text-[#C92532] block">
                      {allTimeStats.durationDistribution.deepSessions} ca
                    </span>
                    <span className="text-[11px] text-[#2C2520] font-semibold block">Chế bản học thuật cao độ</span>
                  </div>
                </div>

                {/* Right Seamless Himalaya Monastery Pilgrimage Engraving */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center">
                  <div className="w-full max-w-[260px] h-36 select-none pointer-events-none">
                    <img
                      src={VINTAGE_EDITORIAL_ASSETS.architecture.himalayaMonasteryPilgrimage}
                      alt="Himalaya Monastery Pilgrimage Engraving"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover scale-[1.15] object-center vintage-print-seamless mask-radial-soft block"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BIÊN BẢN CA TRỰC TAB (SAU PHIÊN HỌC) */}
          {activeReportTab === 'session' && (
            <div className="p-6 rounded-[2px] newspaper-card border-2 border-[#181614] shadow-[3px_3px_0px_#181614]">
              {!lastCompletedSession && completedSessions.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-32 h-28 mx-auto select-none pointer-events-none">
                    <img
                      src={VINTAGE_EDITORIAL_ASSETS.mascot.sleepingBook}
                      alt="Sleeping Scholar Cat"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover scale-[1.15] object-center vintage-print-seamless mask-radial-soft block"
                    />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#181614]">
                    Chưa Có Biên Bản Ca Trực Nào Hoàn Tất
                  </h3>
                  <p className="text-xs sm:text-sm text-[#2C2520] max-w-md mx-auto">
                    Khi bạn nhấn “Kết Thúc &amp; Lưu” trên đồng hồ Real-time Focus Clock, biên bản tổng kết chi tiết của ca trực đó sẽ được xuất bản tại đây.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const targetS = lastCompletedSession || completedSessions[0];
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#493B2D]/40 pb-4">
                        <div>
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#2E5A36] bg-[#DCE6D5] border border-[#2E5A36] px-2.5 py-0.5 rounded-[2px]">
                            ★ Đã lưu hồ sơ tòa soạn ({targetS.dateString})
                          </span>
                          <h2 className="text-xl font-serif font-black text-[#181614] mt-1">
                            Biên Bản Ca Trực: {targetS.topics.join(', ') || 'Academic Editorial'}
                          </h2>
                          <p className="text-xs text-[#51483D] mt-0.5">
                            Thời lượng: <strong>{formatDuration(targetS.durationSeconds)}</strong> • Tư liệu xuất bản:{' '}
                            <strong className="text-[#2E5A36]">+{targetS.wordsMastered.length} từ</strong> • Hiệu đính:{' '}
                            <strong>{targetS.wordsReviewed.length} lượt</strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenSessionDrawer(targetS)}
                          className="px-4 py-2 rounded-[2px] bg-[#C92532] text-[#F1E7D3] border border-[#181614] shadow-[2px_2px_0px_#181614] text-xs font-oswald font-bold uppercase tracking-wider hover:bg-[#991D27] flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <span>Mở Hồ Sơ Tư Liệu</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* 90-DAY HEATMAP TAB */}
          {activeReportTab === '3months' && (
            <div className="p-5 sm:p-6 rounded-[2px] newspaper-card border-2 border-[#181614] shadow-[3px_3px_0px_#181614]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-[#493B2D]/40 pb-3">
                <div>
                  <h3 className="font-serif font-black text-base text-[#181614] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#C92532]" />
                    <span>Ma Trận Tần Suất Xuất Bản 90 Kỳ Qua</span>
                  </h3>
                  <p className="text-xs text-[#51483D]">
                    Nhấp vào ô kỳ báo bất kỳ để mở Hồ Sơ Chi Tiết xem danh mục từ vựng và các ca trực.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[560px]">
                  {ninetyDayHeatmap.map(cell => {
                    let colorClass = 'bg-[#E9DCC2] border border-[#493B2D]/40';
                    if (cell.level === 1) colorClass = 'bg-[#DCC9A8] border border-[#493B2D]';
                    if (cell.level === 2) colorClass = 'bg-[#796B59] text-[#F1E7D3]';
                    if (cell.level === 3) colorClass = 'bg-[#991D27] text-[#F1E7D3]';
                    if (cell.level === 4) colorClass = 'bg-[#C92532] text-[#F1E7D3] font-bold border border-[#181614]';

                    return (
                      <div
                        key={cell.dateStr}
                        onClick={() => handleOpenDayDrawer(cell.dateStr)}
                        className={`w-5 h-5 rounded-[2px] cursor-pointer transition-transform hover:scale-125 ${colorClass}`}
                        title={`${cell.dateStr}: ${cell.minutes} phút (${cell.sessionsCount} ca trực)`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MEMORY & SRS TAB */}
          {activeReportTab === 'memory' && (
            <div className="p-5 sm:p-6 rounded-[2px] newspaper-card border-2 border-[#181614] shadow-[3px_3px_0px_#181614] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#493B2D]/40 pb-3">
                <div>
                  <h3 className="font-serif font-black text-base text-[#181614]">
                    Độ Phủ Kho Tư Liệu Theo Chuyên Đề &amp; Chu Kỳ Ôn Tập (SRS)
                  </h3>
                  <p className="text-xs text-[#51483D]">
                    Tỷ lệ tư liệu đã xuất bản trên tổng số mục từ của từng chuyên đề học thuật trong kho lưu trữ ({totalUniqueWordsInDatabase} từ).
                  </p>
                </div>
                <BentoCardToolbar
                  mode={vocabTrendMode}
                  onChangeMode={setVocabTrendMode}
                  onExpandModal={() => setExpandedModalChart('vocab-trend')}
                />
              </div>
              <div className="space-y-3">
                {memoryStats.topicCoverage.map(item => (
                  <div key={item.topic} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#181614]">{item.topic}</span>
                      <span className="font-mono text-[#51483D]">
                        {item.mastered}/{item.total} tư liệu ({item.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-[2px] bg-[#E9DCC2] overflow-hidden border border-[#493B2D]">
                      <div
                        className="h-full bg-[#C92532] transition-all duration-500"
                        style={{ width: `${item.mastered > 0 ? Math.max(item.percent, 3) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SESSION HISTORY LOG TABLE */}
          {(activeReportTab === 'all' || activeReportTab === 'session') &&
            completedSessions.length > 0 && (
              <div className="p-5 sm:p-6 rounded-[2px] newspaper-card border-2 border-[#181614] shadow-[3px_3px_0px_#181614] space-y-3">
                <div className="flex items-center justify-between border-b border-[#493B2D]/40 pb-2">
                  <h3 className="font-serif font-black text-base text-[#181614] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#C92532]" />
                    <span>Sổ Lưu Trữ Biên Bản Ca Trực Thực Tế ({completedSessions.length} ca trực)</span>
                  </h3>
                  <span className="text-xs text-[#51483D]">Nhấp vào ca trực để mở Hồ Sơ Chi Tiết</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-[#493B2D] text-[#51483D] font-oswald text-[11px] uppercase tracking-wider bg-[#E9DCC2]">
                        <th className="py-2.5 px-3">Ngày &amp; Giờ Xuất Bản</th>
                        <th className="py-2.5 px-3">Chuyên Mục Biên Tập</th>
                        <th className="py-2.5 px-3">Thời Lượng Trực</th>
                        <th className="py-2.5 px-3">Tư Liệu Xuất Bản</th>
                        <th className="py-2.5 px-3">Tỷ Lệ Duyệt Bản Thảo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#493B2D]/30">
                      {completedSessions.slice(0, 10).map(s => (
                        <tr
                          key={s.id}
                          onClick={() => handleOpenSessionDrawer(s)}
                          className="hover:bg-[#E9DCC2] transition-colors cursor-pointer"
                        >
                          <td className="py-2.5 px-3 font-mono text-[#181614]">
                            {s.dateString}{' '}
                            <span className="text-[#51483D]">
                              ({new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#181614]">
                            {s.topics.join(', ')}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#C92532]">
                            {formatDuration(s.durationSeconds)}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#2E5A36]">
                            +{s.wordsMastered.length} tư liệu
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[#51483D]">
                            {s.quizQuestionsAnswered > 0
                              ? `${s.quizQuestionsCorrect}/${s.quizQuestionsAnswered} (${Math.round(
                                  (s.quizQuestionsCorrect / s.quizQuestionsAnswered) * 100
                                )}%)`
                              : 'Chưa duyệt'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

        </main>
      </div>

      {/* ====================================================================
          EXPANDED FULL-SCREEN CHART MODAL ([ Phóng to Modal ] — Vintage Newspaper)
          ==================================================================== */}
      <AnimatePresence>
        {expandedModalChart && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedModalChart(null)}
              className="fixed inset-0 bg-[#181614]/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-4xl rounded-[2px] bg-[#F1E7D3] border-2 border-[#181614] p-6 shadow-[8px_8px_0px_#181614] z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b-2 border-[#181614] pb-3">
                <div>
                  <h3 className="text-xl font-serif font-black text-[#181614]">
                    {expandedModalChart === 'hourly'
                      ? 'Biên Bản Hoạt Động Theo Khung Giờ Tại Tòa Soạn (0h – 23h)'
                      : expandedModalChart === '7days'
                        ? 'Tiến Độ Xuất Bản 7 Kỳ Trong Tuần (Thứ 2 — Chủ Nhật)'
                        : 'Báo Cáo Lưu Hành & Năng Suất 30 Kỳ Xuất Bản'}
                  </h3>
                  <p className="text-xs text-[#51483D]">
                    Chế độ xem bản in khổ lớn độ phân giải cao — Rê chuột để xem số liệu tòa soạn chi tiết.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedModalChart(null)}
                  aria-label="Đóng biểu đồ phóng đại"
                  className="p-2 rounded-[2px] text-[#51483D] hover:text-[#181614] bg-[#E9DCC2] border border-[#493B2D] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="h-96 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  {expandedModalChart === 'hourly' ? (
                    hourlyChartMode === 'bar' ? (
                      <BarChart
                        data={todayHourlyChartBundle.data}
                        margin={{ top: 30, right: 12, left: 0, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#C9B38E" />
                        <XAxis dataKey="hour" fontSize={12} stroke="#51483D" />
                        <YAxis fontSize={12} unit="m" stroke="#51483D" />
                        <Tooltip content={<HourlyGlassTooltip />} />
                        <Bar dataKey="minutes" name="Số phút học" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                          {todayHourlyChartBundle.data.map((entry, idx) => (
                            <Cell key={`modal-hour-${idx}`} fill={entry.color} />
                          ))}
                          <LabelList
                            dataKey={(row: any) => (row?.isMax ? row.minutes : null)}
                            content={(props: any) => <MaxPeakLabel {...props} />}
                          />
                        </Bar>
                      </BarChart>
                    ) : (
                      <LineChart data={todayHourlyChartBundle.data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#C9B38E" />
                        <XAxis dataKey="hour" fontSize={12} stroke="#51483D" />
                        <YAxis fontSize={12} unit="m" stroke="#51483D" />
                        <Tooltip content={<HourlyGlassTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="minutes"
                          name="Số phút học"
                          stroke="#C92532"
                          strokeWidth={3}
                        />
                      </LineChart>
                    )
                  ) : expandedModalChart === '7days' ? (
                    <BarChart
                      data={sevenDayStats.days}
                      margin={{ top: 30, right: 12, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#C9B38E" />
                      <XAxis dataKey="tickLabel" fontSize={12} stroke="#51483D" />
                      <YAxis fontSize={12} unit="m" stroke="#51483D" />
                      <Tooltip content={<RealChartTooltip />} />
                      <Bar dataKey="minutes" name="Thời lượng học" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                        {sevenDayStats.days.map((entry, idx) => (
                          <Cell key={`modal-7d-${idx}`} fill={entry.color} />
                        ))}
                        <LabelList
                          dataKey={(row: any) => (row?.isMax ? row.minutes : null)}
                          content={(props: any) => <MaxPeakLabel {...props} />}
                        />
                      </Bar>
                    </BarChart>
                  ) : (
                    <AreaChart data={monthStats.weeks}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#C9B38E" />
                      <XAxis dataKey="weekLabel" fontSize={12} stroke="#51483D" />
                      <YAxis fontSize={12} unit="m" stroke="#51483D" />
                      <Tooltip content={<RealChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="minutes"
                        name="Số phút học"
                        stroke="#C92532"
                        fill="#C92532"
                        fillOpacity={0.18}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SLIDE-OVER RIGHT DRAWER */}
      <AnalyticsDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={selectedDrawerData}
      />

      {/* GMAIL WORKSPACE MODAL */}
      <GmailWorkspaceModal
        isOpen={isGmailModalOpen}
        onClose={() => setIsGmailModalOpen(false)}
        reportSummary={{
          periodLabel: activeFilterKPI.periodLabel,
          studyTimeFormatted: formatDuration(activeFilterKPI.totalSec),
          sessionsCount: activeFilterKPI.sessionsCount,
          wordsMasteredCount: activeFilterKPI.wordsCount,
          quizAccuracy:
            activeFilterKPI.quizAns > 0 ? `${activeFilterKPI.accuracy}%` : 'Chưa thi',
          efficiency: activeFilterKPI.efficiency.toFixed(2),
          streak: realStreak
        }}
      />
    </div>
  );
};
