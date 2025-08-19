// src/components/user-dashboard/FaqSection.tsx
'use client';

import { useState } from 'react';

const faqData = [
  {
    question: "Bagaimana cara melakukan pemesanan?",
    answer: "Anda dapat melakukan pemesanan melalui form 'Pesan Baru' di dashboard, atau langsung menghubungi kami melalui WhatsApp untuk konsultasi lebih lanjut."
  },
  {
    question: "Bagaimana cara melacak status proyek saya?",
    answer: "Status proyek Anda dapat dilihat di bagian 'Pesanan Saya'. Kami akan selalu memperbarui progress proyek secara berkala di sana."
  },
  {
    question: "Apakah ada garansi untuk setiap pengerjaan?",
    answer: "Ya, kami memberikan garansi lengkap untuk setiap pengerjaan dan material. Detail garansi akan dijelaskan saat konsultasi awal."
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer: "Kami menerima pembayaran via transfer bank dan tunai. Anda bisa melakukan pembayaran penuh, DP, atau cicilan sesuai kesepakatan."
  },
  {
    question: "Bagaimana jika saya ingin mengubah detail pesanan di tengah proyek?",
    answer: "Untuk perubahan detail pesanan, harap segera hubungi tim kami melalui WhatsApp. Kami akan mengevaluasi kemungkinan perubahan dan dampaknya terhadap jadwal atau biaya."
  },
  {
    question: "Bagaimana cara memberikan review atau rating?",
    answer: "Setelah proyek Anda selesai dan statusnya 'Completed', Anda akan menemukan opsi untuk memberikan review dan rating di halaman detail pesanan Anda."
  },
  {
    question: "Di mana lokasi bengkel Abadi Jaya?",
    answer: "Anda bisa melihat lokasi lengkap kami dan mendapatkan petunjuk arah melalui halaman 'Kontak' di menu utama website."
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      <button
        className="flex justify-between items-center w-full px-6 py-4 text-left text-lg font-semibold text-gray-800 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <svg
          className={`w-6 h-6 text-gray-600 transform ${isOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 pt-2 text-gray-700 leading-relaxed border-t border-gray-100 animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
};

export default function FaqSection() {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">FAQ & Bantuan</h1>
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
      <div className="mt-8 text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
        <h3 className="text-xl font-semibold text-orange-800 mb-3">Tidak menemukan jawaban Anda?</h3>
        <p className="text-orange-700 mb-4">
          Jangan ragu untuk menghubungi tim dukungan kami.
        </p>
        <button
          className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors shadow-md cursor-pointer"
          onClick={() => window.open('https://wa.me/6289653754317?text=Halo! Saya ingin bertanya tentang layanan Anda.', '_blank')}
        >
          Hubungi via WhatsApp
        </button>
      </div>
    </div>
  );
}