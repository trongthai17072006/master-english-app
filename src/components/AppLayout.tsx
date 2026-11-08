import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Feather,
  CalendarRange,
  Columns,
  WalletCards,
  Paperclip,
  Scale,
  Waypoints,
  ScrollText,
  Library,
  Stamp,
  IdCard,
  Menu,
  X,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { VINTAGE_EDITORIAL_ASSETS } from './VintageNewspaperIllustrations';

export type WorkspaceMode =
  | 'dashboard'
  | 'speed'
  | 'structures'
  | 'flashcards'
  | 'collocations'
  | 'distinctions'
  | 'matching'
  | 'context'
  | 'directory'
  | 'mistakes'
  | 'challenge-60';

interface AppLayoutProps {
  activeMode: WorkspaceMode;
  onSelectMode: (mode: WorkspaceMode) => void;
  onOpenProfile: () => void;
  onOpenTutor: () => void;
  onOpenAnalytics?: () => void;
  mistakeCount?: number;
  children: React.ReactNode;
}

interface SidebarNavItem {
  id: WorkspaceMode | 'profile-Action' | 'analytics-Action';
  label: string;
  icon: React.FC<{ className?: string }>;
  badgeCount?: number;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeMode,
  onSelectMode,
  onOpenProfile,
  onOpenTutor,
  onOpenAnalytics,
  mistakeCount = 0,
  children
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isWritingFocusHidden, setIsWritingFocusHidden] = useState(false);

  useEffect(() => {
    const handleFocusModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ active?: boolean }>;
      setIsWritingFocusHidden(Boolean(customEvent.detail?.active));
    };
    window.addEventListener('master-english-focus-mode', handleFocusModeChange);
    return () => {
      window.removeEventListener('master-english-focus-mode', handleFocusModeChange);
    };
  }, []);

  useEffect(() => {
    if (activeMode !== 'challenge-60') {
      setIsWritingFocusHidden(false);
    }
  }, [activeMode]);

  const handleLogoNavigateHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsWritingFocusHidden(false);
    setIsMobileSidebarOpen(false);
    window.dispatchEvent(new CustomEvent('navigate-home-trang-nhat'));
  };

  const navItems: SidebarNavItem[] = [
    { id: 'dashboard', label: 'Trang Nhất', icon: Newspaper },
    { id: 'speed', label: 'Kho Chữ & Thuật Ngữ', icon: Feather },
    { id: 'challenge-60', label: 'Kỳ Xuất Bản (60 Số)', icon: CalendarRange },
    { id: 'structures', label: 'Quy Chuẩn Hành Văn', icon: Columns },
    { id: 'flashcards', label: 'Thẻ Hồ Sơ Lưu Trữ', icon: WalletCards },
    { id: 'collocations', label: 'Phối Ngữ & Mạch Văn', icon: Paperclip },
    { id: 'distinctions', label: 'Thẩm Định Ngữ Nghĩa', icon: Scale },
    { id: 'matching', label: 'Sơ Đồ Liên Đới', icon: Waypoints },
    { id: 'context', label: 'Chuyên Đề Học Thuật', icon: ScrollText },
    { id: 'directory', label: 'Tổng Kho Tư Liệu', icon: Library },
    {
      id: 'mistakes',
      label: 'Bản Đính Chính',
      icon: Stamp,
      badgeCount: mistakeCount > 0 ? mistakeCount : undefined
    },
    ...(onOpenAnalytics
      ? [{ id: 'analytics-Action' as const, label: 'Báo Cáo Phát Hành', icon: TrendingUp }]
      : []),
    { id: 'profile-Action', label: 'Thẻ Nhà Báo', icon: IdCard }
  ];

  const handleSidebarItemClick = (item: SidebarNavItem) => {
    if (item.id === 'profile-Action') {
      onOpenProfile();
    } else if (item.id === 'analytics-Action') {
      onOpenAnalytics?.();
    } else {
      onSelectMode(item.id);
    }
    setIsMobileSidebarOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col justify-between h-full select-none text-[#F1E7D3]">
      <div className="space-y-4 px-3 pt-4">
        {/* 1. Vintage Brand Masthead Logo — Clickable Redirect to Cover Page (Trang Bìa /home) */}
        <a
          href="/home"
          onClick={handleLogoNavigateHome}
          title="Về Trang Bìa (MASTER English)"
          className="flex items-center gap-3 px-1.5 py-1 text-left w-full cursor-pointer hover:opacity-90 transition-opacity group no-underline"
        >
          <div
            className="w-10 h-10 rounded-[2px] bg-[#C92532] border border-[#493B2D] flex items-center justify-center text-[#F1E7D3] font-serif font-black text-2xl shrink-0 shadow-[2px_2px_0px_#000000] group-hover:scale-[1.03] transition-transform"
            style={{ backgroundImage: 'var(--grain)' }}
          >
            M
          </div>
          <div className="leading-none">
            <span className="block font-oswald font-bold text-[19px] tracking-[0.04em] uppercase text-[#F1E7D3] group-hover:text-[#C92532] transition-colors">
              MASTER
            </span>
            <span className="block font-dm font-bold text-[15px] text-[#F1E7D3] -mt-0.5">
              English
            </span>
          </div>
        </a>

        {/* 2. Vertical Editorial Navigation */}
        <nav className="space-y-1 pt-1" aria-label="Workspace Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = item.id === activeMode;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSidebarItemClick(item)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[2px] text-[13px] transition-all cursor-pointer text-left ${
                  isItemActive
                    ? 'bg-[#C92532] text-[#F1E7D3] font-bold shadow-[2px_2px_0px_#000000] border border-[#181614] border-l-4 border-l-[#F1E7D3]'
                    : 'text-[#F1E7D3]/90 hover:bg-[#51483D]/35 hover:text-[#F1E7D3] font-medium border border-transparent'
                }`}
                style={isItemActive ? { backgroundImage: 'var(--grain)' } : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isItemActive ? 'text-[#F1E7D3]' : 'text-[#DCC9A8]'
                    }`}
                  />
                  <span className="truncate font-dm">{item.label}</span>
                </div>
                {item.badgeCount !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-[2px] ${
                      isItemActive
                        ? 'bg-[#181614] text-[#F1E7D3]'
                        : 'bg-[#C92532] text-[#F1E7D3]'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 3. Live AI Tutor Editorial Red Card */}
        <div
          className="rounded-[2px] p-3 bg-[#C92532] border-2 border-[#493B2D] text-[#F1E7D3] shadow-[3px_3px_0px_#000000] relative overflow-hidden"
          style={{ backgroundImage: 'var(--blot), var(--grain)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 shrink-0 bg-[#F1E7D3] rounded-[2px] border border-[#181614] overflow-hidden">
              <img
                src={VINTAGE_EDITORIAL_ASSETS.editorial.quillCatDesk}
                alt="Editorial Tutor"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover scale-[1.12] mix-blend-multiply block"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] font-oswald font-bold uppercase tracking-wide text-[#F1E7D3]">
                Bàn Biên Tập • AI
              </h3>
              <p className="text-[11px] leading-tight mt-0.5 text-[#F1E7D3]/95 font-dm">
                Giải đáp từ vựng &amp; ngữ pháp tức thì
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onOpenTutor();
              setIsMobileSidebarOpen(false);
            }}
            className="mt-2.5 w-full py-1.5 px-3 rounded-[2px] bg-[#F1E7D3] hover:bg-[#E9DCC2] text-[#181614] border border-[#181614] text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_#181614] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Trao đổi ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Bottom Archival Newspaper Colophon Stamp + Sign Out */}
      <div className="mt-4 px-3 pb-4 pt-3 border-t border-[#493B2D]/60 text-left space-y-2">
        <button
          type="button"
          onClick={() => {
            setIsMobileSidebarOpen(false);
            window.dispatchEvent(new CustomEvent('master-english-sign-out'));
          }}
          className="w-full py-1.5 px-2.5 rounded-[2px] bg-[#2C2520] hover:bg-[#C92532] text-[#F1E7D3] border border-[#493B2D] text-[11px] font-oswald font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Đăng xuất &amp; Về Trang Bìa</span>
        </button>
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#C92532]">
            THE MASTER CHRONICLE
          </div>
          <div className="font-serif italic text-[11px] text-[#DCC9A8]/85 leading-snug">
            “Better Me. Everyday.” — Ấn bản học thuật IELTS &amp; VSTEP.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen newspaper-bg text-[#181614]">
      {/* Mobile Sidebar Drawer Overlay */}
      {!isWritingFocusHidden && isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#181614]/70"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside
            className="relative z-10 w-[240px] max-w-[82vw] h-full overflow-y-auto bg-[#181614] border-r-2 border-[#493B2D] flex flex-col justify-between"
            style={{ backgroundImage: 'var(--grain)' }}
          >
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-[4px] text-[#F1E7D3] hover:bg-[#C92532] cursor-pointer"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Mobile Top Newspaper Strip (Hidden completely during Writing Focus Mode) */}
      {!isWritingFocusHidden && (
        <div className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-[#181614] text-[#F1E7D3] border-b-2 border-[#493B2D]">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="px-3 py-1.5 rounded-[4px] bg-[#C92532] text-[#F1E7D3] border border-[#F1E7D3]/30 text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>MENU BÁO CHÍ</span>
          </button>
          <a
            href="/home"
            onClick={handleLogoNavigateHome}
            title="Về Trang Bìa (MASTER English)"
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity no-underline text-[#F1E7D3]"
          >
            <span className="w-6 h-6 rounded-[3px] bg-[#C92532] flex items-center justify-center font-serif font-bold text-xs text-[#F1E7D3]">
              M
            </span>
            <span className="font-oswald font-bold text-sm tracking-wider uppercase">
              MASTER ENGLISH
            </span>
          </a>
        </div>
      )}

      {/* Main Newspaper Layout: Fixed Left Dark Ink Sidebar + Right 5-Layer Paper Canvas */}
      <div className="flex flex-col lg:flex-row items-stretch min-h-screen w-full max-w-[1680px] mx-auto">
        {!isWritingFocusHidden && (
          <aside
            className="hidden lg:flex lg:flex-col w-[215px] xl:w-[228px] shrink-0 bg-[#181614] border-r-2 border-[#493B2D] self-stretch sticky top-0 min-h-screen justify-between shadow-[4px_0_12px_rgba(24,22,20,0.18)]"
            style={{ backgroundImage: 'var(--grain)' }}
          >
            {renderSidebarContent()}
          </aside>
        )}

        {/* Right Vintage Newspaper Content Viewport */}
        <div
          className={`flex-1 min-w-0 w-full ${
            isWritingFocusHidden
              ? 'px-2 sm:px-4 lg:px-6 py-2 pb-10'
              : 'px-3 sm:px-5 lg:px-7 py-4 pb-16'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
