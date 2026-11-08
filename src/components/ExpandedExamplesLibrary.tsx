import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Search,
  Bookmark,
  CheckCircle2,
  Volume2,
  Lightbulb,
  AlertTriangle,
  PenTool,
  Trash2,
  FileText,
  SlidersHorizontal,
  BookOpen,
  Undo2,
  Check,
  X,
  ArrowLeft,
} from 'lucide-react';
import {
  EXPANDED_PDF_KNOWLEDGE_LIBRARY,
  CATEGORY_METADATA,
  PDF_SOURCE_METADATA,
  PdfKnowledgeRecord,
} from '../data/expandedPdfLibraryData';
import { VSTEP_PDF_AS_KNOWLEDGE_RECORDS } from '../data/vstepPdfKnowledgeBankData';
import { enrichPdfStructureWithDoubledContent } from '../data/doubledWorkspaceData';
import { ENGRAVING_ASSETS, HorizonEngravingHeader } from '../constants/engravings';
import { speakWord } from '../utils/soundAndSpeech';
import { playTier4Stamp } from '../utils/soundManager';
import { dataRepository } from '../services/dataRepository';
import { loadCustomContentStore, CUSTOM_CONTENT_EVENT } from '../services/customContentStore';
import { ContentImporterModal } from './ContentImporterModal';
import { AdminGuard } from './AdminGuard';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from './VintageNewspaperIllustrations';

interface UserSentenceNote {
  id: string;
  structureId: string;
  sentence: string;
  createdAt: string;
}

const STORAGE_KEY_SAVED = 'master_english_pdf_lib_saved_v1';
const STORAGE_KEY_LEARNED = 'master_english_pdf_lib_learned_v2';
const STORAGE_KEY_ACTIVE = 'master_english_pdf_lib_active_v2';
const STORAGE_KEY_NOTES = 'master_english_pdf_lib_notes_v1';

interface ExpandedExamplesLibraryProps {
  onBackToDashboard?: () => void;
  onBackToMain?: () => void;
  initialPdfItemNumber?: number | null;
}

