import React from 'react';
import { cn } from '@/lib/cn';

interface SpinnerProps {
  className?: string;
  size?: number; // px
}

export function Spinner({ className, size = 16 }: SpinnerProps) {
  const style = { width: size, height: size } as React.CSSProperties;
  return (
    <span
      className={cn('inline-block border-2 border-current border-t-transparent rounded-full animate-spin', className)}
      style={style}
      aria-label="Loading"
    />
  );
}

export default Spinner;
