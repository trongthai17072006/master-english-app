import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, RotateCcw, Volume2 } from 'lucide-react';
import { COLLOCATION_QUESTIONS, CollocationQuestion, VOCAB_DATABASE, VocabItem } from '../data/vocabularyData';
import { EXTRA_COLLOCATION_QUESTIONS } from '../data/doubledWorkspaceData';
import {
  getOxford30AsVocabItems,
  getSixCollocationsForWord,
  getTwoExamplesForWord
} from '../data/academicLexiconEnrichment';
import { sounds, speakWord } from '../utils/soundAndSpeech';
import { recordQuizAnswer, saveMistake } from '../utils/storage';
import { shuffleArray, shuffleOptionsWithStringAnswer } from '../utils/shuffle';
import { useAnalytics } from '../context/AnalyticsContext';
import { CORE_TASK_IDS } from '../services/milestoneEngine';
import { loadCustomContentStore, CUSTOM_CONTENT_EVENT } from '../services/customContentStore';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from './VintageNewspaperIllustrations';
import { ENGRAVING_ASSETS, HorizonEngravingHeader } from '../constants/engravings';

interface CollocationsQuizProps {
  onMasteryChange?: () => void;
  onBackToDashboard?: () => void;
}

const TOPICS = [
  { id: 'all', label: 'Tất cả chủ đề' },
  { id: 'technology', label: 'Technology & AI' },
  { id: 'environment', label: 'Environment & Climate' },
  { id: 'education', label: 'Education & Pedagogy' },
  { id: 'health', label: 'Health & Medicine' },
  { id: 'psychology', label: 'Psychology & Mind' },
  { id: 'economy', label: 'Economy & Business' },
  { id: 'society', label: 'Society & Urban' },
  { id: 'culture', label: 'Culture & Arts' },
  { id: 'work', label: 'Work & Employment' },
  { id: 'law', label: 'Law & Justice' },
  { id: 'science', label: 'Science & Research' }
];

function buildDynamicCollocationQuestions(
  allVocab: VocabItem[],
  wordProgressMap: Record<string, { status?: string; nextReviewAt?: string }>,
  count = 10
): CollocationQuestion[] {
  const poolWithColloc = allVocab.filter(v => v.collocations && v.collocations.length > 0);
  if (poolWithColloc.length < 4) return [];

  const nowIso = new Date().toISOString();
  const priority = poolWithColloc.filter(v => {
    const p = wordProgressMap[v.id];
    return p && (p.status === 'learning' || p.status === 'reviewing' || (p.nextReviewAt && p.nextReviewAt <= nowIso));
  });

  const picked = [
    ...shuffleArray(priority).slice(0, Math.min(4, priority.length)),
    ...shuffleArray(poolWithColloc).slice(0, count)
  ].slice(0, count);

  return picked.map((v, idx) => {
    const colloc = v.collocations![0];
    const distractors = shuffleArray(
      poolWithColloc.filter(other => other.id !== v.id && other.pos === v.pos)
    )
      .slice(0, 3)
      .map(d => d.word);

    const fallbackDistractors =
      distractors.length >= 3
        ? distractors
        : shuffleArray(poolWithColloc.filter(other => other.id !== v.id))
            .slice(0, 3)
            .map(d => d.word);

    const hasHeadwordInColloc = colloc.toLowerCase().includes(v.word.toLowerCase());
    const blankedColloc = hasHeadwordInColloc
      ? colloc.replace(new RegExp(v.word, 'gi'), '______')
      : `______ (${colloc})`;

    const sentence =
      v.exampleEn && v.exampleEn.toLowerCase().includes(v.word.toLowerCase())
        ? `${v.exampleEn.replace(new RegExp(v.word, 'gi'), '______')} [Collocation: ${blankedColloc}]`
        : `Hoàn thành cụm Collocation học thuật: "${blankedColloc}"`;

    return {
      id: `dyn-colloc-${v.id}-${idx}`,
      sentence,
      targetMissing: v.word,
      options: [v.word, ...fallbackDistractors],
      correctAnswer: v.word,
      explanation: `Cụm Collocation chuẩn với "${v.word}" (${v.pos}) là "${colloc}" — nghĩa: ${v.meaning}.`,
      vietnameseMeaning: v.meaning
    };
  });
}