export const ExpandedExamplesLibrary: React.FC<ExpandedExamplesLibraryProps> = ({
  onBackToDashboard,
  onBackToMain,
  initialPdfItemNumber,
}) => {
  const handleBack = onBackToDashboard || onBackToMain;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedPageFilter, setSelectedPageFilter] = useState<string>('ALL');
  const [filterMode, setFilterMode] = useState<'UNLEARNED' | 'LEARNED' | 'SAVED' | 'ALL'>('UNLEARNED');
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  const [customStructures, setCustomStructures] = useState<PdfKnowledgeRecord[]>(() =>
    loadCustomContentStore().customStructures
  );

  useEffect(() => {
    const refreshCustom = () => {
      setCustomStructures(loadCustomContentStore().customStructures);
    };
    window.addEventListener(CUSTOM_CONTENT_EVENT, refreshCustom);
    return () => window.removeEventListener(CUSTOM_CONTENT_EVENT, refreshCustom);
  }, []);

  const allStructures = useMemo(
    () =>
      [...EXPANDED_PDF_KNOWLEDGE_LIBRARY, ...VSTEP_PDF_AS_KNOWLEDGE_RECORDS, ...customStructures].map(
        enrichPdfStructureWithDoubledContent
      ),
    [customStructures]
  );

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVED);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [learnedIds, setLearnedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LEARNED);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [userNotes, setUserNotes] = useState<UserSentenceNote[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NOTES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [activeStructureId, setActiveStructureId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (savedActive && EXPANDED_PDF_KNOWLEDGE_LIBRARY.some((s) => s.id === savedActive)) {
        return savedActive;
      }
    } catch {
      // ignore storage errors
    }
    return EXPANDED_PDF_KNOWLEDGE_LIBRARY[0]?.id || 'pdf-item-1';
  });

  const [activeDetailTab, setActiveDetailTab] = useState<
    'overview' | 'examples' | 'transform' | 'practice'
  >('overview');

  const [toast, setToast] = useState<{
    id: string;
    pdfItemNumber: number;
    formula: string;
    action: 'mastered' | 'unlearned';
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const [selectedMcqOption, setSelectedMcqOption] = useState<number | null>(null);
  const [showMcqResult, setShowMcqResult] = useState(false);
  const [rewriteInput, setRewriteInput] = useState('');
  const [showRewriteModel, setShowRewriteModel] = useState(false);

  const [customSentenceInput, setCustomSentenceInput] = useState('');
  const [noteValidationError, setNoteValidationError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedIds));
      void dataRepository.syncPdfStructuresState();
    } catch {
      // ignore storage errors
    }
  }, [savedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LEARNED, JSON.stringify(learnedIds));
      void dataRepository.syncPdfStructuresState();
    } catch {
      // ignore storage errors
    }
  }, [learnedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeStructureId);
      void dataRepository.syncPdfStructuresState();
    } catch {
      // ignore storage errors
    }
  }, [activeStructureId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(userNotes));
      void dataRepository.syncPdfStructuresState();
    } catch {
      // ignore storage errors
    }
  }, [userNotes]);

  useEffect(() => {
    const handleStorageOrCloudSync = () => {
      try {
        const rawSaved = localStorage.getItem(STORAGE_KEY_SAVED);
        if (rawSaved) setSavedIds(JSON.parse(rawSaved));
        const rawLearned = localStorage.getItem(STORAGE_KEY_LEARNED);
        if (rawLearned) setLearnedIds(JSON.parse(rawLearned));
        const rawActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
        if (rawActive && EXPANDED_PDF_KNOWLEDGE_LIBRARY.some((s) => s.id === rawActive)) {
          setActiveStructureId(rawActive);
        }
        const rawNotes = localStorage.getItem(STORAGE_KEY_NOTES);
        if (rawNotes) setUserNotes(JSON.parse(rawNotes));
      } catch {
        // ignore storage parse errors
      }
    };

    window.addEventListener('master-english-cloud-synced', handleStorageOrCloudSync);
    window.addEventListener('storage', handleStorageOrCloudSync);
    return () => {
      window.removeEventListener('master-english-cloud-synced', handleStorageOrCloudSync);
      window.removeEventListener('storage', handleStorageOrCloudSync);
    };
  }, []);

  useEffect(() => {
    if (typeof initialPdfItemNumber === 'number' && initialPdfItemNumber > 0) {
      const target = EXPANDED_PDF_KNOWLEDGE_LIBRARY.find(
        (item) => item.pdfItemNumber === initialPdfItemNumber
      );
      if (target) {
        setActiveStructureId(target.id);
      }
    }
  }, [initialPdfItemNumber]);

  useEffect(() => {
    setSelectedMcqOption(null);
    setShowMcqResult(false);
    setRewriteInput('');
    setShowRewriteModel(false);
    setNoteValidationError(null);
  }, [activeStructureId]);

  const toggleSaved = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredStructures = useMemo(() => {
    return allStructures.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedDifficulty !== 'ALL' && item.difficulty !== selectedDifficulty) {
        return false;
      }
      if (selectedPageFilter !== 'ALL') {
        if (selectedPageFilter === '1-8' && (item.pdfPage < 1 || item.pdfPage > 8)) return false;
        if (selectedPageFilter === '9-16' && (item.pdfPage < 9 || item.pdfPage > 16)) return false;
        if (selectedPageFilter === '17-24' && (item.pdfPage < 17 || item.pdfPage > 24)) return false;
      }
      if (filterMode === 'SAVED' && !savedIds.includes(item.id)) {
        return false;
      }
      if (filterMode === 'LEARNED' && !learnedIds.includes(item.id)) {
        return false;
      }
      if (filterMode === 'UNLEARNED' && learnedIds.includes(item.id)) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = item.structureName.toLowerCase().includes(q);
        const matchFormula = item.formula.toLowerCase().includes(q);
        const matchMeaning = item.meaningVi.toLowerCase().includes(q);
        const matchPdfEx = item.originalPdfExample.toLowerCase().includes(q);
        const matchUsage = item.howItWorksVi.toLowerCase().includes(q);
        const matchVariations = item.usefulVariations.some((v) => v.toLowerCase().includes(q));
        return (
          matchName ||
          matchFormula ||
          matchMeaning ||
          matchPdfEx ||
          matchUsage ||
          matchVariations
        );
      }
      return true;
    });
  }, [
    allStructures,
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedPageFilter,
    filterMode,
    savedIds,
    learnedIds,
  ]);

  const toggleLearned = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playTier4Stamp();
    const isCurrentlyLearned = learnedIds.includes(id);
    const targetItem = allStructures.find((item) => item.id === id);

    if (!isCurrentlyLearned) {
      const currentIdxInFiltered = filteredStructures.findIndex((s) => s.id === id);
      const nextCandidate =
        filteredStructures[currentIdxInFiltered + 1] ||
        filteredStructures[currentIdxInFiltered - 1] ||
        allStructures.find((s) => s.id !== id && !learnedIds.includes(s.id));

      setLearnedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

      if (nextCandidate) {
        setActiveStructureId(nextCandidate.id);
      }

      try {
        confetti({
          particleCount: 28,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#C92532', '#181614', '#2E5A36'],
        });
      } catch {
        // ignore confetti error
      }

      if (targetItem) {
        setToast({
          id: targetItem.id,
          pdfItemNumber: targetItem.pdfItemNumber,
          formula: targetItem.formula,
          action: 'mastered',
        });
      }
    } else {
      setLearnedIds((prev) => prev.filter((item) => item !== id));
      if (targetItem) {
        setToast({
          id: targetItem.id,
          pdfItemNumber: targetItem.pdfItemNumber,
          formula: targetItem.formula,
          action: 'unlearned',
        });
      }
    }
  };

  const handleUndoToast = () => {
    if (!toast) return;
    if (toast.action === 'mastered') {
      setLearnedIds((prev) => prev.filter((id) => id !== toast.id));
      setActiveStructureId(toast.id);
    } else {
      setLearnedIds((prev) => (prev.includes(toast.id) ? prev : [...prev, toast.id]));
    }
    setToast(null);
  };

  const handleAddCustomSentence = (structureId: string) => {
    const trimmed = customSentenceInput.trim();
    if (!trimmed) {
      setNoteValidationError('Vui lòng nhập một câu tiếng Anh áp dụng cấu trúc này trước khi lưu vào sổ tay.');
      return;
    }
    if (trimmed.length < 8) {
      setNoteValidationError('Câu ví dụ còn quá ngắn. Hãy viết một câu hoàn chỉnh (tối thiểu 8 ký tự) để ghi nhớ ngữ cảnh tốt hơn.');
      return;
    }
    setNoteValidationError(null);
    const newNote: UserSentenceNote = {
      id: `note-${Date.now()}`,
      structureId,
      sentence: trimmed,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setUserNotes((prev) => [newNote, ...prev]);
    setCustomSentenceInput('');
  };

  const handleDeleteNote = (noteId: string) => {
    setUserNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('ALL');
    setSelectedPageFilter('ALL');
    setFilterMode('UNLEARNED');
  };

  const activeStructure: PdfKnowledgeRecord = useMemo(() => {
    const found =
      filteredStructures.find((s) => s.id === activeStructureId) ||
      filteredStructures[0] ||
      allStructures.find((s) => s.id === activeStructureId) ||
      allStructures[0];
    return found;
  }, [activeStructureId, filteredStructures, allStructures]);

  const currentStructureNotes = useMemo(() => {
    if (!activeStructure) return [];
    return userNotes.filter((n) => n.structureId === activeStructure.id);
  }, [userNotes, activeStructure]);

  const totalCount = allStructures.length;
  const learnedCount = learnedIds.length;
  const unlearnedCount = Math.max(0, totalCount - learnedCount);
  const savedCount = savedIds.length;
  const currentFormulaNumber = activeStructure ? activeStructure.pdfItemNumber : 1;

  const activeQuiz = activeStructure?.practiceExercises?.[0];
  const activeMistake = activeStructure?.commonMistakes?.[0];
  const activeTransform = activeStructure?.sentenceTransformations?.[0];

  return (
    <div className="w-full min-w-0 space-y-6 pb-12 text-[#181614] relative">
      {/* Toast Feedback Banner */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 z-50 bg-[#181614] text-[#F1E7D3] px-4 py-3 rounded-[2px] shadow-[4px_4px_0px_#C92532] border-2 border-[#493B2D] flex items-center gap-3 text-xs sm:text-sm max-w-md"
        >
          <div
            className={`w-7 h-7 rounded-[2px] flex items-center justify-center shrink-0 border border-[#F1E7D3]/40 ${
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
                  Đã chuyển <span className="font-bold text-[#E8B7AC]">Cấu trúc {toast.pdfItemNumber}</span> vào mục Đã thuộc
                </>
              ) : (
                <>
                  Đã chuyển <span className="font-bold text-[#E8B7AC]">Cấu trúc {toast.pdfItemNumber}</span> về mục Cần học
                </>
              )}
            </p>
            {toast.action === 'mastered' && filterMode !== 'LEARNED' && (
              <button
                type="button"
                onClick={() => {
                  setFilterMode('LEARNED');
                  setActiveStructureId(toast.id);
                  setToast(null);
                }}
                className="text-[11px] text-[#DCE6D5] hover:underline mt-0.5 font-mono font-bold uppercase inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Mở mục Đã thuộc ({learnedCount})</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleUndoToast}
            className="px-2.5 py-1 text-xs font-mono font-bold uppercase bg-[#E9DCC2] text-[#181614] rounded-[2px] cursor-pointer shrink-0"
          >
            Hoàn tác
          </button>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Đóng thông báo"
            className="text-[#DCC9A8] hover:text-[#F1E7D3] transition-colors cursor-pointer p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. EXPANDED HERO BANNER: QUY CHUẨN HÀNH VĂN & CÚ PHÁP BIÊN TẬP + NHÀ THỜ ĐỨC BÀ SÀI GÒN */}
      <HorizonEngravingHeader
        engravingSrc={ENGRAVING_ASSETS.architecture.saigonNotreDame}
        engravingAlt="Saigon Notre-Dame Cathedral 19th-Century Architectural Etching"
        figLabel="FIG. V — NOTRE-DAME DE SAÏGON"
        className="min-h-[340px] sm:min-h-[380px] flex flex-col justify-center"
        imagePositionClass="right-0 top-0 bottom-0"
        imageWidthClass="w-[58%] sm:w-[54%] lg:w-[50%] max-w-none"
        imageFitClass="h-full w-auto object-contain object-right-bottom"
        imageStyle={{
          height: '100%',
          width: 'auto',
          objectFit: 'contain',
          objectPosition: 'right bottom',
        }}
        timerPageId="quy_chuan"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {handleBack && (
              <button
                type="button"
                onClick={handleBack}
                className="px-2.5 py-1 rounded-[2px] bg-[#E9DCC2] hover:bg-[#C92532] border border-[#181614] text-[11px] font-bold text-[#181614] hover:text-[#F1E7D3] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Trang Nhất</span>
              </button>
            )}

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest bg-[#C92532] border border-[#181614] text-[#F1E7D3] shadow-[2px_2px_0px_#181614]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>HỆ THỐNG {totalCount} QUY CHUẨN CÚ PHÁP &amp; MẪU CÂU TÒA SOẠN</span>
            </span>

            <span className="font-mono text-[10px] uppercase tracking-widest text-[#796B59] hidden sm:inline">
              EDITORIAL STYLEBOOK &amp; SYNTAX
            </span>

            <AdminGuard>
              <button
                type="button"
                onClick={() => setIsImporterOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[2px] text-[11px] font-bold bg-[#E9DCC2] hover:bg-[#DCC9A8] border border-[#181614] text-[#C92532] transition-colors cursor-pointer"
                title="Nạp thêm cấu trúc ngữ pháp mới vào danh mục (Admin Only)"
              >
                <span>+ Nạp / Mở rộng cấu trúc</span>
              </button>
            </AdminGuard>
          </div>

          <div className="font-headline uppercase text-[#181614] leading-[0.94] tracking-[-0.01em]">
            <div className="text-3xl sm:text-4xl lg:text-[44px]">QUY CHUẨN HÀNH VĂN —</div>
            <div className="text-3xl sm:text-4xl lg:text-[42px] text-[#C92532] mt-0.5">
              CÚ PHÁP BIÊN TẬP
            </div>
          </div>

          <p className="font-serif italic font-bold text-sm sm:text-base text-[#51483D] pt-1">
            "Sổ tay quy tắc dựng câu, cấu trúc ngữ pháp và chuẩn mực biên tập."
          </p>
        </div>
      </HorizonEngravingHeader>

      {/* 2. DEDICATED STATUS & ACADEMIC FILTER TOOLBAR */}
      <div className="newspaper-card border-2 border-[#181614] p-4 sm:p-5 shadow-[4px_4px_0px_#181614] space-y-3.5">
        {/* Top Row: Status Counter + Search Input + Filters + Open PDF Button */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#493B2D]/60">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#51483D]">
            <div className="flex items-center gap-2 font-mono font-bold bg-[#E9DCC2] px-3.5 py-2 border-[1.5px] border-[#181614] shadow-[2px_2px_0px_#181614]">
              <span>
                VỊ TRÍ:{' '}
                <strong className="tabular-nums text-[#C92532]">
                  {currentFormulaNumber}/{totalCount}
                </strong>
              </span>
              <span aria-hidden="true">|</span>
              <span>
                ĐÃ THUỘC:{' '}
                <strong className="tabular-nums text-[#2E5A36]">
                  {learnedCount}/{totalCount}
                </strong>
              </span>
            </div>

            <a
              href={PDF_SOURCE_METADATA.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 btn-newspaper-secondary text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#C92532]" />
              <span>Mở tài liệu PDF gốc</span>
            </a>
          </div>

          {/* Interactive Segmented Status Control */}
          <div className="flex items-center bg-[#DCC9A8] p-0.5 border-[1.5px] border-[#181614]">
            {(
              [
                { id: 'UNLEARNED', label: `Cần học (${unlearnedCount})` },
                { id: 'LEARNED', label: `Đã thuộc (${learnedCount})` },
                { id: 'SAVED', label: `Đã lưu (${savedCount})` },
                { id: 'ALL', label: `Tất cả (${totalCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterMode(tab.id)}
                className={`py-1.5 px-2.5 text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                  filterMode === tab.id
                    ? tab.id === 'LEARNED'
                      ? 'bg-[#2E5A36] text-[#F1E7D3]'
                      : 'bg-[#C92532] text-[#F1E7D3]'
                    : 'text-[#51483D] hover:text-[#181614]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Middle Row: Search & Dropdown Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
          <div className="lg:col-span-7 relative">
            <Search className="w-4 h-4 text-[#51483D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm kiếm cấu trúc ngữ pháp"
              placeholder="Tìm theo công thức (lead sb to, feasible, not only...), nghĩa tiếng Việt..."
              className="w-full pl-9 pr-16 py-2 input-newspaper text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#181614] hover:text-[#C92532] px-2 py-0.5 bg-[#DCC9A8] border border-[#493B2D] cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Difficulty Band Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              aria-label="Lọc theo mức điểm mục tiêu"
              className="w-full h-full px-3 py-2 input-newspaper text-xs font-bold cursor-pointer"
            >
              <option value="ALL">Mọi mức điểm mục tiêu</option>
              <option value="Band 6.0–6.5">Mức điểm 6.0–6.5</option>
              <option value="Band 7.0–7.5">Mức điểm 7.0–7.5</option>
              <option value="Band 8.0+">Mức điểm 8.0+</option>
            </select>
          </div>

          {/* PDF Page Range Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedPageFilter}
              onChange={(e) => setSelectedPageFilter(e.target.value)}
              aria-label="Lọc theo trang tài liệu"
              className="w-full h-full px-3 py-2 input-newspaper text-xs font-bold cursor-pointer"
            >
              <option value="ALL">Toàn bộ 24 trang tài liệu</option>
              <option value="1-8">Trang 1 đến Trang 8</option>
              <option value="9-16">Trang 9 đến Trang 16</option>
              <option value="17-24">Trang 17 đến Trang 24</option>
            </select>
          </div>
        </div>

        {/* Bottom Row: Clean Horizontal Category Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
          {CATEGORY_METADATA.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count =
              cat.id === 'all'
                ? allStructures.length
                : allStructures.filter((i) => i.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-[2px] text-xs font-mono font-bold uppercase whitespace-nowrap transition-colors flex items-center gap-1.5 border-[1.5px] cursor-pointer ${
                  isActive
                    ? 'bg-[#181614] text-[#F1E7D3] border-[#181614] shadow-[2px_2px_0px_#C92532]'
                    : 'bg-[#E9DCC2] text-[#181614] border-[#493B2D] hover:bg-[#DCC9A8] hover:border-[#C92532]'
                }`}
              >
                <span>{cat.shortLabel}</span>
                <span className="tabular-nums opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Reference Compendium Spread */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 cols): Newspaper Ledger Index */}
          <div className="lg:col-span-4 newspaper-card border-2 border-[#181614] overflow-hidden flex flex-col max-h-[420px] lg:max-h-[820px] mb-4 lg:mb-0 shadow-[4px_4px_0px_#181614]">
            <div className="px-4 py-3 border-b-2 border-[#181614] bg-[#DCC9A8] flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#181614] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#C92532]" />
                <span>
                  DANH MỤC CÔNG THỨC ({currentFormulaNumber}/{totalCount})
                </span>
              </span>
              {(searchQuery ||
                selectedCategory !== 'all' ||
                selectedDifficulty !== 'ALL' ||
                selectedPageFilter !== 'ALL' ||
                filterMode !== 'UNLEARNED') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="font-mono text-[11px] font-bold uppercase text-[#C92532] hover:underline cursor-pointer"
                >
                  Khôi phục
                </button>
              )}
            </div>

            <div className="overflow-y-auto divide-y divide-[#493B2D] flex-1">
              {filteredStructures.length === 0 ? (
                <div className="p-8 text-center space-y-3 bg-[#F1E7D3]">
                  <p className="text-sm font-serif font-bold text-[#181614]">
                    {filterMode === 'LEARNED' && learnedCount === 0
                      ? 'Chưa có cấu trúc nào trong mục Đã thuộc'
                      : filterMode === 'SAVED' && savedCount === 0
                        ? 'Chưa có cấu trúc nào được lưu đánh dấu'
                        : 'Không tìm thấy cấu trúc khớp với từ khóa'}
                  </p>
                  <p className="text-xs text-[#51483D] leading-relaxed">
                    {filterMode === 'LEARNED' && learnedCount === 0
                      ? 'Khi học xong một cấu trúc ở mục Cần học, hãy bấm nút "Đã thuộc" để lưu tiến độ vào danh sách này.'
                      : filterMode === 'SAVED' && savedCount === 0
                        ? 'Bấm biểu tượng đánh dấu trên bất kỳ công thức nào bạn muốn ôn tập riêng.'
                        : 'Hãy thử từ khóa ngắn hơn hoặc khôi phục lại bộ lọc mặc định.'}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      (filterMode === 'LEARNED' && learnedCount === 0) ||
                      (filterMode === 'SAVED' && savedCount === 0)
                        ? setFilterMode('UNLEARNED')
                        : handleResetFilters()
                    }
                    className="px-4 py-2 btn-newspaper-red text-xs font-mono uppercase cursor-pointer"
                  >
                    {(filterMode === 'LEARNED' && learnedCount === 0) ||
                    (filterMode === 'SAVED' && savedCount === 0)
                      ? `Bắt đầu học tại mục Cần học (${unlearnedCount})`
                      : 'Khôi phục toàn bộ danh sách'}
                  </button>
                </div>
              ) : (
                filteredStructures.map((item) => {
                  const isSelected = activeStructure?.id === item.id;
                  const isSaved = savedIds.includes(item.id);
                  const isLearned = learnedIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveStructureId(item.id)}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#DCC9A8] border-l-4 border-l-[#C92532]'
                          : 'bg-[#F1E7D3] hover:bg-[#E9DCC2]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#51483D] font-bold flex-wrap">
                          <span className="tabular-nums px-1.5 py-0.5 bg-[#181614] text-[#F1E7D3]">
                            #{item.pdfItemNumber}
                          </span>
                          <span>TRANG {item.pdfPage}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 bg-[#E9DCC2] border border-[#493B2D] text-[#C92532]">
                            {item.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => toggleSaved(item.id, e)}
                            aria-label={isSaved ? 'Bỏ lưu cấu trúc' : 'Lưu cấu trúc'}
                            title={isSaved ? 'Bỏ lưu cấu trúc' : 'Lưu cấu trúc'}
                            className={`p-1.5 border transition-colors cursor-pointer ${
                              isSaved
                                ? 'text-[#F1E7D3] bg-[#C92532] border-[#181614]'
                                : 'text-[#51483D] bg-[#E9DCC2] border-[#493B2D] hover:border-[#C92532] hover:text-[#C92532]'
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => toggleLearned(item.id, e)}
                            title={
                              isLearned
                                ? 'Bấm để chuyển về mục Cần học'
                                : 'Học xong? Bấm Đã thuộc để chuyển sang mục Đã thuộc'
                            }
                            className={`px-2 py-1 rounded-[2px] font-mono text-[10px] font-bold uppercase border transition-colors cursor-pointer flex items-center gap-1 ${
                              isLearned
                                ? 'text-[#F1E7D3] bg-[#2E5A36] border-[#181614]'
                                : 'text-[#181614] bg-[#E9DCC2] border-[#493B2D] hover:bg-[#DCE6D5] hover:text-[#2E5A36] hover:border-[#2E5A36]'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã thuộc</span>
                          </button>
                        </div>
                      </div>

                      <h4 className="font-mono text-xs sm:text-sm font-bold text-[#181614] leading-snug mb-1 break-words">
                        {item.formula}
                      </h4>
                      <p className="text-xs text-[#C92532] font-bold mb-1">
                        {item.meaningVi}
                      </p>
                      <p className="text-xs text-[#51483D] font-serif italic line-clamp-1">
                        “{item.originalPdfExample}”
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column (8 cols): Active Structure Broadsheet Inspection Workspace */}
          {activeStructure && (
            <div className="lg:col-span-8 space-y-5">
              {/* Formula Masthead Card */}
              <div className="newspaper-card border-2 border-[#181614] p-1.5 shadow-[5px_5px_0px_#181614]">
                <div className="border border-[#493B2D] p-5 sm:p-7 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#181614]">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#51483D] font-bold uppercase flex-wrap">
                      <span className="tabular-nums px-2 py-0.5 bg-[#C92532] text-[#F1E7D3] border border-[#181614]">
                        CẤU TRÚC #{activeStructure.pdfItemNumber} ({activeStructure.pdfItemNumber}/{totalCount})
                      </span>
                      <span className="px-2 py-0.5 bg-[#181614] text-[#F1E7D3]">
                        {activeStructure.categoryLabel}
                      </span>
                      <span className="px-2 py-0.5 bg-[#E9DCC2] border border-[#493B2D] text-[#181614]">
                        TRANG {activeStructure.pdfPage} PDF • {activeStructure.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSaved(activeStructure.id)}
                        className={`px-3 py-1.5 rounded-[2px] font-mono text-xs font-bold uppercase flex items-center gap-1.5 border-[1.5px] transition-colors cursor-pointer ${
                          savedIds.includes(activeStructure.id)
                            ? 'bg-[#E8B7AC] text-[#991D27] border-[#C92532]'
                            : 'bg-[#E9DCC2] text-[#181614] border-[#181614] hover:border-[#C92532] hover:text-[#C92532]'
                        }`}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            savedIds.includes(activeStructure.id) ? 'fill-current text-[#C92532]' : ''
                          }`}
                        />
                        <span>
                          {savedIds.includes(activeStructure.id)
                            ? 'Đã lưu'
                            : 'Lưu cấu trúc'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleLearned(activeStructure.id)}
                        className="px-4 py-1.5 rounded-[2px] font-mono text-xs font-bold uppercase flex items-center gap-1.5 border-[1.5px] border-[#181614] bg-[#2E5A36] text-[#F1E7D3] hover:bg-[#1E4627] shadow-[2px_2px_0px_#181614] transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {learnedIds.includes(activeStructure.id)
                            ? 'Đã thuộc (Bỏ thuộc)'
                            : 'Đánh dấu Đã thuộc'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Formula & Meaning with Landmark Engraving */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#493B2D]">
                    <div className="space-y-2 max-w-[65ch]">
                      <p className="font-mono text-xs text-[#796B59] uppercase font-bold">
                        {activeStructure.structureName} • KHI DÙNG: {activeStructure.whenToUse}
                      </p>
                      <h2 className="font-mono text-xl sm:text-2xl font-black text-[#181614] tracking-tight leading-snug break-words bg-[#E9DCC2] p-3 border-l-4 border-l-[#C92532] border border-[#493B2D]">
                        {activeStructure.formula}
                      </h2>
                      <p className="text-base sm:text-lg font-serif font-bold text-[#C92532]">
                        Ý nghĩa: {activeStructure.meaningVi}
                      </p>
                    </div>

                    <VintageEngravingFrame
                      src={VINTAGE_EDITORIAL_ASSETS.architecture.empireState}
                      alt="Empire State Architectural Sketch"
                      className="w-24 h-28 shrink-0 hidden sm:block"
                    />
                  </div>

                  {/* Original PDF Example Section (2 Examples + 2 Translations) */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-[#E9DCC2] p-4 border border-[#493B2D]">
                    <div className="space-y-1.5 max-w-[68ch]">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#C92532]">
                        [VÍ DỤ NGUYÊN BẢN TỪ TÀI LIỆU PDF — TRANG {activeStructure.pdfPage}]
                      </p>
                      <p
                        data-speak="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(activeStructure.originalPdfExample);
                        }}
                        title="Bấm để nghe phát âm câu ví dụ"
                        className="text-base sm:text-lg font-serif italic font-bold text-[#181614] hover:text-[#C92532] cursor-pointer transition-colors"
                      >
                        “{activeStructure.originalPdfExample}”
                      </p>
                      <p className="text-sm text-[#51483D]">
                        <strong className="text-[#181614]">Dịch nghĩa:</strong> {activeStructure.originalPdfExampleVi}
                      </p>
                      {activeStructure.expandedExamples?.[0] && (
                        <div className="pt-2 border-t border-dashed border-[#796B59] space-y-1">
                          <p
                            data-speak="true"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakWord(activeStructure.expandedExamples[0].english);
                            }}
                            title="Bấm để nghe phát âm câu ví dụ"
                            className="text-base sm:text-lg font-serif italic font-bold text-[#181614] hover:text-[#C92532] cursor-pointer transition-colors"
                          >
                            “{activeStructure.expandedExamples[0].english}”
                          </p>
                          <p className="text-sm text-[#51483D]">
                            <strong className="text-[#181614]">Dịch nghĩa:</strong> {activeStructure.expandedExamples[0].vietnamese}
                          </p>
                        </div>
                      )}
                      {activeStructure.originalPdfNotes && (
                        <p className="text-xs text-[#51483D] pt-1 leading-relaxed border-t border-dashed border-[#796B59]">
                          <strong className="text-[#181614] font-mono uppercase text-[10px]">Ghi chú gốc trong PDF:</strong>{' '}
                          {activeStructure.originalPdfNotes}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => speakWord(activeStructure.originalPdfExample)}
                      className="px-4 py-2 btn-newspaper-secondary text-xs font-mono font-bold uppercase flex items-center gap-1.5 shrink-0 self-start cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-[#C92532]" />
                      <span>Phát âm câu mẫu</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Newspaper Section Detail Tabs Container */}
              <div className="newspaper-card border-2 border-[#181614] overflow-hidden shadow-[5px_5px_0px_#181614]">
                <div className="border-b-2 border-[#181614] px-3 pt-2 flex items-center gap-1.5 overflow-x-auto bg-[#DCC9A8]">
                  {(
                    [
                      { id: 'overview', label: '1. Giải thích & lưu ý lỗi sai' },
                      {
                        id: 'examples',
                        label: `2. Ví dụ đa ngữ cảnh (${activeStructure.expandedExamples.length})`,
                      },
                      { id: 'transform', label: '3. Biến đổi câu & đối chiếu' },
                      { id: 'practice', label: '4. Bài tập & tự đặt câu' },
                    ] as const
                  ).map((tab) => {
                    const isActive = activeDetailTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveDetailTab(tab.id)}
                        className={`px-4 py-2.5 text-xs font-mono font-bold uppercase border-t-[1.5px] border-x-[1.5px] transition-colors whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'border-[#181614] text-[#F1E7D3] bg-[#C92532]'
                            : 'border-transparent text-[#51483D] hover:text-[#181614] hover:bg-[#E9DCC2]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Area */}
                <div className="p-5 sm:p-7">
                  {/* TAB 1: OVERVIEW & COMMON MISTAKES */}
                  {activeDetailTab === 'overview' && (
                    <div className="space-y-6 divide-y-2 divide-[#181614]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-[#E9DCC2] border border-[#493B2D] space-y-2.5">
                          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-[#C92532] border-b border-[#796B59] pb-1.5">
                            <Lightbulb className="w-4 h-4 text-[#C92532]" />
                            <span>BẢN CHẤT NGỮ PHÁP &amp; CÁCH VẬN HÀNH</span>
                          </div>
                          <p className="text-sm text-[#181614] leading-relaxed">
                            {activeStructure.howItWorksVi}
                          </p>
                          <p className="pt-2 text-xs text-[#51483D] border-t border-dashed border-[#796B59]">
                            <strong className="text-[#181614] font-mono uppercase">Chức năng logic:</strong>{' '}
                            {activeStructure.logicalFunction}
                          </p>
                        </div>

                        <div className="p-4 bg-[#E9DCC2] border border-[#493B2D] space-y-2.5">
                          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-[#181614] border-b border-[#796B59] pb-1.5">
                            <BookOpen className="w-4 h-4 text-[#C92532]" />
                            <span>PHÂN TÍCH THÀNH PHẦN CÚ PHÁP</span>
                          </div>
                          <ol className="space-y-2 text-sm text-[#181614]">
                            {activeStructure.syntacticBreakdown.map((slot, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="font-mono tabular-nums text-xs font-bold px-1.5 py-0.5 bg-[#181614] text-[#F1E7D3] mt-0.5">
                                  0{idx + 1}
                                </span>
                                <span>{slot}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>

                      {/* Common Mistake Comparison */}
                      {activeMistake && (
                        <div className="pt-6 space-y-4">
                          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#C92532]">
                            <AlertTriangle className="w-4 h-4 text-[#C92532]" />
                            <span>CẢNH BÁO BẪY NGỮ PHÁP THƯỜNG GẶP TRONG PHÒNG THI</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                              data-speak="true"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakWord(activeMistake.wrongExample);
                              }}
                              title="Bấm để nghe phát âm câu tiếng Anh"
                              className="p-4 rounded-[2px] bg-[#E8B7AC]/60 border-[1.5px] border-[#C92532] cursor-pointer hover:bg-[#E8B7AC]/85 transition-colors"
                            >
                              <span className="font-mono text-xs font-bold uppercase text-[#991D27] block mb-1">
                                ❌ Cách dùng sai phổ biến:
                              </span>
                              <p className="text-sm font-medium text-[#181614] line-through">
                                {activeMistake.wrongExample}
                              </p>
                            </div>
                            <div
                              data-speak="true"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakWord(activeMistake.correctExample);
                              }}
                              title="Bấm để nghe phát âm câu chuẩn ngữ pháp"
                              className="p-4 rounded-[2px] bg-[#DCE6D5] border-[1.5px] border-[#2E5A36] cursor-pointer hover:bg-[#CEE0C4] transition-colors"
                            >
                              <span className="font-mono text-xs font-bold uppercase text-[#2E5A36] block mb-1">
                                ✓ Câu chuẩn ngữ pháp:
                              </span>
                              <p className="text-sm font-bold text-[#181614]">
                                {activeMistake.correctExample}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-[#181614] bg-[#E9DCC2] p-3 border-l-3 border-[#C92532] leading-relaxed">
                            <strong className="font-mono uppercase text-[11px] text-[#C92532] mr-1.5">[Cách khắc phục]:</strong>
                            {activeMistake.errorReasonVi} ({activeMistake.grammarRuleVi})
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: MULTI-CONTEXT EXAMPLES */}
                  {activeDetailTab === 'examples' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b-2 border-[#181614]">
                        <h3 className="font-serif text-base font-black text-[#181614]">
                          Ví dụ mở rộng theo từng ngữ cảnh thực tế
                        </h3>
                        <span className="font-mono text-xs text-[#51483D]">
                          Bấm vào câu hoặc nút nghe để luyện phát âm chuẩn
                        </span>
                      </div>

                      <div className="divide-y divide-[#493B2D]">
                        {activeStructure.expandedExamples.map((ex, index) => (
                          <div
                            key={ex.id}
                            className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                          >
                            <div className="space-y-1.5 max-w-[68ch]">
                              <div className="font-mono text-xs text-[#51483D] font-bold uppercase">
                                <span className="tabular-nums px-1.5 py-0.5 bg-[#C92532] text-[#F1E7D3] mr-2">
                                  0{index + 1}
                                </span>
                                <span>NGỮ CẢNH: {ex.domain}</span>
                              </div>
                              <p
                                data-speak="true"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakWord(ex.english);
                                }}
                                title="Bấm để nghe phát âm câu ví dụ"
                                className="text-base font-serif italic font-bold text-[#181614] hover:text-[#C92532] cursor-pointer transition-colors"
                              >
                                “{ex.english}”
                              </p>
                              <p className="text-sm text-[#181614]">
                                <strong>Dịch nghĩa:</strong> {ex.vietnamese}
                              </p>
                              <p className="text-xs text-[#51483D]">
                                <strong>Lý do áp dụng:</strong> {ex.whyUseStructure}
                              </p>
                            </div>

                            <button
                              type="button"
                              data-speak="true"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakWord(ex.english);
                              }}
                              className="px-3.5 py-1.5 btn-newspaper-secondary text-xs font-mono font-bold uppercase flex items-center gap-1.5 shrink-0 self-start cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-[#C92532]" />
                              <span>Nghe phát âm</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SENTENCE TRANSFORMATION & VARIATIONS */}
                  {activeDetailTab === 'transform' && (
                    <div className="space-y-6 divide-y-2 divide-[#181614]">
                      {activeTransform && (
                        <div className="space-y-4">
                          <h3 className="font-serif text-base font-black text-[#181614]">
                            Kỹ thuật viết lại câu nâng cấp diễn đạt ({activeTransform.transformationType})
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                              data-speak="true"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakWord(activeTransform.originalSentence);
                              }}
                              title="Bấm để nghe phát âm câu gốc"
                              className="p-4 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-1 cursor-pointer hover:bg-[#DCC9A8] transition-colors"
                            >
                              <span className="font-mono text-xs font-bold uppercase text-[#796B59]">
                                Câu diễn đạt gốc:
                              </span>
                              <p className="text-sm font-semibold text-[#181614]">
                                {activeTransform.originalSentence}
                              </p>
                            </div>

                            <div
                              data-speak="true"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakWord(activeTransform.transformedSentence);
                              }}
                              title="Bấm để nghe phát âm câu áp dụng cấu trúc"
                              className="p-4 rounded-[2px] bg-[#DCE6D5] border-[1.5px] border-[#2E5A36] space-y-1 cursor-pointer hover:bg-[#CEE0C4] transition-colors"
                            >
                              <span className="font-mono text-xs font-bold uppercase text-[#2E5A36]">
                                Câu áp dụng cấu trúc #{activeStructure.pdfItemNumber}:
                              </span>
                              <p className="text-sm font-bold text-[#181614]">
                                {activeTransform.transformedSentence}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-[#181614] bg-[#E9DCC2] p-3 border-l-3 border-[#C92532] leading-relaxed">
                            <strong className="font-mono uppercase text-[11px] text-[#C92532] mr-1.5">[Nguyên tắc chuyển đổi]:</strong>
                            {activeTransform.explanationVi}
                          </p>
                        </div>
                      )}

                      {/* Useful variations */}
                      <div className="pt-6 space-y-3">
                        <h4 className="font-mono text-xs font-bold uppercase text-[#181614]">
                          Các biến thể mở rộng và cụm từ đồng nghĩa học thuật:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {activeStructure.usefulVariations.map((variation, i) => (
                            <span
                              key={i}
                              data-speak="true"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakWord(variation);
                              }}
                              title="Bấm để nghe phát âm biến thể học thuật"
                              className="px-3 py-1.5 rounded-[2px] bg-[#E9DCC2] hover:bg-[#DCC9A8] border border-[#181614] hover:border-[#C92532] font-mono text-xs font-bold text-[#181614] hover:text-[#C92532] cursor-pointer transition-colors"
                            >
                              {variation}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: INTERACTIVE PRACTICE & PERSONAL SENTENCE BUILDER */}
                  {activeDetailTab === 'practice' && (
                    <div className="space-y-6 divide-y-2 divide-[#181614]">
                      {/* Exercise 1: Multiple Choice */}
                      {activeQuiz && (
                        <div className="space-y-4">
                          <div className="font-mono text-xs font-bold uppercase text-[#C92532]">
                            01. CHỌN ĐÁP ÁN ĐÚNG CHUẨN NGỮ PHÁP
                          </div>
                          <p className="text-base font-serif font-bold text-[#181614] max-w-[72ch]">
                            {activeQuiz.question}
                          </p>

                          <div className="grid grid-cols-1 gap-2.5">
                            {activeQuiz.options.map((opt, idx) => {
                              const isPicked = selectedMcqOption === idx;
                              const isCorrect = opt === activeQuiz.correctAnswer;
                              let btnStyle =
                                'bg-[#E9DCC2] border-[#181614] text-[#181614] hover:bg-[#DCC9A8] hover:border-[#C92532]';
                              if (showMcqResult) {
                                if (isCorrect) {
                                  btnStyle =
                                    'bg-[#DCE6D5] border-[#2E5A36] text-[#2E5A36] font-bold';
                                } else if (isPicked && !isCorrect) {
                                  btnStyle =
                                    'bg-[#E8B7AC] border-[#C92532] text-[#991D27] font-bold';
                                }
                              } else if (isPicked) {
                                btnStyle = 'bg-[#C92532] border-[#181614] text-[#F1E7D3]';
                              }

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setSelectedMcqOption(idx);
                                    setShowMcqResult(true);
                                  }}
                                  className={`p-3.5 rounded-[2px] border-[1.5px] text-left text-xs sm:text-sm transition-colors flex items-center justify-between cursor-pointer ${btnStyle}`}
                                >
                                  <span>
                                    <strong className="font-mono mr-2">
                                      [{String.fromCharCode(65 + idx)}]
                                    </strong>
                                    {opt}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {showMcqResult && (
                            <div className="p-4 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-xs text-[#181614] leading-relaxed">
                              <strong className="font-mono uppercase text-[#C92532] mr-1.5">[Giải thích đáp án]:</strong>
                              {activeQuiz.explanationVi}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Exercise 2: Sentence Rewrite Practice */}
                      {activeTransform && (
                        <div className="pt-6 space-y-3">
                          <div className="font-mono text-xs font-bold uppercase text-[#181614]">
                            02. THỰC HÀNH VIẾT LẠI CÂU THEO CÔNG THỨC #{activeStructure.pdfItemNumber}
                          </div>
                          <p className="text-xs sm:text-sm font-serif font-bold text-[#181614] max-w-[72ch]">
                            Câu gốc: “{activeTransform.originalSentence}”
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={rewriteInput}
                              onChange={(e) => setRewriteInput(e.target.value)}
                              placeholder={`Viết lại câu áp dụng ${activeStructure.formula}...`}
                              className="flex-1 px-3.5 py-2 input-newspaper text-xs sm:text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRewriteModel(!showRewriteModel)}
                              className="px-4 py-2 btn-newspaper-secondary text-xs font-mono font-bold uppercase cursor-pointer shrink-0"
                            >
                              {showRewriteModel ? 'Ẩn câu mẫu chuẩn' : 'Đối chiếu câu mẫu chuẩn'}
                            </button>
                          </div>
                          {showRewriteModel && (
                            <div className="p-3.5 rounded-[2px] bg-[#DCE6D5] border border-[#2E5A36] text-xs sm:text-sm text-[#181614]">
                              <strong className="text-[#2E5A36] font-mono uppercase mr-1.5">[Câu hoàn chỉnh]:</strong>
                              {activeTransform.transformedSentence}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Personal Sentence Notebook */}
                      <div className="pt-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <PenTool className="w-4 h-4 text-[#C92532]" />
                          <h4 className="font-mono text-xs font-bold uppercase text-[#181614]">
                            03. SỔ TAY TỰ ĐẶT CÂU VỚI CẤU TRÚC #{activeStructure.pdfItemNumber}
                          </h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={customSentenceInput}
                              onChange={(e) => {
                                setCustomSentenceInput(e.target.value);
                                if (noteValidationError) setNoteValidationError(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddCustomSentence(activeStructure.id);
                                }
                              }}
                              placeholder={`Tự viết một câu áp dụng "${activeStructure.formula}" để ghi nhớ sâu...`}
                              className="flex-1 px-3.5 py-2 input-newspaper text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddCustomSentence(activeStructure.id)}
                              className="px-4 py-2 btn-newspaper-red text-xs font-mono uppercase shrink-0 cursor-pointer"
                            >
                              Lưu vào sổ tay
                            </button>
                          </div>
                          {noteValidationError && (
                            <p className="text-xs font-bold text-[#C92532]">
                              {noteValidationError}
                            </p>
                          )}
                        </div>

                        {currentStructureNotes.length === 0 ? (
                          <p className="text-xs text-[#51483D]">
                            Bạn chưa lưu câu tự đặt nào cho cấu trúc #{activeStructure.pdfItemNumber}. Tự viết ít nhất 1 câu hoàn chỉnh sẽ giúp não bộ ghi nhớ cấu trúc lâu gấp 3 lần.
                          </p>
                        ) : (
                          <div className="divide-y divide-[#493B2D] border-t border-[#493B2D] pt-2">
                            {currentStructureNotes.map((note) => (
                              <div
                                key={note.id}
                                className="py-3 flex items-center justify-between gap-3"
                              >
                                <div className="max-w-[68ch]">
                                  <p className="text-sm font-serif italic font-bold text-[#181614] break-words">
                                    “{note.sentence}”
                                  </p>
                                  <span className="font-mono text-[11px] text-[#796B59]">
                                    Đã lưu ngày {note.createdAt}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => speakWord(note.sentence)}
                                    className="p-1.5 bg-[#E9DCC2] border border-[#493B2D] text-[#181614] hover:text-[#C92532] cursor-pointer"
                                    title="Nghe phát âm"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="p-1.5 bg-[#E9DCC2] border border-[#493B2D] text-[#181614] hover:text-[#C92532] cursor-pointer"
                                    title="Xóa câu này khỏi sổ tay"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ContentImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        defaultTab="structures"
      />
    </div>
  );
};
export default ExpandedExamplesLibrary;
