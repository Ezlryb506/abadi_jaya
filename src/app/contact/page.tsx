'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-orange-50 to-white py-16 px-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Kontainer Form */}
        <div className="flex-1 bg-white rounded-xl shadow-xl p-8 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-orange-600 mb-4 text-center">Kontak Bengkel Las Abadi Jaya</h1>
          <p className="text-gray-600 mb-8 text-center">
            Silakan hubungi kami untuk konsultasi, pemesanan, atau pertanyaan lainnya.
          </p>
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📞</span>
              <a
                href="https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline font-semibold"
              >
                0896-5375-4317 (WhatsApp)
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✉️</span>
              <a href="mailto:info@abadi-jaya.com"
                className="text-orange-600 hover:underline font-semibold">
                info@abadi-jaya.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <a className="text-orange-600 font-semibold">
                Jl. Bosih Raya, Cibitung, Wanasari, Gang Bunga, RT/RW 005/013, No 4
             </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🕒</span>
              <a className="text-orange-600 font-semibold">
                Senin - Sabtu: 08:00 - 17:00
              </a>
            </div>
          </div>

          {/* Form Kontak */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">Form Kontak</h2>
            {submitted ? (
              <div className="bg-green-100 text-green-700 p-4 rounded-lg text-center">
                Terima kasih! Pesan Anda sudah terkirim.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nama Anda"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-orange-400"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Anda"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-orange-400"
                />
                <label htmlFor="message" className="block text-gray-700 font-medium">Pesan</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Pesan Anda"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-orange-400"
                />
                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Kirim Pesan
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Kontainer Google Maps */}
        <div className="flex-1 bg-white rounded-xl shadow-xl p-0 flex flex-col justify-center overflow-hidden min-h-[500px]">
          <iframe
            title="Lokasi Bengkel Las Abadi Jaya"
            src="https://www.google.com/maps?q=-6.254683, 107.085045&z=15&output=embed"
            width="100%"
            height="100%"
            className="w-full h-full min-h-[350px] md:min-h-[500px] rounded-xl border-0"
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
