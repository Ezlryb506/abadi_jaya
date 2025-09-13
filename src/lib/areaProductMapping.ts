import { areaAll } from './areaLayanan';

// Mapping area ke produk berdasarkan kategori dan karakteristik
export const areaProductMapping: Record<string, string[]> = {
  // Wilayah Inti - semua produk tersedia
  'Cibitung': areaAll,
  'Kota Bekasi': areaAll,
  'Kabupaten Bekasi': areaAll,
  'Cikarang': areaAll,
  'Tambun': areaAll,
  'Setu': areaAll,
  
  // Cikarang & Sekitar - fokus pada produk komersial
  'Cikarang Barat': ['Pagar', 'Kanopi', 'Railing', 'Pintu Besi', 'Stainless'],
  'Cikarang Selatan': ['Pagar', 'Kanopi', 'Railing', 'Pintu Besi', 'Stainless'],
  'Cikarang Utara': ['Pagar', 'Kanopi', 'Railing', 'Pintu Besi', 'Stainless'],
  
  // Tambun & Sekitar - fokus pada produk residensial
  'Tambun Selatan': ['Pagar', 'Kanopi', 'Railing', 'Jendela', 'Teralis', 'Minimalis'],
  'Tambun Utara': ['Pagar', 'Kanopi', 'Railing', 'Jendela', 'Teralis', 'Minimalis'],
  
  // Kabupaten Bekasi Lainnya - produk standar
  'Babelan': ['Pagar', 'Kanopi', 'Railing'],
  'Tarumajaya': ['Pagar', 'Kanopi', 'Railing'],
  'Karangbahagia': ['Pagar', 'Kanopi', 'Railing'],
  'Tambelang': ['Pagar', 'Kanopi', 'Railing'],
  'Sukatani': ['Pagar', 'Kanopi', 'Railing'],
  'Sukakarya': ['Pagar', 'Kanopi', 'Railing'],
  'Pebayuran': ['Pagar', 'Kanopi', 'Railing'],
  'Kedungwaringin': ['Pagar', 'Kanopi', 'Railing'],
  'Serang Baru': ['Pagar', 'Kanopi', 'Railing'],
  'Bojongmangu': ['Pagar', 'Kanopi', 'Railing'],
  'Cabangbungin': ['Pagar', 'Kanopi', 'Railing'],
};

// Fungsi untuk mendapatkan area yang melayani produk tertentu
export function getAreasForProduct(categoryName: string): string[] {
  const areas: string[] = [];
  
  for (const [area, categories] of Object.entries(areaProductMapping)) {
    if (categories.includes(categoryName)) {
      areas.push(area);
    }
  }
  
  return areas;
}

// Fungsi untuk mendapatkan produk yang tersedia di area tertentu
export function getProductsForArea(areaName: string): string[] {
  return areaProductMapping[areaName] || [];
}

// Fungsi untuk mendapatkan area yang paling relevan untuk produk
export function getRelevantAreasForProduct(categoryName: string, limit: number = 5): string[] {
  const areas = getAreasForProduct(categoryName);
  
  // Prioritas area berdasarkan tingkat layanan
  const priorityAreas = [
    'Cibitung', 'Kota Bekasi', 'Cikarang', 'Tambun', 'Setu',
    'Cikarang Barat', 'Cikarang Selatan', 'Cikarang Utara',
    'Tambun Selatan', 'Tambun Utara'
  ];
  
  // Urutkan berdasarkan prioritas
  const sortedAreas = areas.sort((a, b) => {
    const aIndex = priorityAreas.indexOf(a);
    const bIndex = priorityAreas.indexOf(b);
    
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });
  
  return sortedAreas.slice(0, limit);
}

// Fungsi untuk mendapatkan long-tail keywords berdasarkan area dan kategori
export function getLongTailKeywords(areaName: string, categoryName: string): string[] {
  const baseKeywords = [
    `${categoryName.toLowerCase()} di ${areaName}`,
    `jasa ${categoryName.toLowerCase()} ${areaName}`,
    `harga ${categoryName.toLowerCase()} ${areaName}`,
    `bengkel las ${categoryName.toLowerCase()} ${areaName}`,
    `kontraktor ${categoryName.toLowerCase()} ${areaName}`,
    `pemasangan ${categoryName.toLowerCase()} ${areaName}`,
    `kustom ${categoryName.toLowerCase()} ${areaName}`,
    `modern ${categoryName.toLowerCase()} ${areaName}`,
    `minimalis ${categoryName.toLowerCase()} ${areaName}`,
  ];
  
  // Tambahkan keywords spesifik berdasarkan area
  const areaSpecificKeywords: Record<string, string[]> = {
    'Cibitung': ['industri', 'komersial', 'pabrik'],
    'Cikarang': ['industri', 'komersial', 'pabrik', 'kawasan industri'],
    'Tambun': ['residensial', 'rumah', 'perumahan'],
    'Kota Bekasi': ['perkotaan', 'modern', 'minimalis'],
    'Kabupaten Bekasi': ['pedesaan', 'tradisional', 'klasik'],
  };
  
  const specificKeywords = areaSpecificKeywords[areaName] || [];
  const areaKeywords = specificKeywords.map(keyword => 
    `${categoryName.toLowerCase()} ${keyword} ${areaName}`
  );
  
  return [...baseKeywords, ...areaKeywords];
}
