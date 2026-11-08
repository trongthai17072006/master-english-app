import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  BarChart3,
  Bot,
  ChevronDown,
  Zap,
  GitBranch,
  Layers,
  Puzzle,
  Scale,
  Link2,
  Target,
  Library,
  AlertTriangle,
  Calendar,
  Home,
  Flame,
  Clock,
  Award,
  Sparkles,
  Lock,
  LogIn,
  LogOut
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';
import { WorkspaceMode } from './WarmLightWorkspace';
import { MascotDisplay } from './MascotDisplay';

interface FloatingPillNavbarProps {
  activeView: 'home' | 'workspace' | 'analytics';
  activeWorkspaceMode?: WorkspaceMode;
  onSelectView: (view: 'home' | 'workspace' | 'analytics') => void;
  onSelectWorkspaceMode?: (mode: WorkspaceMode) => void;
  onOpenProfile: () => void;
  onOpenAiTutor: () => void;
  isAuthenticated?: boolean;
  onOpenAuthModal?: (intentLabel?: string) => void;
  onSignOut?: () => void;
}

const PRACTICE_MODULE_ITEMS: {
  id: WorkspaceMode;
  label: string;
  subLabel: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Bảng Điều Khiển Học Tập', subLabel: 'Tổng quan lộ trình & mục tiêu ngày', icon: Home },
  { id: 'speed', label: 'Từ Vựng Tốc Độ (Speed Quiz)', subLabel: 'Phản xạ từ vựng học thuật C1/C2', icon: Zap },
  { id: 'structures', label: 'Cấu Trúc & Ngữ Pháp', subLabel: 'Đảo ngữ, mệnh đề phân từ & câu phức', icon: GitBranch },
  { id: 'flashcards', label: 'Flashcard 3D Lật Thẻ', subLabel: 'Ghi nhớ sâu qua ngữ cảnh & âm thanh', icon: Layers },
  { id: 'collocations', label: 'Collocations & Giới Từ', subLabel: 'Cụm từ cố định ăn điểm Writing/Speaking', icon: Puzzle },
  { id: 'distinctions', label: 'Phân Biệt Từ Dễ Nhầm', subLabel: 'So sánh sắc thái nghĩa học thuật', icon: Scale },
  { id: 'matching', label: 'Nối Từ Tương Tác', subLabel: 'Ghép cặp đồng nghĩa & giải nghĩa nhanh', icon: Link2 },
  { id: 'context', label: 'Ngữ Cảnh IELTS Thực Chiến', subLabel: 'Điền từ vào đoạn văn học thuật', icon: Target },
  { id: 'directory', label: 'Tra Cứu Từ Điển 3,600+ Từ', subLabel: 'Kho từ vựng, phát âm & ví dụ chi tiết', icon: Library },
  { id: 'mistakes', label: 'Ngân Hàng Lỗi Sai', subLabel: 'Ôn tập lại các câu trả lời cần khắc phục', icon: AlertTriangle }
];

