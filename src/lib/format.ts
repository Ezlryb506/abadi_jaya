export const formatRupiah = (n: number | string | null | undefined): string => {
  const num = Number(n || 0);
  return `Rp${new Intl.NumberFormat('id-ID').format(num)}`;
};

export const formatTanggal = (date: string | Date, withTime = true): string => {
  if (!date) return '-';
  let d: Date;
  // Jika string timestamp tanpa offset (contoh: '2025-08-21 13:47:00' atau '2025-08-21T13:47:00' atau dengan fraksi detik),
  // anggap sebagai UTC agar bisa dikonversi ke WIB dengan benar.
  if (typeof date === 'string') {
    let s = date.trim();
    // Normalisasi: ganti spasi antara tanggal-waktu menjadi 'T'
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) s = s.replace(' ', 'T');
    // Normalisasi: offset tanpa ':' (contoh +0000 atau +0700) -> +00:00 / +07:00
    s = s.replace(/([+-])(\d{2})(\d{2})$/, (_, sign, hh, mm) => `${sign}${hh}:${mm}`);
    // Tambahkan detik jika hilang (YYYY-MM-DDTHH:mm -> tambah :00)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) s += ':00';

    const naiveMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?$/);
    if (naiveMatch) {
      const [, y, m, day, hh, mm, ss, frac] = naiveMatch;
      const ms = frac ? Math.round(Number('0.' + frac) * 1000) : 0;
      d = new Date(Date.UTC(Number(y), Number(m) - 1, Number(day), Number(hh), Number(mm), Number(ss), ms));
    } else {
      // Jika sudah punya offset/Z setelah normalisasi, serahkan ke parser native
      d = new Date(s);
    }
  } else {
    d = new Date(date);
  }
  if (isNaN(d.getTime())) return String(date);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(withTime
      ? { hour: '2-digit', minute: '2-digit', second: '2-digit' }
      : {}),
  };
  return new Intl.DateTimeFormat('id-ID', options).format(d);
};

export const hitungPembayaran = (
  estimated: number | string | null | undefined,
  payments: Array<{ payment_amount: number | string | null | undefined }> | null | undefined
) => {
  const est = Number(estimated || 0);
  const paid = Array.isArray(payments)
    ? payments.reduce((sum: number, p: { payment_amount: number | string | null | undefined }) => sum + (Number(p?.payment_amount) || 0), 0)
    : 0;
  const remaining = Math.max(0, est - paid);
  const pct = est > 0 ? Math.min(100, Math.round((paid / est) * 100)) : 0;
  return { est, paid, remaining, pct };
};

export const getStatusClass = (status?: string): string => {
  const s = (status || '').toLowerCase();
  if (s === 'completed' || s === 'selesai') return 'bg-green-100 text-green-700';
  if (s.includes('install')) return 'bg-blue-100 text-blue-700';
  if (s.includes('product') || s.includes('produksi')) return 'bg-purple-100 text-purple-700';
  if (s.includes('design') || s.includes('desain')) return 'bg-indigo-100 text-indigo-700';
  if (s.includes('survey')) return 'bg-amber-100 text-amber-700';
  return 'bg-yellow-100 text-yellow-700';
};
