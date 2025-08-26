"use client";

import { useEffect } from 'react';

export default function PrevNextHead({
  page,
  pageCount,
  category,
  q,
}: {
  page: number;
  pageCount: number;
  category?: string;
  q?: string;
}) {
  useEffect(() => {
    // Helper to set/update <link rel="...">
    const upsertLink = (rel: string, href?: string) => {
      // remove existing first
      const existing = document.head.querySelector(`link[rel="${rel}"]`);
      if (existing && (!href || href === '#')) {
        existing.parentElement?.removeChild(existing);
        return;
      }
      if (!href || href === '#') return;
      let el = existing as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
    };

    const cat = category && category !== 'Semua' ? `&category=${encodeURIComponent(category)}` : '';
    const qq = q ? `&q=${encodeURIComponent(q)}` : '';
    const prevHref = page > 2
      ? `/catalog?page=${page - 1}${cat}${qq}`
      : page === 2
        ? `/catalog${cat || qq ? `?${[cat.replace(/^&/, ''), qq.replace(/^&/, '')].filter(Boolean).join('&')}` : ''}`
        : undefined;
    const nextHref = page < pageCount ? `/catalog?page=${page + 1}${cat}${qq}` : undefined;

    upsertLink('prev', prevHref);
    upsertLink('next', nextHref);

    return () => {
      // optional cleanup: remove prev/next to avoid leaking between route transitions
      const prev = document.head.querySelector('link[rel="prev"]');
      const next = document.head.querySelector('link[rel="next"]');
      prev?.parentElement?.removeChild(prev);
      next?.parentElement?.removeChild(next);
    };
  }, [page, pageCount, category, q]);

  return null;
}
