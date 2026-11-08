import React from 'react';

/**
 * Authentic Vintage Newspaper Halftone & Printmaker Engraving Illustrations
 * Designed using the official MASTER English palette:
 * - Paper: #E9DCC2, #F1E7D3, #DCC9A8, #C9B38E
 * - Ink: #181614, #51483D, #796B59, #493B2D
 * - Editorial Red: #C92532, #991D27, #E8B7AC
 */

export const VintageCatHeadphonesBanner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 360 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
    aria-hidden="true"
  >
    <defs>
      <pattern id="halftone-cat-dots" width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="2.5" cy="2.5" r="1.25" fill="#181614" fillOpacity="0.28" />
      </pattern>
      <pattern id="halftone-red-dots" width="6" height="6" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r="1.6" fill="#C92532" fillOpacity="0.45" />
      </pattern>
    </defs>

    {/* Torn red & ink newspaper collage backdrop behind cat */}
    <path
      d="M175 18L225 4L338 12L355 185L125 212L148 92L175 18Z"
      fill="#181614"
      fillOpacity="0.92"
    />
    <path
      d="M205 12L346 24L332 198L192 205L205 12Z"
      fill="#C92532"
    />
    <path
      d="M210 15L342 28L328 195L196 202L210 15Z"
      fill="url(#halftone-cat-dots)"
    />

    {/* Red comic/editorial burst marks on left */}
    <path d="M55 68L86 84L80 94L48 78Z" fill="#C92532" />
    <path d="M68 42L96 68L88 76L60 50Z" fill="#C92532" />

    {/* Headphone Arch */}
    <path
      d="M108 128C108 58 152 16 210 16C268 16 312 58 312 128"
      stroke="#181614"
      strokeWidth="14"
      strokeLinecap="round"
    />
    <path
      d="M112 124C112 62 154 22 210 22C266 22 308 62 308 124"
      stroke="#F1E7D3"
      strokeWidth="5"
      strokeLinecap="round"
    />

    {/* Cat Ears */}
    <path
      d="M128 88L116 22L174 52Z"
      fill="#DCC9A8"
      stroke="#181614"
      strokeWidth="5"
      strokeLinejoin="round"
    />
    <path d="M132 78L125 36L164 55Z" fill="#51483D" />
    <path
      d="M292 88L304 22L246 52Z"
      fill="#DCC9A8"
      stroke="#181614"
      strokeWidth="5"
      strokeLinejoin="round"
    />
    <path d="M288 78L295 36L256 55Z" fill="#51483D" />

    {/* Cat Head Base */}
    <ellipse
      cx="210"
      cy="126"
      rx="88"
      ry="74"
      fill="#F1E7D3"
      stroke="#181614"
      strokeWidth="5.5"
    />
    {/* Halftone fur patches */}
    <path
      d="M126 105C134 65 168 52 210 52C252 52 286 65 294 105C275 86 245 78 210 78C175 78 145 86 126 105Z"
      fill="#51483D"
    />
    <ellipse cx="210" cy="126" rx="84" ry="70" fill="url(#halftone-cat-dots)" />

    {/* Tabby forehead stripes */}
    <path d="M210 54V82" stroke="#181614" strokeWidth="6" strokeLinecap="round" />
    <path d="M192 58L196 80" stroke="#181614" strokeWidth="5" strokeLinecap="round" />
    <path d="M228 58L224 80" stroke="#181614" strokeWidth="5" strokeLinecap="round" />

    {/* Headphone Ear Cups */}
    <g>
      <ellipse cx="108" cy="132" rx="22" ry="34" fill="#F1E7D3" stroke="#181614" strokeWidth="5" />
      <ellipse cx="104" cy="132" rx="12" ry="24" fill="#181614" />
      <ellipse cx="102" cy="132" rx="6" ry="14" fill="#C92532" />

      <ellipse cx="312" cy="132" rx="22" ry="34" fill="#F1E7D3" stroke="#181614" strokeWidth="5" />
      <ellipse cx="316" cy="132" rx="12" ry="24" fill="#181614" />
      <ellipse cx="318" cy="132" rx="6" ry="14" fill="#C92532" />
    </g>

    {/* Left Eye (Open, glossy vintage ink) */}
    <circle cx="172" cy="122" r="18" fill="#181614" />
    <circle cx="166" cy="116" r="6" fill="#F1E7D3" />
    <circle cx="178" cy="128" r="3" fill="#F1E7D3" />

    {/* Right Eye (Playful Wink) */}
    <path
      d="M230 124C238 110 258 110 266 124"
      stroke="#181614"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <path d="M262 118L272 112" stroke="#181614" strokeWidth="4" strokeLinecap="round" />

    {/* Vintage Round Spectacles */}
    <circle cx="172" cy="122" r="28" stroke="#181614" strokeWidth="4.5" fill="none" />
    <circle cx="248" cy="122" r="28" stroke="#181614" strokeWidth="4.5" fill="none" />
    <path d="M200 122H220" stroke="#181614" strokeWidth="4.5" />
    <path d="M144 118L122 112" stroke="#181614" strokeWidth="4" />
    <path d="M276 118L298 112" stroke="#181614" strokeWidth="4" />

    {/* Cute Nose & Whiskers & Smile */}
    <path d="M203 142L217 142L210 150Z" fill="#C92532" stroke="#181614" strokeWidth="2.5" />
    <path
      d="M194 155C199 162 207 162 210 154C213 162 221 162 226 155"
      stroke="#181614"
      strokeWidth="4"
      strokeLinecap="round"
    />
    {/* Whiskers */}
    <path d="M118 142L152 146" stroke="#181614" strokeWidth="3" strokeLinecap="round" />
    <path d="M116 154L152 154" stroke="#181614" strokeWidth="3" strokeLinecap="round" />
    <path d="M302 142L268 146" stroke="#181614" strokeWidth="3" strokeLinecap="round" />
    <path d="M304 154L268 154" stroke="#181614" strokeWidth="3" strokeLinecap="round" />

    {/* Paws resting on bottom newspaper rule */}
    <ellipse cx="155" cy="196" rx="24" ry="15" fill="#F1E7D3" stroke="#181614" strokeWidth="4.5" />
    <path d="M148 190V204M156 189V205M164 190V204" stroke="#181614" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="265" cy="196" rx="24" ry="15" fill="#F1E7D3" stroke="#181614" strokeWidth="4.5" />
    <path d="M258 190V204M266 189V205M274 190V204" stroke="#181614" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const VintageBigBenKeepGoingBanner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 520 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
    aria-hidden="true"
  >
    <defs>
      <pattern id="ben-halftone" width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="2.5" cy="2.5" r="1.2" fill="#181614" fillOpacity="0.26" />
      </pattern>
    </defs>

    {/* Crimson Red Grunge Brush Splash */}
    <path
      d="M90 198L165 72L285 26L508 8L516 212L90 198Z"
      fill="#C92532"
    />
    <path
      d="M120 195L190 82L310 34L505 14L512 208L120 195Z"
      fill="url(#ben-halftone)"
    />
    {/* Torn Paper White/Cream Edge */}
    <path
      d="M84 202L158 76L278 28L310 18L295 34L172 86L104 204Z"
      fill="#F1E7D3"
      opacity="0.85"
    />

    {/* Westminster Parliament Gothic Silhouettes (Left of Big Ben) */}
    <g fill="#F1E7D3" stroke="#181614" strokeWidth="2.5">
      <rect x="135" y="148" width="78" height="65" fill="#DCC9A8" />
      <path d="M142 148L148 118L154 148Z" fill="#181614" />
      <path d="M164 148L170 112L176 148Z" fill="#181614" />
      <path d="M186 148L192 120L198 148Z" fill="#181614" />
      {/* Gothic Windows */}
      <line x1="148" y1="158" x2="148" y2="204" stroke="#181614" strokeWidth="3" />
      <line x1="160" y1="158" x2="160" y2="204" stroke="#181614" strokeWidth="3" />
      <line x1="172" y1="158" x2="172" y2="204" stroke="#181614" strokeWidth="3" />
      <line x1="184" y1="158" x2="184" y2="204" stroke="#181614" strokeWidth="3" />
      <line x1="196" y1="158" x2="196" y2="204" stroke="#181614" strokeWidth="3" />
    </g>

    {/* Big Ben Elizabeth Tower Engraving */}
    <g transform="translate(210, 6)">
      {/* Spire */}
      <path d="M38 2L22 46H54L38 2Z" fill="#181614" />
      <path d="M38 12L27 44H49L38 12Z" fill="#DCC9A8" stroke="#181614" strokeWidth="2" />
      {/* Belfry */}
      <rect x="18" y="46" width="40" height="22" fill="#F1E7D3" stroke="#181614" strokeWidth="2.5" />
      <path d="M24 50V64M31 50V64M38 50V64M45 50V64M52 50V64" stroke="#181614" strokeWidth="2" />
      {/* Clock Stage */}
      <rect x="12" y="68" width="52" height="48" fill="#F1E7D3" stroke="#181614" strokeWidth="3" />
      <circle cx="38" cy="92" r="17" fill="#FFFFFF" stroke="#181614" strokeWidth="3" />
      <circle cx="38" cy="92" r="13" stroke="#181614" strokeWidth="1.2" strokeDasharray="2 2" />
      <path d="M38 92V81M38 92L46 96" stroke="#181614" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tower Shaft with Engraving Flutes */}
      <rect x="15" y="116" width="46" height="94" fill="#DCC9A8" stroke="#181614" strokeWidth="3" />
      <path d="M23 122V206M30 122V206M38 122V206M46 122V206M53 122V206" stroke="#181614" strokeWidth="1.8" />
      <line x1="15" y1="146" x2="61" y2="146" stroke="#181614" strokeWidth="3" />
      <line x1="15" y1="176" x2="61" y2="176" stroke="#181614" strokeWidth="3" />
    </g>

    {/* Hand-lettered "Keep Going." Brush Script */}
    <text
      x="325"
      y="70"
      fill="#F1E7D3"
      fontFamily="'Caveat', 'Playfair Display', cursive, serif"
      fontSize="44"
      fontWeight="700"
      fontStyle="italic"
      transform="rotate(-8 325 70)"
    >
      Keep
    </text>
    <text
      x="315"
      y="112"
      fill="#F1E7D3"
      fontFamily="'Caveat', 'Playfair Display', cursive, serif"
      fontSize="44"
      fontWeight="700"
      fontStyle="italic"
      transform="rotate(-8 315 112)"
    >
      Going.
    </text>

    {/* Winking Headphones Cat on Right */}
    <g transform="translate(310, 62) scale(0.68)">
      <path
        d="M88 130C88 64 130 24 185 24C240 24 282 64 282 130"
        stroke="#181614"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path d="M108 92L98 30L150 58Z" fill="#DCC9A8" stroke="#181614" strokeWidth="5" />
      <path d="M262 92L272 30L220 58Z" fill="#DCC9A8" stroke="#181614" strokeWidth="5" />
      <ellipse cx="185" cy="132" rx="82" ry="68" fill="#F1E7D3" stroke="#181614" strokeWidth="5.5" />
      <ellipse cx="185" cy="132" rx="78" ry="64" fill="url(#ben-halftone)" />
      {/* Headphones */}
      <ellipse cx="88" cy="135" rx="20" ry="30" fill="#F1E7D3" stroke="#181614" strokeWidth="5" />
      <ellipse cx="85" cy="135" rx="10" ry="20" fill="#181614" />
      <ellipse cx="282" cy="135" rx="20" ry="30" fill="#F1E7D3" stroke="#181614" strokeWidth="5" />
      <ellipse cx="285" cy="135" rx="10" ry="20" fill="#181614" />
      {/* Eyes & Glasses */}
      <circle cx="150" cy="128" r="16" fill="#181614" />
      <circle cx="145" cy="122" r="5" fill="#F1E7D3" />
      <path d="M204 130C212 116 230 116 238 130" stroke="#181614" strokeWidth="6" strokeLinecap="round" />
      <circle cx="150" cy="128" r="26" stroke="#181614" strokeWidth="4.5" fill="none" />
      <circle cx="220" cy="128" r="26" stroke="#181614" strokeWidth="4.5" fill="none" />
      <path d="M176 128H194" stroke="#181614" strokeWidth="4.5" />
      {/* Nose & Smile */}
      <path d="M179 148L191 148L185 155Z" fill="#C92532" />
      <path d="M170 160C175 167 182 167 185 160C188 167 195 167 200 160" stroke="#181614" strokeWidth="4" strokeLinecap="round" />
      {/* Paws */}
      <ellipse cx="136" cy="198" rx="22" ry="13" fill="#F1E7D3" stroke="#181614" strokeWidth="4.5" />
      <ellipse cx="234" cy="198" rx="22" ry="13" fill="#F1E7D3" stroke="#181614" strokeWidth="4.5" />
    </g>
  </svg>
);

export const VintageCatLaptopHeroIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 640 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
    aria-hidden="true"
  >
    <defs>
      <pattern id="hero-halftone" width="6" height="6" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r="1.4" fill="#181614" fillOpacity="0.24" />
      </pattern>
      <pattern id="hero-red-dots" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="2" fill="#C92532" fillOpacity="0.35" />
      </pattern>
    </defs>

    {/* Background Halftone Circle & Newspaper Clippings */}
    <circle cx="350" cy="240" r="195" fill="#DCC9A8" stroke="#493B2D" strokeWidth="2" strokeDasharray="6 4" />
    <circle cx="350" cy="240" r="185" fill="url(#hero-halftone)" />

    {/* Red Offset Graphic Frame */}
    <rect x="440" y="52" width="140" height="90" rx="4" fill="#C92532" stroke="#181614" strokeWidth="3" transform="rotate(6 440 52)" />
    <text x="458" y="92" fill="#F1E7D3" fontFamily="'Anton', sans-serif" fontSize="22" transform="rotate(6 458 92)">IELTS 8.5+</text>
    <text x="455" y="116" fill="#F1E7D3" fontFamily="'Playfair Display', serif" fontStyle="italic" fontSize="14" transform="rotate(6 455 116)">Academic Edition</text>

    {/* Stack of Antique Books on Left */}
    <g transform="translate(56, 305)">
      <rect x="0" y="56" width="135" height="28" rx="3" fill="#51483D" stroke="#181614" strokeWidth="3.5" />
      <rect x="6" y="61" width="122" height="18" fill="#F1E7D3" stroke="#181614" strokeWidth="2" />
      <rect x="10" y="28" width="120" height="28" rx="3" fill="#C92532" stroke="#181614" strokeWidth="3.5" />
      <rect x="16" y="33" width="108" height="18" fill="#E9DCC2" stroke="#181614" strokeWidth="2" />
      <rect x="18" y="0" width="106" height="28" rx="3" fill="#181614" stroke="#181614" strokeWidth="3.5" />
      <text x="34" y="19" fill="#F1E7D3" fontFamily="'Oswald', sans-serif" fontSize="12" fontWeight="700">OXFORD DICTIONARY</text>
    </g>

    {/* Scholarly British Shorthair Cat */}
    <g transform="translate(215, 65)">
      {/* Ears */}
      <path d="M55 95L38 18L108 55Z" fill="#DCC9A8" stroke="#181614" strokeWidth="5.5" strokeLinejoin="round" />
      <path d="M62 84L50 35L96 58Z" fill="#51483D" />
      <path d="M245 95L262 18L192 55Z" fill="#DCC9A8" stroke="#181614" strokeWidth="5.5" strokeLinejoin="round" />
      <path d="M238 84L250 35L204 58Z" fill="#51483D" />

      {/* Body / Torso with Knit Vest */}
      <path d="M52 215C52 175 95 165 150 165C205 165 248 175 248 215L262 315H38L52 215Z" fill="#181614" stroke="#181614" strokeWidth="5" />
      {/* Collar & Red Tie */}
      <path d="M118 202L150 232L182 202" fill="#F1E7D3" stroke="#181614" strokeWidth="3.5" />
      <path d="M143 222L157 222L162 276L150 290L138 276Z" fill="#C92532" stroke="#181614" strokeWidth="3" />

      {/* Cat Head */}
      <ellipse cx="150" cy="130" rx="96" ry="80" fill="#F1E7D3" stroke="#181614" strokeWidth="5.5" />
      <ellipse cx="150" cy="130" rx="92" ry="76" fill="url(#hero-halftone)" />

      {/* Forehead Stripes */}
      <path d="M150 54V84" stroke="#181614" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M130 58L135 82" stroke="#181614" strokeWidth="5" strokeLinecap="round" />
      <path d="M170 58L165 82" stroke="#181614" strokeWidth="5" strokeLinecap="round" />

      {/* Focused Eyes */}
      <circle cx="108" cy="128" r="19" fill="#181614" />
      <circle cx="102" cy="121" r="6.5" fill="#F1E7D3" />
      <circle cx="114" cy="134" r="3.5" fill="#F1E7D3" />

      <circle cx="192" cy="128" r="19" fill="#181614" />
      <circle cx="186" cy="121" r="6.5" fill="#F1E7D3" />
      <circle cx="198" cy="134" r="3.5" fill="#F1E7D3" />

      {/* Round Editorial Glasses */}
      <circle cx="108" cy="128" r="31" stroke="#181614" strokeWidth="5" fill="none" />
      <circle cx="192" cy="128" r="31" stroke="#181614" strokeWidth="5" fill="none" />
      <path d="M139 128H161" stroke="#181614" strokeWidth="5" />
      <path d="M77 122L54 115" stroke="#181614" strokeWidth="4.5" />
      <path d="M223 122L246 115" stroke="#181614" strokeWidth="4.5" />

      {/* Nose & Determined Smile */}
      <path d="M142 150L158 150L150 159Z" fill="#C92532" stroke="#181614" strokeWidth="2.5" />
      <path d="M132 165C138 173 146 173 150 165C154 173 162 173 168 165" stroke="#181614" strokeWidth="4" strokeLinecap="round" />

      {/* Whiskers */}
      <path d="M40 146L78 150M38 160L78 160" stroke="#181614" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M260 146L222 150M262 160L222 160" stroke="#181614" strokeWidth="3.5" strokeLinecap="round" />
    </g>

    {/* Vintage Laptop in Front of Cat */}
    <g transform="translate(175, 255)">
      {/* Laptop Screen Back */}
      <rect x="28" y="0" width="224" height="132" rx="8" fill="#DCC9A8" stroke="#181614" strokeWidth="5.5" />
      <rect x="36" y="8" width="208" height="116" rx="4" fill="#F1E7D3" stroke="#181614" strokeWidth="2.5" />
      {/* Red M Emblem on Laptop Lid */}
      <rect x="118" y="44" width="44" height="44" rx="5" fill="#C92532" stroke="#181614" strokeWidth="3.5" />
      <text x="128" y="76" fill="#F1E7D3" fontFamily="'Playfair Display', serif" fontWeight="900" fontSize="28">M</text>
      {/* Laptop Base */}
      <path d="M8 132H272L292 148H-12L8 132Z" fill="#181614" stroke="#181614" strokeWidth="4" strokeLinejoin="round" />
    </g>

    {/* Steaming Crimson Red Coffee Mug on Right */}
    <g transform="translate(476, 305)">
      {/* Steam wisps */}
      <path d="M28 -8C22 -22 36 -30 30 -44" stroke="#51483D" strokeWidth="3" strokeLinecap="round" />
      <path d="M48 -4C42 -18 56 -26 50 -40" stroke="#51483D" strokeWidth="3" strokeLinecap="round" />
      {/* Handle */}
      <path d="M72 22H88C96 22 96 62 88 62H72" stroke="#181614" strokeWidth="5.5" fill="none" />
      <path d="M72 26H85C91 26 91 58 85 58H72" stroke="#C92532" strokeWidth="3.5" fill="none" />
      {/* Mug Body */}
      <rect x="8" y="8" width="66" height="76" rx="6" fill="#C92532" stroke="#181614" strokeWidth="4.5" />
      <ellipse cx="41" cy="8" rx="33" ry="7" fill="#F1E7D3" stroke="#181614" strokeWidth="4" />
      <rect x="20" y="28" width="42" height="32" rx="2" fill="#F1E7D3" stroke="#181614" strokeWidth="2.5" />
      <text x="27" y="49" fill="#181614" fontFamily="'Anton', sans-serif" fontSize="14">IELTS</text>
    </g>

    {/* Wooden Editorial Desk Surface Rule */}
    <line x1="24" y1="406" x2="616" y2="406" stroke="#181614" strokeWidth="6" strokeLinecap="round" />
    <line x1="48" y1="416" x2="592" y2="416" stroke="#493B2D" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const VintageScholarCatIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 220 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
    aria-hidden="true"
  >
    <defs>
      <pattern id="scholar-dots" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#181614" fillOpacity="0.25" />
      </pattern>
    </defs>

    {/* Classical Columns / Library Backdrop */}
    <rect x="18" y="24" width="16" height="145" fill="#DCC9A8" stroke="#493B2D" strokeWidth="2" />
    <line x1="23" y1="28" x2="23" y2="165" stroke="#493B2D" strokeWidth="1.2" />
    <line x1="29" y1="28" x2="29" y2="165" stroke="#493B2D" strokeWidth="1.2" />

    {/* Cat Ears */}
    <path d="M62 72L52 28L92 50Z" fill="#DCC9A8" stroke="#181614" strokeWidth="4" />
    <path d="M158 72L168 28L128 50Z" fill="#DCC9A8" stroke="#181614" strokeWidth="4" />

    {/* Academic Mortarboard Graduation Cap */}
    <polygon points="110,8 176,28 110,48 44,28" fill="#181614" stroke="#181614" strokeWidth="3" />
    <path d="M78 39V56C78 62 142 62 142 56V39" fill="#181614" stroke="#F1E7D3" strokeWidth="1.5" />
    {/* Red Tassel */}
    <path d="M110 28L158 38V68" stroke="#C92532" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="158" cy="70" r="4" fill="#C92532" />

    {/* Cat Head */}
    <ellipse cx="110" cy="98" rx="54" ry="45" fill="#F1E7D3" stroke="#181614" strokeWidth="4" />
    <ellipse cx="110" cy="98" rx="51" ry="42" fill="url(#scholar-dots)" />

    {/* Spectacles & Eyes */}
    <circle cx="88" cy="95" r="11" fill="#181614" />
    <circle cx="85" cy="91" r="3.5" fill="#F1E7D3" />
    <circle cx="132" cy="95" r="11" fill="#181614" />
    <circle cx="129" cy="91" r="3.5" fill="#F1E7D3" />
    <circle cx="88" cy="95" r="18" stroke="#181614" strokeWidth="3.5" fill="none" />
    <circle cx="132" cy="95" r="18" stroke="#181614" strokeWidth="3.5" fill="none" />
    <line x1="106" y1="95" x2="114" y2="95" stroke="#181614" strokeWidth="3.5" />

    {/* Nose & Smile */}
    <polygon points="106,108 114,108 110,114" fill="#C92532" />
    <path d="M100 118C104 123 116 123 120 118" stroke="#181614" strokeWidth="3" strokeLinecap="round" />

    {/* Open Hardcover Book in Front */}
    <path d="M46 146L110 158L174 146V186L110 196L46 186V146Z" fill="#C92532" stroke="#181614" strokeWidth="3.5" />
    <path d="M52 140L110 153L168 140V180L110 190L52 180V140Z" fill="#F1E7D3" stroke="#181614" strokeWidth="3" />
    <line x1="110" y1="153" x2="110" y2="190" stroke="#181614" strokeWidth="3" />
    {/* Paws holding book */}
    <ellipse cx="64" cy="162" rx="12" ry="9" fill="#F1E7D3" stroke="#181614" strokeWidth="3" />
    <ellipse cx="156" cy="162" rx="12" ry="9" fill="#F1E7D3" stroke="#181614" strokeWidth="3" />
  </svg>
);

