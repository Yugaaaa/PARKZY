import React, { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from 'motion/react';
import { cn } from '../../lib/utils';

export interface DockProps {
  className?: string;
  itemsClassName?: string;
  distance?: number;
  magnification?: number;
  panelHeight?: number;
  children: React.ReactNode;
}

export interface DockItemProps {
  className?: string;
  onClick?: () => void;
  tooltip?: string;
  badge?: number | boolean;
  isActive?: boolean;
  children: React.ReactNode;
  id?: string;
}

const DockContext = React.createContext<{
  mouseX: any;
  magnification: number;
  distance: number;
  shouldReduceMotion: boolean | null;
}>({
  mouseX: null,
  magnification: 64,
  distance: 140,
  shouldReduceMotion: false,
});

export const Dock: React.FC<DockProps> = ({
  className,
  itemsClassName,
  distance = 140,
  magnification = 68,
  panelHeight = 56,
  children,
}) => {
  const mouseX = useMotionValue(Infinity);
  const shouldReduceMotion = useReducedMotion();

  return (
    <DockContext.Provider value={{ mouseX, magnification, distance, shouldReduceMotion }}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        style={{ height: panelHeight }}
        className={cn(
          'flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-sand-50/90 dark:bg-graphite/90 backdrop-blur-xl border border-sand-300 dark:border-graphite-light shadow-2xl shadow-graphite/10 dark:shadow-black/30',
          className
        )}
      >
        <div className={cn('flex items-center gap-2', itemsClassName)}>{children}</div>
      </motion.div>
    </DockContext.Provider>
  );
};

export const DockItem: React.FC<DockItemProps> = ({
  className,
  onClick,
  tooltip,
  badge,
  isActive,
  children,
  id,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const { mouseX, magnification, distance, shouldReduceMotion } = React.useContext(DockContext);
  const [isHovered, setIsHovered] = useState(false);

  const defaultSize = 42;

  const distanceCalc = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: defaultSize };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [defaultSize, magnification, defaultSize]
  );

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const animatedWidth = shouldReduceMotion ? defaultSize : width;

  return (
    <div className="relative flex items-center justify-center">
      {/* Tooltip Label */}
      <AnimatePresence>
        {isHovered && tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute top-0 px-2.5 py-1 rounded-lg bg-graphite dark:bg-sand-50 text-sand-50 dark:text-graphite text-[10px] font-bold tracking-wide whitespace-nowrap shadow-lg pointer-events-none z-50 border border-sand-300/20"
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={ref}
        id={id}
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ width: animatedWidth, height: animatedWidth }}
        className={cn(
          'relative flex items-center justify-center rounded-xl transition-colors cursor-pointer',
          isActive
            ? 'bg-teal text-sand-50 shadow-md font-bold'
            : 'bg-sand-200/80 dark:bg-graphite-light/70 text-graphite-muted dark:text-sand-400 hover:text-teal dark:hover:text-teal hover:bg-sand-300 dark:hover:bg-graphite-light',
          className
        )}
      >
        <div className="flex items-center justify-center pointer-events-none">{children}</div>

        {/* Live Badge / Dot */}
        {badge && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-clay opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-clay" />
          </span>
        )}
      </motion.button>
    </div>
  );
};

export const DockSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'w-[1px] h-6 bg-sand-300 dark:bg-graphite-light mx-0.5 self-center',
      className
    )}
  />
);

export const DockIcon: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn('flex items-center justify-center', className)}>{children}</div>;

export const DockLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <span className={cn('text-xs font-semibold select-none text-center', className)}>
    {children}
  </span>
);

export default Dock;
