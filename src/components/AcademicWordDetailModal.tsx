import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  BookOpen,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Layers,
  MessageSquareQuote,
  Check,
  Star
} from 'lucide-react';
import { VocabItem } from '../data/vocabularyData';
import {
  EnrichedWordEntry,
  resolveEnrichedWordEntry
} from '../data/academicLexiconEnrichment';
import {
  speakWord,
  fetchFreeDictionaryPhonetics,
  DictionaryPhoneticsResult
} from '../utils/soundAndSpeech';

interface AcademicWordDetailModalProps {
  item: VocabItem | null;
  isOpen: boolean;
  onClose: () => void;
  isMastered?: boolean;
  onToggleMastered?: (id: string, e?: React.MouseEvent) => void;
  onOpenAiTutor?: (entry: EnrichedWordEntry) => void;
}

/**
 * Tô đậm từ khóa (highlight_keyword) bên trong câu ví dụ tiếng Anh một cách an toàn
 */
function renderHighlightedSentence(sentence: string, keyword: string): React.ReactNode {
  if (!sentence || !keyword) return sentence;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = sentence.split(regex);
  if (parts.length <= 1) return sentence;

  return parts.map((part, idx) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark
        key={idx}
        className="bg-[#E8B7AC]/85 text-[#991D27] px-1 py-0.5 rounded-[2px] font-extrabold border-b border-[#C92532] not-italic"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={idx}>{part}</React.Fragment>
    )
  );
}