export const VintageSidebarBottomCollage: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 240 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
    aria-hidden="true"
  >
    <defs>
      <pattern id="sidebar-halftone" width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="2.5" cy="2.5" r="1.2" fill="#181614" fillOpacity="0.28" />
      </pattern>
    </defs>

    {/* Torn Aged Paper Background */}
    <path
      d="M0 24L42 12L95 28L152 8L204 22L240 6V240H0V24Z"
      fill="#E9DCC2"
    />
    <path
      d="M0 28L42 16L95 32L152 12L204 26L240 10V240H0V28Z"
      fill="url(#sidebar-halftone)"
    />

    {/* Red Ink Splatter Accent */}
    <path d="M58 88L165 130L140 238H12L58 88Z" fill="#C92532" opacity="0.9" />

    {/* Big Ben Engraving on Right */}
    <g transform="translate(132, 16)">
      <path d="M36 0L22 40H50L36 0Z" fill="#181614" />
      <rect x="18" y="40" width="36" height="18" fill="#F1E7D3" stroke="#181614" strokeWidth="2.5" />
      <rect x="12" y="58" width="48" height="44" fill="#F1E7D3" stroke="#181614" strokeWidth="2.5" />
      <circle cx="36" cy="80" r="14" fill="#FFFFFF" stroke="#181614" strokeWidth="2.5" />
      <path d="M36 80V71M36 80L43 84" stroke="#181614" strokeWidth="2" strokeLinecap="round" />
      <rect x="15" y="102" width="42" height="120" fill="#DCC9A8" stroke="#181614" strokeWidth="2.5" />
      <path d="M23 106V218M31 106V218M40 106V218M48 106V218" stroke="#181614" strokeWidth="1.6" />
    </g>

    {/* Westminster Towers on Left */}
    <g transform="translate(8, 52)">
      <rect x="4" y="42" width="64" height="80" fill="#DCC9A8" stroke="#181614" strokeWidth="2" />
      <path d="M12 42L18 18L24 42Z" fill="#181614" />
      <path d="M44 42L50 14L56 42Z" fill="#181614" />
      <path d="M14 48V116M26 48V116M38 48V116M50 48V116" stroke="#181614" strokeWidth="2" />
    </g>

    {/* Torn Paper Note Card at Bottom Left with "Better Me Everyday!" */}
    <path
      d="M0 126L118 110L138 198L0 228V126Z"
      fill="#F1E7D3"
      stroke="#181614"
      strokeWidth="2.5"
    />
    <text
      x="14"
      y="152"
      fill="#181614"
      fontFamily="'Caveat', 'Playfair Display', cursive, serif"
      fontSize="24"
      fontWeight="700"
      fontStyle="italic"
      transform="rotate(-6 14 152)"
    >
      Better
    </text>
    <text
      x="22"
      y="174"
      fill="#181614"
      fontFamily="'Caveat', 'Playfair Display', cursive, serif"
      fontSize="24"
      fontWeight="700"
      fontStyle="italic"
      transform="rotate(-6 22 174)"
    >
      Me
    </text>
    <text
      x="10"
      y="196"
      fill="#181614"
      fontFamily="'Caveat', 'Playfair Display', cursive, serif"
      fontSize="23"
      fontWeight="700"
      fontStyle="italic"
      transform="rotate(-6 10 196)"
    >
      Everyday!
    </text>
    {/* Red Z-stroke underline */}
    <path
      d="M22 206L84 198L46 212L96 205"
      stroke="#C92532"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const VintageTowerBridgeEngraving: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 220 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
    aria-hidden="true"
  >
    {/* Vintage Engraving of Tower Bridge & Books */}
    <g stroke="#181614" strokeWidth="2">
      {/* Left Tower */}
      <path d="M46 42L34 12H58L46 42Z" fill="#51483D" />
      <rect x="32" y="42" width="28" height="96" fill="#DCC9A8" />
      <line x1="39" y1="48" x2="39" y2="120" />
      <line x1="53" y1="48" x2="53" y2="120" />
      {/* Right Tower */}
      <path d="M154 42L142 12H166L154 42Z" fill="#51483D" />
      <rect x="140" y="42" width="28" height="96" fill="#DCC9A8" />
      <line x1="147" y1="48" x2="147" y2="120" />
      <line x1="161" y1="48" x2="161" y2="120" />
      {/* High Walkways */}
      <line x1="60" y1="56" x2="140" y2="56" strokeWidth="3.5" />
      <line x1="60" y1="64" x2="140" y2="64" strokeWidth="2" />
      {/* Suspension Cables */}
      <path d="M4 118Q20 96 32 72" fill="none" strokeWidth="2.5" />
      <path d="M168 72Q184 96 208 118" fill="none" strokeWidth="2.5" />
      {/* Bascule Roadway */}
      <line x1="4" y1="122" x2="208" y2="122" strokeWidth="4" />
      {/* Piers */}
      <rect x="26" y="138" width="40" height="24" fill="#796B59" />
      <rect x="134" y="138" width="40" height="24" fill="#79A8" />
    </g>
    {/* Stacked Vintage Books in Foreground */}
    <g transform="translate(88, 134)">
      <rect x="0" y="36" width="116" height="18" rx="2" fill="#C92532" stroke="#181614" strokeWidth="2.5" />
      <rect x="8" y="18" width="102" height="18" rx="2" fill="#F1E7D3" stroke="#181614" strokeWidth="2.5" />
      <rect x="16" y="0" width="88" height="18" rx="2" fill="#51483D" stroke="#181614" strokeWidth="2.5" />
    </g>
  </svg>
);

