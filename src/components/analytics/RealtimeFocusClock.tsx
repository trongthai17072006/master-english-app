import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Square, Sparkles, Target, Info, Check } from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { VINTAGE_EDITORIAL_ASSETS } from '../VintageNewspaperIllustrations';

interface RealtimeFocusClockProps {
  onSessionEnded?: () => void;
}

export const RealtimeFocusClock: React.FC<RealtimeFocusClockProps> = ({ onSessionEnded }) => {
  const {
    activeSession,
    elapsedSeconds: liveSeconds,
    remainingSeconds,
    targetMinutes,
    setTargetMinutes,
    isSessionActive,
    isSessionPaused,
    startSession,
    pauseSession,
    resumeSession,
    endAndSaveSession,
    completedSessions,
    lastCompletedSession,
  } = useAnalytics();

  const latestCompleted = lastCompletedSession || completedSessions[0] || null;

  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);
  const autoEndedRef = useRef<string | null>(null);

  const targetSecondsTotal = Math.max(60, targetMinutes * 60);
  const progressPercent = Math.min(
    100,
    Math.round((liveSeconds / Math.max(1, targetSecondsTotal)) * 100)
  );

  // Auto-complete session when countdown timer genuinely reaches 0s
  useEffect(() => {
    if (
      activeSession &&
      isSessionActive &&
      liveSeconds >= targetSecondsTotal &&
      targetSecondsTotal > 0 &&
      autoEndedRef.current !== activeSession.id
    ) {
      autoEndedRef.current = activeSession.id;
      const completed = endAndSaveSession();
      if (completed) {
        setSaveSuccessNotice(true);
        setTimeout(() => setSaveSuccessNotice(false), 3600);
        onSessionEnded?.();
      }
    }
  }, [activeSession, isSessionActive, liveSeconds, targetSecondsTotal, endAndSaveSession, onSessionEnded]);

  // Format duration MMm SSs
  const formatDurationLabel = (sec: number) => {
    const safe = Math.max(0, Math.floor(sec));
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  };

  // Circumference for r = 90
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleEndAndSave = () => {
    const completed = endAndSaveSession();
    if (completed) {
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3600);
      onSessionEnded?.();
    }
  };

  return (
    <div className="w-full newspaper-card rounded-[10px] p-4 sm:p-5 text-[#181614] transition-all relative overflow-hidden">
      {/* Header bar with Crimson Red Ribbon */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative inline-flex items-center px-3.5 py-1 bg-[#C92532] text-[#F1E7D3] font-oswald text-xs font-bold uppercase tracking-wider border border-[#181614] shadow-[1px_1px_0px_#181614]">
            <span>REAL-TIME FOCUS CLOCK</span>
          </div>
          {isSessionActive && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#F1E7D3] bg-[#181614] px-2.5 py-0.5 rounded-[4px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C92532] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C92532]" />
              </span>
              LIVE
            </span>
          )}
          {isSessionPaused && (
            <span className="text-[10px] font-bold text-[#181614] bg-[#DCC9A8] border border-[#493B2D] px-2.5 py-0.5 rounded-[4px]">
              TẠM DỪNG
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowTooltip(!showTooltip)}
          aria-label="Giải thích cơ chế đồng hồ"
          className="w-6 h-6 rounded-full border border-[#493B2D] bg-[#E9DCC2] text-[#181614] hover:bg-[#C92532] hover:text-[#F1E7D3] transition-colors flex items-center justify-center cursor-pointer"
          title="Giải thích cơ chế đồng hồ đếm xuôi & đếm ngược đồng bộ"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            className="mb-3 p-3 rounded-[8px] bg-[#E9DCC2] border border-[#493B2D] text-xs text-[#181614] leading-relaxed relative z-20"
          >
            <div className="font-bold text-[#C92532] flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đồng bộ 100% với Đồng hồ Trang Chủ:</span>
            </div>
            Hiển thị song song <strong>Thời gian đã tập trung (đếm xuôi)</strong> và{' '}
            <strong>Thời gian còn lại của phiên (đếm ngược)</strong> theo mục tiêu {targetMinutes} phút.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circular SVG Clock */}
      <div className="relative flex flex-col items-center justify-center my-1">
        <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 220 220">
            {/* Outer delicate dotted tick track */}
            <circle
              cx="110"
              cy="110"
              r="102"
              fill="none"
              stroke="#796B59"
              strokeWidth="1.5"
              strokeDasharray="2 5"
            />

            {/* Main circular track */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="#F1E7D3"
              stroke="#DCC9A8"
              strokeWidth="12"
            />

            {/* Progress arc */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke="#C92532"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />

            {/* Inner subtle ring */}
            <circle
              cx="110"
              cy="110"
              r="76"
              fill="none"
              stroke="#493B2D"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
          </svg>

          {/* Center Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <span className="font-oswald text-[10px] font-bold uppercase tracking-wider text-[#51483D] mb-0.5">
              {isSessionActive
                ? 'THỜI GIAN ĐÃ TẬP TRUNG'
                : isSessionPaused
                  ? 'ĐÃ TẬP TRUNG (TẠM DỪNG)'
                  : latestCompleted
                    ? 'PHIÊN GẦN NHẤT'
                    : 'PHIÊN GẦN NHẤT'}
            </span>

            <div className="font-mono text-xl sm:text-2xl font-black tracking-tight tabular-nums text-[#C92532]">
              {formatDurationLabel(liveSeconds)} ({progressPercent}%)
            </div>

            <div className="mt-1 text-[11px] font-semibold text-[#51483D]">
              Còn lại:{' '}
              <span className="font-mono font-bold text-[#181614]">
                {formatDurationLabel(remainingSeconds)}
              </span>
            </div>
            <div className="text-[10.5px] text-[#51483D]">
              Mục tiêu phiên:{' '}
              <span className="font-mono font-bold text-[#C92532]">{targetMinutes}m</span>
            </div>
          </div>
        </div>

        {/* Dual Synchronized Metrics Strip (Elapsed vs Remaining) */}
        <div className="mt-2.5 grid grid-cols-2 gap-2 w-full">
          <div className="rounded-[6px] bg-[#E9DCC2] border border-[#493B2D]/60 px-2.5 py-2 text-center">
            <span className="block text-[9.5px] font-extrabold uppercase tracking-wider text-[#C92532]">
              THỜI GIAN ĐÃ TẬP TRUNG
            </span>
            <span className="font-mono text-xs sm:text-sm font-black text-[#181614] tabular-nums">
              {formatDurationLabel(liveSeconds)} ({progressPercent}%)
            </span>
          </div>
          <div className="rounded-[6px] bg-[#E9DCC2] border border-[#493B2D]/60 px-2.5 py-2 text-center">
            <span className="block text-[9.5px] font-extrabold uppercase tracking-wider text-[#51483D]">
              THỜI GIAN CÒN LẠI CỦA PHIÊN
            </span>
            <span className="font-mono text-xs sm:text-sm font-black text-[#181614] tabular-nums">
              {formatDurationLabel(remainingSeconds)}
            </span>
          </div>
        </div>

        {/* Mascot Status Row beneath the ring matching PDF Page 7 Top */}
        <div className="mt-3 flex items-center gap-3 w-full p-2.5 rounded-[2px] bg-[#E9DCC2] border border-[#181614] shadow-[2px_2px_0px_#181614]">
          <div className="relative w-14 h-14 border border-[#181614] bg-[#F1E7D3] overflow-hidden shrink-0">
            <img
              src={
                isSessionActive
                  ? VINTAGE_EDITORIAL_ASSETS.mascot.writingQuill
                  : VINTAGE_EDITORIAL_ASSETS.mascot.glassesBook
              }
              alt="Scholar Cat Focus Companion"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover scale-[1.12] object-center block"
            />
          </div>

          <div className="min-w-0 text-left">
            <p className="text-xs font-bold text-[#181614] leading-snug">
              {isSessionActive
                ? `Đang đếm xuôi: ${formatDurationLabel(liveSeconds)} • Còn lại ${formatDurationLabel(remainingSeconds)}`
                : 'Đồng bộ thời gian thực với Trang Chủ'}
            </p>
            <p className="font-serif italic font-bold text-xs sm:text-sm text-[#C92532] mt-0.5">
              “Học hôm nay, vững tương lai.”
            </p>
          </div>
        </div>
      </div>

      {/* Target session selector pills */}
      <div className="mt-3 pt-2.5 border-t border-[#493B2D]/35">
        <div className="flex items-center gap-1.5 text-xs font-bold mb-2 text-[#181614]">
          <Target className="w-3.5 h-3.5 text-[#C92532]" />
          <span>Chọn mục tiêu phiên:</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[15, 25, 45, 60].map(mins => {
            const isSelected = targetMinutes === mins;
            return (
              <button
                key={mins}
                type="button"
                onClick={() => setTargetMinutes(mins)}
                className={`font-mono py-1.5 px-2 rounded-[6px] text-xs font-extrabold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] shadow-[1px_1px_0px_#181614]'
                    : 'bg-[#E9DCC2] text-[#181614] border-[#493B2D] hover:border-[#C92532]'
                }`}
              >
                {mins}m
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Control Button */}
      <div className="mt-3 space-y-2">
        {!activeSession ? (
          <button
            type="button"
            onClick={() => startSession('Academic Focus', targetMinutes)}
            className="w-full py-2.5 px-4 rounded-[8px] bg-[#C92532] hover:bg-[#991D27] active:translate-y-0.5 text-[#F1E7D3] border border-[#181614] font-extrabold text-xs sm:text-sm shadow-[2px_2px_0px_#181614] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-[#F1E7D3] shrink-0" />
            <span>Bắt Đầu Phiên Học Mới</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {isSessionActive ? (
              <button
                type="button"
                onClick={pauseSession}
                className="py-2.5 px-3 rounded-[8px] bg-[#181614] hover:bg-[#2E2924] text-[#F1E7D3] border border-[#181614] font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5 fill-[#F1E7D3] shrink-0" />
                <span>Tạm Dừng</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={resumeSession}
                className="py-2.5 px-3 rounded-[8px] bg-[#181614] hover:bg-[#2E2924] text-[#F1E7D3] border border-[#181614] font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-[#F1E7D3] shrink-0" />
                <span>Tiếp Tục</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleEndAndSave}
              className="py-2.5 px-3 rounded-[8px] bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] border border-[#181614] font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-[#F1E7D3] shrink-0" />
              <span>Kết Thúc & Lưu</span>
            </button>
          </div>
        )}

        {/* Save confirmation */}
        <AnimatePresence>
          {saveSuccessNotice && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="p-2.5 rounded-[6px] bg-[#E9DCC2] border border-[#2E5A36] text-[11px] font-bold text-[#2E5A36] flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Đã lưu phiên học thực tế vào hệ thống!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
