import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, RotateCcw, Volume2 } from 'lucide-react';
import { CONTEXT_QUESTIONS, ContextQuestion } from '../data/vocabularyData';
import {
  EXTRA_CONTEXT_QUESTIONS,
  getSecondContextExample
} from '../data/doubledWorkspaceData';
import { getSixCollocationsForWord } from '../data/academicLexiconEnrichment';
import { sounds, speakWord } from '../utils/soundAndSpeech';
import { recordQuizAnswer, saveMistake } from '../utils/storage';
import { shuffleArray, shuffleOptionsWithStringAnswer } from '../utils/shuffle';
import { getSmartBatch, POOL_KEYS } from '../utils/questionPool';
import { useAnalytics } from '../context/AnalyticsContext';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from './VintageNewspaperIllustrations';
import { ENGRAVING_ASSETS, HorizonEngravingHeader } from '../constants/engravings';

interface ContextQuizProps {
  onMasteryChange?: () => void;
  onBackToDashboard?: () => void;
}

export const ContextQuiz: React.FC<ContextQuizProps> = ({
  onMasteryChange,
  onBackToDashboard
}) => {
  const { recordQuizEvent, refreshStorageState } = useAnalytics();
  const loadFreshQuestions = () => {
    const allContextPool = [...CONTEXT_QUESTIONS, ...EXTRA_CONTEXT_QUESTIONS];
    const { items: picked } = getSmartBatch(
      shuffleArray(allContextPool),
      POOL_KEYS.CONTEXT,
      20
    );
    return picked.map(q => shuffleOptionsWithStringAnswer(q));
  };

  const [questions, setQuestions] = useState<ContextQuestion[]>(loadFreshQuestions);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentQ = questions[currentIndex];

  const handleSelect = (option: string) => {
    if (isAnswered || isFinished) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;
    recordQuizAnswer(isCorrect);
    recordQuizEvent(
      currentQ.id,
      currentQ.correctAnswer,
      isCorrect,
      'Ngữ Cảnh IELTS'
    );

    if (isCorrect) {
      sounds.playCorrect();
      setScore(s => s + 1);
    } else {
      sounds.playWrong();
      saveMistake({
        question: `[${currentQ.contextType}] Điền từ: ${currentQ.sentence}`,
        userAnswer: option,
        correctAnswer: currentQ.correctAnswer,
        explanation: `${currentQ.explanation} Dịch: ${currentQ.fullTranslation}`,
        sourceMode: 'Ngữ Cảnh IELTS'
      });
      refreshStorageState();
      onMasteryChange?.();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setQuestions(loadFreshQuestions());
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="w-full min-w-0 space-y-5">
      {/* 1. EXPANDED HERO BANNER: CHUYÊN ĐỀ HỌC THUẬT + EMPIRE STATE BUILDING ENGRAVING */}
      <HorizonEngravingHeader
        engravingSrc={ENGRAVING_ASSETS.architecture.empireState}
        engravingAlt="Empire State Building 19th-Century Architectural Etching"
        figLabel="FIG. IX — EMPIRE STATE DISCOURSE"
        className="min-h-[340px] sm:min-h-[380px] flex flex-col justify-center"
        imagePositionClass="right-0 top-0 bottom-0"
        imageWidthClass="w-[58%] sm:w-[54%] lg:w-[50%] max-w-none"
        imageFitClass="h-full w-auto object-contain object-right-bottom"
        imageStyle={{
          height: '100%',
          width: 'auto',
          objectFit: 'contain',
          objectPosition: 'right bottom'
        }}
        timerPageId="chuyen_de"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-2.5 py-1 rounded-[2px] bg-[#E9DCC2] hover:bg-[#C92532] border border-[#181614] text-[11px] font-bold text-[#181614] hover:text-[#F1E7D3] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Trang Nhất</span>
              </button>
            )}
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-[#181614] text-[#F1E7D3]">
              SCHOLARLY &amp; EDITORIAL DISCOURSE
            </span>
            <span className="font-mono text-[10px] font-bold text-[#F1E7D3] bg-[#C92532] border border-[#181614] px-2.5 py-1 uppercase shadow-[2px_2px_0px_#181614]">
              CHUYÊN ĐỀ HỌC THUẬT
            </span>
          </div>

          <div className="font-headline uppercase text-[#181614] leading-[0.94] tracking-[-0.01em]">
            <div className="text-3xl sm:text-4xl lg:text-[44px]">CHUYÊN ĐỀ HỌC THUẬT —</div>
            <div className="text-3xl sm:text-4xl lg:text-[42px] text-[#C92532] mt-0.5">
              BÌNH LUẬN &amp; NGỮ CẢNH
            </div>
          </div>

          <p className="font-serif italic font-bold text-sm sm:text-base text-[#51483D] pt-1">
            "Phân tích ngữ cảnh thực tiễn qua các bài viết, ấn phẩm nghiên cứu và bình luận học thuật."
          </p>
        </div>
      </HorizonEngravingHeader>

      {/* 2. DEDICATED STATUS & FILTER TOOLBAR */}
      <div className="newspaper-card border-2 border-[#181614] p-4 sm:p-5 shadow-[4px_4px_0px_#181614]">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#51483D]">
            <div className="flex items-center gap-2 font-mono font-bold bg-[#E9DCC2] px-3.5 py-2 border-[1.5px] border-[#181614] shadow-[2px_2px_0px_#181614]">
              <span>
                VỊ TRÍ:{' '}
                <strong className="tabular-nums text-[#C92532]">
                  {currentIndex + 1}/{questions.length}
                </strong>
              </span>
              <span aria-hidden="true">|</span>
              <span>
                ĐÚNG:{' '}
                <strong className="tabular-nums text-[#2E5A36]">
                  {score}/{questions.length}
                </strong>
              </span>
            </div>

            {currentQ && (
              <span className="font-mono text-xs font-bold text-[#F1E7D3] uppercase tracking-widest bg-[#C92532] border border-[#181614] px-3 py-2 shadow-[2px_2px_0px_#181614]">
                {currentQ.contextType}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="px-3.5 py-2 text-xs font-mono font-bold uppercase btn-newspaper-secondary flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đổi bộ chuyên đề khác</span>
          </button>
        </div>
      </div>

      {!isFinished && currentQ ? (
        <div className="newspaper-card border-2 border-[#181614] p-1.5 shadow-[5px_5px_0px_#181614]">
          <div className="border border-[#493B2D] p-5 sm:p-8 space-y-6">
            <div className="flex items-center justify-between text-xs border-b-2 border-[#181614] pb-3">
              {/* Crimson Rubber-Stamp Topic Badge */}
              <span className="font-mono font-bold text-[#F1E7D3] uppercase tracking-widest bg-[#C92532] border border-[#181614] px-3 py-1 shadow-[2px_2px_0px_#181614]">
                {currentQ.contextType}
              </span>
              <span className="font-mono font-bold text-[#51483D] uppercase">
                ĐÚNG: <strong className="text-[#2E5A36] font-black tabular-nums">{score}</strong> CÂU
              </span>
            </div>

            {/* Editorial Sentence Container */}
            <div className="bg-[#E9DCC2] border-[1.5px] border-[#493B2D] p-5 sm:p-7 text-left space-y-4 shadow-[inset_0_0_20px_rgba(121,107,89,0.14)]">
              <p className="text-base sm:text-xl font-serif font-bold text-[#181614] leading-relaxed">
                {currentQ.sentence.split('______').map((part, index, arr) => (
                  <React.Fragment key={index}>
                    {part}
                    {index < arr.length - 1 && (
                      <span
                        className={`inline-block px-3.5 py-0.5 mx-1.5 font-mono font-black border-b-2 transition-all ${
                          isAnswered
                            ? selectedOption === currentQ.correctAnswer
                              ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#2E5A36]'
                              : 'bg-[#E8B7AC] border-[#C92532] text-[#991D27]'
                            : 'bg-[#F1E7D3] border-[#C92532] text-[#C92532] min-w-[4.5rem] text-center'
                        }`}
                      >
                        {isAnswered ? currentQ.correctAnswer : '______'}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </p>

              {isAnswered && (
                <div
                  data-sound="none"
                  data-speak-only="true"
                  data-example="true"
                  onClick={(e) => e.stopPropagation()}
                  className="example-box text-xs p-3 bg-[#F1E7D3] border-l-3 border-[#C92532] text-[#181614] leading-relaxed space-y-1.5"
                >
                  <div>
                    <span className="font-mono font-bold uppercase text-[10px] text-[#C92532] mr-1.5">[Dịch nghĩa câu 1]:</span>
                    <span>{currentQ.fullTranslation}</span>
                  </div>
                  {(() => {
                    const secondEx = getSecondContextExample(currentQ);
                    return (
                      <div className="pt-1.5 border-t border-dashed border-[#796B59] space-y-0.5">
                        <p
                          data-sound="none"
                          data-speak-only="true"
                          data-speak="true"
                          data-example="true"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(secondEx.sentenceEn);
                          }}
                          title="Bấm để nghe phát âm câu ví dụ 2"
                          className="example-sentence font-serif italic font-bold text-[#181614] hover:text-[#C92532] cursor-pointer transition-colors"
                        >
                          “{secondEx.sentenceEn}”
                        </p>
                        <p>
                          <span className="font-mono font-bold uppercase text-[10px] text-[#C92532] mr-1.5">[Dịch nghĩa câu 2]:</span>
                          <span>{secondEx.translationVi}</span>
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 2x2 Bordered Answer Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQ.correctAnswer;
                const letter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;

                let style =
                  'border-[#181614] bg-[#E9DCC2] text-[#181614] hover:bg-[#DCC9A8] hover:border-[#C92532] shadow-[2px_2px_0px_#181614]';

                if (isAnswered) {
                  if (isCorrect) {
                    style = 'border-[#2E5A36] bg-[#DCE6D5] text-[#2E5A36] font-bold shadow-[3px_3px_0px_#2E5A36]';
                  } else if (isSelected) {
                    style = 'border-[#C92532] bg-[#E8B7AC] text-[#991D27] font-bold shadow-[3px_3px_0px_#C92532]';
                  } else {
                    style = 'border-[#796B59]/50 bg-[#E9DCC2]/50 text-[#796B59] opacity-55';
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelect(opt)}
                    className={`p-4 rounded-[2px] border-[1.5px] font-medium text-sm sm:text-base text-left transition-all flex items-center justify-between cursor-pointer ${style}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 font-mono text-xs font-bold border border-[#181614] bg-[#F1E7D3] text-[#181614] flex items-center justify-center shrink-0">
                        {letter}
                      </span>
                      <span className="font-serif font-bold text-base">{opt}</span>
                    </div>
                    {isAnswered && (
                      <span>
                        {isCorrect && <CheckCircle2 className="w-5 h-5 text-[#2E5A36]" />}
                        {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-[#C92532]" />}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isAnswered && (
              <div className="space-y-4 pt-4 border-t-2 border-[#181614]">
                <div
                  className={`p-4 rounded-[2px] border-[1.5px] text-sm ${
                    selectedOption === currentQ.correctAnswer
                      ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#181614]'
                      : 'bg-[#E8B7AC] border-[#C92532] text-[#181614]'
                  }`}
                >
                  <div className="font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2">
                    {selectedOption === currentQ.correctAnswer ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#2E5A36]" />
                        <span className="text-[#2E5A36]">RẤT CHUẨN XÁC! BẠN ÁP DỤNG TỪ VÀO NGỮ CẢNH RẤT TỐT.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-[#C92532]" />
                        <span className="text-[#991D27]">CHƯA CHÍNH XÁC TỪ CẦN ĐIỀN — ĐÃ GHI SỔ LỖI SAI!</span>
                      </>
                    )}
                  </div>

                  <div className="text-xs text-[#181614] bg-[#F1E7D3] p-3 border border-[#493B2D] space-y-2">
                    <p className="font-mono font-bold uppercase text-[10px] text-[#C92532] mb-1">
                      [PHÂN TÍCH ĐÁP ÁN]:
                    </p>
                    <p className="text-[#181614] leading-relaxed">{currentQ.explanation}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-dashed border-[#796B59]">
                      {getSixCollocationsForWord({ word: currentQ.correctAnswer }).map((col, cIdx) => (
                        <span
                          key={cIdx}
                          data-speak="true"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(col);
                          }}
                          title="Bấm để nghe phát âm cụm từ tiếng Anh"
                          className="text-[11px] font-mono font-bold bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] hover:text-[#C92532] px-2 py-0.5 border border-[#493B2D] hover:border-[#C92532] cursor-pointer transition-colors"
                        >
                          ⚡ {col}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => speakWord(currentQ.sentence.replace('______', currentQ.correctAnswer))}
                    className="px-3.5 py-2 text-xs font-mono font-bold uppercase btn-newspaper-secondary flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-[#C92532]" />
                    <span>Nghe câu mẫu</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-newspaper-red px-6 py-2.5 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <span>{currentIndex + 1 === questions.length ? 'Xem Kết Quả' : 'Câu Kế Tiếp'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="newspaper-card border-2 border-[#181614] p-8 text-center space-y-4 shadow-[5px_5px_0px_#181614]">
          <VintageEngravingFrame
            src={VINTAGE_EDITORIAL_ASSETS.mascot.graduationCap}
            alt="Completed Context Quiz"
            className="w-24 h-24 mx-auto"
          />
          <h3 className="text-2xl font-serif font-black text-[#181614]">
            Hoàn thành bài tập Ngữ Cảnh!
          </h3>
          <p className="text-xs sm:text-sm text-[#51483D]">
            Bạn đạt <strong className="text-[#2E5A36] font-mono text-base font-black">{score}/{questions.length}</strong> điểm.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRestart}
              className="btn-newspaper-red px-6 py-2.5 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Luyện lại một lần nữa</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
