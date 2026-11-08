import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Trash2, RotateCcw, CheckCircle2,
  XCircle, ArrowLeft, ArrowRight, AlertTriangle, Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MistakeRecord, getMistakes, removeMistake, clearAllMistakes, recordQuizAnswer } from '../utils/storage';
import { sounds, speakWord } from '../utils/soundAndSpeech';
import { useAnalytics } from '../context/AnalyticsContext';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from './VintageNewspaperIllustrations';
import { ENGRAVING_ASSETS } from '../constants/engravings';
import { DraggablePageTimer } from './DraggablePageTimer';

interface MistakeBankProps {
  onMistakeChange?: () => void;
  onBackToDashboard?: () => void;
}

export const MistakeBank: React.FC<MistakeBankProps> = ({ onMistakeChange, onBackToDashboard }) => {
  const { recordQuizEvent, recordMistakeCleared, refreshStorageState } = useAnalytics();
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(getMistakes());
  const [isRetesting, setIsRetesting] = useState<boolean>(false);
  const [currentRetestIdx, setCurrentRetestIdx] = useState<number>(0);
  const [userRetestChoice, setUserRetestChoice] = useState<string | null>(null);
  const [isRetestAnswered, setIsRetestAnswered] = useState<boolean>(false);
  const [retestScore, setRetestScore] = useState<number>(0);
  const [retestFinished, setRetestFinished] = useState<boolean>(false);

  const bannerRef = useRef<HTMLDivElement>(null);
  const pageWrapperRef = useRef<HTMLDivElement>(null);

  const refreshList = () => {
    const list = getMistakes();
    setMistakes(list);
    refreshStorageState();
    onMistakeChange?.();
  };

  const handleRemove = (id: string) => {
    removeMistake(id);
    refreshList();
  };

  const handleClearAll = () => {
    clearAllMistakes();
    refreshList();
  };

  const startRetest = () => {
    if (mistakes.length === 0) return;
    setCurrentRetestIdx(0);
    setUserRetestChoice(null);
    setIsRetestAnswered(false);
    setRetestScore(0);
    setRetestFinished(false);
    setIsRetesting(true);
  };

  const currentMistake = mistakes[currentRetestIdx];

  const retestOptions = React.useMemo(() => {
    if (!currentMistake) return [];
    const correct = currentMistake.correctAnswer;
    const wrong = currentMistake.userAnswer;

    const pool = mistakes
      .filter(m => m.correctAnswer !== correct && m.correctAnswer !== wrong)
      .map(m => m.correctAnswer);

    const extras = [...new Set(pool)].slice(0, 2);
    while (extras.length < 2) {
      extras.push(extras.length === 0 ? 'in' : 'for');
    }

    const all = [correct, wrong, ...extras].slice(0, 4);
    return all.sort(() => 0.5 - Math.random());
  }, [currentMistake, mistakes]);

  const handleRetestSelect = (choice: string) => {
    if (isRetestAnswered || !currentMistake) return;

    setUserRetestChoice(choice);
    setIsRetestAnswered(true);

    const isCorrect = choice === currentMistake.correctAnswer;
    recordQuizAnswer(isCorrect);
    recordQuizEvent(
      currentMistake.id,
      currentMistake.correctAnswer,
      isCorrect,
      'Ngân Hàng Lỗi Sai'
    );

    if (isCorrect) {
      sounds.playCorrect();
      setRetestScore(s => s + 1);
      removeMistake(currentMistake.id);
      recordMistakeCleared(currentMistake.id);
      refreshStorageState();
      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.6 },
          colors: ['#C92532', '#181614', '#2E5A36']
        });
      } catch {}
    } else {
      sounds.playWrong();
    }
  };

  const handleRetestNext = () => {
    if (currentRetestIdx + 1 < mistakes.length) {
      setCurrentRetestIdx(i => i + 1);
      setUserRetestChoice(null);
      setIsRetestAnswered(false);
    } else {
      setRetestFinished(true);
      refreshList();
    }
  };

  if (isRetesting && retestFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full min-w-0 space-y-5"
      >
        <div className="newspaper-card border-2 border-[#181614] p-8 sm:p-10 text-center shadow-[5px_5px_0px_#181614] space-y-4">
          <VintageEngravingFrame
            src={VINTAGE_EDITORIAL_ASSETS.mascot.graduationCap}
            alt="Conquered Mistakes"
            className="w-24 h-24 mx-auto"
          />
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#181614]">
            Hoàn Thành Phiên Hiệu Đính Bản In!
          </h2>
          <p className="text-sm text-[#51483D]">
            Bạn đã hiệu đính thành công <strong className="text-[#2E5A36] font-mono">{retestScore}</strong> bản in lỗi và tự động duyệt xuất bản khỏi bàn biên tập.
          </p>

          <div className="flex justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => { setIsRetesting(false); setRetestFinished(false); }}
              className="px-6 py-2.5 btn-newspaper-red text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Về Bàn Biên Tập Bút Đỏ</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (isRetesting && currentMistake) {
    return (
      <div className="w-full min-w-0 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="newspaper-card border-2 border-[#181614] p-1.5 shadow-[5px_5px_0px_#181614]"
        >
          <div className="border border-[#493B2D] p-5 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-[#181614] pb-3">
              <span className="font-mono text-xs font-bold text-[#F1E7D3] bg-[#C92532] px-3 py-1 border border-[#181614] uppercase tracking-wider shadow-[2px_2px_0px_#181614]">
                HIỆU ĐÍNH BẢN IN #{currentRetestIdx + 1}/{mistakes.length}
              </span>
              <button
                type="button"
                onClick={() => { setIsRetesting(false); refreshList(); }}
                className="font-mono text-xs font-bold uppercase text-[#C92532] hover:underline cursor-pointer"
              >
                Dừng làm bài
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-2xl font-serif font-bold text-[#181614] leading-relaxed">
                {currentMistake.question}
              </h3>
              <p className="font-mono text-xs text-[#796B59] uppercase">
                NGUỒN BÀI THI: <span className="font-bold text-[#181614]">{currentMistake.sourceMode}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {retestOptions.map((opt, idx) => {
                const isSelected = userRetestChoice === opt;
                const isCorrect = opt === currentMistake.correctAnswer;
                const letter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;

                let style =
                  'border-[#181614] bg-[#E9DCC2] text-[#181614] hover:bg-[#DCC9A8] hover:border-[#C92532] shadow-[2px_2px_0px_#181614]';
                if (isRetestAnswered) {
                  if (isCorrect) {
                    style = 'border-[#2E5A36] bg-[#DCE6D5] text-[#2E5A36] font-bold shadow-[3px_3px_0px_#2E5A36]';
                  } else if (isSelected) {
                    style = 'border-[#C92532] bg-[#E8B7AC] text-[#991D27] font-bold shadow-[3px_3px_0px_#C92532]';
                  } else {
                    style = 'border-[#796B59]/50 bg-[#E9DCC2]/50 text-[#796B59] opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isRetestAnswered}
                    onClick={() => handleRetestSelect(opt)}
                    className={`p-4 rounded-[2px] border-[1.5px] text-sm sm:text-base font-medium text-left transition-all flex items-center justify-between cursor-pointer ${style}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 font-mono text-xs font-bold border border-[#181614] bg-[#F1E7D3] text-[#181614] flex items-center justify-center shrink-0">
                        {letter}
                      </span>
                      <span className="font-serif font-bold">{opt}</span>
                    </div>
                    {isRetestAnswered && (
                      <span>
                        {isCorrect && <CheckCircle2 className="w-5 h-5 text-[#2E5A36]" />}
                        {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-[#C92532]" />}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {isRetestAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-4 border-t-2 border-[#181614]"
              >
                <div
                  className={`p-4 rounded-[2px] border-[1.5px] text-sm ${
                    userRetestChoice === currentMistake.correctAnswer
                      ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#181614]'
                      : 'bg-[#E8B7AC] border-[#C92532] text-[#181614]'
                  }`}
                >
                  <div className="font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2">
                    {userRetestChoice === currentMistake.correctAnswer ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#2E5A36]" />
                        <span className="text-[#2E5A36]">TUYỆT ĐỈNH! ĐÃ XÓA THÀNH CÔNG CÂU NÀY KHỎI SỔ LỖI SAI!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-[#C92532]" />
                        <span className="text-[#991D27]">VẪN CHƯA ĐÚNG! HÃY GHI NHỚ KỸ LỜI GIẢI BÊN DƯỚI:</span>
                      </>
                    )}
                  </div>

                  <div className="text-xs text-[#181614] bg-[#F1E7D3] p-3 border border-[#493B2D]">
                    <p className="font-mono font-bold uppercase text-[10px] text-[#C92532] mb-1">
                      [GIẢI THÍCH CHI TIẾT]:
                    </p>
                    <p>{currentMistake.explanation}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleRetestNext}
                    className="px-6 py-2.5 btn-newspaper-red text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <span>{currentRetestIdx + 1 === mistakes.length ? 'Xem Kết Quả' : 'Câu Lỗi Tiếp Theo'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={pageWrapperRef} className="w-full min-w-0 space-y-5">
      {/* 1. HERO BANNER: BÀN BIÊN TẬP BÚT ĐỎ — BẢN ĐÍNH CHÍNH */}
      <div
        ref={bannerRef}
        className="hero-banner-container relative min-h-[270px] border-2 border-[#1A1917] bg-[#F3ECE0] shadow-[4px_4px_0px_#1A1917] p-8 flex items-center justify-between overflow-visible mb-6"
      >
        {/* 1. CỘT NỘI DUNG & NÚT BẤM BÊN TRÁI */}
        <div className="relative z-10 max-w-[54%] flex flex-col items-start">
          {/* Hàng badge điều hướng */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-2.5 py-1 text-xs font-bold bg-[#FAF6EE] border border-[#1A1917] text-[#1A1917] hover:bg-[#E5DEC9] transition-colors cursor-pointer"
              >
                ← Trang Nhất
              </button>
            )}
            <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase bg-[#1A1917] text-white">
              RED-PEN PROOFREADING DESK
            </span>
            <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase bg-[#B81D24]/15 text-[#B81D24] border border-[#B81D24]">
              {mistakes.length} BẢN ĐÍNH CHÍNH
            </span>
          </div>

          {/* Tiêu đề lớn 2 dòng đồng bộ */}
          <h1 className="text-4xl md:text-[42px] font-black uppercase leading-[1.08] tracking-tight text-[#1A1917]">
            BÀN BIÊN TẬP BÚT ĐỎ – <br />
            <span className="text-[#B81D24]">BẢN ĐÍNH CHÍNH</span>
          </h1>

          {/* Phụ đề trích dẫn */}
          <p className="mt-2.5 font-serif italic text-sm text-[#4A4238] max-w-xl">
            “Danh sách các bản in lỗi cần kiểm duyệt, rà soát và hiệu đính lại trước khi xuất bản.”
          </p>

          {/* Cụm nút hành động nằm gọn bên dưới chữ (Không đè lên tranh) */}
          {mistakes.length > 0 && (
            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={startRetest}
                className="px-5 py-2.5 bg-[#B81D24] hover:bg-[#96151B] text-white text-xs font-black uppercase tracking-wider border-2 border-[#1A1917] shadow-[3px_3px_0px_#1A1917] transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>HIỆU ĐÍNH NGAY ({mistakes.length})</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                title="Xóa toàn bộ bản đính chính"
                className="w-10 h-10 bg-[#FAF6EE] hover:bg-[#B81D24] text-[#1A1917] hover:text-white border-2 border-[#1A1917] shadow-[3px_3px_0px_#1A1917] flex items-center justify-center transition-colors cursor-pointer text-base"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        {/* 2. VÙNG TRANH KHẮC KẼM BÊN PHẢI (TRẢI RỘNG & HÒA BIÊN MỀM MẠI, KHÔNG BỊ CẮT ĐẦU) */}
        <div className="absolute inset-y-0 right-0 w-[52%] overflow-hidden pointer-events-none">
          {/* Lớp chuyển sắc mềm 4 cạnh để hòa mịn vào nền giấy #F3ECE0, xóa bỏ viền khung dọc */}
          <div className="w-full h-full relative">
            <img
              src={ENGRAVING_ASSETS.architecture.christRedeemer}
              alt="Red-pen Proofreading Illustration"
              className="w-full h-full object-contain object-top mix-blend-multiply opacity-90"
              style={{
                WebkitMaskImage:
                  'radial-gradient(ellipse 70% 80% at 50% 50%, black 45%, transparent 92%)',
                maskImage:
                  'radial-gradient(ellipse 70% 80% at 50% 50%, black 45%, transparent 92%)',
              }}
            />
          </div>

          {/* Nhãn FIG. X ở góc dưới phải */}
          <div className="absolute bottom-2.5 right-3 bg-[#FAF6EE] border border-[#1A1917] px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider text-[#1A1917] z-10">
            FIG. X – RED-PEN PROOFREADING
          </div>
        </div>

        {/* 3. ĐỒNG HỒ BẤM GIỜ ĐỘC LẬP VỊ TRÍ CỦA TRANG BẢN ĐÍNH CHÍNH */}
        <DraggablePageTimer pageId="ban_dinh_chinh" pageWrapperRef={pageWrapperRef} />
      </div>

      {/* List of Archival Correction Slips */}
      {mistakes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="newspaper-card border-2 border-[#181614] p-10 text-center shadow-[4px_4px_0px_#181614] space-y-3"
        >
          <VintageEngravingFrame
            src={VINTAGE_EDITORIAL_ASSETS.mascot.sleepingBook}
            alt="Cat sleeping peacefully on book"
            className="w-28 h-28 mx-auto"
          />
          <h3 className="text-xl font-serif font-black text-[#181614]">
            Tuyệt vời! Hiện không có lỗi sai nào tồn đọng.
          </h3>
          <p className="text-xs sm:text-sm text-[#51483D] max-w-md mx-auto leading-relaxed">
            Khi bạn làm bài trắc nghiệm ở bất kỳ chế độ nào và chọn nhầm, hệ thống sẽ tự động đóng dấu vào đây để bạn luyện tập lại.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {mistakes.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="newspaper-card border-[1.5px] border-[#181614] hover:border-[#C92532] p-5 shadow-[3px_3px_0px_#181614] transition-all space-y-3.5"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#493B2D] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-[#181614] text-[#F1E7D3]">
                      ERRATA #{index + 1}
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase text-[#F1E7D3] bg-[#C92532] px-2.5 py-0.5 border border-[#181614]">
                      {record.sourceMode}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-[#181614] text-base sm:text-lg mt-2 leading-snug">
                    {record.question}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(record.id)}
                  className="bg-[#E9DCC2] border border-[#493B2D] text-[#51483D] hover:text-[#F1E7D3] hover:bg-[#C92532] p-1.5 transition-colors cursor-pointer shrink-0"
                  title="Xóa khỏi sổ lỗi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 2-Column Comparison: Wrong vs Correct */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-[#E8B7AC]/65 border-[1.5px] border-[#C92532] text-[#991D27] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#C92532] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[11px] font-bold uppercase block text-[#991D27]">
                      Lỗi bản in:
                    </span>
                    <span className="font-bold line-through">{record.userAnswer}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#DCE6D5] border-[1.5px] border-[#2E5A36] text-[#2E5A36] flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E5A36] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[11px] font-bold uppercase block text-[#2E5A36]">
                        Đáp án chuẩn:
                      </span>
                      <span className="font-bold">{record.correctAnswer}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakWord(record.correctAnswer)}
                    className="p-1.5 bg-[#F1E7D3] border border-[#181614] text-[#2E5A36] hover:bg-[#181614] hover:text-[#F1E7D3] transition-colors cursor-pointer shrink-0"
                    title="Nghe phát âm đáp án chuẩn"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {record.explanation && (
                <div className="p-3 bg-[#E9DCC2] border-l-3 border-[#C92532] text-xs text-[#181614] leading-relaxed">
                  <strong className="font-mono uppercase text-[10px] text-[#C92532] mr-1.5">[Ghi nhớ]:</strong>
                  {record.explanation}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
