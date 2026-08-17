import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

interface AnimateDigitsProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  digitClassName?: string;
  decimals?: number;
}

// Single animated column for a character / digit
const DigitColumn: React.FC<{
  digit: string;
  fontSize?: number;
  className?: string;
  shouldReduceMotion: boolean | null;
}> = ({ digit, className, shouldReduceMotion }) => {
  const isNumber = !isNaN(parseInt(digit, 10));
  const numValue = isNumber ? parseInt(digit, 10) : 0;

  const spring = useSpring(numValue, {
    stiffness: 120,
    damping: 18,
    mass: 0.8,
  });

  useEffect(() => {
    spring.set(numValue);
  }, [numValue, spring]);

  const y = useTransform(spring, (latest) => `${-latest * 10}%`);

  if (!isNumber || shouldReduceMotion) {
    return <span className={cn('inline-block', className)}>{digit}</span>;
  }

  return (
    <span
      className={cn(
        'inline-flex flex-col h-[1.1em] overflow-hidden leading-none select-none relative',
        className
      )}
      style={{ verticalAlign: 'baseline' }}
    >
      <motion.span style={{ y }} className="flex flex-col">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-[1.1em] flex items-center justify-center">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
};

export const AnimateDigits: React.FC<AnimateDigitsProps> = ({
  value,
  prefix = '',
  suffix = '',
  className,
  digitClassName,
  decimals = 0,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<string>(
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()
  );

  useEffect(() => {
    setDisplayValue(decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString());
  }, [value, decimals]);

  // Split formatted string into individual characters
  const formattedString = `${prefix}${displayValue}${suffix}`;

  return (
    <span className={cn('inline-flex items-baseline font-mono font-bold tracking-tight', className)}>
      {formattedString.split('').map((char, index) => (
        <DigitColumn
          key={`${index}-${char}`}
          digit={char}
          className={digitClassName}
          shouldReduceMotion={shouldReduceMotion}
        />
      ))}
    </span>
  );
};

export default AnimateDigits;
