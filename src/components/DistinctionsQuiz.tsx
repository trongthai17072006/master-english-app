import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, BookOpen, ArrowLeft, ArrowRight, RotateCcw, Volume2 } from 'lucide-react';
import { TRICKY_DISTINCTIONS, DistinctionPair, VOCAB_DATABASE, VocabItem } from '../data/vocabularyData';
import { EXTRA_TRICKY_DISTINCTIONS } from '../data/doubledWorkspaceData';
import {
  getOxford30AsVocabItems,
  getSixCollocationsForWord,
  getTwoExamplesForWord
} from '../data/academicLexiconEnrichment';
import { sounds, speakWord } from '../utils/soundAndSpeech';
import { recordQuizAnswer, saveMistake } from '../utils/storage';
import { QuizCompletionModal, QuizHistoryItem } from './QuizCompletionModal';
import { shuffleArray, shuffleOptionsWithIndex } from '../utils/shuffle';
import { useAnalytics } from '../context/AnalyticsContext';
import { loadCustomContentStore, CUSTOM_CONTENT_EVENT } from '../services/customContentStore';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from './VintageNewspaperIllustrations';
import { ENGRAVING_ASSETS, HorizonEngravingHeader } from '../constants/engravings';

interface DistinctionsQuizProps {
  onMasteryChange?: () => void;
  onGoToMistakes?: () => void;
  onBackToDashboard?: () => void;
}

function buildDynamicDistinctionQuestions(
  allVocab: VocabItem[],
  wordProgressMap: Record<string, { status?: string; nextReviewAt?: string }>,
  count = 16
): { pair: DistinctionPair; q: DistinctionPair['testQuestions'][0] }[] {
  if (allVocab.length < 4) return [];

  const nowIso = new Date().toISOString();
  const priorityPool = allVocab.filter(v => {
    const p = wordProgressMap[v.id];
    return p && (p.status === 'learning' || p.status === 'reviewing' || (p.nextReviewAt && p.nextReviewAt <= nowIso));
  });

  const pickedTargets = [
    ...shuffleArray(priorityPool).slice(0, Math.min(8, priorityPool.length)),
    ...shuffleArray(allVocab).slice(0, count)
  ].slice(0, count);

  return pickedTargets.map((target, idx) => {
    const samePosPool = allVocab.filter(
      v => v.id !== target.id && v.pos === target.pos && v.meaning !== target.meaning
    );
    const distractors = shuffleArray(samePosPool.length >= 3 ? samePosPool : allVocab.filter(v => v.id !== target.id)).slice(0, 3);
    const rival = distractors[0] || target;

    const rawOptions = [target.word, ...distractors.map(d => d.word)];
    const collocationHint =
      target.collocations && target.collocations.length > 0
        ? ` (Collocation chuẩn: "${target.collocations[0]}")`
        : '';

    const blankedExample =
      target.exampleEn && target.exampleEn.toLowerCase().includes(target.word.toLowerCase())
        ? target.exampleEn.replace(new RegExp(target.word, 'gi'), '______')
        : `Từ học thuật (${target.pos}) nào mang sắc thái nghĩa chính xác là: "${target.meaning}"${collocationHint}?`;

    const pairObj: DistinctionPair = {
      id: `dyn-dist-${target.id}-${idx}`,
      title: `Phân Biệt Từ Học Thuật: ${target.word} vs ${rival.word}`,
      termA: target.word,
      termB: rival.word,
      explanationA: `${target.word} (${target.pos}): ${target.meaning}`,
      explanationB: `${rival.word} (${rival.pos}): ${rival.meaning}`,
      ruleSummary: `"${target.word}" mang nghĩa "${target.meaning}", trong khi "${rival.word}" mang nghĩa "${rival.meaning}".`,
      testQuestions: []
    };

    const qObj: DistinctionPair['testQuestions'][0] = {
      question: blankedExample,
      options: rawOptions,
      correctIndex: 0,
      explanation: `"${target.word}" (${target.ipa || target.pos}) có nghĩa là "${target.meaning}"${collocationHint}. Đối sánh với "${rival.word}" (${rival.meaning}).`
    };

    return { pair: pairObj, q: qObj };
  });
}

