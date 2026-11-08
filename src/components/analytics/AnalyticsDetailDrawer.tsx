import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, CheckCircle2, RotateCcw, Volume2, Calendar, Target } from 'lucide-react';
import { SessionRecord } from '../../services/learningStorage';
import { VOCAB_DATABASE } from '../../data/vocabularyData';
import { speakWord } from '../../utils/soundAndSpeech';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from '../VintageNewspaperIllustrations';

export interface DrawerDetailData {
  type: 'day' | 'session' | 'topic';
  title: string;
  subtitle?: string;
  dateStr?: string;
  sessions: SessionRecord[];
  wordsMasteredIds: string[];
  wordsReviewedIds: string[];
  topicName?: string;
}

interface AnalyticsDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: DrawerDetailData | null;
  isDarkMode?: boolean;
}

export const AnalyticsDetailDrawer: React.FC<AnalyticsDetailDrawerProps> = ({
  isOpen,
  onClose,
  data
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  // Resolve word objects from IDs
  const masteredWords = data.wordsMasteredIds
    .map(id => VOCAB_DATABASE.find(item => item.id === id || item.word.toLowerCase() === id.toLowerCase()))
    .filter(Boolean);

  const reviewedWords = data.wordsReviewedIds
    .map(id => VOCAB_DATABASE.find(item => item.id === id || item.word.toLowerCase() === id.toLowerCase()))
    .filter(Boolean);

  const totalDurationSec = data.sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalQuizzes = data.sessions.reduce((acc, s) => acc + s.quizQuestionsAnswered, 0);
  const totalCorrect = data.sessions.reduce((acc, s) => acc + s.quizQuestionsCorrect, 0);
  const accuracyPct = totalQuizzes > 0 ? Math.round((totalCorrect / totalQuizzes) * 100) : 0;

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}h ${remM}m`;
    }
    return `${m}m ${s > 0 ? `${s}s` : ''}`.trim() || '0m';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#181614]/65 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-over panel in Vintage Newspaper Editorial */}
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-xl h-full shadow-[-8px_0_0_rgba(24,22,20,0.4)] flex flex-col z-10 overflow-hidden bg-[#E9DCC2] text-[#181614] border-l-2 border-[#181614]"
          aria-label={data.title}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-[#F1E7D3] border-b-2 border-[#493B2D] flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <VintageEngravingFrame
                src={VINTAGE_EDITORIAL_ASSETS.mascot.telescope}
                alt="Editorial Analytics Dispatch"
                className="w-14 h-14 hidden sm:block shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-[2px] bg-[#E8B7AC]/50 text-[#C92532] border border-[#991D27]">
                    {data.type === 'day' ? 'Báo Cáo Ngày' : data.type === 'session' ? 'Chi Tiết Phiên Học' : 'Chủ Đề Từ Vựng'}
                  </span>
                  {data.dateStr && (
                    <span className="text-xs text-[#796B59] font-mono font-bold">
                      {data.dateStr}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-serif font-extrabold text-[#181614]">
                  {data.title}
                </h2>
                {data.subtitle && (
                  <p className="text-xs text-[#51483D] mt-0.5 italic font-serif">
                    {data.subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng ngăn chi tiết"
              className="p-2 rounded-[2px] border border-[#493B2D] bg-[#E9DCC2] text-[#51483D] hover:text-[#181614] hover:bg-[#DCC9A8] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2.5 p-5 sm:px-6 bg-[#DCC9A8]/65 border-b border-[#493B2D]">
            <div className="p-3 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D]">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#796B59] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C92532]" /> Thời Lượng
              </span>
              <p className="text-base font-mono font-black mt-1 text-[#C92532]">
                {formatMinSec(totalDurationSec)}
              </p>
            </div>

            <div className="p-3 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D]">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#796B59] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#2E5A36]" /> Từ Đã Thuộc
              </span>
              <p className="text-base font-mono font-black mt-1 text-[#2E5A36]">
                {masteredWords.length} <span className="text-xs font-normal text-[#796B59]">từ</span>
              </p>
            </div>

            <div className="p-3 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D]">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#796B59] flex items-center gap-1">
                <Target className="w-3 h-3 text-[#991D27]" /> Quiz Đúng
              </span>
              <p className="text-base font-mono font-black mt-1 text-[#181614]">
                {totalQuizzes > 0 ? `${accuracyPct}%` : 'Chưa thi'}
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* 1. Danh sách phiên học */}
            {data.sessions.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#51483D] flex items-center gap-2 border-b border-[#493B2D]/40 pb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C92532]" />
                  <span>Các phiên học hoàn tất ({data.sessions.length})</span>
                </h3>

                <div className="space-y-2">
                  {data.sessions.map((session, idx) => (
                    <div
                      key={session.id || idx}
                      className="p-3.5 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-extrabold text-[#181614]">
                            {session.topics.join(', ') || 'Academic Study'}
                          </span>
                          <span className="font-mono text-[11px] text-[#796B59]">
                            {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#51483D] mt-1 flex items-center gap-3 font-mono">
                          <span className="text-[#2E5A36] font-bold">+{session.wordsMastered.length} từ mới</span>
                          <span>·</span>
                          <span>{session.wordsReviewed.length} ôn tập</span>
                          {session.quizQuestionsAnswered > 0 && (
                            <>
                              <span>·</span>
                              <span>Quiz: {session.quizQuestionsCorrect}/{session.quizQuestionsAnswered}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-black text-sm text-[#C92532]">
                          {formatMinSec(session.durationSeconds)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Danh sách từ vựng đã thuộc mới */}
            <section className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#51483D] flex items-center justify-between border-b border-[#493B2D]/40 pb-1.5">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E5A36]" />
                  <span>Từ vựng nạp mới ({masteredWords.length})</span>
                </span>
                <span className="text-[10px] font-normal text-[#796B59]">Đã lưu vào danh mục</span>
              </h3>

              {masteredWords.length === 0 ? (
                <div className="p-4 rounded-[2px] bg-[#F1E7D3] border border-dashed border-[#493B2D] text-center text-xs text-[#796B59] italic font-serif">
                  Không có từ vựng nào được đánh dấu thuộc mới trong phạm vi này.
                </div>
              ) : (
                <div className="space-y-2">
                  {masteredWords.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-extrabold text-sm text-[#181614]">
                            {item.word}
                          </span>
                          <span className="font-mono text-[11px] text-[#796B59]">
                            {item.ipa}
                          </span>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-[2px] bg-[#DCC9A8] text-[#181614] border border-[#493B2D]">
                            {item.level || 'B2-C1'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#51483D] truncate mt-0.5">
                          {item.meaning}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => speakWord(item.word)}
                        className="p-2 rounded-[2px] border border-[#493B2D] bg-[#E9DCC2] text-[#51483D] hover:text-[#C92532] hover:bg-[#DCC9A8] transition-colors shrink-0 cursor-pointer"
                        title="Phát âm từ vựng"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. Danh sách từ vựng đã ôn tập */}
            {reviewedWords.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#51483D] flex items-center gap-2 border-b border-[#493B2D]/40 pb-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-[#991D27]" />
                  <span>Từ vựng đã ôn tập củng cố ({reviewedWords.length})</span>
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {reviewedWords.map((item: any) => (
                    <div
                      key={`rev-${item.id}`}
                      className="p-2.5 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D] text-xs flex items-center justify-between"
                    >
                      <span className="font-serif font-bold text-[#181614] truncate">
                        {item.word}
                      </span>
                      <button
                        type="button"
                        onClick={() => speakWord(item.word)}
                        className="text-[#51483D] hover:text-[#C92532] transition-colors p-1 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Footer info */}
          <div className="p-4 border-t-2 border-[#493B2D] bg-[#DCC9A8] text-center text-[11px] font-mono text-[#51483D]">
            HỒ SƠ LƯU TRỮ THỰC NGHIỆM • MASTER ENGLISH PRESS ARCHIVE
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
};
