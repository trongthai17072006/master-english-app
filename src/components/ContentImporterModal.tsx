import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Upload,
  BookOpen,
  Layers,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trash2,
  FileCode,
  Sparkles,
  Copy,
  Lock,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Unlock
} from 'lucide-react';
import {
  loadCustomContentStore,
  addCustomVocabItem,
  addCustomStructureItem,
  saveCustomChallengeDayOverride,
  removeCustomVocabItem,
  removeCustomStructureItem,
  importBulkContentFromText,
  CUSTOM_CONTENT_EVENT,
  CustomContentStoreData
} from '../services/customContentStore';
import { StructureCategory, DifficultyBand } from '../data/expandedPdfLibraryData';
import { useAdminAccess } from '../utils/adminAuth';
import { useAnalytics } from '../context/AnalyticsContext';

interface ContentImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'vocab' | 'structures' | 'challenge_day';
  defaultDay?: number;
}

const SAMPLE_VOCAB_JSON = JSON.stringify(
  [
    {
      word: 'epistemological',
      pos: 'adj.',
      ipa: '/ɪˌpɪs.tə.məˈlɒdʒ.ɪ.kəl/',
      meaning: 'thuộc về nhận thức luận / bản chất tri thức',
      collocations: ['epistemological shift', 'epistemological foundation', 'epistemological inquiry'],
      exampleEn: 'Artificial intelligence has triggered a profound epistemological shift in academic research.',
      exampleVi: 'Trí tuệ nhân tạo đã kích hoạt một sự dịch chuyển sâu sắc về mặt nhận thức luận trong nghiên cứu học thuật.',
      day: 1
    }
  ],
  null,
  2
);

const SAMPLE_VOCAB_CSV = `epistemological | adj. | /ɪˌpɪs.tə.məˈlɒdʒ.ɪ.kəl/ | thuộc về nhận thức luận | epistemological shift | Artificial intelligence has triggered an epistemological shift. | Trí tuệ nhân tạo đã tạo ra bước ngoặt nhận thức luận.`;

const SAMPLE_STRUCTURE_JSON = JSON.stringify(
  [
    {
      structureName: 'Little do/does + S + realize that + Clause',
      formula: 'Little + do/does/did + S + V(bare) + that + S + V',
      meaningVi: 'Hiếm khi / Hầu như không nhận ra rằng... (Đảo ngữ nhấn mạnh nhận thức)',
      whenToUse: 'Dùng ở câu mở đoạn Body hoặc câu dẫn nhập IELTS Writing Task 2 để chỉ ra một góc khuất ít người để ý.',
      category: 'advanced-variations',
      difficulty: 'Band 8.0+',
      exampleEn: 'Little do consumers realize that fast fashion inflicts irreversible damage on freshwater ecosystems.',
      exampleVi: 'Người tiêu dùng hầu như không nhận ra rằng thời trang nhanh gây ra tổn hại không thể đảo ngược cho hệ sinh thái nước ngọt.'
    }
  ],
  null,
  2
);

