import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, CheckCircle2, RotateCw, ArrowLeft, ArrowRight, 
  Shuffle, BookOpen, Layers, Zap, Sparkles, Check, Undo2, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChallengeVocabWord } from '../../data/challenge60Data';
import {
  getSixCollocationsForWord,
  getTwoExamplesForWord
} from '../../data/academicLexiconEnrichment';
import { speakWord } from '../../utils/soundAndSpeech';
import { playFlipSound, playTier4Stamp } from '../../utils/soundManager';
import { 
  isChallengeVocabMastered, 
  toggleChallengeVocabMastery, 
  updateDayTaskStatus 
} from '../../utils/challengeStorage';
import { shuffleArray } from '../../utils/shuffle';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from '../VintageNewspaperIllustrations';

interface ChallengeVocabularyTabProps {
  day: number;
  vocabList: ChallengeVocabWord[];
  isCompleted: boolean;
  onStatusChange: () => void;
}

type VocabSubView = 'list' | 'flashcards' | 'quiz' | 'review';
type ListFilterTab = 'all' | 'unlearned' | 'mastered';

export const ChallengeVocabularyTab: React.FC<ChallengeVocabularyTabProps> = ({
  day,
  vocabList,
  isCompleted,
  onStatusChange
}) => {
  const [subView, setSubView] = useState<VocabSubView>('list');
  const [listFilter, setListFilter] = useState<ListFilterTab>('all');
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    id: string;
    word: string;
    action: 'mastered' | 'unlearned';
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  
  // Flashcard state
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [cardItems, setCardItems] = useState<ChallengeVocabWord[]>(() => shuffleArray(vocabList));

  // Quiz state
  interface QuizQuestion {
    word: ChallengeVocabWord;
    prompt: string;
    type: 'en-to-vi' | 'vi-to-en';
    options: string[];
    correctIndex: number;
  }
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizCurrentIdx, setQuizCurrentIdx] = useState<number>(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizDone, setQuizDone] = useState<boolean>(false);

  // Sync mastered states
  useEffect(() => {
    const list = vocabList.filter(w => isChallengeVocabMastered(w.id)).map(w => w.id);
    setMasteredIds(list);
    setCardItems(shuffleArray(vocabList));
    setCardIndex(0);
    setIsFlipped(false);
  }, [vocabList, day]);

  // Generate randomized quiz for current 15 words
  const initQuiz = () => {
    const shuffled = shuffleArray(vocabList);
    const questions: QuizQuestion[] = shuffled.map((item) => {
      const isEnToVi = Math.random() > 0.5;
      const others = vocabList.filter(w => w.id !== item.id);
      const distractors = shuffleArray(others).slice(0, 3);

      let prompt = '';
      let correct = '';
      let wrongs: string[] = [];

      if (isEnToVi) {
        prompt = `${item.word} (${item.ipa}) · ${item.pos}`;
        correct = item.meaning;
        wrongs = distractors.map(d => d.meaning);
      } else {
        prompt = `${item.meaning} · ${item.pos}`;
        correct = item.word;
        wrongs = distractors.map(d => d.word);
      }

      const allOptions = shuffleArray([correct, ...wrongs]);
      return {
        word: item,
        prompt,
        type: isEnToVi ? 'en-to-vi' : 'vi-to-en',
        options: allOptions,
        correctIndex: allOptions.indexOf(correct)
      };
    });

    setQuizQuestions(questions);
    setQuizCurrentIdx(0);
    setQuizSelected(null);
    setQuizScore(0);
    setQuizDone(false);
  };

  const handleSubViewChange = (v: VocabSubView) => {
    setSubView(v);
    if (v === 'quiz') {
      initQuiz();
    } else if (v === 'flashcards') {
      setCardItems(shuffleArray(vocabList));
      setCardIndex(0);
      setIsFlipped(false);
    }
  };

  const toggleMastery = (wordId: string) => {
    const wasMastered = masteredIds.includes(wordId);
    const targetWord = vocabList.find(w => w.id === wordId);

    toggleChallengeVocabMastery(wordId);
    const nextMasteredIds = wasMastered
      ? masteredIds.filter(id => id !== wordId)
      : [...masteredIds, wordId];
    setMasteredIds(nextMasteredIds);

    if (!wasMastered) {
      try {
        confetti({
          particleCount: nextMasteredIds.length === vocabList.length ? 65 : 32,
          spread: nextMasteredIds.length === vocabList.length ? 70 : 55,
          origin: { y: 0.65 }
        });
      } catch {
        // ignore confetti error
      }

      if (nextMasteredIds.length === vocabList.length && !isCompleted) {
        updateDayTaskStatus(day, 'vocab', true);
      }

      setToast({
        id: wordId,
        word: targetWord?.word || 'Từ vựng',
        action: 'mastered'
      });
    } else {
      setToast({
        id: wordId,
        word: targetWord?.word || 'Từ vựng',
        action: 'unlearned'
      });
    }

    onStatusChange();
  };

  const handleUndoToast = () => {
    if (!toast) return;
    toggleMastery(toast.id);
    setToast(null);
  };

  const markComplete = () => {
    const nextState = !isCompleted;
    updateDayTaskStatus(day, 'vocab', nextState);
    onStatusChange();
    if (nextState) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  };

  const currentCard = cardItems[cardIndex] || vocabList[0];
  const currentQuizQ = quizQuestions[quizCurrentIdx];
  const filteredVocabList = vocabList.filter(item => {
    if (listFilter === 'unlearned') return !masteredIds.includes(item.id);
    if (listFilter === 'mastered') return masteredIds.includes(item.id);
    return true;
  });

  return (
    <div className="space-y-6 relative text-[#181614]">
      {/* Toast Feedback Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="status"
            aria-live="polite"
            className="fixed top-20 right-4 z-50 bg-[#181614] text-[#F1E7D3] px-4 py-3 rounded-[2px] shadow-[4px_4px_0_rgba(201,37,50,0.4)] border-2 border-[#493B2D] flex items-center gap-3 text-xs sm:text-sm max-w-md"
          >
            <div
              className={`w-7 h-7 rounded-[2px] flex items-center justify-center shrink-0 ${
                toast.action === 'mastered' ? 'bg-[#2E5A36] text-[#F1E7D3]' : 'bg-[#C92532] text-[#F1E7D3]'
              }`}
            >
              {toast.action === 'mastered' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Undo2 className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {toast.action === 'mastered' ? (
                  <>
                    Đã thuộc từ <span className="font-serif font-extrabold text-[#E8B7AC]">"{toast.word}"</span>
                  </>
                ) : (
                  <>
                    Đã chuyển <span className="font-serif font-extrabold text-[#E8B7AC]">"{toast.word}"</span> về mục Cần học
                  </>
                )}
              </p>
              {toast.action === 'mastered' && listFilter !== 'mastered' && (
                <button
                  type="button"
                  onClick={() => {
                    setSubView('list');
                    setListFilter('mastered');
                    setToast(null);
                  }}
                  className="text-[11px] text-[#DCE6D5] hover:underline mt-0.5 font-mono uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Mở mục Đã thuộc ({masteredIds.length}/15)</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleUndoToast}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F1E7D3]/15 hover:bg-[#F1E7D3]/25 text-[#F1E7D3] rounded-[2px] transition-colors cursor-pointer shrink-0"
            >
              Hoàn tác
            </button>

            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Đóng thông báo"
              className="text-[#DCC9A8] hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-navigation & Header — Vintage Newspaper Masthead */}
      <div className="newspaper-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D]">
        <div className="flex items-center gap-3.5">
          <VintageEngravingFrame
            src={VINTAGE_EDITORIAL_ASSETS.architecture.tajMahal}
            alt="Academic Lexicon"
            className="w-14 h-14 hidden sm:block shrink-0"
            aspectClass="aspect-square"
          />
          <div className="space-y-1">
            <h3 className="text-base font-serif font-extrabold text-[#181614]">
              15 Từ Vựng Học Thuật Cốt Lõi (Ngày {day})
            </h3>
            <p className="text-xs text-[#51483D]">
              Tiến độ ghi nhớ: <strong className="font-mono tabular-nums text-[#2E5A36]">{masteredIds.length}/15 từ đã thuộc</strong>
            </p>
          </div>
        </div>

        {/* Sub-view switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#DCC9A8] border border-[#493B2D] rounded-[2px] self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => handleSubViewChange('list')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider font-bold rounded-[2px] transition-colors flex items-center gap-1.5 cursor-pointer ${
              subView === 'list' ? 'bg-[#C92532] text-[#F1E7D3]' : 'text-[#51483D] hover:text-[#181614]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Danh sách từ</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubViewChange('flashcards')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider font-bold rounded-[2px] transition-colors flex items-center gap-1.5 cursor-pointer ${
              subView === 'flashcards' ? 'bg-[#C92532] text-[#F1E7D3]' : 'text-[#51483D] hover:text-[#181614]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Thẻ lật 3D</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubViewChange('quiz')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider font-bold rounded-[2px] transition-colors flex items-center gap-1.5 cursor-pointer ${
              subView === 'quiz' ? 'bg-[#C92532] text-[#F1E7D3]' : 'text-[#51483D] hover:text-[#181614]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Trắc nghiệm (15 câu)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubViewChange('review')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider font-bold rounded-[2px] transition-colors flex items-center gap-1.5 cursor-pointer ${
              subView === 'review' ? 'bg-[#C92532] text-[#F1E7D3]' : 'text-[#51483D] hover:text-[#181614]'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Tổng kết ôn tập</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW: LIST VIEW */}
      {subView === 'list' && (
        <div className="space-y-4">
          {/* Quick Filter Tabs: Tất cả / Cần học / Đã thuộc */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1 p-1 bg-[#DCC9A8] border border-[#493B2D] rounded-[2px]">
              <button
                type="button"
                onClick={() => setListFilter('all')}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider font-bold rounded-[2px] transition-colors cursor-pointer ${
                  listFilter === 'all'
                    ? 'bg-[#C92532] text-[#F1E7D3]'
                    : 'text-[#51483D] hover:text-[#181614]'
                }`}
              >
                Tất cả ({vocabList.length})
              </button>
              <button
                type="button"
                onClick={() => setListFilter('unlearned')}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider font-bold rounded-[2px] transition-colors cursor-pointer ${
                  listFilter === 'unlearned'
                    ? 'bg-[#C92532] text-[#F1E7D3]'
                    : 'text-[#51483D] hover:text-[#181614]'
                }`}
              >
                Cần học ({vocabList.length - masteredIds.length})
              </button>
              <button
                type="button"
                onClick={() => setListFilter('mastered')}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider font-bold rounded-[2px] transition-colors cursor-pointer ${
                  listFilter === 'mastered'
                    ? 'bg-[#2E5A36] text-[#F1E7D3]'
                    : 'text-[#51483D] hover:text-[#181614]'
                }`}
              >
                Đã thuộc ({masteredIds.length})
              </button>
            </div>
            <span className="text-xs text-[#51483D]">
              Bấm nút <strong className="text-[#2E5A36]">Đã thuộc</strong> trên từng từ khi bạn đã nắm vững
            </span>
          </div>

          {filteredVocabList.length === 0 ? (
            <div className="p-8 bg-[#F1E7D3] rounded-[2px] border border-[#493B2D] text-center space-y-3">
              <p className="text-sm font-serif font-extrabold text-[#181614]">
                {listFilter === 'mastered'
                  ? 'Chưa có từ vựng nào trong mục Đã thuộc của ngày hôm nay'
                  : 'Bạn đã nắm vững toàn bộ 15 từ vựng học thuật của ngày hôm nay'}
              </p>
              <p className="text-xs text-[#51483D]">
                {listFilter === 'mastered'
                  ? 'Hãy chuyển sang danh sách Cần học và bấm "Đã thuộc" ở những từ bạn đã ghi nhớ.'
                  : 'Bạn có thể chuyển sang làm bài Trắc nghiệm 15 câu hoặc thực hành bài viết IELTS Writing Task 2.'}
              </p>
              <button
                type="button"
                onClick={() => setListFilter(listFilter === 'mastered' ? 'unlearned' : 'all')}
                className="px-4 py-2 bg-[#C92532] text-[#F1E7D3] text-xs font-mono uppercase tracking-wider font-bold rounded-[2px] border border-[#181614] hover:bg-[#991D27] transition-colors cursor-pointer"
              >
                {listFilter === 'mastered' ? 'Mở danh sách Cần học' : 'Xem lại toàn bộ 15 từ'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVocabList.map((item) => {
                const idx = vocabList.findIndex(v => v.id === item.id);
                const isMastered = masteredIds.includes(item.id);
                return (
                  <div 
                    key={item.id}
                    className={`p-5 rounded-[2px] border transition-colors space-y-3 ${
                      isMastered ? 'border-[#2E5A36] bg-[#DCE6D5]/60' : 'bg-[#F1E7D3] border-[#493B2D] hover:border-[#C92532]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        {/* Unboxed Editorial Metadata Row */}
                        <div className="flex items-center gap-1.5 text-xs text-[#51483D]">
                          <span className="font-mono tabular-nums font-bold text-[#C92532]">
                            #{String(idx + 1).padStart(2, '0')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono uppercase font-bold text-[#181614]">{item.pos}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{item.ipa}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => speakWord(item.word)}
                          title="Bấm để nghe phát âm"
                          className="text-lg text-[#181614] hover:text-[#C92532] font-serif font-extrabold cursor-pointer transition-colors text-left"
                        >
                          {item.word}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => speakWord(item.word)}
                          className="p-2 text-[#51483D] hover:text-[#C92532] bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] transition-colors cursor-pointer"
                          title="Nghe phát âm chuẩn"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMastery(item.id)}
                          className={`px-3 py-1.5 rounded-[2px] border text-xs font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            isMastered 
                              ? 'bg-[#2E5A36] text-[#F1E7D3] border-[#181614]' 
                              : 'bg-[#E9DCC2] text-[#181614] border-[#493B2D] hover:text-[#2E5A36] hover:border-[#2E5A36] hover:bg-[#DCE6D5]'
                          }`}
                          title={isMastered ? 'Đã thuộc (Bấm để hoàn tác)' : 'Đánh dấu đã thuộc'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã thuộc</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-bold text-[#C92532]">
                      {item.meaning}
                    </p>

                    {(() => {
                      const sixCollocations = getSixCollocationsForWord(item);
                      const twoEx = getTwoExamplesForWord(item);
                      return (
                        <>
                          <div
                            data-sound="none"
                            onClick={(e) => e.stopPropagation()}
                            className="flex flex-wrap items-center gap-1.5 pt-1"
                          >
                            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#796B59]">Cụm từ đi kèm:</span>
                            {sixCollocations.map((col, cIdx) => (
                              <button
                                key={cIdx}
                                type="button"
                                data-sound="none"
                                data-speak-only="true"
                                data-speak="true"
                                data-collocation="true"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakWord(col);
                                }}
                                title="Bấm để nghe phát âm cụm từ này"
                                className="collocation-tag text-xs font-mono font-bold bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] hover:text-[#C92532] border border-[#493B2D] px-2.5 py-1 rounded-[2px] cursor-pointer transition-colors"
                              >
                                ⚡ {col}
                              </button>
                            ))}
                          </div>

                          {/* Clean Hairline Divider */}
                          <div
                            data-sound="none"
                            data-speak-only="true"
                            data-example="true"
                            onClick={(e) => e.stopPropagation()}
                            className="example-box pt-3 border-t border-[#493B2D]/40 text-xs space-y-1 max-w-[68ch]"
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
                              className="example-sentence font-serif italic font-semibold text-[#181614] hover:text-[#C92532] text-sm cursor-pointer transition-colors"
                            >
                              “{twoEx.en1}”
                            </p>
                            <p className="text-[#51483D]">Dịch nghĩa: {twoEx.vi1}</p>
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
                              className="example-sentence font-serif italic font-semibold text-[#181614] hover:text-[#C92532] text-sm pt-1.5 cursor-pointer transition-colors"
                            >
                              “{twoEx.en2}”
                            </p>
                            <p className="text-[#51483D]">Dịch nghĩa: {twoEx.vi2}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW: FLASHCARDS 3D */}
      {subView === 'flashcards' && currentCard && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-[#51483D]">
            <span className="font-mono font-bold tabular-nums">Thẻ {cardIndex + 1} / {cardItems.length}</span>
            <button
              type="button"
              data-sound="flip"
              onClick={(e) => {
                e.stopPropagation();
                playFlipSound();
                setCardItems(shuffleArray(vocabList));
                setCardIndex(0);
                setIsFlipped(false);
              }}
              className="flex items-center gap-1 text-[#C92532] font-mono uppercase tracking-wider font-bold hover:underline cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Trộn thứ tự thẻ</span>
            </button>
          </div>

          <div
            data-sound="flip"
            onClick={(e) => {
              e.stopPropagation();
              playFlipSound();
              setIsFlipped(prev => !prev);
            }}
            className="w-full min-h-[340px] cursor-pointer select-none perspective-1000"
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full min-h-[340px] bg-[#F1E7D3] border-2 border-[#493B2D] rounded-[2px] p-6 sm:p-8 flex flex-col justify-between shadow-[6px_6px_0_rgba(24,22,20,0.2)]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between" style={{ backfaceVisibility: 'hidden' }}>
                <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#C92532]">
                  Loại từ: {currentCard.pos}
                </span>
                <button
                  type="button"
                  data-sound="none"
                  data-speak-only="true"
                  data-speak="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentCard.word);
                  }}
                  className="p-2 text-[#C92532] bg-[#E9DCC2] border border-[#493B2D] hover:border-[#C92532] rounded-[2px] cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="my-auto py-4 text-center space-y-3">
                {!isFlipped ? (
                  <div style={{ backfaceVisibility: 'hidden' }} className="space-y-3">
                    <h3 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#181614]">
                      {currentCard.word}
                    </h3>
                    <p className="font-mono text-base text-[#51483D]">
                      {currentCard.ipa}
                    </p>
                    <p className="text-xs font-serif italic text-[#796B59] pt-3">
                      Nhấn vào thẻ để lật xem nghĩa tiếng Việt và câu ví dụ
                    </p>
                  </div>
                ) : (
                  <div style={{ transform: 'rotateY(180deg)' }} className="text-left space-y-3">
                    <div className="text-lg sm:text-xl font-serif font-extrabold text-[#C92532]">
                      {currentCard.meaning}
                    </div>
                    {(() => {
                      const sixCollocations = getSixCollocationsForWord(currentCard);
                      const twoEx = getTwoExamplesForWord(currentCard);
                      return (
                        <>
                          <div
                            data-sound="none"
                            onClick={(e) => e.stopPropagation()}
                            className="flex flex-wrap gap-1.5"
                          >
                            {sixCollocations.map((c, i) => (
                              <button
                                key={i}
                                type="button"
                                data-sound="none"
                                data-speak-only="true"
                                data-speak="true"
                                data-collocation="true"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakWord(c);
                                }}
                                title="Bấm để nghe phát âm cụm từ này"
                                className="collocation-tag text-xs font-mono bg-[#E9DCC2] hover:bg-[#DCC9A8] border border-[#493B2D] hover:border-[#C92532] text-[#181614] hover:text-[#C92532] px-2.5 py-1 rounded-[2px] font-bold cursor-pointer transition-colors"
                              >
                                ⚡ {c}
                              </button>
                            ))}
                          </div>
                          <div
                            data-sound="none"
                            data-speak-only="true"
                            data-example="true"
                            onClick={(e) => e.stopPropagation()}
                            className="example-box pt-3 border-t border-[#493B2D]/40 text-xs text-[#181614] space-y-1"
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
                              className="example-sentence font-serif italic font-semibold text-sm hover:text-[#C92532] cursor-pointer transition-colors"
                            >
                              “{twoEx.en1}”
                            </p>
                            <p className="text-[#51483D]">Dịch nghĩa: {twoEx.vi1}</p>
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
                              className="example-sentence font-serif italic font-semibold text-sm pt-1.5 hover:text-[#C92532] cursor-pointer transition-colors"
                            >
                              “{twoEx.en2}”
                            </p>
                            <p className="text-[#51483D]">Dịch nghĩa: {twoEx.vi2}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="text-xs font-mono uppercase tracking-widest text-center text-[#796B59] border-t border-[#493B2D]/40 pt-3" style={{ transform: isFlipped ? 'rotateY(180deg)' : 'none' }}>
                {isFlipped ? 'Mặt sau: Nghĩa & ngữ cảnh' : 'Mặt trước: Từ vựng & phiên âm'}
              </div>
            </motion.div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              data-sound="flip"
              onClick={(e) => {
                e.stopPropagation();
                playFlipSound();
                setIsFlipped(false);
                setCardIndex(i => (i - 1 + cardItems.length) % cardItems.length);
              }}
              className="px-4 py-2.5 bg-[#F1E7D3] border border-[#493B2D] rounded-[2px] text-xs font-mono uppercase tracking-wider font-bold text-[#181614] flex items-center gap-1.5 hover:bg-[#DCC9A8] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Thẻ trước</span>
            </button>

            <button
              type="button"
              data-sound="stamp"
              onClick={(e) => {
                e.stopPropagation();
                playTier4Stamp();
                toggleMastery(currentCard.id);
              }}
              className={`px-4 py-2.5 rounded-[2px] text-xs font-mono uppercase tracking-wider font-bold border flex items-center gap-1.5 cursor-pointer ${
                masteredIds.includes(currentCard.id)
                  ? 'bg-[#2E5A36] text-[#F1E7D3] border-[#181614]'
                  : 'bg-[#F1E7D3] border-[#493B2D] text-[#181614] hover:border-[#2E5A36] hover:text-[#2E5A36]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{masteredIds.includes(currentCard.id) ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}</span>
            </button>

            <button
              type="button"
              data-sound="flip"
              onClick={(e) => {
                e.stopPropagation();
                playFlipSound();
                setIsFlipped(false);
                setCardIndex(i => (i + 1) % cardItems.length);
              }}
              className="px-4 py-2.5 bg-[#C92532] border border-[#181614] text-[#F1E7D3] rounded-[2px] text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 hover:bg-[#991D27] cursor-pointer"
            >
              <span>Thẻ kế tiếp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW: DAILY QUIZ (15 Randomized Questions) */}
      {subView === 'quiz' && (
        <div className="max-w-xl mx-auto space-y-5">
          {!quizDone && currentQuizQ ? (
            <div className="bg-[#F1E7D3] border-2 border-[#493B2D] rounded-[2px] p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between text-xs border-b border-[#493B2D]/40 pb-3">
                <span className="font-mono tabular-nums font-bold text-[#C92532]">
                  Câu hỏi {quizCurrentIdx + 1} / {quizQuestions.length}
                </span>
                <span className="font-mono tabular-nums font-bold text-[#2E5A36]">
                  Trả lời đúng: {quizScore}
                </span>
              </div>

              <div className="text-center py-2 space-y-2">
                <p className="text-xs font-mono uppercase tracking-widest font-bold text-[#796B59]">
                  {currentQuizQ.type === 'en-to-vi' ? 'Chọn nghĩa tiếng Việt chính xác' : 'Chọn từ tiếng Anh tương ứng'}
                </p>
                <h4 className="text-2xl font-serif font-extrabold text-[#181614]">
                  {currentQuizQ.prompt}
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {currentQuizQ.options.map((opt, optIdx) => {
                  const isAnswered = quizSelected !== null;
                  const isCorrect = optIdx === currentQuizQ.correctIndex;
                  const isUserPick = optIdx === quizSelected;

                  let style = 'bg-[#E9DCC2] border-[#493B2D] hover:border-[#C92532] text-[#181614]';
                  if (isAnswered) {
                    if (isCorrect) style = 'bg-[#DCE6D5] border-[#2E5A36] text-[#2E5A36] font-bold';
                    else if (isUserPick) style = 'bg-[#E8B7AC]/50 border-[#991D27] text-[#991D27]';
                    else style = 'bg-[#E9DCC2]/60 border-[#493B2D]/40 text-[#796B59] opacity-60';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => {
                        setQuizSelected(optIdx);
                        if (optIdx === currentQuizQ.correctIndex) {
                          setQuizScore(s => s + 1);
                        }
                      }}
                      className={`p-3.5 rounded-[2px] border text-left text-sm font-medium transition-colors cursor-pointer ${style}`}
                    >
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {quizSelected !== null && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (quizCurrentIdx + 1 < quizQuestions.length) {
                        setQuizCurrentIdx(i => i + 1);
                        setQuizSelected(null);
                      } else {
                        setQuizDone(true);
                      }
                    }}
                    className="px-6 py-2.5 bg-[#C92532] border border-[#181614] text-[#F1E7D3] font-mono uppercase tracking-wider font-bold rounded-[2px] text-xs hover:bg-[#991D27] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{quizCurrentIdx + 1 === quizQuestions.length ? 'Xem tổng kết điểm' : 'Chuyển sang câu kế tiếp'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#F1E7D3] border-2 border-[#493B2D] rounded-[2px] p-8 text-center space-y-4">
              <h4 className="text-xl font-serif font-extrabold text-[#181614]">
                Hoàn thành bài trắc nghiệm Ngày {day}
              </h4>
              <p className="text-sm text-[#51483D]">
                Bạn đã trả lời chính xác <strong className="text-[#2E5A36] font-mono tabular-nums font-bold text-lg">{quizScore}/{quizQuestions.length}</strong> câu hỏi từ vựng hôm nay.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={initQuiz}
                  className="px-5 py-2.5 bg-[#C92532] border border-[#181614] text-[#F1E7D3] font-mono uppercase tracking-wider font-bold rounded-[2px] text-xs hover:bg-[#991D27] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Làm lại đề mới (Xáo trộn câu hỏi)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW: REVIEW (Ôn Tập) */}
      {subView === 'review' && (
        <div className="p-6 bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C92532]" />
            <h4 className="text-sm font-serif font-extrabold text-[#181614]">Chiến lược lặp lại ngắt quãng (Spaced Repetition)</h4>
          </div>
          <p className="text-xs text-[#51483D] leading-relaxed max-w-[70ch]">
            Để ghi nhớ sâu 15 từ vựng học thuật của Ngày {day}, hãy đọc to câu ví dụ ngữ cảnh và vận dụng tối thiểu 3 từ vào bài viết IELTS Writing Task 2 ngay kế tiếp.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-[#E9DCC2] rounded-[2px] border border-[#493B2D] text-xs space-y-1">
              <span className="font-mono uppercase font-bold text-[#C92532]">Cần học tiếp ({vocabList.length - masteredIds.length} từ)</span>
              <p className="text-[#51483D]">Ôn lại bằng thẻ lật 3D hoặc nghe phát âm từng câu.</p>
            </div>
            <div className="p-4 bg-[#DCE6D5]/70 rounded-[2px] border border-[#2E5A36] text-xs space-y-1">
              <span className="font-mono uppercase font-bold text-[#2E5A36]">Đã thuộc ({masteredIds.length} từ)</span>
              <p className="text-[#51483D]">Sẵn sàng đưa vào dàn ý bài luận Writing Task 2.</p>
            </div>
            <div className="p-4 bg-[#E9DCC2] rounded-[2px] border border-[#493B2D] text-xs space-y-1">
              <span className="font-mono uppercase font-bold text-[#181614]">Mục tiêu ngày: 15/15 từ</span>
              <p className="text-[#51483D]">Tích lũy đều đặn 900 từ học thuật sau 60 ngày.</p>
            </div>
          </div>
        </div>
      )}

      {/* Completion Mark Banner (Primary Task) */}
      <div className="p-5 bg-[#DCC9A8] rounded-[2px] border-2 border-[#493B2D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-[65ch]">
          <div className="text-xs font-serif font-extrabold text-[#181614]">
            Nhiệm vụ trọng tâm 01: Làm chủ 15 từ vựng học thuật Ngày {day}
          </div>
          <div className="text-xs text-[#51483D]">
            {isCompleted
              ? 'Bạn đã hoàn thành nhiệm vụ từ vựng hôm nay. Hãy chuyển sang phần Reading & Listening hoặc Writing Task 2.'
              : 'Học hết 15 từ vựng, làm bài trắc nghiệm kiểm tra rồi bấm xác nhận hoàn thành nhiệm vụ.'}
          </div>
        </div>

        <button
          type="button"
          onClick={markComplete}
          className={`px-5 py-2.5 rounded-[2px] border border-[#181614] text-xs font-mono uppercase tracking-wider font-bold transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
            isCompleted
              ? 'bg-[#2E5A36] text-[#F1E7D3] hover:bg-[#1E4620]'
              : 'bg-[#C92532] text-[#F1E7D3] hover:bg-[#991D27]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isCompleted ? 'Đã hoàn thành nhiệm vụ từ vựng' : 'Xác nhận hoàn thành từ vựng'}</span>
        </button>
      </div>
    </div>
  );
};
