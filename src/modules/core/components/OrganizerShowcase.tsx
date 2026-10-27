import React, { useEffect, useState } from 'react';
import { PhoneCall } from '@phosphor-icons/react';
import { useReducedMotion } from 'motion/react';

interface OrganizerSlide {
  name: string;
  shop: string;
  place: string;
  phone: string;
  photo: string;
  logo: string;
  accent: string;
}

const SLIDES: OrganizerSlide[] = [
  {
    name: 'Mansoor',
    shop: 'Sultan Sports',
    place: 'Kadapa',
    phone: '9110744945',
    photo: '/assets/organizer-mansoor.jpeg',
    logo: '/assets/sultan-sports-logo.png',
    accent: 'text-brand-yellow',
  },
  {
    name: 'Sunil',
    shop: 'NR Sports',
    place: 'Vempalli',
    phone: '8919155512',
    photo: '/assets/organizer-sunil.jpeg',
    logo: '/assets/nr-sports-logo.jpeg',
    accent: 'text-brand-lime',
  },
];

const CYCLE_MS = 10000;

export const OrganizerShowcase: React.FC = () => {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % SLIDES.length),
      CYCLE_MS
    );
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <section aria-label="Tournament organizers" className="relative overflow-hidden bg-brand-ink">
      <div
        className="flex h-[100dvh] min-h-[560px] w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((slide, slideIndex) => (
          <article
            key={slide.name}
            aria-hidden={slideIndex !== index}
            className="relative h-full w-full shrink-0"
          >
            <img
              src={slide.photo}
              alt={`${slide.name} — ${slide.shop}, ${slide.place}`}
              className="absolute inset-0 h-full w-full object-cover object-[50%_12%]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/50 to-transparent"
            />

            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2.5 px-4 pb-8 text-center sm:gap-3 sm:pb-12">
              <img
                src={slide.logo}
                alt={`${slide.shop} logo`}
                className="max-h-[34vh] w-[min(88vw,720px)] max-w-full object-contain mix-blend-screen"
              />
              <h3 className="font-display text-3xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] sm:text-5xl">
                {slide.name}
              </h3>
              <p
                className={`text-xs font-bold tracking-[0.26em] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] sm:text-sm ${slide.accent}`}
              >
                {slide.shop} · {slide.place}
              </p>
              <a
                href={`tel:${slide.phone}`}
                className="mt-1 inline-flex items-center gap-2 font-mono text-base font-bold text-white underline-offset-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] transition hover:text-brand-lime hover:underline sm:text-lg"
              >
                <PhoneCall size={16} weight="fill" />
                <span>{slide.phone}</span>
              </a>
            </div>
          </article>
        ))}
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-6 flex justify-center gap-2">
        {SLIDES.map((slide, slideIndex) => (
          <span
            key={slide.name}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              slideIndex === index ? 'w-8 bg-brand-lime' : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