export const ContentImporterModal: React.FC<ContentImporterModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'vocab',
  defaultDay = 1
}) => {
  const { userProfile } = useAnalytics();
  const {
    isAdmin,
    isAdminAuthenticated,
    adminEmail,
    currentUserEmail,
    unlockWithSecretKey,
    lockSession
  } = useAdminAccess(userProfile?.email);

  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<'vocab' | 'structures' | 'challenge_day'>(defaultTab);
  const [inputMode, setInputMode] = useState<'form' | 'bulk' | 'manage'>('form');
  const [storeData, setStoreData] = useState<CustomContentStoreData>(() => loadCustomContentStore());
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Vocab Form State
  const [vWord, setVWord] = useState('');
  const [vIpa, setVIpa] = useState('');
  const [vPos, setVPos] = useState<'n.' | 'v.' | 'adj.' | 'adv.' | 'phr.'>('n.');
  const [vMeaning, setVMeaning] = useState('');
  const [vCollocations, setVCollocations] = useState('');
  const [vExampleEn, setVExampleEn] = useState('');
  const [vExampleVi, setVExampleVi] = useState('');
  const [vTargetDay, setVTargetDay] = useState<number>(defaultDay);

  // Structure Form State
  const [sName, setSName] = useState('');
  const [sFormula, setSFormula] = useState('');
  const [sMeaning, setSMeaning] = useState('');
  const [sWhenToUse, setSWhenToUse] = useState('');
  const [sCategory, setSCategory] = useState<StructureCategory>('academic-structures');
  const [sDifficulty, setSDifficulty] = useState<DifficultyBand>('Band 7.0–7.5');
  const [sExampleEn, setSExampleEn] = useState('');
  const [sExampleVi, setSExampleVi] = useState('');
  const [sNotes, setSNotes] = useState('');

  // Challenge Day Override Form State
  const [cDay, setCDay] = useState<number>(defaultDay);
  const [cThemeVi, setCThemeVi] = useState('');
  const [cThemeEn, setCThemeEn] = useState('');
  const [cWritingPrompt, setCWritingPrompt] = useState('');
  const [cWritingPromptVi, setCWritingPromptVi] = useState('');
  const [cIntroOutline, setCIntroOutline] = useState('');
  const [cBody1Outline, setCBody1Outline] = useState('');
  const [cBody2Outline, setCBody2Outline] = useState('');
  const [cConclusionOutline, setCConclusionOutline] = useState('');

  // Bulk JSON / CSV State
  const [bulkText, setBulkText] = useState('');

  useEffect(() => {
    setActiveCategory(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    setVTargetDay(defaultDay);
    setCDay(defaultDay);
  }, [defaultDay]);

  useEffect(() => {
    const refresh = () => setStoreData(loadCustomContentStore());
    window.addEventListener(CUSTOM_CONTENT_EVENT, refresh);
    return () => window.removeEventListener(CUSTOM_CONTENT_EVENT, refresh);
  }, []);

  if (!isOpen) return null;

  const showNotice = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(prev => (prev?.text === text ? null : prev));
    }, 5000);
  };

  const handleUnlockSecretGate = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const result = unlockWithSecretKey(secretKeyInput);
    if (!result.success) {
      setAuthError(result.message);
      return;
    }
    setSecretKeyInput('');
    showNotice('success', result.message);
  };

  const handleSaveVocabForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vWord.trim() || !vMeaning.trim()) {
      showNotice('error', 'Vui lòng nhập đầy đủ Từ vựng và Nghĩa tiếng Việt.');
      return;
    }
    const collocationsList = vCollocations
      .split(/[,;|]/)
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const res = addCustomVocabItem({
        word: vWord,
        ipa: vIpa,
        type: vPos,
        level: 'C1',
        meaning: vMeaning,
        collocations: collocationsList,
        exampleEn:
          vExampleEn.trim() ||
          `Modern educators emphasize the role of ${vWord.trim()} in academic success.`,
        exampleVi:
          vExampleVi.trim() ||
          `Các nhà giáo dục hiện đại nhấn mạnh vai trò của ${vMeaning.trim().toLowerCase()} trong thành công học thuật.`,
        targetDay: vTargetDay
      });

      setVWord('');
      setVIpa('');
      setVMeaning('');
      setVCollocations('');
      setVExampleEn('');
      setVExampleVi('');
      setStoreData(loadCustomContentStore());
      showNotice(
        'success',
        `Đã lưu từ "${res.vocabItem.word}" vào Kho từ vựng mở rộng${res.addedToDay ? ` & Ngày ${res.addedToDay} (Lộ trình 60 ngày)` : ''}!`
      );
    } catch (err: any) {
      showNotice('error', err?.message || 'Không thể lưu từ vựng.');
    }
  };

  const handleSaveStructureForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim() || !sFormula.trim() || !sMeaning.trim()) {
      showNotice('error', 'Vui lòng nhập Tên cấu trúc, Công thức và Nghĩa tiếng Việt.');
      return;
    }
    try {
      const record = addCustomStructureItem({
        structureName: sName,
        formula: sFormula,
        meaningVi: sMeaning,
        whenToUse: sWhenToUse,
        category: sCategory,
        difficulty: sDifficulty,
        exampleEn:
          sExampleEn.trim() ||
          'Applying this syntactic pattern elevates the academic tone of your IELTS essay.',
        exampleVi:
          sExampleVi.trim() ||
          'Áp dụng cấu trúc cú pháp này giúp nâng tầm văn phong học thuật cho bài luận IELTS.',
        notes: sNotes
      });

      setSName('');
      setSFormula('');
      setSMeaning('');
      setSWhenToUse('');
      setSExampleEn('');
      setSExampleVi('');
      setSNotes('');
      setStoreData(loadCustomContentStore());
      showNotice(
        'success',
        `Đã nạp cấu trúc mới #${record.pdfItemNumber} ("${record.structureName}") vào Danh mục Công thức!`
      );
    } catch (err: any) {
      showNotice('error', err?.message || 'Không thể nạp cấu trúc.');
    }
  };

  const handleSaveChallengeDayForm = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      saveCustomChallengeDayOverride({
        day: cDay,
        themeVi: cThemeVi.trim() || undefined,
        themeEn: cThemeEn.trim() || undefined,
        writingPrompt: cWritingPrompt.trim() || undefined,
        writingPromptVi: cWritingPromptVi.trim() || undefined,
        writingOutline:
          cIntroOutline.trim() && cBody1Outline.trim()
            ? {
                introduction: cIntroOutline.trim(),
                bodyParagraph1: cBody1Outline.trim(),
                bodyParagraph2: cBody2Outline.trim() || 'Phân tích góc nhìn đối lập và giải pháp.',
                conclusion: cConclusionOutline.trim() || 'Khẳng định lại quan điểm và tóm tắt luận điểm.'
              }
            : undefined,
        updatedAt: Date.now()
      });
      setStoreData(loadCustomContentStore());
      showNotice('success', `Đã lưu bản cập nhật nội dung cho Ngày ${cDay}/60 thành công!`);
    } catch (err: any) {
      showNotice('error', err?.message || 'Không thể lưu cập nhật lộ trình.');
    }
  };

  const handleBulkImport = () => {
    try {
      const result = importBulkContentFromText(activeCategory, bulkText, vTargetDay);
      setBulkText('');
      setStoreData(loadCustomContentStore());
      showNotice('success', result.message);
    } catch (err: any) {
      showNotice('error', err?.message || 'Lỗi định dạng JSON/CSV. Vui lòng kiểm tra lại dữ liệu.');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#FAF7F2] border border-[#E8E0D5] rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B1D1D] via-[#B83226] to-[#9E241A] px-6 py-4 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
              {isAdminAuthenticated ? (
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              ) : (
                <Lock className="w-5 h-5 text-amber-200" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200 block">
                RBAC PROTECTED • ADMIN CONTENT IMPORTER
              </span>
              <h2 className="text-lg font-black tracking-tight">
                + Nạp / Mở Rộng Dữ Liệu Học Tập (Admin Only)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  lockSession();
                  setFeedback(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-black/25 hover:bg-black/40 border border-white/20 text-[11px] font-bold text-amber-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Khóa lại phiên Admin ngay lập tức"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Khóa phiên Admin</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LỚP BẢO VỆ 1: TỪ CHỐI TRUY CẬP NẾU KHÔNG PHẢI EMAIL ADMIN */}
        {!isAdmin ? (
          <div className="p-8 text-center space-y-4 bg-white">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-[#B83226] flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-extrabold text-[#231E1A]">
                Truy Cập Bị Từ Chối (403 Forbidden — Admin Only)
              </h3>
              <p className="text-xs text-[#635A52] leading-relaxed">
                Mô-đun <strong>+ Nạp / Mở rộng dữ liệu học</strong> được bảo vệ phân quyền nghiêm ngặt (RBAC). Chỉ duy nhất tài khoản Admin đã định danh mới có quyền truy cập.
              </p>
              <p className="text-[11px] font-mono text-[#8C7F6E] pt-1">
                Tài khoản hiện tại: {currentUserEmail || 'Khách (Guest)'}
              </p>
            </div>
          </div>
        ) : !isAdminAuthenticated ? (
          /* LỚP BẢO VỆ 2: MODAL YÊU CẦU NHẬP ĐÚNG VITE_ADMIN_SECRET_KEY TRƯỚC KHI MỞ KHÓA FORM */
          <div className="p-6 sm:p-8 bg-white">
            <form
              onSubmit={handleUnlockSecretGate}
              className="max-w-md mx-auto bg-[#FAF7F2] border border-[#E8DFD5] rounded-2xl p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#FFF1F0] border border-[#FECACA] text-[#B83226] flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B83226] block">
                    XÁC THỰC BẢO MẬT 2 LỚP (ADMIN GATE)
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-[#231E1A]">
                    Nhập Khóa Bí Mật Admin Để Mở Khóa
                  </h3>
                  <p className="text-xs text-[#635A52] mt-1 leading-relaxed">
                    Tài khoản Admin <strong className="font-mono text-[#231E1A]">{adminEmail}</strong> đã được nhận diện. Vui lòng nhập <code className="font-mono font-bold text-[#B83226]">VITE_ADMIN_SECRET_KEY</code> để mở khóa biểu mẫu nạp và ghi dữ liệu.
                  </p>
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1.5">
                  Mã khóa bí mật Admin (VITE_ADMIN_SECRET_KEY) *
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  value={secretKeyInput}
                  onChange={e => setSecretKeyInput(e.target.value)}
                  placeholder="Nhập VITE_ADMIN_SECRET_KEY (hoặc MASTER_ADMIN_2026)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DED4C6] bg-white text-sm font-mono text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[#E5DDD0] bg-white hover:bg-[#FAF7F2] text-xs font-bold text-[#5C5346] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#B83226] hover:bg-[#9E241A] text-white text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Xác Thực &amp; Mở Khóa Nạp Dữ Liệu</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>

        {/* Category & Mode Switcher */}
        <div className="px-6 pt-4 pb-3 bg-white border-b border-[#EAE2D6] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-[#F5EFE6] p-1 rounded-xl border border-[#E5DDD0]">
            <button
              type="button"
              onClick={() => setActiveCategory('vocab')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'vocab'
                  ? 'bg-[#B83226] text-white shadow-xs'
                  : 'text-[#5C5346] hover:text-[#1F1A15]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Từ Vựng ({storeData.customVocab.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('structures')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'structures'
                  ? 'bg-[#B83226] text-white shadow-xs'
                  : 'text-[#5C5346] hover:text-[#1F1A15]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Cấu Trúc #78+ ({storeData.customStructures.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('challenge_day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'challenge_day'
                  ? 'bg-[#B83226] text-white shadow-xs'
                  : 'text-[#5C5346] hover:text-[#1F1A15]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Lộ Trình 60 Ngày ({Object.keys(storeData.customChallengeDays).length})
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setInputMode('form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                inputMode === 'form'
                  ? 'bg-[#FFF5F5] text-[#B83226] border-[#F2C4C0]'
                  : 'bg-white text-[#6B5E4C] border-[#E5DDD0] hover:bg-[#FAF7F2]'
              }`}
            >
              Biểu mẫu trực tiếp
            </button>
            <button
              type="button"
              onClick={() => setInputMode('bulk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                inputMode === 'bulk'
                  ? 'bg-[#FFF5F5] text-[#B83226] border-[#F2C4C0]'
                  : 'bg-white text-[#6B5E4C] border-[#E5DDD0] hover:bg-[#FAF7F2]'
              }`}
            >
              Dán JSON / CSV hàng loạt
            </button>
            <button
              type="button"
              onClick={() => setInputMode('manage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                inputMode === 'manage'
                  ? 'bg-[#FFF5F5] text-[#B83226] border-[#F2C4C0]'
                  : 'bg-white text-[#6B5E4C] border-[#E5DDD0] hover:bg-[#FAF7F2]'
              }`}
            >
              Đã nạp ({storeData.customVocab.length + storeData.customStructures.length})
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`mx-6 mt-4 px-4 py-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {inputMode === 'form' && activeCategory === 'vocab' && (
            <form onSubmit={handleSaveVocabForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Từ vựng học thuật (Word) *
                  </label>
                  <input
                    type="text"
                    value={vWord}
                    onChange={e => setVWord(e.target.value)}
                    placeholder="VD: epistemological"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm font-bold text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Từ loại (POS)
                  </label>
                  <select
                    value={vPos}
                    onChange={e => setVPos(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm font-bold text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  >
                    <option value="n.">n. (Danh từ)</option>
                    <option value="v.">v. (Động từ)</option>
                    <option value="adj.">adj. (Tính từ)</option>
                    <option value="adv.">adv. (Trạng từ)</option>
                    <option value="phr.">phr. (Cụm từ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Gắn vào Ngày (1–60)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={vTargetDay}
                    onChange={e => setVTargetDay(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm font-bold text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Phiên âm IPA
                  </label>
                  <input
                    type="text"
                    value={vIpa}
                    onChange={e => setVIpa(e.target.value)}
                    placeholder="VD: /ɪˌpɪs.tə.məˈlɒdʒ.ɪ.kəl/"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Nghĩa tiếng Việt chuẩn học thuật *
                  </label>
                  <input
                    type="text"
                    value={vMeaning}
                    onChange={e => setVMeaning(e.target.value)}
                    placeholder="VD: thuộc về nhận thức luận / bản chất tri thức"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm font-semibold text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                  Cụm từ đi kèm (Collocations — phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={vCollocations}
                  onChange={e => setVCollocations(e.target.value)}
                  placeholder="VD: epistemological shift, epistemological framework, epistemological inquiry"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Câu ví dụ tiếng Anh (Academic Context)
                  </label>
                  <textarea
                    rows={2}
                    value={vExampleEn}
                    onChange={e => setVExampleEn(e.target.value)}
                    placeholder="VD: AI has triggered an epistemological shift in modern education."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Dịch nghĩa câu ví dụ tiếng Việt
                  </label>
                  <textarea
                    rows={2}
                    value={vExampleVi}
                    onChange={e => setVExampleVi(e.target.value)}
                    placeholder="VD: AI đã tạo ra bước dịch chuyển nhận thức luận trong giáo dục hiện đại."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B83226] hover:bg-[#9E241A] text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Lưu Từ Vựng Vào Hệ Thống
                </button>
              </div>
            </form>
          )}

          {inputMode === 'form' && activeCategory === 'structures' && (
            <form onSubmit={handleSaveStructureForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Tên cấu trúc / Mẫu câu (#78+) *
                  </label>
                  <input
                    type="text"
                    value={sName}
                    onChange={e => setSName(e.target.value)}
                    placeholder="VD: Little do/does + S + realize that..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm font-bold text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Công thức tổng quát (Formula) *
                  </label>
                  <input
                    type="text"
                    value={sFormula}
                    onChange={e => setSFormula(e.target.value)}
                    placeholder="VD: Little + do/does/did + S + V(bare) + that + Clause"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm font-mono text-[#B83226] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Nghĩa tiếng Việt *
                  </label>
                  <input
                    type="text"
                    value={sMeaning}
                    onChange={e => setSMeaning(e.target.value)}
                    placeholder="VD: Hầu như không nhận ra rằng..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Nhóm danh mục
                  </label>
                  <select
                    value={sCategory}
                    onChange={e => setSCategory(e.target.value as StructureCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm font-semibold text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  >
                    <option value="academic-structures">Cấu trúc Câu Học thuật</option>
                    <option value="grammar-formulas">Công thức Ngữ pháp & Mẫu câu</option>
                    <option value="ielts-vstep">Mẫu câu IELTS Writing & VSTEP</option>
                    <option value="advanced-variations">Biến thể Nâng cao (Đảo ngữ & Câu chẻ)</option>
                    <option value="everyday-communication">Giao tiếp & Phản xạ Speaking</option>
                    <option value="mistakes-transformations">So sánh & Chuyển đổi câu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Band mục tiêu
                  </label>
                  <select
                    value={sDifficulty}
                    onChange={e => setSDifficulty(e.target.value as DifficultyBand)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm font-semibold text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  >
                    <option value="Band 6.0–6.5">Band 6.0–6.5</option>
                    <option value="Band 7.0–7.5">Band 7.0–7.5</option>
                    <option value="Band 8.0+">Band 8.0+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                  Ngữ cảnh sử dụng (When to use)
                </label>
                <input
                  type="text"
                  value={sWhenToUse}
                  onChange={e => setSWhenToUse(e.target.value)}
                  placeholder="VD: Dùng khi muốn nhấn mạnh một hệ lụy tiềm ẩn ít người chú ý trong Writing Task 2"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Câu ví dụ mẫu tiếng Anh
                  </label>
                  <textarea
                    rows={2}
                    value={sExampleEn}
                    onChange={e => setSExampleEn(e.target.value)}
                    placeholder="VD: Little do consumers realize that fast fashion pollutes clean water."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Dịch nghĩa tiếng Việt
                  </label>
                  <textarea
                    rows={2}
                    value={sExampleVi}
                    onChange={e => setSExampleVi(e.target.value)}
                    placeholder="VD: Người tiêu dùng hầu như không nhận ra thời trang nhanh gây ô nhiễm nguồn nước."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B83226] hover:bg-[#9E241A] text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Nạp Cấu Trúc Mới Vào Danh Mục
                </button>
              </div>
            </form>
          )}

          {inputMode === 'form' && activeCategory === 'challenge_day' && (
            <form onSubmit={handleSaveChallengeDayForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Chọn Ngày học (1 → 60)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={cDay}
                    onChange={e => setCDay(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm font-bold text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Chủ đề tiếng Việt (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={cThemeVi}
                    onChange={e => setCThemeVi(e.target.value)}
                    placeholder="Để trống nếu giữ chủ đề gốc"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Chủ đề tiếng Anh (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={cThemeEn}
                    onChange={e => setCThemeEn(e.target.value)}
                    placeholder="VD: Digital Pedagogy & AI"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Đề bài Writing Task 2 mới (Tiếng Anh)
                  </label>
                  <textarea
                    rows={2}
                    value={cWritingPrompt}
                    onChange={e => setCWritingPrompt(e.target.value)}
                    placeholder="Nhập đề bài IELTS Writing Task 2 tùy chỉnh cho ngày này..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Dịch đề bài Writing Task 2 (Tiếng Việt)
                  </label>
                  <textarea
                    rows={2}
                    value={cWritingPromptVi}
                    onChange={e => setCWritingPromptVi(e.target.value)}
                    placeholder="Bản dịch tiếng Việt của đề bài..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Dàn ý Mở bài (Introduction Outline)
                  </label>
                  <input
                    type="text"
                    value={cIntroOutline}
                    onChange={e => setCIntroOutline(e.target.value)}
                    placeholder="Paraphrase đề bài + Thesis statement..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5C5346] mb-1">
                    Dàn ý Thân bài 1 (Body 1 Outline)
                  </label>
                  <input
                    type="text"
                    value={cBody1Outline}
                    onChange={e => setCBody1Outline(e.target.value)}
                    placeholder="Luận điểm chính 1 + Dẫn chứng..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C6] bg-white text-sm text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B83226] hover:bg-[#9E241A] text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Cập Nhật Nội Dung Ngày {cDay}/60
                </button>
              </div>
            </form>
          )}

          {inputMode === 'bulk' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3.5 rounded-xl border border-[#E5DDD0]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#4A4238]">
                  <FileCode className="w-4 h-4 text-[#B83226]" />
                  <span>
                    Dán mảng <strong>JSON</strong> hoặc từng dòng <strong>CSV / ngăn cách bằng dấu |</strong> để nạp hàng loạt:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setBulkText(activeCategory === 'structures' ? SAMPLE_STRUCTURE_JSON : SAMPLE_VOCAB_JSON)
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#F0E9DF] border border-[#DED4C6] text-[11px] font-bold text-[#5C5346] cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    Chèn mẫu JSON
                  </button>
                  {activeCategory === 'vocab' && (
                    <button
                      type="button"
                      onClick={() => setBulkText(SAMPLE_VOCAB_CSV)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#F0E9DF] border border-[#DED4C6] text-[11px] font-bold text-[#5C5346] cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      Chèn mẫu CSV
                    </button>
                  )}
                </div>
              </div>

              <textarea
                rows={9}
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                placeholder={
                  activeCategory === 'structures'
                    ? SAMPLE_STRUCTURE_JSON
                    : SAMPLE_VOCAB_JSON
                }
                className="w-full p-4 rounded-xl border border-[#DED4C6] bg-white font-mono text-xs text-[#1F1A15] focus:outline-none focus:border-[#B83226]"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6B5E4C]">
                  Dữ liệu sau khi nạp sẽ được lưu bền vững vào <code>localStorage</code> và tự động đồng bộ vào bài học.
                </span>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B83226] hover:bg-[#9E241A] text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Thực Thi Nạp Dữ Liệu Hàng Loạt
                </button>
              </div>
            </div>
          )}

          {inputMode === 'manage' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5C5346] mb-2">
                  Từ vựng mở rộng đã nạp ({storeData.customVocab.length})
                </h3>
                {storeData.customVocab.length === 0 ? (
                  <p className="text-xs text-[#8C7F6E] bg-white p-4 rounded-xl border border-[#EAE2D6]">
                    Chưa có từ vựng tùy chỉnh nào. Hãy chuyển sang tab Biểu mẫu hoặc Dán JSON/CSV để thêm mới.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {storeData.customVocab.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#EAE2D6]"
                      >
                        <div>
                          <span className="font-bold text-sm text-[#1F1A15] mr-2">{item.word}</span>
                          <span className="text-xs font-mono text-[#8C7F6E] mr-2">{item.ipa}</span>
                          <span className="text-xs font-semibold text-[#B83226]">({item.pos})</span>
                          <p className="text-xs text-[#5C5346] mt-0.5">{item.meaning}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCustomVocabItem(item.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa từ này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5C5346] mb-2">
                  Cấu trúc học thuật mở rộng (#78+) đã nạp ({storeData.customStructures.length})
                </h3>
                {storeData.customStructures.length === 0 ? (
                  <p className="text-xs text-[#8C7F6E] bg-white p-4 rounded-xl border border-[#EAE2D6]">
                    Chưa có cấu trúc mở rộng nào ngoài 77 cấu trúc gốc.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {storeData.customStructures.map(st => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#EAE2D6]"
                      >
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded bg-[#FFF5F5] text-[#B83226] font-extrabold text-[10px] mr-2">
                            #{st.pdfItemNumber}
                          </span>
                          <span className="font-bold text-sm text-[#1F1A15]">{st.structureName}</span>
                          <p className="text-xs text-[#5C5346] mt-0.5">{st.meaningVi}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCustomStructureItem(st.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa cấu trúc này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};
