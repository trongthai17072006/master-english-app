import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  RotateCcw, Flame, CheckCircle2,
  XCircle, Volume2, AlertTriangle, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakWord } from '../utils/soundAndSpeech';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from './VintageNewspaperIllustrations';

export interface QuizHistoryItem {
  prompt: string;
  word: string;
  ipa?: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

interface QuizCompletionModalProps {
  score: number;
  total: number;
  maxStreak: number;
  history: QuizHistoryItem[];
  onRestart: () => void;
  onExit: () => void;
  onGoToMistakes?: () => void;
}

export const QuizCompletionModal: React.FC<QuizCompletionModalProps> = ({
  score,
  total,
  maxStreak,
  history,
  onRestart,
  onExit,
  onGoToMistakes,
}) => {
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const percentage = Math.round((score / Math.max(1, total)) * 100);

  // Calculate estimated IELTS Band from accuracy
  let bandScore = '6.0';
  let bandTitle = 'Competent User';
  let bandStampClass = 'bg-[#DCC9A8] text-[#181614] border-[#493B2D]';

  if (percentage >= 90) {
    bandScore = '8.0+';
    bandTitle = 'Expert / Native Proficiency';
    bandStampClass = 'bg-[#C92532] text-[#F1E7D3] border-[#181614]';
  } else if (percentage >= 75) {
    bandScore = '7.5';
    bandTitle = 'Very Good User (Academic Ready)';
    bandStampClass = 'bg-[#DCE6D5] text-[#2E5A36] border-[#2E5A36]';
  } else if (percentage >= 60) {
    bandScore = '6.5 - 7.0';
    bandTitle = 'Good User';
    bandStampClass = 'bg-[#E9DCC2] text-[#181614] border-[#181614]';
  }

  useEffect(() => {
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C92532', '#181614', '#493B2D', '#D97706']
      });
    } catch {}
  }, [percentage]);

  const wrongCount = total - score;
  const filteredHistory = history.filter(item => {
    if (filter === 'wrong') return !item.isCorrect;
    if (filter === 'correct') return item.isCorrect;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Grand Editorial Examination Certificate Card */}
      <div className="newspaper-card border-2 border-[#181614] p-1.5 shadow-[5px_5px_0px_#181614]">
        <div className="border border-[#493B2D] p-5 sm:p-8 space-y-6">
          {/* Masthead Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#181614] pb-3 text-[11px] font-mono uppercase tracking-widest text-[#51483D]">
            <span>THE MASTER ENGLISH CHRONICLE • EXAMINATION BOARD</span>
            <span className="font-bold text-[#C92532]">OFFICIAL SCORE DISPATCH</span>
          </div>

          {/* Centerpiece Layout with Woodcut Engraving */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <VintageEngravingFrame
              src={VINTAGE_EDITORIAL_ASSETS.mascot.graduationCap}
              alt="Academic Examination Cat"
              caption="Fig. I — Academic Honours"
              className="w-36 h-40 shrink-0"
            />

            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="inline-flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 border font-mono text-xs font-bold uppercase tracking-wider ${bandStampClass}`}>
                  IELTS BAND {bandScore}
                </span>
                <span className="px-2.5 py-1 bg-[#E9DCC2] border border-[#493B2D] font-serif italic text-xs text-[#51483D]">
                  {bandTitle}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#181614] tracking-tight">
                Hoàn Thành Bài Kiểm Tra Xuất Sắc!
              </h2>
              <p className="text-xs sm:text-sm text-[#51483D] leading-relaxed max-w-2xl">
                Bạn đã hoàn tất bài kiểm tra phản xạ từ vựng học thuật C1/C2 theo chuẩn biên tập học thuật. Dưới đây là bản tổng kết điểm số và hồ sơ đối chiếu từng câu.
              </p>
            </div>
          </div>

          {/* 4-Column Newspaper Ledger Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-2 border-[#181614] bg-[#E9DCC2] divide-y sm:divide-y-0 sm:divide-x divide-[#493B2D]">
            <div className="p-4 text-center">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#796B59]">
                CÂU TRẢ LỜI ĐÚNG
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#181614] mt-1 tabular-nums">
                {score}/{total}
              </div>
            </div>

            <div className="p-4 text-center">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#796B59]">
                ĐỘ CHÍNH XÁC
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#2E5A36] mt-1 tabular-nums">
                {percentage}%
              </div>
            </div>

            <div className="p-4 text-center">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#796B59]">
                CHUỖI ĐÚNG DÀI NHẤT
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#C92532] mt-1 flex items-center justify-center gap-1 tabular-nums">
                <span>{maxStreak}</span>
                <Flame className="w-5 h-5 fill-[#C92532] text-[#C92532]" />
              </div>
            </div>

            <div className="p-4 text-center bg-[#E8B7AC]/45">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#991D27]">
                LƯU VÀO SỔ LỖI SAI
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#C92532] mt-1 tabular-nums">
                {wrongCount}
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#493B2D]">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onRestart}
                className="px-5 py-2.5 btn-newspaper-red text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm Bài Khác Ngay</span>
              </button>

              {wrongCount > 0 && onGoToMistakes && (
                <button
                  type="button"
                  onClick={onGoToMistakes}
                  className="px-4 py-2.5 bg-[#E8B7AC] hover:bg-[#C92532] text-[#991D27] hover:text-[#F1E7D3] font-bold border-[1.5px] border-[#181614] rounded-[2px] shadow-[2px_2px_0px_#181614] text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Phục Thù {wrongCount} Lỗi Sai</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onExit}
              className="px-4 py-2.5 btn-newspaper-secondary text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
            >
              Về Cấu Hình Chế Độ
            </button>
          </div>
        </div>
      </div>

      {/* Answer Breakdown Ledger */}
      <div className="newspaper-card border-2 border-[#181614] p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#181614] pb-4">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#C92532]">
              ARCHIVAL QUESTION LEDGER
            </div>
            <h3 className="text-xl font-serif font-black text-[#181614]">
              Xem Lại Chi Tiết Từng Câu
            </h3>
            <p className="text-xs text-[#51483D]">
              Bấm vào biểu tượng loa để nghe lại cách phát âm IPA chuẩn của từ vựng.
            </p>
          </div>

          {/* Editorial Filter Tabs */}
          <div className="flex items-center border border-[#181614] bg-[#DCC9A8] p-0.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#181614] text-[#F1E7D3]'
                  : 'text-[#51483D] hover:text-[#181614]'
              }`}
            >
              Tất cả ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('wrong')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors cursor-pointer ${
                filter === 'wrong'
                  ? 'bg-[#C92532] text-[#F1E7D3]'
                  : 'text-[#51483D] hover:text-[#C92532]'
              }`}
            >
              Câu sai ({wrongCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors cursor-pointer ${
                filter === 'correct'
                  ? 'bg-[#2E5A36] text-[#F1E7D3]'
                  : 'text-[#51483D] hover:text-[#2E5A36]'
              }`}
            >
              Câu đúng ({score})
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {filteredHistory.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 border-[1.5px] rounded-[2px] transition-all ${
                item.isCorrect
                  ? 'border-[#2E5A36] bg-[#DCE6D5]/60'
                  : 'border-[#C92532] bg-[#E8B7AC]/55'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-[#2E5A36]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[#C92532]" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#181614] text-[#F1E7D3]">
                        #{idx + 1}
                      </span>
                      <span className="font-serif font-black text-[#181614] text-base sm:text-lg">
                        {item.word}
                      </span>
                      {item.ipa && (
                        <span className="font-mono text-xs text-[#51483D]">
                          {item.ipa}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#181614]">
                      <span className="font-bold uppercase font-mono text-[11px] text-[#51483D]">Đáp án chuẩn: </span>
                      <strong className="text-[#2E5A36] font-bold">{item.correctAnswer}</strong>
                      {!item.isCorrect && (
                        <span className="ml-2 text-[#991D27] font-semibold line-through">
                          (Bạn chọn: {item.userAnswer})
                        </span>
                      )}
                    </div>

                    {item.explanation && (
                      <p className="text-xs text-[#181614] leading-relaxed bg-[#F1E7D3] p-2.5 border border-[#493B2D]">
                        <strong className="font-mono uppercase text-[10px] text-[#C92532] mr-1.5">[Chú giải]:</strong>
                        {item.explanation}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => speakWord(item.word)}
                  className="p-2 bg-[#F1E7D3] border border-[#493B2D] text-[#181614] hover:bg-[#C92532] hover:text-[#F1E7D3] transition-colors shrink-0 cursor-pointer"
                  title="Phát âm từ"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
