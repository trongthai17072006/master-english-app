import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Timer,
  Flame,
  Volume2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { VOCAB_DATABASE, VocabItem } from '../data/vocabularyData';
import {
  getOxford30AsVocabItems,
  getSixCollocationsForWord,
  getTwoExamplesForWord
} from '../data/academicLexiconEnrichment';
import { sounds, speakWord } from '../utils/soundAndSpeech';
import { recordQuizAnswer, saveMistake, incrementQuizCount } from '../utils/storage';
import { QuizCompletionModal, QuizHistoryItem } from './QuizCompletionModal';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from './VintageNewspaperIllustrations';
import { ENGRAVING_ASSETS, HorizonEngravingHeader } from '../constants/engravings';
import { useAnalytics } from '../context/AnalyticsContext';
import { CORE_TASK_IDS } from '../services/milestoneEngine';
import { shuffleArray } from '../utils/shuffle';
import { getSmartBatch, POOL_KEYS, resetSeenIds, getSeenIds } from '../utils/questionPool';

interface Question {
  item: VocabItem;
  prompt: string;
  subPrompt?: string;
  type: 'en-to-vi' | 'vi-to-en';
  options: string[];
  correctOptionIndex: number;
}

interface SpeedQuizProps {
  onMasteryChange?: () => void;
  onGoToMistakes?: () => void;
  onOpenDirectory?: () => void;
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

export const SpeedQuiz: React.FC<SpeedQuizProps> = ({
  onMasteryChange,
  onGoToMistakes,
  onOpenDirectory,
  onBackToDashboard
}) => {
  const {
    recordQuizEvent,
    showToast,
    completeTask,
    currentDayNumber,
    roadmapDays
  } = useAnalytics();

  // Quiz configuration (doubled question batch options: 20, 40, 60)
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [direction, setDirection] = useState<'both' | 'en-vi' | 'vi-en'>('both');
  const [timeLimit, setTimeLimit] = useState<number>(10);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [seenCount, setSeenCount] = useState<number>(() => getSeenIds(POOL_KEYS.SPEED).length);
  const fullVocabPool = React.useMemo<VocabItem[]>(() => {
    const oxfordItems = getOxford30AsVocabItems();
    const seen = new Set<string>();
    const combined: VocabItem[] = [];
    for (const item of [...oxfordItems, ...VOCAB_DATABASE]) {
      const k = item.word.toLowerCase().trim();
      if (!seen.has(k)) {
        seen.add(k);
        combined.push(item);
      }
    }
    return combined;
  }, []);

  // Game state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);

  // Generator for questions using fair Fisher-Yates shuffle and session pool memory
  const generateQuiz = useCallback(() => {
    const candidateDatabase =
      selectedTopic === 'all'
        ? fullVocabPool
        : fullVocabPool.filter(v => v.tags && v.tags.includes(selectedTopic));

    const dbToUse = candidateDatabase.length >= questionCount ? candidateDatabase : fullVocabPool;

    const { items: selectedItems, totalSeen } = getSmartBatch(
      shuffleArray([...dbToUse]),
      POOL_KEYS.SPEED,
      Math.min(questionCount, dbToUse.length)
    );
    setSeenCount(totalSeen);

    const generated: Question[] = selectedItems.map(item => {
      let qType: 'en-to-vi' | 'vi-to-en' = 'en-to-vi';
      if (direction === 'both') {
        qType = Math.random() > 0.5 ? 'en-to-vi' : 'vi-to-en';
      } else if (direction === 'vi-en') {
        qType = 'vi-to-en';
      }

      const otherItems = fullVocabPool.filter(v => v.id !== item.id);
      const shuffledOthers = shuffleArray(otherItems);
      const distractors = shuffledOthers.slice(0, 3);

      let prompt = '';
      let subPrompt = '';
      let correctText = '';
      let wrongTexts: string[] = [];

      if (qType === 'en-to-vi') {
        prompt = item.word;
        subPrompt = `${item.ipa || ''} • [${item.pos.toUpperCase()}] ${item.level ? `(${item.level})` : ''}`;
        correctText = item.meaning;
        wrongTexts = distractors.map(d => d.meaning);
      } else {
        prompt = item.meaning;
        subPrompt = `Chọn từ tiếng Anh phù hợp [${item.pos.toUpperCase()}]`;
        correctText = item.word;
        wrongTexts = distractors.map(d => d.word);
      }

      const allOptions = shuffleArray([correctText, ...wrongTexts]);
      const correctIndex = allOptions.indexOf(correctText);

      return {
        item,
        prompt,
        subPrompt,
        type: qType,
        options: allOptions,
        correctOptionIndex: correctIndex
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setQuizFinished(false);
    setHistory([]);
    setTimeLeft(timeLimit);
    setIsPlaying(true);
  }, [questionCount, direction, timeLimit, selectedTopic, fullVocabPool]);

  // Handle option pick
  const handleSelect = useCallback(
    (index: number) => {
      if (isAnswered || !isPlaying) return;

      const currentQ = questions[currentIndex];
      setSelectedOption(index);
      setIsAnswered(true);

      const isCorrect = index === currentQ.correctOptionIndex;
      recordQuizAnswer(isCorrect);
      recordQuizEvent(currentQ.item.id, currentQ.item.word, isCorrect, 'Speed Quiz', {
        ipa: currentQ.item.ipa,
        meaning: currentQ.item.meaning
      });

      if (isCorrect) {
        sounds.playCorrect();
        setScore(s => s + 1);
        setStreak(curr => {
          const next = curr + 1;
          if (next > maxStreak) setMaxStreak(next);
          if (next >= 3 && next % 3 === 0) sounds.playStreak();
          return next;
        });
      } else {
        sounds.playWrong();
        setStreak(0);
        saveMistake({
          wordId: currentQ.item.id,
          question: `Nghĩa/Từ của: "${currentQ.prompt}"`,
          userAnswer: index >= 0 ? currentQ.options[index] : 'Hết thời gian',
          correctAnswer: currentQ.options[currentQ.correctOptionIndex],
          explanation: `${currentQ.item.word} (${currentQ.item.ipa || ''}): ${currentQ.item.meaning}. ${currentQ.item.detailedNote || ''}`,
          sourceMode: 'Speed Quiz'
        });
        onMasteryChange?.();
      }

      setHistory(prev => [
        ...prev,
        {
          prompt: currentQ.prompt,
          word: currentQ.item.word,
          ipa: currentQ.item.ipa,
          userAnswer: index >= 0 ? currentQ.options[index] : 'Hết giờ',
          correctAnswer: currentQ.options[currentQ.correctOptionIndex],
          isCorrect,
          explanation: `${currentQ.item.meaning}. ${currentQ.item.detailedNote || ''}`
        }
      ]);
    },
    [isAnswered, isPlaying, questions, currentIndex, maxStreak, onMasteryChange, recordQuizEvent]
  );

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || isAnswered || timeLimit === 0 || quizFinished) return;

    if (timeLeft <= 0) {
      handleSelect(-1);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 4 && t > 1) {
          sounds.playTick();
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isAnswered, timeLeft, timeLimit, quizFinished, handleSelect]);

  // Move to next question
  const handleNext = useCallback(() => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(timeLimit);
    } else {
      setQuizFinished(true);
      incrementQuizCount();
      const currentDayTasks = roadmapDays[currentDayNumber]?.tasks || [];
      const collocationsTask = currentDayTasks.find(t => t.id === CORE_TASK_IDS.COLLOCATIONS);
      if (collocationsTask && !collocationsTask.completed) {
        completeTask(currentDayNumber, CORE_TASK_IDS.COLLOCATIONS);
      } else {
        completeTask(currentDayNumber, CORE_TASK_IDS.MISTAKES);
      }
      onMasteryChange?.();
    }
  }, [
    currentIndex,
    questions.length,
    timeLimit,
    onMasteryChange,
    roadmapDays,
    currentDayNumber,
    completeTask
  ]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      if (!isPlaying || quizFinished) return;
      if (!isAnswered) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          handleSelect(idx);
        }
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, quizFinished, isAnswered, handleSelect, handleNext]);

  const currentQuestion = questions[currentIndex];

  // Start Screen — Vintage Newspaper Broadsheet Examination Setup
  if (!isPlaying) {
    return (
      <div className="w-full min-w-0 space-y-5">
        {/* 1. EXPANDED HERO BANNER: KHO CHỮ & THUẬT NGỮ TÒA SOẠN + KHUÊ VĂN CÁC ENGRAVING */}
        <HorizonEngravingHeader
          engravingSrc={ENGRAVING_ASSETS.architecture.khueVanCac}
          engravingAlt="Khuê Văn Các (Temple of Literature, Hanoi) 19th-Century Woodcut"
          figLabel="FIG. IV — KHUÊ VĂN CÁC"
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
          timerPageId="kho_chu"
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
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-[#C92532] border border-[#181614] text-[#F1E7D3] shadow-[2px_2px_0px_#181614]">
                <Zap className="w-3 h-3 fill-[#F1E7D3]" />
                <span>LEXICON &amp; TERMINOLOGY VAULT</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#796B59] hidden sm:inline">
                SEC. II • EDITORIAL ARCHIVE
              </span>
            </div>

            <div className="font-headline uppercase text-[#181614] leading-[0.94] tracking-[-0.01em]">
              <div className="text-3xl sm:text-4xl lg:text-[44px]">KHO CHỮ &amp; THUẬT NGỮ —</div>
              <div className="text-3xl sm:text-4xl lg:text-[42px] text-[#C92532] mt-0.5">
                TÒA SOẠN HỌC THUẬT
              </div>
            </div>

            <p className="font-serif italic font-bold text-sm sm:text-base text-[#51483D] pt-1">
              "Hệ thống lưu trữ, phân loại và biên mục chất liệu ngôn từ trọng tâm."
            </p>
          </div>
        </HorizonEngravingHeader>

        {/* 2. DEDICATED STATUS & QUIZ CONFIGURATION TOOLBAR */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="newspaper-card border-2 border-[#181614] p-4 sm:p-5 shadow-[4px_4px_0px_#181614] space-y-4"
        >
          {/* Top Row: Status Counter + Reset Pool + Start Quiz CTA */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#493B2D]/60">
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#51483D]">
              <div className="flex items-center gap-2 font-mono font-bold bg-[#E9DCC2] px-3.5 py-2 border-[1.5px] border-[#181614] shadow-[2px_2px_0px_#181614]">
                <span>
                  ĐÃ LUYỆN:{' '}
                  <strong className="tabular-nums text-[#C92532]">{seenCount}</strong>
                  {' / '}
                  <strong className="tabular-nums text-[#181614]">
                    {fullVocabPool.length.toLocaleString('vi-VN')}
                  </strong>
                </span>
                <span aria-hidden="true">|</span>
                <button
                  type="button"
                  onClick={() => {
                    resetSeenIds(POOL_KEYS.SPEED);
                    setSeenCount(0);
                    showToast('Đã đặt lại vòng câu hỏi Speed Quiz!');
                  }}
                  className="text-[#C92532] hover:underline font-bold cursor-pointer uppercase"
                >
                  Đặt lại vòng
                </button>
              </div>

              <div className="hidden md:flex items-center gap-1.5 text-xs text-[#51483D]">
                <span className="inline-block w-2 h-2 bg-[#C92532] border border-[#181614]" />
                <span className="font-semibold">Phím tắt máy chữ: bấm</span>
                <kbd className="px-1.5 py-0.5 text-[10px] border border-[#181614] bg-[#E9DCC2] text-[#181614] font-mono font-bold shadow-[1px_1px_0px_#181614]">
                  1-4
                </kbd>
                <span>để chọn,</span>
                <kbd className="px-1.5 py-0.5 text-[10px] border border-[#181614] bg-[#E9DCC2] text-[#181614] font-mono font-bold shadow-[1px_1px_0px_#181614]">
                  Enter
                </kbd>
                <span>để qua câu.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={generateQuiz}
              className="shrink-0 px-6 py-2 btn-newspaper-red text-xs sm:text-sm font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>Bắt đầu kiểm tra</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Middle Row: 3 Segmented Configuration Controls */}
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            {/* 1. Số câu hỏi */}
            <div className="space-y-1.5 shrink-0">
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#51483D]">
                1. Số câu hỏi
              </label>
              <div className="flex items-center gap-1.5">
                {[20, 40, 60].map(count => {
                  const active = questionCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`shrink-0 whitespace-nowrap py-1.5 px-3 text-xs font-mono font-bold uppercase border-[1.5px] rounded-[2px] transition-all cursor-pointer ${
                        active
                          ? 'bg-[#C92532] border-[#181614] text-[#F1E7D3] shadow-[2px_2px_0px_#181614]'
                          : 'bg-[#E9DCC2] border-[#493B2D] text-[#181614] hover:bg-[#DCC9A8] hover:border-[#C92532]'
                      }`}
                    >
                      {count} câu
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Hướng kiểm tra */}
            <div className="space-y-1.5 shrink-0">
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#51483D]">
                2. Hướng kiểm tra
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'both', label: 'Trộn lẫn' },
                  { id: 'en-vi', label: 'Anh → Việt' },
                  { id: 'vi-en', label: 'Việt → Anh' }
                ].map(item => {
                  const active = direction === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDirection(item.id as 'both' | 'en-vi' | 'vi-en')}
                      className={`shrink-0 whitespace-nowrap py-1.5 px-3 text-xs font-mono font-bold uppercase border-[1.5px] rounded-[2px] transition-all cursor-pointer ${
                        active
                          ? 'bg-[#C92532] border-[#181614] text-[#F1E7D3] shadow-[2px_2px_0px_#181614]'
                          : 'bg-[#E9DCC2] border-[#493B2D] text-[#181614] hover:bg-[#DCC9A8] hover:border-[#C92532]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Thời gian / câu */}
            <div className="space-y-1.5 shrink-0">
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#51483D]">
                3. Thời gian / câu
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { time: 10, label: '10 giây' },
                  { time: 15, label: '15 giây' },
                  { time: 0, label: 'Vô hạn' }
                ].map(item => {
                  const active = timeLimit === item.time;
                  return (
                    <button
                      key={item.time}
                      type="button"
                      onClick={() => setTimeLimit(item.time)}
                      className={`shrink-0 whitespace-nowrap py-1.5 px-3 text-xs font-mono font-bold uppercase border-[1.5px] rounded-[2px] transition-all cursor-pointer ${
                        active
                          ? 'bg-[#C92532] border-[#181614] text-[#F1E7D3] shadow-[2px_2px_0px_#181614]'
                          : 'bg-[#E9DCC2] border-[#493B2D] text-[#181614] hover:bg-[#DCC9A8] hover:border-[#C92532]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Row: Clean Horizontal Topic Tag Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-[#493B2D]/60">
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
        </motion.div>

        {/* 3 Vintage Newspaper Feature Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Tự động bắt lỗi sai */}
          <div
            onClick={() => onGoToMistakes?.()}
            className="newspaper-card p-4 cursor-pointer flex items-center gap-4 group edtech-card-hover"
          >
            <VintageEngravingFrame
              src={VINTAGE_EDITORIAL_ASSETS.mascot.nearBooks}
              alt="Errata Cat"
              className="w-24 h-24 shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-serif font-black text-[#181614] truncate">
                  Tự động bắt lỗi sai
                </h3>
                <span className="text-[11px] font-mono font-bold uppercase px-1.5 py-0.5 bg-[#E8B7AC] text-[#991D27] border border-[#C92532]">
                  Đề xuất
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-snug line-clamp-2 text-[#2C2520]">
                Mọi câu trả lời sai sẽ được đóng dấu vào Ngân Hàng Lỗi Sai để làm bài phục hồi.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase text-[#C92532] group-hover:translate-x-0.5 transition-transform">
                <span>Xem chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 2: Combo Streak thưởng */}
          <div
            onClick={generateQuiz}
            className="newspaper-card p-4 cursor-pointer flex items-center gap-4 group edtech-card-hover"
          >
            <VintageEngravingFrame
              src={VINTAGE_EDITORIAL_ASSETS.mascot.graduationCap}
              alt="Streak Cat"
              className="w-24 h-24 shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-serif font-black text-[#181614] truncate">
                  Combo Streak thưởng
                </h3>
                <span className="text-[11px] font-mono font-bold uppercase px-1.5 py-0.5 bg-[#C92532] text-[#F1E7D3] border border-[#181614]">
                  Hot
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-snug line-clamp-2 text-[#2C2520]">
                Giữ chuỗi điểm liên tiếp để kích hoạt hiệu ứng âm thanh và ấn chương học thuật.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase text-[#C92532] group-hover:translate-x-0.5 transition-transform">
                <span>Xem chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 3: Phát âm chuẩn IPA */}
          <div
            onClick={() => {
              if (onOpenDirectory) {
                onOpenDirectory();
              } else {
                speakWord('discrepancy');
              }
            }}
            className="newspaper-card p-4 cursor-pointer flex items-center gap-4 group edtech-card-hover"
          >
            <VintageEngravingFrame
              src={VINTAGE_EDITORIAL_ASSETS.mascot.dictionaryArmchair}
              alt="IPA Dictionary Cat"
              className="w-24 h-24 shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-serif font-black text-[#181614] truncate">
                  Phát âm chuẩn IPA
                </h3>
                <span className="text-[11px] font-mono font-bold uppercase px-1.5 py-0.5 bg-[#DCE6D5] text-[#2E5A36] border border-[#2E5A36]">
                  Mới
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-snug line-clamp-2 text-[#2C2520]">
                Tích hợp giọng đọc bản xứ chuẩn Anh - Mỹ và phân tích IPA chính xác của từng từ vựng.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase text-[#C92532] group-hover:translate-x-0.5 transition-transform">
                <span>Xem chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Finished: Render Vintage Examination Certificate Modal
  if (quizFinished) {
    return (
      <QuizCompletionModal
        score={score}
        total={questions.length}
        maxStreak={maxStreak}
        history={history}
        onRestart={generateQuiz}
        onExit={() => setIsPlaying(false)}
        onGoToMistakes={onGoToMistakes}
      />
    );
  }

  // Active Question Screen — Vintage Newspaper Examination Clipping (PDF Page 2)
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Top Press Status Strip */}
      <div className="newspaper-card-aged px-4 py-2.5 border-[1.5px] border-[#181614] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-[#181614] uppercase tracking-wider">
            CÂU <span className="tabular-nums text-[#C92532]">{currentIndex + 1}/{questions.length}</span>
          </span>
          <div className="w-28 sm:w-44 h-2.5 bg-[#E9DCC2] border border-[#181614] overflow-hidden">
            <motion.div
              className="h-full bg-[#C92532]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {streak > 1 && (
            <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#F1E7D3] bg-[#C92532] px-2.5 py-1 border border-[#181614] shadow-[2px_2px_0px_#181614]">
              <Flame className="w-3.5 h-3.5 fill-[#F1E7D3]" />
              <span className="tabular-nums">{streak}</span>
              <span>STREAK</span>
            </div>
          )}

          {timeLimit > 0 && (
            <div
              className={`flex items-center gap-1.5 font-mono tabular-nums text-xs font-bold px-3 py-1 border-[1.5px] transition-colors ${
                timeLeft <= 4
                  ? 'bg-[#E8B7AC] border-[#C92532] text-[#991D27] animate-pulse'
                  : 'bg-[#F1E7D3] border-[#181614] text-[#181614]'
              }`}
            >
              <Timer className="w-3.5 h-3.5 text-[#C92532]" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Question Broadsheet Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22 }}
          className="newspaper-card border-2 border-[#181614] p-1.5 shadow-[5px_5px_0px_#181614]"
        >
          <div className="border border-[#493B2D] p-5 sm:p-8 space-y-6">
            {/* Prompt Header */}
            <div className="text-center space-y-3 border-b-2 border-[#181614] pb-5">
              <div className="flex items-center justify-center">
                <span className="font-mono text-[11px] font-bold text-[#F1E7D3] uppercase tracking-widest bg-[#C92532] px-3 py-1 border border-[#181614] shadow-[2px_2px_0px_#181614]">
                  {currentQuestion.type === 'en-to-vi' ? 'TIẾNG ANH ➔ TIẾNG VIỆT' : 'TIẾNG VIỆT ➔ TIẾNG ANH'}
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                <h3 className="text-2xl sm:text-4xl font-serif font-black text-[#181614] tracking-tight">
                  {currentQuestion.prompt}
                </h3>

                {currentQuestion.type === 'en-to-vi' && (
                  <button
                    type="button"
                    onClick={() => speakWord(currentQuestion.item.word)}
                    className="p-2 bg-[#E9DCC2] border border-[#181614] text-[#C92532] hover:bg-[#C92532] hover:text-[#F1E7D3] transition-colors cursor-pointer shadow-[2px_2px_0px_#181614]"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {currentQuestion.subPrompt && (
                <p className="text-sm sm:text-base font-mono font-semibold text-[#2C2520]">
                  {currentQuestion.subPrompt}
                </p>
              )}
            </div>

            {/* Editorial Index Options Rows ([1], [2], [3], [4]) */}
            <div className="grid grid-cols-1 gap-3.5">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctOptionIndex;

                let optionStyle =
                  'border-[#181614] bg-[#E9DCC2] text-[#181614] hover:bg-[#DCC9A8] hover:border-[#C92532] shadow-[2px_2px_0px_#181614]';

                if (isAnswered) {
                  if (isCorrect) {
                    optionStyle =
                      'border-[#2E5A36] bg-[#DCE6D5] text-[#2E5A36] font-bold shadow-[3px_3px_0px_#2E5A36]';
                  } else if (isSelected) {
                    optionStyle =
                      'border-[#C92532] bg-[#E8B7AC] text-[#991D27] font-bold shadow-[3px_3px_0px_#C92532]';
                  } else {
                    optionStyle = 'border-[#493B2D]/50 bg-[#E9DCC2]/60 text-[#362E25] opacity-70';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelect(idx)}
                    className={`w-full p-4 rounded-[2px] border-[1.5px] text-left font-semibold text-base sm:text-lg transition-all flex items-center justify-between group cursor-pointer ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-7 h-7 font-mono text-xs sm:text-sm font-bold flex items-center justify-center border shrink-0 transition-colors ${
                          isAnswered && isCorrect
                            ? 'bg-[#2E5A36] border-[#181614] text-[#F1E7D3]'
                            : isAnswered && isSelected
                              ? 'bg-[#C92532] border-[#181614] text-[#F1E7D3]'
                              : 'bg-[#F1E7D3] border-[#181614] text-[#181614] group-hover:bg-[#C92532] group-hover:text-[#F1E7D3]'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </div>

                    {isAnswered && (
                      <div className="shrink-0 ml-2">
                        {isCorrect && <CheckCircle2 className="w-5 h-5 text-[#2E5A36]" />}
                        {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-[#C92532]" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Editorial Proofreader's Note Panel (Full-Width, Compact Above-the-Fold Layout) */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-3 border-t-2 border-[#181614]"
              >
                <div
                  className={`w-full p-3.5 sm:p-4 border-[1.5px] rounded-[2px] ${
                    selectedOption === currentQuestion.correctOptionIndex
                      ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#181614]'
                      : 'bg-[#E8B7AC] border-[#C92532] text-[#181614]'
                  }`}
                >
                  <div className="w-full space-y-2">
                    <div className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-between gap-2">
                      {selectedOption === currentQuestion.correctOptionIndex ? (
                        <span className="inline-flex items-center gap-1.5 text-[#2E5A36]">
                          <CheckCircle2 className="w-4 h-4 text-[#2E5A36]" />
                          <span>CHÍNH XÁC TUYỆT ĐỐI! (+100 XP)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[#991D27]">
                          <AlertCircle className="w-4 h-4 text-[#C92532]" />
                          <span>CHƯA CHÍNH XÁC — ĐÃ GHI SỔ LỖI SAI</span>
                        </span>
                      )}
                    </div>

                    <div className="w-full text-sm sm:text-base text-[#181614] space-y-1.5">
                      <div className="w-full px-3 py-2 bg-[#F1E7D3] border border-[#181614] leading-snug">
                        <strong className="font-serif text-base sm:text-lg text-[#181614]">
                          {currentQuestion.item.word}
                        </strong>{' '}
                        <span className="font-mono text-xs sm:text-sm text-[#2C2520]">
                          {currentQuestion.item.ipa}
                        </span>
                        :{' '}
                        <span className="font-semibold text-[#181614]">
                          {currentQuestion.item.meaning}
                        </span>
                      </div>

                      {currentQuestion.item.detailedNote && (
                        <div className="w-full bg-[#E9DCC2] px-3 py-2 border-l-4 border-[#C92532] text-xs sm:text-sm text-[#181614] leading-snug">
                          <strong className="font-mono uppercase text-xs text-[#C92532] mr-1.5">
                            GHI CHÚ BIÊN TẬP:
                          </strong>
                          {currentQuestion.item.detailedNote}
                        </div>
                      )}

                      {(() => {
                        const sixCols = getSixCollocationsForWord(currentQuestion.item);
                        const twoEx = getTwoExamplesForWord(currentQuestion.item);
                        return (
                          <>
                            <div data-sound="none" className="flex flex-wrap gap-1.5 pt-0.5">
                              {sixCols.map((col, cIdx) => (
                                <span
                                  key={cIdx}
                                  data-sound="none"
                                  data-speak="true"
                                  data-speak-only="true"
                                  data-collocation="true"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakWord(col);
                                  }}
                                  title="Bấm để nghe phát âm cụm từ tiếng Anh"
                                  className="collocation-tag text-xs font-mono font-bold bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] hover:text-[#C92532] px-2 py-0.5 border border-[#493B2D] hover:border-[#C92532] cursor-pointer transition-colors"
                                >
                                  ⚡ {col}
                                </span>
                              ))}
                            </div>
                            <div data-sound="none" data-example="true" className="example-box w-full text-xs sm:text-sm text-[#2C2520] pt-0.5 font-serif italic leading-snug space-y-1">
                              <div>
                                <span
                                  data-sound="none"
                                  data-speak="true"
                                  data-speak-only="true"
                                  data-example="true"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakWord(twoEx.en1);
                                  }}
                                  title="Bấm để nghe phát âm câu ví dụ"
                                  className="example-sentence cursor-pointer hover:text-[#C92532] transition-colors"
                                >
                                  “{twoEx.en1}”
                                </span>
                                <span className="block font-sans not-italic text-[#2C2520] text-xs mt-0.5">
                                  ↳ {twoEx.vi1}
                                </span>
                              </div>
                              <div className="pt-1 border-t border-dashed border-[#493B2D]/40">
                                <span
                                  data-sound="none"
                                  data-speak="true"
                                  data-speak-only="true"
                                  data-example="true"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakWord(twoEx.en2);
                                  }}
                                  title="Bấm để nghe phát âm câu ví dụ"
                                  className="example-sentence cursor-pointer hover:text-[#C92532] transition-colors"
                                >
                                  “{twoEx.en2}”
                                </span>
                                <span className="block font-sans not-italic text-[#2C2520] text-xs mt-0.5">
                                  ↳ {twoEx.vi2}
                                </span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2 btn-newspaper-red text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <span>{currentIndex + 1 === questions.length ? 'Xem Kết Quả' : 'Câu Tiếp Theo'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
