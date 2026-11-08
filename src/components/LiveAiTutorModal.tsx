import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Send } from 'lucide-react';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from './VintageNewspaperIllustrations';
import {
  routeAndExecuteQuery,
  executeConfirmedFunctionCall,
  PendingEditorialConfirmation,
  ModelTier
} from '../services/aiHarnessService';

export interface TutorExplanationData {
  title: string;
  word1: string;
  word2?: string;
  ipa?: string;
  meaning: string;
  nuanceExplanation: string;
  writingExample: string;
  speakingExample: string;
  commonMistake: string;
  examTip: string;
}

interface ChatMessageItem {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  routedTier?: ModelTier;
  citations?: string[];
  pendingConfirmation?: PendingEditorialConfirmation | null;
  confirmationResolved?: 'confirmed' | 'cancelled';
}

interface LiveAiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: TutorExplanationData | null;
  activeSection?: string;
  isQuizActive?: boolean;
}

export const LiveAiTutorModal: React.FC<LiveAiTutorModalProps> = ({
  isOpen,
  onClose,
  data,
  activeSection = 'trang_nhat',
  isQuizActive = false
}) => {
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatLog, setChatLog] = useState<ChatMessageItem[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (data?.word1) {
      setChatLog([
        {
          id: 'init-word',
          sender: 'tutor',
          text: `Xin chào! Mình là Giáo sư Mèo. Bạn đang tìm hiểu từ "${data.word1}" (${data.meaning}). Hãy đặt câu hỏi bất kỳ về cách dùng, ngữ pháp, cấu trúc PDF hoặc yêu cầu lưu vào Thẻ Hồ Sơ / Bản Đính Chính nhé!`
        }
      ]);
    } else {
      setChatLog([
        {
          id: 'init-general',
          sender: 'tutor',
          text: 'Xin chào! Mình là Giáo sư Mèo tại Bàn Biên Tập Học Thuật. Hệ thống AI Harness đã kết nối toàn bộ 13 chuyên mục Tòa Soạn. Bạn muốn tra cứu từ vựng, Quy Chuẩn Hành Văn, kiểm tra Bản Đính Chính hay xem Báo Cáo Nhà Báo hôm nay?'
        }
      ]);
    }
  }, [isOpen, data?.word1, data?.meaning]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog, isLoading]);

  if (!isOpen) return null;

  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = userQuestion.trim();
    if (!q || isLoading) return;

    setUserQuestion('');
    const userMsgId = `user_${Date.now()}`;
    setChatLog((prev) => [...prev, { id: userMsgId, sender: 'user', text: q }]);
    setIsLoading(true);

    try {
      const contextualPrompt = data?.word1
        ? `[Ngữ cảnh từ đang xem: "${data.word1}" (${data.meaning}) - ${data.nuanceExplanation}] Câu hỏi của học viên: ${q}`
        : q;

      const detectedSection =
        activeSection ||
        (typeof window !== 'undefined' ? window.location.pathname.replace(/^\//, '') : 'trang_nhat');

      const detectedQuizActive =
        isQuizActive ||
        (typeof window !== 'undefined' &&
          (window.location.pathname.includes('speed') || detectedSection === 'speed'));

      const harnessRes = await routeAndExecuteQuery(
        contextualPrompt,
        detectedSection,
        detectedQuizActive
      );

      setChatLog((prev) => [
        ...prev,
        {
          id: `tutor_${Date.now()}`,
          sender: 'tutor',
          text: harnessRes.replyText,
          routedTier: harnessRes.routedTier,
          citations: harnessRes.citations,
          pendingConfirmation: harnessRes.pendingConfirmation || null
        }
      ]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          id: `tutor_err_${Date.now()}`,
          sender: 'tutor',
          text: 'Bàn Biên Tập đang đối chiếu lại sổ lưu trữ. Bạn vui lòng thử gửi lại câu hỏi nhé!'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async (msgId: string, pending: PendingEditorialConfirmation) => {
    setChatLog((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, confirmationResolved: 'confirmed' } : m))
    );

    const execResult = await executeConfirmedFunctionCall(pending);
    setChatLog((prev) => [
      ...prev,
      {
        id: `confirm_res_${Date.now()}`,
        sender: 'tutor',
        text: `✓ [ĐÃ XÁC NHẬN & THỰC THI TÒA SOẠN]: ${execResult.message}`,
        routedTier: 'tier_0_local'
      }
    ]);
  };

  const handleCancelAction = (msgId: string, pending: PendingEditorialConfirmation) => {
    setChatLog((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, confirmationResolved: 'cancelled' } : m))
    );
    setChatLog((prev) => [
      ...prev,
      {
        id: `cancel_res_${Date.now()}`,
        sender: 'tutor',
        text: `✕ [ĐÃ HỦY LỆNH]: Bàn Biên Tập đã hủy thao tác "${pending.functionName}" theo yêu cầu của bạn.`,
        routedTier: 'tier_0_local'
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181614]/75">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-[#F1E7D3] newspaper-card border-2 border-[#181614] rounded-[2px] shadow-[6px_6px_0px_#181614] overflow-hidden flex flex-col h-[560px] max-h-[88vh]"
      >
        {/* Masthead Header: Editorial Correspondence Desk */}
        <div className="bg-[#181614] text-[#F1E7D3] px-4 py-3 border-b-2 border-[#493B2D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#F1E7D3] border border-[#C92532] flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={VINTAGE_EDITORIAL_ASSETS.editorial.quillCatDesk}
                alt="Professor Cat Writing with Quill"
                className="w-full h-full object-cover mix-blend-multiply"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-black tracking-wide text-[#F1E7D3]">
                  Giáo Sư Mèo • Bàn Biên Tập
                </h2>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#C92532] text-[#F1E7D3]">
                  LIVE TUTOR
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#DCC9A8] flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#2E5A36] border border-[#F1E7D3]"></span>
                EDITORIAL CORRESPONDENCE DESK
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 border border-[#796B59] text-[#DCC9A8] hover:text-[#F1E7D3] hover:bg-[#C92532] transition-colors cursor-pointer"
            title="Đóng hộp thoại"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Woodcut Illustration Banner */}
        <div className="px-4 py-2.5 bg-[#DCC9A8] border-b border-[#493B2D] flex items-center gap-3">
          <VintageEngravingFrame
            src={VINTAGE_EDITORIAL_ASSETS.editorial.quillCatDesk}
            alt="Cat writing with quill at desk"
            className="w-14 h-14 shrink-0"
            framed={false}
          />
          <p className="text-[11px] font-serif italic text-[#181614] leading-snug">
            “Mọi thắc mắc về sắc thái từ vựng C1/C2, cấu trúc ngữ pháp và Collocations đều được giải đáp tức thì theo chuẩn học thuật.”
          </p>
        </div>

        {/* Center: Correspondence Ledger */}
        <div
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#E9DCC2]"
        >
          {chatLog.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[86%] px-3.5 py-2.5 rounded-[2px] text-xs sm:text-sm leading-relaxed border-[1.5px] whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] shadow-[2px_2px_0px_#181614]'
                    : 'bg-[#F1E7D3] text-[#181614] border-[#181614] shadow-[2px_2px_0px_rgba(24,22,20,0.2)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-widest opacity-75 mb-1">
                  <span>{msg.sender === 'user' ? 'HỌC VIÊN HỎI:' : 'GIÁO SƯ MÈO:'}</span>
                </div>

                <div>{msg.text}</div>

                {/* Human-in-the-Loop Confirmation Card */}
                {msg.pendingConfirmation && !msg.confirmationResolved && (
                  <div className="mt-2.5 p-2.5 bg-[#E9DCC2] border-[1.5px] border-[#C92532] rounded-[2px] shadow-[2px_2px_0px_#181614]">
                    <div className="font-mono text-[11px] font-bold text-[#181614] leading-snug">
                      [CẦN XÁC NHẬN TÒA SOẠN]: AI muốn thực hiện lệnh &quot;
                      {msg.pendingConfirmation.functionName}&quot;. Bạn có đồng ý thực thi không?
                    </div>
                    <div className="text-[11px] font-serif italic text-[#51483D] mt-0.5">
                      Chi tiết: {msg.pendingConfirmation.displaySummary}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfirmAction(msg.id, msg.pendingConfirmation!)}
                        className="px-2.5 py-1 bg-[#2E5A36] hover:bg-[#23472A] text-[#F1E7D3] border border-[#181614] rounded-[2px] font-mono text-[10px] font-bold uppercase cursor-pointer shadow-[1px_1px_0px_#181614]"
                      >
                        [✓ Xác nhận thực thi]
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelAction(msg.id, msg.pendingConfirmation!)}
                        className="px-2.5 py-1 bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] border border-[#181614] rounded-[2px] font-mono text-[10px] font-bold uppercase cursor-pointer shadow-[1px_1px_0px_#181614]"
                      >
                        [✕ Hủy bỏ]
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="px-3.5 py-2 rounded-[2px] text-xs font-mono bg-[#F1E7D3] text-[#181614] border-[1.5px] border-[#181614] shadow-[2px_2px_0px_rgba(24,22,20,0.2)]">
                Giáo Sư Mèo đang tra sổ 13 chuyên mục Tòa Soạn...
              </div>
            </div>
          )}
        </div>

        {/* Bottom: Typewriter Dispatch Input */}
        <div className="p-3 bg-[#F1E7D3] border-t-2 border-[#181614]">
          <form onSubmit={handleAskTutor} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Hỏi từ vựng, Cấu trúc #23, ERRATA #1 hoặc yêu cầu chuyển mục..."
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 input-newspaper text-xs sm:text-sm"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 btn-newspaper-red text-xs font-mono uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi</span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