export const FloatingPillNavbar: React.FC<FloatingPillNavbarProps> = ({
  activeView,
  activeWorkspaceMode = 'dashboard',
  onSelectView,
  onSelectWorkspaceMode,
  onOpenProfile,
  onOpenAiTutor,
  isAuthenticated = false,
  onOpenAuthModal,
  onSignOut
}) => {
  const {
    userProfile,
    realStreak,
    isSessionActive,
    activeSessionSeconds,
    totalUniqueMasteredWords
  } = useAnalytics();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isChallengeActive = activeView === 'workspace' && activeWorkspaceMode === 'challenge-60';
  const isPracticeActive = activeView === 'workspace' && activeWorkspaceMode !== 'challenge-60';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#181614] border-b-2 border-[#493B2D] text-[#F1E7D3] shadow-[0_3px_10px_rgba(24,22,20,0.28)]" style={{ backgroundImage: 'var(--grain)' }}>
      <div className="max-w-[1640px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* 1. Left Vintage Newspaper Masthead Brand — Clickable Redirect to Trang Bìa (/) */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onSelectView('home');
            window.dispatchEvent(new CustomEvent('navigate-home-trang-nhat'));
          }}
          title="Về Trang Bìa (MASTER English)"
          className="flex items-center gap-2.5 text-left group cursor-pointer hover:opacity-90 transition-opacity shrink-0 no-underline"
        >
          <div className="w-8 h-8 rounded-[4px] bg-[#C92532] border border-[#F1E7D3]/30 flex items-center justify-center text-[#F1E7D3] font-serif font-black text-lg shadow-[2px_2px_0px_#000000]">
            M
          </div>
          <div className="leading-none">
            <span className="font-oswald font-bold text-base tracking-[0.06em] uppercase text-[#F1E7D3] group-hover:text-[#C92532] transition-colors">
              MASTER ENGLISH
            </span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-serif italic text-[#DCC9A8]">
              The Academic Editorial
            </span>
          </div>
        </a>

        {/* 2. Center Editorial Navigation */}
        <nav aria-label="Điều hướng chính" className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => onSelectView('home')}
            aria-current={activeView === 'home' ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-oswald uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'home'
                ? 'bg-[#C92532] text-[#F1E7D3] border border-[#F1E7D3]/30 shadow-[2px_2px_0px_#000000]'
                : 'text-[#F1E7D3]/85 hover:text-[#F1E7D3] hover:bg-[#51483D]/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trang Bìa</span>
          </button>

          {/* Dropdown: Không Gian Học Tập */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => {
                if (!isPracticeActive) {
                  onSelectView('workspace');
                  onSelectWorkspaceMode?.('dashboard');
                } else {
                  setIsDropdownOpen((prev) => !prev);
                }
              }}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-oswald uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isPracticeActive
                  ? 'bg-[#C92532] text-[#F1E7D3] border border-[#F1E7D3]/30 shadow-[2px_2px_0px_#000000]'
                  : 'text-[#F1E7D3]/85 hover:text-[#F1E7D3] hover:bg-[#51483D]/40'
              }`}
            >
              {!isAuthenticated ? (
                <Lock className="w-3 h-3 text-[#E8B7AC] opacity-85" />
              ) : (
                <BookOpen className="w-3.5 h-3.5" />
              )}
              <span>Workspace</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen((prev) => !prev);
                }}
                className="p-0.5 rounded hover:bg-black/20"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-[6px] p-2 shadow-[4px_4px_0px_#181614] border-2 border-[#493B2D] bg-[#F1E7D3] text-[#181614] z-50">
                <div className="px-3 py-2 border-b border-[#493B2D]/30 flex items-center justify-between">
                  <span className="text-[11px] font-oswald font-bold uppercase tracking-wider text-[#C92532]">
                    Chuyên Mục Học Tập
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-[#51483D] flex items-center gap-1">
                    {!isAuthenticated && <Lock className="w-3 h-3 text-[#C92532]" />}
                    <span>10 học phần</span>
                  </span>
                </div>
                <div className="mt-1 max-h-[65vh] overflow-y-auto divide-y divide-[#493B2D]/15">
                  {PRACTICE_MODULE_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isCurrent = activeView === 'workspace' && activeWorkspaceMode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectView('workspace');
                          onSelectWorkspaceMode?.(item.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2.5 text-left transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#C92532] text-[#F1E7D3]'
                            : 'hover:bg-[#DCC9A8] text-[#181614]'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-[4px] flex items-center justify-center shrink-0 mt-0.5 border ${
                            isCurrent
                              ? 'bg-[#181614] text-[#F1E7D3] border-[#F1E7D3]/30'
                              : 'bg-[#E9DCC2] text-[#C92532] border-[#493B2D]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate flex items-center justify-between gap-1">
                            <span className="truncate">{item.label}</span>
                            {!isAuthenticated && (
                              <Lock className="w-3 h-3 shrink-0 opacity-60" />
                            )}
                          </div>
                          <div className={`text-[11px] truncate ${isCurrent ? 'text-[#F1E7D3]/85' : 'text-[#51483D]'}`}>
                            {item.subLabel}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectView('workspace');
              onSelectWorkspaceMode?.('challenge-60');
            }}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-oswald uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isChallengeActive
                ? 'bg-[#C92532] text-[#F1E7D3] border border-[#F1E7D3]/30 shadow-[2px_2px_0px_#000000]'
                : 'text-[#F1E7D3]/85 hover:text-[#F1E7D3] hover:bg-[#51483D]/40'
            }`}
          >
            {!isAuthenticated ? (
              <Lock className="w-3 h-3 text-[#E8B7AC] opacity-85" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline">Lộ Trình 60 Ngày</span>
            <span className="md:hidden">60 Ngày</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('analytics')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-oswald uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'analytics'
                ? 'bg-[#C92532] text-[#F1E7D3] border border-[#F1E7D3]/30 shadow-[2px_2px_0px_#000000]'
                : 'text-[#F1E7D3]/85 hover:text-[#F1E7D3] hover:bg-[#51483D]/40'
            }`}
          >
            {!isAuthenticated ? (
              <Lock className="w-3 h-3 text-[#E8B7AC] opacity-85" />
            ) : (
              <BarChart3 className="w-3.5 h-3.5" />
            )}
            <span>Analytics</span>
          </button>
        </nav>

        {/* 3. Right Utilities — Dynamic Auth State */}
        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <>
              {isSessionActive && (
                <button
                  type="button"
                  onClick={() => onSelectView('analytics')}
                  className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#C92532] text-[#F1E7D3] border border-[#F1E7D3]/40 text-xs font-mono font-bold cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(activeSessionSeconds)}</span>
                </button>
              )}

              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#51483D]/40 border border-[#796B59]/50 text-xs font-mono text-[#F1E7D3]">
                <span className="inline-flex items-center gap-1 font-bold text-[#E8B7AC]">
                  <Flame className="w-3.5 h-3.5 text-[#C92532] fill-[#C92532]" />
                  {realStreak}d
                </span>
                <span className="text-[#796B59]">|</span>
                <span className="inline-flex items-center gap-1 font-bold text-[#DCC9A8]">
                  <Award className="w-3.5 h-3.5 text-[#C92532]" />
                  {totalUniqueMasteredWords} từ
                </span>
              </div>

              <button
                type="button"
                onClick={onOpenAiTutor}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] border border-[#F1E7D3]/30 text-xs font-oswald uppercase tracking-wider font-bold cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Tutor</span>
              </button>

              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-[4px] bg-[#F1E7D3] text-[#181614] border border-[#493B2D] hover:border-[#C92532] transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-[#E9DCC2] flex items-center justify-center">
                  <MascotDisplay
                    pose={(userProfile.avatarPose as any) || 'welcome-heart'}
                    customSrc={userProfile.customAvatarUrl || undefined}
                    size={24}
                  />
                </div>
                <span className="hidden md:block text-xs font-bold max-w-[96px] truncate">
                  {userProfile.name || 'Học viên'}
                </span>
              </button>

              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Đăng xuất & Quay về Trang Bìa"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-[#2C2520] hover:bg-[#C92532] text-[#F1E7D3] border border-[#796B59]/60 text-xs font-oswald uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Đăng xuất</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenAiTutor}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-[#2C2520] hover:bg-[#51483D]/60 text-[#F1E7D3]/90 border border-[#796B59]/50 text-xs font-oswald uppercase tracking-wider font-bold cursor-pointer"
              >
                <Lock className="w-3 h-3 text-[#E8B7AC]" />
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden md:inline">AI Tutor</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuthModal?.('Không Gian Học Tập Mastere')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-[4px] bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] border-2 border-[#F1E7D3]/50 shadow-[2px_2px_0px_#000000] text-xs font-oswald uppercase tracking-wider font-bold transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập / Bắt đầu</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
