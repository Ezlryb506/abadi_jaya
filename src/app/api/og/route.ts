import React from 'react';
import { ImageResponse } from 'next/og';
import fs from 'fs/promises';
import path from 'path';

// Sementara gunakan Node.js runtime untuk stabilitas di dev (Turbopack kadang bermasalah dengan Edge route)
export const runtime = 'nodejs';

// Preload/cached font data (Inter Bold) untuk stabilitas Satori
// Prefer lokal: public/fonts/Inter-Bold.ttf
// Fallback: CDN TTF jika file lokal tidak ditemukan
let fontDataPromise: Promise<ArrayBuffer | null> | null = null;
async function loadInterBold(): Promise<ArrayBuffer | null> {
  if (fontDataPromise) return fontDataPromise;
  fontDataPromise = (async () => {
    try {
      // 1) Coba muat dari public/fonts (lokal) via filesystem (hindari bundling)
      const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Inter-Bold.ttf');
      const buf = await fs.readFile(fontPath);
      console.log('[OG] Loaded local font Inter-Bold.ttf');
      const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
      return ab;
    } catch (e) {
      console.warn('[OG] Failed to load local font Inter-Bold.ttf:', (e as Error)?.message || e);
    }

    try {
      // 2) Fallback CDN (TTF)
      // Menggunakan release Inter dari GitHub (direct content)
      const cdnUrl = 'https://github.com/rsms/inter/releases/download/v4.0/Inter-Bold.ttf';
      const res2 = await fetch(cdnUrl);
      if (res2.ok) {
        const buf2 = await res2.arrayBuffer();
        console.log('[OG] Loaded fallback font from CDN (Inter-Bold)');
        return buf2;
      }
      console.warn('[OG] CDN font fetch failed, status:', res2.status);
    } catch (e) {
      console.warn('[OG] Failed to fetch CDN font:', (e as Error)?.message || e);
    }

    console.warn('[OG] Proceeding without explicit font. Satori may fail on some environments.');
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
            backgroundColor: '#ffedd5', // bg solid, aman untuk Satori
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial',
            position: 'relative',
          },
        },
        // Badge sederhana (tanpa emoji)
        React.createElement(
          'div',
          {
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 14px',
              borderRadius: 999,
              backgroundColor: 'rgba(251,146,60,0.15)',
              color: '#9a3412',
              fontSize: 24,
              marginBottom: 24,
              fontWeight: 700,
            },
          },
          'Abadi Jaya'
        ),

        // Title block
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '0 60px',
            },
          },
          React.createElement(
            'div',
            {
              style: {
                fontSize: 72,
                fontWeight: 900,
                lineHeight: 1.1,
                color: '#ea580c', // oranye solid
              },
            },
            title
          ),
          React.createElement(
            'div',
            {
              style: {
                marginTop: 20,
                fontSize: 30,
                color: '#374151',
                fontWeight: 600,
              },
            },
            subtitle
          )
        ),

        // Footer
        React.createElement(
          'div',
          {
            style: {
              position: 'absolute',
              bottom: 32,
              left: 48,
              right: 48,
              display: 'flex',
              justifyContent: 'space-between',
              color: '#92400e',
              fontSize: 22,
              fontWeight: 600,
            },
          },
          React.createElement('span', null, 'abadi-jaya'),
          React.createElement('span', null, 'Jasa Las • Pagar • Kanopi • Railing')
        )
      ),
      {
        width: 1200,
        height: 630,
        // Pass fonts jika tersedia
        ...(interBold
          ? {
              fonts: [
                {
                  name: 'Inter',
                  data: interBold,
                  weight: 700,
                  style: 'normal',
                },
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


