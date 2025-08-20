'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, helperText, ...props }, ref) => {
    return (
      <div className={cn('space-y-1', className)}>
        <div className={cn('relative')}>
          {leftIcon && (
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all',
              !!leftIcon && 'pl-10',
              !!rightIcon && 'pr-10',
              error ? 'border-red-400' : 'border-gray-300',
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
