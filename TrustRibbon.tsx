import React from 'react';
import { ShieldCheck, Clock, Radio } from 'lucide-react';

interface TrustRibbonProps {
  source: string;
  confidenceScore: number;
  lastVerifiedMinutesAgo: number | string;
  className?: string;
  compact?: boolean;
}

export const TrustRibbon: React.FC<TrustRibbonProps> = ({
  source,
  confidenceScore,
  lastVerifiedMinutesAgo,
  className = '',
  compact = false,
}) => {
  const isHigh = confidenceScore >= 90;
  const isMedium = confidenceScore >= 75 && confidenceScore < 90;

  const scoreBadgeBg = isHigh
    ? 'bg-emerald-50 dark:bg-[#0d3025] text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
    : isMedium
    ? 'bg-amber-50 dark:bg-[#3a2a0a] text-amber-700 dark:text-amber-300 border-amber-500/30'
    : 'bg-rose-50 dark:bg-[#3d1720] text-rose-700 dark:text-rose-300 border-rose-500/30';

  if (compact) {
    return (
      <div
        id={`trust-ribbon-compact-${confidenceScore}`}
        className={`inline-flex items-center gap-2 text-[11px] px-2.5 py-1 rounded-full border border-line bg-paper text-ink-soft ${className}`}
      >
        <span className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded border ${scoreBadgeBg}`}>
          <ShieldCheck className="w-3 h-3" />
          {confidenceScore}% trust
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-ink-soft" />
          {typeof lastVerifiedMinutesAgo === 'number' ? `${lastVerifiedMinutesAgo}m ago` : lastVerifiedMinutesAgo}
        </span>
      </div>
    );
  }

  return (
    <div
      id={`trust-ribbon-${confidenceScore}`}
      className={`flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border border-line bg-paper text-ink-soft text-xs ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-lg bg-teal-pale flex items-center justify-center text-teal-dark shrink-0">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="curb-label text-[10px] text-ink-soft font-bold">Verified Telemetry</div>
          <div className="font-medium text-ink text-xs truncate max-w-[200px] sm:max-w-[260px]">
            {source}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg border text-[11px] ${scoreBadgeBg}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          {confidenceScore}%
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-ink-soft bg-limestone px-2 py-0.5 rounded-lg border border-line">
          <Clock className="w-3 h-3" />
          {typeof lastVerifiedMinutesAgo === 'number' ? `${lastVerifiedMinutesAgo}m ago` : lastVerifiedMinutesAgo}
        </span>
      </div>
    </div>
  );
};