export const VintageInkwellQuillEngraving: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
    aria-hidden="true"
  >
    {/* Feather Quill */}
    <path
      d="M48 76C58 44 82 18 106 8C98 32 82 56 54 78Z"
      fill="#DCC9A8"
      stroke="#181614"
      strokeWidth="2.5"
    />
    <path d="M42 86L104 10" stroke="#181614" strokeWidth="2.5" strokeLinecap="round" />
    {/* Glass & Brass Inkwell */}
    <rect x="28" y="66" width="28" height="10" rx="2" fill="#796B59" stroke="#181614" strokeWidth="2.5" />
    <path d="M20 76H64L70 108H14L20 76Z" fill="#181614" stroke="#181614" strokeWidth="2.5" />
    <rect x="26" y="84" width="32" height="16" fill="#F1E7D3" stroke="#181614" strokeWidth="1.5" />
    <text x="31" y="96" fill="#181614" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="10">INK</text>
  </svg>
);

/**
 * Centralized Asset Registry for the Consolidated 2K Vintage Editorial Illustrations
 * Located in /public/assets/vintage-editorial/{hero,editorial,architecture,mascot}/
 */
export const VINTAGE_EDITORIAL_ASSETS = {
  hero: {
    catLaptop: '/Cat_typing_on_laptop_cbc58ca4_2K.jpg_7d13e2fe_2K.jpg',
    catLaptopEditorial: '/assets/vintage-editorial/hero/master-english-cat-laptop.jpg',
  },
  editorial: {
    quillCatDesk: '/assets/engravings/media_1793811814509_8e1a0a56.jpg',
  },
  architecture: {
    bigBen: '/assets/engravings/media_1793811851379_f0af845e.jpg',
    towerBridgeLondon: '/assets/engravings/media_1793811857019_aa8b3c02.jpg',
    londonRedTelephoneBooth: '/assets/engravings/media_1793811756011_b1e728ae.jpg',
    fansipanMountainPagoda: '/assets/engravings/media_1793811753703_9c8a0c28.jpg',
    himalayaMonasteryPilgrimage: '/assets/engravings/media_1793811758027_1241b438.jpg',
    statueOfLiberty: '/assets/engravings/media_1793811759869_032b41e1.jpg',
    empireState: '/assets/engravings/media_1793811783266_536da3d9.jpg',
    eiffelTower: '/assets/engravings/media_1793811854733_ff0469e4.jpg',
    christRedeemer: '/assets/engravings/media_1793811779491_5535d5a2.jpg',
    tokyoTower: '/assets/engravings/tokyo-tower.jpg',
    pyramidsGiza: '/assets/engravings/pyramids-giza.jpg',
    tajMahal: '/assets/engravings/taj-mahal.jpg',
    colosseum: '/assets/engravings/colosseum.jpg',
    sydneyOperaHouse: '/assets/engravings/media_1793811786405_92512a1a.jpg',
    japaneseCoveredBridge: '/assets/engravings/media_1793811785155_7bd64c72.jpg',
    onePillarPagoda: '/assets/engravings/Saigon_Notre-Dame_Cathedral_etch…_a3ab8b71_2K.jpg',
    saigonNotreDame: '/assets/engravings/media_1793811853284_46df672f.jpg',
    khueVanCac: '/assets/engravings/media_1793811781405_06f70de0.jpg',
  },
  mascot: {
    compass: '/assets/engravings/media_1793811820951_bf81ab82.jpg',
    oilLamp: '/assets/engravings/media_1793811817772_fbaf0cee.jpg',
    dictionaryArmchair: '/assets/engravings/media_1793811819338_c2158141.jpg',
    nearBooks: '/assets/engravings/media_1793811822599_e91b8190.jpg',
    graduationCap: '/assets/engravings/media_1793811812608_a204e6ab.jpg',
    scholarReadingDesk: '/assets/engravings/media_1793811812608_a204e6ab.jpg',
    redHourglass: '/assets/engravings/media_1793811816204_28d89c59.jpg',
    glassesBook: '/assets/engravings/media_1793811812608_a204e6ab.jpg',
    scroll: '/assets/engravings/media_1793811814509_8e1a0a56.jpg',
    sleepingBook: '/assets/engravings/media_1793811817772_fbaf0cee.jpg',
    butterflyMagnifier: '/assets/engravings/media_1793811820951_bf81ab82.jpg',
    library: '/assets/engravings/media_1793811820951_bf81ab82.jpg',
    telescope: '/assets/engravings/media_1793811820951_bf81ab82.jpg',
    catTelescope: '/assets/engravings/media_1793811820951_bf81ab82.jpg',
    writingQuill: '/assets/engravings/media_1793811814509_8e1a0a56.jpg',
  },
  objects: {
    typewriter: '/assets/engravings/media_1793811814509_8e1a0a56.jpg',
    hourglass: '/assets/engravings/media_1793811816204_28d89c59.jpg',
  },
} as const;

