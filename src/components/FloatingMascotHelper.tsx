import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { VINTAGE_EDITORIAL_ASSETS } from './VintageNewspaperIllustrations';

interface FloatingMascotHelperProps {
  onOpenTutor: () => void;
  currentWord?: string;
}

export const FloatingMascotHelper: React.FC<FloatingMascotHelperProps> = ({
  onOpenTutor,
  currentWord = 'discrepancy'
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (isDismissed) return null;

  return (
    <div
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Vintage Newspaper Press Dispatch Note */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 18, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 14, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="mr-2 w-80 bg-[#F1E7D3] border-2 border-[#181614] rounded-[2px] shadow-[4px_4px_0px_#181614] text-[#181614] overflow-hidden relative"
          >
            {/* Crimson Editorial Header Strip */}
            <div className="px-3.5 py-2 bg-[#C92532] border-b-2 border-[#181614] text-[#F1E7D3] flex items-center justify-between gap-2">
              <span className="font-oswald font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F1E7D3] shrink-0" />
                <span>MẸO TRÍ NHỚ IELTS • GIÁO SƯ MÈO</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDismissed(true);
                }}
                aria-label="Đóng ghi chú"
                className="p-0.5 text-[#F1E7D3] hover:bg-[#991D27] border border-transparent hover:border-[#181614] rounded-[2px] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Body with Woodcut Cat & Press Dispatch Copy */}
            <div className="p-3.5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 shrink-0 border border-[#181614] bg-[#E9DCC2] overflow-hidden shadow-[2px_2px_0px_#181614]">
                  <img
                    src={VINTAGE_EDITORIAL_ASSETS.mascot.compass}
                    alt="Giáo Sư Mèo IELTS"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover scale-[1.12] object-center block"
                  />
                </div>
                <p className="text-xs sm:text-sm font-dm font-medium text-[#181614] leading-snug">
                  Bạn đang tra từ <strong className="font-serif text-[#C92532]">"{currentWord}"</strong>? Từ này thường đi với giới từ <em className="font-serif font-bold">between</em>. Bấm để mở <strong>Live AI Tutor</strong> phân tích cặp từ dễ nhầm lẫn!
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenTutor}
                className="w-full py-2 px-3 bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] border-[1.5px] border-[#181614] rounded-[2px] shadow-[2px_2px_0px_#181614] font-oswald font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Mở Live AI Tutor Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Peek Woodcut Mascot Dispatch Tab on Right Edge */}
      <motion.div
        animate={{
          x: isHovered ? 0 : 18,
        }}
        transition={{ type: 'spring', damping: 22, stiffness: 220 }}
        onClick={onOpenTutor}
        className="bg-[#F1E7D3] border-l-2 border-y-2 border-[#181614] rounded-l-[2px] p-1.5 shadow-[-3px_3px_0px_#181614] cursor-pointer hover:bg-[#DCC9A8] flex items-center gap-1.5"
        title="Giáo Sư Mèo IELTS — Bấm để mở Live AI Tutor phân tích sắc thái từ"
      >
        <div className="relative w-14 h-14 border border-[#181614] bg-[#E9DCC2] overflow-hidden">
          <img
            src={VINTAGE_EDITORIAL_ASSETS.mascot.compass}
            alt="Giáo Sư Mèo IELTS"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover scale-[1.12] object-center block"
          />
          <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#C92532] border border-[#181614] rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};

