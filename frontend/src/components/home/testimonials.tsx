'use client';

import { Quote } from 'lucide-react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { RatingStars } from '@/components/product/rating-stars';
import 'swiper/css';

const testimonials = [
  {
    name: 'Marie Ngo',
    role: 'Graphic Designer, Douala',
    rating: 5,
    text: 'I bought my Dell XPS from Klass Computer and the service was flawless. Genuine product, fast delivery and they even helped me set it up.',
  },
  {
    name: 'Paul Kamdem',
    role: 'Software Developer, Yaoundé',
    rating: 5,
    text: 'The best prices I found anywhere in Cameroon for genuine hardware. My ThinkPad arrived in 48 hours with full warranty papers.',
  },
  {
    name: 'Sandrine Fotso',
    role: 'Business Owner, Bafoussam',
    rating: 4,
    text: 'Ordered 5 desktops for my cybercafé. Klass Computer gave me a great bulk discount and installed everything on site. Highly recommended!',
  },
  {
    name: 'Eric Mbarga',
    role: 'Gamer & Streamer',
    rating: 5,
    text: 'My ROG Strix runs everything I throw at it. The team really knows gaming hardware — they helped me pick the perfect specs for my budget.',
  },
];

export function Testimonials() {
  return (
    <section className="mt-16 bg-[#F5F5F5] py-14 dark:bg-[#141414]">
      <div className="container-klass">
        <h2 className="section-title text-center">What Our Customers Say</h2>
        <p className="mt-2 text-center text-sm text-[#555555] dark:text-[#999999]">
          Thousands of happy customers across Cameroon
        </p>
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4500 }}
          loop
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          className="mt-8"
        >
          {testimonials.map((t) => (
            <SwiperSlide key={t.name}>
              <div className="card-klass h-full p-6">
                <Quote className="h-6 w-6 text-brand dark:text-brand-light" />
                <p className="mt-3 min-h-[96px] text-sm leading-relaxed text-[#555555] dark:text-[#999999]">
                  “{t.text}”
                </p>
                <div className="mt-4 flex items-center gap-3 border-t border-[#F5F5F5] pt-4 dark:border-[#2A2A2A]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-[#999999]">{t.role}</p>
                  </div>
                  <div className="ml-auto">
                    <RatingStars rating={t.rating} />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