export const AcademicWordDetailModal: React.FC<AcademicWordDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  isMastered = false,
  onToggleMastered,
  onOpenAiTutor
}) => {
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [livePhonetics, setLivePhonetics] = useState<DictionaryPhoneticsResult | null>(null);

  useEffect(() => {
    let active = true;
    if (isOpen && item?.word) {
      setLivePhonetics(null);
      fetchFreeDictionaryPhonetics(item.word).then((res) => {
        if (active) setLivePhonetics(res);
      });
    }
    return () => {
      active = false;
    };
  }, [isOpen, item?.word]);

  if (!isOpen || !item) return null;

  const entry: EnrichedWordEntry = resolveEnrichedWordEntry(item);
  const displayIpaUk = livePhonetics?.ipaUk || entry.ipa_uk;
  const displayIpaUs = livePhonetics?.ipaUs || entry.ipa_us;
  const hasHumanMp3 = Boolean(livePhonetics?.audioAny || livePhonetics?.audioUk || livePhonetics?.audioUs);

  const handlePlayAudio = (text: string, preferAccent?: 'uk' | 'us') => {
    const cleanText = text.replace(/\s*\(.*?\)\s*/g, '').trim();
    setSpeakingText(preferAccent ? `${text}-${preferAccent}` : text);

    const directMp3 =
      preferAccent === 'uk'
        ? livePhonetics?.audioUk || livePhonetics?.audioAny
        : preferAccent === 'us'
          ? livePhonetics?.audioUs || livePhonetics?.audioAny
          : null;

    if (directMp3 && cleanText.toLowerCase() === entry.word.toLowerCase()) {
      const audio = new Audio(directMp3);
      audio.play().catch(() => speakWord(cleanText));
    } else {
      speakWord(cleanText);
    }

    window.setTimeout(() => {
      setSpeakingText(null);
    }, 1800);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#181614]/75 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F1E7D3] text-[#181614] border-[3px] border-[#181614] shadow-[8px_8px_0px_#181614] rounded-[2px]"
          style={{ backgroundImage: 'var(--fiber), var(--grain)' }}
        >
          {/* 1. TOP VINTAGE NEWSPAPER MASTHEAD STRIP */}
          <div className="sticky top-0 z-20 bg-[#181614] text-[#F1E7D3] px-4 sm:px-6 py-2.5 border-b-2 border-[#C92532] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] font-oswald uppercase tracking-[0.16em] font-bold">
              <span className="inline-block w-2 h-2 bg-[#C92532]" />
              <span>OXFORD &amp; CAMBRIDGE ACADEMIC LEXICON DOSSIER • MASTER ENGLISH</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng hồ sơ từ vựng"
              className="p-1 text-[#F1E7D3]/80 hover:text-white hover:bg-[#C92532] rounded-[2px] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 sm:p-7 space-y-5">
            {/* 2. HEADWORD, POS, CEFR, UK/US IPA & AUDIO CONTROLS */}
            <div className="border-b-2 border-[#181614] pb-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-[#C92532] text-[#F1E7D3] border border-[#181614] font-mono text-xs font-bold uppercase">
                    CEFR {entry.cefr_level}
                  </span>
                  {entry.source_corpus && (
                    <span className="px-2.5 py-0.5 bg-[#181614] text-[#F1E7D3] border border-[#C92532] font-mono text-[11px] font-bold">
                      ★ {entry.source_corpus}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 bg-[#E9DCC2] text-[#181614] border border-[#493B2D] font-mono text-xs font-bold lowercase">
                    {entry.pos}
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#181614] text-[#F1E7D3] font-mono text-[11px] font-bold uppercase">
                    Register: {entry.academic_nuance.register}
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#E9DCC2] text-[#51483D] border border-[#493B2D]/60 font-dm text-xs font-bold uppercase">
                    {entry.topic}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 flex-wrap">
                  <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#181614] tracking-tight">
                    {entry.word}
                  </h2>

                  {/* IPA UK & US Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      data-sound="none"
                      data-speak-only="true"
                      data-speak="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(entry.word, 'uk');
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] border text-xs font-mono font-bold transition-colors cursor-pointer ${
                        speakingText === `${entry.word}-uk`
                          ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                          : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border-[#493B2D]'
                      }`}
                      title="Nghe phát âm chuẩn Anh-Anh (UK)"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#C92532] shrink-0" />
                      <span>UK {displayIpaUk}</span>
                    </button>

                    <button
                      type="button"
                      data-sound="none"
                      data-speak-only="true"
                      data-speak="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(entry.word, 'us');
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] border text-xs font-mono font-bold transition-colors cursor-pointer ${
                        speakingText === `${entry.word}-us`
                          ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                          : 'border-[#493B2D] bg-[#FAF6EE] hover:bg-[#E9DCC2] text-[#51483D]'
                      }`}
                      title="Nghe phát âm chuẩn Anh-Mỹ (US)"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#51483D] shrink-0" />
                      <span>US {displayIpaUs}</span>
                    </button>

                    <span className="px-2 py-0.5 rounded-[2px] bg-[#E9DCC2]/75 border border-[#493B2D]/50 text-[10px] font-mono text-[#51483D]">
                      {hasHumanMp3 ? '🎧 Oxford/Cambridge Human MP3' : '🔊 Smart TTS Audio'}
                    </span>
                  </div>
                </div>

                {/* Core Vietnamese Meaning */}
                <p className="font-dm font-extrabold text-base sm:text-lg text-[#C92532] leading-snug">
                  {entry.core_meaning_vi}
                </p>
              </div>

              {/* Action Buttons (Mark Mastered & Ask AI Tutor) */}
              <div className="flex items-center gap-2 shrink-0">
                {onToggleMastered && (
                  <button
                    type="button"
                    data-sound="stamp"
                    onClick={(e) => onToggleMastered(item.id, e)}
                    className={`px-3.5 py-2 rounded-[2px] border-2 border-[#181614] font-oswald text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#181614] cursor-pointer ${
                      isMastered
                        ? 'bg-[#1E5E3A] text-[#F1E7D3]'
                        : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614]'
                    }`}
                  >
                    {isMastered ? <Check className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5 text-[#C92532]" />}
                    <span>{isMastered ? 'Đã Thuộc Từ Này' : 'Đánh Dấu Đã Thuộc'}</span>
                  </button>
                )}

                {onOpenAiTutor && (
                  <button
                    type="button"
                    data-sound="major"
                    onClick={() => onOpenAiTutor(entry)}
                    className="px-3.5 py-2 rounded-[2px] bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] border-2 border-[#181614] shadow-[2px_2px_0px_#181614] font-oswald text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Phân Tích Cùng AI</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3. FEYNMAN EXPLANATION & ACADEMIC NUANCE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Feynman Explanation */}
              <div className="p-4 bg-[#E9DCC2] border-2 border-[#493B2D] border-l-4 border-l-[#C92532] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-oswald font-bold uppercase tracking-wider text-[#C92532]">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>Giải Thích Trực Quan (Feynman Method)</span>
                </div>
                <p className="text-xs sm:text-[13px] font-dm text-[#181614] leading-relaxed">
                  {entry.feynman_explanation}
                </p>
              </div>

              {/* Academic Nuance & Exam Application */}
              <div className="p-4 bg-[#FAF6EE] border-2 border-[#493B2D] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-oswald font-bold uppercase tracking-wider text-[#181614]">
                    <GraduationCap className="w-4 h-4 text-[#C92532] shrink-0" />
                    <span>Sắc Thái Học Thuật &amp; Ứng Dụng Phòng Thi</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#181614] text-[#F1E7D3] font-mono text-[10px] font-bold uppercase">
                    {entry.academic_nuance.register}
                  </span>
                </div>
                <div className="text-xs font-dm space-y-1">
                  <div>
                    <strong className="text-[#C92532]">Vị trí xuất hiện:</strong>{' '}
                    <span className="text-[#181614] font-semibold">
                      {entry.academic_nuance.exam_application}
                    </span>
                  </div>
                  <div className="text-[#51483D] leading-relaxed">
                    <strong className="text-[#181614]">Mẹo ăn điểm:</strong>{' '}
                    {entry.academic_nuance.usage_note}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. LEXICAL UPGRADE (B1 -> C1/C2) & WORD FAMILY */}
            <div className="p-4 bg-[#E9DCC2]/80 border-2 border-[#181614] shadow-[3px_3px_0px_#181614] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#493B2D]/40 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-oswald font-bold uppercase tracking-wider text-[#181614]">
                  <Layers className="w-4 h-4 text-[#C92532]" />
                  <span>Nâng Cấp Ngôn Từ (Lexical Paraphrase Upgrade)</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF6EE] border border-[#181614] text-xs font-mono font-bold">
                  <span className="text-[#51483D] line-through">{entry.upgrade_from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C92532]" />
                  <span className="text-[#C92532] font-extrabold">{entry.current_word}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-dm">
                <div className="p-2.5 bg-[#FAF6EE] border border-[#493B2D]">
                  <div className="font-mono text-[10px] font-bold uppercase text-[#51483D]">
                    Mức Cơ Bản (Band B1)
                  </div>
                  <div className="font-bold text-[#181614] mt-0.5">
                    {entry.synonyms_upgrade.basic_b1}
                  </div>
                </div>

                <div className="p-2.5 bg-[#FAF6EE] border border-[#493B2D]">
                  <div className="font-mono text-[10px] font-bold uppercase text-[#1E5E3A]">
                    Mức Khá Giỏi (Band B2 - C1)
                  </div>
                  <div className="font-bold text-[#181614] mt-0.5">
                    {entry.synonyms_upgrade.academic_b2_c1.join(', ')}
                  </div>
                </div>

                <div className="p-2.5 bg-[#E8B7AC]/45 border border-[#C92532]">
                  <div className="font-mono text-[10px] font-bold uppercase text-[#C92532]">
                    Đỉnh Cao Học Thuật (Band C1 - C2)
                  </div>
                  <div className="font-extrabold text-[#991D27] mt-0.5">
                    {entry.synonyms_upgrade.mastery_c2.join(', ')}
                  </div>
                </div>
              </div>

              {/* Word Family Row */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs font-dm">
                <span className="font-oswald font-bold uppercase text-[#51483D]">Họ từ (Word Family):</span>
                {Object.entries(entry.word_family).map(([posKey, words]) =>
                  words && words.length > 0 ? (
                    <span
                      key={posKey}
                      className="px-2.5 py-0.5 bg-[#FAF6EE] border border-[#493B2D] font-mono text-[11px]"
                    >
                      <strong className="text-[#C92532]">{posKey}:</strong> {words.join(', ')}
                    </span>
                  ) : null
                )}
              </div>
            </div>

            {/* 5. CATEGORIZED OXFORD COLLOCATIONS */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-oswald font-bold text-sm uppercase tracking-wider text-[#181614] flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#C92532]" />
                  <span>Cụm Từ Kết Hợp Ăn Điểm (Oxford Academic Collocations)</span>
                </h3>
                <span className="text-[11px] font-mono text-[#51483D]">
                  Bấm vào từng cụm để nghe phát âm
                </span>
              </div>

              <div
                data-sound="none"
                onClick={(e) => e.stopPropagation()}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
              >
                {entry.collocations.map((col, idx) => {
                  const isPlayingCol = speakingText === col.phrase;
                  return (
                    <button
                      key={idx}
                      type="button"
                      data-sound="none"
                      data-speak-only="true"
                      data-speak="true"
                      data-collocation="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(col.phrase);
                      }}
                      className={`collocation-tag p-3 rounded-[2px] border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                        isPlayingCol
                          ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                          : 'bg-[#FAF6EE] hover:bg-[#E9DCC2] text-[#181614] border-[#493B2D]'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <span
                          className={`inline-block font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-[2px] ${
                            isPlayingCol
                              ? 'bg-[#181614] text-[#F1E7D3]'
                              : 'bg-[#E9DCC2] text-[#C92532] border border-[#C92532]/40'
                          }`}
                        >
                          {col.category}
                        </span>
                        <div className="font-dm font-extrabold text-xs sm:text-sm pt-0.5">
                          {col.phrase}
                        </div>
                        <div
                          className={`text-xs font-dm ${
                            isPlayingCol ? 'text-[#F1E7D3]/90' : 'text-[#51483D]'
                          }`}
                        >
                          ↳ {col.meaning_vi}
                        </div>
                      </div>
                      <Volume2
                        className={`w-4 h-4 shrink-0 mt-1 ${
                          isPlayingCol ? 'text-[#F1E7D3]' : 'text-[#C92532]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. MULTI-CONTEXT EXAMPLES WITH AUDIO & KEYWORD HIGHLIGHT */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-oswald font-bold text-sm uppercase tracking-wider text-[#181614] flex items-center gap-2">
                  <MessageSquareQuote className="w-4 h-4 text-[#C92532]" />
                  <span>Hệ Thống Câu Ví Dụ Đa Ngữ Cảnh (Speaking • Writing Task 2 • Collocation)</span>
                </h3>
                <span className="text-[11px] font-mono text-[#51483D]">
                  {entry.examples.length} ngữ cảnh thực chiến
                </span>
              </div>

              <div
                data-sound="none"
                onClick={(e) => e.stopPropagation()}
                className="space-y-2.5"
              >
                {entry.examples.map((ex, idx) => {
                  const isPlayingEx = speakingText === ex.sentence_en;
                  return (
                    <div
                      key={idx}
                      data-sound="none"
                      data-speak-only="true"
                      data-example="true"
                      onClick={(e) => e.stopPropagation()}
                      className="example-box p-3.5 bg-[#FAF6EE] border-2 border-[#493B2D] rounded-[2px] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 bg-[#181614] text-[#F1E7D3] font-mono text-[10px] font-bold uppercase tracking-wider">
                          {idx + 1}. {ex.context_type}
                        </span>

                        <button
                          type="button"
                          data-sound="none"
                          data-speak-only="true"
                          data-speak="true"
                          data-example="true"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayAudio(ex.sentence_en);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] border text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                            isPlayingEx
                              ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                              : 'bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border-[#493B2D]'
                          }`}
                          title="Nghe đọc cả câu ví dụ này"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#C92532]" />
                          <span>Nghe cả câu</span>
                        </button>
                      </div>

                      <p
                        data-sound="none"
                        data-speak-only="true"
                        data-speak="true"
                        data-example="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudio(ex.sentence_en);
                        }}
                        title="Bấm để nghe phát âm câu ví dụ này"
                        className="example-sentence font-serif italic font-bold text-sm sm:text-[15px] text-[#181614] hover:text-[#C92532] leading-relaxed cursor-pointer transition-colors"
                      >
                        “{renderHighlightedSentence(ex.sentence_en, ex.highlight_keyword)}”
                      </p>

                      <p className="text-xs font-dm text-[#51483D] flex items-start gap-1.5">
                        <span className="text-[#C92532] font-bold">↳</span>
                        <span>{ex.translation_vi}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
