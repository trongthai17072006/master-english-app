import React, { useRef } from 'react';
import { BoundedBannerTimer } from '../components/BoundedBannerTimer';

/**
 * 19th-Century Woodcut & Copperplate Engravings Registry
 * Stored in /public/assets/engravings/
 * Every route across the application uses its own unique historical landmark or scholarly etching.
 */
export const ENGRAVING_ASSETS = {
  architecture: {
    // 1. Trang Nhất (Homepage Hero Only): Westminster Palace & Big Ben Riverfront Engraving
    westminsterRiverfront: '/assets/engravings/media_1793811851379_f0af845e.jpg',
    // 2. Kỳ Xuất Bản (60 Số) (IeltsChallengePage): Roman Colosseum Copperplate Etching
    colosseumRome: '/assets/engravings/colosseum.jpg',
    // 3. Tổng Kho Tư Liệu (VocabDirectory): One Pillar Pagoda (Chùa Một Cột, Hà Nội)
    onePillarPagoda: '/assets/engravings/Saigon_Notre-Dame_Cathedral_etch…_a3ab8b71_2K.jpg',
    // 4. Kho Chữ & Thuật Ngữ (SpeedQuiz): Khuê Văn Các (Văn Miếu Quốc Tử Giám)
    khueVanCac: '/assets/engravings/media_1793811781405_06f70de0.jpg',
    // 5. Quy Chuẩn Hành Văn (ExpandedExamplesLibrary): Saigon Notre-Dame Cathedral
    saigonNotreDame: '/assets/engravings/media_1793811853284_46df672f.jpg',
    // 6. Phối Ngữ & Mạch Văn (CollocationsQuiz): Eiffel Tower Paris
    eiffelTower: '/assets/engravings/media_1793811854733_ff0469e4.jpg',
    // 7. Thẩm Định Ngữ Nghĩa (DistinctionsQuiz): Statue of Liberty New York
    statueOfLiberty: '/assets/engravings/media_1793811759869_032b41e1.jpg',
    // 8. Sơ Đồ Liên Đới (InteractiveNodeMatching): Chùa Cầu Hội An (Japanese Covered Bridge)
    japaneseCoveredBridge: '/assets/engravings/media_1793811785155_7bd64c72.jpg',
    // 9. Chuyên Đề Học Thuật (ContextQuiz): Empire State Building New York
    empireState: '/assets/engravings/media_1793811783266_536da3d9.jpg',
    // 10. Bản Đính Chính (MistakeBank): Christ the Redeemer Rio de Janeiro
    christRedeemer: '/assets/engravings/media_1793811779491_5535d5a2.jpg',
    // Additional unique architectural engravings for secondary cards, quotes & plates:
    towerBridgeLondon: '/assets/engravings/media_1793811857019_aa8b3c02.jpg',
    sydneyOperaHouse: '/assets/engravings/media_1793811786405_92512a1a.jpg',
    londonRedTelephoneBooth: '/assets/engravings/media_1793811756011_b1e728ae.jpg',
    fansipanMountainPagoda: '/assets/engravings/media_1793811753703_9c8a0c28.jpg',
    himalayaMonasteryPilgrimage: '/assets/engravings/media_1793811758027_1241b438.jpg',
    pyramidsGiza: '/assets/engravings/pyramids-giza.jpg',
    tajMahal: '/assets/engravings/taj-mahal.jpg',
    tokyoTower: '/assets/engravings/tokyo-tower.jpg',
  },
  scholarCat: {
    // Woodcut Scholar Cat reading open book at desk (Tiêu Điểm Hôm Nay)
    readingAtDesk: '/assets/engravings/media_1793811812608_a204e6ab.jpg',
    // Woodcut Scholar Cat studying in grand library with ladder & magnifying glass (Thẻ Hồ Sơ Lưu Trữ)
    grandLibrary: '/assets/engravings/media_1793811820951_bf81ab82.jpg',
    // Woodcut Scholar Cat writing with feather quill by candlelight
    quillCandlelight: '/assets/engravings/media_1793811814509_8e1a0a56.jpg',
    // Woodcut Scholar Cat holding red sand hourglass
    hourglassKeeper: '/assets/engravings/media_1793811816204_28d89c59.jpg',
    // Woodcut Scholar Cat writing manuscript by warm glowing candle
    manuscriptGlow: '/assets/engravings/media_1793811817772_fbaf0cee.jpg',
    // Woodcut Scholar Cat reading huge dictionary in Victorian armchair
    armchairDictionary: '/assets/engravings/media_1793811819338_c2158141.jpg',
    // Woodcut Scholar Cat standing next to tall stack of engraved books
    standingBookStack: '/assets/engravings/media_1793811822599_e91b8190.jpg',
  },
} as const;

/**
 * ARCHETYPE A: "The Horizon Right-Bleed Header" (Seamless Paper Integration)
 * Anchors a 19th-century architectural woodcut to the right 38%-48% of a header banner,
 * dissolving into the #F1E7D3 parchment via mix-blend-mode: multiply and a smooth left-to-right mask.
 */
