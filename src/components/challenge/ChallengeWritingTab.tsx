import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Clock,
  Save,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  History,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  Tag,
  Languages,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  X,
  Keyboard,
  FolderOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChallengeWritingTask, ChallengeVocabWord } from '../../data/challenge60Data';
import {
  getWritingDraft,
  saveWritingDraft,
  saveWritingSubmission,
  getWritingHistory,
  getAllUserWritingLogs,
  updateDayTaskStatus,
  WritingSubmissionRecord
} from '../../utils/challengeStorage';
import { getLinkedPdfResourcesForDay } from '../../data/vstepPdfKnowledgeBankData';
import { evaluateIeltsEssay, WritingEvaluationResult } from '../../utils/writingEvaluator';
import { speakWord } from '../../utils/soundAndSpeech';
import { renderTextWithHighlightedVocab } from '../../utils/highlightTargetWords';
import { RubyWritingBox } from '../RubyWritingBox';
import {
  VINTAGE_EDITORIAL_ASSETS,
  VintageEngravingFrame
} from '../VintageNewspaperIllustrations';

interface ChallengeWritingTabProps {
  day: number;
  writingTask: ChallengeWritingTask;
  dayVocabList?: ChallengeVocabWord[];
  isCompleted: boolean;
  onStatusChange: () => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: (next: boolean) => void;
}

