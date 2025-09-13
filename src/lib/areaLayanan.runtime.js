// Runtime-only mirror of src/lib/areaLayanan.ts for Node (next-sitemap)
// Keep this in sync when updating area groups in the TS file.

/** @type {{ title: string; items: string[]; icon: string; gradient: string }[]} */
const areaGroups = [
  {
    title: 'Wilayah Inti',
    items: [
      'Cibitung',
      'Kota Bekasi',
      'Kabupaten Bekasi',
      'Cikarang',
      'Tambun',
      'Setu',
    ],
    icon: '✔️',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    title: 'Cikarang & Sekitar',
    items: ['Cikarang Barat', 'Cikarang Selatan', 'Cikarang Utara'],
    icon: '✔️',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    title: 'Tambun & Sekitar',
    items: ['Tambun Selatan', 'Tambun Utara'],
    icon: '✔️',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Kabupaten Bekasi Lainnya',
    items: [
      'Babelan',
      'Tarumajaya',
      'Karangbahagia',
      'Tambelang',
      'Sukatani',
      'Sukakarya',
      'Pebayuran',
      'Kedungwaringin',
      'Serang Baru',
      'Bojongmangu',
      'Cabangbungin',
    ],
    icon: '✔️',
    gradient: 'from-blue-500 to-indigo-500',
  },
];

/** @type {string[]} */
const areaAll = Array.from(new Set(areaGroups.flatMap((g) => g.items)));

module.exports = { areaAll, areaGroups };
