import React, { useRef } from 'react';
import { BoundedBannerTimer } from './BoundedBannerTimer';

interface ActiveSessionBarProps {
  currentModeLabel?: string;
  variant?: 'full' | 'clock-only';
  className?: string;
  enableDrag?: boolean;
}

/**
 * Legacy wrapper delegating strictly to BoundedBannerTimer.
 * The old Red Session Banner has been permanently removed.
 */
export const ActiveSessionBar: React.FC<ActiveSessionBarProps> = ({
  currentModeLabel = 'default',
}) => {
  const fallbackRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={fallbackRef} className="relative">
      <BoundedBannerTimer pageId={currentModeLabel} containerRef={fallbackRef} />
    </div>
  );
};
