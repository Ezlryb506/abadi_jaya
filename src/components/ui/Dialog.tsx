'use client';

import React, { Fragment } from 'react';
import { Dialog as HDialog, Transition } from '@headlessui/react';
import { cn } from '@/lib/cn';

interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export interface DialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}

export function Dialog({ open, onClose, className, children }: DialogProps) {
  return (
    <Transition show={open} as={Fragment}>
      <HDialog as="div" className="relative z-50" onClose={() => onClose(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <HDialog.Panel className={cn('w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all', className)}>
                {children}
              </HDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HDialog>
    </Transition>
  );
}

export function DialogHeader({ className, children }: BaseProps) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function DialogTitle({ className, children }: BaseProps) {
  return (
    <HDialog.Title as="h3" className={cn('text-xl font-semibold text-gray-900', className)}>
      {children}
    </HDialog.Title>
  );
}

export function DialogBody({ className, children }: BaseProps) {
  return <div className={cn('text-gray-700', className)}>{children}</div>;
}

export function DialogFooter({ className, children }: BaseProps) {
  return <div className={cn('mt-6 flex items-center justify-end gap-3', className)}>{children}</div>;
}

export default Dialog;
