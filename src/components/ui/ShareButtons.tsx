"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

type ShareButtonsProps = {
  url: string; // absolute or relative
  title?: string;
  className?: string;
};

export default function ShareButtons({ url, title = "Bagikan", className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const absoluteUrl = useMemo(() => {
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL;
      if (site) return new URL(url, site).toString();
      // Best-effort when no env: if running in browser, build from location
      if (typeof window !== "undefined") return new URL(url, window.location.origin).toString();
    } catch {/* noop */}
    return url;
  }, [url]);

  useEffect(() => {
    let t: number | undefined;
    if (copied) {
      t = window.setTimeout(() => setCopied(false), 1600);
    }
    return () => { if (t) window.clearTimeout(t); };
  }, [copied]);

  const handleShare = useCallback(async () => {
    try {
      if (canNativeShare) {
        await navigator.share({ title, url: absoluteUrl });
        return;
      }
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
    } catch {
      // silent fallback to clipboard
      try {
        await navigator.clipboard.writeText(absoluteUrl);
        setCopied(true);
      } catch {
        // noop: suppress in production
      }
    }
  }, [canNativeShare, absoluteUrl, title]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
    } catch {
      // noop: suppress in production
    }
  }, [absoluteUrl]);

  const waHref = useMemo(() => {
    const text = `Saya ingin bertanya tentang: ${title ?? "Produk"} - ${absoluteUrl}`;
    return `https://wa.me/6289653754317?text=${encodeURIComponent(text)}`;
  }, [absoluteUrl, title]);

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={handleShare}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow hover:from-orange-600 hover:to-orange-700 transition"
        >
          📤 Bagikan
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 rounded-lg border border-orange-500 text-orange-600 hover:bg-orange-50 transition"
        >
          📋 Salin Link
        </button>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
        >
          💬 WhatsApp
        </a>
      </div>

      {/* toast */}
      <div
        aria-live="polite"
        className={`fixed z-50 bottom-6 left-1/2 -translate-x-1/2 transition-all duration-300 ${
          copied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="px-4 py-2 rounded-full bg-black/80 text-white text-sm shadow-lg backdrop-blur">
          Link disalin ke clipboard
        </div>
      </div>
    </div>
  );
}
