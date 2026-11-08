import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Search, Volume2, 
  Lightbulb, RotateCcw,
  X, Check, ArrowRight,
  Undo2, Star, Shuffle, ChevronDown, BookOpen
} from 'lucide-react';
import { VOCAB_DATABASE, GRAMMAR_TIPS, VocabItem } from '../data/vocabularyData';
import {
  getOxford30AsVocabItems,
  resolveEnrichedWordEntry,
  getSixCollocationsForWord,
  getTwoExamplesForWord
} from '../data/academicLexiconEnrichment';
import {
  EXTRA_GRAMMAR_TIPS,
  getTwoGrammarExamplePairs
} from '../data/doubledWorkspaceData';
import { AcademicWordDetailModal } from './AcademicWordDetailModal';
import { getMasteredWordIds, toggleMasteredWord } from '../utils/storage';
import { speakWord } from '../utils/soundAndSpeech';
import { playTier4Stamp } from '../utils/soundManager';
import { useAnalytics } from '../context/AnalyticsContext';
import { TutorExplanationData } from './LiveAiTutorModal';
import { loadCustomContentStore, CUSTOM_CONTENT_EVENT } from '../services/customContentStore';
import { ENGRAVING_ASSETS, HorizonEngravingHeader } from '../constants/engravings';
import { shuffleArray } from '../utils/shuffle';

interface VocabDirectoryProps {
  onBack?: () => void;
  onMasteryChange?: () => void;
  onOpenTutor?: (data?: TutorExplanationData) => void;
  initialSearchQuery?: string;
}

export type DirectoryTab = 'unlearned' | 'mastered' | 'all' | 'grammar';

const INITIAL_BATCH_SIZE = 40;

