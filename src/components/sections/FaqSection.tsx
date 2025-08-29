export default function FaqSection() {
  const faqs = [
    {
      q: 'Apakah bisa konsultasi dan survei dahulu?',
      a: 'Bisa. Konsultasi gratis via WhatsApp. Kami juga dapat menjadwalkan survei lokasi sesuai kebutuhan.'
    },
    {
      q: 'Bagaimana sistem pembayaran (DP/termin)?',
      a: 'Umumnya DP di awal, pelunasan setelah pekerjaan selesai/terverifikasi. Skema termin fleksibel sesuai proyek.'
    },
    {
      q: 'Berapa lama waktu pengerjaan?',
      a: 'Bergantung jenis dan skala pekerjaan. Setelah survei, kami berikan estimasi waktu yang jelas.'
    },
    {
      q: 'Apakah ada garansi?',
      a: 'Ada. Garansi pengerjaan dan material sesuai ketentuan pada invoice/kontrak.'
    },
    {
      q: 'Apakah menerima desain custom?',
      a: 'Tentu. Bawa referensi Anda, kami bantu pilih material, ukuran, dan finishing sesuai anggaran.'
    }
    ,
    {
      q: 'Apakah kustomisasi/desain berbayar?',
      a: 'Tidak. Kustomisasi gratis untuk penyesuaian ukuran, warna, bahan, dan penempatan logo. Biaya hanya mengikuti perubahan material/komponen yang disepakati.'
    },
    {
      q: 'Mengapa harga di katalog bisa berbeda saat konsultasi?',
      a: 'Harga di katalog bersifat estimasi dan tidak diperbarui harian karena fluktuasi bahan. Kami akan mengonfirmasi estimasi terbaru setelah konsultasi sebelum produksi dimulai.'
    },
    {
      q: 'Mengapa ada beberapa gambar terlihat seperti hasil AI?',
      a: 'Sebagian gambar adalah ilustrasi AI sebagai contoh visual. Hasil akhir akan mengikuti brief dan referensi Anda; kami pastikan produk nyata sesuai spesifikasi yang disepakati.'
    }
  ];

  return (
    <section aria-labelledby="faq-title" className="relative py-24 bg-gradient-to-br from-white via-orange-50 to-amber-50 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="faq-title" className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-3 text-slate-600 text-lg">Informasi singkat untuk membantu Anda memulai.</p>
        </div>

        <div className="mx-auto divide-y divide-orange-100 rounded-2xl bg-white/70 backdrop-blur-md border border-orange-100">
          {faqs.map((item, idx) => (
            <details key={idx} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4">
                <h3 className="text-left text-base md:text-lg font-semibold text-slate-800">
                  {item.q}
                </h3>
                <span
                  className="shrink-0 rounded-full border border-orange-200 p-1 text-orange-600 transition group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Masih ada pertanyaan? Hubungi kami via WhatsApp, kami siap membantu.
        </p>
      </div>
    </section>
  );
}
