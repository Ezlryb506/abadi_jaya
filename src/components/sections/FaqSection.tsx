export default function FaqSection() {
  const faqs = [
    {
      q: 'Apakah bisa konsultasi dan survei dahulu?',
      a: 'Bisa. Kami menyediakan konsultasi gratis via WhatsApp dan dapat menjadwalkan survei lokasi sesuai kebutuhan Anda.'
    },
    {
      q: 'Bagaimana sistem pembayaran (DP/termin)?',
      a: 'Umumnya menggunakan DP di awal dan pelunasan setelah pekerjaan selesai/terverifikasi. Skema termin bisa disesuaikan proyek.'
    },
    {
      q: 'Berapa lama waktu pengerjaan?',
      a: 'Durasi tergantung jenis dan skala pekerjaan. Setelah survei, kami kirim estimasi waktu yang jelas dan terukur.'
    },
    {
      q: 'Apakah ada garansi?',
      a: 'Ada. Kami memberikan garansi pengerjaan sesuai ketentuan pada invoice/kontrak.'
    },
    {
      q: 'Apakah menerima desain custom?',
      a: 'Tentu. Anda dapat membawa referensi, dan tim kami akan membantu menyesuaikan material, ukuran, serta budget.'
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
