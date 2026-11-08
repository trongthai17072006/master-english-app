import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  MessageSquare,
  Compass,
  Clock,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Volume2,
  Network,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  History,
  Save,
  Tag,
  Languages,
  SlidersHorizontal
} from 'lucide-react';
import { VstepSpeakingTask, ChallengeVocabWord } from '../../data/challenge60Data';
import {
  updateDayTaskStatus,
  getSpeakingDraft,
  saveSpeakingDraft,
  saveSpeakingSubmission,
  getSpeakingHistory,
  getAllUserWritingLogs,
  WritingSubmissionRecord
} from '../../utils/challengeStorage';
import { getLinkedPdfResourcesForDay } from '../../data/vstepPdfKnowledgeBankData';
import { speakWord } from '../../utils/soundAndSpeech';
import { renderTextWithHighlightedVocab } from '../../utils/highlightTargetWords';
import { RubyWritingBox } from '../RubyWritingBox';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from '../VintageNewspaperIllustrations';

interface ChallengeSpeakingTabProps {
  day: number;
  speakingTask: VstepSpeakingTask;
  dayVocabList?: ChallengeVocabWord[];
  isCompleted: boolean;
  onStatusChange: () => void;
}

export const ChallengeSpeakingTab: React.FC<ChallengeSpeakingTabProps> = ({
  day,
  speakingTask,
  dayVocabList = [],
  isCompleted,
  onStatusChange
}) => {
  const [activePart, setActivePart] = useState<'part1' | 'part2' | 'part3'>('part1');
  const [part1Band, setPart1Band] = useState<'B1' | 'B2' | 'C1'>('C1');
  const [part2Band, setPart2Band] = useState<'B1' | 'B2' | 'C1'>('C1');
  const [part3Band, setPart3Band] = useState<'B1' | 'B2C1'>('B2C1');

  // Top Support Accordion state (single-open, default null = all closed)
  const [openSupportKey, setOpenSupportKey] = useState<'vocab' | 'pdf' | null>(null);
  const [showSpeakingHistory, setShowSpeakingHistory] = useState<boolean>(false);

  // Part 1 Accordion List state (single-open, default null = all questions closed)
  const [openPart1RowKey, setOpenPart1RowKey] = useState<string | null>(null);
  const [showPart1OptionsBar, setShowPart1OptionsBar] = useState<boolean>(false);
  const [showPart1Vi, setShowPart1Vi] = useState<boolean>(true);

  // Part 2 Accordion List state (single-open, default null = all rows closed)
  const [showSituationVi, setShowSituationVi] = useState<boolean>(false);
  const [openPart2RowKey, setOpenPart2RowKey] = useState<string | null>(null);
  const [showPart2SampleVi, setShowPart2SampleVi] = useState<boolean>(true);

  // Part 3 Accordion List state (single-open, default null = all rows closed)
  const [openPart3RowKey, setOpenPart3RowKey] = useState<string | null>(null);
  const [showPart3SampleVi, setShowPart3SampleVi] = useState<boolean>(true);
  const [openFollowUpIdx, setOpenFollowUpIdx] = useState<number | null>(null);

  // Timers for Part 2 & Part 3: 1-min preparation & 2-min speaking
  const [prepSeconds, setPrepSeconds] = useState<number>(60);
  const [isPrepRunning, setIsPrepRunning] = useState<boolean>(false);
  const [talkSeconds, setTalkSeconds] = useState<number>(120);
  const [isTalkRunning, setIsTalkRunning] = useState<boolean>(false);

  // Scratchpad notes & 1000ms Auto-save state for Part 1, Part 2, Part 3
  const [part1Script, setPart1Script] = useState<string>('');
  const [part2Script, setPart2Script] = useState<string>('');
  const [part3Script, setPart3Script] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C'>('A');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [speakingHistory, setSpeakingHistory] = useState<WritingSubmissionRecord[]>([]);
  const [allSpeakingLogs, setAllSpeakingLogs] = useState<WritingSubmissionRecord[]>([]);

  const linkedPdf = useMemo(() => getLinkedPdfResourcesForDay(day), [day]);

  const computeUsedVocab = (p1: string, p2: string, p3: string): string[] => {
    const combined = `${p1} ${p2} ${p3}`.toLowerCase();
    const matched = new Set<string>();
    dayVocabList.forEach(vw => {
      if (vw.word && combined.includes(vw.word.toLowerCase())) {
        matched.add(vw.word);
      }
    });
    return Array.from(matched);
  };

  const usedTargetVocab = useMemo(
    () => computeUsedVocab(part1Script, part2Script, part3Script),
    [part1Script, part2Script, part3Script, dayVocabList]
  );

  const totalWordCount = useMemo(() => {
    const combined = `${part1Script} ${part2Script} ${part3Script}`.trim();
    return combined ? combined.split(/\s+/).filter(Boolean).length : 0;
  }, [part1Script, part2Script, part3Script]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSpeakingAutoSave = (
    nextP1: string,
    nextP2: string,
    nextP3: string,
    nextOpt: 'A' | 'B' | 'C'
  ) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const vocabUsed = computeUsedVocab(nextP1, nextP2, nextP3);
      saveSpeakingDraft(day, {
        part1Text: nextP1,
        part2Text: nextP2,
        part3Text: nextP3,
        selectedOption: nextOpt,
        usedTargetVocab: vocabUsed
      });
      const timeStr = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setLastSavedTime(timeStr);
    }, 1000);
  };

  useEffect(() => {
    const draft = getSpeakingDraft(day);
    setPart1Script(draft.part1Text || '');
    setPart2Script(draft.part2Text || '');
    setPart3Script(draft.part3Text || '');
    setSelectedOption(draft.selectedOption || 'A');
    setSpeakingHistory(getSpeakingHistory(day));
    setAllSpeakingLogs(
      getAllUserWritingLogs().filter(r => r.taskType && r.taskType.startsWith('speaking'))
    );
    setSaveNotice(null);
    setOpenSupportKey(null);
    setOpenPart1RowKey(null);
    setOpenPart2RowKey(null);
    setOpenPart3RowKey(null);
    setOpenFollowUpIdx(null);
  }, [day]);

  useEffect(() => {
    setPrepSeconds(60);
    setIsPrepRunning(false);
    setTalkSeconds(120);
    setIsTalkRunning(false);
  }, [day, activePart]);

  const handleManualSaveSpeaking = () => {
    saveSpeakingDraft(day, {
      part1Text: part1Script,
      part2Text: part2Script,
      part3Text: part3Script,
      selectedOption,
      usedTargetVocab
    });
    const timeStr = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setLastSavedTime(timeStr);
    setSaveNotice(
      `Đã lưu nháp kịch bản Speaking (${totalWordCount} từ • ${usedTargetVocab.length} từ mục tiêu) lúc ${timeStr}`
    );
  };

  const handleSaveAndCompleteSpeaking = () => {
    const combinedText = [
      part1Script.trim() ? `[Part 1]: ${part1Script.trim()}` : '',
      part2Script.trim() ? `[Part 2 - Option ${selectedOption}]: ${part2Script.trim()}` : '',
      part3Script.trim() ? `[Part 3]: ${part3Script.trim()}` : ''
    ]
      .filter(Boolean)
      .join('\n\n');

    saveSpeakingDraft(day, {
      part1Text: part1Script,
      part2Text: part2Script,
      part3Text: part3Script,
      selectedOption,
      usedTargetVocab
    });

    saveSpeakingSubmission(day, {
      taskType: 'speaking_full',
      text: combinedText || `Hoàn thành luyện nói Ngày ${day} (Option ${selectedOption})`,
      wordCount: totalWordCount,
      usedTargetVocab,
      prompt: speakingTask.part2.situation
    });

    setSpeakingHistory(getSpeakingHistory(day));
    setAllSpeakingLogs(
      getAllUserWritingLogs().filter(r => r.taskType && r.taskType.startsWith('speaking'))
    );
    updateDayTaskStatus(day, 'speaking', true);
    onStatusChange();
    const timeStr = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setLastSavedTime(timeStr);
    setSaveNotice(
      `✓ Đã lưu kịch bản Speaking vào Lịch sử & hoàn thành Speaking Ngày ${day} (${totalWordCount} từ • ${usedTargetVocab.length} Target Vocab)!`
    );
  };

  // Prep timer countdown
  useEffect(() => {
    if (!isPrepRunning) return;
    const interval = setInterval(() => {
      setPrepSeconds(s => {
        if (s <= 1) {
          clearInterval(interval);
          setIsPrepRunning(false);
          setIsTalkRunning(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPrepRunning]);

  // Talk timer countdown
  useEffect(() => {
    if (!isTalkRunning) return;
    const interval = setInterval(() => {
      setTalkSeconds(s => {
        if (s <= 1) {
          clearInterval(interval);
          setIsTalkRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTalkRunning]);

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const toggleSpeakingCompleted = () => {
    const next = !isCompleted;
    updateDayTaskStatus(day, 'speaking', next);
    onStatusChange();
  };

  const hasLinkedPdfSpeaking =
    linkedPdf.speakingPart1.length > 0 ||
    linkedPdf.speakingPart2.length > 0 ||
    linkedPdf.speakingPart3.length > 0;

  // Build unified Part 1 Question Accordion rows from Topic 1 & Topic 2
  const part1QuestionRows = useMemo(() => {
    const rows: Array<{
      key: string;
      num: string;
      topicLabel: string;
      topicTitle: string;
      questionEn: string;
      questionVi?: string;
      sampleEn?: string;
      sampleVi?: string;
    }> = [];

    let counter = 1;
    const addTopic = (topic: typeof speakingTask.part1.topic1, badge: string, prefix: string) => {
      if (topic.bilingualQuestions && topic.bilingualQuestions.length > 0) {
        topic.bilingualQuestions.forEach((bq, idx) => {
          const sample = bq.samples[part1Band] || bq.samples.B2;
          rows.push({
            key: `${prefix}_${idx}`,
            num: String(counter++).padStart(2, '0'),
            topicLabel: badge,
            topicTitle: topic.title,
            questionEn: bq.questionEn,
            questionVi: bq.questionVi,
            sampleEn: sample.answerEn,
            sampleVi: sample.answerVi
          });
        });
      } else {
        topic.questions.forEach((q, idx) => {
          rows.push({
            key: `${prefix}_${idx}`,
            num: String(counter++).padStart(2, '0'),
            topicLabel: badge,
            topicTitle: topic.title,
            questionEn: q
          });
        });
      }
    };

    addTopic(speakingTask.part1.topic1, 'Chủ đề 1', 't1');
    addTopic(speakingTask.part1.topic2, 'Chủ đề 2', 't2');
    return rows;
  }, [speakingTask.part1, part1Band]);

  return (
    <div className="space-y-5">
      {/* 1. THANH ĐIỀU HƯỚNG 3 PART & DANH SÁCH CÔNG CỤ BỔ TRỢ (ACCORDION LIST) */}
      <div className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-5 sm:p-6 space-y-4">
        {/* Top Meta & Completion Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <VintageEngravingFrame
              src={VINTAGE_EDITORIAL_ASSETS.architecture.sydneyOperaHouse}
              alt="Speaking Rhetoric Studio"
              className="w-12 h-12 hidden sm:block shrink-0"
              aspectClass="aspect-square"
            />
            <div>
              <span className="font-mono font-extrabold uppercase tracking-widest text-[#C92532] block">
                IELTS &amp; VSTEP Speaking • Ngày {day}
              </span>
              <span className="font-serif font-bold text-sm text-[#181614]">
                {speakingTask.sourceType === 'vstep_28_bank'
                  ? `Đề thi thực chiến #${speakingTask.originalTestId} (B1–C1)`
                  : `Bộ đề mở rộng Chủ đề Ngày ${day}`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleSpeakingCompleted}
            className={`px-3.5 py-1.5 rounded-[2px] border text-xs font-mono uppercase tracking-wider font-extrabold flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap shrink-0 ${
              isCompleted
                ? 'bg-[#2E5A36] text-[#F1E7D3] border-[#181614]'
                : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] hover:text-[#C92532] border-[#493B2D]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'Đã hoàn thành Speaking' : 'Đánh dấu hoàn thành'}</span>
          </button>
        </div>

        {/* Segmented 3-Part Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#DCC9A8] rounded-[2px] border border-[#493B2D] flex-wrap w-fit">
          <button
            type="button"
            onClick={() => setActivePart('part1')}
            className={`px-3.5 py-1.5 rounded-[2px] font-mono uppercase tracking-wider font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              activePart === 'part1'
                ? 'bg-[#C92532] text-[#F1E7D3]'
                : 'text-[#51483D] hover:text-[#181614]'
            }`}
          >
            Part 1: Social Interaction
          </button>
          <button
            type="button"
            onClick={() => setActivePart('part2')}
            className={`px-3.5 py-1.5 rounded-[2px] font-mono uppercase tracking-wider font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              activePart === 'part2'
                ? 'bg-[#C92532] text-[#F1E7D3]'
                : 'text-[#51483D] hover:text-[#181614]'
            }`}
          >
            Part 2: Solution Discussion
          </button>
          {speakingTask.part3 && (
            <button
              type="button"
              onClick={() => setActivePart('part3')}
              className={`px-3.5 py-1.5 rounded-[2px] font-mono uppercase tracking-wider font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                activePart === 'part3'
                  ? 'bg-[#C92532] text-[#F1E7D3]'
                  : 'text-[#51483D] hover:text-[#181614]'
              }`}
            >
              Part 3: Topic Development
            </button>
          )}
        </div>

        {/* DANH SÁCH MỞ RỘNG TÀI LIỆU & TỪ VỰNG BỔ TRỢ SPEAKING (ACCORDION LIST) */}
        {(dayVocabList.length > 0 || hasLinkedPdfSpeaking) && (
          <div className="rounded-[2px] border border-[#493B2D] divide-y divide-[#493B2D] overflow-hidden bg-[#E9DCC2]">
            {dayVocabList.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setOpenSupportKey(openSupportKey === 'vocab' ? null : 'vocab')}
                  className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer ${
                    openSupportKey === 'vocab'
                      ? 'bg-[#DCE6D5] text-[#2E5A36]'
                      : 'hover:bg-[#DCC9A8] text-[#181614]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-extrabold text-[#166534] tabular-nums shrink-0">
                      01
                    </span>
                    <Tag className="w-4 h-4 text-[#166534] shrink-0" />
                    <span className="text-xs sm:text-sm font-bold truncate">
                      Từ vựng mục tiêu Speaking Ngày {day} (Đã dùng {usedTargetVocab.length}/{dayVocabList.length} từ)
                    </span>
                  </div>
                  {openSupportKey === 'vocab' ? (
                    <ChevronUp className="w-4 h-4 text-[#166534] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />
                  )}
                </button>

                {openSupportKey === 'vocab' && (
                  <div className="p-4 bg-white border-t border-[#E8DFD5] space-y-2.5">
                    <div className="text-[11px] font-medium text-[#6B7280]">
                      Bấm vào từ để nghe phát âm • Đã được highlight trực tiếp trong các câu trả lời mẫu
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {dayVocabList.map(vw => {
                        const isUsed = usedTargetVocab.some(
                          u => u.toLowerCase() === vw.word.toLowerCase()
                        );
                        return (
                          <button
                            key={vw.id}
                            type="button"
                            onClick={() => speakWord(vw.word)}
                            title={`${vw.word} (${vw.pos}): ${vw.meaning}`}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono text-xs font-bold transition-all cursor-pointer ${
                              isUsed
                                ? 'bg-[#DCFCE7] border-[#16A34A] text-[#166534]'
                                : 'bg-[#FAF7F2] border-[#E8DFD5] text-[#374151] hover:border-[#C81E1E]'
                            }`}
                          >
                            <Volume2 className="w-3 h-3 text-[#C81E1E]" />
                            <span>{isUsed ? `✓ ${vw.word}` : vw.word}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {hasLinkedPdfSpeaking && (
              <div>
                <button
                  type="button"
                  onClick={() => setOpenSupportKey(openSupportKey === 'pdf' ? null : 'pdf')}
                  className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer ${
                    openSupportKey === 'pdf'
                      ? 'bg-[#FFF9F1] text-[#9A3412]'
                      : 'hover:bg-white text-[#242938]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-extrabold text-[#9A3412] tabular-nums shrink-0">
                      02
                    </span>
                    <BookOpen className="w-4 h-4 text-[#B83226] shrink-0" />
                    <span className="text-xs sm:text-sm font-bold truncate">
                      Đề thi &amp; Bài nói mẫu trích từ "Ôn thi vstep.pdf" liên kết Ngày {day}
                    </span>
                  </div>
                  {openSupportKey === 'pdf' ? (
                    <ChevronUp className="w-4 h-4 text-[#9A3412] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />
                  )}
                </button>

                {openSupportKey === 'pdf' && (
                  <div className="p-4 bg-white border-t border-[#E8DFD5] space-y-3">
                    {linkedPdf.speakingPart2.map(sp2 => (
                      <div key={sp2.id} className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE6DD] space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong className="text-sm text-[#111827]">{sp2.title}</strong>
                          <span className="text-[#C81E1E] font-bold">
                            {sp2.examType} Part 2 · Trang {sp2.pdfPage}
                          </span>
                        </div>
                        <p className="font-semibold text-[#1F2937]">{sp2.situationEn}</p>
                        <p className="text-[#6B7280] italic">🇻🇳 {sp2.situationVi}</p>
                        <div className="p-3 rounded-xl bg-white border border-[#EFE6DD] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <strong className="text-[#C81E1E]">Bài nói mẫu B2–C1 ({sp2.chosenOption}):</strong>
                            <button
                              type="button"
                              onClick={() => speakWord(sp2.upgradedSampleB2C1)}
                              className="text-[11px] font-bold text-[#C81E1E] hover:underline cursor-pointer"
                            >
                              🔊 Nghe mẫu
                            </button>
                          </div>
                          <p className="font-serif text-[#1F2937] leading-relaxed">"{sp2.upgradedSampleB2C1}"</p>
                          <p className="text-[#4B5563] italic">🇻🇳 {sp2.upgradedSampleVi}</p>
                        </div>
                      </div>
                    ))}

                    {linkedPdf.speakingPart3.map(sp3 => (
                      <div key={sp3.id} className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE6DD] space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong className="text-sm text-[#111827]">
                            Part 3: "{sp3.centralStatementEn}"
                          </strong>
                          <span className="text-[#1E40AF] font-bold">
                            {sp3.examType} Part 3 · Trang {sp3.pdfPage}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-[#EFE6DD] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <strong className="text-[#166534]">Bài thuyết trình mẫu B2–C1:</strong>
                            <button
                              type="button"
                              onClick={() => speakWord(sp3.upgradedSampleB2C1)}
                              className="text-[11px] font-bold text-[#166534] hover:underline cursor-pointer"
                            >
                              🔊 Nghe mẫu
                            </button>
                          </div>
                          <p className="font-serif text-[#1F2937] leading-relaxed">"{sp3.upgradedSampleB2C1}"</p>
                          <p className="text-[#4B5563] italic">🇻🇳 {sp3.upgradedSampleVi}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2A. PART 1: SOCIAL INTERACTION — ACCORDION LIST OF QUESTIONS */}
      {activePart === 'part1' && (
        <div className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-5 sm:p-6 space-y-5">
          {/* Header Part 1 + Compact Options Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#C92532]" />
              <h4 className="text-sm sm:text-base font-serif font-extrabold text-[#181614]">
                Part 1: Social Interaction — Danh Sách Câu Hỏi ({part1QuestionRows.length} câu)
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setShowPart1OptionsBar(!showPart1OptionsBar)}
              className={`px-3 py-1.5 rounded-[2px] border text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                showPart1OptionsBar
                  ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                  : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border-[#493B2D]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>
                Tùy chọn mẫu trả lời (Band {part1Band} · {showPart1Vi ? 'Có dịch VI' : 'Ẩn dịch VI'})
              </span>
              {showPart1OptionsBar ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showPart1OptionsBar && (
            <div className="flex items-center justify-between flex-wrap gap-2 p-2.5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-xs">
              <span className="font-bold text-[#51483D] pl-1">
                Chọn mức điểm câu trả lời mẫu khi nhấn mở câu hỏi:
              </span>
              <div className="flex items-center gap-1 bg-[#DCC9A8] p-1 rounded-[2px] border border-[#493B2D] flex-wrap">
                {(['B1', 'B2', 'C1'] as const).map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setPart1Band(b)}
                    className={`px-2.5 py-1 rounded-[2px] font-mono font-bold cursor-pointer transition-all whitespace-nowrap ${
                      part1Band === b
                        ? 'bg-[#C92532] text-[#F1E7D3]'
                        : 'text-[#51483D] hover:text-[#181614]'
                    }`}
                  >
                    Band {b}
                  </button>
                ))}
                <span className="h-4 w-px bg-[#493B2D] mx-0.5" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => setShowPart1Vi(!showPart1Vi)}
                  className={`px-2.5 py-1 rounded-[2px] font-mono font-bold cursor-pointer transition-all flex items-center gap-1 whitespace-nowrap ${
                    showPart1Vi
                      ? 'bg-[#2E5A36] text-[#F1E7D3]'
                      : 'text-[#51483D] hover:text-[#181614]'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>{showPart1Vi ? 'Đang hiện tiếng Việt' : 'Đang ẩn tiếng Việt'}</span>
                </button>
              </div>
            </div>
          )}

          {/* DANH SÁCH MỞ RỘNG CÂU HỎI PART 1 */}
          <div className="rounded-[2px] border border-[#493B2D] divide-y divide-[#493B2D] overflow-hidden bg-[#E9DCC2]">
            {part1QuestionRows.map((row) => {
              const isOpen = openPart1RowKey === row.key;
              return (
                <div key={row.key}>
                  <div
                    onClick={() => setOpenPart1RowKey(isOpen ? null : row.key)}
                    className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                      isOpen ? 'bg-[#DCC9A8] text-[#C92532]' : 'hover:bg-[#F1E7D3] text-[#181614]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`font-mono text-xs sm:text-sm font-extrabold tabular-nums shrink-0 ${
                          isOpen ? 'text-[#C81E1E]' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {row.num}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-[#6B7280] truncate">
                          {row.topicLabel} · {row.topicTitle}
                        </div>
                        <div className="text-xs sm:text-sm font-extrabold truncate">
                          {row.questionEn}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(row.questionEn);
                        }}
                        className="p-1.5 rounded-lg bg-white hover:bg-[#C81E1E] text-[#C81E1E] hover:text-white border border-[#E8DFD5] cursor-pointer transition-colors"
                        title="Nghe câu hỏi"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#C81E1E]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                      )}
                    </div>
                  </div>

                  {/* Nội dung câu trả lời mẫu & dịch (chỉ mở khi nhấn vào câu hỏi này) */}
                  {isOpen && (
                    <div className="p-4 sm:p-5 bg-white border-t border-[#E8DFD5] space-y-3 text-xs">
                      {showPart1Vi && row.questionVi && (
                        <div className="text-[#505460] italic">
                          🇻🇳 <strong>Dịch câu hỏi:</strong> {row.questionVi}
                        </div>
                      )}

                      {row.sampleEn && (
                        <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE6DD] space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-[#C81E1E] uppercase tracking-wider text-[11px]">
                              Câu trả lời mẫu Band {part1Band}:
                            </span>
                            <button
                              type="button"
                              onClick={() => speakWord(row.sampleEn!)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-[#C81E1E] text-[#C81E1E] hover:text-white border border-[#E8DFD5] text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>Nghe mẫu</span>
                            </button>
                          </div>
                          <p className="font-serif text-sm text-[#1F2937] leading-relaxed">
                            "{renderTextWithHighlightedVocab(row.sampleEn, dayVocabList, 'crimson')}"
                          </p>
                          {showPart1Vi && row.sampleVi && (
                            <p className="text-[#4B5563] italic pt-2 border-t border-[#EFE6DD]">
                              🇻🇳 <strong>Dịch câu trả lời:</strong> {row.sampleVi}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Hàng cuối: Chiến lược trả lời Part 1 */}
            <div>
              <button
                type="button"
                onClick={() => setOpenPart1RowKey(openPart1RowKey === 'tips' ? null : 'tips')}
                className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                  openPart1RowKey === 'tips' ? 'bg-[#FFF9F1] text-[#D97706]' : 'hover:bg-white text-[#242938]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs sm:text-sm font-extrabold text-[#D97706] tabular-nums shrink-0">
                    {String(part1QuestionRows.length + 1).padStart(2, '0')}
                  </span>
                  <Lightbulb className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span className="text-xs sm:text-sm font-extrabold truncate">
                    Chiến lược &amp; Mẹo trả lời VSTEP / IELTS Part 1
                  </span>
                </div>
                {openPart1RowKey === 'tips' ? (
                  <ChevronUp className="w-4 h-4 text-[#D97706]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                )}
              </button>

              {openPart1RowKey === 'tips' && (
                <div className="p-4 sm:p-5 bg-white border-t border-[#E8DFD5] text-xs space-y-1.5">
                  <ul className="space-y-1.5 list-disc list-inside text-[#374151]">
                    {speakingTask.part1.part1Tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Part 1 Speaking Script Workspace with RubyWritingBox */}
          <div className="pt-2 border-t border-[#EFE6DD] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-extrabold uppercase tracking-wider text-[#B83226]">
                ✍️ Kịch Bản Trả Lời Part 1 Của Bạn (Auto-save 1000ms)
              </span>
              <span className="font-bold text-[#166534] tabular-nums">
                {part1Script.trim() ? part1Script.trim().split(/\s+/).filter(Boolean).length : 0} từ · Tự động lưu nháp khi gõ
              </span>
            </div>
            <RubyWritingBox
              value={part1Script}
              onChange={(val) => {
                setPart1Script(val);
                triggerSpeakingAutoSave(val, part2Script, part3Script, selectedOption);
              }}
              placeholder="Gõ câu trả lời hoặc kịch bản luyện nói Part 1 tại đây (áp dụng công thức 5W2H hoặc 2-Layer Explanation)... Tự động lưu sau 1000ms."
              minHeight={180}
            />
          </div>
        </div>
      )}

      {/* 2B. PART 2: SOLUTION DISCUSSION — ACCORDION LIST */}
      {activePart === 'part2' && (
        <div className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-5 sm:p-6 space-y-5">
          {/* Unified Part 2 Header & Timers Cluster */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#493B2D]/40">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#C92532]" />
              <h4 className="text-sm sm:text-base font-serif font-extrabold text-[#181614]">
                Part 2: Solution Discussion (Thảo luận giải pháp)
              </h4>
            </div>

            {/* Grouped VSTEP Timers (1m Prep + 2m Talk) */}
            <div className="flex items-center gap-1.5 bg-[#DCC9A8] p-1 rounded-[2px] border border-[#493B2D] flex-wrap text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D] font-mono font-bold text-[#991D27] tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                <span>Chuẩn bị: {formatSecs(prepSeconds)}</span>
                <button
                  type="button"
                  onClick={() => setIsPrepRunning(!isPrepRunning)}
                  className="ml-1 text-[11px] font-mono uppercase text-[#C92532] hover:underline cursor-pointer"
                >
                  {isPrepRunning ? 'Dừng' : 'Bắt đầu'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsPrepRunning(false); setPrepSeconds(60); }}
                  className="text-[#796B59] hover:text-[#181614] cursor-pointer"
                  title="Đặt lại 1 phút chuẩn bị"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D] font-mono font-bold text-[#2E5A36] tabular-nums">
                <Mic className="w-3.5 h-3.5" />
                <span>Nói: {formatSecs(talkSeconds)}</span>
                <button
                  type="button"
                  onClick={() => setIsTalkRunning(!isTalkRunning)}
                  className="ml-1 text-[11px] font-mono uppercase text-[#2E5A36] hover:underline cursor-pointer"
                >
                  {isTalkRunning ? 'Dừng' : 'Bắt đầu'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsTalkRunning(false); setTalkSeconds(120); }}
                  className="text-[#796B59] hover:text-[#181614] cursor-pointer"
                  title="Đặt lại 2 phút nói"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Primary Content: Situation Card */}
          <div className="p-4 sm:p-5 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#C92532] block">
                  Tình huống thực tế (Situation):
                </span>
                <p className="text-sm sm:text-base font-serif font-bold text-[#181614] leading-relaxed">
                  {speakingTask.part2.situation}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {speakingTask.part2.situationVi && (
                  <button
                    type="button"
                    onClick={() => setShowSituationVi(!showSituationVi)}
                    className={`px-2.5 py-1.5 rounded-[2px] text-xs font-mono uppercase font-bold border transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                      showSituationVi
                        ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                        : 'bg-[#F1E7D3] text-[#51483D] border-[#493B2D] hover:border-[#C92532] hover:text-[#C92532]'
                    }`}
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>{showSituationVi ? 'Ẩn dịch' : 'Dịch đề'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => speakWord(speakingTask.part2.situation)}
                  className="p-2 rounded-[2px] bg-[#F1E7D3] hover:bg-[#C92532] text-[#C92532] hover:text-[#F1E7D3] border border-[#493B2D] shrink-0 cursor-pointer transition-colors"
                  title="Nghe tình huống"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {showSituationVi && speakingTask.part2.situationVi && (
              <p className="text-xs sm:text-sm text-[#51483D] italic pt-2 border-t border-[#493B2D]/40">
                🇻🇳 <strong>Dịch tình huống:</strong> {speakingTask.part2.situationVi}
              </p>
            )}
            <div className="text-xs text-[#796B59]">
              📌 <em>Yêu cầu: {speakingTask.part2.requirement}</em>
            </div>
          </div>

          {/* DANH SÁCH MỞ RỘNG PART 2 */}
          <div className="rounded-[2px] border border-[#493B2D] divide-y divide-[#493B2D] overflow-hidden bg-[#E9DCC2]">
            {speakingTask.part2.options.map((opt, idx) => {
              const rowKey = `opt_${opt.letter}`;
              const isOpen = openPart2RowKey === rowKey;
              const isChosen = selectedOption === opt.letter;
              const numStr = String(idx + 1).padStart(2, '0');

              return (
                <div key={opt.letter}>
                  <div
                    onClick={() => setOpenPart2RowKey(isOpen ? null : rowKey)}
                    className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                      isOpen ? 'bg-[#FFF5F4] text-[#C81E1E]' : 'hover:bg-white text-[#111827]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`font-mono text-xs sm:text-sm font-extrabold tabular-nums shrink-0 ${
                          isOpen ? 'text-[#C81E1E]' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {numStr}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold truncate">
                        Option {opt.letter}: {opt.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOption(opt.letter);
                          triggerSpeakingAutoSave(part1Script, part2Script, part3Script, opt.letter);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors whitespace-nowrap ${
                          isChosen
                            ? 'bg-[#C81E1E] text-white border-[#C81E1E]'
                            : 'bg-white text-[#4B5563] border-[#E8DFD5] hover:border-[#C81E1E]'
                        }`}
                      >
                        {isChosen ? `✓ Đang chọn ${opt.letter}` : `Chọn ${opt.letter}`}
                      </button>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#C81E1E]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                      )}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="p-4 sm:p-5 bg-white border-t border-[#E8DFD5] space-y-2.5 text-xs">
                      <p className="text-[#374151] font-medium leading-relaxed">{opt.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534]">
                          ✓ <strong>Ưu điểm (Pros):</strong> {opt.strongPoints}
                        </div>
                        <div className="p-3 rounded-xl bg-[#FFF5F5] border border-[#FECACA] text-[#991B1B]">
                          ✗ <strong>Nhược điểm (Cons):</strong> {opt.drawbacks}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Hàng 04: Mẫu cấu trúc nối ý B2-C1 */}
            <div>
              <button
                type="button"
                onClick={() => setOpenPart2RowKey(openPart2RowKey === 'connectors' ? null : 'connectors')}
                className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                  openPart2RowKey === 'connectors' ? 'bg-[#FFF9F1] text-[#D97706]' : 'hover:bg-white text-[#111827]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs sm:text-sm font-extrabold text-[#9CA3AF] tabular-nums shrink-0">
                    04
                  </span>
                  <Lightbulb className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span className="text-xs sm:text-sm font-extrabold truncate">
                    Mẫu Cấu Trúc Nối Ý Chuẩn Bậc 4–5 (B2–C1 Useful Connectors)
                  </span>
                </div>
                {openPart2RowKey === 'connectors' ? (
                  <ChevronUp className="w-4 h-4 text-[#D97706]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                )}
              </button>

              {openPart2RowKey === 'connectors' && (
                <div className="p-4 sm:p-5 bg-white border-t border-[#E8DFD5] grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  {speakingTask.part2.usefulConnectors.map((conn, idx) => (
                    <div key={idx} className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE6DD] font-medium text-[#374151]">
                      💬 <em>"{conn}"</em>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hàng 05: Bài nói mẫu hoàn chỉnh Part 2 */}
            {speakingTask.part2.sampleAnswers && (
              <div>
                <button
                  type="button"
                  onClick={() => setOpenPart2RowKey(openPart2RowKey === 'sample' ? null : 'sample')}
                  className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                    openPart2RowKey === 'sample' ? 'bg-[#FFF5F4] text-[#C81E1E]' : 'hover:bg-white text-[#111827]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs sm:text-sm font-extrabold text-[#9CA3AF] tabular-nums shrink-0">
                      05
                    </span>
                    <Sparkles className="w-4 h-4 text-[#C81E1E] shrink-0" />
                    <span className="text-xs sm:text-sm font-extrabold truncate">
                      Bài Nói Mẫu Hoàn Chỉnh Part 2 (Band {part2Band})
                    </span>
                  </div>
                  {openPart2RowKey === 'sample' ? (
                    <ChevronUp className="w-4 h-4 text-[#C81E1E]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                  )}
                </button>

                {openPart2RowKey === 'sample' && (
                  <div className="p-4 sm:p-5 bg-white border-t border-[#E8DFD5] space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#EFE6DD]">
                      <span className="font-bold text-[#505460]">Chọn mức điểm bài mẫu:</span>
                      <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E8DFD5] flex-wrap">
                        {(['B1', 'B2', 'C1'] as const).map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setPart2Band(b)}
                            className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                              part2Band === b
                                ? 'bg-[#C81E1E] text-white shadow-2xs'
                                : 'text-[#4B5563] hover:text-[#111827]'
                            }`}
                          >
                            Bài mẫu {b}
                          </button>
                        ))}
                        <span className="h-4 w-px bg-[#E8DFD5] mx-0.5" aria-hidden="true" />
                        <button
                          type="button"
                          onClick={() => setShowPart2SampleVi(!showPart2SampleVi)}
                          className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1 ${
                            showPart2SampleVi
                              ? 'bg-[#166534] text-white'
                              : 'text-[#4B5563] hover:text-[#111827]'
                          }`}
                        >
                          <Languages className="w-3.5 h-3.5" />
                          <span>{showPart2SampleVi ? 'Ẩn tiếng Việt' : 'Hiện tiếng Việt'}</span>
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const activeSample = speakingTask.part2.sampleAnswers[part2Band];
                      if (!activeSample) return null;
                      return (
                        <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EFE6DD] space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-[#C81E1E]">
                              Phương án chọn mẫu: {activeSample.chosenOption}
                            </span>
                            <button
                              type="button"
                              onClick={() => speakWord(activeSample.speechEn)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white hover:bg-[#C81E1E] text-[#C81E1E] hover:text-white border border-[#E8DFD5] font-bold cursor-pointer transition-colors"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Nghe bài nói mẫu {part2Band}</span>
                            </button>
                          </div>
                          <p className="text-sm text-[#1F2937] leading-relaxed font-serif">
                            "{renderTextWithHighlightedVocab(activeSample.speechEn, dayVocabList, 'crimson')}"
                          </p>
                          {showPart2SampleVi && (
                            <p className="text-[#4B5563] italic pt-2 border-t border-[#EFE6DD]">
                              🇻🇳 <strong>Bản dịch tiếng Việt:</strong> {activeSample.speechVi}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Part 2 Speaking Script Workspace with RubyWritingBox */}
          <div className="pt-2 border-t border-[#EFE6DD] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-extrabold uppercase tracking-wider text-[#B83226]">
                ✍️ Sổ Tay Kịch Bản Trả Lời Part 2 — Phương Án {selectedOption} (Auto-save 1000ms)
              </span>
              <span className="font-bold text-[#166534] tabular-nums">
                {part2Script.trim() ? part2Script.trim().split(/\s+/).filter(Boolean).length : 0} từ · Tự động lưu nháp khi gõ
              </span>
            </div>
            <RubyWritingBox
              value={part2Script}
              onChange={(val) => {
                setPart2Script(val);
                triggerSpeakingAutoSave(part1Script, val, part3Script, selectedOption);
              }}
              placeholder="Ghi chú nhanh dàn ý hoặc kịch bản trả lời Part 2 (1. Mở bài: Well, before making a decision... 2. Lý do chọn phương án tốt nhất... 3. Lý do phản biện 2 phương án còn lại... 4. Kết luận)..."
              minHeight={200}
            />
          </div>
        </div>
      )}

      {/* 2C. PART 3: TOPIC DEVELOPMENT & FOLLOW-UP DISCUSSION — ACCORDION LIST */}
      {activePart === 'part3' && speakingTask.part3 && (
        <div className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-5 sm:p-6 space-y-5">
          {/* Unified Part 3 Header & Timers Cluster */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#493B2D]/40">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-[#C92532]" />
              <h4 className="text-sm sm:text-base font-serif font-extrabold text-[#181614]">
                Part 3: Topic Development (Sơ Đồ Tư Duy &amp; Câu Hỏi Thảo Luận)
              </h4>
            </div>

            {/* Grouped VSTEP Part 3 Timers */}
            <div className="flex items-center gap-1.5 bg-[#DCC9A8] p-1 rounded-[2px] border border-[#493B2D] flex-wrap text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D] font-mono font-bold text-[#991D27] tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                <span>Chuẩn bị: {formatSecs(prepSeconds)}</span>
                <button
                  type="button"
                  onClick={() => setIsPrepRunning(!isPrepRunning)}
                  className="ml-1 text-[11px] font-mono uppercase text-[#C92532] hover:underline cursor-pointer"
                >
                  {isPrepRunning ? 'Dừng' : 'Bắt đầu'}
                </button>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D] font-mono font-bold text-[#2E5A36] tabular-nums">
                <Mic className="w-3.5 h-3.5" />
                <span>Thuyết trình: {formatSecs(talkSeconds)}</span>
                <button
                  type="button"
                  onClick={() => setIsTalkRunning(!isTalkRunning)}
                  className="ml-1 text-[11px] font-mono uppercase text-[#2E5A36] hover:underline cursor-pointer"
                >
                  {isTalkRunning ? 'Dừng' : 'Bắt đầu'}
                </button>
              </div>
            </div>
          </div>

          {/* Central Mind-Map Statement Card */}
          <div className="p-5 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-center space-y-1.5">
            <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#C92532]">
              Chủ đề trung tâm (Central Statement)
            </span>
            <h5 className="text-base sm:text-lg font-serif font-extrabold text-[#181614]">
              "{speakingTask.part3.centralStatement}"
            </h5>
            <p className="text-xs text-[#51483D] italic">
              🇻🇳 {speakingTask.part3.centralStatementVi}
            </p>
          </div>

          {/* DANH SÁCH MỞ RỘNG SƠ ĐỒ TƯ DUY & BÀI THUYẾT TRÌNH MẪU PART 3 */}
          <div className="rounded-[2px] border border-[#493B2D] divide-y divide-[#493B2D] overflow-hidden bg-[#E9DCC2]">
            {speakingTask.part3.prompts.map((node, nIdx) => {
              const rowKey = `node_${nIdx}`;
              const isOpen = openPart3RowKey === rowKey;
              const numStr = String(nIdx + 1).padStart(2, '0');
              return (
                <div key={rowKey}>
                  <button
                    type="button"
                    onClick={() => setOpenPart3RowKey(isOpen ? null : rowKey)}
                    className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                      isOpen ? 'bg-[#FFF5F4] text-[#C81E1E]' : 'hover:bg-white text-[#111827]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`font-mono text-xs sm:text-sm font-extrabold tabular-nums shrink-0 ${
                          isOpen ? 'text-[#C81E1E]' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {numStr}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold truncate">
                        Gợi ý #{nIdx + 1}: {node.point} ({node.pointVi})
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#C81E1E] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-5 bg-white border-t border-[#E8DFD5] space-y-1.5 text-xs">
                      <p className="text-[#1F2937] font-medium leading-relaxed">{node.explanation}</p>
                      <p className="text-[#6B7280] italic">🇻🇳 {node.explanationVi}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Hàng 04: Your Own Idea */}
            <div>
              <button
                type="button"
                onClick={() => setOpenPart3RowKey(openPart3RowKey === 'own_idea' ? null : 'own_idea')}
                className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                  openPart3RowKey === 'own_idea' ? 'bg-[#F0FDF4] text-[#166534]' : 'hover:bg-white text-[#111827]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs sm:text-sm font-extrabold text-[#166534] tabular-nums shrink-0">
                    04
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold truncate">
                    Your Own Idea (Ý riêng): {speakingTask.part3.yourOwnIdea.point} ({speakingTask.part3.yourOwnIdea.pointVi})
                  </span>
                </div>
                {openPart3RowKey === 'own_idea' ? (
                  <ChevronUp className="w-4 h-4 text-[#166534] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />
                )}
              </button>

              {openPart3RowKey === 'own_idea' && (
                <div className="p-4 sm:p-5 bg-white border-t border-[#E8DFD5] space-y-1.5 text-xs">
                  <p className="text-[#14532D] font-medium leading-relaxed">
                    {speakingTask.part3.yourOwnIdea.explanation}
                  </p>
                  <p className="text-[#166534] italic">🇻🇳 {speakingTask.part3.yourOwnIdea.explanationVi}</p>
                </div>
              )}
            </div>

            {/* Hàng 05: Bài thuyết trình mẫu hoàn chỉnh Part 3 */}
            <div>
              <button
                type="button"
                onClick={() => setOpenPart3RowKey(openPart3RowKey === 'sample' ? null : 'sample')}
                className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                  openPart3RowKey === 'sample' ? 'bg-[#FFF5F4] text-[#C81E1E]' : 'hover:bg-white text-[#111827]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs sm:text-sm font-extrabold text-[#9CA3AF] tabular-nums shrink-0">
                    05
                  </span>
                  <Sparkles className="w-4 h-4 text-[#C81E1E] shrink-0" />
                  <span className="text-xs sm:text-sm font-extrabold truncate">
                    Bài Thuyết Trình Mẫu Hoàn Chỉnh Part 3 ({part3Band === 'B1' ? 'Band B1' : 'Band B2–C1'})
                  </span>
                </div>
                {openPart3RowKey === 'sample' ? (
                  <ChevronUp className="w-4 h-4 text-[#C81E1E] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />
                )}
              </button>

              {openPart3RowKey === 'sample' && (
                <div className="p-4 sm:p-5 bg-white border-t border-[#E8DFD5] space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#EFE6DD]">
                    <span className="font-bold text-[#505460]">Chọn mức điểm bài thuyết trình mẫu:</span>
                    <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E8DFD5] flex-wrap">
                      <button
                        type="button"
                        onClick={() => setPart3Band('B1')}
                        className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                          part3Band === 'B1'
                            ? 'bg-[#C81E1E] text-white shadow-2xs'
                            : 'text-[#4B5563] hover:text-[#111827]'
                        }`}
                      >
                        Band B1
                      </button>
                      <button
                        type="button"
                        onClick={() => setPart3Band('B2C1')}
                        className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                          part3Band === 'B2C1'
                            ? 'bg-[#C81E1E] text-white shadow-2xs'
                            : 'text-[#4B5563] hover:text-[#111827]'
                        }`}
                      >
                        Band B2–C1
                      </button>
                      <span className="h-4 w-px bg-[#E8DFD5] mx-0.5" aria-hidden="true" />
                      <button
                        type="button"
                        onClick={() => setShowPart3SampleVi(!showPart3SampleVi)}
                        className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1 ${
                          showPart3SampleVi
                            ? 'bg-[#166534] text-white'
                            : 'text-[#4B5563] hover:text-[#111827]'
                        }`}
                      >
                        <Languages className="w-3.5 h-3.5" />
                        <span>{showPart3SampleVi ? 'Ẩn tiếng Việt' : 'Hiện tiếng Việt'}</span>
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const speechEn =
                      part3Band === 'B1'
                        ? speakingTask.part3.fullSampleB1
                        : speakingTask.part3.fullSampleB2C1;
                    const speechVi =
                      part3Band === 'B1'
                        ? speakingTask.part3.fullSampleB1Vi
                        : speakingTask.part3.fullSampleB2C1Vi;
                    return (
                      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EFE6DD] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-[#C81E1E]">
                            Bài thuyết trình mẫu ({part3Band === 'B1' ? 'Chuẩn B1' : 'Chuẩn B2–C1 Học thuật'})
                          </span>
                          <button
                            type="button"
                            onClick={() => speakWord(speechEn)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white hover:bg-[#C81E1E] text-[#C81E1E] hover:text-white border border-[#E8DFD5] font-bold cursor-pointer transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Nghe bài thuyết trình</span>
                          </button>
                        </div>
                        <p className="text-sm text-[#1F2937] leading-relaxed font-serif">
                          "{renderTextWithHighlightedVocab(speechEn, dayVocabList, 'crimson')}"
                        </p>
                        {showPart3SampleVi && (
                          <p className="text-[#4B5563] italic pt-2 border-t border-[#EFE6DD]">
                            🇻🇳 <strong>Bản dịch tiếng Việt:</strong> {speechVi}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* DANH SÁCH MỞ RỘNG CÂU HỎI THẢO LUẬN FOLLOW-UP PART 3 (ACCORDION LIST) */}
          {speakingTask.part3.followUpQuestions && speakingTask.part3.followUpQuestions.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <h5 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#C81E1E]">
                Câu Hỏi Thảo Luận Mở Rộng (Follow-up Discussion — Nhấn vào từng câu để mở mẫu trả lời):
              </h5>

              <div className="rounded-2xl border border-[#E8DFD5] divide-y divide-[#E8DFD5] overflow-hidden bg-[#FAF7F2]">
                {speakingTask.part3.followUpQuestions.map((fq, idx) => {
                  const isOpen = openFollowUpIdx === idx;
                  const numStr = String(idx + 1).padStart(2, '0');
                  return (
                    <div key={idx}>
                      <div
                        onClick={() => setOpenFollowUpIdx(isOpen ? null : idx)}
                        className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                          isOpen ? 'bg-[#FFF5F4] text-[#C81E1E]' : 'hover:bg-white text-[#111827]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`font-mono text-xs sm:text-sm font-extrabold tabular-nums shrink-0 ${
                              isOpen ? 'text-[#C81E1E]' : 'text-[#9CA3AF]'
                            }`}
                          >
                            {numStr}
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold truncate">
                            {fq.question}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakWord(fq.question);
                            }}
                            className="p-1.5 rounded-lg bg-white hover:bg-[#C81E1E] text-[#C81E1E] hover:text-white border border-[#E8DFD5] shrink-0 cursor-pointer"
                            title="Nghe câu hỏi thảo luận"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-[#C81E1E]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                          )}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p-4 sm:p-5 bg-white border-t border-[#E8DFD5] space-y-3 text-xs">
                          <div className="text-[#505460] italic">
                            🇻🇳 <strong>Dịch câu hỏi:</strong> {fq.questionVi}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE6DD] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <strong className="text-[#2074BB]">Mẫu trả lời Band B1:</strong>
                                <button
                                  type="button"
                                  onClick={() => speakWord(fq.sampleB1)}
                                  className="text-[11px] font-bold text-[#2074BB] hover:underline cursor-pointer"
                                >
                                  🔊 Nghe
                                </button>
                              </div>
                              <p className="text-[#374151] leading-relaxed">
                                "{renderTextWithHighlightedVocab(fq.sampleB1, dayVocabList, 'emerald')}"
                              </p>
                              {fq.sampleB1Vi && (
                                <p className="text-[11px] text-[#6B7280] italic pt-1 border-t border-[#EFE6DD]">
                                  🇻🇳 {fq.sampleB1Vi}
                                </p>
                              )}
                            </div>

                            <div className="p-3.5 rounded-xl bg-[#FFF9F1] border border-[#FFE2BA] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <strong className="text-[#C81E1E]">Mẫu trả lời Band 7.5+ (B2–C1):</strong>
                                <button
                                  type="button"
                                  onClick={() => speakWord(fq.sampleB2C1)}
                                  className="text-[11px] font-bold text-[#C81E1E] hover:underline cursor-pointer"
                                >
                                  🔊 Nghe
                                </button>
                              </div>
                              <p className="text-[#1F2937] leading-relaxed font-medium">
                                "{renderTextWithHighlightedVocab(fq.sampleB2C1, dayVocabList, 'crimson')}"
                              </p>
                              <p className="text-[11px] text-[#505460] italic pt-1 border-t border-[#FFE2BA]/60">
                                🇻🇳 {fq.sampleB2C1Vi}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Part 3 Speaking Script Workspace with RubyWritingBox */}
          <div className="pt-2 border-t border-[#EFE6DD] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-extrabold uppercase tracking-wider text-[#B83226]">
                ✍️ Kịch Bản Phát Triển Chủ Đề &amp; Trả Lời Follow-up Part 3 (Auto-save 1000ms)
              </span>
              <span className="font-bold text-[#166534] tabular-nums">
                {part3Script.trim() ? part3Script.trim().split(/\s+/).filter(Boolean).length : 0} từ · Tự động lưu nháp khi gõ
              </span>
            </div>
            <RubyWritingBox
              value={part3Script}
              onChange={(val) => {
                setPart3Script(val);
                triggerSpeakingAutoSave(part1Script, part2Script, val, selectedOption);
              }}
              placeholder="Gõ kịch bản phát triển chủ đề Part 3 (I firmly agree with the statement that... First and foremost... Second... Finally...) — Tự động lưu sau 1000ms."
              minHeight={200}
            />
          </div>
        </div>
      )}

      {/* 3. UNIFIED SPEAKING PERSISTENCE, SUBMISSION & HISTORY BAR */}
      <div className="newspaper-card bg-[#F1E7D3] rounded-[2px] border-2 border-[#493B2D] p-5 sm:p-6 space-y-4">
        {saveNotice && (
          <div className="p-3.5 rounded-[2px] bg-[#DCE6D5] border border-[#2E5A36] text-[#2E5A36] text-xs font-bold flex items-center justify-between">
            <span>{saveNotice}</span>
            <button type="button" onClick={() => setSaveNotice(null)} className="hover:underline cursor-pointer">
              Đóng
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap text-xs">
            <span className="font-serif font-extrabold text-[#181614]">
              Tổng kịch bản Speaking Ngày {day}:
            </span>
            <span className="font-mono font-bold text-[#C92532] tabular-nums">
              {totalWordCount} từ
            </span>
            <span className="text-[#796B59]">·</span>
            <span className="text-[#51483D] font-mono font-semibold tabular-nums">
              Từ mục tiêu: <strong className="text-[#2E5A36]">{usedTargetVocab.length}/{dayVocabList.length}</strong>
            </span>
            {lastSavedTime && (
              <span className="text-[#2E5A36] font-mono font-semibold tabular-nums">
                · Đã lưu {lastSavedTime}
              </span>
            )}
          </div>

          {/* Unified Action Cluster */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleManualSaveSpeaking}
              className="px-3 py-2 rounded-[2px] bg-[#E9DCC2] hover:bg-[#DCC9A8] border border-[#493B2D] text-xs font-mono uppercase tracking-wider font-bold text-[#181614] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-[#C92532]" />
              <span>Lưu nháp</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSpeakingHistory(!showSpeakingHistory)}
              className={`px-3 py-2 rounded-[2px] border text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                showSpeakingHistory
                  ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                  : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border-[#493B2D]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lịch sử ({speakingHistory.length}/{allSpeakingLogs.length})</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndCompleteSpeaking}
              className="px-4 py-2 rounded-[2px] bg-[#2E5A36] hover:bg-[#1E4620] border border-[#181614] text-[#F1E7D3] text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lưu &amp; Hoàn thành Speaking</span>
            </button>
          </div>
        </div>

        {showSpeakingHistory && (
          <div className="p-4 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <strong className="font-serif text-[#181614]">
                🎙️ Lịch sử kịch bản Speaking đã lưu (Tổng {allSpeakingLogs.length} bản ghi trên mọi ngày)
              </strong>
              <button
                type="button"
                onClick={() => setShowSpeakingHistory(false)}
                className="text-[#51483D] hover:text-[#181614] cursor-pointer font-bold"
              >
                Đóng ✕
              </button>
            </div>
            {allSpeakingLogs.length === 0 ? (
              <p className="text-[#51483D] italic font-serif">
                Chưa có kịch bản Speaking nào trong lịch sử. Hãy gõ kịch bản ở Part 1/2/3 và bấm "Lưu &amp; Hoàn thành Speaking".
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {allSpeakingLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-[2px] bg-[#F1E7D3] border border-[#493B2D] space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-mono">
                        {log.day && (
                          <span className="font-extrabold text-[#C92532]">
                            Ngày {log.day}
                          </span>
                        )}
                        <span className="text-[#796B59]">·</span>
                        <span className="font-bold text-[#181614] tabular-nums">{log.wordCount} từ</span>
                        <span className="text-[#796B59]">·</span>
                        <span className="text-[#51483D] tabular-nums">{new Date(log.submittedAt).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                    {log.usedTargetVocab && log.usedTargetVocab.length > 0 && (
                      <div className="text-[11px] text-[#2E5A36] font-mono font-bold">
                        Target Vocab đã dùng: {log.usedTargetVocab.join(', ')}
                      </div>
                    )}
                    <p className="text-[#51483D] line-clamp-2 italic font-serif">"{log.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
