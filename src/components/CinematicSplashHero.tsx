import React, { useState } from 'react';
import { BookOpen, Calendar, BarChart3, CheckCircle2 } from 'lucide-react';
import { VINTAGE_EDITORIAL_ASSETS } from './VintageNewspaperIllustrations';

interface CinematicSplashHeroProps {
  onEnterWorkspace: (mode?: any) => void;
  onOpenAnalytics?: () => void;
}

export const CinematicSplashHero: React.FC<CinematicSplashHeroProps> = ({
  onEnterWorkspace,
  onOpenAnalytics
}) => {
  const [heroSrc, setHeroSrc] = useState<string>(VINTAGE_EDITORIAL_ASSETS.hero.catLaptop);

  return (
    <section className="relative w-full min-h-[calc(100vh-3.5rem)] newspaper-bg text-[#181614] flex flex-col justify-between overflow-hidden select-none">
      {/* Top Vintage Publication Dateline Strip */}
      <div className="w-full border-b-2 border-[#493B2D] bg-[#E9DCC2]/90 px-4 sm:px-8 py-2">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-oswald uppercase tracking-[0.14em] text-[#2C2520] font-bold">
          <span>VOL. IV — NO. 60 • THE LONDON &amp; HANOI ACADEMIC EDITION</span>
          <span className="hidden md:inline text-[#181614]">
            ★ CHUYÊN TRANG TỪ VỰNG, NGỮ PHÁP &amp; LỘ TRÌNH IELTS 8.0+ ★
          </span>
          <span className="text-[#C92532]">PRICE: DAILY FOCUS &amp; DEDICATION</span>
        </div>
      </div>

      {/* Exact Approved MASTER ENGLISH Complete Cover Artwork (No duplicate title/mascot/button) */}
      <div className="max-w-[1380px] w-full mx-auto px-3 sm:px-6 lg:px-10 py-4 sm:py-6 flex-1 flex flex-col items-center justify-center gap-5">
        <div className="relative w-full mx-auto overflow-hidden">
          <img
            src={heroSrc}
            onError={() => {
              if (heroSrc !== VINTAGE_EDITORIAL_ASSETS.hero.catLaptopEditorial) {
                setHeroSrc(VINTAGE_EDITORIAL_ASSETS.hero.catLaptopEditorial);
              }
            }}
            alt="MASTER ENGLISH — BETTER ME. EVERYDAY. — Bắt đầu học"
            className="w-full h-auto object-contain block select-none"
          />

          {/* Responsive Transparent Hotspot over the "Bắt đầu học →" button artwork inside the image */}
          <button
            type="button"
            onClick={() => onEnterWorkspace('dashboard')}
            aria-label="Bắt đầu học"
            title="Bắt đầu học"
            className="absolute left-[5.2%] top-[58%] w-[22.6%] h-[16%] cursor-pointer bg-transparent hover:bg-[#C92532]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C92532] rounded-[4px] transition-colors"
          />
        </div>

        {/* Newspaper Column Quick-Navigation Strip Below Complete Cover */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t-2 border-[#493B2D]">
          <button
            type="button"
            onClick={() => onEnterWorkspace('dashboard')}
            className="text-left p-3.5 rounded-[2px] bg-[#F1E7D3] border-[1.5px] border-[#181614] shadow-[2px_2px_0px_#181614] hover:border-[#C92532] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-oswald font-bold uppercase text-[#C92532]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Trang Chủ Học Tập</span>
            </div>
            <p className="text-xs sm:text-sm font-dm font-medium text-[#2C2520] mt-1">
              Bảng điều khiển từ vựng &amp; tiến độ hàng ngày
            </p>
          </button>

          <button
            type="button"
            onClick={() => onEnterWorkspace('directory')}
            className="text-left p-3.5 rounded-[2px] bg-[#F1E7D3] border-[1.5px] border-[#181614] shadow-[2px_2px_0px_#181614] hover:border-[#C92532] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-oswald font-bold uppercase text-[#181614]">
              <BookOpen className="w-4 h-4 text-[#C92532]" />
              <span>Từ Điển 3,666+ Từ</span>
            </div>
            <p className="text-xs sm:text-sm font-dm font-medium text-[#2C2520] mt-1">
              Tra cứu IPA, sắc thái học thuật &amp; collocations
            </p>
          </button>

          <button
            type="button"
            onClick={() => onEnterWorkspace('challenge-60')}
            className="text-left p-3.5 rounded-[2px] bg-[#F1E7D3] border-[1.5px] border-[#181614] shadow-[2px_2px_0px_#181614] hover:border-[#C92532] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-oswald font-bold uppercase text-[#181614]">
              <Calendar className="w-4 h-4 text-[#C92532]" />
              <span>Lộ Trình 60 Ngày</span>
            </div>
            <p className="text-xs sm:text-sm font-dm font-medium text-[#2C2520] mt-1">
              Đầy đủ 5 kỹ năng IELTS Band 7.0+ thực chiến
            </p>
          </button>

          <button
            type="button"
            onClick={() => onOpenAnalytics?.()}
            className="text-left p-3.5 rounded-[2px] bg-[#F1E7D3] border-[1.5px] border-[#181614] shadow-[2px_2px_0px_#181614] hover:border-[#C92532] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-oswald font-bold uppercase text-[#181614]">
              <BarChart3 className="w-4 h-4 text-[#C92532]" />
              <span>Analytics Báo Chí</span>
            </div>
            <p className="text-xs sm:text-sm font-dm font-medium text-[#2C2520] mt-1">
              Đồng hồ Focus &amp; biểu đồ chuyên sâu 7 ngày
            </p>
          </button>
        </div>
      </div>

      {/* Bottom Double Rule Footer */}
      <div className="w-full border-t-2 border-[#181614] bg-[#DCC9A8] py-2.5 px-6 text-center text-xs sm:text-sm font-serif italic font-semibold text-[#2C2520]">
        “Every word mastered today is a headline written for your future.” — MASTER English Editorial Board
      </div>
    </section>
  );
};

