import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Clock, Zap, RotateCcw, Award, ArrowLeft
} from 'lucide-react';
import { VOCAB_DATABASE, VocabItem } from '../data/vocabularyData';
import {
  getOxford30AsVocabItems,
  getSixCollocationsForWord
} from '../data/academicLexiconEnrichment';
import { sounds, speakWord } from '../utils/soundAndSpeech';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from './VintageNewspaperIllustrations';
import { ENGRAVING_ASSETS, HorizonEngravingHeader } from '../constants/engravings';
import { useAnalytics } from '../context/AnalyticsContext';
import { loadCustomContentStore, CUSTOM_CONTENT_EVENT } from '../services/customContentStore';
import { shuffleArray } from '../utils/shuffle';

interface NodeItem {
  id: string;
  vocabId: string;
  leftText: string;
  rightText: string;
  word: string;
  pos: string;
  ipa?: string;
  meaning: string;
}

interface InteractiveNodeMatchingProps {
  onComplete?: (score: number) => void;
  onGoBack?: () => void;
}

export const InteractiveNodeMatching: React.FC<InteractiveNodeMatchingProps> = ({
  onComplete,
  onGoBack
}) => {
  const { recordQuizEvent, wordProgressMap } = useAnalytics();
  const [round, setRound] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(279);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [customVocab, setCustomVocab] = useState<VocabItem[]>(() => loadCustomContentStore().customVocab);

  const [leftNodes, setLeftNodes] = useState<{ id: string; text: string; full: NodeItem }[]>([]);
  const [rightNodes, setRightNodes] = useState<{ id: string; text: string; full: NodeItem }[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wrongAnimationLeft, setWrongAnimationLeft] = useState<string | null>(null);
  const [wrongAnimationRight, setWrongAnimationRight] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const usedIdsRef = useRef<Set<string>>(new Set());
  const [connections, setConnections] = useState<
    { id: string; x1: number; y1: number; x2: number; y2: number }[]
  >([]);

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

  const initRound = (r = 1) => {
    const nowIso = new Date().toISOString();
    const availablePool = allVocab.filter(v => !usedIdsRef.current.has(v.id));
    const sourcePool = availablePool.length >= 5 ? availablePool : allVocab;

    const priorityWords = sourcePool.filter(v => {
      const prog = wordProgressMap[v.id];
      return (
        prog &&
        (prog.status === 'learning' ||
          prog.status === 'reviewing' ||
          (prog.nextReviewAt && prog.nextReviewAt <= nowIso))
      );
    });

    const priorityPicked = shuffleArray(priorityWords).slice(0, 2);
    const priorityIds = new Set(priorityPicked.map(p => p.id));
    const remainingPool = sourcePool.filter(v => !priorityIds.has(v.id));
    const randomPicked = shuffleArray(remainingPool).slice(0, 5 - priorityPicked.length);

    const chosenFive = shuffleArray([...priorityPicked, ...randomPicked]);
    chosenFive.forEach(v => usedIdsRef.current.add(v.id));

    const items: NodeItem[] = chosenFive.map((v, idx) => {
      const sixCols = getSixCollocationsForWord(v);
      const colPair = sixCols.slice(0, 2).join(' • ');
      const col = colPair ? `${colPair} — ${v.meaning}` : v.meaning;
      return {
        id: `node-${r}-${idx}-${v.id}`,
        vocabId: v.id,
        leftText: v.word,
        rightText: col,
        word: v.word,
        pos: v.pos,
        ipa: v.ipa,
        meaning: v.meaning
      };
    });

    const left = items.map(it => ({ id: it.id, text: it.leftText, full: it }));
    const right = shuffleArray([...items]).map(it => ({ id: it.id, text: it.rightText, full: it }));

    setLeftNodes(left);
    setRightNodes(right);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
    setConnections([]);
    setRound(r);
  };

  useEffect(() => {
    initRound(1);
  }, [allVocab.length]);

  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const updateBezierLines = (currentMatched: string[]) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const lines: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];

    currentMatched.forEach(id => {
      const leftEl = leftRefs.current[id];
      const rightEl = rightRefs.current[id];
      if (leftEl && rightEl) {
        const lRect = leftEl.getBoundingClientRect();
        const rRect = rightEl.getBoundingClientRect();

        const x1 = lRect.right - containerRect.left;
        const y1 = lRect.top + lRect.height / 2 - containerRect.top;
        const x2 = rRect.left - containerRect.left;
        const y2 = rRect.top + rRect.height / 2 - containerRect.top;

        lines.push({ id, x1, y1, x2, y2 });
      }
    });

    setConnections(lines);
  };

  useEffect(() => {
    updateBezierLines(matchedPairs);
    const handleResize = () => updateBezierLines(matchedPairs);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [matchedPairs, leftNodes, rightNodes]);

  const handleSelectLeft = (id: string) => {
    if (matchedPairs.includes(id)) return;
    sounds.playClick();
    setSelectedLeft(id);
    if (selectedRight) {
      evaluatePair(id, selectedRight);
    }
  };

  const handleSelectRight = (id: string) => {
    if (matchedPairs.includes(id)) return;
    sounds.playClick();
    setSelectedRight(id);
    if (selectedLeft) {
      evaluatePair(selectedLeft, id);
    }
  };

  const evaluatePair = (lId: string, rId: string) => {
    const item = leftNodes.find(n => n.id === lId)?.full;
    if (lId === rId) {
      sounds.playCorrect();
      recordQuizEvent(item?.vocabId || lId, item?.word || lId, true, 'Nối Từ Tương Tác');
      const updated = [...matchedPairs, lId];
      setMatchedPairs(updated);
      setSelectedLeft(null);
      setSelectedRight(null);
      setScore(s => s + 20);

      if (item) speakWord(item.word);

      if (updated.length === leftNodes.length) {
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#C92532', '#181614', '#2E5A36']
          });
        } catch {}

        setTimeout(() => {
          if (round < 6) {
            initRound(round + 1);
          } else {
            setIsGameOver(true);
            onComplete?.(score + 20);
          }
        }, 1200);
      }
    } else {
      sounds.playWrong();
      recordQuizEvent(item?.vocabId || lId, item?.word || lId, false, 'Nối Từ Tương Tác');
      setWrongAnimationLeft(lId);
      setWrongAnimationRight(rId);
      setTimeout(() => {
        setWrongAnimationLeft(null);
        setWrongAnimationRight(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  };

  const progressPct = ((matchedPairs.length + (round - 1) * 5) / 30) * 100;

  return (
    <div className="w-full min-w-0 space-y-5">
      {/* 1. EXPANDED HERO BANNER: SƠ ĐỒ LIÊN ĐỚI + CHÙA CẦU HỘI AN ENGRAVING */}
      <HorizonEngravingHeader
        engravingSrc={ENGRAVING_ASSETS.architecture.japaneseCoveredBridge}
        engravingAlt="Japanese Covered Bridge (Chùa Cầu Hội An) 19th-Century Woodcut"
        figLabel="FIG. XI — CHÙA CẦU HỘI AN"
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
        timerPageId="so_do"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {onGoBack && (
              <button
                type="button"
                onClick={onGoBack}
                className="px-2.5 py-1 rounded-[2px] bg-[#E9DCC2] hover:bg-[#C92532] border border-[#181614] text-[11px] font-bold text-[#181614] hover:text-[#F1E7D3] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Trang Nhất</span>
              </button>
            )}
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-[#181614] text-[#F1E7D3]">
              LEXICAL INVESTIGATION BOARD
            </span>
            <span className="font-mono text-[10px] font-bold text-[#F1E7D3] bg-[#C92532] border border-[#181614] px-2.5 py-1 uppercase shadow-[2px_2px_0px_#181614]">
              KHO {allVocab.length.toLocaleString('vi-VN')} TỪ
            </span>
          </div>

          <div className="font-headline uppercase text-[#181614] leading-[0.94] tracking-[-0.01em]">
            <div className="text-3xl sm:text-4xl lg:text-[44px]">SƠ ĐỒ LIÊN ĐỚI —</div>
            <div className="text-3xl sm:text-4xl lg:text-[42px] text-[#C92532] mt-0.5">
              MẠNG LƯỚI TỪ VỰNG
            </div>
          </div>

          <p className="font-serif italic font-bold text-sm sm:text-base text-[#51483D] pt-1">
            "Kết nối các mắt xích ngữ nghĩa và phản xạ ghép cặp tư liệu."
          </p>
        </div>
      </HorizonEngravingHeader>

      {/* 2. DEDICATED STATUS & PROGRESS TOOLBAR */}
      <div className="newspaper-card border-2 border-[#181614] p-4 sm:p-5 shadow-[4px_4px_0px_#181614] space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#51483D]">
            <div className="flex items-center gap-2 font-mono font-bold bg-[#E9DCC2] px-3.5 py-2 border-[1.5px] border-[#181614] shadow-[2px_2px_0px_#181614]">
              <span>
                VỊ TRÍ VÒNG:{' '}
                <strong className="tabular-nums text-[#C92532]">{round}/6</strong>
              </span>
              <span aria-hidden="true">|</span>
              <span>
                ĐÃ NỐI:{' '}
                <strong className="tabular-nums text-[#2E5A36]">
                  {matchedPairs.length}/5 CẶP
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 bg-[#E9DCC2] border-[1.5px] border-[#181614] text-[#181614] font-mono text-xs font-bold shadow-[2px_2px_0px_#181614]">
              <Clock className="w-3.5 h-3.5 text-[#C92532] animate-pulse" />
              <span className="tabular-nums">{formatTime(timeLeft)}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-[#DCE6D5] border-[1.5px] border-[#2E5A36] text-[#2E5A36] font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#181614]">
              <Award className="w-3.5 h-3.5" />
              <span className="tabular-nums">{score} ĐIỂM</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => initRound(round)}
            className="px-3.5 py-2 text-xs font-mono font-bold uppercase btn-newspaper-secondary flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đổi bộ 5 từ khác</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1 border-t border-[#493B2D]/60">
          <div className="flex justify-between font-mono text-[11px] text-[#51483D] font-bold uppercase">
            <span>TIẾN ĐỘ BÀI NỐI TOÀN VÒNG</span>
            <span className="tabular-nums text-[#C92532]">{Math.round(progressPct)}%</span>
          </div>
          <div className="w-full h-2.5 bg-[#E9DCC2] border border-[#181614] overflow-hidden">
            <motion.div
              className="h-full bg-[#C92532]"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* 3. MAIN NODE MATCHING CANVAS */}
      <div className="newspaper-card border-2 border-[#181614] p-1.5 shadow-[5px_5px_0px_#181614] w-full relative overflow-hidden">
        <div className="border border-[#493B2D] p-5 sm:p-8 space-y-6">
          {!isGameOver ? (
          <div
            ref={containerRef}
            className="relative min-h-[360px] py-3 select-none"
          >
            {/* SVG Canvas for Bezier curves */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {connections.map(c => {
                const deltaX = (c.x2 - c.x1) * 0.5;
                const pathData = `M ${c.x1} ${c.y1} C ${c.x1 + deltaX} ${c.y1}, ${c.x2 - deltaX} ${c.y2}, ${c.x2} ${c.y2}`;
                return (
                  <g key={c.id}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#2E5A36"
                      strokeWidth="3"
                      strokeDasharray="4 2"
                      strokeLinecap="round"
                    />
                    <circle cx={c.x1} cy={c.y1} r="4.5" fill="#2E5A36" stroke="#181614" strokeWidth="1.5" />
                    <circle cx={c.x2} cy={c.y2} r="4.5" fill="#2E5A36" stroke="#181614" strokeWidth="1.5" />
                  </g>
                );
              })}
            </svg>

            {/* Two-Column Lexicon Ledger Grid */}
            <div className="grid grid-cols-2 gap-8 sm:gap-20 relative z-20">
              {/* Left Column: Headwords */}
              <div className="space-y-3">
                <div className="font-mono text-xs font-bold text-[#181614] uppercase tracking-widest border-b border-[#493B2D] pb-1.5">
                  TỪ VỰNG HỌC THUẬT (HEADWORD)
                </div>
                {leftNodes.map((item) => {
                  const isMatched = matchedPairs.includes(item.id);
                  const isSelected = selectedLeft === item.id;
                  const isWrong = wrongAnimationLeft === item.id;

                  return (
                    <button
                      key={item.id}
                      ref={el => { leftRefs.current[item.id] = el; }}
                      type="button"
                      disabled={isMatched}
                      onClick={() => handleSelectLeft(item.id)}
                      className={`w-full text-left p-3.5 rounded-[2px] border-[1.5px] transition-all duration-150 cursor-pointer flex items-center justify-between relative ${
                        isMatched
                          ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#2E5A36] cursor-default shadow-[2px_2px_0px_#2E5A36]'
                          : isWrong
                            ? 'bg-[#E8B7AC] border-[#C92532] text-[#991D27] shadow-[2px_2px_0px_#C92532]'
                            : isSelected
                              ? 'bg-[#E8B7AC]/60 border-[#C92532] text-[#181614] shadow-[3px_3px_0px_#C92532]'
                              : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] border-[#181614] hover:border-[#C92532] text-[#181614] shadow-[2px_2px_0px_#181614]'
                      }`}
                    >
                      <div>
                        <div className="font-serif font-black text-base sm:text-lg tracking-tight flex items-center gap-2 flex-wrap">
                          <span>{item.text}</span>
                          {item.full.ipa && (
                            <span className="font-mono text-[11px] text-[#51483D] font-normal">
                              {item.full.ipa}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] uppercase font-bold text-[#C92532]">
                          [{item.full.pos}]
                        </span>
                      </div>

                      <div
                        className={`w-3.5 h-3.5 border-[1.5px] transition-all shrink-0 ${
                          isMatched
                            ? 'bg-[#2E5A36] border-[#181614]'
                            : isSelected
                              ? 'bg-[#C92532] border-[#181614]'
                              : 'border-[#181614] bg-[#F1E7D3]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Collocations / Definitions */}
              <div className="space-y-3">
                <div className="font-mono text-xs font-bold text-[#181614] uppercase tracking-widest border-b border-[#493B2D] pb-1.5">
                  COLLOCATION &amp; NGHĨA CHUẨN
                </div>
                {rightNodes.map((item) => {
                  const isMatched = matchedPairs.includes(item.id);
                  const isSelected = selectedRight === item.id;
                  const isWrong = wrongAnimationRight === item.id;

                  return (
                    <button
                      key={item.id}
                      ref={el => { rightRefs.current[item.id] = el; }}
                      type="button"
                      disabled={isMatched}
                      onClick={() => handleSelectRight(item.id)}
                      className={`w-full text-left p-3.5 rounded-[2px] border-[1.5px] transition-all duration-150 cursor-pointer flex items-center justify-between relative ${
                        isMatched
                          ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#2E5A36] cursor-default shadow-[2px_2px_0px_#2E5A36]'
                          : isWrong
                            ? 'bg-[#E8B7AC] border-[#C92532] text-[#991D27] shadow-[2px_2px_0px_#C92532]'
                            : isSelected
                              ? 'bg-[#DCC9A8] border-[#C92532] text-[#181614] shadow-[3px_3px_0px_#C92532]'
                              : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] border-[#181614] hover:border-[#C92532] text-[#181614] shadow-[2px_2px_0px_#181614]'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 border-[1.5px] mr-3 shrink-0 transition-all ${
                          isMatched
                            ? 'bg-[#2E5A36] border-[#181614]'
                            : isSelected
                              ? 'bg-[#C92532] border-[#181614]'
                              : 'border-[#181614] bg-[#F1E7D3]'
                        }`}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-[#181614] leading-snug flex items-start gap-1.5">
                          <span className="text-[#C92532] font-mono font-bold shrink-0">§</span>
                          <span className="line-clamp-2">{item.text}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Game Over Summary Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-4 bg-[#E9DCC2] border border-[#493B2D] p-6"
          >
            <VintageEngravingFrame
              src={VINTAGE_EDITORIAL_ASSETS.mascot.graduationCap}
              alt="Completed Matching Cat"
              className="w-24 h-24 mx-auto"
            />
            <h3 className="text-2xl font-serif font-black text-[#181614]">
              Xuất Sắc! Bạn Đã Hoàn Thành Thử Thách Nối Từ
            </h3>
            <p className="text-sm text-[#51483D] max-w-md mx-auto">
              Khả năng liên kết từ vựng và collocations của bạn đạt <strong className="text-[#2E5A36] font-mono">{score} điểm</strong>, giúp phản xạ từ tự nhiên chuẩn học thuật.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTimeLeft(279);
                  setScore(0);
                  setIsGameOver(false);
                  initRound(1);
                }}
                className="px-5 py-2.5 btn-newspaper-red text-xs font-mono uppercase tracking-wider cursor-pointer inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi Lại Bộ Từ Mới</span>
              </button>

              {onGoBack && (
                <button
                  type="button"
                  onClick={onGoBack}
                  className="px-5 py-2.5 btn-newspaper-secondary text-xs font-mono uppercase tracking-wider cursor-pointer"
                >
                  Quay Lại Luyện Tập
                </button>
              )}
            </div>
          </motion.div>
        )}

          {/* Helper Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#51483D] border-t-2 border-[#181614] pt-3">
            <span className="font-mono">
              [HƯỚNG DẪN]: Bấm 1 từ học thuật bên trái rồi bấm cụm nghĩa phù hợp bên phải để nối.
            </span>
            <button
              type="button"
              onClick={() => initRound(round)}
              className="text-[#C92532] font-mono font-bold uppercase hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đổi bộ 5 từ khác</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
