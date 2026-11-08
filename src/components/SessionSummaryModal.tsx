import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2, Clock, BookOpen, RotateCcw,
  Award, X
} from 'lucide-react';
import { SessionRecord } from '../services/learningStorage';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from './VintageNewspaperIllustrations';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionRecord | null;
  targetWordsPerSession?: number;
  onViewAnalytics?: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose,
  session,
  targetWordsPerSession = 15,
  onViewAnalytics
}) => {
  if (!isOpen || !session) return null;

  const durationMin = Math.floor(session.durationSeconds / 60);
  const durationSec = session.durationSeconds % 60;
  const formattedDuration = `${durationMin} phút ${durationSec} giây`;

  const startTimeStr = new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newWordsCount = session.wordsMastered.length;
  const reviewedCount = session.wordsReviewed.length;
  const isGoalMet = newWordsCount >= targetWordsPerSession;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#181614]/75">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="w-full max-w-xl bg-[#F1E7D3] newspaper-card border-2 border-[#181614] rounded-[2px] shadow-[6px_6px_0px_#181614] overflow-hidden text-[#181614] p-1.5"
      >
        {/* Inner Double-Rule Frame */}
        <div className="border border-[#493B2D] p-5 sm:p-6 space-y-4">
          {/* Masthead Header */}
          <div className="flex items-start justify-between border-b-2 border-[#181614] pb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#181614] text-[#F1E7D3] border border-[#493B2D] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#C92532]">
                <CheckCircle2 className="w-5 h-5 text-[#F1E7D3]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-[#C92532] text-[#F1E7D3] border border-[#181614]">
                    GHI NHẬN THỰC TẾ
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#796B59]">
                    OFFICIAL ACADEMIC DISPATCH
                  </span>
                </div>
                <h3 className="text-xl font-serif font-black text-[#181614] mt-1 tracking-tight">
                  Tóm Tắt Phiên Học Vừa Hoàn Tất
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              className="p-1.5 border border-[#493B2D] bg-[#E9DCC2] text-[#181614] hover:bg-[#C92532] hover:text-[#F1E7D3] hover:border-[#181614] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mascot & Editorial Certification Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-[#E9DCC2] border border-[#493B2D] shadow-[inset_0_0_16px_rgba(121,107,89,0.16)]">
            <VintageEngravingFrame
              src={VINTAGE_EDITORIAL_ASSETS.mascot.graduationCap}
              alt="Scholar Cat with Graduation Cap"
              className="w-20 h-20 shrink-0"
            />
            <div className="space-y-1.5 flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#DCE6D5] border border-[#2E5A36] text-[#2E5A36] font-mono text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E5A36] shrink-0" />
                <span>Đã lưu phiên học thành công!</span>
              </div>
              <h4 className="text-sm sm:text-base font-serif font-bold text-[#181614]">
                Nỗ lực tuyệt vời! Đã chốt và lưu phiên học.
              </h4>
              <p className="text-xs text-[#51483D] leading-relaxed">
                Dữ liệu thời gian và từ vựng của phiên này đã được đóng dấu vào sổ cái lịch sử học tập chính thức.
              </p>
            </div>
          </div>

          {/* Core Session Stats 2x2 Print Ledger Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border border-[#181614] bg-[#F1E7D3] divide-y sm:divide-y-0 sm:divide-x divide-[#493B2D]">
            {/* Top Row Left: Thời lượng hợp lệ */}
            <div className="p-3.5 space-y-1 border-b border-[#493B2D]">
              <span className="font-mono text-[10px] font-bold text-[#796B59] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C92532]" />
                <span>Thời lượng hợp lệ</span>
              </span>
              <div className="font-mono text-lg font-extrabold text-[#C92532] tabular-nums">
                {formattedDuration}
              </div>
              <span className="font-mono text-[10px] text-[#51483D] block">
                Khung giờ: {startTimeStr} — {endTimeStr}
              </span>
            </div>

            {/* Top Row Right: Từ mới đã thuộc */}
            <div className="p-3.5 space-y-1 border-b border-[#493B2D]">
              <span className="font-mono text-[10px] font-bold text-[#796B59] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#2E5A36]" />
                <span>Từ mới đã thuộc</span>
              </span>
              <div className="font-mono text-lg font-extrabold text-[#2E5A36] tabular-nums">
                +{newWordsCount} từ
              </div>
              <span className="font-mono text-[10px] text-[#51483D] block">
                Mục tiêu phiên: {targetWordsPerSession} từ ({isGoalMet ? '✓ Đạt chuẩn' : 'Chưa đạt'})
              </span>
            </div>

            {/* Bottom Row Left: Lượt từ ôn tập */}
            <div className="p-3.5 space-y-1">
              <span className="font-mono text-[10px] font-bold text-[#796B59] uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-[#51483D]" />
                <span>Lượt từ ôn tập</span>
              </span>
              <div className="font-mono text-lg font-extrabold text-[#181614] tabular-nums">
                {reviewedCount} lượt
              </div>
              <span className="font-mono text-[10px] text-[#51483D] block">
                Không tính trùng vào từ mới
              </span>
            </div>

            {/* Bottom Row Right: Câu hỏi Quiz */}
            <div className="p-3.5 space-y-1">
              <span className="font-mono text-[10px] font-bold text-[#796B59] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#C92532]" />
                <span>Câu hỏi Quiz</span>
              </span>
              <div className="font-mono text-lg font-extrabold text-[#181614] tabular-nums">
                {session.quizQuestionsAnswered} câu
              </div>
              <span className="font-mono text-[10px] text-[#51483D] block">
                Đúng: {session.quizQuestionsCorrect}/{session.quizQuestionsAnswered} (
                {session.quizQuestionsAnswered > 0
                  ? Math.round((session.quizQuestionsCorrect / session.quizQuestionsAnswered) * 100)
                  : 0}
                %)
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-[#493B2D]">
            {onViewAnalytics && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewAnalytics();
                }}
                className="flex-1 py-2.5 px-4 btn-newspaper-secondary text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Xem Báo Cáo Thống Kê
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 btn-newspaper-red text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Đóng &amp; Tiếp Tục
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
