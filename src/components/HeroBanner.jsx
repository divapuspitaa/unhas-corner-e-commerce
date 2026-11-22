"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const BANNERS = [
  {
    src: "/images/banners/banner-1-maskot.png",
    alt: "Semangat Ayam Jantan dari Timur ada di setiap koleksimu",
    href: "/produk",
  },
  {
    src: "/images/banners/banner-2-stiker.png",
    alt: "Unhasku bersatu, Unhasku kuat",
    href: "/toko",
  },
  {
    src: "/images/banners/banner-3-logo-unhas.png",
    alt: "Bangga jadi bagian dari Universitas Hasanuddin",
    href: "/produk",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section
      aria-label="Banner Promo UnhasCorner"
      className="group relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Frame utama banner */}
      <div className="overflow-hidden rounded-2xl border border-line bg-primary shadow-sm">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {BANNERS.map((banner, index) => (
            <Link
              key={banner.src}
              href={banner.href}
              className="block w-full shrink-0"
              aria-label={banner.alt}
            >
              <img
                src={banner.src}
                alt={banner.alt}
                loading={index === 0 ? "eager" : "lazy"}
                className="block h-auto w-full object-cover"
              />
            </Link>
          ))}
        </div>

        {/* Indikator titik di pojok kiri bawah */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
          {BANNERS.map((banner, index) => (
            <button
              key={banner.src}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Tampilkan banner ${index + 1}`}
              className={`h-2 rounded-full transition-all ${
                current === index
                  ? "w-5 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tombol panah kiri */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Banner sebelumnya"
        className="absolute top-1/2 left-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-md transition hover:bg-white md:-left-4 md:h-10 md:w-10"
      >
        <LuChevronLeft size={20} />
      </button>

      {/* Tombol panah kanan */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Banner berikutnya"
        className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-md transition hover:bg-white md:-right-4 md:h-10 md:w-10"
      >
        <LuChevronRight size={20} />
      </button>
    </section>
  );
}