export interface VintageAssetInventoryItem {
  id: string;
  originalSource: string;
  stablePath: string;
  actualVisualContent: string;
  category: 'mascot' | 'architecture' | 'pilgrimage' | 'object' | 'hero';
  mappedSection: string;
}

export const VINTAGE_ASSET_INVENTORY: VintageAssetInventoryItem[] = [
  {
    id: 'cat-graduation-cap',
    originalSource: 'public/assets/vintage-editorial/mascot/cat-graduation-cap.jpg',
    stablePath: VINTAGE_EDITORIAL_ASSETS.mascot.graduationCap,
    actualVisualContent: 'Scholar Cat wearing academic mortarboard cap & round spectacles reading an open English hardcover book',
    category: 'mascot',
    mappedSection: 'Trang Nhất Hero Foreground & Journalist Press Avatar',
  },
  {
    id: 'cat-scholar-reading-desk',
    originalSource: '.tempmediaStorage/media_1793720120163_314fee33.jpg',
    stablePath: VINTAGE_EDITORIAL_ASSETS.mascot.scholarReadingDesk,
    actualVisualContent: 'Scholar Cat wearing graduation cap & glasses reading an antique red book at study desk with lamp & globe',
    category: 'mascot',
    mappedSection: 'Trang Nhất — Tiêu Điểm Hôm Nay (Today’s Learning Foreground Vignette)',
  },
  {
    id: 'big-ben-westminster',
    originalSource: 'public/assets/vintage-editorial/architecture/big-ben.jpg',
    stablePath: VINTAGE_EDITORIAL_ASSETS.architecture.bigBen,
    actualVisualContent: 'Big Ben Elizabeth Tower & Westminster Bridge architectural etching with red double-decker bus',
    category: 'architecture',
    mappedSection: 'Trang Nhất Hero Skyline Layer & Báo Cáo Phát Hành Masthead Right',
  },
  {
    id: 'tower-bridge-london',
    originalSource: '.tempmediaStorage/Saigon_Notre-Dame_Cathedral_etch…_a3ab8b71_2K.jpg',
    stablePath: VINTAGE_EDITORIAL_ASSETS.architecture.towerBridgeLondon,
    actualVisualContent: 'Tower Bridge in London over River Thames with stacked antique red & leather books in foreground',
    category: 'architecture',
    mappedSection: 'Trang Nhất — Châm Ngôn Tòa Soạn ("Believe in yourself, and you will go further.")',
  },
  {
    id: 'london-red-telephone-booth',
    originalSource: '.tempmediaStorage/màu_đỏ_rực_hơn_đi_5f0d8a2e_2K.jpg',
    stablePath: VINTAGE_EDITORIAL_ASSETS.architecture.londonRedTelephoneBooth,
    actualVisualContent: 'Vivid Crimson Red British K6 Telephone Booth on Victorian London street with Big Ben skyline',
    category: 'object',
    mappedSection: 'Trang Nhất — Kỳ Xuất Bản (60 Số) Right Vignette',
  },
  {
    id: 'fansipan-mountain-pagoda',
    originalSource: '.tempmediaStorage/bốt điện thoại công cộng.jpg',
    stablePath: VINTAGE_EDITORIAL_ASSETS.architecture.fansipanMountainPagoda,
    actualVisualContent: 'Fansipan Mountain Peak & Traditional Pagoda above clouds with stone stairway & red sun',
    category: 'pilgrimage',
    mappedSection: 'Trang Nhất — Tiêu Điểm Hôm Nay & Dấu Ấn Bút Lực Atmospheric Watermark + Báo Cáo 30 Kỳ',
  },
  {
    id: 'himalaya-monastery-pilgrimage',
    originalSource: '.tempmediaStorage/,_dãy_núi_himalia_434c71a3_2K.jpg',
    stablePath: VINTAGE_EDITORIAL_ASSETS.architecture.himalayaMonasteryPilgrimage,
    actualVisualContent: 'Himalaya Mountain Range & Monastery Pilgrimage with pine trees and crimson sun',
    category: 'pilgrimage',
    mappedSection: 'Trang Nhất Hero Atmospheric Watermark & Báo Cáo Phát Hành (Ấn Chương & Toàn Bộ Lưu Trữ)',
  },
  {
    id: 'khue-van-cac',
    originalSource: 'public/assets/vintage-editorial/architecture/khue-van-cac.jpg',
    stablePath: VINTAGE_EDITORIAL_ASSETS.architecture.khueVanCac,
    actualVisualContent: 'Khuê Văn Các (Temple of Literature, Hanoi) woodcut etching with crimson sun & stone courtyard',
    category: 'pilgrimage',
    mappedSection: 'Trang Nhất — Chuyên Mục Trọng Điểm Atmospheric Watermark & Kho Chữ Tòa Soạn',
  },
  {
    id: 'cat-red-hourglass',
    originalSource: '.tempmediaStorage/media_1793720322626_c93c7be0.jpg',
    stablePath: VINTAGE_EDITORIAL_ASSETS.mascot.redHourglass,
    actualVisualContent: 'Scholar Cat holding a vintage brass hourglass filled with crimson red sand',
    category: 'mascot',
    mappedSection: 'Báo Cáo Phát Hành — Đồng Hồ Ca Trực & Tốc Độ Biên Tập',
  },
];