export const ChallengeWritingTab: React.FC<ChallengeWritingTabProps> = ({
  day,
  writingTask,
  dayVocabList = [],
  isCompleted,
  onStatusChange,
  isFocusMode: externalFocusMode,
  onToggleFocusMode
}) => {
  const [essayText, setEssayText] = useState<string>('');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentFeedback, setCurrentFeedback] = useState<WritingEvaluationResult | null>(null);
  const [historyList, setHistoryList] = useState<WritingSubmissionRecord[]>([]);
  const [allLogsList, setAllLogsList] = useState<WritingSubmissionRecord[]>([]);
  const [historyViewMode, setHistoryViewMode] = useState<'current_day' | 'all_days'>('current_day');

  // Internal fallback if parent doesn't pass Focus Mode props
  const [internalFocusMode, setInternalFocusMode] = useState<boolean>(false);
  const internalScrollYRef = useRef<number>(0);
  const isFocusMode = externalFocusMode !== undefined ? externalFocusMode : internalFocusMode;

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('master-english-focus-mode', {
        detail: { active: isFocusMode }
      })
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent('master-english-focus-mode', {
          detail: { active: false }
        })
      );
    };
  }, [isFocusMode]);

  const handleToggleFocus = () => {
    const next = !isFocusMode;
    if (onToggleFocusMode) {
      onToggleFocusMode(next);
    } else {
      if (next) {
        internalScrollYRef.current = window.scrollY;
      }
      setInternalFocusMode(next);
      if (!next) {
        const y = internalScrollYRef.current;
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: 'smooth' });
        });
      }
    }
    if (!next) {
      setShowFocusReferenceDrawer(false);
    }
  };

  // Prompt translation & History drawer
  const [showPromptVi, setShowPromptVi] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Master Accordion: "TÀI LIỆU & GỢI Ý HỌC TẬP" — DEFAULT CLOSED (false)
  const [isStudyMaterialOpen, setIsStudyMaterialOpen] = useState<boolean>(false);
  // Slide-over Reference Drawer inside Focus Mode
  const [showFocusReferenceDrawer, setShowFocusReferenceDrawer] = useState<boolean>(false);

  // Sub-accordions inside "TÀI LIỆU & GỢI Ý HỌC TẬP"
  const [openMaterialSection, setOpenMaterialSection] = useState<
    'outline' | 'sample_essay' | 'vocab' | 'pdf_fsf' | null
  >(null);
  const [openOutlineSectionIdx, setOpenOutlineSectionIdx] = useState<number | null>(null);
  const [openParagraphIdx, setOpenParagraphIdx] = useState<number | null>(null);
  const [showSampleOptionsBar, setShowSampleOptionsBar] = useState<boolean>(false);
  const [selectedSampleBand, setSelectedSampleBand] = useState<'band65' | 'band80'>('band80');
  const [showSampleTranslation, setShowSampleTranslation] = useState<boolean>(true);
  const [activePdfEssayTab, setActivePdfEssayTab] = useState<'upgraded' | 'original' | 'notes'>('upgraded');

  // Linked PDF Writing & Structure items for this day
  const linkedPdf = useMemo(() => getLinkedPdfResourcesForDay(day), [day]);

  // Timer: 40 minutes for IELTS Writing Task 2
  const [timerSeconds, setTimerSeconds] = useState<number>(40 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Compute target vocabulary used in essayText
  const computeUsedTargetVocab = (text: string): string[] => {
    const lower = text.toLowerCase();
    const matched = new Set<string>();
    dayVocabList.forEach(vw => {
      if (vw.word && lower.includes(vw.word.toLowerCase())) {
        matched.add(vw.word);
      }
    });
    (writingTask.keyVocabulary || []).forEach(kw => {
      if (kw && lower.includes(kw.toLowerCase())) {
        matched.add(kw);
      }
    });
    return Array.from(matched);
  };

  const usedTargetVocab = useMemo(
    () => computeUsedTargetVocab(essayText),
    [essayText, dayVocabList, writingTask.keyVocabulary]
  );

  // Keep latest draft in ref for unmount flush
  const latestDraftRef = useRef<{ day: number; text: string; vocab: string[] }>({
    day,
    text: '',
    vocab: []
  });
  useEffect(() => {
    latestDraftRef.current = { day, text: essayText, vocab: usedTargetVocab };
  }, [day, essayText, usedTargetVocab]);

  // Load draft & history on day switch, reset open accordions
  useEffect(() => {
    const saved = getWritingDraft(day);
    setEssayText(saved);
    const hist = getWritingHistory(day);
    setHistoryList(hist);
    setAllLogsList(
      getAllUserWritingLogs().filter(r => !r.taskType || !r.taskType.startsWith('speaking'))
    );
    if (hist.length > 0 && hist[0].feedback) {
      setCurrentFeedback(hist[0].feedback as WritingEvaluationResult);
    } else {
      setCurrentFeedback(null);
    }
    setTimerSeconds(40 * 60);
    setIsTimerRunning(false);
    setSaveNotice(null);
    setIsStudyMaterialOpen(false);
    setOpenMaterialSection(null);
    setOpenParagraphIdx(null);
    setOpenOutlineSectionIdx(null);
  }, [day]);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => {
        if (s <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Live word counter
  const words = essayText.trim() ? essayText.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  // Auto-save draft with 1000ms debounce
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextValueChange = (val: string) => {
    setEssayText(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      const matchedVocab = computeUsedTargetVocab(val);
      saveWritingDraft(day, val, matchedVocab);
      const timeStr = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setLastSavedTime(timeStr);
    }, 1000);
  };

  // Flush pending auto-save on unmount or beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const cur = latestDraftRef.current;
      if (cur.text.trim()) {
        saveWritingDraft(cur.day, cur.text, cur.vocab);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        const cur = latestDraftRef.current;
        saveWritingDraft(cur.day, cur.text, cur.vocab);
      }
    };
  }, []);

  const handleManualSave = () => {
    saveWritingDraft(day, essayText, usedTargetVocab);
    const timeStr = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setLastSavedTime(timeStr);
    setSaveNotice(
      `Đã lưu nháp tức thời (${wordCount} từ • ${usedTargetVocab.length} từ mục tiêu) lúc ${timeStr}`
    );
  };

  // Save & Complete Essay
  const handleSaveAndCompleteEssay = () => {
    if (wordCount < 10) {
      setValidationError('Vui lòng viết ít nhất 10 từ trước khi bấm "Lưu & Hoàn thành bài viết".');
      return;
    }
    setValidationError(null);
    saveWritingDraft(day, essayText, usedTargetVocab);
    saveWritingSubmission(day, {
      text: essayText,
      wordCount,
      usedTargetVocab,
      prompt: writingTask.prompt,
      feedback: currentFeedback || undefined
    });
    setHistoryList(getWritingHistory(day));
    setAllLogsList(
      getAllUserWritingLogs().filter(r => !r.taskType || !r.taskType.startsWith('speaking'))
    );
    updateDayTaskStatus(day, 'writing', true);
    onStatusChange();
    const timeStr = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setLastSavedTime(timeStr);
    setSaveNotice(
      `✓ Đã lưu vào Lịch sử bài viết & hoàn thành Writing Ngày ${day} (${wordCount} từ • ${usedTargetVocab.length} Target Vocab)!`
    );
    try {
      confetti({
        particleCount: 40,
        spread: 65,
        origin: { y: 0.65 }
      });
    } catch {}
  };

  // Submit and evaluate
  const handleSubmitEssay = async () => {
    if (wordCount < 50) {
      setValidationError('Vui lòng viết ít nhất 50 từ trước khi yêu cầu phản hồi và chấm điểm.');
      return;
    }
    setValidationError(null);

    setIsEvaluating(true);
    try {
      const result = await evaluateIeltsEssay(
        essayText,
        writingTask.prompt,
        writingTask.questionType,
        writingTask.recommendedCollocations
      );
      setCurrentFeedback(result);

      saveWritingDraft(day, essayText, usedTargetVocab);
      saveWritingSubmission(day, {
        text: essayText,
        wordCount,
        usedTargetVocab,
        prompt: writingTask.prompt,
        feedback: result
      });
      setHistoryList(getWritingHistory(day));
      setAllLogsList(
        getAllUserWritingLogs().filter(r => !r.taskType || !r.taskType.startsWith('speaking'))
      );
      updateDayTaskStatus(day, 'writing', true);
      onStatusChange();

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const toggleWritingCompleted = () => {
    const next = !isCompleted;
    if (next && wordCount >= 10) {
      saveWritingDraft(day, essayText, usedTargetVocab);
      saveWritingSubmission(day, {
        text: essayText,
        wordCount,
        usedTargetVocab,
        prompt: writingTask.prompt,
        feedback: currentFeedback || undefined
      });
      setHistoryList(getWritingHistory(day));
      setAllLogsList(
        getAllUserWritingLogs().filter(r => !r.taskType || !r.taskType.startsWith('speaking'))
      );
    }
    updateDayTaskStatus(day, 'writing', next);
    onStatusChange();
  };

  const activeSampleBlock =
    selectedSampleBand === 'band65'
      ? writingTask.sampleEssays?.band65
      : writingTask.sampleEssays?.band80;

  const getParagraphLabel = (idx: number, total: number) => {
    if (idx === 0) return 'Introduction (Mở bài)';
    if (idx === total - 1 && total >= 3) return 'Conclusion (Kết bài)';
    return `Body Paragraph ${idx} (Thân bài ${idx})`;
  };

  const outlineItems = [
    { num: '01', label: 'Introduction (Mở bài)', content: writingTask.band8Outline.introduction },
    { num: '02', label: 'Body Paragraph 1 (Thân bài 1)', content: writingTask.band8Outline.bodyParagraph1 },
    { num: '03', label: 'Body Paragraph 2 (Thân bài 2)', content: writingTask.band8Outline.bodyParagraph2 },
    { num: '04', label: 'Conclusion (Kết bài)', content: writingTask.band8Outline.conclusion }
  ];

  // Shared content for "TÀI LIỆU & GỢI Ý HỌC TẬP" (used in both bottom Accordion & Focus Mode Drawer)
  const renderStudyMaterialContent = () => (
    <div className="divide-y divide-[#493B2D]/40 bg-[#E9DCC2]">
      {/* Mục 01: Dàn ý chi tiết & Gợi ý triển khai Band 8.0+ */}
      <div>
        <button
          type="button"
          onClick={() =>
            setOpenMaterialSection(openMaterialSection === 'outline' ? null : 'outline')
          }
          className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
            openMaterialSection === 'outline'
              ? 'bg-[#DCC9A8] text-[#C92532]'
              : 'hover:bg-[#F1E7D3] text-[#181614]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-extrabold text-[#C92532] tabular-nums shrink-0">
              01
            </span>
            <Lightbulb className="w-4 h-4 text-[#C92532] shrink-0" />
            <span className="text-xs sm:text-sm font-bold truncate">
              Dàn ý chi tiết &amp; Gợi ý triển khai Band 8.0+ (4 phần)
            </span>
          </div>
          {openMaterialSection === 'outline' ? (
            <ChevronUp className="w-4 h-4 text-[#C92532] shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#51483D] shrink-0" />
          )}
        </button>

        {openMaterialSection === 'outline' && (
          <div className="bg-[#F1E7D3] border-t border-[#493B2D]/40 divide-y divide-[#493B2D]/25">
            {outlineItems.map((item, idx) => {
              const isSubOpen = openOutlineSectionIdx === idx;
              return (
                <div key={item.num}>
                  <button
                    type="button"
                    onClick={() => setOpenOutlineSectionIdx(isSubOpen ? null : idx)}
                    className={`w-full px-5 py-3 flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                      isSubOpen
                        ? 'bg-[#E9DCC2] text-[#C92532] font-extrabold'
                        : 'hover:bg-[#E9DCC2]/60 text-[#181614] font-bold'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] text-[#796B59] tabular-nums">
                        {item.num}
                      </span>
                      <span>{item.label}</span>
                    </span>
                    {isSubOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#C92532]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[#796B59]" />
                    )}
                  </button>
                  {isSubOpen && (
                    <div className="px-5 pb-3.5 pt-1 text-xs text-[#181614] leading-relaxed bg-[#E9DCC2]">
                      {item.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mục 02: Bài luận mẫu chuẩn học thuật & Bản dịch tiếng Việt (4 đoạn mở/đóng) */}
      {activeSampleBlock && (
        <div>
          <button
            type="button"
            onClick={() =>
              setOpenMaterialSection(
                openMaterialSection === 'sample_essay' ? null : 'sample_essay'
              )
            }
            className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
              openMaterialSection === 'sample_essay'
                ? 'bg-[#DCC9A8] text-[#C92532]'
                : 'hover:bg-[#F1E7D3] text-[#181614]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-extrabold text-[#C92532] tabular-nums shrink-0">
                02
              </span>
              <Sparkles className="w-4 h-4 text-[#C92532] shrink-0" />
              <span className="text-xs sm:text-sm font-bold truncate">
                Bài luận mẫu chuẩn học thuật &amp; Bản dịch ({activeSampleBlock.bandLabel})
              </span>
            </div>
            {openMaterialSection === 'sample_essay' ? (
              <ChevronUp className="w-4 h-4 text-[#C92532] shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#51483D] shrink-0" />
            )}
          </button>

          {openMaterialSection === 'sample_essay' && (
            <div className="bg-[#F1E7D3] border-t border-[#493B2D]/40 p-4 space-y-3">
              {/* Compact Sample Essay Options Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#51483D]">
                  Nhấn vào từng đoạn (Introduction → Conclusion) để xem bài mẫu &amp; dịch nghĩa:
                </span>
                <button
                  type="button"
                  onClick={() => setShowSampleOptionsBar(!showSampleOptionsBar)}
                  className={`px-3 py-1.5 rounded-[2px] border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    showSampleOptionsBar
                      ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                      : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border-[#493B2D]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>
                    Tùy chọn ({selectedSampleBand === 'band65' ? 'Band 6.5' : 'Band 8.0+'} ·{' '}
                    {showSampleTranslation ? 'Có dịch VI' : 'Ẩn dịch VI'})
                  </span>
                  {showSampleOptionsBar ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {showSampleOptionsBar && (
                <div className="flex items-center justify-between flex-wrap gap-2 p-2.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-xs">
                  <span className="font-bold text-[#181614] pl-1">
                    Chọn mức Band &amp; ngôn ngữ bản dịch:
                  </span>
                  <div className="flex items-center gap-1 bg-[#F1E7D3] p-1 rounded-[2px] border border-[#493B2D] flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedSampleBand('band65')}
                      className={`px-3 py-1 rounded-[2px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                        selectedSampleBand === 'band65'
                          ? 'bg-[#C92532] text-[#F1E7D3] border border-[#181614]'
                          : 'text-[#51483D] hover:text-[#181614]'
                      }`}
                    >
                      Band 6.5 (B2)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSampleBand('band80')}
                      className={`px-3 py-1 rounded-[2px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                        selectedSampleBand === 'band80'
                          ? 'bg-[#C92532] text-[#F1E7D3] border border-[#181614]'
                          : 'text-[#51483D] hover:text-[#181614]'
                      }`}
                    >
                      Band 8.0+ (C1)
                    </button>
                    <span className="h-4 w-px bg-[#493B2D]/40 mx-0.5" aria-hidden="true" />
                    <button
                      type="button"
                      onClick={() => setShowSampleTranslation(!showSampleTranslation)}
                      className={`px-3 py-1 rounded-[2px] font-bold cursor-pointer transition-all flex items-center gap-1 whitespace-nowrap ${
                        showSampleTranslation
                          ? 'bg-[#2E5A36] text-[#F1E7D3] border border-[#181614]'
                          : 'text-[#51483D] hover:text-[#181614]'
                      }`}
                    >
                      <Languages className="w-3.5 h-3.5" />
                      <span>
                        {showSampleTranslation ? 'Đang hiện tiếng Việt' : 'Đang ẩn tiếng Việt'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4-Paragraph Accordion List */}
              <div className="rounded-[2px] border border-[#493B2D] divide-y divide-[#493B2D]/35 overflow-hidden bg-[#E9DCC2]">
                {activeSampleBlock.essayParagraphs.map((para, idx) => {
                  const isOpen = openParagraphIdx === idx;
                  const numStr = String(idx + 1).padStart(2, '0');
                  const sectionTitle = getParagraphLabel(
                    idx,
                    activeSampleBlock.essayParagraphs.length
                  );
                  const paraWordCount = para.trim().split(/\s+/).filter(Boolean).length;

                  return (
                    <div key={idx} className="transition-colors">
                      <button
                        type="button"
                        onClick={() => setOpenParagraphIdx(isOpen ? null : idx)}
                        className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                          isOpen
                            ? 'bg-[#DCC9A8] text-[#C92532]'
                            : 'hover:bg-[#F1E7D3] text-[#181614]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`font-mono text-xs font-extrabold tabular-nums shrink-0 ${
                              isOpen ? 'text-[#C92532]' : 'text-[#796B59]'
                            }`}
                          >
                            {numStr}
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold truncate">
                            {sectionTitle}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-[11px] font-medium text-[#51483D] tabular-nums hidden sm:inline">
                            {paraWordCount} từ
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-[#C92532]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#51483D]" />
                          )}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="p-4 bg-[#F1E7D3] border-t border-[#493B2D]/35 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-serif text-sm sm:text-[15px] text-[#181614] leading-relaxed">
                              {renderTextWithHighlightedVocab(para, dayVocabList, 'crimson')}
                            </p>
                            <button
                              type="button"
                              onClick={() => speakWord(para)}
                              className="p-2 rounded-[2px] bg-[#E9DCC2] hover:bg-[#C92532] text-[#C92532] hover:text-[#F1E7D3] border border-[#493B2D] shrink-0 cursor-pointer transition-colors"
                              title="Nghe đoạn văn mẫu"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>

                          {showSampleTranslation &&
                            activeSampleBlock.translationParagraphs[idx] && (
                              <p className="text-xs sm:text-sm text-[#51483D] italic pt-2.5 border-t border-[#493B2D]/25 leading-relaxed">
                                🇻🇳 <strong>Bản dịch:</strong>{' '}
                                {activeSampleBlock.translationParagraphs[idx]}
                              </p>
                            )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mục 03: Từ vựng mục tiêu & Ví dụ ngữ cảnh Ngày {day} */}
      {dayVocabList.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() =>
              setOpenMaterialSection(openMaterialSection === 'vocab' ? null : 'vocab')
            }
            className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
              openMaterialSection === 'vocab'
                ? 'bg-[#DCE6D5] text-[#2E5A36]'
                : 'hover:bg-[#F1E7D3] text-[#181614]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-extrabold text-[#2E5A36] tabular-nums shrink-0">
                03
              </span>
              <Tag className="w-4 h-4 text-[#2E5A36] shrink-0" />
              <span className="text-xs sm:text-sm font-bold truncate">
                Từ vựng &amp; Ví dụ mục tiêu Ngày {day} (Đã dùng {usedTargetVocab.length}/
                {dayVocabList.length} từ)
              </span>
            </div>
            {openMaterialSection === 'vocab' ? (
              <ChevronUp className="w-4 h-4 text-[#2E5A36] shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#51483D] shrink-0" />
            )}
          </button>

          {openMaterialSection === 'vocab' && (
            <div className="p-4 bg-[#F1E7D3] border-t border-[#493B2D]/40 space-y-3">
              <div className="text-[11px] font-medium text-[#51483D]">
                Bấm vào từ để nghe phát âm • Tự động chuyển màu xanh ✓ khi bạn sử dụng trong bài viết
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dayVocabList.map(vw => {
                  const isUsed = usedTargetVocab.some(
                    u => u.toLowerCase() === vw.word.toLowerCase()
                  );
                  return (
                    <div
                      key={vw.id}
                      onClick={() => speakWord(vw.word)}
                      className={`p-2.5 rounded-[2px] border text-xs transition-all cursor-pointer space-y-1 ${
                        isUsed
                          ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#2E5A36]'
                          : 'bg-[#E9DCC2] border-[#493B2D] text-[#181614] hover:border-[#C92532]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-extrabold">
                          {isUsed ? '✓ ' : '+ '}
                          {vw.word}{' '}
                          <span className="font-normal text-[11px] opacity-75">({vw.pos})</span>
                        </span>
                        <span className="font-bold text-[#181614]">{vw.meaning}</span>
                      </div>
                      {vw.exampleEn && (
                        <p className="text-[11px] italic text-[#51483D] line-clamp-2">
                          “{vw.exampleEn}”
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mục 04: Công thức F-S-F & Bài luận mẫu từ "Ôn thi vstep.pdf" */}
      {linkedPdf.writing.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() =>
              setOpenMaterialSection(openMaterialSection === 'pdf_fsf' ? null : 'pdf_fsf')
            }
            className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
              openMaterialSection === 'pdf_fsf'
                ? 'bg-[#DCC9A8] text-[#991D27]'
                : 'hover:bg-[#F1E7D3] text-[#181614]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-extrabold text-[#991D27] tabular-nums shrink-0">
                04
              </span>
              <BookOpen className="w-4 h-4 text-[#C92532] shrink-0" />
              <span className="text-xs sm:text-sm font-bold truncate">
                Công thức F-S-F &amp; Bài luận từ "Ôn thi vstep.pdf" ({linkedPdf.writing.length}{' '}
                chuyên đề)
              </span>
            </div>
            {openMaterialSection === 'pdf_fsf' ? (
              <ChevronUp className="w-4 h-4 text-[#991D27] shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#51483D] shrink-0" />
            )}
          </button>

          {openMaterialSection === 'pdf_fsf' && (
            <div className="p-4 bg-[#F1E7D3] border-t border-[#493B2D]/40 space-y-3">
              {linkedPdf.writing.map(pw => (
                <div
                  key={pw.id}
                  className="p-3.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-2.5 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-[#C92532] uppercase">
                        {pw.examType} • {pw.pdfPage}
                      </span>
                      <span className="text-[#796B59]">·</span>
                      <strong className="text-sm text-[#181614]">{pw.topicTitle}</strong>
                    </div>
                    <div className="flex items-center gap-1 bg-[#F1E7D3] p-1 rounded-[2px] border border-[#493B2D]">
                      <button
                        type="button"
                        onClick={() => setActivePdfEssayTab('upgraded')}
                        className={`px-2.5 py-1 rounded-[2px] font-bold cursor-pointer transition-colors ${
                          activePdfEssayTab === 'upgraded'
                            ? 'bg-[#C92532] text-[#F1E7D3]'
                            : 'text-[#51483D]'
                        }`}
                      >
                        Bản Band 7.5+
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePdfEssayTab('original')}
                        className={`px-2.5 py-1 rounded-[2px] font-bold cursor-pointer transition-colors ${
                          activePdfEssayTab === 'original'
                            ? 'bg-[#C92532] text-[#F1E7D3]'
                            : 'text-[#51483D]'
                        }`}
                      >
                        Bản gốc PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePdfEssayTab('notes')}
                        className={`px-2.5 py-1 rounded-[2px] font-bold cursor-pointer transition-colors ${
                          activePdfEssayTab === 'notes'
                            ? 'bg-[#C92532] text-[#F1E7D3]'
                            : 'text-[#51483D]'
                        }`}
                      >
                        Dàn ý &amp; F-S-F
                      </button>
                    </div>
                  </div>

                  {activePdfEssayTab === 'upgraded' && (
                    <div className="p-3 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D]/40 space-y-2">
                      <p className="font-serif text-[#181614] whitespace-pre-line leading-relaxed">
                        {pw.upgradedBand75Essay}
                      </p>
                      <p className="text-[#51483D] italic pt-2 border-t border-[#493B2D]/25">
                        🇻🇳 {pw.upgradedEssayVi}
                      </p>
                    </div>
                  )}

                  {activePdfEssayTab === 'original' && (
                    <div className="p-3 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D]/40 space-y-2">
                      <p className="font-serif text-[#181614] whitespace-pre-line leading-relaxed">
                        {pw.originalAuthorEssay}
                      </p>
                    </div>
                  )}

                  {activePdfEssayTab === 'notes' && (
                    <div className="p-3 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D]/40 space-y-1.5 text-[#181614]">
                      <div>
                        <strong>Mở bài:</strong> {pw.outline.intro}
                      </div>
                      <div>
                        <strong>Thân bài 1:</strong> {pw.outline.body1}
                      </div>
                      <div>
                        <strong>Thân bài 2:</strong> {pw.outline.body2}
                      </div>
                      <div>
                        <strong>Kết bài:</strong> {pw.outline.conclusion}
                      </div>
                      {pw.authorSelfNotes && (
                        <div className="pt-1 text-[#2E5A36]">
                          💡 <strong>Ghi chú F-S-F trong PDF:</strong> {pw.authorSelfNotes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`transition-all duration-300 ${
        isFocusMode
          ? 'max-w-5xl mx-auto py-2 sm:py-4 space-y-5'
          : 'space-y-6'
      }`}
    >
      {/* FOCUS MODE TOP BAR (Chỉ hiện khi đang bật Focus Mode) */}
      {isFocusMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-[2px] bg-[#F1E7D3] border-2 border-[#493B2D] shadow-[3px_3px_0_rgba(24,22,20,0.18)]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C92532] animate-pulse" />
            <span className="text-xs sm:text-sm font-extrabold text-[#181614] uppercase tracking-wider">
              Writing Focus Mode • Ngày {day} ({writingTask.questionType})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFocusReferenceDrawer(true)}
              className="px-3.5 py-1.5 rounded-[2px] bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border border-[#493B2D] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#C92532]" />
              <span>Tài liệu &amp; Gợi ý học tập</span>
            </button>

            <button
              type="button"
              onClick={handleToggleFocus}
              className="px-3.5 py-1.5 rounded-[2px] bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] border border-[#181614] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Thoát Focus Mode</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN WRITING WORKSPACE SURFACE (Vintage Newspaper Paper #F1E7D3 & Editorial Red #C92532) */}
      <div
        className={`newspaper-card rounded-[2px] transition-all duration-300 ${
          isFocusMode ? 'p-5 sm:p-8' : 'p-5 sm:p-6'
        } space-y-4`}
      >
        {/* 1. ĐỀ BÀI (PROMPT) — Đặt ngay phía trên vùng viết */}
        <div className="space-y-3">
          {!isFocusMode && (
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#493B2D]/40">
              <div className="flex items-center gap-2.5 flex-wrap text-xs">
                <span className="font-oswald font-bold uppercase tracking-wider text-[#C92532]">
                  IELTS WRITING TASK 2 • NGÀY {day}
                </span>
                <span className="text-[#493B2D]" aria-hidden="true">
                  |
                </span>
                <span className="font-bold text-[#181614]">
                  Dạng bài:{' '}
                  <span className="text-[#C92532]">{writingTask.questionType}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={toggleWritingCompleted}
                className={`px-3.5 py-1.5 rounded-[2px] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap shrink-0 border ${
                  isCompleted
                    ? 'bg-[#2E5A36] text-[#F1E7D3] border-[#181614]'
                    : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] hover:text-[#C92532] border-[#493B2D]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isCompleted ? 'Đã hoàn thành Writing ✓' : 'Đánh dấu hoàn thành'}</span>
              </button>
            </div>
          )}

          {/* Khung Đề bài thanh thoát ngay trên vùng soạn thảo */}
          <div className="px-4 py-3.5 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm sm:text-[15px] text-[#181614] leading-relaxed font-semibold">
                  <strong className="font-extrabold text-[#C92532] mr-1.5">Đề bài:</strong>
                  {writingTask.prompt}
                </p>

                <div className="flex items-center gap-1.5 shrink-0">
                  {writingTask.promptVi && (
                    <button
                      type="button"
                      onClick={() => setShowPromptVi(!showPromptVi)}
                      className={`px-2.5 py-1 rounded-[2px] text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                        showPromptVi
                          ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                          : 'bg-[#F1E7D3] text-[#51483D] border-[#493B2D] hover:border-[#C92532] hover:text-[#C92532]'
                      }`}
                      title="Ẩn/Hiện dịch đề bài"
                    >
                      <Languages className="w-3.5 h-3.5" />
                      <span>{showPromptVi ? 'Ẩn dịch' : 'Dịch đề'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => speakWord(writingTask.prompt)}
                    className="p-1.5 rounded-[2px] bg-[#F1E7D3] hover:bg-[#C92532] text-[#C92532] hover:text-[#F1E7D3] border border-[#493B2D] shrink-0 cursor-pointer transition-colors"
                    title="Nghe đề bài"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {showPromptVi && writingTask.promptVi && (
                <p className="text-xs sm:text-sm text-[#51483D] italic pt-2 border-t border-[#493B2D]/35">
                  🇻🇳 <strong>Dịch đề bài:</strong> {writingTask.promptVi}
                </p>
              )}
            </div>

            {!isFocusMode && (
              <div className="hidden xl:block w-24 shrink-0">
                <VintageEngravingFrame
                  src={VINTAGE_EDITORIAL_ASSETS.mascot.writingQuill}
                  alt="Scholarly Cat Writing with Quill"
                  caption="FIG. TASK 2"
                />
              </div>
            )}
          </div>
        </div>

        {/* Thông báo lỗi hoặc lưu nháp */}
        {validationError && (
          <div className="p-3.5 rounded-[2px] bg-[#E8B7AC]/45 border border-[#C92532] text-[#991D27] text-xs font-bold flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </span>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="text-[#991D27] hover:underline cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {saveNotice && (
          <div className="p-3.5 rounded-[2px] bg-[#DCE6D5] border border-[#2E5A36] text-[#2E5A36] text-xs font-bold flex items-center justify-between gap-2">
            <span>{saveNotice}</span>
            <button
              type="button"
              onClick={() => setSaveNotice(null)}
              className="text-[#2E5A36] hover:underline cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* 2. WRITING EDITOR -> 3. TOOLBAR -> 4. MASCOT & KEYBOARD (Dùng chung 1 instance duy nhất) */}
        <RubyWritingBox
          value={essayText}
          onChange={handleTextValueChange}
          placeholder="Nhập bài luận IELTS Writing Task 2 của bạn tại đây (tối thiểu 250 từ). Hệ thống tự động lưu nháp sau mỗi 1000ms..."
          minHeight={isFocusMode ? 360 : 270}
          renderToolbar={({
            soundOn,
            toggleSound,
            showStage,
            toggleStage,
            hasRealAudio,
            triggerUploadMp3
          }) => (
            <div className="space-y-3">
              {/* Hàng Toolbar chính ngay dưới vùng viết và ngay trên Mascot & Keyboard */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                {/* Cụm bên trái: Số từ + Từ vựng mục tiêu + Trạng thái lưu + Đồng hồ 40p */}
                <div className="flex items-center gap-2.5 flex-wrap text-xs">
                  <span className="font-bold text-[#51483D] tabular-nums">
                    Số từ:{' '}
                    <strong
                      className={`text-sm font-extrabold ${
                        wordCount >= 250 ? 'text-[#2E5A36]' : 'text-[#C92532]'
                      }`}
                    >
                      {wordCount}
                    </strong>
                    <span className="text-[11px] opacity-75"> / 250+</span>
                  </span>

                  <span className="text-[#493B2D]" aria-hidden="true">
                    •
                  </span>

                  <span
                    className="text-[#51483D] font-semibold tabular-nums"
                    title="Số từ vựng mục tiêu trong ngày đã nhận diện trong bài viết"
                  >
                    Từ vựng mục tiêu:{' '}
                    <strong className="text-[#2E5A36]">
                      {usedTargetVocab.length}/{dayVocabList.length}
                    </strong>
                  </span>

                  <span className="text-[#493B2D]" aria-hidden="true">
                    •
                  </span>

                  {/* Timer 40 phút gọn gàng */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-xs font-mono font-bold text-[#181614] tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-[#C92532]" />
                    <span>{formatTimer(timerSeconds)}</span>
                    <button
                      type="button"
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="ml-0.5 font-sans text-[11px] font-extrabold text-[#C92532] hover:underline cursor-pointer"
                    >
                      {isTimerRunning ? 'Dừng' : 'Chạy'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(40 * 60);
                      }}
                      className="text-[#51483D] hover:text-[#181614] cursor-pointer"
                      title="Đặt lại 40 phút"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>

                  {lastSavedTime && (
                    <span className="text-[#2E5A36] font-semibold tabular-nums text-[11.5px]">
                      ✓ Đã lưu {lastSavedTime}
                    </span>
                  )}
                </div>

                {/* Cụm bên phải: Focus Mode + Tài liệu (khi Focus) + Âm thanh + Bàn phím + Lưu & Lịch sử */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Nút bật/tắt Focus Mode trên Writing Toolbar */}
                  <button
                    type="button"
                    onClick={handleToggleFocus}
                    className={`px-3 py-1.5 rounded-[2px] text-xs font-extrabold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isFocusMode
                        ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                        : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border-[#493B2D]'
                    }`}
                    title={
                      isFocusMode
                        ? 'Tắt Focus Mode và khôi phục giao diện trước đó'
                        : 'Bật Focus Mode: Ẩn toàn bộ phần xung quanh để tập trung viết'
                    }
                  >
                    {isFocusMode ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5 text-[#C92532]" />
                    )}
                    <span>{isFocusMode ? 'Focus Mode: Bật' : 'Focus Mode'}</span>
                  </button>

                  {/* Nút mở Drawer Tài liệu tham khảo ngay trong Focus Mode */}
                  {isFocusMode && (
                    <button
                      type="button"
                      onClick={() => setShowFocusReferenceDrawer(true)}
                      className="px-3 py-1.5 rounded-[2px] text-xs font-bold bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border border-[#493B2D] flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#C92532]" />
                      <span>Tài liệu tham khảo</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={toggleSound}
                    className="px-3 py-1.5 rounded-[2px] text-xs font-semibold bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border border-[#493B2D] flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {soundOn ? (
                      <Volume2 className="w-3.5 h-3.5 text-[#C92532]" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-[#51483D]" />
                    )}
                    <span>{soundOn ? 'Âm thanh: bật' : 'Âm thanh: tắt'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleStage}
                    className="px-3 py-1.5 rounded-[2px] text-xs font-semibold bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border border-[#493B2D] flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Ẩn/Hiện Linh vật & Bàn phím tương tác"
                  >
                    <Keyboard className="w-3.5 h-3.5 text-[#C92532]" />
                    <span>{showStage ? 'Ẩn bàn phím' : 'Hiện bàn phím'}</span>
                  </button>

                  {!hasRealAudio && (
                    <button
                      type="button"
                      onClick={triggerUploadMp3}
                      className="px-2.5 py-1.5 rounded-[2px] text-[11px] font-semibold bg-[#E8B7AC]/45 hover:bg-[#E8B7AC] text-[#991D27] border border-[#C92532] cursor-pointer transition-colors"
                      title="Nạp file âm thanh bàn phím typing.mp3"
                    >
                      📂 Nạp MP3
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleManualSave}
                    className="px-3 py-1.5 rounded-[2px] text-xs font-bold bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border border-[#493B2D] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5 text-[#C92532]" />
                    <span>Lưu nháp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className={`px-3 py-1.5 rounded-[2px] text-xs font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                      showHistory
                        ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                        : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border-[#493B2D]'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Lịch sử ({historyList.length})</span>
                  </button>
                </div>
              </div>

              {/* Cụm nút Hoàn thành & Chấm AI gọn gàng */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 px-1">
                <button
                  type="button"
                  onClick={handleSaveAndCompleteEssay}
                  className="px-4 py-2 rounded-[2px] font-bold text-xs bg-[#2E5A36] hover:bg-[#1E3F24] text-[#F1E7D3] border border-[#181614] cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lưu &amp; Hoàn thành bài viết</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitEssay}
                  disabled={isEvaluating}
                  className="px-5 py-2 rounded-[2px] font-bold text-xs bg-[#C92532] hover:bg-[#991D27] disabled:opacity-60 text-[#F1E7D3] border border-[#181614] cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0_#181614] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isEvaluating
                      ? 'Đang chấm 4 tiêu chí IELTS...'
                      : 'Nộp Bài & Chấm 4 Tiêu Chí IELTS'}
                  </span>
                </button>
              </div>
            </div>
          )}
        />

        {/* Collapsible Writing History Panel */}
        {showHistory && (
          <div className="p-4 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="text-[#181614] text-sm">📜 Lịch Sử Bài Viết Đã Lưu</strong>
                <div className="flex items-center gap-1 bg-[#F1E7D3] p-1 rounded-[2px] border border-[#493B2D]">
                  <button
                    type="button"
                    onClick={() => setHistoryViewMode('current_day')}
                    className={`px-2.5 py-1 rounded-[2px] font-bold cursor-pointer ${
                      historyViewMode === 'current_day'
                        ? 'bg-[#C92532] text-[#F1E7D3]'
                        : 'text-[#51483D]'
                    }`}
                  >
                    Ngày {day} ({historyList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryViewMode('all_days')}
                    className={`px-2.5 py-1 rounded-[2px] font-bold cursor-pointer ${
                      historyViewMode === 'all_days'
                        ? 'bg-[#C92532] text-[#F1E7D3]'
                        : 'text-[#51483D]'
                    }`}
                  >
                    Tất cả ({allLogsList.length})
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="text-[#51483D] hover:text-[#181614] cursor-pointer font-bold"
              >
                Đóng ✕
              </button>
            </div>

            {(() => {
              const displayed = historyViewMode === 'current_day' ? historyList : allLogsList;
              if (displayed.length === 0) {
                return (
                  <p className="text-[#51483D]">
                    Chưa có bài viết nào được lưu trong lịch sử. Hãy bấm "Lưu &amp; Hoàn thành bài
                    viết" để lưu lại.
                  </p>
                );
              }
              return (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {displayed.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D] space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#C92532]">Ngày {item.day}</span>
                          <span className="text-[#796B59]">·</span>
                          <span className="font-bold text-[#181614] tabular-nums">
                            {item.wordCount} từ
                          </span>
                          <span className="text-[#796B59]">·</span>
                          <span className="text-[#51483D] tabular-nums">
                            {new Date(item.submittedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEssayText(item.text)}
                          className="text-[#C92532] font-bold hover:underline cursor-pointer"
                        >
                          Khôi phục vào khung soạn thảo
                        </button>
                      </div>
                      {item.usedTargetVocab && item.usedTargetVocab.length > 0 && (
                        <div className="text-[11px] font-semibold text-[#2E5A36]">
                          Target Vocab đã dùng: {item.usedTargetVocab.join(', ')}
                        </div>
                      )}
                      <p className="text-[#181614] font-serif line-clamp-3 whitespace-pre-line">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Evaluation Feedback Result */}
        {currentFeedback && (
          <div className="p-5 rounded-[2px] bg-[#E9DCC2] border-2 border-[#493B2D] space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <strong className="text-sm text-[#C92532] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>
                  Kết Quả Đánh Giá 4 Tiêu Chí IELTS — Band Ước Tính:{' '}
                  {currentFeedback.estimatedBand}
                </span>
              </strong>
              <span className="font-bold text-[#2E5A36]">{currentFeedback.wordCountScore}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[#181614]">
              <div className="p-3 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D]">
                <strong>Task Response:</strong> {currentFeedback.taskResponse}
              </div>
              <div className="p-3 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D]">
                <strong>Coherence &amp; Cohesion:</strong> {currentFeedback.coherenceCohesion}
              </div>
              <div className="p-3 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D]">
                <strong>Lexical Resource:</strong> {currentFeedback.lexicalResource}
              </div>
              <div className="p-3 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D]">
                <strong>Grammatical Accuracy:</strong> {currentFeedback.grammaticalAccuracy}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. ACCORDION "TÀI LIỆU & GỢI Ý HỌC TẬP" (MẶC ĐỊNH ĐÓNG • Ẩn khi đang ở Focus Mode) */}
      {!isFocusMode && (
        <div className="newspaper-card rounded-[2px] border-2 border-[#493B2D] bg-[#F1E7D3] overflow-hidden">
          <button
            type="button"
            onClick={() => setIsStudyMaterialOpen(!isStudyMaterialOpen)}
            className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-3 text-left hover:bg-[#E9DCC2] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-[#C92532] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#181614] block">
                  TÀI LIỆU &amp; GỢI Ý HỌC TẬP
                </span>
                <span className="text-[11.5px] text-[#51483D] block truncate">
                  Dàn ý Band 8.0+, Bài luận mẫu 4 đoạn, Bản dịch, Công thức F-S-F &amp; Từ vựng Ngày{' '}
                  {day}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-[#C92532] bg-[#E9DCC2] border border-[#493B2D] px-3 py-1 rounded-[2px] hidden sm:inline">
                {isStudyMaterialOpen ? 'Thu gọn' : 'Nhấn để mở'}
              </span>
              {isStudyMaterialOpen ? (
                <ChevronUp className="w-5 h-5 text-[#C92532]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#51483D]" />
              )}
            </div>
          </button>

          {isStudyMaterialOpen && (
            <div className="border-t border-[#493B2D]">{renderStudyMaterialContent()}</div>
          )}
        </div>
      )}

      {/* SLIDE-OVER PANEL / DRAWER CHO TÀI LIỆU THAM KHẢO NGAY TRONG FOCUS MODE */}
      {isFocusMode && showFocusReferenceDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#181614]/55 backdrop-blur-[2px] animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#F1E7D3] h-full shadow-2xl border-l-2 border-[#493B2D] flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="px-5 py-4 bg-[#E9DCC2] border-b border-[#493B2D] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <BookOpen className="w-4 h-4 text-[#C92532] shrink-0" />
                <h3 className="text-sm sm:text-base font-extrabold text-[#181614] uppercase tracking-wider truncate">
                  TÀI LIỆU &amp; GỢI Ý HỌC TẬP • NGÀY {day}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFocusReferenceDrawer(false)}
                className="p-2 rounded-[2px] bg-[#F1E7D3] hover:bg-[#C92532] text-[#181614] hover:text-[#F1E7D3] border border-[#493B2D] cursor-pointer transition-colors"
                title="Đóng bảng tài liệu tham khảo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div className="rounded-[2px] border border-[#493B2D] overflow-hidden">
                {renderStudyMaterialContent()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
