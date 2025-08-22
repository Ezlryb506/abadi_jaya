/****************************************************
 * next-sitemap configuration
 * - siteUrl: fallback ke localhost saat env kosong
 * - generateRobotsTxt: true
 * - transform: prioritas default
 ****************************************************/

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/admin-dashboard', '/api/*'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      // Saat dev (localhost), kita tetap generate robots.txt tapi crawler real tidak akan mengindeks localhost.
    ],
    additionalSitemaps: [
      // Tambahkan sitemap tambahan jika ada (mis. blog) nanti.
    ],
  },
};
