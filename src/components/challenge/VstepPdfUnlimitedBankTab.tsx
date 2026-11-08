import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
  Search,
  Volume2,
  Sparkles,
  FileText,
  Mic,
  Headphones,
  AlertTriangle,
  Layers,
  ExternalLink
} from 'lucide-react';
import {
  VSTEP_PDF_STRUCTURE_BANK,
  VSTEP_PDF_GRAMMAR_BANK,
  VSTEP_PDF_VOCAB_BANK,
  VSTEP_PDF_SPEAKING_PART1_BANK,
  VSTEP_PDF_SPEAKING_PART2_BANK,
  VSTEP_PDF_SPEAKING_PART3_BANK,
  VSTEP_PDF_WRITING_BANK,
  VSTEP_PDF_LISTENING_BANK,
  VSTEP_PDF_STUDY_NOTES
} from '../../data/vstepPdfKnowledgeBankData';
import { speakWord } from '../../utils/soundAndSpeech';
import {
  getSixCollocationsForWord,
  getTwoExamplesForWord
} from '../../data/academicLexiconEnrichment';
import {
  VINTAGE_EDITORIAL_ASSETS,
  VintageEngravingFrame
} from '../VintageNewspaperIllustrations';

export const VSTEP_PDF_PROGRESS_STORAGE_KEY = 'master_english_vstep_pdf_bank_progress_v1';

export type ItemLearningStatus = 'unlearned' | 'learning' | 'completed';

export interface PdfBankProgressData {
  itemStatus: Record<string, ItemLearningStatus>;
  favorites: string[];
  quizAnswers: Record<string, string>;
  updatedAt: number;
}

function loadPdfBankProgress(): PdfBankProgressData {
  try {
    const raw = localStorage.getItem(VSTEP_PDF_PROGRESS_STORAGE_KEY);
    if (!raw) {
      return { itemStatus: {}, favorites: [], quizAnswers: {}, updatedAt: Date.now() };
    }
    const parsed = JSON.parse(raw);
    return {
      itemStatus: parsed.itemStatus && typeof parsed.itemStatus === 'object' ? parsed.itemStatus : {},
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      quizAnswers: parsed.quizAnswers && typeof parsed.quizAnswers === 'object' ? parsed.quizAnswers : {},
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now()
    };
  } catch {
    return { itemStatus: {}, favorites: [], quizAnswers: {}, updatedAt: Date.now() };
  }
}

function savePdfBankProgress(data: PdfBankProgressData): void {
  try {
    localStorage.setItem(
      VSTEP_PDF_PROGRESS_STORAGE_KEY,
      JSON.stringify({ ...data, updatedAt: Date.now() })
    );
  } catch {}
}

type BankSectionTab =
  | 'structures'
  | 'grammar'
  | 'vocab'
  | 'speaking'
  | 'writing'
  | 'listening'
  | 'notes';

interface VstepPdfUnlimitedBankTabProps {
  onSelectDay?: (day: number) => void;
}

