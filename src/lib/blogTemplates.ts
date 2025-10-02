import { areaAll } from './areaLayanan';

export interface BlogTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  keywords: string[];
  category: string;
  readTime: string;
  image: string;
  slug: string; // Format: harga-[service]-[area]-2025
}

// Template untuk artikel harga berdasarkan area dan layanan
export const blogTemplates: Record<string, BlogTemplate> = {
  'harga-pagar-minimalis': {
    id: 'harga-pagar-minimalis',
    title: 'Harga Pagar Minimalis di {area} 2025 — Estimasi & Tips',
    description: 'Panduan lengkap harga pagar minimalis di {area}. Estimasi biaya, tips memilih material, dan rekomendasi bengkel las terpercaya.',
    content: `
# Harga Pagar Minimalis di {area} 2025 — Estimasi & Tips

Pagar minimalis menjadi pilihan populer untuk rumah modern di {area}. Dengan desain yang clean dan elegan, pagar minimalis memberikan kesan modern sekaligus keamanan yang optimal.

## Estimasi Harga Pagar Minimalis di {area}

### Tabel Harga per Meter
| Material | Ketebalan | Harga per Meter | Keterangan |
|----------|-----------|-----------------|------------|
| Besi Hollow Galvanis | 1.2mm | Rp 350.000 | Standar, tahan karat |
| Besi Hollow Galvanis | 1.5mm | Rp 450.000 | Lebih kuat, premium |
| Stainless Steel 304 | 1.0mm | Rp 650.000 | Anti karat, premium |
| Stainless Steel 316 | 1.0mm | Rp 750.000 | Super anti karat |

### Faktor yang Mempengaruhi Harga
1. **Material** - Besi hollow vs stainless steel
2. **Desain** - Sederhana vs custom
3. **Finishing** - Powder coating vs chrome
4. **Lokasi** - Akses mudah vs terpencil

## Tips Memilih Bengkel Las di {area}

- Survey gratis untuk estimasi akurat
- Garansi pengerjaan minimal 1 tahun
- Portfolio dan testimoni pelanggan
- Harga transparan tanpa biaya tersembunyi

## Konsultasi Gratis

Tim Abadi Jaya siap membantu proyek pagar minimalis Anda di {area} dengan survey gratis dan estimasi harga yang akurat.
    `,
    keywords: ['harga pagar minimalis {area}', 'bengkel las {area}', 'jasa pagar besi {area}'],
    category: 'Estimasi Harga',
    readTime: '8 min read',
    image: '/images/blog/pagar-minimalis-{area}.jpg',
    slug: 'harga-pagar-minimalis-{area}-2025'
  },
  'harga-kanopi': {
    id: 'harga-kanopi',
    title: 'Harga Kanopi di {area} 2025 — Carport & Teras',
    description: 'Panduan lengkap harga kanopi di {area}. Estimasi biaya carport, teras, dan kanopi minimalis dengan material berkualitas.',
    content: `
# Harga Kanopi di {area} 2025 — Carport & Teras

Kanopi menjadi solusi praktis untuk melindungi kendaraan dan area outdoor di {area}. Berikut panduan lengkap estimasi harga kanopi.

## Estimasi Harga Kanopi di {area}

### Tabel Harga per Meter Persegi
| Jenis Kanopi | Material | Harga per m² | Keterangan |
|--------------|----------|--------------|------------|
| Kanopi Carport | Baja Ringan + Polycarbonate | Rp 450.000 | Standar, tahan cuaca |
| Kanopi Teras | Baja Ringan + Spandek | Rp 400.000 | Ekonomis, awet |
| Kanopi Minimalis | Stainless + Kaca | Rp 800.000 | Premium, elegan |
| Kanopi Custom | Baja Ringan + Atap | Rp 500.000 | Sesuai desain |

### Jenis Kanopi Populer di {area}
1. **Kanopi Carport** - Untuk melindungi kendaraan
2. **Kanopi Teras** - Area santai keluarga
3. **Kanopi Minimalis** - Desain modern elegan
4. **Kanopi Custom** - Sesuai kebutuhan khusus

## Tips Memilih Kanopi

- Pilih material sesuai budget dan kebutuhan
- Pertimbangkan arah angin dan sinar matahari
- Pastikan struktur kuat dan tahan lama
- Konsultasi dengan ahli untuk desain optimal

## Konsultasi Gratis

Dapatkan estimasi harga kanopi yang akurat untuk proyek Anda di {area} dengan survey gratis dari tim Abadi Jaya.
    `,
    keywords: ['harga kanopi {area}', 'kanopi carport {area}', 'jasa kanopi {area}'],
    category: 'Estimasi Harga',
    readTime: '7 min read',
    image: '/images/blog/kanopi-{area}.jpg',
    slug: 'harga-kanopi-{area}-2025'
  },
  'harga-railing-tangga': {
    id: 'harga-railing-tangga',
    title: 'Harga Railing Tangga di {area} 2025 — Stainless & Besi',
    description: 'Panduan lengkap harga railing tangga di {area}. Estimasi biaya stainless steel, besi, dan tips memilih desain yang tepat.',
    content: `
# Harga Railing Tangga di {area} 2025 — Stainless & Besi

Railing tangga tidak hanya berfungsi sebagai pengaman, tetapi juga elemen estetika yang mempercantik interior rumah di {area}.

## Estimasi Harga Railing Tangga di {area}

### Tabel Harga per Meter
| Material | Desain | Harga per Meter | Keterangan |
|----------|--------|-----------------|------------|
| Besi Hollow | Sederhana | Rp 250.000 | Standar, ekonomis |
| Besi Hollow | Custom | Rp 350.000 | Desain khusus |
| Stainless Steel 304 | Minimalis | Rp 450.000 | Anti karat, premium |
| Stainless Steel 316 | Luxury | Rp 650.000 | Marine grade |

### Jenis Railing Populer di {area}
1. **Railing Minimalis** - Desain clean dan modern
2. **Railing Custom** - Sesuai konsep rumah
3. **Railing Stainless** - Tahan lama, mudah perawatan
4. **Railing Besi** - Ekonomis, bisa dicat ulang

## Tips Memilih Railing Tangga

- Sesuaikan dengan konsep interior rumah
- Pilih material yang mudah perawatan
- Pastikan ketinggian sesuai standar keamanan
- Konsultasi untuk desain yang optimal

## Konsultasi Gratis

Tim Abadi Jaya siap membantu desain dan pemasangan railing tangga di {area} dengan kualitas terbaik.
    `,
    keywords: ['harga railing tangga {area}', 'railing stainless {area}', 'jasa railing {area}'],
    category: 'Estimasi Harga',
    readTime: '6 min read',
    image: '/images/blog/railing-tangga-{area}.jpg',
    slug: 'harga-railing-tangga-{area}-2025'
  },
  'tips-memilih-bengkel-las': {
    id: 'tips-memilih-bengkel-las',
    title: 'Tips Memilih Bengkel Las Terpercaya di {area}',
    description: 'Panduan lengkap memilih bengkel las terpercaya di {area}. Kriteria penting, red flags, dan tips mendapatkan hasil terbaik.',
    content: `
# Tips Memilih Bengkel Las Terpercaya di {area}

Memilih bengkel las yang tepat sangat penting untuk memastikan proyek Anda berhasil dengan kualitas terbaik di {area}.

## Kriteria Bengkel Las Terpercaya

### 1. Survey Gratis
- Bengkel terpercaya menyediakan survey gratis
- Estimasi harga detail dan transparan
- Analisis kondisi lokasi proyek

### 2. Garansi Pengerjaan
- Minimal 1 tahun garansi pengerjaan
- Garansi material dan finishing
- Layanan purna jual yang baik

### 3. Portfolio & Testimoni
- Lihat hasil proyek sebelumnya
- Baca testimoni pelanggan
- Cek rating dan review online

### 4. Harga Transparan
- Estimasi detail tanpa biaya tersembunyi
- Penjelasan material yang digunakan
- Breakdown biaya yang jelas

## Red Flags yang Harus Dihindari

- Tidak ada survey gratis
- Harga terlalu murah tanpa penjelasan
- Tidak ada garansi pengerjaan
- Portfolio terbatas atau tidak ada
- Komunikasi tidak responsif

## Tips Mendapatkan Hasil Terbaik

1. **Komunikasi yang Jelas** - Sampaikan kebutuhan dengan detail
2. **Konsultasi Desain** - Minta saran untuk desain optimal
3. **Material Berkualitas** - Pastikan material sesuai standar
4. **Tim Profesional** - Pilih bengkel dengan tim berpengalaman

## Konsultasi Gratis

Tim Abadi Jaya siap membantu proyek las dan fabrikasi besi Anda di {area} dengan kualitas terjamin.
    `,
    keywords: ['bengkel las terpercaya {area}', 'tips memilih bengkel las {area}', 'jasa las {area}'],
    category: 'Tips & Panduan',
    readTime: '8 min read',
    image: '/images/blog/tips-bengkel-las-{area}.jpg',
    slug: 'tips-memilih-bengkel-las-{area}-2025'
  }
};