export interface HorizonEngravingHeaderProps {
  engravingSrc: string;
  engravingAlt: string;
  figLabel?: string;
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
  imageWidthClass?: string;
  imagePositionClass?: string;
  imageFitClass?: string;
  imageStyle?: React.CSSProperties;
  imageOpacity?: number;
  rightSlotAbsolute?: boolean;
  timerPageId?: string;
}

export const HorizonEngravingHeader: React.FC<HorizonEngravingHeaderProps> = ({
  engravingSrc,
  engravingAlt,
  figLabel,
  children,
  rightSlot,
  className = '',
  imageWidthClass = 'w-[46%] sm:w-[44%] lg:w-[42%]',
  imagePositionClass = 'right-0 top-0 bottom-0',
  imageFitClass = 'w-full h-full object-cover object-center',
  imageStyle,
  imageOpacity = 0.88,
  rightSlotAbsolute = false,
  timerPageId,
}) => {
  const bannerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={bannerRef} className="relative z-30">
      <div
        className={`hero-banner-container relative overflow-hidden rounded-[2px] border-[1.5px] border-[#181614] bg-[#F1E7D3] p-12 sm:p-16 shadow-[4px_4px_0px_#181614] ${className}`}
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'var(--fiber), var(--grain)',
        }}
      >
        {/* Right-Bleed 19th-Century Engraving with Multiply Blend & Smooth Left Mask (z-index: 1) */}
        <div
          className={`pointer-events-none select-none absolute ${imagePositionClass} ${imageWidthClass} z-[1] overflow-hidden flex items-end justify-end`}
          style={{
            zIndex: 1,
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 18%, black 34%, black 100%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 18%, black 34%, black 100%)',
          }}
        >
          <img
            src={engravingSrc}
            alt={engravingAlt}
            loading="lazy"
            decoding="async"
            className={`${imageFitClass} mix-blend-multiply`}
            style={{
              opacity: imageOpacity,
              filter: 'contrast(1.12) sepia(0.14)',
              ...imageStyle,
            }}
          />
          {figLabel && (
            <span className="hidden sm:inline-block absolute bottom-1.5 right-2.5 px-1.5 py-0.5 bg-[#F1E7D3]/85 border border-[#493B2D]/60 font-mono text-[9px] font-bold uppercase tracking-widest text-[#51483D]">
              {figLabel}
            </span>
          )}
        </div>

        {/* Left Typography & Optional Right Action/Progress Slot (z-index: 2) */}
        <div
          className={`relative z-[2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            (rightSlot && rightSlotAbsolute) || timerPageId ? 'pr-28 sm:pr-36' : ''
          }`}
          style={{ zIndex: 2 }}
        >
          <div className="max-w-2xl">{children}</div>
          {rightSlot && !rightSlotAbsolute && (
            <div className="shrink-0 self-start sm:self-center">
              {rightSlot}
            </div>
          )}
        </div>

        {/* Optional Strictly Local Top-Right Corner Mounted Slot inside .hero-banner-container */}
        {rightSlot && rightSlotAbsolute && (
          <div
            className="compact-timer-badge absolute top-[16px] right-[24px] z-[5] shrink-0"
            style={{
              position: 'absolute',
              top: '16px',
              right: '24px',
              zIndex: 5,
            }}
          >
            {rightSlot}
          </div>
        )}
      </div>

      {/* Independent Full-Page-Draggable Timer anchored at top-right of Hero Banner (x:0, y:0) */}
      {timerPageId && (
        <BoundedBannerTimer
          key={timerPageId}
          pageId={timerPageId}
          containerRef={bannerRef}
        />
      )}
    </div>
  );
};

/**
 * ARCHETYPE B: "The Archival FIG. Plate" (Museum Etching Mount)
 */
export interface ArchivalFigPlateProps {
  src: string;
  alt: string;
  figNumber: string;
  caption: string;
  className?: string;
  aspectClass?: string;
}

export const ArchivalFigPlate: React.FC<ArchivalFigPlateProps> = ({
  src,
  alt,
  figNumber,
  caption,
  className = '',
  aspectClass = 'aspect-[4/3]',
}) => {
  return (
    <figure
      className={`border-[1.5px] border-[#181614] p-2 bg-[#E9DCC2] shadow-[2px_2px_0px_#181614] ${className}`}
    >
      <div className={`w-full overflow-hidden border border-[#493B2D]/60 bg-[#F1E7D3] ${aspectClass}`}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover mix-blend-multiply"
          style={{ filter: 'contrast(1.12) sepia(0.15)' }}
        />
      </div>
      <figcaption className="pt-1.5 px-1 flex items-center justify-between gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#51483D]">
        <span className="text-[#991D27]">{figNumber}</span>
        <span className="truncate">{caption}</span>
      </figcaption>
    </figure>
  );
};
