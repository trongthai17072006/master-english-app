import React, { useState, useMemo } from 'react';
import { CheckCircle2, Clock, Calendar, ArrowRight, Flame, Trophy, Sparkles } from 'lucide-react';
import { getMergedChallenge60Days, THEMES_METADATA } from '../../data/challenge60Data';
import { DayCompletionStatus } from '../../utils/challengeStorage';

interface ChallengeRoadmapCalendarProps {
  activeDay: number;
  dayStatuses: Record<number, DayCompletionStatus>;
  onSelectDay: (day: number) => void;
  onClose?: () => void;
}

export const ChallengeRoadmapCalendar: React.FC<ChallengeRoadmapCalendarProps> = ({
  activeDay,
  dayStatuses,
  onSelectDay,
  onClose
}) => {
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'all'>('all');
  const allDays = useMemo(() => getMergedChallenge60Days(), []);

  const filteredDays = allDays.filter(d => {
    if (selectedWeekFilter === 'all') return true;
    return d.week === selectedWeekFilter;
  });

  return (
    <div className="bg-white rounded-3xl border border-[#E3E7ED] p-6 sm:p-8 dol-card-shadow space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF9F1] border border-[#FFE2BA] text-[#FF991F] flex items-center justify-center font-bold text-lg shadow-xs">
            📅
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#242938]">
              Bản Đồ Lộ Trình 60 Ngày Cốt Lõi &amp; Chuyên Đề Mở Rộng Không Giới Hạn (Ngày 61+)
            </h3>
            <p className="text-xs text-[#505460]">
              Nhấp vào bất kỳ ngày nào (Ngày 1–60 hoặc Tuần 10 Mở rộng PDF Ngày 61–{allDays.length}) để chuyển nhanh sang giáo trình của ngày đó.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-[#505460] bg-[#F4F4F6] hover:bg-[#E3E7ED] rounded-xl self-start sm:self-auto cursor-pointer"
          >
            Đóng Lịch ✕
          </button>
        )}
      </div>

      {/* Week Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedWeekFilter('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            selectedWeekFilter === 'all'
              ? 'bg-[#D42525] text-white shadow-xs'
              : 'bg-[#F4F4F6] text-[#505460] hover:bg-[#E3E7ED]'
          }`}
        >
          Tất cả ({allDays.length} Số)
        </button>

        {THEMES_METADATA.map(meta => (
          <button
            key={meta.week}
            type="button"
            onClick={() => setSelectedWeekFilter(meta.week)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedWeekFilter === meta.week
                ? 'bg-[#D42525] text-white shadow-xs'
                : meta.week >= 10
                  ? 'bg-[#FFF5F4] text-[#C81E1E] border border-[#F8B4B4] hover:bg-[#FDE8E8]'
                  : 'bg-[#F4F4F6] text-[#505460] hover:bg-[#E3E7ED]'
            }`}
          >
            {meta.week >= 10 ? `Tuần ${meta.week} (Mở rộng PDF)` : `Tuần ${meta.week}`}
          </button>
        ))}
      </div>

      {/* 60-Day Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {filteredDays.map(item => {
          const st = dayStatuses[item.day];
          const isCurrent = activeDay === item.day;
          const isVocabDone = !!st?.vocab;
          const isWritingDone = !!st?.writing;
          const isFullyDone = isVocabDone && isWritingDone;
          const isPartial = (isVocabDone || isWritingDone) && !isFullyDone;

          return (
            <button
              key={item.day}
              type="button"
              onClick={() => onSelectDay(item.day)}
              className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-28 cursor-pointer ${
                isCurrent
                  ? 'border-[#D42525] bg-[#FDEDED]/40 ring-2 ring-[#D42525]/20 shadow-sm'
                  : isFullyDone
                  ? 'border-[#BBF7D0] bg-[#F0FDF4]/50 hover:border-[#329546]'
                  : isPartial
                  ? 'border-[#FFE2BA] bg-[#FFF9F1]/50 hover:border-[#FF991F]'
                  : 'border-[#E3E7ED] bg-white hover:border-slate-300'
              }`}
            >
              {/* Day Badge & Status */}
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-mono font-black ${
                  isCurrent ? 'text-[#D42525]' : 'text-[#242938]'
                }`}>
                  KỲ #{String(item.day).padStart(2, '0')}
                </span>

                {isFullyDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#329546]" />
                ) : isPartial ? (
                  <Clock className="w-4 h-4 text-[#FF991F]" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                )}
              </div>

              {/* Theme snippet */}
              <div className="text-[11px] font-semibold text-[#505460] line-clamp-2 leading-tight">
                {item.themeEn}
              </div>

              {/* Progress indicators for Vocab & Writing */}
              <div className="flex items-center gap-1.5 pt-1 text-[10px]">
                <span className={`px-1.5 py-0.2 rounded font-bold ${
                  isVocabDone ? 'bg-[#329546] text-white' : 'bg-slate-100 text-[#8594A3]'
                }`}>
                  V
                </span>
                <span className={`px-1.5 py-0.2 rounded font-bold ${
                  isWritingDone ? 'bg-[#329546] text-white' : 'bg-slate-100 text-[#8594A3]'
                }`}>
                  W
                </span>
                {st?.speaking && (
                  <span className="px-1.5 py-0.2 rounded font-bold bg-[#5B37D2] text-white">
                    S
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-[#505460]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#329546]" />
            <span>Hoàn thành (Đủ Vocab & Writing)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FF991F]" />
            <span>Đang học (1 trong 2 mục)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <span>Chưa bắt đầu</span>
          </div>
        </div>

        <div className="text-[11px] text-[#8594A3]">
          V: Vocabulary (15 từ) • W: Writing Task 2 • S: Speaking VSTEP (Bổ trợ)
        </div>
      </div>
    </div>
  );
};
