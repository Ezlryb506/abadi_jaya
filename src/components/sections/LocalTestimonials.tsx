import React from 'react';
import Card from '@/components/ui/Card';

interface Testimonial {
  name: string;
  location: string;
  project: string;
  rating: number;
  comment: string;
  image?: string;
}

interface LocalTestimonialsProps {
  area: string;
  testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
  {
    name: 'Budi Santoso',
    location: 'Cikarang',
    project: 'Pagar Besi Minimalis',
    rating: 5,
    comment: 'Hasil pengerjaan sangat memuaskan, tim profesional dan harga bersaing. Pagar yang dibuat sesuai dengan desain yang diminta.',
    image: '/images/testimoni/budi-santoso.jpg'
  },
  {
    name: 'Sari Dewi',
    location: 'Tambun',
    project: 'Kanopi Carport',
    rating: 5,
    comment: 'Pelayanan survey gratis sangat membantu, estimasi harga akurat dan pengerjaan tepat waktu. Sangat direkomendasikan!',
    image: '/images/testimoni/sari-dewi.jpg'
  },
  {
    name: 'Ahmad Rizki',
    location: 'Cibitung',
    project: 'Railing Tangga Stainless',
    rating: 5,
    comment: 'Kualitas material dan finishing sangat bagus. Tim teknis sangat berpengalaman dan memberikan saran yang tepat.',
    image: '/images/testimoni/ahmad-rizki.jpg'
  }
];

export default function LocalTestimonials({ area, testimonials = defaultTestimonials }: LocalTestimonialsProps) {
  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Testimoni Pelanggan di {area}
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center text-orange-800 font-bold text-lg">
                {testimonial.name.charAt(0)}
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                <p className="text-sm text-gray-600">{testimonial.location}</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex text-yellow-400 mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </div>
              <p className="text-sm text-gray-600 font-medium">{testimonial.project}</p>
            </div>
                <p className="text-gray-700 text-sm italic">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
          </div>
        ))}
      </div>
      
    </Card>
  );
}