export const CollocationsQuiz: React.FC<CollocationsQuizProps> = ({
  onMasteryChange,
  onBackToDashboard
}) => {
  const { recordQuizEvent, refreshStorageState, completeTask, currentDayNumber, wordProgressMap } = useAnalytics();
  const [customVocab, setCustomVocab] = useState<VocabItem[]>(() => loadCustomContentStore().customVocab);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  useEffect(() => {
    const refreshCustom = () => setCustomVocab(loadCustomContentStore().customVocab);
    window.addEventListener(CUSTOM_CONTENT_EVENT, refreshCustom);
    return () => window.removeEventListener(CUSTOM_CONTENT_EVENT, refreshCustom);
  }, []);

  const allVocab = useMemo<VocabItem[]>(() => {
    const oxfordItems = getOxford30AsVocabItems();
    const seen = new Set<string>();
    const combined: VocabItem[] = [];
    for (const item of [...oxfordItems, ...customVocab, ...VOCAB_DATABASE]) {
      const k = item.word.toLowerCase().trim();
      if (!seen.has(k)) {
        seen.add(k);
        combined.push(item);
      }
    }
    return combined;
  }, [customVocab]);

  const filteredVocab = useMemo<VocabItem[]>(() => {
    return allVocab.filter(v => {
      if (selectedLevel !== 'all' && v.level !== selectedLevel) return false;
      if (selectedTopic !== 'all' && (!v.tags || !v.tags.includes(selectedTopic))) return false;
      return true;
    });
  }, [allVocab, selectedLevel, selectedTopic]);

  const loadFreshQuestions = useCallback(() => {
    const activePool = filteredVocab.length >= 8 ? filteredVocab : allVocab;
    const allCurated = [...COLLOCATION_QUESTIONS, ...EXTRA_COLLOCATION_QUESTIONS];
    const curatedBatch =
      selectedLevel === 'all' && selectedTopic === 'all'
        ? shuffleArray(allCurated).slice(0, 10)
        : [];
    const dynamicCount = curatedBatch.length > 0 ? 14 : 24;
    const dynamicBatch = buildDynamicCollocationQuestions(activePool, wordProgressMap, dynamicCount);
    const combined = shuffleArray([...curatedBatch, ...dynamicBatch]);
    return combined.map(q => shuffleOptionsWithStringAnswer(q));
  }, [allVocab, filteredVocab, selectedLevel, selectedTopic, wordProgressMap]);

  const [questions, setQuestions] = useState<CollocationQuestion[]>(() => loadFreshQuestions());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    setQuestions(loadFreshQuestions());
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  }, [selectedLevel, selectedTopic, loadFreshQuestions]);

  const currentQ = questions[currentIndex];

  const handleSelect = (ans: string) => {
    if (isAnswered || isFinished) return;

    setSelectedOption(ans);
    setIsAnswered(true);

    const isCorrect = ans === currentQ.correctAnswer;
    recordQuizAnswer(isCorrect);
    recordQuizEvent(
      currentQ.id,
      currentQ.correctAnswer,
      isCorrect,
      'Collocations & Giới Từ'
    );

    if (isCorrect) {
      sounds.playCorrect();
      setScore(s => s + 1);
    } else {
      sounds.playWrong();
      saveMistake({
        question: `Điền giới từ/cụm: ${currentQ.sentence}`,
        userAnswer: ans,
        correctAnswer: currentQ.correctAnswer,
        explanation: `${currentQ.explanation} (Nghĩa: ${currentQ.vietnameseMeaning})`,
        sourceMode: 'Collocations & Giới Từ'
      });
      refreshStorageState();
      onMasteryChange?.();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      completeTask(currentDayNumber, CORE_TASK_IDS.COLLOCATIONS);
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
      {/* 1. EXPANDED HERO BANNER: CẤU TRÚC PHỐI NGỮ + EIFFEL TOWER 19TH-CENTURY ENGRAVING */}
      <HorizonEngravingHeader
        engravingSrc={ENGRAVING_ASSETS.architecture.eiffelTower}
        engravingAlt="Eiffel Tower Paris 19th-Century Architectural Etching"
        figLabel="FIG. VII — TOUR EIFFEL, PARIS"
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
        timerPageId="phoi_ngu"
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
              EDITORIAL PHRASEOLOGY
            </span>
            <span className="font-mono text-[10px] font-bold uppercase px-2.5 py-1 bg-[#C92532] text-[#F1E7D3] border border-[#181614] shadow-[2px_2px_0px_#181614]">
              CẤU TRÚC PHỐI NGỮ
            </span>
          </div>

          <div className="font-headline uppercase text-[#181614] leading-[0.94] tracking-[-0.01em]">
            <div className="text-3xl sm:text-4xl lg:text-[44px]">CẤU TRÚC PHỐI NGỮ —</div>
            <div className="text-3xl sm:text-4xl lg:text-[42px] text-[#C92532] mt-0.5">
              LIÊN KẾT MẠCH VĂN BIÊN TẬP
            </div>
          </div>

          <p className="font-serif italic font-bold text-sm sm:text-base text-[#51483D] pt-1">
            "Các cụm từ cố định, giới từ đi kèm và cách kết hợp từ chuẩn văn phong báo chí học thuật."
          </p>
        </div>
      </HorizonEngravingHeader>

      {/* 2. DEDICATED STATUS & PHRASEOLOGY FILTER TOOLBAR */}
      <div className="newspaper-card border-2 border-[#181614] p-4 sm:p-5 shadow-[4px_4px_0px_#181614] space-y-3.5">
        {/* Top Row: Status Counter + Shuffle Button + Pool Count */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#493B2D]/60">
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

            <button
              type="button"
              onClick={handleRestart}
              className="px-3.5 py-2 text-xs font-mono font-bold uppercase btn-newspaper-red flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đổi bộ câu</span>
            </button>
          </div>

          <div className="flex items-center border-[1.5px] border-[#181614] bg-[#DCC9A8] px-3 py-1.5 text-[11px] font-mono font-bold uppercase text-[#181614]">
            Kho phối ngữ: {filteredVocab.length.toLocaleString('vi-VN')} mục từ
          </div>
        </div>

        {/* Bottom Row: Level Dropdown + Clean Horizontal Topic Tag Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            aria-label="Lọc theo cấp độ phối ngữ"
            className="px-3 py-1.5 input-newspaper text-xs font-bold cursor-pointer shrink-0"
          >
            <option value="all">Mọi trình độ</option>
            <option value="B1">Band B1</option>
            <option value="B2">Band B2 (5.5 - 6.5)</option>
            <option value="C1">Band C1 (7.0+)</option>
            <option value="C2">Band C2 (7.5+)</option>
          </select>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-1 min-w-0">
            {TOPICS.map(t => {
              const isActive = selectedTopic === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTopic(t.id)}
                  className={`px-3 py-1.5 rounded-[2px] text-xs font-mono font-bold uppercase whitespace-nowrap transition-colors border-[1.5px] cursor-pointer ${
                    isActive
                      ? 'bg-[#181614] text-[#F1E7D3] border-[#181614] shadow-[2px_2px_0px_#C92532]'
                      : 'bg-[#E9DCC2] text-[#181614] border-[#493B2D] hover:bg-[#DCC9A8] hover:border-[#C92532]'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {!isFinished && currentQ ? (
        <div className="newspaper-card border-2 border-[#181614] p-1.5 shadow-[5px_5px_0px_#181614]">
          <div className="border border-[#493B2D] p-5 sm:p-8 space-y-6">
            <div className="flex items-center justify-between text-xs border-b-2 border-[#181614] pb-3">
              <span className="font-mono font-bold text-[#F1E7D3] uppercase tracking-widest bg-[#C92532] border border-[#181614] px-3 py-1 shadow-[2px_2px_0px_#181614]">
                CHỌN TỪ / GIỚI TỪ CỤM COLLOCATION
              </span>
              <span className="font-mono text-xs font-bold text-[#51483D] uppercase">
                ĐÚNG: <strong className="text-[#2E5A36] font-black tabular-nums">{score}</strong> CÂU
              </span>
            </div>

            {/* Editorial Sentence Display */}
            <div className="bg-[#E9DCC2] border-[1.5px] border-[#493B2D] p-5 sm:p-7 text-center space-y-3 shadow-[inset_0_0_20px_rgba(121,107,89,0.14)]">
              <p className="text-lg sm:text-2xl font-serif font-bold text-[#181614] leading-relaxed">
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
                            : 'bg-[#F1E7D3] border-[#C92532] text-[#C92532] min-w-[4.5rem]'
                        }`}
                      >
                        {isAnswered ? currentQ.correctAnswer : '______'}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </p>

              <div className="text-xs text-[#51483D] pt-2 border-t border-dashed border-[#796B59] inline-flex items-center justify-center gap-1.5 px-4">
                <span className="font-mono uppercase text-[11px]">Nghĩa tiếng Việt:</span>
                <strong className="text-[#181614] font-bold">{currentQ.vietnameseMeaning}</strong>
              </div>
            </div>

            {/* 4-Column Typographic Option Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQ.correctAnswer;

                let style =
                  'border-[#181614] bg-[#E9DCC2] text-[#181614] hover:bg-[#181614] hover:text-[#F1E7D3] shadow-[2px_2px_0px_#181614]';

                if (isAnswered) {
                  if (isCorrect) {
                    style = 'border-[#2E5A36] bg-[#DCE6D5] text-[#2E5A36] font-black shadow-[3px_3px_0px_#2E5A36]';
                  } else if (isSelected) {
                    style = 'border-[#C92532] bg-[#E8B7AC] text-[#991D27] font-black shadow-[3px_3px_0px_#C92532]';
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
                    className={`py-3.5 px-4 rounded-[2px] border-[1.5px] font-mono text-sm sm:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${style}`}
                  >
                    <span className="text-[10px] opacity-65">[{idx + 1}]</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Editorial Rule */}
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
                        <span className="text-[#2E5A36]">CHÍNH XÁC! CỤM COLLOCATION NÀY DÙNG RẤT CHUẨN.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-[#C92532]" />
                        <span className="text-[#991D27]">CHƯA CHUẨN CỤM TỪ — ĐÃ LƯU VÀO SỔ LỖI SAI!</span>
                      </>
                    )}
                  </div>

                  <div className="text-xs text-[#181614] bg-[#F1E7D3] p-3 border border-[#493B2D] space-y-2">
                    <p className="font-mono font-bold uppercase text-[10px] text-[#C92532] mb-1">
                      [ĐIỂM NGỮ PHÁP &amp; COLLOCATION LƯU Ý]:
                    </p>
                    <p className="text-[#181614] leading-relaxed">{currentQ.explanation}</p>
                    {(() => {
                      const targetWord = currentQ.correctAnswer;
                      const matchedItem = allVocab.find(
                        v => v.word.toLowerCase() === targetWord.toLowerCase()
                      ) || {
                        word: targetWord,
                        meaning: currentQ.vietnameseMeaning
                      };
                      const sixCols = getSixCollocationsForWord(matchedItem);
                      const twoEx = getTwoExamplesForWord(matchedItem);
                      return (
                        <div
                          data-sound="none"
                          onClick={(e) => e.stopPropagation()}
                          className="pt-2 border-t border-dashed border-[#796B59] space-y-1.5"
                        >
                          <div className="flex flex-wrap gap-1.5">
                            {sixCols.map((col, cIdx) => (
                              <span
                                key={cIdx}
                                data-sound="none"
                                data-speak-only="true"
                                data-speak="true"
                                data-collocation="true"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakWord(col);
                                }}
                                title="Bấm để nghe phát âm cụm từ tiếng Anh"
                                className="collocation-tag text-[11px] font-mono font-bold bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] hover:text-[#C92532] px-2 py-0.5 border border-[#493B2D] hover:border-[#C92532] cursor-pointer transition-colors"
                              >
                                ⚡ {col}
                              </span>
                            ))}
                          </div>
                          <div
                            data-sound="none"
                            data-speak-only="true"
                            data-example="true"
                            onClick={(e) => e.stopPropagation()}
                            className="example-box space-y-1 pt-1"
                          >
                            <p
                              data-sound="none"
                              data-speak-only="true"
                              data-speak="true"
                              data-example="true"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakWord(twoEx.en1);
                              }}
                              title="Bấm để nghe phát âm câu ví dụ"
                              className="example-sentence font-serif italic font-semibold text-[#181614] hover:text-[#C92532] cursor-pointer transition-colors"
                            >
                              “{twoEx.en1}”
                            </p>
                            <p className="text-[#51483D]">↳ {twoEx.vi1}</p>
                            <p
                              data-sound="none"
                              data-speak-only="true"
                              data-speak="true"
                              data-example="true"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakWord(twoEx.en2);
                              }}
                              title="Bấm để nghe phát âm câu ví dụ"
                              className="example-sentence font-serif italic font-semibold text-[#181614] hover:text-[#C92532] pt-0.5 cursor-pointer transition-colors"
                            >
                              “{twoEx.en2}”
                            </p>
                            <p className="text-[#51483D]">↳ {twoEx.vi2}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    data-sound="none"
                    data-speak-only="true"
                    data-speak="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentQ.sentence.replace('______', currentQ.correctAnswer));
                    }}
                    className="px-3.5 py-2 text-xs font-mono font-bold uppercase btn-newspaper-secondary flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-[#C92532]" />
                    <span>Nghe đọc cả câu</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 text-xs sm:text-sm uppercase tracking-wider btn-newspaper-red flex items-center gap-2 cursor-pointer"
                  >
                    <span>{currentIndex + 1 === questions.length ? 'Hoàn Tất' : 'Câu Kế Tiếp'}</span>
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
            alt="Completed Collocation Cat"
            className="w-24 h-24 mx-auto"
          />
          <h3 className="text-2xl font-serif font-black text-[#181614]">
            Hoàn thành bài luyện Collocation!
          </h3>
          <p className="text-xs sm:text-sm text-[#51483D]">
            Bạn trả lời đúng <strong className="text-[#2E5A36] font-mono font-black text-base">{score}/{questions.length}</strong> câu.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRestart}
              className="btn-newspaper-red px-6 py-2.5 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Luyện bộ câu mới từ Kho từ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
