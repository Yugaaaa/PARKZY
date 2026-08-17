import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Activity, ShieldCheck, Clock, Eye, Sparkles, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FeatureCardItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  accentColor?: string;
}

const DEFAULT_FEATURES: FeatureCardItem[] = [
  {
    id: 'feat-live',
    title: 'Live Availability',
    description: 'Sub-minute ultrasonic & camera sensing across 8 major commercial corridors in Coimbatore.',
    icon: Activity,
    badge: '112+ Sensors Active',
    accentColor: '#0a7d73',
  },
  {
    id: 'feat-fair',
    title: 'Fair, Transparent Pricing',
    description: 'Dynamic hourly rates based strictly on demand and peak hours. Zero hidden congestion surcharges.',
    icon: ShieldCheck,
    badge: 'Municipal Standard',
    accentColor: '#0a7d73',
  },
  {
    id: 'feat-reserve',
    title: 'Reserve in Seconds',
    description: 'Lock your space for 15 seconds in this demonstration with a single tap. Turn-by-turn routing leads right to your spot.',
    icon: Clock,
    badge: '15-Sec Demo',
    accentColor: '#d97706',
  },
  {
    id: 'feat-report',
    title: 'Report What You See',
    description: 'Notice an obstruction or occupied bay? Community verification keeps the civic map accurate.',
    icon: Eye,
    badge: 'Citizen Verified',
    accentColor: '#b94c40',
  },
];

export const HoverFeatureCards: React.FC<{
  className?: string;
  items?: FeatureCardItem[];
  onCardClick?: (item: FeatureCardItem) => void;
}> = ({ className, items = DEFAULT_FEATURES, onCardClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-graphite-muted dark:text-sand-400">
            Why CurbSense
          </span>
        </div>
        <span className="text-[11px] text-teal font-semibold">Smart Coimbatore Initiative</span>
      </div>

      <div className="flex items-center gap-1.5 rounded-lg border border-teal/15 bg-teal/5 px-2 py-1 text-[10px] font-semibold text-graphite-muted dark:text-sand-400">
        <Sparkles className="h-3 w-3 shrink-0 text-teal" />
        <span>Hover, tap, or keyboard-focus a card to reveal its details.</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isHovered = hoveredIndex === idx;
          const isExpanded = shouldReduceMotion || isHovered;

          return (
            <motion.button
              key={item.id}
              type="button"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(idx)}
              onBlur={() => setHoveredIndex(null)}
              onClick={() => onCardClick && onCardClick(item)}
              whileHover={shouldReduceMotion ? {} : { y: -3 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              aria-expanded={isExpanded}
              aria-label={`${item.title}. ${isExpanded ? item.description : 'Hover or focus for details.'}`}
              className="relative min-h-[84px] rounded-xl border border-sand-300 bg-sand-50 p-2.5 text-left shadow-sm transition-all hover:border-teal hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 dark:border-graphite-light dark:bg-graphite dark:focus-visible:ring-offset-graphite cursor-pointer group overflow-hidden"
            >
              {/* Subtle background gradient on hover */}
              <div
                className="absolute inset-0 bg-radial from-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sand-200 text-teal shadow-xs transition-colors group-hover:bg-teal group-hover:text-sand-50 dark:bg-graphite-light">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-sand-200/80 px-1.5 py-0.5 text-[8px] font-bold text-graphite-muted transition-colors group-hover:text-teal dark:bg-graphite-light dark:text-sand-300">
                      {item.badge}
                    </span>
                  )}
                </div>

                <h3 className="mt-2 font-serif text-[13px] font-bold leading-tight text-graphite transition-colors group-hover:text-teal dark:text-sand-100">
                  {item.title}
                </h3>
                <motion.div
                  initial={false}
                  animate={isExpanded ? { height: 'auto', opacity: 1, marginTop: 6 } : { height: 0, opacity: 0, marginTop: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden"
                >
                  <p className="text-[10px] leading-snug text-graphite-muted dark:text-sand-400">{item.description}</p>
                  <div className="mt-2 flex items-center justify-between border-t border-sand-200 pt-1.5 text-[9px] font-bold text-teal dark:border-graphite-light">
                    <span>Learn more</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default HoverFeatureCards;