const TOPICS = [
  { id: 'all', label: 'Tất cả chủ đề' },
  { id: 'oxford-c1-c2', label: '★ Đợt 1: 600+ Từ Học Thuật C1-C2 (AWL + Oxford + Pearson)' },
  { id: 'awl-sublist-1', label: '↳ AWL Sublist 1 (Coxhead - Tần suất cao nhất)' },
  { id: 'awl-sublist-2', label: '↳ AWL Sublist 2 (Coxhead - Học thuật cốt lõi)' },
  { id: 'awl-sublist-3-5', label: '↳ AWL Sublist 3-5 (Coxhead - Nghiên cứu & Chính sách)' },
  { id: 'oxford-5000-c1', label: '↳ Oxford 5000 (CEFR C1-C2 Trọng tâm)' },
  { id: 'pearson-acl', label: '↳ Pearson ACL (Academic Collocation List)' },
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

export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export const VocabDirectory: React.FC<VocabDirectoryProps> = ({
  onMasteryChange,
  onOpenTutor,
  initialSearchQuery = ''
}) => {
  const { recordLearningWord, wordProgressMap } = useAnalytics();
  const [activeTab, setActiveTab] = useState<DirectoryTab>('unlearned');
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchQuery);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH_SIZE);
  const [shuffleSeed, setShuffleSeed] = useState<number>(() => Date.now());
  const [masteredIds, setMasteredIds] = useState<string[]>(() => getMasteredWordIds());
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [customVocab, setCustomVocab] = useState<VocabItem[]>(() => loadCustomContentStore().customVocab);
  const [selectedDetailWord, setSelectedDetailWord] = useState<VocabItem | null>(null);

  useEffect(() => {
    if (initialSearchQuery !== undefined && initialSearchQuery.trim() !== '') {
      setSearchTerm(initialSearchQuery);
      setActiveTab('all');
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    const handleGlobalDictSearch = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string }>;
      if (customEvent.detail?.query !== undefined) {
        setSearchTerm(customEvent.detail.query);
        setActiveTab('all');
        setVisibleCount(INITIAL_BATCH_SIZE);
      }
    };
    window.addEventListener('open-vocab-directory-search', handleGlobalDictSearch);
    return () => window.removeEventListener('open-vocab-directory-search', handleGlobalDictSearch);
  }, []);

  useEffect(() => {
    const refreshCustom = () => {
      setCustomVocab(loadCustomContentStore().customVocab);
    };
    const refreshMasterySync = () => {
      setMasteredIds(getMasteredWordIds());
    };
    window.addEventListener(CUSTOM_CONTENT_EVENT, refreshCustom);
    window.addEventListener('master-english-word-progress-changed', refreshMasterySync);
    window.addEventListener('storage', refreshMasterySync);
    return () => {
      window.removeEventListener(CUSTOM_CONTENT_EVENT, refreshCustom);
      window.removeEventListener('master-english-word-progress-changed', refreshMasterySync);
      window.removeEventListener('storage', refreshMasterySync);
    };
  }, []);

  const allVocabDatabase = useMemo<VocabItem[]>(() => {
    const oxfordItems = getOxford30AsVocabItems();
    const oxfordByKey = new Map<string, VocabItem>(
      oxfordItems.map((ox) => [ox.word.toLowerCase().trim(), ox])
    );
    const seenWords = new Set<string>();
    const combined: VocabItem[] = [];

    for (const item of [...oxfordItems, ...customVocab, ...VOCAB_DATABASE]) {
      const key = item.word.toLowerCase().trim();
      if (!seenWords.has(key)) {
        seenWords.add(key);
        combined.push(item);
      } else {
        const matchedOx = oxfordByKey.get(key);
        if (matchedOx) {
          const existingIdx = combined.findIndex((c) => c.word.toLowerCase().trim() === key);
          if (existingIdx >= 0) {
            const mergedTags = Array.from(
              new Set([...(combined[existingIdx].tags || []), ...(matchedOx.tags || []), ...(item.tags || [])])
            );
            combined[existingIdx] = {
              ...combined[existingIdx],
              tags: mergedTags
            };
          }
        }
      }
    }
    return combined;
  }, [customVocab]);

  // Dynamic shuffled base order so opening Kho từ or clicking "Đổi bộ từ / Làm mới" shows fresh vocabulary
  const shuffledDatabase = useMemo<VocabItem[]>(() => {
    return shuffleArray([...allVocabDatabase]);
  }, [allVocabDatabase, shuffleSeed]);

  // Toast feedback state when marking a word
  const [toast, setToast] = useState<{
    id: string;
    word: string;
    action: 'mastered' | 'unlearned';
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handlePlayWord = (word: string) => {
    setPlayingWord(word);
    speakWord(word);
    setTimeout(() => {
      setPlayingWord((curr) => (curr === word ? null : curr));
    }, 1200);
  };

  const handleToggle = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    playTier4Stamp();
    const isCurrentlyMastered = masteredIds.includes(id);
    const targetWord = allVocabDatabase.find(item => item.id === id);

    toggleMasteredWord(id);
    const updated = getMasteredWordIds();
    setMasteredIds(updated);
    onMasteryChange?.();

    if (targetWord) {
      recordLearningWord(
        id,
        targetWord.word,
        isCurrentlyMastered ? 'unmastered' : 'mastered',
        'Kho từ',
        { ipa: targetWord.ipa, meaning: targetWord.meaning, level: targetWord.level }
      );
    }

    if (!isCurrentlyMastered) {
      try {
        confetti({
          particleCount: 30,
          spread: 55,
          origin: { y: 0.65 }
        });
      } catch {}

      setToast({
        id,
        word: targetWord?.word || 'Từ vựng',
        action: 'mastered'
      });
    } else {
      setToast({
        id,
        word: targetWord?.word || 'Từ vựng',
        action: 'unlearned'
      });
    }
  };

  const handleUndoToast = () => {
    if (!toast) return;
    toggleMasteredWord(toast.id);
    setMasteredIds(getMasteredWordIds());
    onMasteryChange?.();
    setToast(null);
  };

  const masteredCount = useMemo(() => {
    const masteredSet = new Set(masteredIds);
    return allVocabDatabase.reduce((acc, item) => (masteredSet.has(item.id) ? acc + 1 : acc), 0);
  }, [masteredIds, allVocabDatabase]);

  // Filter words across the ENTIRE ~4,000-word store with accent-insensitive + case-insensitive matching
  const filteredWords = useMemo(() => {
    const rawTerm = searchTerm.trim().toLowerCase();
    const normalizedTerm = removeVietnameseTones(rawTerm);
    const masteredSet = new Set(masteredIds);

    // When searching, search across the full database and rank exact/prefix matches first;
    // when browsing, use the dynamically shuffled order so page 1 is never fixed.
    const sourceList = rawTerm ? allVocabDatabase : shuffledDatabase;

    const matched = sourceList.filter(item => {
      const isMastered = masteredSet.has(item.id);

      // Status filtering based on active tab (unless user is actively typing a search query)
      if (!rawTerm) {
        if (activeTab === 'unlearned' && isMastered) return false;
        if (activeTab === 'mastered' && !isMastered) return false;
      } else {
        if (activeTab === 'mastered' && !isMastered) return false;
        if (activeTab === 'unlearned' && isMastered) return false;
      }

      // POS matching
      if (selectedPos !== 'all' && item.pos !== selectedPos) return false;

      // Level matching
      if (selectedLevel !== 'all' && item.level !== selectedLevel) return false;

      // Topic matching
      if (selectedTopic !== 'all' && (!item.tags || !item.tags.includes(selectedTopic))) return false;

      // Search matching across word, ipa, meaning (with & without tones), and collocations
      if (!rawTerm) return true;

      const wordLower = item.word.toLowerCase();
      if (wordLower.includes(rawTerm) || removeVietnameseTones(wordLower).includes(normalizedTerm)) {
        return true;
      }

      if (item.ipa && item.ipa.toLowerCase().includes(rawTerm)) {
        return true;
      }

      const meaningLower = item.meaning.toLowerCase();
      if (
        meaningLower.includes(rawTerm) ||
        removeVietnameseTones(meaningLower).includes(normalizedTerm)
      ) {
        return true;
      }

      if (
        item.collocations &&
        item.collocations.some(c => {
          const cLower = c.toLowerCase();
          return cLower.includes(rawTerm) || removeVietnameseTones(cLower).includes(normalizedTerm);
        })
      ) {
        return true;
      }

      return false;
    });

    if (!rawTerm) return matched;

    // Prioritize exact word match -> startsWith word match -> meaning match -> collocation match
    return [...matched].sort((a, b) => {
      const aWord = a.word.toLowerCase();
      const bWord = b.word.toLowerCase();
      if (aWord === rawTerm && bWord !== rawTerm) return -1;
      if (bWord === rawTerm && aWord !== rawTerm) return 1;
      if (aWord.startsWith(rawTerm) && !bWord.startsWith(rawTerm)) return -1;
      if (bWord.startsWith(rawTerm) && !aWord.startsWith(rawTerm)) return 1;
      return 0;
    });
  }, [searchTerm, selectedPos, selectedLevel, selectedTopic, activeTab, masteredIds, allVocabDatabase, shuffledDatabase]);

  // Reset visible count whenever filters or tab changes
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [searchTerm, selectedPos, selectedLevel, selectedTopic, activeTab, shuffleSeed]);

  const visibleWords = useMemo(() => {
    return filteredWords.slice(0, visibleCount);
  }, [filteredWords, visibleCount]);

  const handleShuffleWords = useCallback(() => {
    setShuffleSeed(Date.now() + Math.random());
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, []);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedTopic('all');
    setSelectedPos('all');
    setSelectedLevel('all');
    setShuffleSeed(Date.now() + Math.random());
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  const totalVocab = allVocabDatabase.length;
  const unlearnedCount = Math.max(0, totalVocab - masteredCount);

  return (
    <div className="w-full min-w-0 space-y-6 pb-12 relative">
      {/* Toast Feedback Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 right-4 z-50 bg-[#181614] text-[#F1E7D3] px-4 py-3 rounded-[5px] shadow-[3px_3px_0px_#C92532] border-2 border-[#493B2D] flex items-center gap-3 text-xs sm:text-sm max-w-md"
          >
            <div className={`w-7 h-7 rounded-[4px] flex items-center justify-center shrink-0 ${
              toast.action === 'mastered' ? 'bg-[#2E6F40] text-[#F1E7D3]' : 'bg-[#C92532] text-[#F1E7D3]'
            }`}>
              {toast.action === 'mastered' ? <Check className="w-4 h-4" /> : <Undo2 className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {toast.action === 'mastered' ? (
                  <>Đã chuyển <span className="font-bold text-[#E8B7AC]">"{toast.word}"</span> vào mục Đã Thuộc!</>
                ) : (
                  <>Đã chuyển <span className="font-bold text-[#E8B7AC]">"{toast.word}"</span> về mục Cần Học.</>
                )}
              </p>
              {toast.action === 'mastered' && activeTab === 'unlearned' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('mastered');
                    setToast(null);
                  }}
                  className="text-[11px] text-[#DCC9A8] hover:underline mt-0.5 font-medium inline-flex items-center gap-1"
                >
                  <span>Xem mục Từ Đã Thuộc</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleUndoToast}
              className="px-2.5 py-1 text-xs font-bold bg-[#51483D] hover:bg-[#C92532] text-[#F1E7D3] rounded-[4px] transition-colors cursor-pointer shrink-0"
              title="Hoàn tác thao tác vừa rồi"
            >
              Hoàn tác
            </button>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-[#DCC9A8] hover:text-[#F1E7D3] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          1. ARCHETYPE A HEADER ("TỔNG KHO TƯ LIỆU" + CHÙA MỘT CỘT ENGRAVING)
         ===================================================================== */}
      <HorizonEngravingHeader
        engravingSrc={ENGRAVING_ASSETS.architecture.onePillarPagoda}
        engravingAlt="One Pillar Pagoda (Chùa Một Cột) 19th-Century Engraving"
        figLabel="FIG. III — CHÙA MỘT CỘT, ĐÔNG KINH"
        imageWidthClass="w-[46%] sm:w-[44%]"
        timerPageId="tong_kho"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#181614] text-[#F1E7D3]">
              ENCYCLOPEDIC ARCHIVE
            </span>
            <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-[#C92532] text-[#F1E7D3] border border-[#181614]">
              TỔNG KHO TƯ LIỆU
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-4xl leading-tight tracking-tight uppercase text-[#181614]">
            TỔNG KHO TƯ LIỆU &amp; TRA CỨU BÁCH KHOA
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-[#51483D]">
            "Hệ thống tra cứu toàn diện định nghĩa, phiên âm, ngữ cảnh và hồ sơ từ vựng."
          </p>
        </div>
      </HorizonEngravingHeader>

      {/* =====================================================================
          2. VINTAGE SEARCH BAR + 3 FILTER DROPDOWNS + CATEGORY TABS
         ===================================================================== */}
      <div className="space-y-3 pt-1">
        {activeTab !== 'grammar' && (
          <>
            {/* Full-Width Vintage Search Bar across ~4,000 words */}
            <div className="flex items-stretch w-full rounded-[6px] border-2 border-[#493B2D] bg-[#F1E7D3] overflow-hidden shadow-[2px_3px_0px_rgba(24,22,20,0.18)]">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-[#181614] ml-4 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm kiếm trong kho ~4.000 từ (từ tiếng Anh, nghĩa tiếng Việt, collocations)..."
                  value={searchTerm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchTerm(val);
                    // When user searches, automatically search across all words if in unlearned/mastered and no match
                  }}
                  className="w-full px-3.5 py-3 bg-transparent text-sm font-dm text-[#181614] placeholder-[#51483D] focus:outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="mr-2 p-1 text-[#51483D] hover:text-[#C92532] cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (searchTerm.trim()) {
                    setActiveTab('all');
                  }
                  setVisibleCount(INITIAL_BATCH_SIZE);
                }}
                className="px-6 sm:px-8 bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] font-dm font-extrabold text-sm sm:text-base border-l-2 border-[#493B2D] transition-colors cursor-pointer shrink-0"
                style={{ backgroundImage: 'var(--grain)' }}
              >
                Tìm kiếm
              </button>
            </div>

            {/* 3 Equal Vintage Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                aria-label="Lọc theo chủ đề IELTS"
                className="input-newspaper h-11 px-4 py-2 text-xs sm:text-sm font-dm font-bold cursor-pointer shadow-[2px_2px_0px_rgba(24,22,20,0.12)]"
              >
                {TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedPos}
                onChange={(e) => setSelectedPos(e.target.value)}
                aria-label="Lọc theo loại từ"
                className="input-newspaper h-11 px-4 py-2 text-xs sm:text-sm font-dm font-bold cursor-pointer shadow-[2px_2px_0px_rgba(24,22,20,0.12)]"
              >
                <option value="all">Mọi loại từ</option>
                <option value="noun">Danh từ (Noun)</option>
                <option value="verb">Động từ (Verb)</option>
                <option value="adj">Tính từ (Adj)</option>
                <option value="adv">Trạng từ (Adv)</option>
                <option value="phrase">Cụm từ (Phrase)</option>
                <option value="idiom">Thành ngữ (Idiom)</option>
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                aria-label="Lọc theo trình độ"
                className="input-newspaper h-11 px-4 py-2 text-xs sm:text-sm font-dm font-bold cursor-pointer shadow-[2px_2px_0px_rgba(24,22,20,0.12)]"
              >
                <option value="all">Mọi trình độ (B1 - C2)</option>
                <option value="B1">Band B1</option>
                <option value="B2">Band B2 (IELTS 5.5 - 6.5)</option>
                <option value="C1">Band C1 (IELTS 7.0+)</option>
                <option value="C2">Band C2 (IELTS 8.0+)</option>
              </select>
            </div>
          </>
        )}

        {/* Newspaper Sub-Toolbar: 4 Tabs + Dynamic Shuffle Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-b border-[#493B2D]/40 pb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('unlearned')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-oswald uppercase tracking-wider font-bold border cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'unlearned'
                  ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] shadow-[2px_2px_0px_#181614]'
                  : 'bg-[#F1E7D3] text-[#181614] border-[#493B2D] hover:bg-[#DCC9A8]'
              }`}
            >
              <span>Cần Học</span>
              <span className="font-mono text-[10px] opacity-90">
                ({unlearnedCount.toLocaleString('vi-VN')})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mastered')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-oswald uppercase tracking-wider font-bold border cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'mastered'
                  ? 'bg-[#181614] text-[#F1E7D3] border-[#181614] shadow-[2px_2px_0px_#C92532]'
                  : 'bg-[#F1E7D3] text-[#181614] border-[#493B2D] hover:bg-[#DCC9A8]'
              }`}
            >
              <span>Đã Thuộc</span>
              <span className="font-mono text-[10px] opacity-90">
                ({masteredCount.toLocaleString('vi-VN')})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-oswald uppercase tracking-wider font-bold border cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] shadow-[2px_2px_0px_#181614]'
                  : 'bg-[#F1E7D3] text-[#181614] border-[#493B2D] hover:bg-[#DCC9A8]'
              }`}
            >
              <span>Toàn Bộ</span>
              <span className="font-mono text-[10px] opacity-90">
                ({totalVocab.toLocaleString('vi-VN')})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('grammar')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-oswald uppercase tracking-wider font-bold border cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'grammar'
                  ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] shadow-[2px_2px_0px_#181614]'
                  : 'bg-[#F1E7D3] text-[#181614] border-[#493B2D] hover:bg-[#DCC9A8]'
              }`}
            >
              <span>Ngữ Pháp</span>
              <span className="font-mono text-[10px] opacity-90">({GRAMMAR_TIPS.length + EXTRA_GRAMMAR_TIPS.length})</span>
            </button>
          </div>

          {activeTab !== 'grammar' && (
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-dm text-[#51483D]">
              {(searchTerm ||
                selectedTopic !== 'all' ||
                selectedPos !== 'all' ||
                selectedLevel !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[#C92532] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Đặt lại lọc</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleShuffleWords}
                className="px-3 py-1.5 rounded-[4px] bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border border-[#493B2D] font-dm font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-[1px_1px_0px_#181614]"
                title="Xáo trộn ngẫu nhiên bộ từ hiển thị từ kho ~4.000 từ"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#C92532]" />
                <span>Đổi bộ từ / Làm mới</span>
              </button>

              <span>
                Đang hiện <strong className="text-[#181614]">{visibleWords.length.toLocaleString('vi-VN')}</strong> /{' '}
                <strong className="text-[#181614]">{filteredWords.length.toLocaleString('vi-VN')}</strong> từ
              </span>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          3. TWO-COLUMN VINTAGE NEWSPAPER VOCABULARY CARDS
         ===================================================================== */}
      {activeTab !== 'grammar' && (
        <div className="space-y-4">
          {filteredWords.length === 0 ? (
            <div className="newspaper-card p-10 text-center space-y-3">
              <h3 className="font-oswald font-bold text-lg uppercase text-[#181614]">
                {activeTab === 'mastered' && masteredCount === 0
                  ? 'Chưa có từ vựng nào trong mục Đã Thuộc'
                  : 'Không tìm thấy từ vựng phù hợp trong mục đang chọn'}
              </h3>
              <p className="text-xs font-dm text-[#51483D] max-w-md mx-auto">
                {searchTerm && activeTab !== 'all'
                  ? 'Từ bạn tìm có thể nằm ở mục Toàn Bộ (bao gồm cả từ đã thuộc và cần học).'
                  : 'Hãy thử từ khóa khác hoặc bấm xóa bộ lọc để xem toàn bộ kho từ.'}
              </p>
              <div className="flex items-center justify-center gap-2">
                {searchTerm && activeTab !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className="btn-newspaper-red px-5 py-2 text-xs inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Tìm trong Toàn Bộ ({totalVocab.toLocaleString('vi-VN')} từ)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={
                    activeTab === 'mastered' && masteredCount === 0
                      ? () => setActiveTab('unlearned')
                      : handleResetFilters
                  }
                  className="btn-newspaper-secondary px-5 py-2 text-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {activeTab === 'mastered' && masteredCount === 0
                      ? 'Xem danh sách Cần Học'
                      : 'Xóa tất cả bộ lọc'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
                <AnimatePresence mode="popLayout">
                  {visibleWords.map((item, index) => {
                    const isMastered = masteredIds.includes(item.id);
                    const srsStatus = wordProgressMap[item.id]?.status;
                    const isReviewing = !isMastered && (srsStatus === 'learning' || srsStatus === 'reviewing');
                    const isPlaying = playingWord === item.word;
                    const topicTag = (item.tags && item.tags[0]) || 'Academic';
                    const displayIndex = index + 1;
                    const memoryNote =
                      item.detailedNote ||
                      `Chỉ sắc thái học thuật trọng tâm: "${item.word}" (${item.meaning.split(',')[0].toLowerCase()}).`;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
                        className="newspaper-card p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:border-[#C92532] transition-colors"
                      >
                        <div className="space-y-2.5">
                          {/* Row 1: Natural Index + Bold Headword + IPA Box + Right Action Buttons */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-baseline gap-2.5 flex-wrap min-w-0">
                              <span className="font-mono font-bold text-sm text-[#51483D]">
                                {displayIndex}.
                              </span>
                              <button
                                type="button"
                                onClick={() => handlePlayWord(item.word)}
                                className="font-dm font-black text-2xl sm:text-[26px] text-[#181614] hover:text-[#C92532] transition-colors cursor-pointer text-left leading-none"
                                title="Bấm để nghe phát âm"
                              >
                                {item.word}
                              </button>
                              {item.ipa && (
                                <span className="px-2.5 py-0.5 rounded-[4px] bg-[#E9DCC2] border border-[#493B2D]/50 font-mono text-xs text-[#51483D]">
                                  {item.ipa}
                                </span>
                              )}
                            </div>

                            {/* Top-Right 3 Vintage Action Buttons: Audio, Star (Mastered), AI */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handlePlayWord(item.word)}
                                className={`w-8 h-8 rounded-[6px] border flex items-center justify-center cursor-pointer ${
                                  isPlaying
                                    ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] audio-playing'
                                    : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border-[#493B2D]'
                                }`}
                                title="Nghe phát âm"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleToggle(item.id, e)}
                                className={`w-8 h-8 rounded-[6px] border flex items-center justify-center cursor-pointer ${
                                  isMastered
                                    ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                                    : 'bg-[#F1E7D3] hover:bg-[#E8B7AC]/60 text-[#C92532] border-[#C92532]'
                                }`}
                                title={isMastered ? 'Đã thuộc (Bấm để hoàn tác)' : 'Đánh dấu Đã thuộc'}
                              >
                                <Star className={`w-4 h-4 ${isMastered ? 'fill-[#F1E7D3]' : ''}`} />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (onOpenTutor) {
                                    onOpenTutor({
                                      title: `Phân tích chuyên sâu: ${item.word}`,
                                      word1: item.word,
                                      ipa: item.ipa,
                                      meaning: item.meaning,
                                      nuanceExplanation: memoryNote,
                                      writingExample:
                                        item.exampleEn ||
                                        `Researchers highlighted the significance of ${item.word} in contemporary studies.`,
                                      speakingExample:
                                        item.collocations?.[0] ||
                                        `From my perspective, ${item.word} is a key aspect of this issue.`,
                                      commonMistake:
                                        'Lưu ý kết hợp đúng Collocation và từ loại trong câu học thuật.',
                                      examTip: `Sử dụng cụm "${item.collocations?.[0] || item.word}" để nâng điểm tiêu chí Lexical Resource lên Band 7.0+.`
                                    });
                                  } else {
                                    window.dispatchEvent(
                                      new CustomEvent('open-ai-tutor-word', {
                                        detail: { word: item.word }
                                      })
                                    );
                                  }
                                }}
                                className="px-2.5 h-8 rounded-[6px] bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border border-[#181614] font-mono font-bold text-[11px] flex items-center justify-center cursor-pointer"
                                title="Hỏi Giáo sư Mèo về từ này"
                              >
                                <span>{isMastered ? '✓' : 'AI'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Row 2: POS, Level, Corpus Source, Topic & SRS Status Chips */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-[4px] bg-[#E8B7AC]/65 border border-[#C92532] text-[#C92532] text-[11px] font-mono font-bold lowercase">
                              {item.pos}
                            </span>
                            {item.level && (
                              <span className="px-2 py-0.5 rounded-[4px] bg-[#E9DCC2] border border-[#493B2D]/60 text-[#51483D] text-[11px] font-mono font-bold">
                                {item.level}
                              </span>
                            )}
                            {resolveEnrichedWordEntry(item).source_corpus && (
                              <span className="px-2 py-0.5 rounded-[4px] bg-[#181614] text-[#F1E7D3] border border-[#C92532] text-[10px] font-mono font-bold">
                                ★ {resolveEnrichedWordEntry(item).source_corpus}
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-[4px] bg-[#E9DCC2] border border-[#493B2D]/60 text-[#51483D] text-[11px] font-dm font-semibold capitalize">
                              {topicTag}
                            </span>
                            {isMastered && (
                              <span className="px-2 py-0.5 rounded-[4px] bg-[#181614] text-[#F1E7D3] text-[10px] font-dm font-bold">
                                Đã thuộc
                              </span>
                            )}
                            {isReviewing && (
                              <span className="px-2 py-0.5 rounded-[4px] bg-[#DCC9A8] border border-[#493B2D] text-[#181614] text-[10px] font-dm font-bold">
                                Đang ôn SRS
                              </span>
                            )}
                          </div>

                          {/* Row 3: Bold Vietnamese Meaning */}
                          <p className="font-dm font-extrabold text-[15px] text-[#181614] leading-snug">
                            {item.meaning}
                          </p>

                          {/* Row 4: Red Left-Bordered Memory Box */}
                          <div className="p-2.5 rounded-[4px] bg-[#E9DCC2]/90 border border-[#493B2D]/40 border-l-4 border-l-[#C92532] text-xs font-dm text-[#181614] flex items-start gap-1.5">
                            <span className="text-[#C92532] font-bold shrink-0">⚡</span>
                            <span className="leading-relaxed">
                              <strong className="text-[#C92532]">Ghi nhớ nhanh:</strong> {memoryNote}
                            </span>
                          </div>

                          {/* Row 5: Collocations Chips (6 Academic Collocations) */}
                          {(() => {
                            const sixCollocations = getSixCollocationsForWord(item);
                            return (
                              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                <span className="text-xs font-dm font-extrabold text-[#181614]">
                                  Collocations:
                                </span>
                                {sixCollocations.map((c, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    data-sound="none"
                                    data-speak="true"
                                    data-speak-only="true"
                                    data-collocation="true"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakWord(c);
                                    }}
                                    className="collocation-tag inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-[#E9DCC2] hover:bg-[#E8B7AC]/60 border border-[#C92532]/60 text-xs font-dm font-bold text-[#991D27] cursor-pointer transition-colors"
                                    title="Bấm để nghe phát âm cụm từ tiếng Anh"
                                  >
                                    <span className="text-[#C92532]">⚡</span>
                                    <span>{c}</span>
                                  </button>
                                ))}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Row 6: 2 Italic English Examples + Sentence Audio + Oxford Dossier Button */}
                        <div className="pt-2 border-t border-[#493B2D]/25 space-y-2 text-xs">
                          {(() => {
                            const twoEx = getTwoExamplesForWord(item);
                            return (
                              <div data-sound="none" data-example="true" className="example-box space-y-1.5">
                                <div className="space-y-0.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <p
                                      data-sound="none"
                                      data-speak="true"
                                      data-speak-only="true"
                                      data-example="true"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        speakWord(twoEx.en1);
                                      }}
                                      title="Bấm để nghe phát âm câu ví dụ"
                                      className="example-sentence font-serif italic font-bold text-[13px] text-[#181614] hover:text-[#C92532] leading-relaxed cursor-pointer transition-colors"
                                    >
                                      “{twoEx.en1}”
                                    </p>
                                    <button
                                      type="button"
                                      data-sound="none"
                                      data-speak="true"
                                      data-speak-only="true"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        speakWord(twoEx.en1);
                                      }}
                                      className="p-1 rounded-[3px] bg-[#E9DCC2] hover:bg-[#DCC9A8] border border-[#493B2D]/60 text-[#C92532] shrink-0 cursor-pointer"
                                      title="Nghe phát âm cả câu ví dụ"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="font-dm text-[#51483D] flex items-start gap-1.5">
                                    <span className="text-[#C92532] font-bold">↳</span>
                                    <span>{twoEx.vi1}</span>
                                  </p>
                                </div>

                                <div className="space-y-0.5 pt-1 border-t border-dashed border-[#493B2D]/25">
                                  <div className="flex items-start justify-between gap-2">
                                    <p
                                      data-sound="none"
                                      data-speak="true"
                                      data-speak-only="true"
                                      data-example="true"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        speakWord(twoEx.en2);
                                      }}
                                      title="Bấm để nghe phát âm câu ví dụ 2"
                                      className="example-sentence font-serif italic font-bold text-[13px] text-[#181614] hover:text-[#C92532] leading-relaxed cursor-pointer transition-colors"
                                    >
                                      “{twoEx.en2}”
                                    </p>
                                    <button
                                      type="button"
                                      data-sound="none"
                                      data-speak="true"
                                      data-speak-only="true"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        speakWord(twoEx.en2);
                                      }}
                                      className="p-1 rounded-[3px] bg-[#E9DCC2] hover:bg-[#DCC9A8] border border-[#493B2D]/60 text-[#C92532] shrink-0 cursor-pointer"
                                      title="Nghe phát âm cả câu ví dụ 2"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="font-dm text-[#51483D] flex items-start gap-1.5">
                                    <span className="text-[#C92532] font-bold">↳</span>
                                    <span>{twoEx.vi2}</span>
                                  </p>
                                </div>
                              </div>
                            );
                          })()}

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <span className="text-[11px] font-mono text-[#51483D] truncate">
                              Lexical Upgrade: <strong className="text-[#C92532]">{resolveEnrichedWordEntry(item).upgrade_from} → {item.word}</strong>
                            </span>
                            <button
                              type="button"
                              data-sound="sub"
                              onClick={() => setSelectedDetailWord(item)}
                              className="px-2.5 py-1 rounded-[3px] bg-[#181614] hover:bg-[#C92532] text-[#F1E7D3] font-oswald text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>Hồ sơ Oxford (3 ngữ cảnh)</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Load More & Dynamic Shuffle Footer (Replaces Numbered Pagination 1, 2, 3, 4) */}
              <div className="newspaper-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-dm text-[#51483D]">
                  Đang hiển thị{' '}
                  <strong className="text-[#181614]">
                    {visibleWords.length.toLocaleString('vi-VN')}
                  </strong>{' '}
                  trên tổng số{' '}
                  <strong className="text-[#181614]">
                    {filteredWords.length.toLocaleString('vi-VN')}
                  </strong>{' '}
                  từ vựng
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    data-sound="major"
                    onClick={handleShuffleWords}
                    className="btn-newspaper-secondary px-4 py-2 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-[#C92532]" />
                    <span>Đổi bộ từ ngẫu nhiên</span>
                  </button>

                  {visibleCount < filteredWords.length && (
                    <button
                      type="button"
                      data-sound="major"
                      onClick={() => setVisibleCount(prev => prev + INITIAL_BATCH_SIZE)}
                      className="btn-newspaper-red px-5 py-2 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <ChevronDown className="w-4 h-4" />
                      <span>Tải thêm từ vựng (+{Math.min(INITIAL_BATCH_SIZE, filteredWords.length - visibleCount)} từ)</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab: Grammar View */}
      {activeTab === 'grammar' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[...GRAMMAR_TIPS, ...EXTRA_GRAMMAR_TIPS].map((tip, idx) => {
            const pairs = getTwoGrammarExamplePairs(tip);
            return (
              <div key={idx} className="newspaper-card p-5 space-y-3">
                <div className="flex items-center gap-2.5 border-b border-[#493B2D]/30 pb-2">
                  <div className="w-8 h-8 rounded-[4px] bg-[#C92532] text-[#F1E7D3] border border-[#181614] flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#181614]">
                    {tip.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm font-dm text-[#51483D] leading-relaxed">
                  {tip.rule}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div data-sound="none" className="example-box p-3 bg-[#E8B7AC]/50 border border-[#C92532] rounded-[4px] space-y-1">
                    <span className="font-bold text-[#991D27] block">❌ Lỗi sai phổ biến:</span>
                    <p
                      data-sound="none"
                      data-speak="true"
                      data-speak-only="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(pairs.wrong1);
                      }}
                      title="Bấm để nghe phát âm câu tiếng Anh"
                      className="example-sentence text-[#181614] hover:text-[#C92532] italic font-mono cursor-pointer transition-colors"
                    >
                      {pairs.wrong1}
                    </p>
                    <p
                      data-sound="none"
                      data-speak="true"
                      data-speak-only="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(pairs.wrong2);
                      }}
                      title="Bấm để nghe phát âm câu tiếng Anh"
                      className="example-sentence text-[#181614] hover:text-[#C92532] italic font-mono pt-1 border-t border-[#C92532]/30 cursor-pointer transition-colors"
                    >
                      {pairs.wrong2}
                    </p>
                  </div>

                  <div data-sound="none" className="example-box p-3 bg-[#E9DCC2] border border-[#493B2D] rounded-[4px] space-y-1">
                    <span className="font-bold text-[#1E5E3A] block">✅ Cách dùng chuẩn xác:</span>
                    <p
                      data-sound="none"
                      data-speak="true"
                      data-speak-only="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(pairs.correct1);
                      }}
                      title="Bấm để nghe phát âm câu tiếng Anh chuẩn"
                      className="example-sentence text-[#181614] hover:text-[#C92532] font-mono cursor-pointer transition-colors"
                    >
                      {pairs.correct1}
                    </p>
                    <p
                      data-sound="none"
                      data-speak="true"
                      data-speak-only="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(pairs.correct2);
                      }}
                      title="Bấm để nghe phát âm câu tiếng Anh chuẩn"
                      className="example-sentence text-[#181614] hover:text-[#C92532] font-mono pt-1 border-t border-[#493B2D]/30 cursor-pointer transition-colors"
                    >
                      {pairs.correct2}
                    </p>
                  </div>
                </div>

                <div className="text-xs p-2.5 bg-[#DCC9A8] border-l-4 border-l-[#C92532] text-[#181614] rounded-r-[4px]">
                  <strong className="text-[#C92532] font-bold">⚡ Ghi nhớ:</strong> {tip.takeaway}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Oxford / Cambridge Academic Word Detail Modal */}
      <AcademicWordDetailModal
        item={selectedDetailWord}
        isOpen={Boolean(selectedDetailWord)}
        onClose={() => setSelectedDetailWord(null)}
        isMastered={selectedDetailWord ? masteredIds.includes(selectedDetailWord.id) : false}
        onToggleMastered={(id, e) => handleToggle(id, e)}
        onOpenAiTutor={(entry) => {
          setSelectedDetailWord(null);
          if (onOpenTutor) {
            onOpenTutor({
              title: `Phân tích chuyên sâu: ${entry.word}`,
              word1: entry.word,
              ipa: `${entry.ipa_uk} | ${entry.ipa_us}`,
              meaning: entry.core_meaning_vi,
              nuanceExplanation: `${entry.feynman_explanation} (${entry.academic_nuance.usage_note})`,
              writingExample: entry.examples[1]?.sentence_en || entry.examples[0]?.sentence_en,
              speakingExample: entry.examples[0]?.sentence_en,
              commonMistake: `Nâng cấp từ: ${entry.upgrade_from} → ${entry.current_word}`,
              examTip: entry.academic_nuance.exam_application
            });
          } else {
            window.dispatchEvent(
              new CustomEvent('open-ai-tutor-word', {
                detail: { word: entry.word }
              })
            );
          }
        }}
      />
    </div>
  );
};
