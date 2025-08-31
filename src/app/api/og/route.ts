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
        console.log('[OG] Loaded CDN font Inter-Bold');
        return buf;
      }
      console.warn('[OG] CDN font fetch failed, status:', res.status);
    } catch (e) {
      console.warn('[OG] Failed to fetch CDN font:', (e as Error)?.message || e);
    }
    console.warn('[OG] Proceeding without font data');
    return null;
  })();
  return fontDataPromise;
}

// URL: /api/og?title=Judul
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('plain') === '1') {
      return new Response('OG route OK', { status: 200, headers: { 'content-type': 'text/plain' } });
    }
    // Minimal test image to isolate Satori errors
    if (searchParams.get('minimal') === '1') {
      console.log('[OG] minimal=1 branch');
      return new ImageResponse(
        React.createElement('div', {
          style: {
            height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#fff', color: '#111', fontSize: 64, fontWeight: 700,
          }
        }, 'Abadi Jaya'),
        { width: 1200, height: 630 }
      );
    }
    const title = searchParams.get('title') || 'Bengkel Las Abadi Jaya';
    const subtitle = 'Spesialis Jasa Las & Fabrikasi Besi';

    // Log untuk debugging sementara (akan dihapus setelah uji berhasil)
    console.log('[OG] Generating image with title:', title);

    // Load font bila tersedia
    const interBold = await loadInterBold();

    return new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffedd5',
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial',
            position: 'relative',
            padding: '40px',
          },
        },
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
      ),
      {
        width: 1200,
        height: 630,
        ...(interBold
          ? {
              fonts: [
                { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
              ],
            }
          : {}),
      }
    );
  } catch (err) {
    console.error('[OG] Failed to generate image:', err);
    return new Response('OG Image generation failed', { status: 500 });
  }
}


