import React, { useState, useEffect, useRef } from 'react';
import { useFocusTimer } from '../context/AnalyticsContext';
import { playTier5TimerBell } from '../utils/soundManager';

export interface BoundedBannerTimerProps {
  pageId: string;
  defaultTimeSeconds?: number;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  pageWrapperRef?: React.RefObject<HTMLDivElement | null>;
}

export type DraggablePageTimerProps = BoundedBannerTimerProps;

export const BoundedBannerTimer: React.FC<BoundedBannerTimerProps> = ({
  pageId,
  containerRef,
  pageWrapperRef,
}) => {
  const {
    elapsedSeconds,
    remainingSeconds,
    targetMinutes,
    isRunning,
    togglePause,
    endAndSaveSession,
  } = useFocusTimer();

  const timerRef = useRef<HTMLDivElement>(null);
  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevRemainingRef = useRef<number>(remainingSeconds);

  // Phát tiếng chuông ngân dài TIER_5_TIMER_BELL (typewriter-ding.mp3) khi đồng hồ đếm ngược chạm 00:00
  useEffect(() => {
    if (prevRemainingRef.current > 0 && remainingSeconds === 0 && isRunning) {
      playTier5TimerBell();
    }
    prevRemainingRef.current = remainingSeconds;
  }, [remainingSeconds, isRunning]);

  // Clean legacy local seconds key to preserve global synchronization
  useEffect(() => {
    try {
      localStorage.removeItem(`timer_sec_${pageId}`);
    } catch {
      // ignore
    }
  }, [pageId]);

  // Per-page isolated position state
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const savedPos = localStorage.getItem(`timer_pos_${pageId}`);
      return savedPos ? JSON.parse(savedPos) : { x: 0, y: 0 };
    } catch {
      return { x: 0, y: 0 };
    }
  });

  const latestPosRef = useRef<{ x: number; y: number }>(position);
  useEffect(() => {
    latestPosRef.current = position;
  }, [position]);

  // Synchronize position if pageId changes
  useEffect(() => {
    try {
      const savedPos = localStorage.getItem(`timer_pos_${pageId}`);
      const parsedPos = savedPos ? JSON.parse(savedPos) : { x: 0, y: 0 };
      setPosition(parsedPos);
      latestPosRef.current = parsedPos;
    } catch {
      setPosition({ x: 0, y: 0 });
      latestPosRef.current = { x: 0, y: 0 };
    }
  }, [pageId]);

  // Click-to-reveal controls state (Default = FALSE for clean aesthetic)
  const [showControls, setShowControls] = useState<boolean>(false);
  const [isDraggingState, setIsDraggingState] = useState<boolean>(false);

  const isDragging = useRef<boolean>(false);
  const hasDraggedDistance = useRef<boolean>(false);
  const mouseStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isMoved = Math.abs(position.x) > 5 || Math.abs(position.y) > 5;

  // Auto-hide controls when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (timerRef.current && !timerRef.current.contains(e.target as Node)) {
        setShowControls(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset auto-hide timer after 4s of idle time when controls are open
  useEffect(() => {
    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current);
    }
    if (showControls) {
      autoHideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
    return () => {
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
    };
  }, [showControls]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Ignore pointer events on interactive buttons
    if ((e.target as HTMLElement).closest('button')) return;

    isDragging.current = true;
    hasDraggedDistance.current = false;
    mouseStart.current = { x: e.clientX, y: e.clientY };
    dragStart.current = { ...latestPosRef.current };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;

    const dx = e.clientX - mouseStart.current.x;
    const dy = e.clientY - mouseStart.current.y;

    // Distinguish between click (< 5px) and drag (>= 5px)
    if (Math.hypot(dx, dy) > 5) {
      hasDraggedDistance.current = true;
      setIsDraggingState(true);
    }

    if (!hasDraggedDistance.current) return;

    let targetX = dragStart.current.x + dx;
    let targetY = dragStart.current.y + dy;

    // Clamping boundaries to the current page wrapper or container
    const wrapper =
      pageWrapperRef?.current ||
      (containerRef?.current?.parentElement as HTMLElement | null) ||
      containerRef?.current;

    if (wrapper && timerRef.current) {
      const pageRect = wrapper.getBoundingClientRect();
      const anchorRect = containerRef?.current
        ? containerRef.current.getBoundingClientRect()
        : pageRect;
      const child = timerRef.current.getBoundingClientRect();

      const originRight = anchorRect.right - 24;
      const originLeft = originRight - child.width;
      const originTop = anchorRect.top + 16;

      const minX = pageRect.left + 8 - originLeft;
      const maxX = pageRect.right - 8 - originRight;
      const minY = pageRect.top - 8 - originTop;
      const maxY = Math.max(pageRect.height - child.height - 32, 650);

      targetX = Math.min(maxX, Math.max(minX, targetX));
      targetY = Math.min(maxY, Math.max(minY, targetY));
    }

    const nextPos = { x: targetX, y: targetY };
    latestPosRef.current = nextPos;
    setPosition(nextPos);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsDraggingState(false);

    if (hasDraggedDistance.current) {
      // User dragged -> Persist new position
      try {
        localStorage.setItem(`timer_pos_${pageId}`, JSON.stringify(latestPosRef.current));
      } catch {
        // ignore
      }
    } else {
      // User clicked/tapped in place -> Toggle controls reveal
      setShowControls((prev) => !prev);
    }

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleResetPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    const resetPos = { x: 0, y: 0 };
    latestPosRef.current = resetPos;
    setPosition(resetPos);
    try {
      localStorage.removeItem(`timer_pos_${pageId}`);
    } catch {
      // ignore
    }
    setShowControls(false);
  };

  const formatMMSS = (total: number) => {
    const safeSec = Math.max(0, Math.floor(total));
    const m = Math.floor(safeSec / 60).toString().padStart(2, '0');
    const s = (safeSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalTargetSec = Math.max(60, targetMinutes * 60);
  const progressRatio = Math.min(1, elapsedSeconds / totalTargetSec);
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div
      ref={timerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
        opacity: 1,
        mixBlendMode: 'normal',
        isolation: 'isolate',
      }}
      className={`compact-timer-badge absolute top-4 right-6 z-50 flex flex-col items-center select-none cursor-grab active:cursor-grabbing opacity-100 mix-blend-normal isolate ${
        !isDraggingState ? 'transition-transform duration-300 ease-out' : 'transition-none'
      }`}
    >
      {/* Pocket Watch Crown & Bow (Authentic Mechanical Top with Solid Opaque Background) */}
      <div
        className="flex flex-col items-center pointer-events-none z-10 -mb-0.5 opacity-100 mix-blend-normal isolate"
        style={{ opacity: 1, mixBlendMode: 'normal', isolation: 'isolate' }}
      >
        {/* Metal Bow Ring */}
        <div
          className="w-7 h-2.5 border-[2.5px] border-b-0 border-[#1A1917] rounded-t-full shadow-xs"
          style={{ backgroundColor: '#F7F1E3', opacity: 1, mixBlendMode: 'normal' }}
        />
        {/* Crown Winding Stem */}
        <div
          className="w-4 h-1.5 border-[2px] border-[#1A1917] rounded-xs shadow-xs -mt-0.5"
          style={{ backgroundColor: '#D8CBB8', opacity: 1, mixBlendMode: 'normal' }}
        />
      </div>

      {/* 100% SOLID OPAQUE VINTAGE POCKET WATCH DIAL (112x112px, COMPACT MECHANICAL FACE) */}
      <div
        title="Ấn vào mặt đồng hồ để mở/đóng nút điều khiển • Giữ chuột để kéo"
        className="relative w-[112px] h-[112px] rounded-full border-[3px] border-[#1A1917] shadow-[3px_4px_0px_#1A1917] flex flex-col items-center justify-center p-2 transition-transform hover:scale-[1.02] opacity-100 mix-blend-normal isolate"
        style={{
          width: '112px',
          height: '112px',
          backgroundColor: '#F7F1E3',
          opacity: 1,
          mixBlendMode: 'normal',
          isolation: 'isolate',
        }}
      >
        {/* 100% Solid Opaque Backing Layer (#F7F1E3) */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            backgroundColor: '#F7F1E3',
            opacity: 1,
            mixBlendMode: 'normal',
          }}
        />

        {/* Parchment Aging Radial Gradient layered above solid underlay */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, #FAF5E8 40%, #E2D6C1 100%)',
            opacity: 0.95,
          }}
        />

        {/* Inner decorative engraved border ring */}
        <div className="absolute inset-1 rounded-full border-[1.2px] border-[#1A1917]/35 pointer-events-none z-[1]" />

        {/* SVG Dial with Solid Disk, 60 Ticks, Hour Markers, and Progress Arc */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-[2]"
          viewBox="0 0 140 140"
        >
          {/* Solid Opaque Dial Disk (Prevents any etching background bleed) */}
          <circle
            cx="70"
            cy="70"
            r="66"
            fill="#F7F1E3"
          />

          {/* 12 Sharp Hour Markers (Clean Mechanical Pocket Watch Face) */}
          {Array.from({ length: 12 }).map((_, i) => {
            return (
              <line
                key={i}
                x1="70"
                y1="9"
                x2="70"
                y2="16"
                stroke="#1A1917"
                strokeWidth="2.4"
                strokeLinecap="round"
                transform={`rotate(${i * 30} 70 70)`}
              />
            );
          })}

          {/* Track Background */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#CFC2AC"
            strokeWidth="5.5"
          />

          {/* Inner subtle dashed guide ring */}
          <circle
            cx="70"
            cy="70"
            r="42"
            fill="none"
            stroke="#1A1917"
            strokeOpacity="0.18"
            strokeWidth="0.9"
            strokeDasharray="2.5 2.5"
          />

          {/* Active Progress Arc */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#A61920"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Nút ↺ gắn về vị trí gốc - Hiện ngay ở góc trên phải mặt đồng hồ khi isMoved === true */}
        {isMoved && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              const resetPos = { x: 0, y: 0 };
              latestPosRef.current = resetPos;
              setPosition(resetPos);
              try {
                localStorage.removeItem(`timer_pos_${pageId}`);
              } catch {
                // ignore
              }
              setShowControls(false);
            }}
            title="Gắn về vị trí gốc"
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#FAF6EE] hover:bg-[#B81D24] text-[#121110] hover:text-white border-[1.5px] border-[#121110] shadow-[1.5px_1.5px_0px_#121110] flex items-center justify-center transition-colors z-40 cursor-pointer animate-in fade-in zoom-in duration-150"
          >
            <span className="text-xs font-black leading-none">↺</span>
          </button>
        )}

        {/* Live / Paused Badge */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black tracking-wider z-10 border-[1px] border-[#1A1917] shadow-[1px_1px_0px_#1A1917] pointer-events-none ${
            isRunning ? 'bg-[#B81D24] text-white' : 'bg-[#D97706] text-white'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 bg-white rounded-full ${
              isRunning ? 'animate-pulse' : ''
            }`}
          />
          <span>{isRunning ? 'LIVE' : 'PAUSED'}</span>
        </div>

        {/* Digits with Drop Shadow: -00:15- */}
        <span
          className="font-mono text-[17px] leading-none font-black tracking-tighter text-[#121110] my-0.5 z-10 tabular-nums drop-shadow-[0_1px_0_rgba(255,255,255,0.7)] pointer-events-none"
          style={{ fontSize: '17px' }}
        >
          -{formatMMSS(elapsedSeconds)}-
        </span>

        {/* Remaining Time */}
        <span className="text-[9px] italic font-serif font-bold text-[#2C251E] border-t border-[#1A1917]/20 pt-0.5 px-1 z-10 tabular-nums pointer-events-none">
          Còn {formatMMSS(remainingSeconds)}
        </span>
      </div>

      {/* CLICK-TO-REVEAL DUAL CONTROL BUTTONS (DEFAULT HIDDEN, EXPANDS ON CLICK) */}
      <div
        className={`flex items-center gap-1.5 mt-2 transition-all duration-200 opacity-100 mix-blend-normal isolate ${
          showControls
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 -translate-y-2 scale-95 pointer-events-none h-0 overflow-hidden mt-0'
        }`}
      >
        {/* Button 1: Pause / Resume */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePause(pageId);
          }}
          className={`text-[11px] font-black px-2.5 py-1 rounded-full border-[1.5px] border-[#1A1917] shadow-[1.5px_1.5px_0px_#1A1917] transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
            isRunning
              ? 'bg-[#FAF5E8] hover:bg-[#E2D6C1] text-[#1A1917]'
              : 'bg-[#D97706] hover:bg-[#B45309] text-white'
          }`}
        >
          <span>{isRunning ? '⏸ Dừng' : '▶ Tiếp'}</span>
        </button>

        {/* Button 2: End & Save Session */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            endAndSaveSession();
            setShowControls(false);
          }}
          className="bg-[#1A1917] hover:bg-[#A61920] text-white text-[11px] font-black px-2.5 py-1 rounded-full border-[1.5px] border-[#1A1917] shadow-[1.5px_1.5px_0px_#1A1917] transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <span>⊘ Kết thúc</span>
        </button>
      </div>
    </div>
  );
};

// Aliases for unified importing across the application
export const DraggablePageTimer = BoundedBannerTimer;