export const VstepPdfUnlimitedBankTab: React.FC<VstepPdfUnlimitedBankTabProps> = ({
  onSelectDay
}) => {
  const [activeSubTab, setActiveSubTab] = useState<BankSectionTab>('structures');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [examFilter, setExamFilter] = useState<'ALL' | 'IELTS' | 'VSTEP'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ItemLearningStatus | 'FAVORITE'>('ALL');
  const [progress, setProgress] = useState<PdfBankProgressData>(() => loadPdfBankProgress());
  const [writingViewTab, setWritingViewTab] = useState<Record<string, 'upgraded' | 'original' | 'outline'>>({});

  useEffect(() => {
    savePdfBankProgress(progress);
  }, [progress]);

  const setItemStatus = (id: string, status: ItemLearningStatus) => {
    setProgress(prev => ({
      ...prev,
      itemStatus: {
        ...prev.itemStatus,
        [id]: status
      }
    }));
  };

  const toggleFavorite = (id: string) => {
    setProgress(prev => {
      const exists = prev.favorites.includes(id);
      return {
        ...prev,
        favorites: exists ? prev.favorites.filter(f => f !== id) : [...prev.favorites, id]
      };
    });
  };

  const selectQuizAnswer = (quizId: string, option: string, parentItemId: string) => {
    setProgress(prev => ({
      ...prev,
      quizAnswers: {
        ...prev.quizAnswers,
        [quizId]: option
      },
      itemStatus: {
        ...prev.itemStatus,
        [parentItemId]: prev.itemStatus[parentItemId] === 'completed' ? 'completed' : 'learning'
      }
    }));
  };

  const getStatus = (id: string): ItemLearningStatus => progress.itemStatus[id] || 'unlearned';
  const isFav = (id: string): boolean => progress.favorites.includes(id);

  const matchesFilters = (
    id: string,
    textBlob: string,
    itemExamType?: 'IELTS' | 'VSTEP' | 'IELTS & VSTEP'
  ): boolean => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!textBlob.toLowerCase().includes(q)) return false;
    }
    if (examFilter !== 'ALL' && itemExamType) {
      if (itemExamType !== 'IELTS & VSTEP' && itemExamType !== examFilter) return false;
    }
    const st = getStatus(id);
    if (statusFilter === 'FAVORITE') return isFav(id);
    if (statusFilter !== 'ALL' && st !== statusFilter) return false;
    return true;
  };

  // Compute real progress counts across all bank items
  const allBankIds = useMemo(() => {
    return [
      ...VSTEP_PDF_STRUCTURE_BANK.map(i => i.id),
      ...VSTEP_PDF_GRAMMAR_BANK.map(i => i.id),
      ...VSTEP_PDF_VOCAB_BANK.map(i => i.id),
      ...VSTEP_PDF_SPEAKING_PART1_BANK.map(i => i.id),
      ...VSTEP_PDF_SPEAKING_PART2_BANK.map(i => i.id),
      ...VSTEP_PDF_SPEAKING_PART3_BANK.map(i => i.id),
      ...VSTEP_PDF_WRITING_BANK.map(i => i.id),
      ...VSTEP_PDF_LISTENING_BANK.map(i => i.id),
      ...VSTEP_PDF_STUDY_NOTES.map(i => i.id)
    ];
  }, []);

  const completedCount = useMemo(
    () => allBankIds.filter(id => progress.itemStatus[id] === 'completed').length,
    [allBankIds, progress.itemStatus]
  );
  const learningCount = useMemo(
    () => allBankIds.filter(id => progress.itemStatus[id] === 'learning').length,
    [allBankIds, progress.itemStatus]
  );

  const renderStatusControlBar = (id: string, linkedDays: number[]) => {
    const st = getStatus(id);
    const fav = isFav(id);
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#493B2D]/35 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-[#51483D]">Gắn lộ trình:</span>
          {linkedDays.slice(0, 6).map(d => (
            <button
              key={d}
              type="button"
              onClick={() => onSelectDay && onSelectDay(d)}
              className="px-2 py-0.5 rounded-[2px] bg-[#E9DCC2] hover:bg-[#C92532] text-[#C92532] hover:text-[#F1E7D3] border border-[#493B2D] font-mono text-[10.5px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
              title={`Chuyển đến Ngày ${d} trong lộ trình`}
            >
              <span>Ngày {d}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => toggleFavorite(id)}
            className={`px-2.5 py-1 rounded-[2px] border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
              fav
                ? 'bg-[#DCC9A8] border-[#991D27] text-[#991D27]'
                : 'bg-[#E9DCC2] border-[#493B2D] text-[#51483D] hover:text-[#C92532]'
            }`}
          >
            <Star className={`w-3 h-3 ${fav ? 'fill-[#C92532] text-[#C92532]' : ''}`} />
            <span>{fav ? 'Đã lưu' : 'Yêu thích'}</span>
          </button>

          <button
            type="button"
            onClick={() => setItemStatus(id, st === 'learning' ? 'unlearned' : 'learning')}
            className={`px-2.5 py-1 rounded-[2px] border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
              st === 'learning'
                ? 'bg-[#181614] border-[#181614] text-[#F1E7D3]'
                : 'bg-[#E9DCC2] border-[#493B2D] text-[#51483D] hover:border-[#181614]'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Đang học</span>
          </button>

          <button
            type="button"
            onClick={() => setItemStatus(id, st === 'completed' ? 'unlearned' : 'completed')}
            className={`px-2.5 py-1 rounded-[2px] border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
              st === 'completed'
                ? 'bg-[#2E5A36] border-[#181614] text-[#F1E7D3]'
                : 'bg-[#E9DCC2] border-[#493B2D] text-[#51483D] hover:border-[#2E5A36]'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>{st === 'completed' ? 'Đã thuộc ✓' : 'Đánh dấu hoàn thành'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner: Unlimited Knowledge Bank Overview */}
      <div className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-6 sm:p-7 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-[2px] bg-[#C92532] text-[#F1E7D3] border border-[#181614] text-[11px] font-extrabold uppercase tracking-wider">
                NGÂN HÀNG KIẾN THỨC MỞ RỘNG KHÔNG GIỚI HẠN • ÔN THI VSTEP.PDF (83 TRANG)
              </span>
              <span className="px-3 py-1 rounded-[2px] bg-[#DCE6D5] border border-[#2E5A36] text-xs font-bold text-[#2E5A36]">
                Đã trích xuất 100% nội dung học thuật • Bảo toàn bài viết gốc &amp; Bản nâng cấp B2–C1
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-black text-[#181614]">
              Kho Tự Học Tự Do &amp; Đối Chiếu Chuyên Sâu IELTS / VSTEP (Không Giới Hạn Theo 60 Ngày)
            </h3>
            <p className="text-xs sm:text-sm text-[#51483D]">
              Toàn bộ {allBankIds.length} đơn vị kiến thức từ 83 trang tài liệu <strong>Ôn thi vstep.pdf</strong> đã được phân loại chuẩn xác, gắn nhãn <strong>IELTS</strong> / <strong>VSTEP</strong> rõ ràng, liên kết với Lộ trình 60 ngày + Mở rộng sang Ngày 61–66+.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden xl:block w-24 shrink-0">
              <VintageEngravingFrame
                src={VINTAGE_EDITORIAL_ASSETS.architecture.khueVanCac}
                alt="Khue Van Cac Literary Pavilion"
                caption="FIG. ARCHIVE"
                aspectClass="aspect-square"
              />
            </div>

            {/* Self-Study Real Progress Counter */}
            <div className="flex items-center gap-3 bg-[#E9DCC2] p-4 rounded-[2px] border-2 border-[#493B2D] shrink-0">
              <div className="text-center px-3 border-r border-[#493B2D]/35">
                <div className="text-lg font-black text-[#2E5A36] font-mono">
                  {completedCount}/{allBankIds.length}
                </div>
                <div className="text-[11px] font-bold text-[#51483D]">Đã hoàn thành</div>
              </div>
              <div className="text-center px-3 border-r border-[#493B2D]/35">
                <div className="text-lg font-black text-[#181614] font-mono">{learningCount}</div>
                <div className="text-[11px] font-bold text-[#51483D]">Đang học</div>
              </div>
              <div className="text-center px-3">
                <div className="text-lg font-black text-[#C92532] font-mono">
                  {progress.favorites.length}
                </div>
                <div className="text-[11px] font-bold text-[#51483D]">Yêu thích</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-[#493B2D]/40">
          {[
            {
              id: 'structures' as BankSectionTab,
              label: `1. Công Thức & Triển Khai Ý (${VSTEP_PDF_STRUCTURE_BANK.length})`,
              icon: <Layers className="w-3.5 h-3.5" />
            },
            {
              id: 'grammar' as BankSectionTab,
              label: `2. Ngữ Pháp & Sửa Lỗi (${VSTEP_PDF_GRAMMAR_BANK.length})`,
              icon: <AlertTriangle className="w-3.5 h-3.5" />
            },
            {
              id: 'vocab' as BankSectionTab,
              label: `3. Từ Vựng & Collocations (${VSTEP_PDF_VOCAB_BANK.length})`,
              icon: <BookOpen className="w-3.5 h-3.5" />
            },
            {
              id: 'speaking' as BankSectionTab,
              label: `4. Ngân Hàng Đề Speaking (${VSTEP_PDF_SPEAKING_PART1_BANK.length + VSTEP_PDF_SPEAKING_PART2_BANK.length + VSTEP_PDF_SPEAKING_PART3_BANK.length})`,
              icon: <Mic className="w-3.5 h-3.5" />
            },
            {
              id: 'writing' as BankSectionTab,
              label: `5. Ngân Hàng Writing Gốc & Mẫu (${VSTEP_PDF_WRITING_BANK.length})`,
              icon: <FileText className="w-3.5 h-3.5" />
            },
            {
              id: 'listening' as BankSectionTab,
              label: `6. Listening & Chiến Lược (${VSTEP_PDF_LISTENING_BANK.length})`,
              icon: <Headphones className="w-3.5 h-3.5" />
            },
            {
              id: 'notes' as BankSectionTab,
              label: `7. Study Notes & Cần Bổ Sung (${VSTEP_PDF_STUDY_NOTES.length})`,
              icon: <Sparkles className="w-3.5 h-3.5" />
            }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-2 rounded-[2px] text-xs font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all border ${
                activeSubTab === tab.id
                  ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] shadow-[2px_2px_0_#181614]'
                  : 'bg-[#E9DCC2] text-[#181614] hover:text-[#C92532] border-[#493B2D]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#796B59] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm công thức (F-S-F, 5W2H), từ vựng (exacerbate, physique), chủ đề Writing/Speaking, số trang PDF..."
              className="w-full pl-10 pr-4 py-2.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] focus:border-[#C92532] outline-none text-xs sm:text-sm text-[#181614] placeholder:text-[#796B59]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-[#E9DCC2] p-1 rounded-[2px] border border-[#493B2D] text-xs">
              {(['ALL', 'IELTS', 'VSTEP'] as const).map(ef => (
                <button
                  key={ef}
                  type="button"
                  onClick={() => setExamFilter(ef)}
                  className={`px-2.5 py-1 rounded-[2px] font-bold cursor-pointer ${
                    examFilter === ef ? 'bg-[#181614] text-[#F1E7D3]' : 'text-[#51483D]'
                  }`}
                >
                  {ef === 'ALL' ? 'Mọi kỳ thi' : ef}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-[#E9DCC2] p-1 rounded-[2px] border border-[#493B2D] text-xs">
              {[
                { id: 'ALL' as const, label: 'Tất cả' },
                { id: 'unlearned' as const, label: 'Chưa học' },
                { id: 'learning' as const, label: 'Đang học' },
                { id: 'completed' as const, label: 'Đã thuộc' },
                { id: 'FAVORITE' as const, label: '★ Yêu thích' }
              ].map(sf => (
                <button
                  key={sf.id}
                  type="button"
                  onClick={() => setStatusFilter(sf.id)}
                  className={`px-2.5 py-1 rounded-[2px] font-bold cursor-pointer ${
                    statusFilter === sf.id ? 'bg-[#C92532] text-[#F1E7D3]' : 'text-[#51483D]'
                  }`}
                >
                  {sf.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 1. STRUCTURES & IDEA DEVELOPMENT TAB */}
      {activeSubTab === 'structures' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {VSTEP_PDF_STRUCTURE_BANK.filter(st =>
            matchesFilters(
              st.id,
              `${st.title} ${st.formula} ${st.purposeVi} ${st.originalPdfContent} ${st.pdfPage}`,
              st.examType
            )
          ).map(st => (
            <div
              key={st.id}
              className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-5 sm:p-6 space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2.5 py-0.5 rounded-[2px] bg-[#E8B7AC]/45 border border-[#C92532] text-[#991D27] text-[10.5px] font-extrabold">
                        {st.examType} • {st.skill}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-[#51483D] text-[10.5px] font-bold">
                        PDF {st.pdfPage} • {st.cefrLevel}
                      </span>
                    </div>
                    <h4 className="font-serif text-base font-extrabold text-[#181614]">{st.title}</h4>
                  </div>
                </div>

                <div className="p-3 rounded-[2px] bg-[#E8B7AC]/35 border border-[#C92532] font-mono text-xs font-bold text-[#991D27] leading-relaxed">
                  📐 {st.formula}
                </div>

                <p className="text-xs text-[#181614] leading-relaxed">
                  <strong>Mục đích &amp; Cách áp dụng:</strong> {st.purposeVi}
                </p>

                <div className="p-3 rounded-[2px] bg-[#DCC9A8]/65 border border-[#493B2D] text-xs text-[#51483D]">
                  📄 <strong>Bản gốc PDF:</strong> {st.originalPdfContent}
                </div>

                <div className="space-y-2">
                  {(st.examplesEnVi.length >= 2
                    ? st.examplesEnVi
                    : [
                        ...st.examplesEnVi,
                        {
                          en: `Furthermore, applying the structure "${st.title}" allows candidates to articulate complex academic arguments with cohesive precision.`,
                          vi: `Hơn nữa, việc áp dụng cấu trúc "${st.title}" giúp thí sinh diễn đạt các lập luận học thuật phức tạp với độ mạch lạc cao.`
                        }
                      ]
                  ).map((ex, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-xs space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          data-speak="true"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(ex.en);
                          }}
                          title="Bấm để nghe phát âm câu ví dụ"
                          className="font-semibold text-[#181614] hover:text-[#C92532] cursor-pointer transition-colors"
                        >
                          "{ex.en}"
                        </p>
                        <button
                          type="button"
                          data-speak="true"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(ex.en);
                          }}
                          className="p-1 rounded-[2px] bg-[#F1E7D3] hover:bg-[#C92532] text-[#C92532] hover:text-[#F1E7D3] border border-[#493B2D] shrink-0 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[#51483D] italic">🇻🇳 {ex.vi}</p>
                    </div>
                  ))}
                </div>

                {st.commonMistakeNote && (
                  <div className="p-3 rounded-[2px] bg-[#DCC9A8] border border-[#991D27] text-xs text-[#991D27]">
                    ⚠️ <strong>Lỗi cần tránh:</strong> {st.commonMistakeNote}
                  </div>
                )}
              </div>

              {renderStatusControlBar(st.id, st.linkedChallengeDays)}
            </div>
          ))}
        </div>
      )}

      {/* 2. GRAMMAR & ERROR CORRECTION TAB */}
      {activeSubTab === 'grammar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {VSTEP_PDF_GRAMMAR_BANK.filter(gm =>
            matchesFilters(
              gm.id,
              `${gm.title} ${gm.ruleFormula} ${gm.explanationVi} ${gm.comparisonOrTrap} ${gm.pdfPage}`,
              gm.examType
            )
          ).map(gm => {
            const picked = progress.quizAnswers[gm.id];
            return (
              <div
                key={gm.id}
                className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-5 sm:p-6 space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-[#181614] text-[10.5px] font-extrabold uppercase">
                      {gm.examType} • Chống Bẫy Ngữ Pháp
                    </span>
                    <span className="text-[11px] font-bold text-[#51483D]">
                      PDF {gm.pdfPage}
                    </span>
                  </div>

                  <h4 className="font-serif text-base font-extrabold text-[#181614]">{gm.title}</h4>
                  <div className="p-3 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] font-mono text-xs font-bold text-[#181614] whitespace-pre-line">
                    {gm.ruleFormula}
                  </div>
                  <p className="text-xs text-[#181614] leading-relaxed">{gm.explanationVi}</p>

                  <div className="p-3 rounded-[2px] bg-[#DCC9A8] border border-[#991D27] text-xs text-[#991D27]">
                    ⚠️ <strong>Bẫy thường gặp:</strong> {gm.comparisonOrTrap}
                  </div>

                  <div className="space-y-2 text-xs">
                    {gm.examples.map((ex, idx) => (
                      <div key={idx} className="space-y-1">
                        {ex.wrong && (
                          <div
                            data-speak="true"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakWord(ex.wrong || '');
                            }}
                            title="Bấm để nghe phát âm câu tiếng Anh"
                            className="p-2.5 rounded-[2px] bg-[#E8B7AC]/45 border border-[#C92532] text-[#991D27] cursor-pointer hover:bg-[#E8B7AC]/70 transition-colors"
                          >
                            ❌ <strong>Sai:</strong> {ex.wrong}
                          </div>
                        )}
                        <div
                          data-speak="true"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(ex.correct);
                          }}
                          title="Bấm để nghe phát âm câu chuẩn xác"
                          className="p-2.5 rounded-[2px] bg-[#DCE6D5] border border-[#2E5A36] text-[#2E5A36] cursor-pointer hover:bg-[#CEE0C4] transition-colors"
                        >
                          ✅ <strong>Chuẩn xác:</strong> {ex.correct} — <em>({ex.vi})</em>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Mini-Quiz */}
                  {gm.practiceQuiz && (
                    <div className="p-3.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-2 text-xs">
                      <div className="font-bold text-[#181614]">
                        📝 Bài tập kiểm tra nhanh: {gm.practiceQuiz.question}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {gm.practiceQuiz.options.map((opt, idx) => {
                          const isSelected = picked === opt;
                          const isRight = opt === gm.practiceQuiz.correctAnswer;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectQuizAnswer(gm.id, opt, gm.id)}
                              className={`p-2 rounded-[2px] border text-left font-semibold cursor-pointer transition-all ${
                                isSelected
                                  ? isRight
                                    ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#2E5A36]'
                                    : 'bg-[#E8B7AC]/55 border-[#C92532] text-[#991D27]'
                                  : 'bg-[#F1E7D3] border-[#493B2D] hover:border-[#C92532] text-[#181614]'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {picked && (
                        <div className="text-[11px] font-semibold text-[#2E5A36] pt-1">
                          ✓ Giải thích: {gm.practiceQuiz.explanationVi}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {renderStatusControlBar(gm.id, gm.linkedChallengeDays)}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. VOCABULARY & COLLOCATIONS TAB */}
      {activeSubTab === 'vocab' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {VSTEP_PDF_VOCAB_BANK.filter(vb =>
            matchesFilters(
              vb.id,
              `${vb.word} ${vb.meaning} ${(vb.collocations || []).join(' ')} ${vb.pdfPage}`,
              vb.examType
            )
          ).map(vb => (
            <div
              key={vb.id}
              className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-serif text-base font-extrabold text-[#C92532]">{vb.word}</span>
                      <span className="font-mono text-xs text-[#51483D]">{vb.ipa}</span>
                      <span className="px-2 py-0.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-[10px] font-bold text-[#181614]">
                        {vb.pos} • {vb.level}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#181614] mt-1">{vb.meaning}</div>
                  </div>
                  <button
                    type="button"
                    data-speak="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(vb.word);
                    }}
                    className="p-2 rounded-[2px] bg-[#E9DCC2] hover:bg-[#C92532] text-[#C92532] hover:text-[#F1E7D3] border border-[#493B2D] cursor-pointer transition-colors shrink-0"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {(() => {
                  const sixCollocations = getSixCollocationsForWord(vb);
                  const twoEx = getTwoExamplesForWord(vb);
                  return (
                    <>
                      <div className="flex flex-wrap gap-1">
                        {sixCollocations.map((col, idx) => (
                          <button
                            key={idx}
                            type="button"
                            data-speak="true"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakWord(col);
                            }}
                            title="Bấm để nghe phát âm cụm từ tiếng Anh"
                            className="px-2 py-0.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] hover:border-[#C92532] text-[#991D27] text-[11px] font-semibold cursor-pointer hover:bg-[#DCC9A8] transition-colors"
                          >
                            ⚡ {col}
                          </button>
                        ))}
                      </div>

                      <div className="p-3 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-xs space-y-1">
                        <p
                          data-speak="true"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(twoEx.en1);
                          }}
                          title="Bấm để nghe phát âm câu ví dụ"
                          className="text-[#181614] hover:text-[#C92532] italic cursor-pointer transition-colors"
                        >
                          "{twoEx.en1}"
                        </p>
                        <p className="text-[#51483D] text-[11px]">🇻🇳 {twoEx.vi1}</p>
                        <p
                          data-speak="true"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(twoEx.en2);
                          }}
                          title="Bấm để nghe phát âm câu ví dụ"
                          className="text-[#181614] hover:text-[#C92532] italic pt-1 border-t border-dashed border-[#493B2D]/40 cursor-pointer transition-colors"
                        >
                          "{twoEx.en2}"
                        </p>
                        <p className="text-[#51483D] text-[11px]">🇻🇳 {twoEx.vi2}</p>
                      </div>
                    </>
                  );
                })()}

                {vb.detailedNote && (
                  <div className="text-[11px] text-[#51483D]">
                    📌 <strong>Ngữ cảnh PDF ({vb.pdfPage}):</strong> {vb.detailedNote}
                  </div>
                )}
              </div>

              {renderStatusControlBar(vb.id, vb.linkedChallengeDays)}
            </div>
          ))}
        </div>
      )}

      {/* 4. SPEAKING QUESTION BANK (PART 1, PART 2, PART 3) */}
      {activeSubTab === 'speaking' && (
        <div className="space-y-6">
          {/* Part 1 Topics */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm sm:text-base font-extrabold text-[#181614] uppercase tracking-wider flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#C92532]" />
              <span>A. Speaking Part 1 — Social Interaction ({VSTEP_PDF_SPEAKING_PART1_BANK.length} Bộ Chủ Đề Trong PDF)</span>
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {VSTEP_PDF_SPEAKING_PART1_BANK.filter(p1 =>
                matchesFilters(
                  p1.id,
                  `${p1.topicEn} ${p1.topicVi} ${p1.questions.map(q => q.questionEn + ' ' + q.upgradedSampleB2C1).join(' ')}`,
                  p1.examType
                )
              ).map(p1 => (
                <div
                  key={p1.id}
                  className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif font-extrabold text-sm text-[#181614]">
                        {p1.topicEn} ({p1.topicVi})
                      </span>
                      <span className="px-2.5 py-0.5 rounded-[2px] bg-[#E8B7AC]/45 border border-[#C92532] text-[#991D27] text-[10.5px] font-bold">
                        {p1.examType} • {p1.pdfPage}
                      </span>
                    </div>
                    {p1.questions.map((q, idx) => (
                      <div key={q.qId || idx} className="p-3 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-xs space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <strong className="text-[#181614]">Q{idx + 1}: {q.questionEn}</strong>
                          <button
                            type="button"
                            onClick={() => speakWord(q.upgradedSampleB2C1)}
                            className="text-[11px] font-bold text-[#C92532] hover:underline shrink-0 cursor-pointer"
                          >
                            🔊 Nghe mẫu
                          </button>
                        </div>
                        {q.originalPdfDraft && (
                          <div className="text-[11px] text-[#51483D]">
                            📝 <strong>Ghi chú gốc PDF:</strong> {q.originalPdfDraft}
                          </div>
                        )}
                        <p className="text-[#181614] font-serif">"{q.upgradedSampleB2C1}"</p>
                        <p className="text-[#51483D] italic">🇻🇳 {q.upgradedSampleVi}</p>
                      </div>
                    ))}
                  </div>
                  {renderStatusControlBar(p1.id, p1.linkedChallengeDays)}
                </div>
              ))}
            </div>
          </div>

          {/* Part 2 Solution Discussion */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm sm:text-base font-extrabold text-[#181614] uppercase tracking-wider flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#C92532]" />
              <span>B. Speaking Part 2 — VSTEP Solution Discussion ({VSTEP_PDF_SPEAKING_PART2_BANK.length} Tình Huống Thực Chiến Trong PDF)</span>
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {VSTEP_PDF_SPEAKING_PART2_BANK.filter(p2 =>
                matchesFilters(
                  p2.id,
                  `${p2.title} ${p2.situationEn} ${p2.situationVi} ${p2.upgradedSampleB2C1}`,
                  p2.examType
                )
              ).map(p2 => (
                <div
                  key={p2.id}
                  className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif font-extrabold text-sm text-[#181614]">{p2.title}</span>
                      <span className="px-2.5 py-0.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-[#991D27] text-[10.5px] font-bold">
                        {p2.examType} Part 2 • {p2.pdfPage}
                      </span>
                    </div>
                    <p className="font-semibold text-[#181614]">{p2.situationEn}</p>
                    <p className="text-[#51483D] italic">🇻🇳 {p2.situationVi}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {p2.options.map((opt, idx) => (
                        <div key={idx} className="p-2.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-1">
                          <div className="font-bold text-[#C92532]">Option {idx + 1}: {opt}</div>
                        </div>
                      ))}
                    </div>

                    {p2.originalPdfSpeech && (
                      <div className="p-2.5 rounded-[2px] bg-[#DCC9A8] border border-[#493B2D] text-[#181614]">
                        📄 <strong>Dàn ý / Bản nói gốc trong PDF:</strong> {p2.originalPdfSpeech}
                      </div>
                    )}

                    <div className="p-3 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#C92532]">Bài nói mẫu B2–C1 ({p2.chosenOption}):</strong>
                        <button
                          type="button"
                          onClick={() => speakWord(p2.upgradedSampleB2C1)}
                          className="text-[11px] font-bold text-[#C92532] hover:underline cursor-pointer"
                        >
                          🔊 Nghe bài nói
                        </button>
                      </div>
                      <p className="font-serif text-[#181614] leading-relaxed">"{p2.upgradedSampleB2C1}"</p>
                      <p className="text-[#51483D] italic">🇻🇳 {p2.upgradedSampleVi}</p>
                    </div>
                  </div>
                  {renderStatusControlBar(p2.id, p2.linkedChallengeDays)}
                </div>
              ))}
            </div>
          </div>

          {/* Part 3 Topic Development */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm sm:text-base font-extrabold text-[#181614] uppercase tracking-wider flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#C92532]" />
              <span>C. Speaking Part 3 — Topic Development &amp; Follow-up ({VSTEP_PDF_SPEAKING_PART3_BANK.length} Chủ Đề Trong PDF)</span>
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {VSTEP_PDF_SPEAKING_PART3_BANK.filter(p3 =>
                matchesFilters(
                  p3.id,
                  `${p3.centralStatementEn} ${p3.centralStatementVi} ${p3.upgradedSampleB2C1}`,
                  p3.examType
                )
              ).map(p3 => (
                <div
                  key={p3.id}
                  className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif font-extrabold text-sm text-[#181614]">
                        "{p3.centralStatementEn}" ({p3.centralStatementVi})
                      </span>
                      <span className="px-2.5 py-0.5 rounded-[2px] bg-[#DCE6D5] border border-[#2E5A36] text-[#2E5A36] text-[10.5px] font-bold">
                        {p3.examType} Part 3 • {p3.pdfPage}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {p3.mainIdeas.map((n, i) => (
                        <div key={i} className="p-2.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D]">
                          <div className="font-bold text-[#181614]">{n.idea}</div>
                          <div className="text-[11px] text-[#51483D] mt-0.5">{n.explanation}</div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#2E5A36]">Bài phát triển chủ đề mẫu B2–C1:</strong>
                        <button
                          type="button"
                          onClick={() => speakWord(p3.upgradedSampleB2C1)}
                          className="text-[11px] font-bold text-[#2E5A36] hover:underline cursor-pointer"
                        >
                          🔊 Nghe mẫu
                        </button>
                      </div>
                      <p className="font-serif text-[#181614] leading-relaxed">"{p3.upgradedSampleB2C1}"</p>
                      <p className="text-[#51483D] italic">🇻🇳 {p3.upgradedSampleVi}</p>
                    </div>
                  </div>
                  {renderStatusControlBar(p3.id, p3.linkedChallengeDays)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. WRITING QUESTION BANK (ORIGINAL PDF DRAFTS + BAND 7.5+ SAMPLES) */}
      {activeSubTab === 'writing' && (
        <div className="space-y-5">
          {VSTEP_PDF_WRITING_BANK.filter(w =>
            matchesFilters(
              w.id,
              `${w.topicTitle} ${w.promptEn} ${w.promptVi} ${w.upgradedBand75Essay} ${w.originalAuthorEssay || ''}`,
              w.examType
            )
          ).map(w => {
            const tabMode = writingViewTab[w.id] || 'upgraded';
            return (
              <div
                key={w.id}
                className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#493B2D]/35">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2.5 py-0.5 rounded-[2px] bg-[#C92532] text-[#F1E7D3] text-[10.5px] font-extrabold">
                        {w.examType} • {w.taskCategory}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-[#991D27] text-[10.5px] font-bold">
                        {w.essayType} • PDF {w.pdfPage}
                      </span>
                    </div>
                    <h4 className="font-serif text-base sm:text-lg font-extrabold text-[#181614]">{w.topicTitle}</h4>
                  </div>

                  <div className="flex items-center gap-1 bg-[#E9DCC2] p-1 rounded-[2px] border border-[#493B2D] text-xs">
                    <button
                      type="button"
                      onClick={() => setWritingViewTab(prev => ({ ...prev, [w.id]: 'upgraded' }))}
                      className={`px-3 py-1.5 rounded-[2px] font-bold cursor-pointer ${
                        tabMode === 'upgraded' ? 'bg-[#C92532] text-[#F1E7D3]' : 'text-[#51483D]'
                      }`}
                    >
                      Bản biên tập Band 7.5+
                    </button>
                    <button
                      type="button"
                      onClick={() => setWritingViewTab(prev => ({ ...prev, [w.id]: 'original' }))}
                      className={`px-3 py-1.5 rounded-[2px] font-bold cursor-pointer ${
                        tabMode === 'original' ? 'bg-[#181614] text-[#F1E7D3]' : 'text-[#51483D]'
                      }`}
                    >
                      Bản gốc từ PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setWritingViewTab(prev => ({ ...prev, [w.id]: 'outline' }))}
                      className={`px-3 py-1.5 rounded-[2px] font-bold cursor-pointer ${
                        tabMode === 'outline' ? 'bg-[#2E5A36] text-[#F1E7D3]' : 'text-[#51483D]'
                      }`}
                    >
                      Dàn ý &amp; Ghi chú cá nhân
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-xs sm:text-sm space-y-1">
                  <div className="font-bold text-[#181614]">📌 Đề bài: {w.promptEn}</div>
                  <div className="text-xs text-[#51483D]">🇻🇳 {w.promptVi}</div>
                </div>

                {tabMode === 'upgraded' && (
                  <div className="p-4 sm:p-5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase text-[#C92532]">
                        🌟 Bài Mẫu Nâng Cấp Chuẩn B2–C1 (Band 7.5+):
                      </span>
                      <button
                        type="button"
                        onClick={() => speakWord(w.upgradedBand75Essay)}
                        className="px-3 py-1 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D] text-[#C92532] hover:bg-[#C92532] hover:text-[#F1E7D3] text-xs font-bold cursor-pointer transition-colors"
                      >
                        🔊 Nghe bài viết
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm font-serif text-[#181614] whitespace-pre-line leading-relaxed">
                      {w.upgradedBand75Essay}
                    </p>
                    <p className="text-xs text-[#51483D] italic pt-2 border-t border-[#493B2D]/35">
                      🇻🇳 <strong>Bản dịch tiếng Việt:</strong> {w.upgradedEssayVi}
                    </p>
                  </div>
                )}

                {tabMode === 'original' && (
                  <div className="p-4 sm:p-5 rounded-[2px] bg-[#DCC9A8]/65 border border-[#493B2D] space-y-2">
                    <div className="text-xs font-extrabold uppercase text-[#181614]">
                      📄 Bản Viết Gốc Trong Tài Liệu PDF Của Bạn (Bảo Toàn Nguyên Văn):
                    </div>
                    <p className="text-xs sm:text-sm font-serif text-[#181614] whitespace-pre-line leading-relaxed">
                      {w.originalAuthorEssay ||
                        'Trong file PDF gốc, đề bài này đang ở dạng dàn ý / ghi chú từ vựng và câu mở bài (chưa có bài viết nháp hoàn chỉnh). Bạn có thể xem phần Dàn ý & Ghi chú cá nhân hoặc Bản biên tập Band 7.5+.'}
                    </p>
                  </div>
                )}

                {tabMode === 'outline' && (
                  <div className="p-4 sm:p-5 rounded-[2px] bg-[#DCE6D5] border border-[#2E5A36] space-y-2.5 text-xs">
                    <div className="font-extrabold uppercase text-[#2E5A36]">
                      🗂️ Dàn Ý Chi Tiết &amp; Ghi Chú Cá Nhân Từ PDF:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[#181614]">
                      <li><strong>Introduction:</strong> {w.outline.intro}</li>
                      <li><strong>Body Paragraph 1:</strong> {w.outline.body1}</li>
                      <li><strong>Body Paragraph 2:</strong> {w.outline.body2}</li>
                      <li><strong>Conclusion:</strong> {w.outline.conclusion}</li>
                    </ul>
                    {w.authorSelfNotes && (
                      <div className="p-3 rounded-[2px] bg-[#F1E7D3] border border-[#2E5A36] text-[#2E5A36]">
                        💡 <strong>Ghi chú cá nhân trong PDF:</strong> {w.authorSelfNotes}
                      </div>
                    )}
                  </div>
                )}

                {renderStatusControlBar(w.id, w.linkedChallengeDays)}
              </div>
            );
          })}
        </div>
      )}

      {/* 6. LISTENING & STRATEGY TAB */}
      {activeSubTab === 'listening' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {VSTEP_PDF_LISTENING_BANK.filter(ls =>
            matchesFilters(ls.id, `${ls.title} ${ls.transcriptEn} ${ls.questionEn}`, ls.examType)
          ).map(ls => {
            const picked = progress.quizAnswers[ls.id];
            return (
              <div
                key={ls.id}
                className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-5 sm:p-6 space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif font-extrabold text-sm text-[#181614]">{ls.title}</span>
                    <span className="px-2.5 py-0.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-[#991D27] font-bold text-[10.5px]">
                      PDF {ls.pdfPage}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#C92532]">Transcript / Quy trình:</strong>
                      <button
                        type="button"
                        onClick={() => speakWord(ls.transcriptEn)}
                        className="px-2.5 py-1 rounded-[2px] bg-[#C92532] text-[#F1E7D3] border border-[#181614] text-[11px] font-bold cursor-pointer"
                      >
                        🔊 Nghe Audio
                      </button>
                    </div>
                    <p className="font-serif text-[#181614] whitespace-pre-line leading-relaxed">
                      {ls.transcriptEn}
                    </p>
                    <p className="text-[#51483D] italic">🇻🇳 {ls.transcriptVi}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="font-bold text-[#181614]">❓ {ls.questionEn}</div>
                    {ls.options && ls.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ls.options.map((opt, idx) => {
                          const isSelected = picked === opt;
                          const isRight = opt === ls.correctOption;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectQuizAnswer(ls.id, opt, ls.id)}
                              className={`p-2.5 rounded-[2px] border text-left font-semibold cursor-pointer ${
                                isSelected
                                  ? isRight
                                    ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#2E5A36]'
                                    : 'bg-[#E8B7AC]/55 border-[#C92532] text-[#991D27]'
                                  : 'bg-[#E9DCC2] border-[#493B2D] hover:border-[#C92532] text-[#181614]'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {(picked || !ls.options?.length) && (
                      <div className="p-2.5 rounded-[2px] bg-[#DCE6D5] border border-[#2E5A36] text-[#2E5A36]">
                        ✓ <strong>Bằng chứng &amp; Giải thích:</strong> {ls.keyEvidenceExplanation}
                      </div>
                    )}
                  </div>
                </div>

                {renderStatusControlBar(ls.id, ls.linkedChallengeDays)}
              </div>
            );
          })}
        </div>
      )}

      {/* 7. STUDY NOTES & NEEDS REVIEW TAB */}
      {activeSubTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {VSTEP_PDF_STUDY_NOTES.map(note => (
            <div
              key={note.id}
              className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-[#991D27] font-bold text-[10.5px]">
                    PDF {note.pdfPage} • {note.reviewStatus === 'needs_review' ? 'Cần bổ sung / Ôn tập' : 'Đã hoàn chỉnh'}
                  </span>
                </div>
                <h4 className="font-serif text-sm font-extrabold text-[#181614]">{note.title}</h4>
                <p className="text-[#51483D] leading-relaxed">
                  <strong>Ghi chú gốc PDF:</strong> {note.originalNoteText}
                </p>
                <p className="text-[#2E5A36] bg-[#DCE6D5] p-2.5 rounded-[2px] border border-[#2E5A36] leading-relaxed">
                  💡 <strong>Hướng dẫn hệ thống:</strong> {note.systemActionableAdvice}
                </p>
              </div>
              {renderStatusControlBar(note.id, note.linkedChallengeDays)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
