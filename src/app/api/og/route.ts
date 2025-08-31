import React from 'react';
import { ImageResponse } from 'next/og';

// Gunakan Edge runtime untuk kompatibilitas produksi Vercel
export const runtime = 'edge';

// Cache font data dari CDN untuk Edge runtime
let fontDataPromise: Promise<ArrayBuffer | null> | null = null;
async function loadInterBold(): Promise<ArrayBuffer | null> {
  if (fontDataPromise) return fontDataPromise;
  fontDataPromise = (async () => {
    try {
      const cdnUrl = 'https://cdn.jsdelivr.net/gh/rsms/inter@4.0/ttf/Inter-Bold.ttf';
      const res = await fetch(cdnUrl, { cache: 'force-cache' });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        return buf;
      }
    } catch {}
    return null;
  })();
  return fontDataPromise;
}

// URL: /api/og?title=Judul
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Bengkel Las Abadi Jaya';
    const subtitle = 'Spesialis Jasa Las & Fabrikasi Besi';
    const variant = (searchParams.get('variant') || 'default').toLowerCase();
    const categoryParam = searchParams.get('category') || '';
    const priceParam = searchParams.get('price') || '';
    const badgeParam = searchParams.get('badge') || '';

    // Load font bila tersedia
    const interBold = await loadInterBold();

    // Dev-only debug log (avoid noisy logs in production)
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      try {
        console.info('[OG] render', { variant, title, categoryParam, priceParam, badgeParam });
      } catch {}
    }

    // Compose content by variant
    const baseWrapper = {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fde68a 100%)',
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial',
      position: 'relative' as const,
      padding: '48px',
    };

    let content: React.ReactElement;

    if (variant === 'category') {
      const cat = (categoryParam || title).toString();
      content = React.createElement(
        'div',
        { style: baseWrapper },
        // Ribbon angle
        React.createElement('div', {
          style: {
            position: 'absolute',
            top: '-40px',
            right: '-120px',
            transform: 'rotate(25deg)',
            backgroundColor: '#f59e0b',
            width: '420px',
            height: '120px',
            opacity: 0.15,
            borderRadius: '24px',
          }
        }),
        React.createElement(
          'div',
          {
            style: {
              fontSize: 86,
              fontWeight: 900,
              lineHeight: 1.1,
              color: '#b45309',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              maxWidth: '1080px',
            },
          },
          cat
        ),
        React.createElement(
          'div',
          {
            style: {
              marginTop: '18px',
              fontSize: 32,
              color: '#6b7280',
              fontWeight: 700,
              textAlign: 'center',
            },
          },
          'Katalog Abadi Jaya'
        ),
        React.createElement(
          'div',
          {
            style: {
              position: 'absolute',
              bottom: '28px',
              left: '48px',
              right: '48px',
              display: 'flex',
              justifyContent: 'space-between',
              color: '#92400e',
              fontSize: 22,
              fontWeight: 700,
            },
          },
          React.createElement('span', null, 'abadi-jaya'),
          React.createElement('span', null, 'Pagar • Kanopi • Railing • Stainless')
        )
      );
    } else if (variant === 'product') {
      const name = (title || 'Produk').toString();
      const cat = categoryParam || '';
      const price = priceParam || '';
      const badge = badgeParam || '';
      content = React.createElement(
        'div',
        { style: baseWrapper },
        // Title
        React.createElement(
          'div',
          {
            style: {
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#0f172a',
              textAlign: 'center',
              maxWidth: '1040px',
              letterSpacing: '-0.02em',
            },
          },
          name
        ),
        // Category line
        (cat
          ? React.createElement(
              'div',
              {
                style: {
                  marginTop: '14px',
                  fontSize: 30,
                  color: '#334155',
                  fontWeight: 700,
                },
              },
              `Kategori: ${cat}`
            )
          : null),
        // Chips bottom-right
        React.createElement(
          'div',
          {
            style: {
              position: 'absolute',
              bottom: '32px',
              right: '48px',
              display: 'flex',
              gap: '12px',
            },
          },
          price
            ? React.createElement(
                'div',
                {
                  style: {
                    padding: '10px 16px',
                    backgroundColor: '#059669',
                    color: '#ecfdf5',
                    borderRadius: '9999px',
                    fontSize: 24,
                    fontWeight: 800,
                  },
                },
                price
              )
            : null,
          badge
            ? React.createElement(
                'div',
                {
                  style: {
                    padding: '10px 16px',
                    backgroundColor: '#f59e0b',
                    color: '#111827',
                    borderRadius: '9999px',
                    fontSize: 22,
                    fontWeight: 800,
                  },
                },
                badge
              )
            : null
        ),
        // Footer left
        React.createElement(
          'div',
          {
            style: {
              position: 'absolute',
              bottom: '32px',
              left: '48px',
              color: '#92400e',
              fontSize: 22,
              fontWeight: 700,
            },
          },
          'abadi-jaya'
        )
      );
    } else {
      // default (site wide)
      content = React.createElement(
        'div',
        { style: baseWrapper },
        React.createElement(
          'div',
          {
            style: {
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.2,
              color: '#ea580c',
              textAlign: 'center',
              maxWidth: '1000px',
            },
          },
          title
        ),
        React.createElement(
          'div',
          {
            style: {
              marginTop: '16px',
              fontSize: 28,
              color: '#374151',
              fontWeight: 600,
              textAlign: 'center',
              maxWidth: '1000px',
            },
          },
          subtitle
        ),
        React.createElement(
          'div',
          {
            style: {
              position: 'absolute',
              bottom: '24px',
              left: '40px',
              right: '40px',
              display: 'flex',
              justifyContent: 'space-between',
              color: '#92400e',
              fontSize: 20,
              fontWeight: 600,
            },
          },
          React.createElement('span', null, 'abadi-jaya'),
          React.createElement('span', null, 'Jasa Las - Pagar - Kanopi - Railing')
        )
      );
    }

    return new ImageResponse(content, {
      width: 1200,
      height: 630,
      ...(interBold
        ? {
            fonts: [
              { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
            ],
          }
        : {}),
    });
  } catch (err) {
    console.error('[OG] Failed to generate image:', err);
    return new Response('OG Image generation failed', { status: 500 });
  }
}


