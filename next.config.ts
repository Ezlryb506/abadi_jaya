import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url ? new URL(url).hostname : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  images: {
    // Enable modern output formats and fine-tune responsive sizes & cache TTL
    formats: ['image/avif', 'image/webp'],
    // Reasonable device sizes for our layout breakpoints
    deviceSizes: [360, 640, 768, 1024, 1280],
    // Keep optimized images cached longer on the CDN (in seconds)
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  async redirects() {
    return [
      {
        source: '/customer-login',
        destination: '/login?tab=customer',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
