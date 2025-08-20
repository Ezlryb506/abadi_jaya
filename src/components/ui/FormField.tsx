import React from 'react';
import { cn } from '@/lib/cn';

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  requiredMark?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, error, helperText, requiredMark, className, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
          {label}
          {requiredMark && <span className="text-red-500"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : helperText ? (
        <p className="text-sm text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}

export default FormField;
