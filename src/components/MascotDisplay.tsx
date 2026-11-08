import React from 'react';

export type MascotPose =
  | 'neon-hero'         // Hình 1 - Mèo Đỏ Editorial cầm sổ IELTS Vocabulary
  | 'welcome-heart'     // Dáng 1 - Ngồi ôm sổ IELTS, thả tim
  | 'active-jump'       // Dáng 2 - Nhảy lên hào hứng đeo balo
  | 'reading-stack'     // Dáng 3 - Đọc sách bên chồng sách 4 kỹ năng
  | 'correct-thumb'     // Dáng 4 - Nháy mắt, giơ ngón cái + Vương miện
  | 'sleeping-zzz'      // Dáng 5 - Nằm ngủ gật ZZZ
  | 'hug-heart'         // Dáng 6 - Ôm trái tim đỏ IELTS
  | 'teacher-bulb'      // Dáng 7 - Cầm que chỉ bảng + Bóng đèn ý tưởng
  | 'walking-backpack'  // Dáng 8 - Đeo balo bước đi, ngoái đầu cười
  | 'celebrate-stars'   // Dáng 9 - Giơ hai tay ăn mừng giữa pháo sao
  | 'peek-helper';      // Dáng 10 - Ló nửa người ra từ mép tường

interface MascotDisplayProps {
  pose: MascotPose;
  size?: number | string;
  className?: string;
  alt?: string;
  customSrc?: string;
  onClick?: () => void;
  withGlow?: boolean;
}

/**
 * Vintage Newspaper Halftone Cat Mascot Renderer
 * Renders crisp, authentic newspaper halftone & ink-line British Shorthair cat poses
 * matching the official MASTER English vintage print identity.
 */
export const MascotDisplay: React.FC<MascotDisplayProps> = ({
  pose,
  size = 64,
  className = '',
  alt = 'MASTER English Mascot',
  customSrc,
  onClick,
}) => {
  const dimensionStyle: React.CSSProperties =
    typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : {};

  if (customSrc) {
    return (
      <div
        style={dimensionStyle}
        className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
        onClick={onClick}
      >
        <img src={customSrc} alt={alt} className="w-full h-full object-contain" loading="lazy" />
      </div>
    );
  }

  const isWinking = pose === 'correct-thumb' || pose === 'welcome-heart' || pose === 'neon-hero';
  const isSleeping = pose === 'sleeping-zzz';
  const hasGradCap = pose === 'teacher-bulb' || pose === 'reading-stack';
  const hasHeadphones = pose === 'neon-hero' || pose === 'active-jump' || pose === 'celebrate-stars';

  return (
    <div
      style={dimensionStyle}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      onClick={onClick}
      title={alt}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <pattern id={`mascot-dots-${pose}`} width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.9" fill="#181614" fillOpacity="0.22" />
          </pattern>
        </defs>

        {/* Background vintage circular stamp halo */}
        <circle
          cx="60"
          cy="62"
          r="50"
          fill="#E9DCC2"
          stroke="#493B2D"
          strokeWidth="2.5"
        />
        <circle
          cx="60"
          cy="62"
          r="46"
          fill={`url(#mascot-dots-${pose})`}
          stroke="#C92532"
          strokeWidth="1.2"
          strokeDasharray="3 2"
        />

        {/* Headphone Arch if active */}
        {hasHeadphones && (
          <path
            d="M22 64C22 32 39 14 60 14C81 14 98 32 98 64"
            stroke="#181614"
            strokeWidth="6"
            strokeLinecap="round"
          />
        )}

        {/* Cat Ears */}
        <path
          d="M28 48L22 18L48 32Z"
          fill="#DCC9A8"
          stroke="#181614"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M31 43L27 25L43 34Z" fill="#C92532" />
        <path
          d="M92 48L98 18L72 32Z"
          fill="#DCC9A8"
          stroke="#181614"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M89 43L93 25L77 34Z" fill="#C92532" />

        {/* Academic Cap if scholar pose */}
        {hasGradCap && (
          <g>
            <polygon points="60,8 92,18 60,28 28,18" fill="#181614" stroke="#F1E7D3" strokeWidth="1.5" />
            <path d="M60 18L84 24V38" stroke="#C92532" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {/* Cat Head */}
        <ellipse
          cx="60"
          cy="64"
          rx="36"
          ry="31"
          fill="#F1E7D3"
          stroke="#181614"
          strokeWidth="3.8"
        />
        <ellipse cx="60" cy="64" rx="34" ry="29" fill={`url(#mascot-dots-${pose})`} />

        {/* Forehead Tabby Stripes */}
        <path d="M60 35V46" stroke="#181614" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M52 37L54 45" stroke="#181614" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M68 37L66 45" stroke="#181614" strokeWidth="2.8" strokeLinecap="round" />

        {/* Headphone Cups */}
        {hasHeadphones && (
          <g>
            <ellipse cx="21" cy="65" rx="8" ry="14" fill="#C92532" stroke="#181614" strokeWidth="3" />
            <ellipse cx="99" cy="65" rx="8" ry="14" fill="#C92532" stroke="#181614" strokeWidth="3" />
          </g>
        )}

        {/* Eyes */}
        {isSleeping ? (
          <g stroke="#181614" strokeWidth="3" strokeLinecap="round">
            <path d="M38 62C42 67 48 67 52 62" />
            <path d="M68 62C72 67 78 67 82 62" />
          </g>
        ) : (
          <g>
            <circle cx="45" cy="62" r="7.5" fill="#181614" />
            <circle cx="43" cy="59.5" r="2.5" fill="#F1E7D3" />
            {isWinking ? (
              <path
                d="M68 62C71 56 79 56 82 62"
                stroke="#181614"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            ) : (
              <>
                <circle cx="75" cy="62" r="7.5" fill="#181614" />
                <circle cx="73" cy="59.5" r="2.5" fill="#F1E7D3" />
              </>
            )}
          </g>
        )}

        {/* Vintage Round Glasses */}
        <circle cx="45" cy="62" r="12" stroke="#181614" strokeWidth="2.6" fill="none" />
        <circle cx="75" cy="62" r="12" stroke="#181614" strokeWidth="2.6" fill="none" />
        <line x1="57" y1="62" x2="63" y2="62" stroke="#181614" strokeWidth="2.6" />

        {/* Nose & Mouth */}
        <polygon points="57,71 63,71 60,75" fill="#C92532" />
        <path
          d="M53 77C55 81 58 81 60 77C62 81 65 81 67 77"
          stroke="#181614"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Bottom Book / Heart Badge */}
        <rect
          x="36"
          y="89"
          width="48"
          height="18"
          rx="3"
          fill="#C92532"
          stroke="#181614"
          strokeWidth="2.8"
        />
        <text
          x="60"
          y="101"
          textAnchor="middle"
          fill="#F1E7D3"
          fontFamily="'Oswald', sans-serif"
          fontSize="9.5"
          fontWeight="700"
          letterSpacing="0.06em"
        >
          MASTER
        </text>
      </svg>
    </div>
  );
};
