import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Volume2, RotateCw, ArrowLeft, ArrowRight, Shuffle,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VOCAB_DATABASE, VocabItem } from '../data/vocabularyData';
import {
  getOxford30AsVocabItems,
  getSixCollocationsForWord,
  getTwoExamplesForWord
} from '../data/academicLexiconEnrichment';
import { speakWord } from '../utils/soundAndSpeech';
import { playTier1Major, playTier3PageFlip, playTier4Stamp, speakText } from '../utils/soundManager';
import { getMasteredWordIds, toggleMasteredWord } from '../utils/storage';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from './VintageNewspaperIllustrations';
import { ENGRAVING_ASSETS, HorizonEngravingHeader } from '../constants/engravings';
import { shuffleArray } from '../utils/shuffle';
import { useAnalytics } from '../context/AnalyticsContext';
import { loadCustomContentStore, CUSTOM_CONTENT_EVENT } from '../services/customContentStore';

interface FlashcardsModeProps {
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

export const FlashcardsMode: React.FC<FlashcardsModeProps> = ({
  onMasteryChange,
  onBackToDashboard
}) => {
  const { recordFlashcardFlip, recordLearningWord, refreshStorageState, wordProgressMap } = useAnalytics();
  const [filter, setFilter] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [masteredIds, setMasteredIds] = useState<string[]>(() => getMasteredWordIds());
  const [customVocab, setCustomVocab] = useState<VocabItem[]>(() => loadCustomContentStore().customVocab);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [shuffleSeed, setShuffleSeed] = useState<number>(() => Date.now());

  const allVocab = useMemo<VocabItem[]>(() => {
    const oxfordItems = getOxford30AsVocabItems();
    const seen = new Set<string>();
    const combined: VocabItem[] = [];
    for (const item of [...oxfordItems, ...customVocab, ...VOCAB_DATABASE]) {
      const key = item.word.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }
    return combined;
  }, [customVocab]);

  const refreshMastered = useCallback(() => {
    setMasteredIds(getMasteredWordIds());
  }, []);

  useEffect(() => {
    const refreshCustom = () => setCustomVocab(loadCustomContentStore().customVocab);
    window.addEventListener(CUSTOM_CONTENT_EVENT, refreshCustom);
    window.addEventListener('master-english-word-progress-changed', refreshMastered);
    window.addEventListener('storage', refreshMastered);
    return () => {
      window.removeEventListener(CUSTOM_CONTENT_EVENT, refreshCustom);
      window.removeEventListener('master-english-word-progress-changed', refreshMastered);
      window.removeEventListener('storage', refreshMastered);
    };
  }, [refreshMastered]);

  // Dynamic random sampling + prioritizing SRS / learning words across the entire ~4,000-word store
  const items = useMemo<VocabItem[]>(() => {
    const masteredSet = new Set(masteredIds);
    const filtered = allVocab.filter(item => {
      const isM = masteredSet.has(item.id);
      if (filter === 'mastered' && !isM) return false;
      if (filter === 'unmastered' && isM) return false;
      if (selectedTopic !== 'all' && (!item.tags || !item.tags.includes(selectedTopic))) return false;
      if (selectedLevel !== 'all' && item.level !== selectedLevel) return false;
      return true;
    });

    const pool = filtered.length > 0 ? filtered : allVocab;
    const nowIso = new Date().toISOString();

    const srsDueOrLearning: VocabItem[] = [];
    const restPool: VocabItem[] = [];

    pool.forEach(item => {
      const prog = wordProgressMap[item.id];
      if (
        prog &&
        (prog.status === 'learning' ||
          prog.status === 'reviewing' ||
          (prog.nextReviewAt && prog.nextReviewAt <= nowIso)) &&
        !masteredSet.has(item.id)
      ) {
        srsDueOrLearning.push(item);
      } else {
        restPool.push(item);
      }
    });

    return [...shuffleArray(srsDueOrLearning), ...shuffleArray(restPool)];
  }, [allVocab, filter, selectedTopic, selectedLevel, masteredIds, shuffleSeed, wordProgressMap]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filter, selectedTopic, selectedLevel, shuffleSeed]);

  const currentItem = items[currentIndex] || items[0];
  const isMastered = currentItem ? masteredIds.includes(currentItem.id) : false;