export interface VintageEngravingFrameProps {
  src: string;
  alt: string;
  caption?: string;
  figureCode?: string;
  className?: string;
  imgClassName?: string;
  aspectClass?: string;
  framed?: boolean;
  showFrameBorder?: boolean;
}

/**
 * Renders 2K vintage parchment illustrations seamlessly integrated into the newspaper surface
 * using `mix-blend-mode: multiply` and soft radial masking (`mask-radial-soft`) so illustrations
 * appear printed directly onto aged paper without harsh pasted rectangular boxes.
 */
export const VintageEngravingFrame: React.FC<VintageEngravingFrameProps> = ({
  src,
  alt,
  caption,
  figureCode,
  className = '',
  imgClassName = 'w-full h-full object-cover scale-[1.12] object-center vintage-print-seamless mask-radial-soft',
  aspectClass = '',
  framed = true,
  showFrameBorder = true,
}) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!framed || !showFrameBorder) {
    return (
      <div className={`relative select-none overflow-hidden ${aspectClass} ${className}`}>
        {hasError ? (
          <VintageInkwellQuillEngraving className="w-full h-full" />
        ) : (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setHasError(true)}
            className={`select-none pointer-events-none block vintage-print-seamless mask-radial-soft ${imgClassName}`}
          />
        )}
      </div>
    );
  }

  return (
    <figure
      className={`relative select-none overflow-hidden ${aspectClass} ${className}`}
    >
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {figureCode && (
          <span className="absolute top-1 left-1.5 z-10 font-mono text-[10px] font-bold uppercase tracking-widest text-[#181614] bg-[#F1E7D3]/90 px-1.5 py-0.5 border border-[#493B2D]/60">
            {figureCode}
          </span>
        )}
        {hasError ? (
          <VintageInkwellQuillEngraving className="w-full h-full max-h-24" />
        ) : (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setHasError(true)}
            className={`select-none pointer-events-none block ${imgClassName}`}
          />
        )}
      </div>
      {caption && (
        <figcaption className="px-2 py-1 border-t border-[#493B2D]/40 text-[11px] font-serif italic font-semibold text-[#2C2520] text-center leading-tight">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};