// Fungsi untuk generate blog berdasarkan area dan template
export function generateBlogData(area: string, templateId: string): BlogTemplate {
  const template = blogTemplates[templateId];
  if (!template) {
    throw new Error(`Template ${templateId} tidak ditemukan`);
  }

  return {
    ...template,
    title: template.title.replace(/{area}/g, area),
    description: template.description.replace(/{area}/g, area),
    content: template.content.replace(/{area}/g, area),
    keywords: template.keywords.map(keyword => keyword.replace(/{area}/g, area)),
    image: template.image.replace(/{area}/g, area.toLowerCase().replace(/\s+/g, '-')),
    slug: template.slug.replace(/{area}/g, area.toLowerCase().replace(/\s+/g, '-'))
  };
}

// Fungsi untuk generate slug dari area dan template
export function generateBlogSlug(area: string, templateId: string): string {
  const template = blogTemplates[templateId];
  if (!template) {
    throw new Error(`Template ${templateId} tidak ditemukan`);
  }
  
  return template.slug.replace(/{area}/g, area.toLowerCase().replace(/\s+/g, '-'));
}

// Fungsi untuk parse slug menjadi area dan template
export function parseBlogSlug(slug: string): { area: string; templateId: string } | null {
  // Format: harga-[service]-[area]-2025
  const match = slug.match(/^harga-([^-]+)-([^-]+)-2025$/);
  if (!match) return null;
  
  const [, service, area] = match;
  const templateId = `harga-${service}`;
  
  // Validasi template dan area
  if (!blogTemplates[templateId]) return null;
  if (!areaAll.find(a => a.toLowerCase().replace(/\s+/g, '-') === area)) return null;
  
  return { 
    area: area.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    templateId 
  };
}

// Fungsi untuk mendapatkan semua kombinasi area dan template
export function getAllBlogCombinations(): Array<{area: string, templateId: string}> {
  const combinations: Array<{area: string, templateId: string}> = [];
  
  // Area prioritas untuk blog (10 area teratas)
  const priorityAreas = areaAll.slice(0, 10);
  
  for (const area of priorityAreas) {
    for (const templateId of Object.keys(blogTemplates)) {
      combinations.push({ area, templateId });
    }
  }
  
  return combinations;
}

// Fungsi untuk mendapatkan template berdasarkan kategori
export function getTemplatesByCategory(category: string): BlogTemplate[] {
  return Object.values(blogTemplates).filter(template => 
    template.category.toLowerCase() === category.toLowerCase()
  );
}