  const handleFlip = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playTier3PageFlip();
    if (!isFlipped && currentItem) {
      recordFlashcardFlip(currentItem.id, currentItem.word);
    }
    setIsFlipped(prev => !prev);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playTier3PageFlip();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % items.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playTier3PageFlip();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
  };

  const handleShuffle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playTier1Major();
    setIsFlipped(false);
    setShuffleSeed(Date.now() + Math.random());
    setCurrentIndex(0);
  };

  const handleToggleMastery = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playTier4Stamp();
    if (!currentItem) return;
    const nowMastered = toggleMasteredWord(currentItem.id);
    refreshMastered();
    refreshStorageState();
    onMasteryChange?.();

    recordLearningWord(
      currentItem.id,
      currentItem.word,
      nowMastered ? 'mastered' : 'unmastered',
      'Flashcard 3D',
      { ipa: currentItem.ipa, meaning: currentItem.meaning, level: currentItem.level }
    );

    if (nowMastered) {
      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.7 },
          colors: ['#C92532', '#181614', '#2E5A36']
        });
      } catch {}
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        playTier3PageFlip();
        setIsFlipped(f => !f);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length]);

  if (!currentItem) {
    return null;
  }

  const topicTag = currentItem.tags && currentItem.tags[0];

  return (
    <div className="w-full min-w-0 space-y-5">
      {/* 1. EXPANDED HERO BANNER: THẺ HỒ SƠ LƯU TRỮ (INDEX CARDS) + GRAND ARCHIVAL LIBRARY ENGRAVING */}
      <HorizonEngravingHeader
        engravingSrc={ENGRAVING_ASSETS.scholarCat.grandLibrary}
        engravingAlt="Scholar Cat Studying in Grand Archival Library Woodcut"
        figLabel="FIG. VI — ARCHIVAL INDEX CABINET"
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
        timerPageId="the_ho_so"
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
              ARCHIVAL INDEX CABINET
            </span>
            <span className="font-mono text-[10px] font-bold uppercase px-2.5 py-1 bg-[#C92532] text-[#F1E7D3] border border-[#181614] shadow-[2px_2px_0px_#181614]">
              THẺ HỒ SƠ LƯU TRỮ
            </span>
          </div>

          <div className="font-headline uppercase text-[#181614] leading-[0.94] tracking-[-0.01em]">
            <div className="text-3xl sm:text-4xl lg:text-[44px]">HỘP THẺ HỒ SƠ LƯU TRỮ —</div>
            <div className="text-3xl sm:text-4xl lg:text-[42px] text-[#C92532] mt-0.5">
              INDEX CARDS BIÊN TẬP
            </div>
          </div>

          <p className="font-serif italic font-bold text-sm sm:text-base text-[#51483D] pt-1">
            "Phân loại và duyệt nhanh các phiếu tư liệu ngôn ngữ theo phương pháp lặp lại ngắt quãng."
          </p>
        </div>
      </HorizonEngravingHeader>

      {/* 2. DEDICATED STATUS & ARCHIVAL FILTER TOOLBAR */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="newspaper-card border-2 border-[#181614] p-4 sm:p-5 shadow-[4px_4px_0px_#181614] space-y-3.5"
      >
        {/* Top Row: Status Counter + Shuffle Button + Segmented Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#493B2D]/60">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#51483D]">
            <div className="flex items-center gap-2 font-mono font-bold bg-[#E9DCC2] px-3.5 py-2 border-[1.5px] border-[#181614] shadow-[2px_2px_0px_#181614]">
              <span>
                VỊ TRÍ:{' '}
                <strong className="tabular-nums text-[#C92532]">
                  {currentIndex + 1}/{items.length.toLocaleString('vi-VN')}
                </strong>
              </span>
              <span aria-hidden="true">|</span>
              <span>
                ĐÃ THUỘC:{' '}
                <strong className="tabular-nums text-[#2E5A36]">
                  {masteredIds.length.toLocaleString('vi-VN')}/{allVocab.length.toLocaleString('vi-VN')}
                </strong>
              </span>
            </div>

            <button
              type="button"
              data-sound="major"
              onClick={handleShuffle}
              className="px-3.5 py-2 text-xs font-mono font-bold uppercase btn-newspaper-red flex items-center gap-1.5 cursor-pointer"
              title="Xáo trộn ngẫu nhiên bộ thẻ từ kho ~4.000 từ"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Đổi bộ thẻ</span>
            </button>
          </div>

          {/* Segmented Print Tabs */}
          <div className="flex items-center border-[1.5px] border-[#181614] bg-[#DCC9A8] p-0.5">
            <button
              type="button"
              data-sound="sub"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-[#181614] text-[#F1E7D3]'
                  : 'text-[#51483D] hover:text-[#181614]'
              }`}
            >
              Tất cả ({allVocab.length.toLocaleString('vi-VN')})
            </button>
            <button
              type="button"
              data-sound="sub"
              onClick={() => setFilter('unmastered')}
              className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'unmastered'
                  ? 'bg-[#C92532] text-[#F1E7D3]'
                  : 'text-[#51483D] hover:text-[#C92532]'
              }`}
            >
              Chưa thuộc ({Math.max(0, allVocab.length - masteredIds.length).toLocaleString('vi-VN')})
            </button>
            <button
              type="button"
              data-sound="sub"
              onClick={() => setFilter('mastered')}
              className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'mastered'
                  ? 'bg-[#2E5A36] text-[#F1E7D3]'
                  : 'text-[#51483D] hover:text-[#2E5A36]'
              }`}
            >
              Đã thuộc ({masteredIds.length.toLocaleString('vi-VN')})
            </button>
          </div>
        </div>

        {/* Bottom Row: Level Dropdown + Clean Horizontal Topic Tag Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <select
            value={selectedLevel}
            data-sound="sub"
            onChange={(e) => setSelectedLevel(e.target.value)}
            aria-label="Lọc theo cấp độ flashcard"
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
                  data-sound="sub"
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
      </motion.div>

      {/* 19th-Century Archival Index Card (3D Interactive Flip) */}
      <div
        onClick={handleFlip}
        className="w-full min-h-[400px] sm:min-h-[440px] cursor-pointer perspective-1000 select-none"
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full h-full min-h-[400px] sm:min-h-[440px] newspaper-card border-2 border-[#181614] p-2 shadow-[6px_6px_0px_#181614] flex flex-col justify-between relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Inner Archival Hairline Frame */}
          <div className="w-full h-full flex-1 border border-[#493B2D] p-5 sm:p-8 flex flex-col justify-between relative">
            {/* Ornamental Corner Marks */}
            <span className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#181614] pointer-events-none" />
            <span className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#181614] pointer-events-none" />
            <span className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#181614] pointer-events-none" />
            <span className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#181614] pointer-events-none" />

            {/* Card Top Stamp Badges */}
            <div
              className="flex items-center justify-between border-b border-dashed border-[#796B59] pb-3"
              style={{ transform: isFlipped ? 'rotateY(180deg)' : 'none' }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#F1E7D3] bg-[#C92532] px-2.5 py-0.5 border border-[#181614] shadow-[1px_1px_0px_#181614]">
                  {currentItem.pos}
                </span>
                {currentItem.level && (
                  <span className="font-mono text-xs font-bold text-[#181614] bg-[#E9DCC2] px-2.5 py-0.5 border border-[#493B2D]">
                    {currentItem.level}
                  </span>
                )}
                {topicTag && (
                  <span className="font-mono text-xs font-bold uppercase text-[#51483D] bg-[#DCC9A8] px-2.5 py-0.5 border border-[#493B2D]">
                    {topicTag}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-sound="stamp"
                  onClick={handleToggleMastery}
                  className={`p-2 border-[1.5px] transition-all cursor-pointer ${
                    isMastered
                      ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#2E5A36]'
                      : 'bg-[#E9DCC2] border-[#181614] text-[#51483D] hover:border-[#2E5A36] hover:text-[#2E5A36]'
                  }`}
                  title={isMastered ? 'Bỏ đánh dấu đã thuộc' : 'Đánh dấu đã thuộc'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  data-sound="none"
                  data-speak-only="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentItem.word);
                  }}
                  className="p-2 bg-[#E9DCC2] border-[1.5px] border-[#181614] text-[#C92532] hover:bg-[#C92532] hover:text-[#F1E7D3] transition-colors cursor-pointer shadow-[2px_2px_0px_#181614]"
                  title="Nghe phát âm chuẩn"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card Center Content — Pure 19th-Century Archival Typographic Index Card */}
            <div className="my-auto py-8 sm:py-10 text-center">
              {!isFlipped ? (
                // FRONT FACE — Pure Archival Typographic Index Card
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 flex flex-col items-center justify-center"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#51483D]">
                    LEXICON ARCHIVE CARD #{currentIndex + 1}
                  </div>

                  <h2 className="text-4xl sm:text-5xl font-serif font-black text-[#181614] tracking-tight leading-none pt-1">
                    {currentItem.word}
                  </h2>

                  {currentItem.ipa && (
                    <p className="font-mono text-lg sm:text-xl font-semibold text-[#362E25]">
                      {currentItem.ipa}
                    </p>
                  )}

                  {/* Centered Editorial Crimson Divider Rule */}
                  <div className="w-16 border-b-2 border-[#C92532] mx-auto my-2" />

                  <div className="pt-2 inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E9DCC2] border border-[#493B2D] text-xs font-mono font-bold uppercase tracking-wider text-[#362E25]">
                    <RotateCw className="w-3.5 h-3.5 text-[#C92532]" />
                    <span>GÕ PHÍM CÁCH (SPACE) ĐỂ LẬT MẶT SAU</span>
                  </div>
                </motion.div>
              ) : (
                // BACK FACE — Pure Typographic Vietnamese Definition, Collocations & Editorial Example
                <div
                  className="text-left space-y-4"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <div className="border-b-2 border-[#181614] pb-3">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#C92532] mb-1">
                      ĐỊNH NGHĨA TIẾNG VIỆT CHUẨN HỌC THUẬT
                    </div>
                    <div className="text-2xl sm:text-3xl font-serif font-black text-[#181614] leading-snug">
                      {currentItem.meaning}
                    </div>
                  </div>

                  {currentItem.detailedNote && (
                    <div className="p-3 bg-[#DCC9A8] border-l-4 border-[#C92532] text-xs sm:text-sm text-[#181614] leading-relaxed">
                      <strong className="font-mono uppercase text-[10px] text-[#C92532] mr-1.5">[Ghi chú biên tập]:</strong>
                      {currentItem.detailedNote}
                    </div>
                  )}

                  {(() => {
                    const sixCollocations = getSixCollocationsForWord(currentItem);
                    const twoExamples = getTwoExamplesForWord(currentItem);
                    return (
                      <>
                        {sixCollocations.length > 0 && (
                          <div data-sound="none" onClick={(e) => e.stopPropagation()}>
                            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#362E25] mb-1.5">
                              COLLOCATIONS THÔNG DỤNG
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {sixCollocations.map((col, idx) => (
                                <span
                                  key={idx}
                                  data-sound="none"
                                  data-speak="true"
                                  data-speak-only="true"
                                  data-collocation="true"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakText(col);
                                  }}
                                  title="Bấm để nghe phát âm cụm từ tiếng Anh"
                                  className="collocation-tag text-xs font-mono font-bold bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] hover:text-[#C92532] px-2.5 py-1 border border-[#493B2D] hover:border-[#C92532] transition-colors cursor-pointer"
                                >
                                  ⚡ {col}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div
                          data-sound="none"
                          data-example="true"
                          onClick={(e) => e.stopPropagation()}
                          className="example-box p-3.5 bg-[#E9DCC2] border border-[#493B2D] text-xs sm:text-sm space-y-1"
                        >
                          <p
                            data-sound="none"
                            data-speak="true"
                            data-speak-only="true"
                            data-example="true"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(twoExamples.en1);
                            }}
                            title="Bấm để nghe phát âm câu ví dụ"
                            className="example-sentence text-sm sm:text-base font-serif italic font-bold text-[#181614] hover:text-[#C92532] transition-colors cursor-pointer"
                          >
                            “{twoExamples.en1}”
                          </p>
                          <p className="text-[#362E25]">
                            ↳ {twoExamples.vi1}
                          </p>
                          <p
                            data-sound="none"
                            data-speak="true"
                            data-speak-only="true"
                            data-example="true"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(twoExamples.en2);
                            }}
                            title="Bấm để nghe phát âm câu ví dụ"
                            className="example-sentence text-sm sm:text-base font-serif italic font-bold text-[#181614] hover:text-[#C92532] transition-colors cursor-pointer pt-1.5"
                          >
                            “{twoExamples.en2}”
                          </p>
                          <p className="text-[#362E25]">
                            ↳ {twoExamples.vi2}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Card Footer Bar */}
            <div
              className="pt-3 border-t border-[#493B2D] flex items-center justify-between text-xs font-mono text-[#51483D]"
              style={{ transform: isFlipped ? 'rotateY(180deg)' : 'none' }}
            >
              <span>PHÍM TẮT: [←] TRƯỚC • [→] TIẾP • [SPACE] LẬT THẺ</span>
              <span className="font-bold uppercase text-[#C92532]">
                {isFlipped ? 'MẶT SAU (NGHĨA & VÍ DỤ)' : 'MẶT TRƯỚC (TỪ VỰNG)'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Vintage Press Controls */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          data-sound="flip"
          onClick={handlePrev}
          className="px-5 py-2.5 btn-newspaper-secondary text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Thẻ Trước</span>
        </button>

        <button
          type="button"
          data-sound="stamp"
          onClick={handleToggleMastery}
          className={`px-5 py-2.5 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider border-[1.5px] rounded-[2px] transition-all flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#181614] ${
            isMastered
              ? 'bg-[#2E5A36] text-[#F1E7D3] border-[#181614]'
              : 'bg-[#F1E7D3] hover:bg-[#DCE6D5] text-[#181614] border-[#181614]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isMastered ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}</span>
        </button>

        <button
          type="button"
          data-sound="flip"
          onClick={handleNext}
          className="px-5 py-2.5 btn-newspaper-red text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
        >
          <span>Thẻ Tiếp</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