export const DistinctionsQuiz: React.FC<DistinctionsQuizProps> = ({
  onMasteryChange,
  onGoToMistakes,
  onBackToDashboard
}) => {
  const { recordQuizEvent, refreshStorageState, wordProgressMap } = useAnalytics();
  const [selectedPairId, setSelectedPairId] = useState<string>('all');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [showCheatSheet, setShowCheatSheet] = useState<boolean>(false);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [shuffleKey, setShuffleKey] = useState<number>(() => Date.now());
  const [customVocab, setCustomVocab] = useState<VocabItem[]>(() => loadCustomContentStore().customVocab);

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

  const allDistinctionPairs = useMemo<DistinctionPair[]>(() => {
    return [...TRICKY_DISTINCTIONS, ...EXTRA_TRICKY_DISTINCTIONS];
  }, []);

  const activeQuestions = useMemo(() => {
    let items: { pair: DistinctionPair; q: DistinctionPair['testQuestions'][0] }[] = [];
    if (selectedPairId === 'all') {
      const curated: { pair: DistinctionPair; q: DistinctionPair['testQuestions'][0] }[] = [];
      allDistinctionPairs.forEach(pair => {
        pair.testQuestions.forEach(q => {
          curated.push({ pair, q });
        });
      });
      const dynamicItems = buildDynamicDistinctionQuestions(allVocab, wordProgressMap, 28);
      items = [...shuffleArray(curated).slice(0, 12), ...dynamicItems];
    } else if (selectedPairId === 'vocab-4000') {
      items = buildDynamicDistinctionQuestions(allVocab, wordProgressMap, 40);
    } else {
      const pair = allDistinctionPairs.find(p => p.id === selectedPairId);
      if (pair) {
        items = pair.testQuestions.map(q => ({ pair, q }));
      }
    }

    const randomized = shuffleArray(items).map(item => {
      const shuffledQ = shuffleOptionsWithIndex({
        options: item.q.options,
        correctOptionIndex: item.q.correctIndex,
        question: item.q.question,
        explanation: item.q.explanation
      });
      return {
        pair: item.pair,
        q: {
          ...item.q,
          options: shuffledQ.options,
          correctIndex: shuffledQ.correctOptionIndex
        }
      };
    });

    return randomized;
  }, [selectedPairId, shuffleKey, allVocab, allDistinctionPairs, wordProgressMap]);

  const currentItem = activeQuestions[activeQuestionIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered || !currentItem) return;

    setSelectedAnswer(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentItem.q.correctIndex;
    recordQuizAnswer(isCorrect);
    recordQuizEvent(
      currentItem.pair.id,
      `${currentItem.pair.termA} vs ${currentItem.pair.termB}`,
      isCorrect,
      'Phân Biệt Từ (Distinctions)'
    );

    if (isCorrect) {
      sounds.playCorrect();
      setScore(s => s + 1);
    } else {
      sounds.playWrong();
      saveMistake({
        question: `Phân biệt sắc thái: ${currentItem.q.question}`,
        userAnswer: currentItem.q.options[idx],
        correctAnswer: currentItem.q.options[currentItem.q.correctIndex],
        explanation: `${currentItem.pair.ruleSummary} Chi tiết: ${currentItem.q.explanation}`,
        sourceMode: 'Phân Biệt Từ (Distinctions)'
      });
      refreshStorageState();
      onMasteryChange?.();
    }

    setHistory(prev => [
      ...prev,
      {
        prompt: currentItem.q.question,
        word: `${currentItem.pair.termA} vs ${currentItem.pair.termB}`,
        userAnswer: currentItem.q.options[idx],
        correctAnswer: currentItem.q.options[currentItem.q.correctIndex],
        isCorrect,
        explanation: currentItem.q.explanation
      }
    ]);
  };

  const handleNext = () => {
    if (activeQuestionIndex + 1 < activeQuestions.length) {
      setActiveQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  const handleReset = () => {
    setShuffleKey(Date.now() + Math.random());
    setActiveQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setCompleted(false);
    setHistory([]);
  };

  if (completed) {
    return (
      <QuizCompletionModal
        score={score}
        total={activeQuestions.length}
        maxStreak={score}
        history={history}
        onRestart={handleReset}
        onExit={handleReset}
        onGoToMistakes={onGoToMistakes}
      />
    );
  }

  return (
    <div className="w-full min-w-0 space-y-5">
      {/* 1. EXPANDED HERO BANNER: THẨM ĐỊNH NGỮ NGHĨA + STATUE OF LIBERTY ENGRAVING */}
      <HorizonEngravingHeader
        engravingSrc={ENGRAVING_ASSETS.architecture.statueOfLiberty}
        engravingAlt="Statue of Liberty 19th-Century Copperplate Engraving"
        figLabel="FIG. VIII — LIBERTY ENLIGHTENING"
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
        timerPageId="tham_dinh"
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
              NUANCE &amp; SEMANTIC TRIBUNAL
            </span>
            <span className="font-mono text-[10px] font-bold uppercase px-2.5 py-1 bg-[#C92532] text-[#F1E7D3] border border-[#181614] shadow-[2px_2px_0px_#181614]">
              THẨM ĐỊNH NGỮ NGHĨA
            </span>
          </div>

          <div className="font-headline uppercase text-[#181614] leading-[0.94] tracking-[-0.01em]">
            <div className="text-3xl sm:text-4xl lg:text-[44px]">THẨM ĐỊNH NGỮ NGHĨA —</div>
            <div className="text-3xl sm:text-4xl lg:text-[42px] text-[#C92532] mt-0.5">
              BÀN CÂN SẮC THÁI TỪ VỰNG
            </div>
          </div>

          <p className="font-serif italic font-bold text-sm sm:text-base text-[#51483D] pt-1">
            "Đối chiếu, phân tích và làm rõ ranh giới sử dụng giữa các thuật ngữ dễ nhầm lẫn."
          </p>
        </div>
      </HorizonEngravingHeader>

      {/* 2. DEDICATED STATUS & CLASSIFICATION FILTER TOOLBAR */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="newspaper-card border-2 border-[#181614] p-4 sm:p-5 shadow-[4px_4px_0px_#181614] space-y-3.5"
      >
        {/* Top Row: Status Counter + Cheat Sheet & Reset Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#493B2D]/60">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#51483D]">
            <div className="flex items-center gap-2 font-mono font-bold bg-[#E9DCC2] px-3.5 py-2 border-[1.5px] border-[#181614] shadow-[2px_2px_0px_#181614]">
              <span>
                VỊ TRÍ:{' '}
                <strong className="tabular-nums text-[#C92532]">
                  {activeQuestionIndex + 1}/{activeQuestions.length}
                </strong>
              </span>
              <span aria-hidden="true">|</span>
              <span>
                ĐÚNG:{' '}
                <strong className="tabular-nums text-[#2E5A36]">
                  {score}/{activeQuestions.length}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 text-xs font-mono font-bold uppercase btn-newspaper-secondary flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đổi bộ câu hỏi</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              className="px-3.5 py-2 text-xs font-mono font-bold uppercase btn-newspaper-red flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showCheatSheet ? 'Ẩn Cẩm Nang' : 'Xem Cẩm Nang Phân Biệt'}</span>
            </button>
          </div>
        </div>

        {/* Archival Cheat Sheet Compendium Drawer */}
        <AnimatePresence>
          {showCheatSheet && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pt-2 border-b-2 border-[#181614] pb-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {allDistinctionPairs.map(pair => (
                  <div key={pair.id} className="p-3.5 bg-[#E9DCC2] border-[1.5px] border-[#493B2D] text-xs sm:text-sm space-y-1.5">
                    <div className="font-serif font-black text-[#181614] text-base border-b border-[#493B2D] pb-1 flex items-center justify-between gap-2">
                      <span>{pair.title}</span>
                      <button
                        type="button"
                        onClick={() => speakWord(`${pair.termA}. ${pair.termB}${pair.termC ? `. ${pair.termC}` : ''}`)}
                        className="p-1 bg-[#F1E7D3] border border-[#181614] text-[#C92532] hover:bg-[#181614] hover:text-[#F1E7D3] transition-colors cursor-pointer shrink-0"
                        title="Nghe phát âm cặp từ"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[#C92532] font-bold">⚡ {pair.ruleSummary}</p>
                    <div className="text-[#2C2520] text-xs sm:text-sm space-y-1 pt-1">
                      <div>• <strong className="text-[#181614]">{pair.termA}</strong>: {pair.explanationA}</div>
                      <div>• <strong className="text-[#181614]">{pair.termB}</strong>: {pair.explanationB}</div>
                      {pair.termC && <div>• <strong className="text-[#181614]">{pair.termC}</strong>: {pair.explanationC}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Row: Clean Horizontal Classification Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => { setSelectedPairId('all'); handleReset(); }}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border-[1.5px] rounded-[2px] whitespace-nowrap transition-colors cursor-pointer ${
              selectedPairId === 'all'
                ? 'bg-[#181614] border-[#181614] text-[#F1E7D3] shadow-[2px_2px_0px_#C92532]'
                : 'bg-[#E9DCC2] border-[#493B2D] hover:bg-[#DCC9A8] text-[#181614]'
            }`}
          >
            Tổng hợp Kho {allVocab.length.toLocaleString('vi-VN')} từ
          </button>

          <button
            type="button"
            onClick={() => { setSelectedPairId('vocab-4000'); handleReset(); }}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border-[1.5px] rounded-[2px] whitespace-nowrap transition-colors cursor-pointer ${
              selectedPairId === 'vocab-4000'
                ? 'bg-[#181614] border-[#181614] text-[#F1E7D3] shadow-[2px_2px_0px_#C92532]'
                : 'bg-[#E9DCC2] border-[#493B2D] hover:bg-[#DCC9A8] text-[#181614]'
            }`}
          >
            Ngẫu nhiên 100% từ Kho từ
          </button>

          {allDistinctionPairs.map(pair => (
            <button
              key={pair.id}
              type="button"
              onClick={() => { setSelectedPairId(pair.id); handleReset(); }}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border-[1.5px] rounded-[2px] whitespace-nowrap transition-colors cursor-pointer ${
                selectedPairId === pair.id
                  ? 'bg-[#181614] border-[#181614] text-[#F1E7D3] shadow-[2px_2px_0px_#C92532]'
                  : 'bg-[#E9DCC2] border-[#493B2D] hover:bg-[#DCC9A8] text-[#181614]'
              }`}
            >
              {pair.termA} vs {pair.termB}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Active Examination Sheet */}
      {currentItem && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeQuestionIndex}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            className="newspaper-card border-2 border-[#181614] p-1.5 shadow-[5px_5px_0px_#181614]"
          >
            <div className="border border-[#493B2D] p-5 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#181614] pb-3">
                <span className="font-mono text-xs sm:text-sm font-bold text-[#F1E7D3] bg-[#C92532] px-3.5 py-1 border border-[#181614] uppercase tracking-wider shadow-[2px_2px_0px_#181614]">
                  {currentItem.pair.title}
                </span>
                <span className="font-mono text-xs sm:text-sm text-[#2C2520] font-bold uppercase">
                  CÂU <span className="tabular-nums text-[#181614]">{activeQuestionIndex + 1}/{activeQuestions.length}</span> • ĐÚNG:{' '}
                  <strong className="text-[#2E5A36] tabular-nums">{score}</strong>
                </span>
              </div>

              {/* Archival Context Footnote Box with Scholar Cat Holding Oil Lamp */}
              <div className="p-4 sm:p-5 bg-[#DCC9A8] border-[1.5px] border-[#181614] border-l-4 border-l-[#C92532] text-[#181614] flex items-center justify-between gap-5">
                <div className="space-y-1.5 flex-1">
                  <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#C92532]">
                    [CHÚ GIẢI SẮC THÁI — GỢI Ý NGỮ CẢNH]
                  </div>
                  <div className="leading-relaxed text-base font-medium text-[#181614]">
                    {currentItem.pair.ruleSummary}
                  </div>
                </div>
                <VintageEngravingFrame
                  src={VINTAGE_EDITORIAL_ASSETS.mascot.oilLamp}
                  alt="Cat holding oil lamp and book"
                  className="w-28 h-24 shrink-0 hidden sm:block"
                />
              </div>

              {/* Question Sentence */}
              <div className="space-y-2 py-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#181614] leading-relaxed flex-1">
                    {currentItem.q.question}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      speakWord(
                        currentItem.q.question.replace(
                          /_{2,}/g,
                          currentItem.q.options[currentItem.q.correctIndex] || ''
                        )
                      )
                    }
                    className="p-2.5 bg-[#E9DCC2] border-[1.5px] border-[#181614] hover:bg-[#181614] hover:text-[#F1E7D3] text-[#C92532] transition-colors cursor-pointer shrink-0 shadow-[2px_2px_0px_#181614]"
                    title="Nghe phát âm câu tiếng Anh chuẩn"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm font-mono font-semibold text-[#2C2520] uppercase tracking-wider">
                  Chọn từ chuẩn xác nhất với ngữ cảnh và sắc thái ý nghĩa của câu:
                </p>
              </div>

              {/* 2x2 Bordered Print Cells */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentItem.q.options.map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === currentItem.q.correctIndex;
                  const letter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;

                  let btnStyle =
                    'border-[#181614] bg-[#E9DCC2] text-[#181614] hover:bg-[#DCC9A8] hover:border-[#C92532] shadow-[2px_2px_0px_#181614]';

                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = 'border-[#2E5A36] bg-[#DCE6D5] text-[#2E5A36] font-bold shadow-[3px_3px_0px_#2E5A36]';
                    } else if (isSelected) {
                      btnStyle = 'border-[#C92532] bg-[#E8B7AC] text-[#991D27] font-bold shadow-[3px_3px_0px_#C92532]';
                    } else {
                      btnStyle = 'border-[#493B2D]/50 bg-[#E9DCC2]/60 text-[#362E25] opacity-70';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelect(idx)}
                      className={`p-4 rounded-[2px] border-[1.5px] text-left font-semibold text-base sm:text-lg transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-7 h-7 font-mono text-xs sm:text-sm font-bold border border-[#181614] bg-[#F1E7D3] text-[#181614] flex items-center justify-center shrink-0">
                          {letter}
                        </span>
                        <span className="font-serif font-bold text-base sm:text-lg">{opt}</span>
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

              {/* Explanation Box */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-4 border-t-2 border-[#181614]"
                >
                  <div
                    className={`p-4 sm:p-5 rounded-[2px] border-[1.5px] text-base ${
                      selectedAnswer === currentItem.q.correctIndex
                        ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#181614]'
                        : 'bg-[#E8B7AC] border-[#C92532] text-[#181614]'
                    }`}
                  >
                    <div className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-2.5">
                      {selectedAnswer === currentItem.q.correctIndex ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#2E5A36]" />
                          <span className="text-[#2E5A36]">TUYỆT VỜI! BẠN NẮM RẤT VỮNG SẮC THÁI TỪ HỌC THUẬT.</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-[#C92532]" />
                          <span className="text-[#991D27]">NHẦM LẪN SẮC THÁI — HÃY XEM KỸ PHÂN TÍCH BIÊN TẬP:</span>
                        </>
                      )}
                    </div>

                    <div className="text-sm sm:text-base text-[#181614] leading-relaxed bg-[#F1E7D3] p-3.5 border border-[#181614] space-y-2">
                      <div className="font-mono font-bold uppercase text-xs text-[#C92532] mb-1">
                        [GIẢI THÍCH CHUYÊN SÂU]:
                      </div>
                      <p>{currentItem.q.explanation}</p>
                      {(() => {
                        const correctWord = currentItem.q.options[currentItem.q.correctIndex] || currentItem.pair.termA;
                        const matchedVocab = allVocab.find(
                          v => v.word.toLowerCase() === correctWord.toLowerCase()
                        ) || {
                          word: correctWord,
                          meaning: currentItem.pair.explanationA
                        };
                        const sixCols = getSixCollocationsForWord(matchedVocab);
                        const twoEx = getTwoExamplesForWord(matchedVocab);
                        return (
                          <div
                            data-sound="none"
                            onClick={(e) => e.stopPropagation()}
                            className="pt-2 border-t border-dashed border-[#796B59] text-xs space-y-1.5"
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
                                  className="collocation-tag font-mono font-bold bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] hover:text-[#C92532] px-2 py-0.5 border border-[#493B2D] hover:border-[#C92532] cursor-pointer transition-colors"
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

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 btn-newspaper-red text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                    >
                      <span>{activeQuestionIndex + 1 === activeQuestions.length ? 'Xem Tổng Kết' : 'Câu Tiếp Theo'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
