"use client";

import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = "Konfirmasi",
  description = "Apakah Anda yakin?",
  confirmText = "Ya, lanjut",
  cancelText = "Batal",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="px-5 py-4 border-b bg-white/95 supports-[backdrop-filter]:backdrop-blur">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="px-5 py-4 text-gray-600 text-sm">
          {description}
        </div>
        <div className="px-5 py-4 border-t flex justify-end gap-2 bg-white/95 supports-[backdrop-filter]:backdrop-blur">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              "px-4 py-2 rounded-xl text-white focus:outline-none focus:ring-2 active:scale-[0.98] transition " +
              (variant === "danger"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-300"
                : "bg-orange-600 hover:bg-orange-700 focus:ring-orange-300")
            }
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
